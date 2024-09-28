import { useEffect, useCallback, useState, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setBlock, setPairList, setBulkPairsData, PairData, SetDailyPairData, setSearch } from './actions'
import { AppDispatch, AppState } from '../store'
import useCurrentBlockTimestamp from '@/hooks/useCurrentBlockTimestamp'
import { client } from '@/apollo/client'
import { ALL_PAIRS, PAIRS_BULK, PAIRS_HISTORICAL_BULK } from '@/apollo/queries'
import { getBlocksFromTimestamps } from '@/utils'
import dayjs from 'dayjs'
import { chunkArray as chunk } from '@/utils/chunkArray'

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const PAIRS_TO_FETCH = 500

export function usePoolState (): AppState['pools'] {
  return useSelector<AppState, AppState['pools']>((state) => state.pools)
}

export function useCurrentBlockTimeStamp (): void {
  const dispatch = useDispatch<AppDispatch>()
  const currentBlockTimestamp = useCurrentBlockTimestamp()

  useEffect(() => {
    dispatch(setBlock(Number(currentBlockTimestamp)))
  }, [dispatch, currentBlockTimestamp])
}

export function useLastTimestamp (): {
  shouldFetch: boolean
  getTimestampsForChanges: () => number[]
} {
  const lastFetchTimestampRef = useRef<number | null>(null)

  const getTimestampsForChanges = useCallback(() => {
    const utcCurrentTime = dayjs()
    return [utcCurrentTime.subtract(1, 'day').startOf('minute').unix()]
  }, [])

  const shouldFetch = useMemo(() => {
    if (lastFetchTimestampRef.current == null) return true
    return Date.now() - lastFetchTimestampRef.current > CACHE_DURATION
  }, [lastFetchTimestampRef.current])

  return {
    shouldFetch,
    getTimestampsForChanges
  }
}

export function useFetchPairList (): () => Promise<void> {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(async () => {
    const pairsResult = await client.query({
      query: ALL_PAIRS,
      fetchPolicy: 'network-only'
    })
    dispatch(setPairList(pairsResult.data.pairs.map((pair: PairData) => pair.id)))
  }, [dispatch])
}

export function useFetchBulkPairData (): () => Promise<void> {

  const dispatch = useDispatch<AppDispatch>()
  const { allPairs } = usePoolState()

  return useCallback(async () => {
    const chunkedPairs = chunk(allPairs, PAIRS_TO_FETCH)
    const bulkResults = await Promise.all(
      chunkedPairs.map(async chunk =>
        await client.query({
          query: PAIRS_BULK,
          variables: {
            allPairs: chunk
          },
          fetchPolicy: 'network-only'
        })
      )
    )
    console.log('bulk', bulkResults)
    dispatch(setBulkPairsData(bulkResults.flatMap(result => result.data.pairs)))
  }, [dispatch, allPairs])
}

export function useFetchDailyPairData (): () => Promise<void> {
  const dispatch = useDispatch<AppDispatch>()
  const { getTimestampsForChanges } = useLastTimestamp()
  const { allPairs } = usePoolState()
  
  return useCallback(async () => {
    const [t1] = getTimestampsForChanges()
    const [{ number: oneDay }] = await getBlocksFromTimestamps([t1])
    const chunkedPairs = chunk(allPairs, PAIRS_TO_FETCH)
    const historicalResults = await Promise.all(
      chunkedPairs.map(async chunk =>
        await client.query({
          query: PAIRS_HISTORICAL_BULK(oneDay, chunk),
          fetchPolicy: 'cache-first'
        })
      )
    )
    dispatch(SetDailyPairData(historicalResults.flatMap(result => result.data.pairs)
      .reduce((acc, cur) => ({ ...acc, [cur.id]: cur }), {})))
  }, [dispatch, getTimestampsForChanges, allPairs])
}

export function useSetSearchValue (): (searchPool: string) => void {
  const dispatch = useDispatch()
  return useCallback((searchPool: string) => {
    dispatch(setSearch({ searchPool }))
  }, [dispatch])
}

export function useDerivedPoolInfo () {
  const currentBlockTimestamp = useCurrentBlockTimestamp()?.toNumber()
  const [lastUpdatedBlock, setLastUpdatedBlock] = useState<number | null>(null)

  const {
    allPairs,
    block,
    DailyPairData,
    bulkPairsData
  } = usePoolState()
  const fetchPairList = useFetchPairList()
  const fetchBulkPairData = useFetchBulkPairData()
  const fetchDailyPairData = useFetchDailyPairData()

  const updateData = useCallback(async () => {
    await fetchPairList()
    await fetchBulkPairData()
    await fetchDailyPairData()
  }, [fetchPairList, fetchBulkPairData, fetchDailyPairData])

  useEffect(() => {
    if (currentBlockTimestamp && (!lastUpdatedBlock || currentBlockTimestamp > lastUpdatedBlock)) {
      updateData()
      setLastUpdatedBlock(currentBlockTimestamp)
    }
  }, [currentBlockTimestamp, lastUpdatedBlock, updateData])

  return {
    allPairs,
    block,
    DailyPairData,
    bulkPairsData,
    updateData // Expose the updateData function in case you need to trigger an update manually
  }
}