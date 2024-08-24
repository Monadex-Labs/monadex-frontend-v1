import { ChainId, Pair, Token } from '@monadex/sdk'
import {
  addSerializedPair,
  addSerializedToken,
  removeSerializedToken,
  SerializedPair,
  SerializedToken,
  updateUserDeadline,
  updateUserSlippageTolerance,
  updateSlippageManuallySet,
  toggleURLWarning
} from './actions'
import { useCallback, useMemo } from 'react'
import flatMap from 'lodash.flatmap'
import { AppDispatch, AppState } from '../store'
import { useAllTokens } from '@/hooks/Tokens'
import { useSelector, useDispatch } from 'react-redux'
import { BASES_TO_TRACK_LIQUIDITY_FOR, MONADEX_PINNED_PAIRS } from '@/constants'
import { useWalletData } from '@/utils'
export function serializeToken (token: Token): SerializedToken {
  return {
    chainId: token.chainId,
    address: token.address,
    decimals: token.decimals,
    symbol: token.symbol,
    name: token.name
  }
}
// add Token to do list
export function useAddUserToken (): (token: Token) => void {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(
    (token: Token) => {
      dispatch(addSerializedToken({ serializedToken: serializeToken(token) }))
    },
    [dispatch]
  )
}
// Remove token from the list
export function useRemoveUserAddedToken (): (
  chainId: number,
  address: string,
) => void {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(
    (chainId: number, address: string) => {
      dispatch(removeSerializedToken({ chainId, address }))
    },
    [dispatch]
  )
}

function serializePair (pair: Pair): SerializedPair {
  return {
    token0: serializeToken(pair.token0),
    token1: serializeToken(pair.token1)
  }
}
export function usePairAdder (): (pair: Pair) => void {
  const dispatch = useDispatch<AppDispatch>()

  return useCallback(
    (pair: Pair) => {
      dispatch(addSerializedPair({ serializedPair: serializePair(pair) }))
    },
    [dispatch]
  )
}
function deserializeToken (serializedToken: SerializedToken): Token {
  const token = new Token(
    serializedToken.chainId,
    serializedToken.address,
    serializedToken.decimals,
    serializedToken.symbol,
    serializedToken.name
  )
  // HACK: Since we're adding default properties to the token we know its not native
  // adding these properties enables support for the new tokens in the Uniswap SDK
  const extendedToken = token as any
  extendedToken.isToken = true
  extendedToken.isNative = false

  return extendedToken
}

// the user update the slippage manually set by the protocol
export function useSlippageManuallySet (): [
  boolean,
  (manuallySetSlippage: boolean) => void,
] {
  const dispatch = useDispatch<AppDispatch>()
  const slippageManuallySet = useSelector<
  AppState,
  AppState['user']['slippageManuallySet']
  >((state) => {
    return state.user.slippageManuallySet
  })

  const setSlippageManuallySet = useCallback(
    (slippageManuallySet: boolean) => {
      dispatch(updateSlippageManuallySet({ slippageManuallySet }))
    },
    [dispatch]
  )

  return [slippageManuallySet, setSlippageManuallySet]
}

//  hook to update the slippage tolerance
export function useUserSlippageTolerance (): [
  number,
  (slippage: number) => void,
] {
  const dispatch = useDispatch<AppDispatch>()
  const userSlippageTolerance = useSelector<
  AppState,
  AppState['user']['userSlippageTolerance']
  >((state) => {
    return state.user.userSlippageTolerance
  })

  const setUserSlippageTolerance = useCallback(
    (userSlippageTolerance: number) => {
      dispatch(updateUserSlippageTolerance({ userSlippageTolerance }))
    },
    [dispatch]
  )
  return [userSlippageTolerance, setUserSlippageTolerance]
}

export function useUserAddedTokens (): Token[] {
  const { chainId } = useWalletData()
  const chainInUse = chainId ?? ChainId.SEPOLIA
  const serializedTokensMap = useSelector<AppState, AppState['user']['tokens']>(
    ({ user: { tokens } }) => tokens
  )

  return useMemo(() => {
    if (chainId === undefined) return []
    return Object.values(serializedTokensMap[chainInUse] ?? {}).map(
      deserializeToken
    )
  }, [serializedTokensMap, chainId, chainInUse])
}
export function useUserTransactionTTL (): [number, (slippage: number) => void] {
  const dispatch = useDispatch<AppDispatch>()
  const userDeadline = useSelector<AppState, AppState['user']['userDeadline']>(
    (state) => {
      return state.user.userDeadline
    }
  )

  const setUserDeadline = useCallback(
    (userDeadline: number) => {
      dispatch(updateUserDeadline({ userDeadline }))
    },
    [dispatch]
  )

  return [userDeadline, setUserDeadline]
}

export function useURLWarningToggle (): () => void {
  const dispatch = useDispatch()
  return useCallback(() => dispatch(toggleURLWarning()), [dispatch])
}

/**
 * Returns all the pairs of tokens that are tracked by the user for the current chain ID.
 */
export function useTrackedTokenPairs (): Array<[Token, Token]> {
  const chainId = ChainId.SEPOLIA // update to MONAD_TESTNET
  const tokens = useAllTokens()

  // pinned pairs by defualt on the tokenList
  const pinnedPairs = useMemo(() => (chainId ? MONADEX_PINNED_PAIRS[chainId] ?? [] : []), [chainId])

  // pairs for every token against every base
  const generatedPairs: Array<[Token, Token]> = useMemo(
    () =>
      (chainId !== undefined)
        ? flatMap(Object.keys(tokens), (tokenAddress) => {
          const token = tokens[tokenAddress]
          // for each token on the current chain,
          return (
          // loop though all bases on the current chain
            (BASES_TO_TRACK_LIQUIDITY_FOR[chainId] ?? [])
            // to construct pairs of the given token with each base
              .map((base) => {
                if (base.address === token.address) {
                  return null
                } else {
                  return [base, token]
                }
              })
              .filter((p): p is [Token, Token] => p !== null)
          )
        })
        : [],
    [tokens, chainId]
  )
  const savedSerializedPairs = useSelector<AppState, AppState['user']['pairs']>(
    ({ user: { pairs } }) => pairs
  )

  const userPairs: Array<[Token, Token]> = useMemo(() => {
    if ((chainId === undefined) || (savedSerializedPairs[chainId] === undefined)) return []
    const forChain = savedSerializedPairs[chainId]
    if ((forChain === undefined)) return []

    return Object.keys(forChain).map((pairId) => {
      return [
        deserializeToken(forChain[pairId].token0),
        deserializeToken(forChain[pairId].token1)
      ]
    })
  }, [savedSerializedPairs, chainId])

  const combinedList = useMemo(
    () => userPairs.concat(generatedPairs).concat(pinnedPairs),
    [generatedPairs, pinnedPairs, userPairs]
  )

  const filteredList = useMemo(() => {
    // dedupes pairs of tokens in the combined list
    // TODO: FIX THIS, not showing full list of pairs
    const keyed = combinedList.reduce<{ [key: string]: [Token, Token] }>(
      (memo, [tokenA, tokenB]) => {
        const sorted = tokenA.sortsBefore(tokenB)
        const key = sorted
          ? `${tokenA.address}:${tokenB.address}`
          : `${tokenB.address}:${tokenA.address}`
        if (memo[key] != null) return memo
        memo[key] = sorted ? [tokenA, tokenB] : [tokenB, tokenA]
        return memo
      },
      {}
    )
    return Object.keys(keyed).map((key) => keyed[key])
  }, [combinedList])

  return filteredList
}

/**
 * Given two tokens return the liquidity token that represents its liquidity shares
 * @param tokenA one of the two tokens
 * @param tokenB the other token
 */
export function toV2LiquidityToken ([tokenA, tokenB]: [Token, Token]): Token {
  return new Token(
    tokenA.chainId,
    Pair.getAddress(tokenA, tokenB),
    18,
    'MND-V2',
    'Monadex V2'
  )
}
