import { NativeCurrency, Price, Token, Trade } from '@monadex/sdk'
import { useWalletData } from './index'
import { tryParseAmount } from '@/state/swap/hooks'
import { USDC } from '@/constants'
import { useMemo } from 'react'
import { useAllCommonPairs } from '@/hooks/Trades'
export default function useUSDCPrice (currency?: Token | NativeCurrency): Price | undefined {
  const { chainId } = useWalletData()
  const amountOut = (chainId !== undefined)
    ? tryParseAmount('1', USDC[chainId])
    : undefined

  const allowedPairs = useAllCommonPairs(currency, USDC[chainId])
  return useMemo(() => {
    if (!currency || !amountOut || !allowedPairs.length) { // eslint-disable-line
      return undefined
    }
    const trade =
    Trade.bestTradeExactOut(allowedPairs, currency, amountOut, {
      maxHops: 3,
      maxNumResults: 1
    })[0] ?? null

    if (!trade) return // eslint-disable-line
    const { numerator, denominator } = trade.route.midPrice
    return new Price(currency, USDC[chainId], denominator, numerator)
  }, [currency, allowedPairs, amountOut, chainId])
}
