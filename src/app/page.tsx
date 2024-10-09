'use client'
import { Box } from '@mui/material'
import { SettingsModal } from '@/components'
import { useWalletData } from '@/utils'
import React, { useState } from 'react'
import { Field } from '@/state/swap/actions'
import { useDerivedSwapInfo } from '@/state/swap/hooks'
import { wrappedCurrency } from '@/utils/wrappedCurrency'
import SwapDefaultMode from '@/components/Swap/SwapDefaultMode'
import { useUserSlippageTolerance } from '@/state/user/hooks'
import { ChartComponent } from '@/components/Chart/chart'
import { SlippageWrapper } from '@/components/Swap/SlippageWrapper'
import { IoMdSettings } from 'react-icons/io'
import { AiOutlineLineChart } from 'react-icons/ai'

const SwapPage: React.FC = () => {
  const [openSettingsModal, setOpenSettingsModal] = useState(false)
  const [openChart, setOpenChart] = useState(false)
  const { currencies } = useDerivedSwapInfo()
  const { chainId } = useWalletData()
  const token1 = wrappedCurrency(currencies[Field.INPUT], chainId)
  const token2 = wrappedCurrency(currencies[Field.OUTPUT], chainId)
  const [userSlippageTolerance] = useUserSlippageTolerance()

  return (
    <div className='container mx-auto mt-10 flex p-2'>
      {openChart && (token1 != null) && (token2 != null)
        ? (
          <ChartComponent token1={token1} token2={token2} />
          )
        : null}
      <Box width='100%' mb={3} id='swap-page'>
        {openSettingsModal && (
          <SettingsModal
            open={openSettingsModal}
            onClose={() => setOpenSettingsModal(false)}
            defaultSlippage={userSlippageTolerance}
          />
        )}
        <Box className='flex justify-between w-full p-3 items-center max-w-[500px] mx-auto'>
          <div>
            <h3 className='font-medium text-xl'>Swap</h3>
          </div>
          <Box className='flex items-center' ml='auto'>
            <Box className='flex items-center gap-3 p-1'>
              <SlippageWrapper />
              <IoMdSettings
                className='cursor-pointer'
                onClick={() => setOpenSettingsModal(true)}
                size={24}
              />
              <AiOutlineLineChart
                className='cursor-pointer'
                onClick={() => setOpenChart(!openChart)}
                size={24}
              />
            </Box>
          </Box>
        </Box>
        <Box
          className='flex flex-col max-w-[500px] justify-center items-center p-2 mx-auto rounded-2xl border border-primary border-opacity-25 bg-bgColor'>
          <Box sx={{ zIndex: 1, width: '100%' }} className='p-2'>
            <SwapDefaultMode
              token1={token1}
              token2={token2}
            />
          </Box>
        </Box>
      </Box>
    </div>
  )
}

export default SwapPage
