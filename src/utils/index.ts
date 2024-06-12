import { BigNumber } from '@ethersproject/bignumber'
import { AddressZero } from '@ethersproject/constants'
import { getAddress } from '@ethersproject/address'

import { Contract } from '@ethersproject/contracts'
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers'
import { ChainId, CurrencyAmount, JSBI, Percent, TokenAmount } from '@monadex/sdk'
import { isAddress as isViemAddress } from 'viem'
import truncateEthAddress from 'truncate-eth-address'
import { useWallets } from '@web3-onboard/react'
// import { TokenAddressMap } from '../state/lists/hooks'

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress (address: string, chars = 4): string {
  const parsed = isAddress(address)
  if (!parsed) { // eslint-disable-line
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }
  return truncateEthAddress(address)
}

export function isAddress (value: any): string | false {
  try {
    return getAddress(value)
  } catch {
    return false
  }
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
  if (!isViemAddress(address) || address === AddressZero) {
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

export function useWalletData (): {
  account: string
  chainId: ChainId
  provider: Web3Provider
} {
  const walletData = useWallets()[0]
  const chainId = Number(walletData?.chains[0]?.id) as ChainId
  const account = walletData?.accounts[0]?.address
  const lib = walletData?.provider
  const provider = new Web3Provider(lib, 'any')
  return {
    account,
    chainId,
    provider
  }
}

export function formatTokenAmount (
  amount?: TokenAmount | CurrencyAmount,
  digits = 3
): any {
  if (amount === undefined) return '-'
  const amountStr = amount.toExact()
  if (Math.abs(Number(amountStr)) > 1) {
    return Number(amountStr).toLocaleString('us')
  }
  return amount.toSignificant(digits)
}
export function calculateGasMarginBonus (value: BigNumber): BigNumber {
  return value.mul(BigNumber.from(2))
}

export function getFormattedPrice (price: number): string {
  if (price < 0.001 && price > 0) {
    return '<0.001'
  } else if (price > -0.001 && price < 0) {
    return '>-0.001'
  } else {
    const beforeSign = price > 0 ? '+' : ''
    return beforeSign + price.toLocaleString('us')
  }
}

export function getFormattedPercent (percent: number): string {
  if (percent < 0.001 && percent > 0) {
    return '<+0.001%'
  } else if (percent > -0.001 && percent < 0) {
    return '>-0.001%'
  } else if (percent > 10000) {
    return '>+10000%'
  } else if (percent < -10000) {
    return '<-10000%'
  } else {
    const beforeSign = percent > 0 ? '+' : ''
    return beforeSign + percent.toLocaleString('us') + '%'
  }
}
