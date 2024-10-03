import { TokenList } from '@uniswap/token-lists'
import { Percent, ERC20ABI, ChainId, Token, WMND, JSBI } from '@monadex/sdk'
import { Interface } from '@ethersproject/abi'
// import { Hash } from 'viem'

// constants used internally but not expected to be used externally
export const NEGATIVE_ONE = JSBI.BigInt(-1)
export const ZERO = JSBI.BigInt(0)
export const ONE = JSBI.BigInt(1)

export const ZERO_PERCENT = new Percent('0')
export const ONE_HUNDRED_PERCENT = new Percent('1')

export const ERC20_INTERFACE = new Interface(ERC20ABI)
export const MULTICALL_ADDRESS = '0x52b4919fD23C7266D042615Ce5BAaac5B03Bf218'
export const FACTORY_ADDRESS = '0x5f1498f06d631f010183D5DE08Af835c60eB1cd2'
export const ROUTER_ADDRESS = '0x89831AED10991214D3Bd417FF0E97E5e876bE8dD'
export const RAFFLE_ADDRESS = '0x50986028fd38c3fbB7ce47b3d21F556C03f31d34'

export const INIT_CODE_HASH = '0x8009c475872d4440952067a3d491713f4a820605f565f899d722ca2b3e196d05'

// default allowed slippage, in bips
export const INITIAL_ALLOWED_SLIPPAGE = 0
export const SLIPPAGE_AUTO = 0
// 20 minutes, denominated in seconds
export const DEFAULT_DEADLINE_FROM_NOW = 60 * 20
// a list of tokens by chain
type ChainTokenList = {
  readonly [chainId in ChainId]: Token[]
}
interface AddressMap { [chainId: number]: string }
export const WMND_ONLY: ChainTokenList = {
  [ChainId.MONAD_TESTNET]: [WMND[ChainId.MONAD_TESTNET]],
  [ChainId.MONAD]: [WMND[ChainId.MONAD]],
  [ChainId.SEPOLIA]: [WMND[ChainId.SEPOLIA]],
  [ChainId.LOCAL]: [WMND[ChainId.LOCAL]]

}
export const V1_ROUTER_ADDRESS: AddressMap = {
  [ChainId.SEPOLIA]: '0x89831AED10991214D3Bd417FF0E97E5e876bE8dD'
  // add chain.monad testnet and monad here
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


export const UNSUPPORTED_LIST_URLS: string[] = []
export const MONADEX_TOKEN_LIST: TokenList | TokenList[] = [] // token list = list of tokens supported offcially by monadex
export const DEFAULT_TOKEN_LIST_URL: string = 'https://dani3.com/assets/docs/list.json' // TODO: Publish MONAD json file, extract to env and change URL

export const WHITELISTED_ADDRESSES:string[] = [
  // enter WL addresses...
]

// let's add some tokens in eth-sepolia for test purposes // USDC - ETH
export const MNDX: { [chainid: number]: Token } = {
  [ChainId.SEPOLIA]: new Token(
    ChainId.SEPOLIA,
    '0xe7Ac0E38a0bAAFeb3e5cBa94E2fbAE44511D0F8A',
    18,
    'MDX',
    'Monadex token'
  )
}
export const USDC: { [chainid: number]: Token } = {
  [ChainId.SEPOLIA]: new Token(
    ChainId.SEPOLIA,
    '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    6,
    'USDC',
    'USD Coin'
  )
}
// -
export const SUPPORTED_CHAINIDS = [
  ChainId.SEPOLIA,
  ChainId.MONAD,
  ChainId.MONAD_TESTNET
]

export const GlobalData = {
  stableCoins: {
    [ChainId.SEPOLIA]: [
      USDC[ChainId.SEPOLIA]
      // ...other stabletokens to track
    ],
    [ChainId.MONAD_TESTNET]: [
      USDC[ChainId.SEPOLIA]
      // ...other stabletokens to track
    ],
    [ChainId.MONAD]: [
      USDC[ChainId.SEPOLIA]
      // ...other stabletokens to track
    ],

    [ChainId.LOCAL]: [USDC[ChainId.LOCAL]]
  },
  percents: {
    ALLOWED_PRICE_IMPACT_LOW: new Percent( // used for warning states
      JSBI.BigInt(100),
      BIPS_BASE
    ), // 1%
    ALLOWED_PRICE_IMPACT_MEDIUM: new Percent(
      JSBI.BigInt(300),
      BIPS_BASE
    ), // 3%
    ALLOWED_PRICE_IMPACT_HIGH: new Percent(
      JSBI.BigInt(500),
      BIPS_BASE
    ), // 5%
    PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN: new Percent( // if the price slippage exceeds this number, force the user to type 'confirm' to execute
      JSBI.BigInt(1000),
      BIPS_BASE
    ), // 10%
    BLOCKED_PRICE_IMPACT_NON_EXPERT: new Percent( // for non expert mode disable swaps above this
      JSBI.BigInt(1500),
      BIPS_BASE
    ) // 15%
  },
  utils: {
    DEFAULT_DEADLINE_FROM_NOW: 60 * 20 // 20 minutes, denominated in seconds
  }
}

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

export const MONADEX_PINNED_PAIRS: { [chainid: number]: Array<[Token, Token, Token]> } = {
  [ChainId.SEPOLIA]: [
    [
      WMND[ChainId.SEPOLIA],
      USDC[ChainId.SEPOLIA],
      MNDX[ChainId.SEPOLIA]
    ]
    // ...other pairs to pin on the list by default
  ]
}

export const MIN_NATIVE_CURRENCY_FOR_GAS: {
  [chainId in ChainId]: JSBI;
} = {
  [ChainId.SEPOLIA]: JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16)), // .01 ETH
  [ChainId.MONAD_TESTNET]: JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16)), // .01 ETH
  [ChainId.MONAD]: JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16)), // .01 ETH
  [ChainId.LOCAL]: JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16)) // .01 ETH
}

export enum RouterTypes {
  MONADEX = 'MONADEX',
  SMART = 'SMART'

}

export enum SmartRouter {
  MONADEX = 'MONADEX',

}

export const BASES_TO_CHECK_TRADES_AGAINST: {
  [ChainId: number]: Token[]
} = {
  [ChainId.MONAD]: [
    WMND[ChainId.MONAD],
    USDC[ChainId.MONAD]
  ],
  [ChainId.SEPOLIA]: [
    USDC[ChainId.SEPOLIA],
    MNDX[ChainId.SEPOLIA]
  ]
}

// Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these tokens.
export const CUSTOM_BASES: {
  [ChainId: number]: { [tokenAddress: string]: Token[] } } = {}

export const RAFFLE_WL_TOKEN_ADDRESS = {
  [ChainId.SEPOLIA]: [
    '0x3444O454', // add raffle wl tokens here
    '0x3444O454'
  ]
}
