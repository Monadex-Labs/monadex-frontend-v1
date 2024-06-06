import { useSelector } from 'react-redux'
import { AppState } from '../store'
import { ChainId } from '@monadex/sdk'
export function useBlockNumber (): number | undefined {
  const chainId = ChainId.SEPOLIA
  return useSelector((state: AppState) => state.application.blockNumber[chainId ?? -1])
}
