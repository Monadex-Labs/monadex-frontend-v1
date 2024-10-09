import { createReducer } from '@reduxjs/toolkit'
import {
  Field,
  replaceSwapState,
  setSwapDelay,
  typeInput,
  selectCurrency,
  switchCurrencies,
  setRecipient,
  SwapDelay,
  setMultiplier,
  setMinimumTickets
} from './actions'

export interface SwapState {
  readonly independentField: Field
  readonly typedValue: string
  readonly [Field.INPUT]: {
    readonly currencyId?: string | undefined
  }
  readonly [Field.OUTPUT]: {
    readonly currencyId?: string | undefined
  }
  readonly swapDelay: SwapDelay
  // the typed recipient address or ENS name, or null if swap should go to sender
  readonly recipient: string | null
  readonly multiplier: number | null
  readonly minimumTickets?: number
}

const initialState: SwapState = {
  independentField: Field.INPUT,
  typedValue: '',
  [Field.INPUT]: {
    currencyId: undefined
  },
  [Field.OUTPUT]: {
    currencyId: undefined
  },
  recipient: null,
  swapDelay: SwapDelay.INIT,
  multiplier: null,
  minimumTickets: undefined
}

export default createReducer<SwapState>(initialState, (builder) => {
  builder
    .addCase(replaceSwapState, (state, { payload: { typedValue, field, inputCurrencyId, outputCurrencyId, recipient, swapDelay, multiplier, minimumTickets } }) => {
      return {
        [Field.INPUT]: {
          currencyId: inputCurrencyId
        },
        [Field.OUTPUT]: {
          currencyId: outputCurrencyId
        },
        independentField: field,
        swapDelay,
        typedValue,
        recipient,
        multiplier,
        minimumTickets
      }
    })
    .addCase(selectCurrency, (state, { payload: { field, currencyId } }) => {
      const otherField = field === Field.INPUT ? Field.OUTPUT : Field.INPUT
      if (currencyId === state[otherField].currencyId) {
        return {
          ...state,
          independentField: state.independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT,
          [field]: { currencyId },
          [otherField]: { currencyId: state[field].currencyId }
        }
      } else {
        return {
          ...state,
          [field]: { currencyId }
        }
      }
    })
    .addCase(switchCurrencies, (state) => {
      return {
        ...state,
        [Field.INPUT]: { currencyId: state[Field.OUTPUT].currencyId },
        [Field.OUTPUT]: { currencyId: state[Field.INPUT].currencyId }
      }
    })
    .addCase(typeInput, (state, { payload: { field, typedValue } }) => {
      return {
        ...state,
        independentField: field,
        typedValue
      }
    })
    .addCase(setRecipient, (state, { payload: { recipient } }) => {
      state.recipient = recipient
    })
    .addCase(setSwapDelay, (state, { payload: { swapDelay } }) => {
      state.swapDelay = swapDelay
    })
    .addCase(setMultiplier, (state, { payload: { multiplier } }) => {
      state.multiplier = multiplier
    })
    .addCase(setMinimumTickets, (state, { payload: { minimumTickets } }) => {
      state.minimumTickets = minimumTickets
    })
})
