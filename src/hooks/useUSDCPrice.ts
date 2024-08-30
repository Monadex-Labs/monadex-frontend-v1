import { USDC } from '@/constants'
import { useWalletData } from '@/utils'
import { ChainId, CurrencyAmount, Price, Token } from '@monadex/sdk'
import { useMemo } from 'react'
import { useUbeswapTradeExactOut } from './useTrade'

export default function useUSDCPrice (
  currency?: Token,
  allLiquidity?: boolean
): Price | undefined {
  const { chainId } = useWalletData()
  const chainIdToUse = chainId ?? ChainId.ETH

  const USDC_TOKEN = USDC[chainIdToUse]
  const STABLECOIN_AMOUNT_OUT_ALL:
  | CurrencyAmount
  | undefined = USDC_TOKEN ?? CurrencyAmount.fromRawAmount(USDC_TOKEN, 1)
  const STABLECOIN_AMOUNT_OUT_FILTERED:
  | CurrencyAmount
  | undefined = USDC_TOKEN ?? CurrencyAmount.fromRawAmount(USDC_TOKEN, 100_000e1)

  const amountOut = chainId != null
    ? (allLiquidity != null
        ? STABLECOIN_AMOUNT_OUT_ALL
        : STABLECOIN_AMOUNT_OUT_FILTERED)
    : undefined
  const stablecoin = amountOut?.currency

  const v3USDCTrade = useUbeswapTradeExactOut(currency, amountOut)

  return useMemo(() => {
    if ((currency == null) || (stablecoin == null)) {
      return undefined
    }

    // handle usdc
    if (currency?.wrapped.equals(stablecoin)) {
      return new Price(stablecoin, stablecoin, '1', '1')
    }

    if (v3USDCTrade.trade) {
      const { numerator, denominator } = v3USDCTrade.trade.route.midPrice
      return new Price(currency, stablecoin, denominator, numerator)
    }

    return undefined
  }, [currency, stablecoin, v3USDCTrade.trade])
}

export function useUSDCValue (
  currencyAmount: CurrencyAmount | undefined | null,
  allLiquidity = false
): CurrencyAmount | null {
  const price = useUSDCPrice(currencyAmount?.currency, allLiquidity)

  return useMemo(() => {
    if ((price == null) || (currencyAmount == null)) return null
    try {
      return price.quote(currencyAmount)
    } catch (error) {
      return null
    }
  }, [currencyAmount, price])
}
