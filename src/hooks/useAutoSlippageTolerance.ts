import { OptimalRate } from '@paraswap/sdk'
import { Percent, JSBI } from '@monadex/sdk'
import { useMemo } from 'react'

const DEFAULT_AUTO_SLIPPAGE_V2 = new Percent('5', '1000')
const MIN_AUTO_SLIPPAGE_TOLERANCE_V2 = DEFAULT_AUTO_SLIPPAGE_V2
const MAX_AUTO_SLIPPAGE_TOLERANCE_V2 = new Percent('5', '100')
export function useAutoSlippageToleranceBestTrade (
  trade?: OptimalRate
): Percent {
  return useMemo(() => {
    if (trade == null) return DEFAULT_AUTO_SLIPPAGE_V2
    if ((trade != null) && Number(trade.destUSD) > 0) {
      const result = new Percent(
        ((Number(trade.gasCostUSD) / Number(trade.destUSD)) * 10000).toFixed(0),
        JSBI.BigInt(10000)
      )
      if (result.greaterThan(MAX_AUTO_SLIPPAGE_TOLERANCE_V2)) {
        return MAX_AUTO_SLIPPAGE_TOLERANCE_V2
      }

      if (result.lessThan(MIN_AUTO_SLIPPAGE_TOLERANCE_V2)) {
        return MIN_AUTO_SLIPPAGE_TOLERANCE_V2
      }

      return result
    }
    return DEFAULT_AUTO_SLIPPAGE_V2
  }, [trade])
}
