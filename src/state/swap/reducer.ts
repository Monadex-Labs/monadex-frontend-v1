import { createReducer } from '@reduxjs/toolkit'
import {
  Field,
  replaceSwapState,
  setSwapDelay,
  typeInput,
  selectCurrency,
  switchCurrencies,
  setRecipient,
  purchasedTicketsOnSwap,
  RaffleState,
  SwapDelay
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
  readonly raffle: RaffleState
  readonly swapDelay: SwapDelay
  // the typed recipient address or ENS name, or null if swap should go to sender
  readonly recipient: string | null
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
  raffle: {
    ticketsPurchased: false,
    multiplier: 0,
    minimumTicketsToReceive: 0
  },
  recipient: null,
  swapDelay: SwapDelay.INIT
}

export default createReducer<SwapState>(initialState, (builder) => {
  builder
    .addCase(replaceSwapState, (state, { payload: { typedValue, field, inputCurrencyId, outputCurrencyId, recipient, raffle, swapDelay } }) => {
      return {
        [Field.INPUT]: {
          currencyId: inputCurrencyId
        },
        [Field.OUTPUT]: {
          currencyId: outputCurrencyId
        },
        independentField: field,
        raffle: {
          ticketsPurchased: raffle.ticketsPurchased,
          multiplier: raffle.multiplier,
          minimumTicketsToReceive: 0
        },
        swapDelay,
        typedValue,
        recipient
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

    .addCase(purchasedTicketsOnSwap, (state, { payload: { raffle } }) => {
      return {
        ...state,
        raffle: {
          ticketsPurchased: raffle.ticketsPurchased,
          multiplier: raffle.multiplier,
          minimumTicketsToReceive: 0
        }
      }
    })
})
