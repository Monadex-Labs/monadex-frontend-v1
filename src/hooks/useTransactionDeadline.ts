import { BigNumber } from '@ethersproject/bignumber'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'

import { AppState } from '@/state/store'
import useCurrentBlockTimestamp from './useCurrentBlockTimestamp'

// combines the block timestamp with the user setting to give the deadline that should be used for any submitted transaction
export default function useTransactionDeadline (): BigNumber | undefined {
  const ttl = useSelector<AppState, number>((state) => state.user.userDeadline)
  const blockTimestamp = useCurrentBlockTimestamp()
  const autoDeadline = 5
  return useMemo(() => {
    // cast number to auto deadline if user enter number bigger thnan 10**4 
    if ((blockTimestamp != null) && ttl) return blockTimestamp.add(ttl > 10**4 ? autoDeadline : ttl)
    return undefined
  }, [blockTimestamp, ttl])
}
