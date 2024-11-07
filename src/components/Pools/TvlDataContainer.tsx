'use client'
import { Box } from '@mui/material'
import { BsStars } from 'react-icons/bs'

const TVLDataContainer: React.FC<{ Dvolume: number, TVL: number }> = ({ Dvolume, TVL }) => {
  return (
    <Box className='border min-h-[15vh] max-w-[95%] mx-auto md:max-w-[100%] mb-10 rounded-lg border border-primary border-opacity-20 p-6 flex flex-col md:flex-row justify-between md:items-center bg-bgColor'>
      <Box>
        <h1 className='text-5xl font-regular'>Liquidity Pools</h1>
        <p className='font-regular text-md flex items-center gap-4 mt-2'>Provide liquidity, earn yield
          <BsStars size={20}/>
        </p>
      </Box>
      <Box className='flex gap-10 py-3'>
        <div className=''>
          <h2 className='text-xl font-regular text-white'>TVL</h2>
          <p className='text-2xl text-primary'>${String(TVL)}</p>
        </div>
        <div className=''>
          <h2 className='text-xl font-regular text-white'>24h Volume</h2>
          <p className='text-2xl text-primary'>${String(Dvolume)}</p>
        </div>
      </Box>
    </Box>
  )
}

export default TVLDataContainer
// {String(Dvolume)}
// {String(TVL)}