import {
  TransactionResponse,
  TransactionReceipt
} from '@ethersproject/providers'
import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useAddPopup } from '@/state/application/hooks'
import { AppDispatch, AppState } from '../store'
import { addTransaction, finalizeTransaction } from './actions'
import { TransactionDetails } from './reducer'
import { useWalletData } from '@/utils'

interface TransactionData {
  summary?: string
  approval?: { tokenAddress: string, spender: string }
  claim?: { recipient: string }
}

// helper that can take a ethers library transaction response and add it to the list of transactions
export function useTransactionAdder (): (
  response?: TransactionResponse,
  customData?: TransactionData,
  txHash?: string,
) => void {
  const { chainId, account } = useWalletData()
  const dispatch = useDispatch<AppDispatch>()

  return useCallback(
    (
      response?: TransactionResponse,
      {
        summary,
        approval,
        claim
      }: {
        summary?: string
        claim?: { recipient: string }
        approval?: { tokenAddress: string, spender: string }
      } = {},
      txHash?: string
    ) => {
      if (account !== undefined || chainId !== undefined) return
      const hash = response != null ? response.hash : txHash
      if (hash === undefined) throw new Error('No transaction hash found.')
      new Promise<void>((resolve, reject) => {
        try {
          dispatch(
            addTransaction({
              hash,
              from: account,
              chainId,
              approval,
              summary,
              claim
            })
          )
          resolve()
        } catch (error) {
          reject(error)
        }
      }).catch(error => {
        // Handle errors here, for example, log them or display a notification
        console.error('Error handling transaction:', error)
      })
    },
    [account, chainId, dispatch]
  )
}

export function useTransactionFinalizer (): (
  receipt: TransactionReceipt,
  customData?: {
    summary?: string
    approval?: { tokenAddress: string, spender: string }
    claim?: { recipient: string }
  },
) => void {
  const { chainId, account } = useWalletData()
  const addPopup = useAddPopup()
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(
    (
      receipt: TransactionReceipt,
      {
        summary
      }: {
        summary?: string
        claim?: { recipient: string }
        approval?: { tokenAddress: string, spender: string }
      } = {}
    ) => {
      if (!account) return // eslint-disable-line 
      if (!chainId) return // eslint-disable-line 

      const { transactionHash } = receipt
      if (!transactionHash) throw Error('No transaction hash found.') // eslint-disable-line 
      dispatch(
        finalizeTransaction({
          chainId,
          hash: transactionHash,
          receipt: {
            blockHash: receipt.blockHash,
            blockNumber: receipt.blockNumber,
            contractAddress: receipt.contractAddress,
            from: receipt.from,
            status: receipt.status,
            to: receipt.to,
            transactionHash: receipt.transactionHash,
            transactionIndex: receipt.transactionIndex
          }
        })
      )
      addPopup(
        {
          txn: {
            hash: transactionHash,
            success: receipt.status === 1,
            summary
          }
        },
        transactionHash
      )
    },
    [dispatch, chainId, account, addPopup]
  )
}

// returns all the transactions for the current chain
export function useAllTransactions (): { [txHash: string]: TransactionDetails } {
  const { chainId } = useWalletData()
  const state = useSelector<AppState, AppState['transaction']>(
    (state) => state.transaction
  )
  return chainId ? state[chainId] ?? {} : {} // eslint-disable-line
}

export function useIsTransactionPending (transactionHash?: string): boolean {
  const transactions = useAllTransactions()
  if (!transactionHash || !transactions[transactionHash]) return false // eslint-disable-line
  return transactions[transactionHash].receipt == null
}

/**
   * Returns whether a transaction happened in the last day (86400 seconds * 1000 milliseconds / second)
   * @param tx to check for recency
   */
export function isTransactionRecent (tx: TransactionDetails): boolean {
  return new Date().getTime() - tx.addedTime < 86_400_000
}

// returns whether a token has a pending approval transaction
export function useHasPendingApproval (
  tokenAddress: string | undefined,
  spender: string | undefined
): boolean {
  const allTransactions = useAllTransactions()
  return useMemo(
    () =>
      typeof tokenAddress === 'string' &&
        typeof spender === 'string' &&
        Object.keys(allTransactions).some((hash) => {
          const tx = allTransactions[hash]
          if (!tx) return false // eslint-disable-line
          if (tx.receipt != null) {
            return false
          } else {
            const approval = tx.approval
            if (approval == null) return false
            return (
              approval.spender === spender &&
              approval.tokenAddress === tokenAddress &&
              isTransactionRecent(tx)
            )
          }
        }),
    [allTransactions, spender, tokenAddress]
  )
}

// watch for submissions to claim
// return null if not done loading, return undefined if not found
export function useUserHasSubmittedClaim (
  account?: string
): { claimSubmitted: boolean, claimTxn: TransactionDetails | undefined } {
  const allTransactions = useAllTransactions()

  // get the txn if it has been submitted
  const claimTxn = useMemo(() => {
    const txnIndex = Object.keys(allTransactions).find((hash) => {
      const tx = allTransactions[hash]
      return (tx.claim != null) && tx.claim.recipient === account
    })
    return txnIndex && allTransactions[txnIndex] // eslint-disable-line
      ? allTransactions[txnIndex]
      : undefined
  }, [account, allTransactions])

  return { claimSubmitted: Boolean(claimTxn), claimTxn }
}

export function useLastTransactionHash (): string {
  const allTransactions = useAllTransactions()
  const sortedTransactions = Object.values(allTransactions)
    .sort((a, b) => b.addedTime - a.addedTime)
    .filter((tx) => tx.receipt)
  return sortedTransactions.length > 0 ? sortedTransactions[0].hash : ''
}

export const useSignTransaction = (): {
  signTransaction: (dataToSign: any, txInfo: TransactionData) => Promise<string | undefined>
} => {
  const { provider } = useWalletData()

  const addTransaction = useTransactionAdder()

  const signTransaction = async ({
    dataToSign,
    txInfo
  }: {
    dataToSign: any
    txInfo: TransactionData
  }): Promise<string | undefined> => {
    const tx = await provider?.getSigner().sendTransaction(dataToSign)
    if (tx) { // eslint-disable-line
      addTransaction(tx, txInfo)
    }
    return tx?.hash
  }
  return { signTransaction }
}
