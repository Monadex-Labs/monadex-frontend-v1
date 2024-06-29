import { Token, NativeCurrency, Pair } from '@monadex/sdk'
import { wrappedCurrency } from '@/utils/wrappedCurrency'
import { useWalletData } from '@/utils'
import { useMemo } from 'react'
import { AddLiquidity } from '@/constants/types/types'
import { Web3Provider } from '@ethersproject/providers'
import { useRouterContract, useFactoryContract } from '@/hooks/useContracts'
import { Contract } from '@ethersproject/contracts'
/**
     * @notice Gets the pool address from the specified token combination. Returns
     * address 0 if no pool exists.
     * @param _tokenA The first token in the combination.
     * @param _tokenB The second token in the combination.
     * @return The pool address.
     */

export class PairV1Monadex extends Pair {
  // createPool() {
  //   // implementation here
  // }

  // Promise<Array<string | undefined>>
  public static async getPoolAddress(
    pairAddresses: Array<Array<Token | undefined>>,
    factoryContract: Contract // Adjust the type as per useFactoryContract return type
  ): Promise<Array<string | undefined>> {
    const { provider } = useWalletData()
    const y:string[] | undefined = []
    try {
        pairAddresses.map(async ([tokenA, tokenB]) => {
          if (tokenA && tokenB && !tokenA.equals(tokenB)) {
            const signer = factoryContract.connect(provider as Web3Provider)
            const address = await signer?.getTokenPairToPool(tokenA.address, tokenB.address);
            y.push(address)
          }
          
        })
        return y
      } catch (error: any) {
      console.error(error);
      return pairAddresses.map(() => undefined);
    }
  }


  public static async getStaticLpData(liquidity: AddLiquidity): Promise<{
    amount0: string,
    amount1: string,
    lpTokensMinted: string
  }> {
    const { provider } = useWalletData()
    const router = useRouterContract()?.connect(provider as Web3Provider)

    // Assuming staticCall is correctly implemented and returns the required data
    const staticLpData = await router?.addLiquidity.staticCall(liquidity)
    const { amount0, amount1, lpTokensMinted } = staticLpData
    
    return { amount0, amount1, lpTokensMinted }
  }
}