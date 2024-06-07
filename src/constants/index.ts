import { TokenList } from '@uniswap/token-lists'
import { Percent, ERC20ABI, ChainId, Token, WMND, JSBI } from '@monadex/sdk'
import { Interface } from '@ethersproject/abi'
import { Hash } from 'viem'
export const ZERO_PERCENT = new Percent('0')
export const ONE_HUNDRED_PERCENT = new Percent('1')
export const ROUTER_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D' as Hash // fake address todo : update
export const ERC20_INTERFACE = new Interface(ERC20ABI)
export const MULTICALL_ADDRESS = '0xeefba1e63905ef1d7acba5a8513c70307c1ce441' as Hash // fake address todo : update
export const FACTORY_ADDRESS = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f' as Hash // fake address todo : update
export const RAFFLE_ADDRESS = '0x6c4e7a7f6b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b' as Hash // fake address todo : update
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

export interface TokenData {
  name: string
  symbol: string
  address: string
  decimals: number
}
// fake data just for test please change it
export const DEFAULT_TOKEN_LIST: string[] = []
export const UNSUPPORTED_LIST_URLS: string[] = []
export const MONADEX_TOKEN_LIST: TokenList | TokenList[] = [] // token list = list of tokens supported offcially by monadex

// let's add some tokens in eth-sepolia for test purposes // USDC - ETH
export const MNDX: { [chainid: number]: Token } = []
export const USDC: { [chainid: number]: Token } = []
// -

export const BASES_TO_TRACK_LIQUIDITY_FOR: {
  [ChainId: number]: Token[]
} = {
  [ChainId.MONAD_TESTNET]: [
    WMND[ChainId.MONAD_TESTNET]
    // ...other tokens to track
  ],
  [ChainId.MONAD]: [
    WMND[ChainId.MONAD]

    // ...other tokens to track
  ],
  [ChainId.SEPOLIA]: [
    WMND[ChainId.SEPOLIA],
    USDC[ChainId.SEPOLIA],
    MNDX[ChainId.SEPOLIA]
  ],
  [ChainId.LOCAL]: [WMND[ChainId.LOCAL]]

}

// MONADEX_PINNED_PAIRS  => Mains Pairs pinned by default on the tokenlist page

export const MONADEX_PINNED_PAIRS: { [chainid: number]: Array<[Token, Token]> } = {
  [ChainId.MONAD_TESTNET]: [
    [WMND[ChainId.MONAD_TESTNET], USDC[ChainId.MONAD_TESTNET]]
    // ...other pairs to pin on the list by default
  ]
}

export enum RouterTypes {
  MONADEX = 'MONADEX',
  SMART = 'SMART'

}

export enum SmartRouter {
  MONADEX = 'MONADEX',

}
