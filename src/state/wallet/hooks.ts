import { CurrencyAmount, JSBI, NativeCurrency, Token, TokenAmount } from '@monadex/sdk'
import { useMemo } from 'react'
import { ERC20_INTERFACE } from '../../constants/index'
import { isAddress } from 'viem'
import { useMultipleContractSingleData } from '../multicall/hooks'
import { useWalletData } from '@/utils'
import { useAllTokens } from '@/hooks/Tokens'
/**
 * Returns a map of the given addresses to their eventually consistent ETH balances.
*/
export function useTokenBalancesWithLoadingIndicator (
  address?: string,
  tokens?: Array<Token | undefined>
): [{ [tokenAddress: string]: TokenAmount | undefined }, boolean] {
  const validatedTokens: Token[] = useMemo(
    () => tokens?.filter((t?: Token): t is Token => t?.address  ? isAddress(t?.address) : false) ?? [],
    [tokens]
  )
  const validatedTokenAddresses = useMemo(() => validatedTokens.map((vt) => vt.address), [validatedTokens])

  const balances = useMultipleContractSingleData(validatedTokenAddresses, ERC20_INTERFACE, 'balanceOf', [address])

  const anyLoading: boolean = useMemo(() => balances.some((callState) => callState.loading), [balances])
  return [
    useMemo(
      () =>
        address && validatedTokens.length > 0
          ? validatedTokens.reduce<{ [tokenAddress: string]: TokenAmount | undefined }>((memo, token, i) => {
            const value = balances?.[i]?.result?.[0]
            const amount = value ? JSBI.BigInt(value.toString()) : undefined
            if (amount) {
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

export function useTokenBalance (account?: string, token?: Token): TokenAmount | undefined {
  const tokenBalances = useTokenBalances(account, [token])
  if (token == null || token === undefined) return undefined
  return tokenBalances[token.address]
}

export function useCurrencyBalances (account?: string, currencies?: Array<NativeCurrency | Token | undefined>): Array<CurrencyAmount | undefined> {
  const tokens = useMemo(
    () => currencies?.filter((currency): currency is Token => currency instanceof Token) ?? [],
    [currencies]
  )

  const tokenBalances = useTokenBalances(account, tokens)
  return useMemo(
    () =>
      currencies?.map((currency) => {
        if (!account || !currency ) return undefined
        if (currency instanceof Token) return tokenBalances[currency.address]
        return undefined
      }) ?? [],
    [account, currencies, tokenBalances]
  ) as CurrencyAmount []
}
export function useCurrencyBalance (
  account?: string,
  currency?: NativeCurrency | Token
): CurrencyAmount | TokenAmount | undefined {
  return useCurrencyBalances(account, (currency !== undefined) ? [currency] : [])?.[0]
}

// mimics useAllBalances
export function useAllTokenBalances (): {
  [tokenAddress: string]: TokenAmount | undefined
} {
  const { account } = useWalletData()
  const allTokens = useAllTokens()
  const allTokensArray = useMemo(() => Object.values(allTokens ?? {}), [
    allTokens
  ])
  const balances = useTokenBalances(account ?? undefined, allTokensArray)
  return balances ?? {}
}
