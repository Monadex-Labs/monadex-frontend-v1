import { NativeCurrency, Price, Token, TokenAmount, Trade } from '@monadex/sdk'
import { useWalletData } from './index'
import { tryParseAmount } from '@/state/swap/hooks'
import { USDC } from '@/constants'
import { useMemo } from 'react'
import { useAllCommonPairs } from '@/hooks/Trades'

/**
 * Returns the price in USDC of the input currency
 * @param currency currency to compute the USDC price of
 */

export default function useUSDCPrice (currency?: Token | NativeCurrency): Price | undefined {
  const { chainId } = useWalletData()
  const amountOut = chainId
    ? tryParseAmount('1', USDC[chainId])
    : undefined

  const allowedPairs = useAllCommonPairs(currency, USDC[chainId])
  console.log('amountout', allowedPairs)

  return useMemo(() => {
    if ((currency == null) || (amountOut == null) || (allowedPairs.length === 0)) {
      return undefined
    }

    const trade =
      Trade.bestTradeExactOut(allowedPairs, currency, amountOut, {
        maxHops: 3,
        maxNumResults: 1
      })[0] ?? null

    if (!trade) return

    const { numerator, denominator } = trade.route.midPrice

    return new Price(currency, USDC[chainId], denominator, numerator)
  }, [currency, allowedPairs, amountOut, chainId])
}
