'use client'
import { Pair } from '@monadex/sdk'
import { Box } from '@mui/material'
import { useWalletData, formatTokenAmount } from '@/utils'
import { useDerivedBurnInfo } from '@/state/burn/hooks'
import { useMemo, useState } from 'react'
// Parent component that fetches data once for all pools

// Separate component for each pool position
export const PoolPositionData: React.FC<{ pool: Pair[] }> = ({ pool }): JSX.Element => {
  const [poolBalance, setPoolBalance] = useState([])
  
  console.log('pool', pool.map(p => p))
  return (
    <Box className='border border-primary border-opacity-20 min-w-[40vh] min-h-[20vh] rounded-md bg-bgColor/80 p-4 mt-5'>
        <div>
          <p>Portfolio value</p>
        </div>
    </Box>
  )
}
