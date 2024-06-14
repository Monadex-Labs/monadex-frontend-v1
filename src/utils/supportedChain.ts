import { ChainId } from '@monadex/sdk'
/**
 * Returns the input chain ID if chain is supported. If not, return undefined
 * @param chainId a chain ID, which will be returned if it is a supported chain ID
 */
export function supportedChainId (chainId: number): number | undefined | string {
  if (Number.isNaN(chainId)) return undefined
  if (chainId in ChainId) {
    return chainId
  } else {
    return 'Unsupported chain'
  }
}
