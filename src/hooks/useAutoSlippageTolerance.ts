import { Percent, Percent as V2Percent, JSBI, Trade as V2Trade } from '@monadex/sdk'
import { useMemo } from 'react'
import { useWalletData } from '@/utils'
import useGasPrice from './useGasPrice'
import { wrappedCurrency } from '@/utils/wrappedCurrency'

const DEFAULT_AUTO_SLIPPAGE = new Percent(5, 1000)
const MIN_AUTO_SLIPPAGE_TOLERANCE = DEFAULT_AUTO_SLIPPAGE
const MAX_AUTO_SLIPPAGE_TOLERANCE = new Percent(5, 100)

const DEFAULT_AUTO_SLIPPAGE_V2 = new V2Percent('5', '1000')
const MIN_AUTO_SLIPPAGE_TOLERANCE_V2 = DEFAULT_AUTO_SLIPPAGE_V2
const MAX_AUTO_SLIPPAGE_TOLERANCE_V2 = new V2Percent('5', '100')


const V2_SWAP_BASE_GAS_ESTIMATE = 135_000
// Extra cost per hop in the route
const V2_SWAP_HOP_GAS_ESTIMATE = 50_000

function guesstimateGas (
  trade: V2Trade | null | undefined
): number | undefined {
  if (trade != null) {
    let gas = 0
    gas +=
        V2_SWAP_BASE_GAS_ESTIMATE +
        trade.route.pairs.length * V2_SWAP_HOP_GAS_ESTIMATE

    return gas
  }

  return undefined
}
/**
 * @todo WORK ON THIS AS SOON MONAD IS LIVE
 */

// export function useAutoSlippageTolerance (
//   trade?: V2Trade | null
// ): Percent {
//   const { chainId } = useWalletData()
//   const outputToken =
//     trade instanceof V2Trade
//       ? wrappedCurrency(trade?.outputAmount.currency, chainId)
//       : trade?.outputAmount.currency.wrapped
//   const outputTokenUSDPrice = useUSDCPriceFromAddress(outputToken?.address)
//   const outputUSD =
//     Number(trade?.outputAmount.toExact()) * outputTokenUSDPrice.price

//   const nativeGasPrice = useGasPrice()
//   const gasEstimate = guesstimateGas(trade)
//   const nativeGasCost =
//     (nativeGasPrice != null) && gasEstimate
//       ? JSBI.multiply(nativeGasPrice, JSBI.BigInt(gasEstimate))
//       : undefined
//   const nativeUSDPrice = useUSDCPriceFromAddress(WETH[chainId].address)
//   const gasCostUSD = (nativeGasCost != null)
//     ? Number(formatUnits(nativeGasCost.toString(), WETH[chainId].decimals)) *
//       nativeUSDPrice.price
//     : undefined

//   return useMemo(() => {
//     if (trade == null) return DEFAULT_AUTO_SLIPPAGE

//     if (outputUSD && gasCostUSD) {
//       const result = new Percent(
//         ((gasCostUSD / outputUSD) * 10000).toFixed(0),
//         10000
//       )
//       if (result.greaterThan(MAX_AUTO_SLIPPAGE_TOLERANCE)) {
//         return MAX_AUTO_SLIPPAGE_TOLERANCE
//       }

//       if (result.lessThan(MIN_AUTO_SLIPPAGE_TOLERANCE)) {
//         return MIN_AUTO_SLIPPAGE_TOLERANCE
//       }

//       return result
//     }

//     return DEFAULT_AUTO_SLIPPAGE
//   }, [trade, outputUSD, gasCostUSD])
// }
