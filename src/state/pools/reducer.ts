import { createReducer } from '@reduxjs/toolkit'
import { setPairList, setBulkPairsData, setBlock, SetDailyPairData, SearchState, setSearch, PairData } from './actions'

export interface PoolState {
  allPairs: string[]
  bulkPairsData: PairData[]
  block: number | null
  DailyPairData: PairData[]
}

export const initialState: PoolState & SearchState = {
  allPairs: [],
  bulkPairsData: [],
  block: null,
  DailyPairData: [],
  searchPool: ''
}

export default createReducer<PoolState & SearchState >(initialState, (builder) => {
  builder
    .addCase(setPairList, (state, action) => {
      state.allPairs = action.payload
    })
    .addCase(setBulkPairsData, (state, action) => {
      state.bulkPairsData = action.payload
    })
    .addCase(setBlock, (state, action) => {
      state.block = action.payload
    })
    .addCase(SetDailyPairData, (state, action) => {
        state.DailyPairData = action.payload
      })
    .addCase(setSearch, (state, {payload: {searchPool} }) => {
        state.searchPool = searchPool
    })
})