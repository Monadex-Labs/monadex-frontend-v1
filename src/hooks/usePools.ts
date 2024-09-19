import { useEffect, useCallback, useState, useMemo, useRef } from 'react'
import useCurrentBlockTimestamp from '@/hooks/useCurrentBlockTimestamp'
import { client } from '@/apollo/client'
import { ALL_PAIRS, PAIRS_BULK } from '@/apollo/queries'

const PAIRS_TO_FETCH = 500
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

const useBulkPools = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [allPairs, setAllPairs] = useState<string[]>([])
  const [bulkPairsData, setBulkPairsData] = useState<any[]>([])
  const lastFetchTimestamp = useRef<number | null>(null)
  const currentBlock = useCurrentBlockTimestamp()?.toNumber()

  const shouldFetch = useMemo(() => {
    if (!lastFetchTimestamp.current) return true
    return Date.now() - lastFetchTimestamp.current > CACHE_DURATION
  }, [lastFetchTimestamp.current])

  const fetchPoolData = useCallback(async () => {
    if (isLoading || !shouldFetch) return

    setIsLoading(true)
    setError(null)

    try {
      let pairsToUse = allPairs

      // Fetch pair list if not already fetched
      if (pairsToUse.length === 0) {
        const pairsResult = await client.query({
          query: ALL_PAIRS,
          fetchPolicy: 'network-only',
        })
        pairsToUse = pairsResult.data.pairs.map((pair: any) => pair.id)
        setAllPairs(pairsToUse)
      }

      // Fetch bulk data for pairs
      const chunkedPairs = chunk(pairsToUse, PAIRS_TO_FETCH)
      const bulkResults = await Promise.all(
        chunkedPairs.map(chunk =>
          client.query({
            query: PAIRS_BULK,
            variables: { allPairs: chunk },
            fetchPolicy: 'network-only',
          })
        )
      )

      const mergedBulkData = bulkResults.flatMap(result => result.data.pairs)
      setBulkPairsData(mergedBulkData)
      lastFetchTimestamp.current = Date.now()
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'))
    } finally {
      setIsLoading(false)
    }
  }, [allPairs, isLoading, shouldFetch])

  useEffect(() => {
    fetchPoolData()
  }, [fetchPoolData, currentBlock])

  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(() => ({
    isLoading,
    error,
    allPairs,
    bulkPairsData,
    refetch: fetchPoolData
  }), [isLoading, error, allPairs, bulkPairsData, fetchPoolData])
}

// Utility function for chunking arrays
const chunk = <T>(arr: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  )

export default useBulkPools