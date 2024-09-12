import { createReducer } from '@reduxjs/toolkit'
import {
  addTransaction,
  checkedTransaction,
  clearAllTransactions,
  finalizeTransaction,
  SerializableTransactionReceipt
} from './actions'

const now = () => new Date().getTime()

export interface TransactionDetails {
  hash: string
  approval?: { tokenAddress: string, spender: string }
  summary?: string
  claim?: { recipient: string }
  receipt?: SerializableTransactionReceipt
  lastCheckedBlockNumber?: number
  addedTime: number
  confirmedTime?: number
  from: string
  ticketsPurchased?: number
}

export interface TransactionState {
  [chainId: number]: {
    [txHash: string]: TransactionDetails
  }
}

export const initialState: TransactionState = {}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(
      addTransaction,
      (
        transactions,
        { payload: { chainId, from, hash, approval, summary, claim } }
      ) => {
        if (transactions[chainId]?.[hash] !== undefined) {
          throw Error('Attempted to add existing transaction.')
        }
        const txs = transactions[chainId] ?? {}
        txs[hash] = { hash, approval, summary, claim, from, addedTime: now() }
        transactions[chainId] = txs
      }
    )
    .addCase(clearAllTransactions, (transactions, { payload: { chainId } }) => {
      if (transactions[chainId] === undefined) return
      transactions[chainId] = {}
    })
    .addCase(
      checkedTransaction,
      (transactions, { payload: { chainId, hash, blockNumber } }) => {
        const tx = transactions[chainId]?.[hash]
        if (tx === undefined) {
          return
        }
        if (tx.lastCheckedBlockNumber === undefined) {
          tx.lastCheckedBlockNumber = blockNumber
        } else {
          tx.lastCheckedBlockNumber = Math.max(
            blockNumber,
            tx.lastCheckedBlockNumber
          )
        }
      }
    )
    .addCase(
      finalizeTransaction,
      (transactions, { payload: { hash, chainId, receipt } }) => {
        console.log('receipt HEHEHEHE', receipt)
        const tx = transactions[chainId]?.[hash]
        if (tx === undefined) {
          return
        }
        if (receipt !== 'failed') {
          // unckecked for now
          tx.ticketsPurchased = receipt.ticketsPurchased
          tx.receipt = receipt
        }
        console.log('receipt', tx.confirmedTime = now())
        tx.confirmedTime = now()
      }
    )
)
