import { USDC } from '@/constants'
import { ChainId, NativeCurrency, Price } from '@monadex/sdk'

export default function useUSDCPrice (currency?: NativeCurrency): Price | undefined {
  if (currency == null) { return undefined }
  return new Price(currency, USDC[ChainId.MONAD], BigInt(1), BigInt(1))
}
