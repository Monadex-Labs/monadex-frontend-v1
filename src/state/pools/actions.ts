
import { createAction } from '@reduxjs/toolkit'

export const setPairList = createAction<string[]>('pool/setPairList')
export const setBulkPairsData = createAction<any[]>('pool/setBulkPairsData')
export const setSkipCount = createAction<number>('pool/setSkipCount')
export const setBlock = createAction<number>('pool/setBlock')
export const setPairData = createAction<any[]>('pool/setPairData')