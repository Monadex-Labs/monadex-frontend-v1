'use client'

import React, { useMemo, useState } from 'react'
import { Box, Typography, CircularProgress } from '@mui/material'
import { useSelector } from 'react-redux'
import { AppState } from '@/state/store'
import PoolsRow from './PoolsRow'
import useBulkPools from '@/hooks/usePools'
import { Token, ChainId } from '@monadex/sdk'
import { useRouter } from 'next/navigation'
import PoolHeader from './PoolHeader'
import Image from 'next/image'
import Rejected from '@/static/assets/rejected.webp'
const Pools: React.FC = () => {
  const router = useRouter()
  const { bulkPairsData, historicalData } = useBulkPools()
  const searchedValue = useSelector<AppState>((state) => state.pools.searchPool) as string
  const [_tvl, setTvl] = useState<string>('')

  const processedPools = useMemo(() => {
    if (!bulkPairsData || !historicalData) return []

    return Object.entries(historicalData).map(([pairAddress, historicalPairData]) => {
      bulkPairsData.map((d: any) => setTvl(d.reserveUSD))
      
      // create tokens Class
      const token0 = new Token(
        ChainId.SEPOLIA,
        historicalPairData.token0.id,
        18,
        historicalPairData.token0.symbol,
        historicalPairData.token0.name
      )

      const token1 = new Token(
        ChainId.SEPOLIA,
        historicalPairData.token1.id,
        18,
        historicalPairData.token1.symbol,
        historicalPairData.token1.name
      )

      // get data needed
      const volume24h = historicalPairData.volumeUSD
      const fee24h = (parseFloat(volume24h) * 0.003).toString()
      const apr24h = ((parseFloat(fee24h) * 365 * 100) / parseFloat(_tvl)).toString()
      const poolFee = '0.3' // by default all the pools have 0.3% fee

      return {
        pairAddress,
        token0,
        token1,
        volume24h,
        fee24h,
        apr24h,
        poolFee
      }
    }).filter(Boolean)
  }, [bulkPairsData, historicalData, _tvl])

  const filteredPools = useMemo(() => {
    if (!searchedValue) return processedPools

    return processedPools.filter((pool) => {
      const searchLower = searchedValue.toLowerCase()
      return (
        pool.token0.name.toLowerCase().includes(searchLower) ||
        pool.token1.name.toLowerCase().includes(searchLower) ||
        pool.token0.symbol.toLowerCase().includes(searchLower) ||
        pool.token1.symbol.toLowerCase().includes(searchLower) ||
        pool.token0.address.toLowerCase().includes(searchLower) ||
        pool.token1.address.toLowerCase().includes(searchLower) ||
        pool.pairAddress.toLowerCase().includes(searchLower)
      )
    })
  }, [processedPools, searchedValue])

  return (
    <Box>
      <PoolHeader />
      <Box mt={6} className='text-center'>
        {filteredPools.length === 0 ? (
          searchedValue ? (
            <Box className='flex items-center justify-center flex-col'>
              <Typography>No pools found matching your search, try again in few minutes new pools may take a bit of time to be displayed here! .</Typography>
              <Image src={Rejected} alt='no pool found' width={200} height={200}/>
            </Box>
          ) : (
            <CircularProgress size={15} color='secondary' className='text-center' />
          )
        ) : (
          filteredPools.map((pool) => (
            <PoolsRow
              key={pool.pairAddress}
              poolFee={pool.poolFee}
              token0={pool.token0}
              token1={pool.token1}
              volume24h={pool.volume24h}
              tvl={_tvl}
              fee24h={pool.fee24h}
              apr24h={pool.apr24h}
              onClick={() => {
                router.push(`/pools/new?currency0=${pool.token0.address}&currency1=${pool.token1.address}`)
              }}
            />
          ))
        )}
      </Box>
    </Box>
  )
}

export default Pools
