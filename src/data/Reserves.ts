import { TokenAmount, Pair, Token, NativeCurrency } from '@monadex/sdk'
import { useMemo } from 'react'
import MonadexV2Pair from '@/constants/abi/JSON/MonadexV1Pair.json'
import { Interface } from '@ethersproject/abi'
import { useMultipleContractSingleData } from '@/state/multicall/hooks'
import { wrappedCurrency } from '@/utils/wrappedCurrency'
import { useWalletData } from '@/utils'

const PAIR_INTERFACE = new Interface(MonadexV2Pair)

export enum PairState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
}

export function usePairs (
  currencies: Array<[Token | NativeCurrency | undefined, Token | NativeCurrency | undefined]>
): Array<[PairState, Pair | null]> {
  const { chainId } = useWalletData()
  const tokens = useMemo(
    () =>
      currencies.map(([currencyA, currencyB]) => [
        wrappedCurrency(currencyA, chainId),
        wrappedCurrency(currencyB, chainId)
      ]),
    [chainId, currencies]
  )

  const pairAddresses = useMemo(
    () =>
      tokens.map(([tokenA, tokenB]) => {
        return (tokenA != null) && (tokenB != null) && !tokenA.equals(tokenB)
          ? Pair.getAddress(tokenA, tokenB)
          : undefined
      }),
    [tokens]
  )
  const results = useMultipleContractSingleData(pairAddresses, PAIR_INTERFACE, 'getReserves')
  return useMemo(() => {
    return results.map((result, i) => {
      const { result: reserves, loading } = result
      const tokenA = tokens[i][0]
      const tokenB = tokens[i][1]

      if (loading) return [PairState.LOADING, null]
      if (tokenA === undefined || tokenB === undefined || tokenA.equals(tokenB)) { return [PairState.INVALID, null] }
      if (reserves == null) return [PairState.NOT_EXISTS, null]
      const { 0: reserve0, 1: reserve1 } = reserves

      const [token0, token1] = tokenA.sortsBefore(tokenB)
        ? [tokenA, tokenB]
        : [tokenB, tokenA]
      return [
        PairState.EXISTS,
        new Pair(
          new TokenAmount(token0, reserve0.toString()),
          new TokenAmount(token1, reserve1.toString())
        )
      ]
    })
  }, [results, tokens])
}

export function usePair (
  tokenA?: Token | NativeCurrency,
  tokenB?: Token | NativeCurrency
): readonly [PairState, Pair | null] {
  const pairs = usePairs([[tokenA, tokenB]])
  // Ensure pairs always return a tuple even if the data is missing
  return pairs[0] || [PairState.INVALID, null]
}
