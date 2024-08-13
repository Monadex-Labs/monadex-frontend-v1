'use client'
import React, { useState } from 'react'
import { Box } from '@mui/material'
import Molandak from '@/static/assets/hedgehog.png'
import { useV2LiquidityPools } from '@/hooks'
import Image from 'next/image'
import { useWalletData } from '@/utils'
import { PoolFinderModal, PoolPositionCard, QuestionHelper } from '@/components'

const Portfolio: React.FC = () => {
  const { account } = useWalletData()
  const [openPoolFinder, setOpenPoolFinder] = useState(false)
  const {
    pairs: allV2PairsWithLiquidity
  } = useV2LiquidityPools(account ?? undefined)

  return (
    <div className='container mx-auto mt-10'>
      <Box className='flex justify-between w-full p-3 items-center max-w-[500px] mx-auto'>
        <div>
          <p className='font-medium text-xl'>Portfolio</p>
        </div>

        <Box className='flex items-center gap-3 '>
          <Box>
            <QuestionHelper
              size={23}
              className='text-white'
              text='If you have previously added liquidity to any pool you will find them or import them here'
            />
          </Box>
        </Box>
      </Box>
      <Box className='max-w-[500px] justify-center items-center p-4 mx-auto bg-bgColor border border-primary rounded-md'>
        {openPoolFinder && (
          <PoolFinderModal
            open={openPoolFinder}
            onClose={() => setOpenPoolFinder(false)}
          />
        )}
        <Box className='flex w-100 mb-2 justify-center'>
          <p className='font-medium text-xl'>Your Liquidity Pools</p>
        </Box>

        <Box mt={3} className='text-center'>
          {allV2PairsWithLiquidity.length > 0
            ? (
              <Box>
                <small className='text-textSecondary'>
                  Don't see a pool you joined? <span className='text-primary cursor-pointer' onClick={() => setOpenPoolFinder(true)}>Import it</span>.
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
              <Box>
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
