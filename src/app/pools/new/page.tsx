'use client'
import { QuestionHelper, SettingsModal } from '@/components'
import { Box } from '@mui/material'
import { IoMdSettings } from 'react-icons/io'
import { useState, lazy } from 'react'
import { useRouter } from 'next/navigation'
import { useV2LiquidityPool } from '@/hooks'
import PoolData from '@/components/AddLiquidity/PoolData'
const V2Liquidity = lazy(async () => await import('@/components/AddLiquidity/AddLiquidity').then(module => ({ default: module.default })))

const New = (): JSX.Element => {
  const [openSettingsModal, setOpenSettingsModal] = useState(false)
  const router = useRouter()
  return (
    <div className='container mx-auto mt-10 flex p-2'>
      <Box width='100%' mb={3} id='V2pool-page'>
        <Box className='flex justify-between w-full p-3 items-center max-w-[500px] mx-auto'>
          <div>
            <small onClick={() => router.push('/pools')} className='mb-3 opacity-40 font-regular hover:opacity-none transition-all cursor-pointer'>go to pools</small>
            <p className='font-medium text-xl'>Add Liquidity</p>
          </div>

          <Box className='flex items-center gap-3'>
            <Box>
              <QuestionHelper
                size={23}
                className='text-white'
                text='When you add liquidity, you are given pool tokens representing your position. These tokens automatically earn fees proportional to your share of the pool, and can be redeemed at any time.'
              />
            </Box>
            <Box>
              <IoMdSettings onClick={() => setOpenSettingsModal(true)} className='text-white cursor-pointer text-2xl' />
            </Box>
          </Box>
        </Box>
        <Box className='flex flex-col max-w-[500px] justify-center items-center p-2 mx-auto rounded-2xl border border-primary border-opacity-25 bg-bgColor'>
          {openSettingsModal && (
            <SettingsModal
              open={openSettingsModal}
              onClose={() => setOpenSettingsModal(false)}
            />
          )}
          <Box sx={{ zIndex: 1, width: '100%' }} className='p-2'>
            <V2Liquidity />
          </Box>
        </Box>
        <PoolData />
      </Box>
    </div>
  )
}

export default New
