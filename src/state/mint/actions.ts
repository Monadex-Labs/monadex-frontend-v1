import { createAction } from '@reduxjs/toolkit'
export interface IFeeTier {
  id: string
  text: string
  description: string
}
export enum Field {
  CURRENCY_A = 'CURRENCY_A',
  CURRENCY_B = 'CURRENCY_B',
}

export const typeInput = createAction<{
  field: Field
  typedValue: string
  noLiquidity: boolean
}>('mint/typeInputMint')
export const selectCurrency = createAction<{
  field: Field
  currencyId: string
}>('mint/selectCurrency')
export const resetMintState = createAction('mint/resetMintState')
export const updateFeeTier = createAction<{
  feeTier: IFeeTier
}>('mint/setFeeTier')
