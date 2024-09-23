import { createAction } from '@reduxjs/toolkit'

export enum Field {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
}

export enum SwapDelay {
  INIT = 'INIT', // The initial state of the swap cycle before a user interaction
  USER_INPUT = 'USER_INPUT', // Swap state when a user is inputing a trade
  USER_INPUT_COMPLETE = 'USER_INPUT_COMPLETE', // To let the app know when to start calculating swaps
  FETCHING_SWAP = 'FETCHING_SWAP', // To not calculate swaps on every keystroke
  SWAP_COMPLETE = 'SWAP_COMPLETE', // When the swap is ready to be displayed and fetch a bonus
  FETCHING_BONUS = 'FETCHING_BONUS', // Checks if the swap has a valid bous route
  SWAP_REFRESH = 'SWAP_REFRESH', // The last state that lets the app know to refresh routes to check for changes
}

export const selectCurrency = createAction<{ field: Field, currencyId: string }>('swap/selectCurrency')
export const switchCurrencies = createAction('swap/switchCurrencies')
export const typeInput = createAction<{ field: Field, typedValue: string }>('swap/typeInput')
export const setSwapDelay = createAction<{ swapDelay: SwapDelay }>('swap/swapDelay')
export const replaceSwapState = createAction<{
  field: Field
  typedValue: string
  inputCurrencyId?: string
  outputCurrencyId?: string
  recipient: string | null
  swapDelay: SwapDelay
  multiplier: number | null
}>('swap/replaceSwapState')
export const setRecipient = createAction<{ recipient: string | null }>('swap/setRecipient')
export const setMultiplier = createAction<{ multiplier: number | null }>('swap/setMultiplier')
