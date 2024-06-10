import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { TransactionResponse, Web3Provider } from '@ethersproject/providers'
import { ChainId, JSBI, Percent, Router, SwapParameters, Trade, TradeType } from '@monadex/sdk'
import { ethers } from 'ethers'
import { useMemo } from 'react'
import { useTransactionAdder } from '@/state/transactions/hooks'
import { BIPS_BASE, INITIAL_ALLOWED_SLIPPAGE } from '../constants'
import { calculateGasMargin, shortenAddress, isAddress } from '../utils'
import isZero from '../utils/isZero'
import useTransactionDeadline from './useTransactionDeadline'
import { useWallets } from '@web3-onboard/react'
import { useRouterContract } from './useContracts'
import { purchasedTicketsOnSwap } from '@/state/swap/actions'
import { useSelector } from 'react-redux'

export enum SwapCallbackState {
  INVALID,
  LOADING,
  VALID,
}

export interface SwapCall {
  contract: Contract
  parameters: SwapParameters
}

interface SuccessfulCall {
  call: SwapCall
  gasEstimate: BigNumber
}

interface FailedCall {
  call: SwapCall
  error: Error
}

type EstimatedSwapCall = SuccessfulCall | FailedCall

/**
 * Returns the swap calls that can be used to make the trade
 * @param trade trade to execute
 * @param allowedSlippage user allowed slippage
 * @param recipientAddressOrName
 */
export function useSwapCallArguments (
  trade: Trade | undefined, // trade to execute, required
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
  recipientAddressOrName: string | null // address of the recipient of the trade, or null if swap should be returned to sender
): SwapCall[] {
  const account = useWallets()
  const chainId = Number(account[0].chains[0].id) as ChainId
  const address = account[0].accounts[0].address
  const recipient = recipientAddressOrName === null && address
  const wallet = account[0].provider
  const deadline = useTransactionDeadline()
  const contract = useRouterContract() as Contract
  const ticketsState = useMemo(() => {
    return useSelector(purchasedTicketsOnSwap)
  }, [])
  const library = account.length > 0
    ? new ethers.providers.Web3Provider(wallet as any, 'any')
    : undefined

  return useMemo(() => {
    // checking
    if ((trade == null) || !recipient || !library || !account || !chainId || (deadline == null)) return [] // eslint-disable-line
    if (contract === undefined) return []
    const swapMethods = [] as any[]

    const swapCallParameters =
      Router.swapCallParameters(trade, {
        feeOnTransfer: false,
        allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
        recipient,
        deadline: deadline.toNumber()
      }, {
        purchaseTickets: ticketsState.payload.raffle.ticketsPurchased as boolean,
        multiplier: ticketsState.payload.raffle.multiplier as number
      })
    const swapCallParametersOnInput = Router.swapCallParameters(trade, {
      feeOnTransfer: true,
      allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
      recipient,
      deadline: deadline.toNumber()
    },
    {
      purchaseTickets: ticketsState.payload.raffle.ticketsPurchased as boolean,
      multiplier: ticketsState.payload.raffle.multiplier as number
    })

    if (trade.tradeType === TradeType.EXACT_INPUT) {
      swapMethods.push(swapCallParametersOnInput)
    } else {
      swapMethods.push(swapCallParameters)
    }
    return swapMethods.map((parameters) => ({ parameters, contract }))
  }, [account, allowedSlippage, chainId, deadline, library, recipient, trade, contract, ticketsState])
}

// returns a function that will execute a swap, if the parameters are all valid
// and the user has approved the slippage adjusted input amount for the trade
export function useSwapCallback (
  trade: Trade | undefined, // trade to execute, required
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
  recipientAddressOrName: string | null // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
): { state: SwapCallbackState, callback: null | (() => Promise<{ response: TransactionResponse, summary: string }>), error: string | null } {
  const account = useWallets()
  const chainId = Number(account[0].chains[0].id) as ChainId
  const address = account[0].accounts[0].address

  const swapCalls = useSwapCallArguments(trade, allowedSlippage, recipientAddressOrName)
  const addTransaction = useTransactionAdder()
  const recipient = recipientAddressOrName === null && address
  const provider = account[0].provider
  // const contract = useRouterContract() as Contract
  const library: Web3Provider | undefined = account.length > 0
    ? new ethers.providers.Web3Provider(provider as any, 'any')
    : undefined

  return useMemo(() => {
    if (!trade || !address || !chainId) { // eslint-disable-line
      return { state: SwapCallbackState.INVALID, callback: null, error: 'Missing dependencies' }
    }
    if (!recipient) { // eslint-disable-line
      if (recipientAddressOrName !== null) {
        return { state: SwapCallbackState.INVALID, callback: null, error: 'Invalid recipient' }
      } else {
        return { state: SwapCallbackState.LOADING, callback: null, error: null }
      }
    }

    return {
      state: SwapCallbackState.VALID,
      callback: async function onSwap (): Promise<{ response: TransactionResponse, summary: string }> {
        const estimatedCalls: EstimatedSwapCall[] = await Promise.all(
          swapCalls.map(async (call) => {
            const {
              parameters: {
                methodName,
                args,
                value
              },
              contract
            } = call
            const options = !value || isZero(value) ? {} : { value } // eslint-disable-line

            return await contract.estimateGas[methodName](...args, options)
              .then((gasEstimate) => {
                return {
                  call,
                  gasEstimate
                }
              })
              .catch(async (gasError) => {
                console.debug('Gas estimate failed, trying eth_call to extract error', call)

                return await contract.callStatic[methodName](...args, options)
                  .then((result) => {
                    console.debug('Unexpected successful call after failed estimate gas', call, gasError, result)
                    return { call, error: new Error('Unexpected issue with estimating the gas. Please try again.') }
                  })
                  .catch((callError) => {
                    console.debug('Call threw error', call, callError)
                    let errorMessage: string
                    switch (callError.reason) {
                      case 'MonadexV1Router: INSUFFICIENT_OUTPUT_AMOUNT':
                      case 'MonadexV1Router: EXCESSIVE_INPUT_AMOUNT':
                        errorMessage =
                          'This transaction will not succeed either due to price movement or fee on transfer. Try increasing your slippage tolerance.'
                        break
                      default:
                        errorMessage = `The transaction cannot succeed due to error: ${callError.reason}. This is probably an issue with one of the tokens you are swapping.` // eslint-disable-line
                    }
                    return { call, error: new Error(errorMessage) }
                  })
              })
          })
        )

        // a successful estimation is a bignumber gas estimate and the next call is also a bignumber gas estimate
        const successfulEstimation = estimatedCalls.find(
          (el): el is SuccessfulCall => 'gasEstimate' in el
        )

        if (successfulEstimation == null) {
          const errorCalls = estimatedCalls.filter((call): call is FailedCall => 'error' in call)
          if (errorCalls.length > 0) throw errorCalls[errorCalls.length - 1].error
          throw new Error('Unexpected error. Please contact support: none of the calls threw an error')
        }

        const {
          call: {
            contract,
            parameters: {
              methodName, args, value
            }
          },
          gasEstimate
        } = successfulEstimation

        return contract[methodName](...args, {
          gasLimit: calculateGasMargin(gasEstimate)
        })
          .then((response: TransactionResponse) => {
            const inputSymbol = trade.inputAmount.currency.symbol
            const outputSymbol = trade.outputAmount.currency.symbol
            const inputAmount = trade.inputAmount.toSignificant(2)
            const outputAmount = trade.outputAmount.toSignificant(3)

            const base = `Swap ${inputAmount} ${inputSymbol as string} for ${outputAmount} ${outputSymbol as string}`
            const withRecipient =
              recipient === address
                ? base
                : `${base} to ${
                  recipientAddressOrName && isAddress(recipientAddressOrName) // eslint-disable-line
                  ? shortenAddress(recipientAddressOrName)
                  : recipientAddressOrName
                  }`
            addTransaction(response, {
              summary: withRecipient
            })

            return { response, summary: withRecipient }
          })
          .catch((error: any) => {
            // if the user rejected the tx, pass this along
            if (error?.code === 4001) {
              throw new Error('Transaction rejected.')
            } else {
              // otherwise, the error was unexpected and we need to convey that
              console.error('Swap failed', error, methodName, args, value)
              throw new Error(`Swap failed: ${error.message}`) // eslint-disable-line
            }
          })
      },
      error: null
    }
  }, [trade, account, chainId, recipient, recipientAddressOrName, swapCalls, library, addTransaction])
}
