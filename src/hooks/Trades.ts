import { Currency, CurrencyAmount, Pair, Token, Trade, ChainId } from '@monadex/sdk'
import {
  CUSTOM_BASES,
  BASES_TO_CHECK_TRADES_AGAINST
} from '@/constants/index'
import flatMap from 'lodash.flatmap'
import { useMemo } from 'react'
import { SwapDelay } from '@/state/swap/actions'
import { PairState, usePairs } from '@/data/Reserves'
import { wrappedCurrency } from '../utils/wrappedCurrency'
import { useConnectWallet, useWallets } from '@web3-onboard/react'


export function useAllCommonPairs (
  currencyA?: Currency,
  currencyB?: Currency
): Pair[] {
  const ID = useConnectWallet()[0].wallet?.chains[0].id
  const chainId: ChainId | undefined = Number(ID) as ChainId

  const bases: Token[] = useMemo(
    () => ((chainId !== undefined) ? BASES_TO_CHECK_TRADES_AGAINST[chainId] : []),
    [chainId]
  )

  const [tokenA, tokenB] = (chainId !== undefined)
    ? [wrappedCurrency(currencyA, chainId), wrappedCurrency(currencyB, chainId)]
    : [undefined, undefined]

  const basePairs: Array<[Token, Token]> = useMemo(
    () =>
      flatMap(bases, (base): Array<[Token, Token]> =>
        bases.map((otherBase) => [base, otherBase])
      ).filter(([t0, t1]) => t0.address !== t1.address),
    [bases]
  )
  const allPairCombinations: Array<[Token, Token]> = useMemo(
    () =>
      (tokenA != null) && (tokenB != null)
        ? [
            // the direct pair
            [tokenA, tokenB],
            // token A against all bases
            ...bases.map((base): [Token, Token] => [tokenA, base]),
            // token B against all bases
            ...bases.map((base): [Token, Token] => [tokenB, base]),
            // each base against all bases
            ...basePairs
          ]
            .filter((tokens): tokens is [Token, Token] =>
              Boolean((tokens[0] !== undefined) && tokens[1])
            )
            .filter(([t0, t1]) => t0.address !== t1.address)
            .filter(([tokenA, tokenB]) => {
              if (chainId === undefined) return true
              const customBases = CUSTOM_BASES[chainId]
              if (customBases === undefined) return true

              const customBasesA: Token[] | undefined =
                customBases[tokenA.address]
              const customBasesB: Token[] | undefined =
                customBases[tokenB.address]

              if ((customBasesA == null) && (customBasesB == null)) return true

              if (
                (customBasesA != null) &&
                ((customBasesA).find((base) => tokenB.equals(base)) == null)
              ) { return false }
              if (
                (customBasesB != null) &&
                ((customBasesB).find((base) => tokenA.equals(base)) == null)
              ) { return false }

              return true
            })
        : [],
    [tokenA, tokenB, bases, basePairs, chainId]
  )

  const allPairs = usePairs(allPairCombinations)
}
