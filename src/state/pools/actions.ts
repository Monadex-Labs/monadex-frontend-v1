// import { createAction } from '@reduxjs/toolkit'

// // UPDATE THE PAIR_LIST EVERY BLOCK TIMESTAMP 
// // PASS THE UPDATED PAIR_LIST TO ALWAYS HAVE A REALTIME LIST 

// export const pairList = createAction<{
// skipCount : number
// }>('pool/pairList')

// export const bulkPairs = createAction<{
//     allPairs : string[]
// }>('pool/bulkPairs')

// export const pairData = createAction<{
//     pairAddress : string
//     block: number | undefined
// }>('pool/pairData')

// export const pairsHistoricalBulk = createAction<{
//     allPairs: string[]
//     block: number | undefined
// }>('pool/pairHistoricalBulk')

import { createAction } from '@reduxjs/toolkit'

export const setPairList = createAction<string[]>('pool/setPairList')
export const setBulkPairsData = createAction<any[]>('pool/setBulkPairsData')
export const setSkipCount = createAction<number>('pool/setSkipCount')
export const setBlock = createAction<number>('pool/setBlock')
export const setPairData = createAction<any[]>('pool/setPairData')