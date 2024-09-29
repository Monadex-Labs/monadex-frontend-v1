import { useEffect, useCallback, useState, useMemo, useRef } from 'react'
import useCurrentBlockTimestamp from '@/hooks/useCurrentBlockTimestamp'
import { client } from '@/apollo/client'
import { ALL_PAIRS, PAIRS_BULK, PAIRS_HISTORICAL_BULK } from '@/apollo/queries'
import dayjs from 'dayjs'
import { getBlocksFromTimestamps } from '@/utils'

const PAIRS_TO_FETCH = 500
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

interface PairData {
  id: string
  [key: string]: any
}

const useBulkPools = (): {
  isLoading: boolean
  error: Error | null
  allPairs: string[]
  bulkPairsData: PairData[]
  historicalData: Record<string, PairData>
  refetch: () => Promise<void>
} => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [allPairs, setAllPairs] = useState<string[]>([])
  const [bulkPairsData, setBulkPairsData] = useState<PairData[]>([])
  const [historicalData, setHistoricalData] = useState<Record<string, PairData>>({})
  const lastFetchTimestamp = useRef<number | null>(null)
  const currentBlock = useCurrentBlockTimestamp()?.toNumber()

  const getTimestampsForChanges = useCallback(() => {
    const utcCurrentTime = dayjs()
    return [utcCurrentTime.subtract(1, 'day').startOf('minute').unix()]
  }, [])

  const shouldFetch = useMemo(() => {
    if (!lastFetchTimestamp.current) return true
    return Date.now() - lastFetchTimestamp.current > CACHE_DURATION
  }, [lastFetchTimestamp.current])

  const fetchPairList = useCallback(async () => {
    const pairsResult = await client.query({
      query: ALL_PAIRS,
      fetchPolicy: 'network-only',
    })
    return pairsResult.data.pairs.map((pair: PairData) => pair.id)
  }, [])

  const fetchBulkPairsData = useCallback(async (pairsToUse: string[]) => {
    const chunkedPairs = chunk(pairsToUse, PAIRS_TO_FETCH)
    const bulkResults = await Promise.all(
      chunkedPairs.map(chunk =>
        client.query({
          query: PAIRS_BULK,
          variables: { allPairs: chunk },
          fetchPolicy: 'network-only'
        })
      )
    )
    return bulkResults.flatMap(result => result.data.pairs)
  }, [])

  const fetchHistoricalData = useCallback(async (pairsToUse: string[]) => {
    const [t1] = getTimestampsForChanges()
    const [{ number: oneDay }] = await getBlocksFromTimestamps([t1])
    
    const chunkedPairs = chunk(pairsToUse, PAIRS_TO_FETCH)
    const historicalResults = await Promise.all(
      chunkedPairs.map(chunk =>
        client.query({
          query: PAIRS_HISTORICAL_BULK(oneDay, chunk),
          fetchPolicy: 'cache-first'
        })
      )
    )
    
    return historicalResults.flatMap(result => result.data.pairs)
      .reduce((acc, cur) => ({ ...acc, [cur.id]: cur }), {})
  }, [getTimestampsForChanges])

  const fetchPoolData = useCallback(async () => {
    if (isLoading || !shouldFetch) return

    setIsLoading(true)
    setError(null)

    try {
      let pairsToUse = allPairs.length > 0 ? allPairs : await fetchPairList()
      if (allPairs.length === 0) setAllPairs(pairsToUse)

      const [bulkData, historicalData] = await Promise.all([
        fetchBulkPairsData(pairsToUse),
        fetchHistoricalData(pairsToUse)
      ])

      setBulkPairsData(bulkData)
      setHistoricalData(historicalData)
      lastFetchTimestamp.current = Date.now()
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'))
    } finally {
      setIsLoading(false)
    }
  }, [allPairs, isLoading, shouldFetch, fetchPairList, fetchBulkPairsData, fetchHistoricalData])

  useEffect(() => {
    fetchPoolData()
  }, [fetchPoolData, currentBlock])

  return useMemo(() => ({
    isLoading,
    error,
    allPairs,
    bulkPairsData,
    historicalData,
    refetch: fetchPoolData
  }), [isLoading, error, allPairs, bulkPairsData, historicalData, fetchPoolData])
}

const chunk = <T>(arr: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  )

export default useBulkPools
