'use client'
import PageHeader from '@/components/Swap/SwapHeader'
import { AddLiquidity, QuestionHelper, SettingsModal } from '@/components'
import { Box } from '@mui/material'
import { IoMdSettings } from 'react-icons/io'
import { useState } from 'react'
import Image from 'next/image'
import Marketing from '@/static/assets/marketing.png'

const Pool = (): JSX.Element => {
  const [openSettingsModal, setOpenSettingsModal] = useState(false)

  return (
    <div>
      <PageHeader isTablet={false} pageName='Pools' />
      <Box className='flex flex-col max-w-[500px] justify-center items-center p-4 mx-auto bg-[#18003E] border border-[#836EF9] rounded-md'>
        {openSettingsModal && (
          <SettingsModal
            open={openSettingsModal}
            onClose={() => setOpenSettingsModal(false)}
          />
        )}
        <Box className='flex justify-between w-full p-3 items-center'>
          <p className='font-medium text-xl'>Add Liquidity</p>
          <Box className='flex items-center gap-3 p-2'>
            <Box className=''>
              <QuestionHelper
                size={25}
                className='text-[#b4b4b4]'
                text='When you add liquidity, you are given pool tokens representing your position. These tokens automatically earn fees proportional to your share of the pool, and can be redeemed at any time.'
              />
            </Box>
            <Box className=''>
              <IoMdSettings onClick={() => setOpenSettingsModal(true)} className='text-[#b4b4b4] cursor-pointer text-[25px]' />
            </Box>
          </Box>
        </Box>
        <Box className='border-md'>
          <Image src={Marketing} width={450} height={200} alt='monadex marketing' />
        </Box>
        <Box mt={2.5} className='w-full p-2'>
          <p className='mb-3 font-light text-medium'>supply Amount</p>
          <AddLiquidity />
        </Box>
      </Box>
    </div>
  )
}

export default Pool
