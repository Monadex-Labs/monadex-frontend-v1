import { RAFFLE_WL_TOKEN_ADDRESS } from '@/constants'
import { ChainId } from '@monadex/sdk'

export function isTokenInRaffleWhitelist (tokenAddress: string | undefined): boolean {
  if (tokenAddress === undefined) return false
  return RAFFLE_WL_TOKEN_ADDRESS[ChainId.SEPOLIA].includes(tokenAddress)
}