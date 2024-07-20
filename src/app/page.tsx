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

const SwapPage: React.FC = () => {
  const [openSettingsModal, setOpenSettingsModal] = useState(false);
  const { currencies } = useDerivedSwapInfo();
  const { chainId } = useWalletData();
  const token1 = wrappedCurrency(currencies[Field.INPUT], chainId);
  const token2 = wrappedCurrency(currencies[Field.OUTPUT], chainId);



  return (
    <Box width='100%' mb={3} id='swap-page'>
      {openSettingsModal && (
        <SettingsModal
          open={openSettingsModal}
          onClose={() => setOpenSettingsModal(false)}
        />
      )}

      <PageHeader isTablet={false} pageName='Swap' />
        <>
          <Box 
          className='flex flex-col max-w-[500px] justify-center items-center p-4 mx-auto bg-[#18003E] rounded-md'
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