import { Token, ChainId } from '@monadex/sdk'
import { parseBytes32String } from '@ethersproject/strings'
import { useMemo } from 'react'
import { useBytes32TokenContract, useTokenContract } from './useContracts'
export function useAllTokens (chainId?: ChainId): { [address: string]: Token } {
    const allTokens = useCombinedActiveList()
    return useTokensFromMap(allTokens, true, chainId)
}