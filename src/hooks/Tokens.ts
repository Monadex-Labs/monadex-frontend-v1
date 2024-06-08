import { Token, ChainId, currencyEquals } from '@monadex/sdk'
import { parseBytes32String } from '@ethersproject/strings'
import { useMemo } from 'react'
import { useBytes32TokenContract, useTokenContract } from './useContracts'
import { NEVER_RELOAD, useSingleCallResult } from '@/state/multicall/hooks'
import { useCombinedInactiveList, useCombinedActiveList, useDefaultTokenList, TokenAddressMap } from '@/state/list/hooks'
import { useUserAddedTokens } from '@/state/user/hooks'
import { isAddress, getAddress } from 'viem'
import { arrayify } from 'ethers/lib/utils'

function useTokensFromMap (
  tokenMap: TokenAddressMap,
  includeUserAdded: boolean,
  chainIdOpt?: ChainId
): { [address: string]: Token } {
  const chainId = chainIdOpt ?? ChainId.SEPOLIA // default to sepolia UPDATE TO MONAD TESTNET
  const userAddedTokens = useUserAddedTokens()

  return useMemo(() => {
    if ((chainId === undefined) || (tokenMap[chainId] === undefined)) return {}

    // reduce to just tokens
    const mapWithoutUrls = Object.keys(tokenMap[chainId]).reduce<{ [address: string]: Token }>((newMap, address) => {
      newMap[address] = tokenMap[chainId][address].token
      return newMap
    }, {})

    if (includeUserAdded) {
      return (
        userAddedTokens
        // reduce into all ALL_TOKENS filtered by the current chain
          .reduce<{ [address: string]: Token }>(
          (tokenMap, token) => {
            tokenMap[token.address] = token
            return tokenMap
          },
          // must make a copy because reduce modifies the map, and we do not
          // want to make a copy in every iteration
          { ...mapWithoutUrls }
        )
      )
    }

    return mapWithoutUrls
  }, [chainId, userAddedTokens, tokenMap, includeUserAdded])
}
export function useAllTokens (chainId?: ChainId): { [address: string]: Token } {
  const allTokens = useCombinedActiveList()
  return useTokensFromMap(allTokens, true, chainId)
}
export function useDefaultTokens (): { [address: string]: Token } {
  const defaultList = useDefaultTokenList()
  return useTokensFromMap(defaultList, false)
}

export function useInActiveTokens (): { [address: string]: Token } {
  const inactiveTokensMap = useCombinedInactiveList()
  const inactiveTokens = useTokensFromMap(inactiveTokensMap, false)
  return inactiveTokens
}

// Check if currency is included in custom list from user storage
export function useIsUserAddedToken (currency: Token | undefined | null): boolean {
  const userAddedTokens = useUserAddedTokens()
  if (currency == null) return false
  return !(userAddedTokens.find((token) => currencyEquals(currency, token)) == null)
}

export function useIsUserAddedTokens (currencies: Token[]): boolean[] {
  const userAddedTokens = useUserAddedTokens()
  return currencies.map((currency) => !(userAddedTokens.find((token) => currencyEquals(currency, token)) == null))
}

// parse a name or symbol from a token response
const BYTES32_REGEX = /^0x[a-fA-F0-9]{64}$/

export function parseStringOrBytes32 (
  str: string | undefined,
  bytes32: string | undefined,
  defaultValue: string
): string {
  return (typeof str === 'string') && str.length > 0
    ? str // need to check for proper bytes string and valid terminator
    : (typeof bytes32 === 'string') && BYTES32_REGEX.test(bytes32) && arrayify(bytes32)[31] === 0
        ? parseBytes32String(bytes32)
        : defaultValue
}
// undefined if invalid or does not exist
// null if loading
// otherwise returns the token
export function useToken (tokenAddress?: string): Token | undefined | null {
  const chainId = ChainId.SEPOLIA
  const tokens = useAllTokens()
  const _isAddress: boolean = isAddress(tokenAddress as string)
  const address = _isAddress ? getAddress(tokenAddress as string) : undefined
  const tokenContract = useTokenContract(_isAddress ? address : undefined, false)
  const tokenContractBytes32 = useBytes32TokenContract(_isAddress ? address : undefined, false)
  const token: Token | undefined = (address !== undefined) ? tokens[address] : undefined
  const tokenName = useSingleCallResult((token !== undefined) ? undefined : tokenContract, 'name', undefined, NEVER_RELOAD)
  const tokenNameBytes32 = useSingleCallResult(
    (token !== undefined) ? undefined : tokenContractBytes32,
    'name',
    undefined,
    NEVER_RELOAD
  )
  const symbol = useSingleCallResult((token !== undefined) ? undefined : tokenContract, 'symbol', undefined, NEVER_RELOAD)
  const symbolBytes32 = useSingleCallResult((token !== undefined) ? undefined : tokenContractBytes32, 'symbol', undefined, NEVER_RELOAD)
  const decimals = useSingleCallResult((token !== undefined) ? undefined : tokenContract, 'decimals', undefined, NEVER_RELOAD)
  return useMemo(() => {
    if (token !== undefined) return token
    if (typeof chainId === 'undefined' || typeof address === 'undefined') return undefined
    if (decimals.loading || symbol.loading || tokenName.loading) return null
    if ((decimals.result !== undefined)) {
      return new Token(
        chainId as number,
        address,
        decimals.result[0],
        parseStringOrBytes32(symbol.result?.[0], symbolBytes32.result?.[0], 'UNKNOWN'),
        parseStringOrBytes32(tokenName.result?.[0], tokenNameBytes32.result?.[0], 'Unknown Token')
      )
    }
    return undefined
  }, [
    address,
    chainId,
    decimals.loading,
    decimals.result,
    symbol.loading,
    symbol.result,
    symbolBytes32.result,
    token,
    tokenName.loading,
    tokenName.result,
    tokenNameBytes32.result
  ])
}
export function useCurrency (currencyId: string | undefined): Token | null | undefined {
  const token = useToken(currencyId)
  return token
}