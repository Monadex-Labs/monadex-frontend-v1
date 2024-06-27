'use client'
import React, { useState } from 'react'
import { Box } from '@mui/material'
import Molandak from '@/static/assets/hedgehog.png'
import { useV2LiquidityPools } from '@/hooks'
import Image from 'next/image'
import { useWalletData } from '@/utils'

const Portfolio: React.FC = () => {
  const { account } = useWalletData()
  const [openPoolFinder, setOpenPoolFinder] = useState(false)
  const {
    pairs: allV2PairsWithLiquidity
  } = useV2LiquidityPools(account ?? undefined)

  return (
    <>
      {/* openPoolFinder && (
        <PoolFinderModal
          open={openPoolFinder}
          onClose={() => setOpenPoolFinder(false)}
        />
      ) */}
      <Box className='pageHeading'>
        <p className='weight-600'>Your Liquidity Pools</p>
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
                  {pair.liquidityToken.address}
                </Box>
              ))}
            </Box>
            )
          : (
            <Box textAlign='center'>
              <Image
                src={Molandak}
                alt='No Liquidity'
                width={150}
                height={150}
              />
              <p className='text-secondary'>
                Don't see a pool you joined? <small className='text-primary cursor-pointer' onClick={() => setOpenPoolFinder(true)}>Import it</small>.
                <br />
                Unstake your LP Tokens from Farms to see them here.
              </p>
            </Box>
            )}
      </Box>
    </>
  )
}

export default Portfolio
