import { Token, ChainId } from '@monadex/sdk'

export function useAllTokens (chainId?: ChainId): { [address: string]: Token } {
    const allTokens = useCombinedActiveList()
    return useTokensFromMap(allTokens, true, chainId)
}