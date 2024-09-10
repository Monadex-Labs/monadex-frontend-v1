import { Pair, Token, Trade, TokenAmount, NativeCurrency, ChainId, Price } from '@monadex/sdk'
import {
  CUSTOM_BASES,
  BASES_TO_CHECK_TRADES_AGAINST
} from '@/constants/index'
import flatMap from 'lodash.flatmap'
import { useMemo } from 'react'
import { SwapDelay } from '@/state/swap/actions'
import { PairState, usePairs } from '@/data/Reserves'
import { wrappedCurrency } from '../utils/wrappedCurrency'
import { useWalletData } from '@/utils'
import { USDC } from '@/constants'
export function useAllCommonPairs (
  currencyA?: Token | NativeCurrency,
  currencyB?: Token | NativeCurrency
): Pair[] {
  const { chainId } = useWalletData()
  const chainTouse = chainId || ChainId.SEPOLIA
  const bases: Token[] = useMemo(
    () => (chainTouse ? BASES_TO_CHECK_TRADES_AGAINST[chainTouse] : []),
    [chainTouse]
  )
  const [tokenA, tokenB] = chainId
    ? [wrappedCurrency(currencyA, chainId), wrappedCurrency(currencyB, chainId)]
    : [undefined, undefined]

  const basePairs: Array<[Token, Token]> = useMemo(
    () =>
      flatMap(bases, (base): Array<[Token, Token]> =>
        bases.map((otherBase) => [base, otherBase])
      ).filter(([t0, t1]) => t0?.address !== t1?.address),
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
  // @todo: FOR LATER
  const allPairs = usePairs(allPairCombinations)
  // only pass along valid pairs, non-duplicated pairs
  return useMemo(
    () =>
      Object.values(
        allPairs
          // filter out invalid pairs
          .filter((result): result is [PairState.EXISTS, Pair] =>
            Boolean(result[0] === PairState.EXISTS && result[1])
          )
          // filter out duplicated pairs
          .reduce<{ [pairAddress: string]: Pair }>((memo, [, curr]) => {
          memo[curr.liquidityToken.address] = memo[curr.liquidityToken.address] ?? curr
          return memo
        }, {})
      ),
    [allPairs]
  )
}
/**
 * Returns the best trade for the exact amount of tokens in to the given token out
*/
let bestTradeExactIn: Trade | null = null
export function useTradeExactIn (
  currencyAmountIn?: TokenAmount,
  currencyOut?: Token,
  swapDelay?: SwapDelay,
  onSetSwapDelay?: (swapDelay: SwapDelay) => void
): Trade | null {
  const allowedPairs = useAllCommonPairs(
    currencyAmountIn?.token,
    currencyOut
  )
  bestTradeExactIn = useMemo(() => {
    if (currencyAmountIn == null) {
      return null
    }
    if (
      swapDelay !== SwapDelay.USER_INPUT_COMPLETE &&
      swapDelay !== SwapDelay.SWAP_REFRESH
    ) {
      return bestTradeExactIn
    }
    if (swapDelay !== SwapDelay.SWAP_REFRESH && (onSetSwapDelay != null)) {
      onSetSwapDelay(SwapDelay.SWAP_COMPLETE)
    }
    if (currencyAmountIn && (currencyOut != null) && allowedPairs.length > 0) {
      return (
        Trade.bestTradeExactIn(allowedPairs, currencyAmountIn, currencyOut, {
          maxHops: 3,
          maxNumResults: 1
        })[0] ?? null
      )
    }
    return null
  }, [allowedPairs, currencyAmountIn, currencyOut, onSetSwapDelay, swapDelay])

  return bestTradeExactIn
}

/**
 * Returns the best trade for the token in to the exact amount of token out
 */
let bestTradeExactOut: Trade | null = null

export function useTradeExactOut (
  currencyIn?: Token,
  currencyAmountOut?: TokenAmount,
  swapDelay?: SwapDelay,
  onSetSwapDelay?: (swapDelay: SwapDelay) => void
): Trade | null {
  const allowedPairs = useAllCommonPairs(
    currencyIn,
    currencyAmountOut?.token
  )
  bestTradeExactOut = useMemo(() => {
    if (currencyAmountOut == null) return null
    if (
      swapDelay !== SwapDelay.USER_INPUT_COMPLETE &&
      swapDelay !== SwapDelay.SWAP_REFRESH
    ) {
      return bestTradeExactOut
    }
    if (swapDelay !== SwapDelay.SWAP_REFRESH && (onSetSwapDelay != null)) {
      onSetSwapDelay(SwapDelay.SWAP_COMPLETE)
    }
    if ((currencyIn != undefined) && currencyAmountOut && allowedPairs.length > 0) {
      return (
        Trade.bestTradeExactOut(allowedPairs, currencyIn, currencyAmountOut, {
          maxHops: 3,
          maxNumResults: 1
        })[0] ?? null
      )
    }
    return null
  }, [allowedPairs, currencyIn, currencyAmountOut, onSetSwapDelay, swapDelay])

  return bestTradeExactOut
}
