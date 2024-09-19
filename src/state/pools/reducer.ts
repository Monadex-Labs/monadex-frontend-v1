import { createReducer } from '@reduxjs/toolkit'
import { setPairList, setBulkPairsData, setSkipCount, setBlock, setPairData } from './actions'

export interface PoolState {
  skipCount: number
  allPairs: string[]
  bulkPairsData: any[]
  block: number | undefined
  pairData : any[]
}

export const initialState: PoolState = {
  skipCount: 0,
  allPairs: [],
  bulkPairsData: [],
  block: undefined,
  pairData : []
}

export default createReducer<PoolState>(initialState, (builder) => {
  builder
    .addCase(setPairList, (state, action) => {
      state.allPairs = action.payload
    })
    .addCase(setBulkPairsData, (state, action) => {
      state.bulkPairsData = action.payload
    })
    .addCase(setSkipCount, (state, action) => {
      state.skipCount = action.payload
    })
    .addCase(setBlock, (state, action) => {
      state.block = action.payload
    })
    .addCase(setPairData, (state, action) => {
        state.pairData = action.payload
      })
})