'use client'

import { Box } from '@mui/material'
import { BsStars } from 'react-icons/bs'
import Image from 'next/image'
import provideChill from '@/static/assets/relax.jpg'

const TVLDataContainer: React.FC<{ Dvolume: number, TVL: number }> = ({ Dvolume, TVL }) => {
  return (
    <Box
      className='hidden lg:block min-h-[25vh] max-h-[30vh] max-w-[95%] mx-auto md:max-w-[100%] mb-10 rounded-lg p-6 flex flex-col shadow-inner'
      style={{
        backgroundImage: `url(${provideChill.src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 24%',
        opacity: 0.9
      }}
    >
      <Box className='flex justify-between items-center w-full'>
        <Box>
          <h1 className='text-5xl font-regular'>Liquidity Pools</h1>
          <p className='font-regular text-xl flex items-center gap-4 mt-2'>Provide liquidity, earn yield
            <BsStars size={20} />
          </p>
        </Box>
        <Box className='flex gap-10 py-3'>
          <div className=''>
            <h2 className='text-xl font-regular text-white'>TVL</h2>
            <p className='text-2xl text-white'>${String(TVL)}</p>
          </div>
          <div className=''>
            <h2 className='text-xl font-regular text-white'>24h Volume</h2>
            <p className='text-2xl text-white'>${String(Dvolume)}</p>
          </div>
        </Box>
      </Box>
    </Box>
  )
}

export default TVLDataContainer
