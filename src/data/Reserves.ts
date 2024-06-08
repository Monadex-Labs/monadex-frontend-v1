import { TokenAmount, Pair, NativeCurrency, ChainId, Token } from '@monadex/sdk'
import { useMemo } from 'react'
import MonadexV2Pair from '@/constants/abi/JSON/MonadexV1Pair.json'
import { Interface } from '@ethersproject/abi'
import { useMultipleContractSingleData } from '@/state/multicall/hooks'
import { wrappedCurrency } from '@/utils/wrappedCurrency'
import { useConnectWallet } from '@web3-onboard/react'

const PAIR_INTERFACE = new Interface(MonadexV2Pair.abi)

export enum PairState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
}

export function usePairs (
  currencies: [Token | undefined , Token | undefined][] //  eslint-disable-line 
): Array<[PairState, Pair | null]> {
  const ID = useConnectWallet()[0].wallet?.chains[0].id
  const chainId: ChainId | undefined = Number(ID) as ChainId

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
        return (typeof tokenA !== 'undefined' && typeof tokenB !== 'undefined') && !tokenA.equals(tokenB)
          ? Pair.getAddress(tokenA, tokenB, chainId) // go with sepolia chainID if needed
          : undefined
      }),
    [tokens]
  )

  const results = useMultipleContractSingleData(
    pairAddresses,
    PAIR_INTERFACE,
    'getReserves'
  )

  return useMemo(() => {
    return results.map((result, i) => {
      const { result: reserves, loading } = result
      const tokenA = tokens[i][0]
      const tokenB = tokens[i][1]

      if (loading) return [PairState.LOADING, null]
      if (tokenA === undefined || tokenB === undefined || tokenA.equals(tokenB)) return [PairState.INVALID, null]
      if (reserves === undefined) return [PairState.NOT_EXISTS, null]
      const { reserve0, reserve1 } = reserves
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
  tokenA?: Token,
  tokenB?: Token
): [PairState, Pair | null] {
  return usePairs([[tokenA, tokenB]])[0]
}