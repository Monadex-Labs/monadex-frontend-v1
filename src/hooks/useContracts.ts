import { Contract } from '@ethersproject/contracts'
import { getContract } from '@/utils'
// import { Web3Provider } from '@ethersproject/providers'
import { MULTICALL_ADDRESS, ROUTER_ADDRESS } from '@/constants'
import MonadexV1RouterABI from '../constants/abi/JSON/MonadexRouterV1.json'
import ERC20_ABI from '../constants/abi/JSON/Erc20Abi.json'
import MULTICALL_ABI from '../constants/abi/JSON/MulticallAbi.json'
import { useMemo } from 'react'
import { useWallets } from '@web3-onboard/react'
import { ethers } from 'ethers'
import { erc20Abi_bytes32 } from 'viem'
import { ChainId } from '@monadex/sdk'

/**
 * @todo Verfiy that this works
 * @param address
 * @param ABI
 * @param withSignerIfPossible
 * @returns Contract Refactored to sync function instead of async with useWallet instead of connectWallet
 */
export function useContract (address: string | undefined, ABI: any, withSignerIfPossible = true): Contract | null | undefined {
  // const wallet = web3Onboard.connectWallet()
  const wallet = useWallets()[0]?.provider
  const account = useWallets()[0]?.accounts[0]?.address
  if (wallet !== null) {
    const library = new ethers.providers.Web3Provider(
      wallet as any,
      'any'
    )
    return useMemo(() => {
      if (address === undefined || ABI === undefined || wallet === undefined) return null
      try {
        return getContract(address, ABI, library, withSignerIfPossible && (account !== undefined) ? account : undefined)
      } catch (error) {
        console.error('Failed to get contract', error)
        return null
      }
    }, [address, ABI, library, withSignerIfPossible, account])
  }
}

export function useContracts (addresses: string[] | undefined, ABI: any, withSignerIfPossible = true): Contract[] | null | undefined {
  const wallet = useWallets()[0]?.provider
  const account = useWallets()[0]?.accounts[0]?.address
  if (wallet !== null) {
    const library = new ethers.providers.Web3Provider(
      wallet as any,
      'any'
    )
    return useMemo(() => {
      if (addresses === undefined || ABI === undefined || library === undefined) return null
      return addresses.map((address) => {
        if (addresses === undefined) return null
        return getContract(address, ABI, library, withSignerIfPossible && (account !== undefined) ? account : undefined)
      }) as Contract[]
    }, [addresses, ABI, library, withSignerIfPossible, account])
  }
}

// update to monad testnet
export function useMulticallContract (): Contract | null | undefined {
  const chainId = ChainId.SEPOLIA as ChainId
  return useContract(chainId === ChainId.SEPOLIA ? MULTICALL_ADDRESS : undefined, MULTICALL_ABI, false)
}
export function useRouterContract (): Contract | null | undefined {
  const chainId = ChainId.SEPOLIA as ChainId
  const account = useWallets()[0]?.accounts[0]?.address
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

// export function usePairContract (pairAddress?: string, withSignerIfPossible?: boolean): Contract | null {
//   return useContract(pairAddress, IUniswapV2PairABI, withSignerIfPossible)
// }
