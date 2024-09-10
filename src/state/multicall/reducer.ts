import { createReducer } from '@reduxjs/toolkit'
import { ChainId } from '@monadex/sdk'
import {
  addMulticallListeners,
  errorFetchingMulticallResults,
  fetchingMulticallResults,
  addListenerOptions,
  removeMulticallListeners,
  toCallKey,
  updateMulticallResults
} from './actions'

export interface MulticallState {
  callListeners?: {
    // on a per-chain basis
    [chainId: number]: {
      // stores for each call key the listeners' preferences
      [callKey: string]: {
        // stores how many listeners there are per each blocks per fetch preference
        [blocksPerFetch: number]: number
      }
    }
  }

  callResults: {
    [chainId: number]: {
      [callKey: string]: {
        data?: string | null
        blockNumber?: number
        fetchingBlockNumber?: number
      }
    }
  }
  listenerOptions: {
    [chainId: number]: {
      blocksPerFetch: number
    }
  }
}

const initialState: MulticallState = {
  callResults: {},
  listenerOptions: {
    84532: {
      blocksPerFetch: 7
    }
  }
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(addMulticallListeners, (state, { payload: { calls, chainId, options: { blocksPerFetch = 1 } = {} } }) => {
      const listeners: MulticallState['callListeners'] = (state.callListeners != null)
        ? state.callListeners
        : (state.callListeners = {})
      listeners[chainId] = listeners[chainId] ?? {}
      const localBlocksPerFetch = state.listenerOptions[chainId].blocksPerFetch ?? 7
      calls.forEach((call) => {
        const callKey = toCallKey(call)
        listeners[chainId][callKey] = listeners[chainId][callKey] ?? {}
        listeners[chainId][callKey][localBlocksPerFetch] =
        (listeners[chainId][callKey][localBlocksPerFetch] ?? 0) + 1
      })
    })
    .addCase(
      addListenerOptions,
      (state, { payload: { chainId, blocksPerFetch = 4 } }) => {
        const options: MulticallState['listenerOptions'] = state.listenerOptions
          ? state.listenerOptions
          : (state.listenerOptions = {})
        options[chainId] = options[chainId] ?? {}
        options[chainId].blocksPerFetch = blocksPerFetch
      }
    )
    .addCase(
      removeMulticallListeners,
      (state, { payload: { chainId, calls, options: { blocksPerFetch = 1 } = {} } }) => {
        const listeners: MulticallState['callListeners'] = (state.callListeners != null)
          ? state.callListeners
          : (state.callListeners = {})

        if (listeners[chainId] === undefined) return
        calls.forEach((call) => {
          const callKey = toCallKey(call)
          if (listeners[chainId] === undefined) return
          if (listeners[chainId][callKey][blocksPerFetch] === undefined) return

          if (listeners[chainId][callKey][blocksPerFetch] === 1) {
            delete listeners[chainId][callKey][blocksPerFetch] // eslint-disable-line @typescript-eslint/no-dynamic-delete
          } else {
            listeners[chainId][callKey][blocksPerFetch]--
          }
        })
      }
    )
    .addCase(fetchingMulticallResults, (state, { payload: { chainId, fetchingBlockNumber, calls } }) => {
      state.callResults[chainId] = state.callResults[chainId] ?? {}
      calls.forEach((call) => {
        const callKey = toCallKey(call)
        const current = state.callResults[chainId][callKey]
        if (!current) {
          state.callResults[chainId][callKey] = {
            fetchingBlockNumber
          }
        } else {
          if ((current.fetchingBlockNumber ?? 0) >= fetchingBlockNumber) return
          state.callResults[chainId][callKey].fetchingBlockNumber = fetchingBlockNumber
        }
      })
    })
    .addCase(errorFetchingMulticallResults, (state, { payload: { fetchingBlockNumber, chainId, calls } }) => {
      state.callResults[chainId] = state.callResults[chainId] ?? {}
      calls.forEach((call) => {
        const callKey = toCallKey(call)
        const current = state.callResults[chainId][callKey]
        if (current === undefined) return // only should be dispatched if we are already fetching
        if (current.fetchingBlockNumber === fetchingBlockNumber) {
          delete current.fetchingBlockNumber
          current.data = null
          current.blockNumber = fetchingBlockNumber
        }
      })
    })
    .addCase(updateMulticallResults, (state, { payload: { chainId, results, blockNumber } }) => {
      state.callResults[chainId] = state.callResults[chainId] ?? {}
      Object.keys(results).forEach((callKey) => {
        const current = state.callResults[chainId][callKey]
        if ((current?.blockNumber ?? 0) > blockNumber) return
        state.callResults[chainId][callKey] = {
          data: results[callKey],
          blockNumber
        }
      })
    })
)
