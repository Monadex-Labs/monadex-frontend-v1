'use client'
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { SettingsModal } from '@/components';
import { useWalletData } from '@/utils';
import React, { useState } from 'react';
import { Field } from '@/state/swap/actions';
import { useDerivedSwapInfo } from '@/state/swap/hooks';
import { wrappedCurrency } from '@/utils/wrappedCurrency';
import SwapDefaultMode from '@/components/Swap/SwapDefaultMode';
import PageHeader from '@/components/Swap/SwapHeader';
import { useQuery } from '@tanstack/react-query';
import { useUserSlippageTolerance } from '@/state/user/hooks';
import { SlippageWrapper } from '@/components/Swap/SlippageWrapper';
import { IoMdSettings } from 'react-icons/io'


const SwapPage: React.FC = () => {
  const [openSettingsModal, setOpenSettingsModal] = useState(false);
  const { currencies } = useDerivedSwapInfo();
  const { chainId } = useWalletData();
  const token1 = wrappedCurrency(currencies[Field.INPUT], chainId);
  const token2 = wrappedCurrency(currencies[Field.OUTPUT], chainId);
  const [
    userSlippageTolerance,
] = useUserSlippageTolerance()


  return (
    <Box width='100%' mb={3} id='swap-page'
    >
      <PageHeader isTablet={false} pageName='Swap' />
        <>
        {openSettingsModal && (
        <SettingsModal
          open={openSettingsModal}
          onClose={() => setOpenSettingsModal(false)}
          defaultSlippage={userSlippageTolerance}
        />
      )}
      {/* Header*/}
       <Box className="p-1 flex mb-2 max-w-[480px] mx-auto ">
        <Box>
          <h3 className='font-medium text-xl'>swap</h3>
        </Box>
        <Box className='flex items-center' ml={'auto'}>
          <Box className='flex items-center gap-3 p-1'>
            <SlippageWrapper />
            <IoMdSettings
              className='cursor-pointer'
              onClick={() => setOpenSettingsModal(true)}
            />
          </Box>
        </Box>
      </Box>
          <Box 
          className='flex flex-col max-w-[480px] justify-center items-center p-2 mx-auto bg-[#18003E] rounded-md border border-[#2D1653]'
          >
            <SwapDefaultMode
              token1={ token1 }
              token2={ token2 }
            />
          </Box>
        </>
    </Box>
  );
};

export default SwapPage;