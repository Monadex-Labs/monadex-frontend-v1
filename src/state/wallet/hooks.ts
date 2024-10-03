import {
  ChainId,
  CurrencyAmount,
  ETH,
  JSBI,
  NativeCurrency,
  Token,
  TokenAmount
} from '@monadex/sdk'
import { useMemo } from 'react'
import { ERC20_INTERFACE } from '../../constants/index'
import { isAddress } from 'viem'
import { isAddress as utilsAddess, useWalletData } from '@/utils'
import {
  useMultipleContractSingleData,
  useSingleContractMultipleData
} from '../multicall/hooks'
import { useAllTokens } from '@/hooks/Tokens'
import { useMulticallContract } from '@/hooks/useContracts'
/**
 * Returns a map of the given addresses to their eventually consistent ETH balances.
 */
export function useTokenBalancesWithLoadingIndicator (
  address?: string,
  tokens?: Array<Token | undefined>
): [{ [tokenAddress: string]: TokenAmount | undefined }, boolean] {
  const validatedTokens: Token[] = useMemo(
    () =>
      tokens?.filter((t?: Token): t is Token =>
        t?.address !== undefined ? isAddress(t?.address) : false
      ) ?? [],
    [tokens]
  )
  const validatedTokenAddresses = useMemo(
    () => validatedTokens.map(vt => vt.address),
    [validatedTokens]
  )

  const balances = useMultipleContractSingleData(
    validatedTokenAddresses,
    ERC20_INTERFACE,
    'balanceOf',
    [address]
  )

  const anyLoading: boolean = useMemo(
    () => balances.some(callState => callState.loading),
    [balances]
  )
  return [
    useMemo(
      () =>
        address !== undefined && validatedTokens.length > 0
          ? validatedTokens.reduce<{
            [tokenAddress: string]: TokenAmount | undefined
          }>((memo, token, i) => {
            const value = balances?.[i]?.result?.[0]
            const amount =
              value != null ? JSBI.BigInt(value.toString()) : undefined
            if (amount !== undefined) {
              memo[token.address] = new TokenAmount(token, amount)
            }
            return memo
          }, {})
          : {},
      [address, validatedTokens, balances]
    ),
    anyLoading
  ]
}
export function useTokenBalances (
  address?: string,
  tokens?: Array<Token | undefined>
): { [tokenAddress: string]: TokenAmount | undefined } {
  return useTokenBalancesWithLoadingIndicator(address, tokens)[0]
}

export function useTokenBalance (
  account?: string,
  token?: Token
): TokenAmount | undefined {
  const tokenBalances = useTokenBalances(account, [token])
  if (token == null || token === undefined) return undefined
  return tokenBalances[token.address]
}

export function useCurrencyBalances (
  account?: string,
  currencies?: Array<NativeCurrency | Token | undefined>
): Array<CurrencyAmount | undefined> {
  const { chainId } = useWalletData()
  const chainIdToUse = chainId ?? ChainId.SEPOLIA

  const nativeCurrency = ETH
  const tokens = useMemo(
    () =>
      currencies
        ?.filter(currency => currency !== nativeCurrency)
        .map(currency => currency as Token) ?? [],
    [currencies, nativeCurrency]
  )
  const tokenBalances = useTokenBalances(account, tokens)
  const containsETH: boolean = useMemo(
    () => currencies?.some(currency => currency === nativeCurrency) ?? false,
    [currencies, nativeCurrency]
  )
  const ethBalance = useMNDBalance(chainIdToUse, containsETH ? [account] : [])

  return useMemo(
    () =>
      currencies?.map(currency => {
        if (account == null || currency == null) return undefined
        if (currency === nativeCurrency) {
          const checksummed = utilsAddess(account)
          const address = typeof checksummed === 'boolean' ? '' : checksummed
          return ethBalance[address]
        }
        if (currency) {
          const address = (currency as Token).address
          if (!address) {
            return undefined
          }
          return tokenBalances[address]
        }
        return undefined
      }) ?? [],
    [account, currencies, tokenBalances, ethBalance, nativeCurrency]
  )
}

export function useCurrencyBalance (
  account?: string,
  currency?: NativeCurrency | Token
): CurrencyAmount | TokenAmount | undefined {
  console.log('tokenBalances[address]', useCurrencyBalances(account, (currency != null) ? [currency] : [])?.[0])
  return useCurrencyBalances(account, (currency != null) ? [currency] : [])?.[0]
}

// mimics useAllBalances
export function useAllTokenBalances (): {
  [tokenAddress: string]: TokenAmount | undefined
} {
  const { account } = useWalletData()
  const allTokens = useAllTokens()
  const allTokensArray = useMemo(
    () => Object.values(allTokens ?? {}),
    [allTokens]
  )
  const balances = useTokenBalances(account ?? undefined, allTokensArray)
  return balances ?? {}
}

export function useMNDBalance (
  chainId: ChainId,
  uncheckedAddresses?: Array<string | undefined>
): {
    [address: string]: CurrencyAmount | undefined
  } {
  const multicallContract = useMulticallContract()

  const addresses: string[] = useMemo(
    () =>
      (uncheckedAddresses != null)
        ? uncheckedAddresses
          .map(utilsAddess)
          .filter((a): a is string => a !== false)
          .sort()
        : [],
    [uncheckedAddresses]
  )
  const results = useSingleContractMultipleData(
    multicallContract,
    'getEthBalance',
    addresses.map(address => [address])
  )

  return useMemo(
    () =>
      addresses.reduce<{ [address: string]: CurrencyAmount }>(
        (memo, address, i) => {
          const value = results?.[i]?.result?.[0]
          if (value) {
            memo[address] = CurrencyAmount.ether(JSBI.BigInt(value.toString()))
          }
          return memo
        },
        {}
      ),
    [addresses, results, chainId]
  )
}
