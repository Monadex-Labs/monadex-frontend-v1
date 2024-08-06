'use client'

'use client'
import PageHeader from '@/components/Swap/SwapHeader'
import { AddLiquidity, QuestionHelper, SettingsModal } from '@/components'
import { Box } from '@mui/material'
import { IoMdSettings } from 'react-icons/io'
import { useState } from 'react'

const Pool = (): JSX.Element => {
  const [openSettingsModal, setOpenSettingsModal] = useState(false)

  return (
    <div>
      <Box className='flex justify-between w-full p-3 items-center max-w-[500px] mx-auto'>
        <p className='font-medium text-xl'>Add Liquidity</p>
        <Box className='flex items-center gap-3 p-2'>
          <Box className=''>
            <QuestionHelper
              size={23}
                className='text-white'
                text='When you add liquidity, you are given pool tokens representing your position. These tokens automatically earn fees proportional to your share of the pool, and can be redeemed at any time.'
              />
            </Box>
            <Box className=''>
              <IoMdSettings onClick={() => setOpenSettingsModal(true)} className='text-white cursor-pointer text-2xl' />
            </Box>
          </Box>
      </Box>
      <Box className='flex flex-col max-w-[500px] justify-center items-center p-4 mx-auto bg-bgColor rounded-md shadow-lg'>
        {openSettingsModal && (
          <SettingsModal
            open={openSettingsModal}
            onClose={() => setOpenSettingsModal(false)}
          />
        )}
        <Box className='border-md'>
        </Box>
        <Box mt={2.5} className='w-full p-2'>
          <AddLiquidity />
        </Box>
      </Box>
    </div>
  )
}

export default Pool
