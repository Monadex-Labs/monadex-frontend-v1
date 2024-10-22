'use client'
import { Box } from '@mui/material'

const TVLDataContainer: React.FC<{ Dvolume: number, TVL: number }> = ({ Dvolume, TVL }) => {
  return (
    <Box className='border h-fit mb-10 rounded-lg border border-primary border-opacity-20 p-6 flex justify-between items-center'>
      <Box>
        <h1 className='text-5xl font-regular'>Liquidity Pools</h1>
        <p className='font-regular text-md'>Provide liquidity, earn yield</p>
      </Box>
      <Box className='flex gap-10 py-3'>
        <div className=''>
          <h2 className='text-xl font-regular text-white'>TVL</h2>
          <p className='text-2xl text-primary'>$2,043,103,403</p>
        </div>
        <div className=''>
          <h2 className='text-xl font-regular text-white'>24h Volume</h2>
          <p className='text-2xl text-primary'>$1,043,103,403</p>
        </div>
      </Box>
    </Box>
  )
}

export default TVLDataContainer
// {String(Dvolume)}
// {String(TVL)}