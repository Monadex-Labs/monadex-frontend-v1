'use client'
import Image from 'next/image'
import Link from 'next/link'
import { IoMdArrowBack } from 'react-icons/io'
import React, { lazy, useState } from 'react'
import { Box } from '@mui/material'
import { IoMdSettings } from 'react-icons/io'
import { QuestionHelper } from '@/components/common/QuestionHelper'
import SettingsModal from '@/components/SettingsModal/SettingsModal'
import Marketing from '@/static/assets/marketing.png'
const AddLiquidity = lazy(async () => await import('@/components/AddLiquidity'))

const SupplyLiquidity: React.FC = () => {
  const [openSettingsModal, setOpenSettingsModal] = useState(false)
  return (
    <>
      <Link href='/pools' className='flex flex-row items-center gap-1 max-w-[500px] mx-auto mb-5 hover:text-[#8133FF] transition-all'><IoMdArrowBack />
        Back
      </Link>
      <Box className='flex flex-col max-w-[500px] justify-center items-center p-4 mx-auto bg-[#18003E] border border-[#373737] rounded-md'>
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
                className='text-[#373737]'
                text='When you add liquidity, you are given pool tokens representing your position. These tokens automatically earn fees proportional to your share of the pool, and can be redeemed at any time.'
              />
            </Box>
            <Box className=''>
              <IoMdSettings onClick={() => setOpenSettingsModal(true)} className='text-[#373737] cursor-pointer text-[25px]' />
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
    </>
  )
}

export default SupplyLiquidity
