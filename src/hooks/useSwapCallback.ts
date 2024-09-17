import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { TransactionResponse } from '@ethersproject/providers'
import { JSBI, Percent, Router, SwapParameters, Trade, TradeType } from '@monadex/sdk'
import { useMemo } from 'react'
import { useTransactionAdder } from '@/state/transactions/hooks'
import { BIPS_BASE, INITIAL_ALLOWED_SLIPPAGE, GlobalData } from '../constants'
import { calculateGasMargin, shortenAddress, isAddress } from '../utils'
import isZero from '../utils/isZero'
import useTransactionDeadline from './useTransactionDeadline'
import { useRouterContract } from './useContracts'
import { purchasedTicketsOnSwap } from '@/state/swap/actions'
import { useSelector } from 'react-redux'
import { useWalletData } from '../utils/index'
import { checksumAddress } from 'viem'
export enum SwapCallbackState {
  INVALID,
  LOADING,
  VALID,
}

enum version {
  v1 = 'v1',
  v2 = 'v2'
}
const tradeVersion = version.v2
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
  const recipientAddress = isAddress(recipientAddressOrName)
  const { account: address, chainId, provider: wallet } = useWalletData()
  const checksumAddress = isAddress(address)

  const recipient = recipientAddressOrName === null ? checksumAddress : recipientAddress
  const deadline = useTransactionDeadline()
  const contract = useRouterContract() as Contract

  return useMemo(() => {
    // checking
    if (!trade || !recipient || !wallet  || !chainId || !deadline ) return [] // eslint-disable-line
    if (!contract) return []
    //  Trade type always equal ot 1
    const swapMethods = [] as any[]
    switch (tradeVersion) {
      case version.v2 :
        swapMethods.push(
          Router.swapCallParameters(trade, {
            feeOnTransfer: false,
            allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
            recipient,
            ttl:
            deadline
              ? deadline.toNumber()
              : GlobalData.utils.DEFAULT_DEADLINE_FROM_NOW
          }, {
            // fake data to test before creation of the raffle component
            purchaseTickets: Boolean(false),
            multiplier : 0,
            minimumTicketsToReceive: 0
        })
        )
        if (trade.tradeType === TradeType.EXACT_INPUT) {
          swapMethods.push(
            Router.swapCallParameters(trade,
              {
                feeOnTransfer: false,
                allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
                recipient,
                ttl:
                deadline
                  ? deadline.toNumber()
                  : GlobalData.utils.DEFAULT_DEADLINE_FROM_NOW
              }, {
              // fake data to test before creation of the raffle component
              purchaseTickets: Boolean(false),
              multiplier : 0,
              minimumTicketsToReceive: 0
              }
            )
          )
        }
        break
    }
    // check if address is WL for raffles
    return swapMethods.map((parameters) => ({ parameters, contract }))
  }, [address, allowedSlippage, chainId, deadline, wallet, recipient, trade, contract])
}

// returns a function that will execute a swap, if the parameters are all valid
// and the user has approved the slippage adjusted input amount for the trade
export function useSwapCallback (
  trade: Trade | undefined, // trade to execute, required
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
  recipientAddressOrName: string | null // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
): { state: SwapCallbackState, callback: null | (() => Promise<{ response: TransactionResponse, summary: string }>), error: string | null } {
  const { account: address, chainId, provider: library } = useWalletData()
  const swapCalls = useSwapCallArguments(trade, allowedSlippage, recipientAddressOrName)
  const addTransaction = useTransactionAdder()
  const recipient = recipientAddressOrName ?? address
  return useMemo(() => {
    if (!trade || !address || !chainId) { // eslint-disable-line
      return { state: SwapCallbackState.INVALID, callback: null, error: 'Missing dependencies' }
    }
    if (!recipient) { // eslint-disable-line
      if (recipientAddressOrName != null) {
        return { state: SwapCallbackState.INVALID, callback: null, error: 'Invalid recipient' }
      } else {
        return { state: SwapCallbackState.LOADING, callback: null, error: null }
      }
    }
    // core swap sm calls here
    return {
      state: SwapCallbackState.VALID,
      callback: async function onSwap (): Promise<{ response: TransactionResponse, summary: string }> {
        const estimatedCalls: EstimatedSwapCall[] = await Promise.all(
          swapCalls.map(async (call: SwapCall) => {
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
              summary: withRecipient,
            
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
              throw new Error(`Swap failed: ${error.reason}`) // eslint-disable-line
            }
          })
      },
      error: null
    }
  }, [trade, address, chainId, recipient, recipientAddressOrName, swapCalls, library, addTransaction])
}
