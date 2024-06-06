import { BigNumber } from '@ethersproject/bignumber'
import { AddressZero } from '@ethersproject/constants'
import { Contract } from '@ethersproject/contracts'
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers'
import { JSBI, Percent, TokenAmount } from '@monadex/sdk'
import { isAddress } from 'viem'
import truncateEthAddress from 'truncate-eth-address'
// import { TokenAddressMap } from '../state/lists/hooks'

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress (address: string, chars = 4): string {
  const parsed = isAddress(address)
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }
  return truncateEthAddress(address)
}

// add 100%
export function calculateGasMargin (value: BigNumber): BigNumber {
  return value.mul(BigNumber.from(2))
}

// converts a basis points value to a sdk percent
export function basisPointsToPercent (num: number): Percent {
  return new Percent(JSBI.BigInt(num), JSBI.BigInt(10000))
}

export function calculateSlippageAmount (value: TokenAmount, slippage: number): [JSBI, JSBI] {
  if (slippage < 0 || slippage > 10000) {
    throw Error(`Unexpected slippage value: ${slippage}`)
  }
  return [
    JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 - slippage)), JSBI.BigInt(10000)),
    JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 + slippage)), JSBI.BigInt(10000))
  ]
}

// account is not optional
export function getSigner (library: Web3Provider, account: string): JsonRpcSigner {
  return library.getSigner(account).connectUnchecked()
}

// account is optional
export function getProviderOrSigner (library: Web3Provider, account?: string): Web3Provider | JsonRpcSigner {
  if (account !== undefined && account !== null && account !== '') {
    return library.getSigner(account)
  } else {
    return library
  }
}

// account is optional
export function getContract (address: string, ABI: any, library: Web3Provider, account?: string): Contract {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }

  return new Contract(address, ABI, getProviderOrSigner(library, account) as any)
}

export function escapeRegExp (string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

// export function isTokenOnList (defaultTokens: TokenAddressMap, currency?: Token): boolean {
//   return Boolean(currency instanceof Token && defaultTokens[currency.chainId]?.[currency.address])
// }
