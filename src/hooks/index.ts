import { useMemo } from 'react'
import { Pair } from '@monadex/sdk'
import { toV2LiquidityToken, useTrackedTokenPairs } from '@/state/user/hooks'
import { useTokenBalancesWithLoadingIndicator } from '@/state/wallet/hooks'
import { usePairs } from '@/data/Reserves'

export function useV2LiquidityPools (account?: string): { loading: boolean, pairs: Pair[] } {
  const trackedTokenPairs = useTrackedTokenPairs()
  const tokenPairsWithLiquidityTokens = useMemo(
    () =>
      trackedTokenPairs.map((tokens) => ({
        liquidityToken: toV2LiquidityToken(tokens),
        tokens
      })),
    [trackedTokenPairs]
  )
  const liquidityTokens = useMemo(
    () => tokenPairsWithLiquidityTokens.map((tpwlt) => tpwlt.liquidityToken),
    [tokenPairsWithLiquidityTokens]
  )
  const [
    v2PairsBalances,
    fetchingV2PairBalances
  ] = useTokenBalancesWithLoadingIndicator(account, liquidityTokens)

  // fetch the reserves for all V2 pools in which the user has a balance
  const liquidityTokensWithBalances = useMemo(
    () =>
      tokenPairsWithLiquidityTokens.filter(({ liquidityToken }) =>
        v2PairsBalances[liquidityToken.address]?.greaterThan('0')
      ),
    [tokenPairsWithLiquidityTokens, v2PairsBalances]
  )

  const v2Pairs = usePairs(
    liquidityTokensWithBalances.map(({ tokens }) => tokens)
  )
  const v2IsLoading =
    fetchingV2PairBalances ||
    v2Pairs?.length < liquidityTokensWithBalances.length ||
    v2Pairs?.some((V2Pair) => !(V2Pair != null))

  const allV2PairsWithLiquidity = v2Pairs
    .map(([, pair]) => pair)
    .filter((v2Pair): v2Pair is Pair => Boolean(v2Pair))

  return { loading: v2IsLoading, pairs: allV2PairsWithLiquidity }
}
