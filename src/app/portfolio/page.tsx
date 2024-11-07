'use client'
import React, { useState } from 'react'
import { Box, Divider } from '@mui/material'
import Molandak from '@/static/assets/hedgehog.png'
import { useV2LiquidityPools } from '@/hooks'
import Image from 'next/image'
import { useWalletData } from '@/utils'
import { PoolFinderModal, PoolPositionCard, QuestionHelper, ConnectButton } from '@/components'
import { useRouter } from 'next/navigation'
const Portfolio: React.FC = () => {
  const router = useRouter()
  const { account } = useWalletData()
  const [openPoolFinder, setOpenPoolFinder] = useState(false)
  const {
    pairs: allV2PairsWithLiquidity
  } = useV2LiquidityPools(account ?? undefined)

  return (
    <div className='max-w-[95%] mx-auto md:max-w-[1400px] mt-10'>

      <Box className='mb-4 flex justify-between items-center'>
        <Box>
          <p className='font-medium text-xl'>Your Liquidity Pools ({allV2PairsWithLiquidity.length})</p>
          <small className='text-textSecondary'>
            Don't see a pool you joined? <span className='text-primary cursor-pointer' onClick={() => setOpenPoolFinder(true)}>Import it</span>
          </small>
        </Box>
        <Box>
          <QuestionHelper
            size={23}
            className='text-white'
            text='If you have previously added liquidity to any pool you will find them or import them here'
          />
        </Box>
      </Box>
      <Box className='max-w-[95%] mx-auto md:max-w-[1400px] justify-center items-center p-4 mx-auto min-h-[50vh] bg-bgColor/80 border border-primary border-opacity-20 rounded-md'>
        <div className='flex justify-between items-center'>
          <p className='text-lg font-clash'>Liquidity positions</p>
          <div className='flex items-center gap-4'>
            <button
              className='px-4 py-2 text-white bg-primary rounded-md'
              onClick={() => router.push('/pools/new')}
            >
              create new position
            </button>
          </div>
        </div>
        <Divider className='bg-primary mt-5' />
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
            : !account
                ? (
                  <Box className='flex flex-col gap-4 justify-center items-center h-[35vh]'>
                    <p className='text-white/60 font-regular'>connect wallet to see your liquidity positions information.</p>
                    <ConnectButton
                      className='px-4 py-2 text-white bg-primary rounded-md'
                    />
                  </Box>
                  )
                : (
                  <Box className='flex flex-col justify-center items-center h-[35vh]'>
                    <div>
                      <Image
                        src={Molandak}
                        alt='No Liquidity'
                        width={100}
                        height={100}
                        className='animate-bounce'
                      />
                    </div>
                    <p className='text-textSecondary'>
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
