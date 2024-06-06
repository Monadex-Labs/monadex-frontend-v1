import { Contract } from '@ethersproject/contracts'
import { getContract } from '@/utils'
// import { Web3Provider } from '@ethersproject/providers'
import { MULTICALL_ADDRESS, ROUTER_ADDRESS } from '@/constants'
import MonadexV1RouterABI from '../constants/abi/JSON/MonadexRouterV1.json'
import ERC20_ABI from '../constants/abi/JSON/Erc20Abi.json'
import MULTICALL_ABI from '../constants/abi/JSON/MulticallAbi.json'
import { useMemo } from 'react'
import { useWallets } from '@web3-onboard/react'
import web3Onboard from '../utils/web3-onboard'
import { ethers } from 'ethers'
import { erc20Abi_bytes32 } from 'viem'
import { ChainId } from '@monadex/sdk'
/**
 * @todo Verfiy that this works
 * @param address
 * @param ABI
 * @param withSignerIfPossible
 * @returns Contract
 */
export async function useContract (address: string | undefined, ABI: any, withSignerIfPossible = true): Promise<Contract | null | undefined> {
  const wallet = await web3Onboard.connectWallet()
  const account = useWallets()[0]?.accounts[0]?.address
  if (wallet[0] !== null) {
    const library = new ethers.providers.Web3Provider(
      wallet[0].provider as any,
      'any'
    )
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
}

export async function useContracts (addresses: string[] | undefined, ABI: any, withSignerIfPossible = true): Promise<Contract[] | null | undefined> {
  const wallet = await web3Onboard.connectWallet()
  const account = useWallets()[0]?.accounts[0]?.address
  if (wallet[0] !== null) {
    const library = new ethers.providers.Web3Provider(
      wallet[0].provider as any,
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
export async function useMulticallContract (): Promise< Contract | null | undefined> {
  const chainId = ChainId.SEPOLIA as ChainId
  return await useContract(chainId === ChainId.SEPOLIA ? MULTICALL_ADDRESS : undefined, MULTICALL_ABI, false)
}
export async function useRouterContract (): Promise< Contract | null | undefined> {
  const chainId = ChainId.SEPOLIA as ChainId
  const account = useWallets()[0]?.accounts[0]?.address
  return await useContract(
    chainId === ChainId.SEPOLIA ? ROUTER_ADDRESS : undefined,
    MonadexV1RouterABI,
    Boolean(account)
  )
}
export async function useTokenContract (tokenAddress?: string, withSignerIfPossible?: boolean): Promise< Contract | null | undefined> {
  return await useContract(tokenAddress, ERC20_ABI, withSignerIfPossible) as any | null
}
export async function useBytes32TokenContract (tokenAddress?: string, withSignerIfPossible?: boolean): Promise< Contract | null | undefined> {
  return await useContract(tokenAddress, erc20Abi_bytes32, withSignerIfPossible)
}

// export function usePairContract (pairAddress?: string, withSignerIfPossible?: boolean): Contract | null {
//   return useContract(pairAddress, IUniswapV2PairABI, withSignerIfPossible)
// }
