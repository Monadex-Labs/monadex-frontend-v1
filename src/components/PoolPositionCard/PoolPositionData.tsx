'use client'
import { Pair } from '@monadex/sdk'
import { Box } from '@mui/material'
import { useWalletData, formatTokenAmount } from '@/utils'
import { usePoolUSDCPositions } from '@/utils/useUsdcPrice'
import { useMemo } from 'react'
// Parent component that fetches data once for all pools

// Separate component for each pool position
export const PoolPositionData: React.FC<{ pool: Pair[], index: number }> = ({ pool, index }): JSX.Element => {
  const { account: address } = useWalletData()
  const {
    totalPoolTokens,
    userPoolBalance,
    usdcBalance
  } = usePoolUSDCPositions(address, pool, index)

  console.log('pvalue', usdcBalance)

  return (
    <div>
      <h4>Pool Position Details  $ {usdcBalance.toLocaleString('us')}</h4>
    </div>
  )
}
