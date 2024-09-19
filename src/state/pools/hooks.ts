import { useEffect, useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setBlock, setPairList, setBulkPairsData, setSkipCount } from './actions'
import { AppDispatch, AppState } from '../store'
import useCurrentBlockTimestamp from '@/hooks/useCurrentBlockTimestamp'
import { client } from '@/apollo/client'
import { ALL_PAIRS, PAIRS_BULK } from '@/apollo/queries'

const PAIRS_TO_FETCH = 500

export function usePoolState(): AppState['pools'] {
  return useSelector<AppState, AppState['pools']>((state) => state.pools)
}

export function useFetchPairsData() {
  const dispatch = useDispatch<AppDispatch>()
  const currentBlock = useCurrentBlockTimestamp()?.toNumber()
  const { bulkPairsData, block, skipCount } = usePoolState()
  const [isLoading, setIsLoading] = useState(false)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      // Fetch pair list
      const pairsResult = await client.query({
        query: ALL_PAIRS,
        variables: { skip: skipCount }
      })
      
      const pairs = pairsResult.data.pairs.map((pair: any) => pair.id)
      const next = skipCount + PAIRS_TO_FETCH
      
      dispatch(setPairList(pairs))
      dispatch(setSkipCount(next))

      // Fetch bulk data for pairs
      const bulkResult = await client.query({
        query: PAIRS_BULK,
        variables: { allPairs: pairs }
      })
      
      dispatch(setBulkPairsData(bulkResult.data.pairs))
    } catch (error) {
      console.error('Error fetching pairs data:', error)
      // You might want to dispatch an error action here
    } finally {
      setIsLoading(false)
    }
  }, [dispatch, skipCount, currentBlock])

  useEffect(() => {
    if (currentBlock && currentBlock !== block) {
      dispatch(setBlock(currentBlock))
      fetchData()
    }
  }, [currentBlock, block, dispatch, fetchData])

  return {
    bulkPairsData,
    block,
    isLoading: isLoading || block !== currentBlock,
    refetch: fetchData
  }
}