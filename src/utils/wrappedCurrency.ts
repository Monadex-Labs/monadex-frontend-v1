import {
  ChainId,
  NativeCurrency,
  CurrencyAmount,
  MONAD,
  Token,
  TokenAmount,
  WMND
} from '@monadex/sdk'
// import { WrappedTokenInfo } from './wrappedTokenInfo'

export function wrappedCurrency (
  currency: NativeCurrency | undefined,
  chainId: ChainId | undefined
): Token | undefined {
  return chainId && currency === MONAD
    ? WMND[chainId]
    : currency instanceof Token && currency.chainId === chainId
      ? currency
      : undefined
}
export function wrappedCurrencyAmount (
  currencyAmount: CurrencyAmount | undefined,
  chainId: ChainId | undefined
): TokenAmount | undefined {
  const token =
    (currencyAmount !== undefined) && chainId
      ? wrappedCurrency(currencyAmount.currency, chainId)
      : undefined
  return (token !== undefined) && (currencyAmount !== undefined)
    ? new TokenAmount(token, currencyAmount.raw)
    : undefined
}
export function unwrappedToken (token: Token): NativeCurrency | Token {
  if (token instanceof Token && token.equals(WMND[token.chainId])) return MONAD
  return token
}
