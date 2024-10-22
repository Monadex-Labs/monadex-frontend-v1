'use client'
import { BigNumber } from '@ethersproject/bignumber'
import { AddressZero } from '@ethersproject/constants'
import { getAddress } from '@ethersproject/address'

import { Contract } from '@ethersproject/contracts'
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers'
import { ChainId, CurrencyAmount, JSBI, ETH, Percent, TokenAmount, Token, NativeCurrency } from '@monadex/sdk'
import { isAddress as isViemAddress } from 'viem'
import truncateEthAddress from 'truncate-eth-address'
import { useWallets } from '@web3-onboard/react'
import { SUPPORTED_CHAINIDS, GlobalData, MIN_NATIVE_CURRENCY_FOR_GAS } from '@/constants'
import { ethers } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import { TokenAddressMap } from '@/state/list/hooks'
import { GET_BLOCKS } from '@/apollo/queries'
import { blockClient } from '@/apollo/client'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'

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

export function currencyId (currency: Token | NativeCurrency): string {
  if (currency === ETH) return 'ETH'
  if (currency instanceof Token) return currency.address
  throw new Error('invalid currency')
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
  if (account !== undefined && account != null && account !== '') {
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

export interface WalletData {
  account: string
  chainId: ChainId
  findProvider: Web3Provider | undefined
  isConnected: boolean
  signer: JsonRpcSigner | undefined
  provider: Web3Provider | undefined
  networkName: string | undefined
}

export function useWalletData (): WalletData {
  const walletData = useWallets()[0]
  const chainId = Number(walletData?.chains[0]?.id) as ChainId
  const account = walletData?.accounts[0]?.address

  const [provider, setProvider] = useState<Web3Provider>()
  const [signer, setSigner] = useState<JsonRpcSigner>()
  const [networkName, setNetwork] = useState<string>()

  useEffect(() => {
    if (walletData == null) return
    if (walletData?.provider == null) return
    const ethersProvider = new ethers.providers.Web3Provider(walletData.provider, 'any')
    setSigner(ethersProvider.getSigner())
    setProvider(ethersProvider)
  }, [chainId, walletData])

  useCallback(async (): Promise<void> => {
    const network = await provider?.getNetwork()
    if (network != null) {
      setNetwork(network.name || 'UNKNOWN NETWORK')
    }
  }, [chainId, provider, walletData])

  const isConnected = walletData?.accounts.length > 0
  return {
    account,
    chainId,
    findProvider: provider,
    isConnected,
    signer,
    provider,
    networkName
  }
}
export function isTokensOnList (
  defaultTokens: TokenAddressMap,
  currencies: Array<NativeCurrency | Token | undefined>,
  chainId: ChainId
): boolean[] {
  return currencies.map((currency) => {
    if (currency === ETH) return true

    return Boolean(
      currency instanceof Token &&
        defaultTokens[currency.chainId]?.[currency.address]
    )
  })
}
export function formatNumber (
  unformatted: number | string | undefined,
  showDigits = 2
): string | 0 {
  // get fraction digits for small number
  if (!unformatted) return 0
  const absNumber = Math.abs(Number(unformatted))
  if (absNumber > 0) {
    const digits = Math.ceil(Math.log10(1 / absNumber))
    if (digits < 3) {
      return Number(unformatted).toLocaleString('us')
    } else {
      return Number(unformatted).toFixed(digits + showDigits)
    }
  } else {
    return 0
  }
}
export function formatTokenAmount (
  amount?: TokenAmount | CurrencyAmount,
  digits = 3
): string {
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
export function useIsSupportedNetwork (): boolean {
  const { chainId } = useWalletData()
  const checkInclude = SUPPORTED_CHAINIDS.includes(chainId)
  if (checkInclude) {
    return true
  } else {
    return false
  }
}

/**
 * Given the price impact, get user confirmation.
 *
 * @param priceImpactWithoutFee price impact of the trade without the fee.
 */
export function confirmPriceImpactWithoutFee (
  priceImpactWithoutFee: Percent
): boolean {
  if (
    !priceImpactWithoutFee.lessThan(
      GlobalData.percents.PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN
    )
  ) {
    return (
      window.prompt(
        `This swap has a price impact of at least {{ priceImpact }}%. Please type the word 'confirm' to continue with this swap : ${GlobalData.percents.PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN.toFixed(0)}`
      ) === 'confirm'
    )
  } else if (
    !priceImpactWithoutFee.lessThan(
      GlobalData.percents.ALLOWED_PRICE_IMPACT_HIGH
    )
  ) {
    return window.confirm(
     `confirm SwapPrice Impact : ${GlobalData.percents.PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN.toFixed(0)}`
    )
  }
  return true
}
export function maxAmountSpend (
  chainId: ChainId,
  currencyAmount?: CurrencyAmount
): CurrencyAmount | undefined {
  if (currencyAmount == null) return undefined
  if (currencyAmount?.currency === ETH) {
    if (
      JSBI.greaterThan(currencyAmount.raw, MIN_NATIVE_CURRENCY_FOR_GAS[chainId])
    ) {
      return CurrencyAmount.ether(
        JSBI.subtract(currencyAmount.raw, MIN_NATIVE_CURRENCY_FOR_GAS[chainId])
      )
    } else {
      return CurrencyAmount.ether(JSBI.BigInt(0))
    }
  }
  return currencyAmount
}

export function halfAmountSpend (
  chainId: ChainId,
  currencyAmount?: CurrencyAmount | TokenAmount
): CurrencyAmount | TokenAmount | undefined {
  if (currencyAmount == null) return undefined
  const halfAmount = JSBI.divide(currencyAmount?.raw, JSBI.BigInt(2))
  if (currencyAmount?.currency === ETH) {
    if (JSBI.greaterThan(halfAmount, MIN_NATIVE_CURRENCY_FOR_GAS[chainId])) {
      return CurrencyAmount.ether(halfAmount)
    } else {
      return CurrencyAmount.ether(JSBI.BigInt(0))
    }
  }
  return new TokenAmount(currencyAmount?.currency as Token, halfAmount)
}
export function useSwitchNetwork (): {
  switchNetwork: () => Promise<void>
} {
  const { provider, chainId } = useWalletData()

  const switchNetwork = useCallback(async () => {
    if ((provider == null) || !chainId) {
      console.log('Provider or chainId is missing')
      return
    }

    console.log('Attempting to switch network to:', `0x${Number(ChainId.SEPOLIA).toString(16)}`)

    try {
      await window.ethereum?.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${Number(ChainId.SEPOLIA).toString(16)}` }]
      })
      console.log('Network switched successfully')
    } catch (switchError: any) {
      console.log('Error switching network:', switchError)

      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        console.log('Chain not found. Adding new chain...')
        try {
          await window.ethereum?.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${Number(ChainId.SEPOLIA).toString(16)}`, // Update with the actual chain ID
              rpcUrls: ['https://base-sepolia-rpc.publicnode.com'], // Update with the actual RPC URL for Monad
              chainName: 'Base sepolia', // Provide a name for the network
              nativeCurrency: {
                name: 'Ether',
                symbol: 'ETH',
                decimals: 18
              },
              blockExplorerUrls: ['https://explorer-sepolia.etherscan.io'] // Update with the actual block explorer URL for Monad
            }]
          })
          console.log('New chain added successfully')
        } catch (addError: any) {
          console.error('Error adding new chain:', addError)
        }
      }
    }
  }, [provider, chainId])

  useEffect(() => {
    if ((provider != null) && chainId) {
      switchNetwork()
    }
  }, [provider, chainId, switchNetwork])

  return { switchNetwork }
}

export async function splitQuery (query: any, localClient: ApolloClient<NormalizedCacheObject>, vars: any, list: any, skipCount = 100) {
  let fetchedData = {}
  let allFound = false
  let skip = 0

  while (!allFound) {
    let end = list.length
    if (skip + skipCount < list.length) {
      end = skip + skipCount
    }
    const sliced = list.slice(skip, end)
    const result = await localClient.query({
      query: query(...vars, sliced),
      fetchPolicy: 'cache-first'
    })
    fetchedData = {
      ...fetchedData,
      ...result.data
    }
    if (Object.keys(result.data).length < skipCount || skip + skipCount > list.length) {
      allFound = true
    } else {
      skip += skipCount
    }
  }

  return fetchedData
}

/**
 * @notice Fetches block objects for an array of timestamps.
 * @dev blocks are returned in chronological order (ASC) regardless of input.
 * @dev blocks are returned at string representations of Int
 * @dev timestamps are returns as they were provided; not the block time.
 * @param {Array} timestamps
 */
export async function getBlocksFromTimestamps (timestamps: any, skipCount = 500) {
  if (timestamps?.length === 0) {
    return []
  }

  const fetchedData: any = await splitQuery(GET_BLOCKS, blockClient, [], timestamps, skipCount)

  const blocks = []
  if (fetchedData) {
    for (const t in fetchedData) {
      if (fetchedData[t].length > 0) {
        blocks.push({
          timestamp: t.split('t')[1],
          number: fetchedData[t][0].number
        })
      }
    }
  }
  return blocks
}
