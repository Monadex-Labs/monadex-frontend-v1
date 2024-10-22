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
      <Box className='flex justify-between w-full mb-10 items-center container mx-auto'>
        <div>
          <p className='font-medium text-xl'>My Portfolio</p>
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
      <Box className='mb-4'>
        <p className='font-medium text-xl'>Your Liquidity Pools</p>
        <small className='text-textSecondary'>
          Don't see a pool you joined? <span className='text-primary cursor-pointer' onClick={() => setOpenPoolFinder(true)}>Import it</span>
        </small>
      </Box>
      <Box className='container justify-center items-center p-4 mx-auto bg-bgColor border border-primary border-opacity-20 rounded-md'>
        {openPoolFinder && (
          <PoolFinderModal
            open={openPoolFinder}
            onClose={() => setOpenPoolFinder(false)}
          />
        )}
        <Box mt={3} className='text-center'>
          {allV2PairsWithLiquidity.length > 0
            ? (
              <Box>
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
