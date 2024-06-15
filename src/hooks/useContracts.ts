import { Contract } from '@ethersproject/contracts'
import { getContract, useWalletData } from '@/utils'
// import { Web3Provider } from '@ethersproject/providers'
import { MULTICALL_ADDRESS, ROUTER_ADDRESS, RAFFLE_ADDRESS } from '@/constants'
import MonadexV1RouterABI from '../constants/abi/JSON/MonadexV1Router.json'
import ERC20_ABI from '../constants/abi/JSON/Erc20Abi.json'
import RAFFLE_ABI from '@/constants/abi/JSON/MonadexV2Raffle.json'
import MULTICALL_ABI from '../constants/abi/JSON/MulticallAbi.json'
import MONADEXV1PAIR_ABI from '@/constants/abi/JSON/MonadexV1Pair.json'
import { useMemo } from 'react'
import { useWallets } from '@web3-onboard/react'
import { ethers } from 'ethers'
import { erc20Abi_bytes32 } from 'viem'
import { ChainId, WMND } from '@monadex/sdk'

/**
 * @todo Verfiy that this works
 * @param address
 * @param ABI
 * @param withSignerIfPossible
 * @returns Contract Refactored to sync function instead of async with useWallet instead of connectWallet
 */
export function useContract (address: string | undefined, ABI: any, withSignerIfPossible = true): Contract | null | undefined {
  const {account, chainId, provider:library } = useWalletData()
    return useMemo(() => {
      if (address === undefined || ABI === undefined || library === undefined) return null
      try {
        return getContract(address, ABI, library, withSignerIfPossible && (account !== undefined) ? account : undefined)
      } catch (error) {
        console.error('Failed to get contract', error)
        return null
      }
    }, [address, ABI, library, withSignerIfPossible, account])
}

export function useContracts (addresses: string[] | undefined, ABI: any, withSignerIfPossible = true): Contract[] | null | undefined {
  const {account, chainId, provider:library } = useWalletData()
    return useMemo(() => {
      if (addresses === undefined || ABI === undefined || library === undefined) return null
      return addresses.map((address) => {
        if (addresses === undefined) return null
        return getContract(address, ABI, library, withSignerIfPossible && (account !== undefined) ? account : undefined)
      }) as Contract[]
    }, [addresses, ABI, library, withSignerIfPossible, account])
  }


// update to monad testnet
export function useMulticallContract (): Contract | null | undefined {
  const chainId = ChainId.SEPOLIA as ChainId
  return useContract(chainId === ChainId.SEPOLIA ? MULTICALL_ADDRESS : undefined, MULTICALL_ABI, false)
}
export function useRouterContract (): Contract | null | undefined {
  const  {chainId, account} = useWalletData()
  return useContract(
    chainId === ChainId.SEPOLIA ? ROUTER_ADDRESS : undefined,
    MonadexV1RouterABI,
    Boolean(account)
  )
}
export function useTokenContract (tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null | undefined {
  return useContract(tokenAddress, ERC20_ABI, withSignerIfPossible) as any | null
}
export function useBytes32TokenContract (tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null | undefined {
  return useContract(tokenAddress, erc20Abi_bytes32, withSignerIfPossible)
}
export function useWMNDContract (
  withSignerIfPossible?: boolean
): Contract | null {
  const { chainId } = useWalletData()
  return useContract(
    (chainId !== null) ? WMND[chainId].address : undefined,
    ERC20_ABI, // change the abi to WMND_ABI
    withSignerIfPossible
  ) as Contract
}
export function usePairContract (pairAddress?: string, withSignerIfPossible?: boolean): Contract | null | undefined {
  return useContract(pairAddress, MONADEXV1PAIR_ABI, withSignerIfPossible)
}
export function useRaffleContract (): Contract | null | undefined {
  const  {chainId} = useWalletData()
  return useContract( chainId === ChainId.SEPOLIA ? RAFFLE_ADDRESS : undefined,RAFFLE_ABI, true)

}