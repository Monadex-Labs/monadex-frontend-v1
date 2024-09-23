'use client'

import React, { useState, useEffect } from 'react'
import { Box, Typography , CircularProgress } from '@mui/material'
import PoolsRow from './PoolsRow'
import useBulkPools from '@/hooks/usePools'
import { Token, ChainId } from '@monadex/sdk'
import { useRouter } from 'next/navigation'
import PoolHeader from './PoolHeader'
import { useDerivedPoolInfo } from '@/state/pools/hooks'
import { useFetchPairList } from '@/state/pools/hooks'
const Pools: React.FC = () => {
  // const router = useRouter()
 
  const { allPairs, bulkPairsData } = useDerivedPoolInfo()
    console.log('all', allPairs, bulkPairsData)

    return (
      <div>
          <p>d</p>
      </div>
  )
}

export default Pools
