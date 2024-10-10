'use client'
import { Box } from '@mui/material'

const TVLDataContainer: React.FC<{ Dvolume: number, TVL: number }> = ({ Dvolume, TVL }) => {
  return (
    <Box className='border h-fit mb-10 rounded-lg border border-primary border-opacity-20 p-6 flex justify-between items-center bg-darkPurple'>
      <h1 className='text-6xl font-regular'>Liquidity Pools</h1>
      <Box className='flex gap-10 py-3'>
        <div className=''>
          <h2 className='text-2xl text-white/60'>TVL</h2>
          <p className='text-3xl text-primary'>${String(TVL)}</p>
        </div>
        <div className=''>
          <h2 className='text-2xl text-white/60'>Volume 24h</h2>
          <p className='text-3xl text-primary'>${String(Dvolume)}</p>
        </div>
      </Box>
    </Box>
  )
}

export default TVLDataContainer
