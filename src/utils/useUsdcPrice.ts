import { NativeCurrency, Price, Token, TokenAmount, Trade, Pair, JSBI } from '@monadex/sdk'
import { useWalletData, formatTokenAmount } from './index'
import { tryParseAmount } from '@/state/swap/hooks'
import { USDC } from '@/constants'
import { useMemo } from 'react'
import { useAllCommonPairs } from '@/hooks/Trades'
import { useTotalSupplys } from '@/data/TotalSupply'
import { useTokenBalances } from '@/state/wallet/hooks'
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
  console.log('pair', allowedPairs)
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

export function usePoolUSDCPosition (pair: Pair, perUser: boolean = false, amount0?: TokenAmount, amount1?: TokenAmount): number {
  const usdPrice0 = Number(useUSDCPrice(pair?.token0)?.toSignificant() ?? 0)
  const usdPrice1 = Number(useUSDCPrice(pair?.token1)?.toSignificant() ?? 0)
  const number0 = Number(formatTokenAmount(pair?.reserve0).replace(/,/g, ''))
  const number1 = Number(formatTokenAmount(pair?.reserve1).replace(/,/g, ''))
  const sum = (usdPrice0 * number0 + usdPrice1 * number1)
  if (!perUser) return sum
  const balancePerUser0 = Number(formatTokenAmount(amount0).replace(/,/g, ''))
  const balancePerUser1 = Number(formatTokenAmount(amount1).replace(/,/g, ''))
  return usdPrice0 * balancePerUser0 + usdPrice1 * balancePerUser1
}

export function usePoolUSDCPositions(address: string, pair: Pair[], index: number) {
  const tokenBalances = useTokenBalances(address, [pair[index]?.liquidityToken]);
  const totalSupply = useTotalSupplys([pair[index]?.liquidityToken])

  // Since useTotalSupplys returns an array, we access by index directly
  const totalPoolTokens = totalSupply[0]// For single pair case

  // Similarly for token balances if it follows the same pattern
  const userPoolBalance = tokenBalances[pair[index]?.liquidityToken?.address]

  // Calculate deposited token amounts
  const [token0Deposited, token1Deposited] = useMemo(() => {
    if (
      !pair[index] ||
      (totalPoolTokens == null) ||
      (userPoolBalance == null) ||
      !JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
    ) {
      return [undefined, undefined]
    }

    try {
      return [
        pair[index].getLiquidityValue(
          pair[index].token0,
          totalPoolTokens,
          userPoolBalance,
          false
        ),
        pair[index].getLiquidityValue(
          pair[index].token1,
          totalPoolTokens,
          userPoolBalance,
          false
        )
      ]
    } catch (error) {
      console.error('Error calculating liquidity values:', error)
      return [undefined, undefined]
    }
  }, [pair, index, totalPoolTokens, userPoolBalance])

  const usdPrice0 = Number(useUSDCPrice(pair[index].token0)?.toSignificant() ?? 0)
  const usdPrice1 = Number(useUSDCPrice(pair[index].token1)?.toSignificant() ?? 0)
  const number0 = Number(formatTokenAmount(token0Deposited).replace(/,/g, ''))
  const number1 = Number(formatTokenAmount(token1Deposited).replace(/,/g, ''))
  return {
    totalPoolTokens,
    userPoolBalance,
    usdcBalance: usdPrice0 * number0 + usdPrice1 * number1,
    // Other derived values
    totalSupplyRaw: totalPoolTokens?.raw.toString(),
    userBalanceRaw: userPoolBalance?.raw.toString()
  }
}