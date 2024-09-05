import { useEffect, useState } from 'react'
import { useSwapActionHandlers } from '@/state/swap/hooks'
import { SwapDelay } from '@/state/swap/actions'

const REFRESH_INTERVAL = 10000 // 10 seconds

export function useQuoteRefresher(shouldRefresh: boolean) : number {
  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now())
  const { onSwapDelay } = useSwapActionHandlers()

  useEffect(() => {
    let intervalId: NodeJS.Timeout

    if (shouldRefresh) {
      intervalId = setInterval(() => {
        onSwapDelay(SwapDelay.FETCHING_SWAP)
        setLastRefreshTime(Date.now())
      }, REFRESH_INTERVAL)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [shouldRefresh, onSwapDelay])

  return lastRefreshTime
}