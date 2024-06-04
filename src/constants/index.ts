import { Percent, ERC20ABI, ChainId, Token, WMND} from '@monadex/sdk'
import { Interface } from '@ethersproject/abi'
import { Hash } from 'viem'
export const ZERO_PERCENT = new Percent('0')
export const ONE_HUNDRED_PERCENT = new Percent('1')
export const ROUTER_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D' as Hash
export const ERC20_INTERFACE = new Interface(ERC20ABI)
// default allowed slippage, in bips
export const INITIAL_ALLOWED_SLIPPAGE = 50
// 20 minutes, denominated in seconds
export const DEFAULT_DEADLINE_FROM_NOW = 60 * 20

// a list of tokens by chain
type ChainTokenList = { 
  readonly [chainId in ChainId]: Token[]
}

const WMND_ONLY: ChainTokenList = {
  [ChainId.MONAD_TESTNET]: [WMND[ChainId.MONAD_TESTNET]],
  [ChainId.MONAD]: [WMND[ChainId.MONAD]],
  [ChainId.SEPOLIA]: [WMND[ChainId.SEPOLIA]],
  [ChainId.LOCAL]: [WMND[ChainId.LOCAL]]

}
