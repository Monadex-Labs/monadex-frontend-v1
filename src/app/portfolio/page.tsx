'use client'
import React, { useState } from 'react'
import { Box } from '@mui/material'
import Molandak from '@/static/assets/hedgehog.png'
import { useV2LiquidityPools } from '@/hooks'
import Image from 'next/image'
import { useWalletData } from '@/utils'
import PageHeader from '@/components/Swap/SwapHeader' // TODO: check if valid component to use
import { PoolFinderModal, PoolPositionCard } from '@/components'

const Portfolio: React.FC = () => {
  const { account } = useWalletData()
  const [openPoolFinder, setOpenPoolFinder] = useState(false)
  const {
    pairs: allV2PairsWithLiquidity
  } = useV2LiquidityPools(account ?? undefined)

  return (
    <div>
      <PageHeader isTablet={false} pageName='Portfolio' />
      <Box className='flex flex-col max-w-[500px] justify-center items-center p-4 mx-auto bg-[#18003E] border border-[#836EF9] rounded-md'>
        {openPoolFinder && (
          <PoolFinderModal
            open={openPoolFinder}
            onClose={() => setOpenPoolFinder(false)}
          />
        )}
        <Box className='flex content-between w-100 mb-4'>
          <p className='font-medium text-xl'>Your Liquidity Pools</p>
        </Box>

        <Box mt={3}>
          {allV2PairsWithLiquidity.length > 0
            ? (
              <Box>
                <small className='text-secondary'>
                  Don't see a pool you joined? <small className='text-primary cursor-pointer' onClick={() => setOpenPoolFinder(true)}>Import it</small>.
                  <br />
                  Unstake your LP Tokens from Farms to see them here.
                </small>
                {allV2PairsWithLiquidity.map((pair, index) => (
                  <Box key={index} mt={2}>
                    <PoolPositionCard
                      key={pair.liquidityToken.address}
                      pair={pair}
                    />
                  </Box>
                ))}
              </Box>
              )
            : (
              <Box className='text-center'>
                <div className='flex flex-col items-center'>
                  <Image
                    src={Molandak}
                    alt='No Liquidity'
                    width={100}
                    height={100}
                    className='w-auto'
                  />
                </div>
                <p className='text-secondary'>
                  Don't see a pool you joined? <small className='text-primary cursor-pointer' onClick={() => setOpenPoolFinder(true)}>Import it</small>.
                </p>
              </Box>
              )}
        </Box>
      </Box>
    </div>
  )
}

export default Portfolio
