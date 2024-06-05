import { Contract } from '@ethersproject/contracts'
import { getContract } from '@/utils'
import { Web3Provider } from '@ethersproject/providers'
import { MULTICALL_ADDRESS, ROUTER_ADDRESS } from '@/constants'
import MonadexV1RouterABI from '../constants/abi/JSON/MonadexRouterV1.json'
import MulticallAbi from '../constants/abi/JSON/MulticallAbi.json'
export function getMulticallContract (library: Web3Provider, account?: string): Contract | null {
  return getContract(MULTICALL_ADDRESS, MulticallAbi, library, account)
}
export function getRouterContract (library: Web3Provider, account?: string): Contract {
  return getContract(ROUTER_ADDRESS, MonadexV1RouterABI, library, account)
}
