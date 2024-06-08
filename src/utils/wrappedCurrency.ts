import {
  ChainId,
  NativeCurrency,
  CurrencyAmount,
  MONAD,
  Token,
  TokenAmount,
  WMND
} from '@monadex/sdk'
export function wrappedCurrency(
    currency: Currency | undefined,
    chainId: ChainId | undefined,
  ): Token | undefined {
    return chainId && currency === MONAD[chainId ? chainId : ChainId.SEPOLIA]
      ? WETH[chainId]
      : currency instanceof Token && currency.chainId === chainId
      ? currency
      : undefined;
  }