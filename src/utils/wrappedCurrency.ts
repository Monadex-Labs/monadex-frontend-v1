import {
  ChainId,
  NativeCurrency,
  CurrencyAmount,
  ETH,
  Token,
  TokenAmount,
  WMND
} from '@monadex/sdk'
// import { WrappedTokenInfo } from './wrappedTokenInfo'

/**
 * Returns the wrapped version of the native currency for a given chain
 *
 */
export function wrappedCurrency (
  currency: NativeCurrency | Token | undefined,
  chainId: ChainId | undefined
): Token | undefined {
  return chainId && currency === ETH
    ? WMND[chainId]
    : currency instanceof Token && currency.chainId === chainId
      ? currency
      : undefined
}
export function wrappedCurrencyAmount (
  currencyAmount: CurrencyAmount | TokenAmount | undefined,
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
  if (token instanceof Token && token.equals(WMND[token.chainId])) return ETH
  return token
}
