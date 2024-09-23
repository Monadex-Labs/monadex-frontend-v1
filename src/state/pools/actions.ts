
import { createAction } from '@reduxjs/toolkit'

// TokenData interface
interface TokenData {
  __typename: string
  id: string
  symbol: string
  name: string
  totalLiquidity: string
  derivedETH: string
}

// PairData interface
export interface PairData {
  __typename: string
  id: string
  txCount: string
  token0: TokenData
  token1: TokenData
  reserve0: string
  reserve1: string
  reserveUSD: string
  totalSupply: string
  trackedReserveETH: string
  reserveETH: string
  volumeUSD: string
  untrackedVolumeUSD: string
  token0Price: string
  token1Price: string
  createdAtTimestamp: string
}

export interface SearchState {
  searchPool: string
}

export const setPairList = createAction<string[]>('pool/setPairList')
export const setBulkPairsData = createAction<any[]>('pool/setBulkPairsData')
export const setBlock = createAction<number>('pool/setBlock')
export const SetDailyPairData = createAction<any[]>('pool/setPairData')

// search state
export const setSearch = createAction<SearchState>('pool/search')
