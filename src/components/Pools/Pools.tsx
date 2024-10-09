'use client'
import React, { useMemo, useState } from 'react'
import { Box, Typography, CircularProgress } from '@mui/material'
import { useSelector } from 'react-redux'
import { AppState } from '@/state/store'
import useBulkPools from '@/hooks/usePools'
import { Token, ChainId } from '@monadex/sdk'
import { useRouter } from 'next/navigation'
import PoolHeader from './PoolHeader'
import Image from 'next/image'
import Rejected from '@/static/assets/rejected.webp'
import CustomTable from './CustomTable'
import DoubleCurrencyLogo from '../DoubleCurrencyLogo'
import TVLDataContainer from './TvlDataContainer'
import { formatNumber } from '@/utils'
import { PairData } from '@/state/pools/actions'

const Pools: React.FC = () => {
  const router = useRouter()
  const { bulkPairsData, historicalData } = useBulkPools()
  const searchedValue = useSelector<AppState>((state) => state.pools.searchPool) as string
  const [tvl, setTvl] = useState<string>('')

  const processedPools = useMemo(() => {
    if (!bulkPairsData || !historicalData) return []

    return Object.entries(historicalData).map(([pairAddress, historicalPairData]) => {
      bulkPairsData.forEach((d: any) => setTvl(d.reserveUSD))

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

      const volume24h = historicalPairData.volumeUSD
      const fee24h = (parseFloat(volume24h) * 0.003).toString()
      const apr24h = ((parseFloat(fee24h) * 365 * 100) / parseFloat(tvl)).toString()
      const poolFee = '0.3'

      return {
        pairAddress,
        token0,
        token1,
        volume24h,
        fee24h,
        apr24h,
        poolFee,
        tvl
      }
    }).filter(Boolean)
  }, [bulkPairsData, historicalData, tvl])

  const filteredPools = useMemo(() => {
    if (!searchedValue) return processedPools

    return processedPools.filter((pool) => {
      const searchLower = searchedValue.toLowerCase()
      return (
        pool?.token0?.name?.toLowerCase().includes(searchLower) ||
        pool?.token1?.name?.toLowerCase().includes(searchLower) ||
        pool?.token0?.symbol?.toLowerCase().includes(searchLower) ||
        pool?.token1?.symbol?.toLowerCase().includes(searchLower) ||
        pool.token0.address.toLowerCase().includes(searchLower) ||
        pool.token1.address.toLowerCase().includes(searchLower) ||
        pool.pairAddress.toLowerCase().includes(searchLower)
      )
    })
  }, [processedPools, searchedValue])

  const totalVolume = useMemo(() => {
    return processedPools.reduce((sum: number, pool: any) => sum + parseFloat(pool.volume24h), 0)
  }, [processedPools])

  const totalTVL = useMemo(() => {
    return processedPools.reduce((sum: number, pool) => sum + parseFloat(pool.tvl), 0)
  }, [processedPools])

  const headCells = [
    {
      id: 'pairName',
      numeric: false,
      label: 'Pool',
      sortKey: (pair: any) => pair.token0.symbol + ' ' + pair.token1.symbol
    },
    {
      id: 'pairLiquidity',
      numeric: true,
      label: 'Liquidity',
      sortKey: (pair: any) => parseFloat(pair.tvl)
    },
    {
      id: 'pairdayVolume',
      numeric: true,
      label: 'Volume 24H',
      sortKey: (pair: any) => parseFloat(pair.volume24h)
    },
    {
      id: 'pairFee',
      numeric: true,
      label: 'Fees 24H',
      sortKey: (pair: any) => parseFloat(pair.fee24h)
    },
    {
      id: 'pairApr',
      numeric: true,
      label: 'APR 24H',
      sortKey: (pair: any) => parseFloat(pair.apr24h)
    }
  ]

  const mobileHTML = (pair: any, index: number): React.JSX.Element => (
    <Box mt={index === 0 ? 0 : 3}>

      <Box className='flex items-center justify-between border' mb={1}>
        <Box className='flex items-center'>
          <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={24} />
          <Box ml='5px'>
            <Typography variant='body2' className='text-gray25'>
              {pair.token0.symbol} / {pair.token1.symbol}
            </Typography>
          </Box>
        </Box>
        <Box className='flex items-center'>
          <Box
            paddingY={0.5}
            paddingX={1}
            borderRadius={6}
            className='text-primaryText bg-gray30'
          >
            {pair.poolFee}% Fee
          </Box>
        </Box>
      </Box>
      <Box className='mobileRow'>
        <Typography variant='body2'>Liquidity</Typography>
        <Typography variant='body2'>${formatNumber(parseFloat(pair.tvl))}</Typography>
      </Box>
      <Box className='mobileRow'>
        <Typography variant='body2'>24h Vol</Typography>
        <Typography variant='body2'>${formatNumber(parseFloat(pair.volume24h))}</Typography>
      </Box>
      <Box className='mobileRow'>
        <Typography variant='body2'>24h Fees</Typography>
        <Typography variant='body2'>${formatNumber(parseFloat(pair.fee24h))}</Typography>
      </Box>
      <Box className='mobileRow'>
        <Typography variant='body2'>APR</Typography>
        <Typography variant='body2' className='text-success'>
          {formatNumber(parseFloat(pair.apr24h))}%
        </Typography>
      </Box>
    </Box>
  )

  const desktopHTML = (pair: any): Array<{
    html: React.JSX.Element
  }> => [
    {
      html: (
        <Box className='flex items-center'>
          <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={28} />
          <Box
            ml={1}
            onClick={() => {
              router.push(`/pools/new?currency0=${pair.token0.address}&currency1=${pair.token1.address}`)
            }}
          >
            <Typography variant='body2' className='text-white font-regular text-lg cursor-pointer'>
              {pair.token0.symbol} / {pair.token1.symbol}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      html: <Typography variant='body2' className='text-white text-lg font-regular'>${formatNumber(parseFloat(pair.tvl))}</Typography>
    },
    {
      html: <Typography variant='body2' className='text-white text-lg font-regular'>${formatNumber(parseFloat(pair.volume24h))}</Typography>
    },
    {
      html: <Typography variant='body2' className='text-white  text-lg font-regular'>${formatNumber(parseFloat(pair.fee24h))}</Typography>
    },
    {
      html: (
        <Typography variant='body2' className='text-success font-regular text-lg'>
          {formatNumber(parseFloat(pair.apr24h))}%
        </Typography>
      )
    }
  ]

  return (
    <Box>
      <TVLDataContainer
        Dvolume={totalVolume}
        TVL={totalTVL}
      />

      <PoolHeader />
      <Box mt={6}>
        {filteredPools.length === 0
          ? (
              searchedValue
                ? (
                  <Box className='flex items-center justify-center flex-col'>
                    <Typography>No pools found matching your search. Try again in a few minutes; new pools may take some time to be displayed here.</Typography>
                    <Image src={Rejected} alt='no pool found' width={200} height={200} />
                  </Box>
                  )
                : (
                  <Box className='flex justify-center'>
                    <CircularProgress size={40} color='secondary' />
                  </Box>
                  )
            )
          : (
            <CustomTable
              rowsPerPage={10}
              showPagination
              emptyMessage='No pools found'
              headCells={headCells}
              data={filteredPools}
              defaultOrderBy={headCells[1]}
              defaultOrder='desc'
              mobileHTML={mobileHTML}
              desktopHTML={desktopHTML}
            />
            )}
      </Box>
    </Box>
  )
}

export default Pools
