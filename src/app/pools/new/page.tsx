'use client'
import { AddLiquidity, QuestionHelper, SettingsModal } from '@/components'
import { Box } from '@mui/material'
import { IoMdSettings } from 'react-icons/io'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const New = (): JSX.Element => {
  const [openSettingsModal, setOpenSettingsModal] = useState(false)
  const router = useRouter()
  return (
    <div className='container mx-auto mt-10'>
      <Box className='flex justify-between w-full p-3 items-center max-w-[500px] mx-auto'>
        <div>
          <small onClick={() => router.push('/pools')} className='mb-3 opacity-40 hover:opacity-none transition-all cursor-pointer'>go to pools</small>
          <p className='font-medium text-xl'>Add Liquidity</p>
        </div>

        <Box className='flex items-center gap-3 '>
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
      <Box className='flex flex-col max-w-[500px] justify-center h-fit items-center p-1 mx-auto bg-bgColor border border-primary border-opacity-25 rounded-xl'>
        {openSettingsModal && (
          <SettingsModal
            open={openSettingsModal}
            onClose={() => setOpenSettingsModal(false)}
          />
        )}
        <Box mt={2.5} mb={2.5}>
          <AddLiquidity />
        </Box>
      </Box>
    </div>
  )
}

export default New
