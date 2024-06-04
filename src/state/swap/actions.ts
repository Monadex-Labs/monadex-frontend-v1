import { createAction } from '@reduxjs/toolkit'

export enum Field {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
}

// RaffleState : manage ticket Purchase during a swap
export interface RaffleState {
  ticketsPurchased: boolean
  multiplier?: number | null
}

export const selectCurrency = createAction<{ field: Field, currencyId: string }>('swap/selectCurrency')
export const switchCurrencies = createAction<any>('swap/switchCurrencies')
export const typeInput = createAction<{ field: Field, typedValue: string }>('swap/typeInput')
export const purchasedTicketsOnSwap = createAction<{ field: Field, raffle: RaffleState }>('swap/purchasedTicketsOnSwap')
export const replaceSwapState = createAction<{
  field: Field
  typedValue: string
  inputCurrencyId?: string
  outputCurrencyId?: string
  recipient: string | null
  raffle: RaffleState
}>('swap/replaceSwapState')
export const setRecipient = createAction<{ recipient: string | null }>('swap/setRecipient')
