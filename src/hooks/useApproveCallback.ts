import { TransactionResponse } from '@ethersproject/providers'
import {
  Trade,
  TokenAmount,
  CurrencyAmount,
  ETH,
  ChainId
} from '@monadex/sdk'
import { useCallback, useState, useMemo } from 'react'
import { useTokenAllowance } from './useTokenAllowance'
import { Field } from '@/state/swap/actions'
import {
  useTransactionAdder,
  useHasPendingApproval
} from '@/state/transactions/hooks'
import { computeSlippageAdjustedAmounts } from '@/utils/price'
import { calculateGasMargin, useWalletData } from '@/utils'

import { useTokenContract } from './useContracts'
import {
  ROUTER_ADDRESS
} from '@/constants/index'
import { useTokenBalance } from '@/state/wallet/hooks'

export enum ApprovalState {
  UNKNOWN,
  NOT_APPROVED,
  PENDING,
  APPROVED,
}

// returns a variable indicating the state of the approval and a function which approves if necessary or early returns
export function useApproveCallback (
  amountToApprove?: CurrencyAmount,
  spender?: string
): [ApprovalState, () => Promise<void>] {
  const [isApproved, setApproved] = useState(false)
  const { account, chainId } = useWalletData()
  const chainIdToUse = chainId ? chainId : ChainId.SEPOLIA // eslint-disable-line
  const nativeCurrency = ETH
  const token = amountToApprove instanceof TokenAmount ? amountToApprove.token : undefined // a verified
  const currentAllowance = useTokenAllowance(
    token,
    account ?? undefined,
    spender
  )
  const pendingApproval = useHasPendingApproval(token?.address, spender)
  const tokenBalance = useTokenBalance(account, token)
  // check the current approval status
  const approvalState: ApprovalState = useMemo(() => {
    if ((amountToApprove == null) || !spender) return ApprovalState.UNKNOWN // eslint-disable-line
    if (amountToApprove.currency === nativeCurrency) return ApprovalState.APPROVED
    // we might not have enough data to know whether or not we need to approve
    if (currentAllowance == null) return ApprovalState.UNKNOWN

    if (isApproved) return ApprovalState.APPROVED

    // amountToApprove will be defined if currentAllowance is
    return currentAllowance.lessThan(amountToApprove)
      ? pendingApproval
        ? ApprovalState.PENDING
        : ApprovalState.NOT_APPROVED
      : ApprovalState.APPROVED
  }, [
    amountToApprove,
    currentAllowance,
    nativeCurrency,
    pendingApproval,
    spender,
    isApproved
  ])
  const tokenContract = useTokenContract(token?.address)
  const addTransaction = useTransactionAdder()

  const approve = useCallback(async (): Promise<void> => {
    if (approvalState !== ApprovalState.NOT_APPROVED) {
      console.error('approve was called unnecessarily')
      return
    }
    if (token == null) {
      console.error('no token')
      return
    }

    if (tokenContract == null) {
      console.error('tokenContract is null')
      return
    }

    if (amountToApprove == null) {
      console.error('missing amount to approve')
      return
    }

    if (spender === null) {
      console.error('no spender')
      return
    }

    const approveAmount =
      (tokenBalance != null) && tokenBalance.greaterThan(amountToApprove) // eslint-disable-line
        ? tokenBalance.raw.toString()
        : amountToApprove.raw.toString()

    let useExact = false
    const estimatedGas = await tokenContract.estimateGas
      .approve(spender, approveAmount)
      .catch(async () => {
        // general fallback for tokens who restrict approval amounts
        useExact = true
        return await tokenContract.estimateGas.approve(
          spender,
          amountToApprove.raw.toString()
        )
      })

    return tokenContract
      .approve(
        spender,
        useExact
          ? amountToApprove.raw.toString()
          : approveAmount,
        {
          gasLimit: calculateGasMargin(estimatedGas)
        }
      )
      .then(async (response: TransactionResponse) => {
        addTransaction(response, {
          summary: 'Approve ' + amountToApprove.currency.symbol, // eslint-disable-line
          approval: { tokenAddress: token.address, spender: spender as string }, // eslint-disable-line
        })
        try {
          await response.wait()
          setApproved(true)
        } catch (e) {
          setApproved(false)
          console.debug('Failed to approve token', e)
          throw e
        }
      })
      .catch((error: Error) => {
        console.debug('Failed to approve token', error)
        throw error
      })
  }, [
    approvalState,
    token,
    tokenContract,
    amountToApprove,
    spender,
    addTransaction,
    tokenBalance
  ])
  return [approvalState, approve]
}
// wraps useApproveCallback in the context of a swap
export function useApproveCallbackFromTrade (
  trade?: Trade,
  allowedSlippage = 0
): [ApprovalState, () => Promise<void>] {
  const { chainId } = useWalletData()
  const amountToApprove = useMemo(
    () =>
      (trade != null)
        ? computeSlippageAdjustedAmounts(trade, allowedSlippage)[Field.INPUT]
        : undefined,
    [trade, allowedSlippage]
  )

  return useApproveCallback(
    amountToApprove,
    chainId ? ROUTER_ADDRESS : undefined // eslint-disable-line
  )
}
