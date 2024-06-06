import { ChainId, Pair, Token } from '@monadex/sdk'
import {
  addSerializedPair,
  addSerializedToken,
  removeSerializedToken,
  SerializedPair,
  SerializedToken,
  updateUserDeadline,
  updateUserSlippageTolerance,
  toggleURLWarning
} from './actions'
import { useCallback, useMemo, useEffect } from 'react'
import flatMap from 'lodash.flatmap'
import { AppDispatch, AppState } from '../store'
import { useAllTokens } from '@/hooks/Tokens'
import { useSelector } from 'react-redux'
// import { useWallets } from '@web3-onboard/react' // check if its works

export function serializeToken (token: Token): SerializedToken {
  return {
    chainId: token.chainId,
    address: token.address,
    decimals: token.decimals,
    symbol: token.symbol,
    name: token.name
  }
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
export function useUserAddedTokens (): Token[] {
  // const chainId = useWallets()[0]?.chains[0]?.id
  const chainId = ChainId.SEPOLIA
  const serializedTokensMap = useSelector<AppState, AppState['user']['tokens']>(
    ({ user: { tokens } }) => tokens
  )

  return useMemo(() => {
    if (chainId === undefined) return []
    return Object.values(serializedTokensMap[chainId as ChainId] ?? {}).map(
      deserializeToken
    )
  }, [serializedTokensMap, chainId])
}
