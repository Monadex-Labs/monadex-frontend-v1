import { Token } from '@monadex/sdk'
import { useWalletData } from '@/utils'
import { useFactoryContract } from '@/hooks/useContracts'
import { useMemo } from 'react'
/**
     * @notice Gets the pool address from the specified token combination. Returns
     * address 0 if no pool exists.
     * @param _tokenA The first token in the combination.
     * @param _tokenB The second token in the combination.
     * @return The pool address.
     */

export function getTokenPairToPool (tokenA: Token, tokenB: Token): string | undefined | void {
   const factory = useFactoryContract()
    const PairAddress = useMemo(() => {
     if(tokenA && tokenB && !tokenA.equals(tokenB)) {
        
     }
  })
}