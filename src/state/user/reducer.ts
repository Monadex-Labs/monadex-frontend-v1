import { INITIAL_ALLOWED_SLIPPAGE, DEFAULT_DEADLINE_FROM_NOW } from '../../constants'
import { createReducer } from '@reduxjs/toolkit'
import { updateVersion } from '../global/actions'
import {
  addSerializedPair,
  addSerializedToken,
  removeSerializedPair,
  removeSerializedToken,
  SerializedPair,
  SerializedToken,
  updateUserSlippageTolerance,
  updateUserDeadline,
  toggleURLWarning,
  updateSlippageManuallySet
} from './actions'

const currentTimestamp = (): number => new Date().getTime()
export const SLIPPAGE_AUTO = 0
export interface UserState {
  // the timestamp of the last updateVersion action
  lastUpdateVersionTimestamp?: number

  // user defined slippage tolerance in bips, used in all txns
  userSlippageTolerance: number

  // deadline set by user in minutes, used in all txns
  userDeadline: number

  tokens: {
    [chainId: number]: {
      [address: string]: SerializedToken
    }
  }
  // by default the the slippage is set automatically, if user update slippage the value will be set to true
  slippageManuallySet: boolean
  pairs: {
    [chainId: number]: {
      // keyed by token0Address:token1Address
      [key: string]: SerializedPair
    }
  }

  timestamp: number
  URLWarningVisible: boolean
}

function pairKey (token0Address: string, token1Address: string): string {
  return `${token0Address};${token1Address}`
}

export const initialState: UserState = {
  userSlippageTolerance: INITIAL_ALLOWED_SLIPPAGE,
  userDeadline: DEFAULT_DEADLINE_FROM_NOW,
  tokens: {},
  slippageManuallySet: false,
  pairs: {},
  timestamp: currentTimestamp(),
  URLWarningVisible: true
}
export default createReducer<UserState>(initialState, builder =>
  builder
    .addCase(updateVersion, state => {
      // slippage isnt being tracked in local storage, reset to default
      // noinspection SuspiciousTypeOfGuard
      if (typeof state.userSlippageTolerance !== 'number') {
        state.userSlippageTolerance = INITIAL_ALLOWED_SLIPPAGE
      }

      // deadline isnt being tracked in local storage, reset to default
      // noinspection SuspiciousTypeOfGuard
      if (typeof state.userDeadline !== 'number') {
        state.userDeadline = DEFAULT_DEADLINE_FROM_NOW
      }

      state.lastUpdateVersionTimestamp = currentTimestamp()
    })
    .addCase(updateUserSlippageTolerance, (state, action) => {
      state.userSlippageTolerance = action.payload.userSlippageTolerance
      state.timestamp = currentTimestamp()
    })
    .addCase(updateSlippageManuallySet, (state, action) => {
      state.slippageManuallySet = action.payload.slippageManuallySet
    })
    .addCase(updateUserDeadline, (state, action) => {
      state.userDeadline = action.payload.userDeadline
      state.timestamp = currentTimestamp()
    })
    .addCase(addSerializedToken, (state, { payload: { serializedToken } }) => {
      state.tokens[serializedToken.chainId] = state.tokens[serializedToken.chainId] ?? {}
      state.tokens[serializedToken.chainId][serializedToken.address] = serializedToken
      state.timestamp = currentTimestamp()
    })
    .addCase(removeSerializedToken, (state, { payload: { address, chainId } }) => {
      state.tokens[chainId] = state.tokens[chainId] ?? {}
      delete state.tokens[chainId][address] // eslint-disable-line @typescript-eslint/no-dynamic-delete
      state.timestamp = currentTimestamp()
    })
    .addCase(addSerializedPair, (state, { payload: { serializedPair } }) => {
      if (
        serializedPair.token0.chainId === serializedPair.token1.chainId &&
        serializedPair.token0.address !== serializedPair.token1.address
      ) {
        const chainId = serializedPair.token0.chainId
        state.pairs[chainId] = state.pairs[chainId] ?? {}
        state.pairs[chainId][pairKey(serializedPair.token0.address, serializedPair.token1.address)] = serializedPair
      }
      state.timestamp = currentTimestamp()
    })
    .addCase(removeSerializedPair, (state, { payload: { chainId, tokenAAddress, tokenBAddress } }) => {
      if (state.pairs[chainId] !== undefined) {
        // just delete both keys if either exists
        delete state.pairs[chainId][pairKey(tokenAAddress, tokenBAddress)] // eslint-disable-line @typescript-eslint/no-dynamic-delete
        delete state.pairs[chainId][pairKey(tokenBAddress, tokenAAddress)] // eslint-disable-line @typescript-eslint/no-dynamic-delete
      }
      state.timestamp = currentTimestamp()
    })
    .addCase(toggleURLWarning, state => {
      state.URLWarningVisible = !state.URLWarningVisible
    })
)
