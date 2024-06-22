import { Token, ChainId } from '@monadex/sdk'
import { Tags, TokenInfo, TokenList } from '@uniswap/token-lists'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import sortByListPriority from '@/utils/listSort'
import { DEFAULT_TOKEN_LIST_URL, UNSUPPORTED_LIST_URLS, MONADEX_TOKEN_LIST } from '@/constants/index'
import { AppState } from '@/state/store'

type TagDetails = Tags[keyof Tags]
export interface TagInfo extends TagDetails {
  id: string
}

/**
 * Token instances created from token info.
 */
export class WrappedTokenInfo extends Token {
  public readonly tokenInfo: TokenInfo
  public readonly tags: TagInfo[]

  constructor (tokenInfo: TokenInfo, tags: TagInfo[]) {
    super(tokenInfo.chainId, tokenInfo.address, tokenInfo.decimals, tokenInfo.symbol, tokenInfo.name)
    this.tokenInfo = tokenInfo
    this.tags = tags
  }

  public get logoURI (): string | undefined {
    return this.tokenInfo.logoURI
  }
}

export type TokenAddressMap = Readonly<{
  [chainId in ChainId]: Readonly<{
    [tokenAddress: string]: WrappedTokenInfo
  }>
}>

/**
 * An empty result, useful as a default.
 */
const EMPTY_LIST: TokenAddressMap = {
  [ChainId.SEPOLIA]: {},
  [ChainId.MONAD]: {},
  [ChainId.MONAD_TESTNET]: {},
  [ChainId.LOCAL]: {}
}

const listCache: WeakMap<TokenList, TokenAddressMap> | null =
  typeof WeakMap !== 'undefined' ? new WeakMap<TokenList, TokenAddressMap>() : null

export function listToTokenMap (list: TokenList): TokenAddressMap {
  const result = listCache?.get(list)
  if (result != null) return result
  // Ensure list.tokens is defined and is an array before calling reduce
  if (!Array.isArray(list.tokens)) {
    throw new Error('Invalid token list: tokens property is undefined or not an array')
  }
  const map = list.tokens.reduce<TokenAddressMap>(
    (tokenMap: any, tokenInfo: TokenInfo) => {
      const tags: TagInfo[] =
        tokenInfo.tags
          ?.map((tagId) => {
            if (list.tags?.[tagId] === undefined) return undefined
            return { ...list.tags[tagId], id: tagId }
          })
          ?.filter((x): x is TagInfo => Boolean(x)) ?? []
      const token = new WrappedTokenInfo(tokenInfo, tags)
      if (
        tokenMap &&
        tokenMap[token.chainId] &&
        tokenMap[token.chainId][token.address] !== undefined
      ) {
        return tokenMap
      }
      return {
        ...tokenMap,
        [token.chainId]: {
          ...tokenMap[token.chainId],
          [token.address]: {
            token
          }
        }
      }
    },
    { ...EMPTY_LIST }
  )
  listCache?.set(list, map)
  return map
}

// export function useAllLists (): {
//   readonly [url: string]: {
//     readonly current: TokenList | null
//     readonly pendingUpdate: TokenList | null
//     readonly loadingRequestId: string | null
//     readonly error: string | null
//   }
// } {
//   return useSelector<AppState, AppState['lists']['byUrl']>((state) => state.lists.byUrl)
// }

function combineMaps (map1: TokenAddressMap, map2: TokenAddressMap): TokenAddressMap {
  return {
    [ChainId.SEPOLIA]: { ...map1[ChainId.SEPOLIA], ...map2[ChainId.SEPOLIA] },
    [ChainId.MONAD_TESTNET]: { ...map1[ChainId.MONAD_TESTNET], ...map2[ChainId.MONAD_TESTNET] },
    [ChainId.MONAD]: { ...map1[ChainId.MONAD], ...map2[ChainId.MONAD] },
    [ChainId.LOCAL]: { ...map1[ChainId.LOCAL], ...map2[ChainId.LOCAL] }
  }
}
export function useSelectedListUrl (): string | undefined {
  return useSelector<AppState, AppState['lists']['selectedListUrl']>(
    (state) => state.lists.selectedListUrl
  )
}
export function useInactiveListUrls (chainId: number): TokenAddressMap {
  let inactiveUrl = ''
  switch (chainId) {
    case ChainId.SEPOLIA:
      inactiveUrl = DEFAULT_TOKEN_LIST_URL
      break
    case ChainId.MONAD_TESTNET:
      inactiveUrl = ''
      break
    case ChainId.MONAD:
      inactiveUrl = ''
      break
    case ChainId.LOCAL:
      inactiveUrl = ''
      break
  }
  return useTokenList(inactiveUrl)
}
export function useSelectedListInfo (): {
  current: TokenList | null
  pending: TokenList | null
  loading: boolean
} {
  const selectedUrl = useSelectedListUrl()
  const listsByUrl = useSelector<AppState, AppState['lists']['byUrl']>(
    (state) => state.lists.byUrl
  )
  const list = selectedUrl ? listsByUrl[selectedUrl] : undefined

  return {
    current: list?.current ?? null,
    pending: list?.pendingUpdate ?? null,
    loading: list?.loadingRequestId != null
  }
}
export function useAllLists (): TokenList[] {
  const lists = useSelector<AppState, AppState['lists']['byUrl']>(
    (state) => state.lists.byUrl
  )

  return useMemo(
    () =>
      Object.keys(lists)
        .map((url) => lists[url].current)
        .filter((l): l is TokenList => Boolean(l)),
    [lists]
  )
}

export function useTokenList (url: string | undefined): TokenAddressMap {
  const lists = useSelector<AppState, AppState['lists']['byUrl']>(
    (state) => state.lists.byUrl
  )
  return useMemo(() => {
    if (!url) return EMPTY_LIST
    const current = lists[url]?.current
    if (current == null) return EMPTY_LIST
    try {
      return listToTokenMap(current)
    } catch (error) {
      console.error('Could not show token list due to error', error)
      return EMPTY_LIST
    }
  }, [lists, url])
}

export function useSelectedTokenList (): TokenAddressMap {
  return useTokenList(DEFAULT_TOKEN_LIST_URL)
}
