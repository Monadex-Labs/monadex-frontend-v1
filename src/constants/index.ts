import { Percent, ERC20ABI, ChainId, Token, WMND, JSBI } from '@monadex/sdk'
import { Interface } from '@ethersproject/abi'
import { Hash } from 'viem'
export const ZERO_PERCENT = new Percent('0')
export const ONE_HUNDRED_PERCENT = new Percent('1')
export const ROUTER_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D' as Hash // fake address todo : update
export const ERC20_INTERFACE = new Interface(ERC20ABI)
export const MULTICALL_ADDRESS = '0xeefba1e63905ef1d7acba5a8513c70307c1ce441' as Hash // fake address todo : update
// default allowed slippage, in bips
export const INITIAL_ALLOWED_SLIPPAGE = 50
// 20 minutes, denominated in seconds
export const DEFAULT_DEADLINE_FROM_NOW = 60 * 20

// a list of tokens by chain
type ChainTokenList = {
  readonly [chainId in ChainId]: Token[]
}

export const WMND_ONLY: ChainTokenList = {
  [ChainId.MONAD_TESTNET]: [WMND[ChainId.MONAD_TESTNET]],
  [ChainId.MONAD]: [WMND[ChainId.MONAD]],
  [ChainId.SEPOLIA]: [WMND[ChainId.SEPOLIA]],
  [ChainId.LOCAL]: [WMND[ChainId.LOCAL]]

}
// one basis point
export const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000))
export const BIPS_BASE = JSBI.BigInt(10000)

// used for warning states
export const ALLOWED_PRICE_IMPACT_LOW: Percent = new Percent(JSBI.BigInt(100), BIPS_BASE) // 1%
export const ALLOWED_PRICE_IMPACT_MEDIUM: Percent = new Percent(JSBI.BigInt(300), BIPS_BASE) // 3%
export const ALLOWED_PRICE_IMPACT_HIGH: Percent = new Percent(JSBI.BigInt(500), BIPS_BASE) // 5%
// for non expert mode disable swaps above this
export const BLOCKED_PRICE_IMPACT_NON_EXPERT: Percent = new Percent(JSBI.BigInt(1500), BIPS_BASE) // 15%
