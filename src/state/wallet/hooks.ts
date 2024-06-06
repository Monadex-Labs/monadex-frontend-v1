import { JSBI, Token, TokenAmount } from '@monadex/sdk'
import { useMemo } from 'react'
import { ERC20_INTERFACE } from '@/constants'
import { isAddress } from 'viem'
import { useMultipleContractSingleData } from '../multicall/hooks'
/**
 * Returns a map of the given addresses to their eventually consistent ETH balances.
*/
export function useTokenBalancesWithLoadingIndicator (
  address?: string,
  tokens?: Token [] | undefined
): [{ [tokenAddress: string]: TokenAmount | undefined }, boolean] {
  const validatedTokens: Token[] = useMemo(
    () => tokens?.filter((t?: Token): t is Token => isAddress(t?.address as string) !== false) ?? [], // eslint-disable-line @typescript-eslint/no-unnecessary-boolean-literal-compare
    [tokens]
  )

  const validatedTokenAddresses = useMemo(() => validatedTokens.map((vt) => vt.address), [validatedTokens])

  const balances = useMultipleContractSingleData(validatedTokenAddresses, ERC20_INTERFACE, 'balanceOf', [address])

  const anyLoading: boolean = useMemo(() => balances.some((callState) => callState.loading), [balances])

  return [
    useMemo(
      () =>
        address !== undefined && validatedTokens.length > 0
          ? validatedTokens.reduce<{ [tokenAddress: string]: TokenAmount | undefined }>((memo, token, i) => {
            const value = balances?.[i]?.result?.[0]
            const amount = value !== undefined ? JSBI.BigInt(value.toString()) : undefined
            if (amount != null) {
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
  tokens?: Token [] | undefined
): { [tokenAddress: string]: TokenAmount | undefined } {
  return useTokenBalancesWithLoadingIndicator(address, tokens)[0]
}
export function useCurrencyBalances (account?: string, currencies?: Token[] | undefined): TokenAmount [] | undefined {
  const tokens = useMemo(
    () => currencies?.filter((currency): currency is Token => currency instanceof Token) ?? [],
    [currencies]
  )

  const tokenBalances = useTokenBalances(account, tokens)

  return useMemo(
    () =>
      currencies?.map((currency) => {
        if (account === undefined || currency === undefined) return undefined
        if (currency instanceof Token) return tokenBalances[currency.address]
        return undefined
      }) ?? [],
    [account, currencies, tokenBalances]
  ) as TokenAmount []
}

export function useCurrencyBalance (
  account?: string,
  currency?: Token
): TokenAmount | undefined {
  return useCurrencyBalances(account, (currency !== undefined) ? [currency] : [])?.[0]
}
