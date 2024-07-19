'use client'
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { SettingsModal } from '@/components';
import { useWalletData } from '@/utils';
import React, { useState } from 'react';
import { Field } from '@/state/swap/actions';
import { useDerivedSwapInfo } from '@/state/swap/hooks';
import { wrappedCurrency } from '@/utils/wrappedCurrency';
// TODO : import SwapDefaultMode from './SwapDefaultMode';
import PageHeader from '@/components/Swap/SwapHeader';
import { useQuery } from '@tanstack/react-query';

const SwapPage: React.FC = () => {
  const [openSettingsModal, setOpenSettingsModal] = useState(false);
  const { currencies } = useDerivedSwapInfo();
  const { chainId } = useWalletData();
  const token1 = wrappedCurrency(currencies[Field.INPUT], chainId);
  const token2 = wrappedCurrency(currencies[Field.OUTPUT], chainId);

  const { breakpoints } = useTheme();
  const isTablet = useMediaQuery(breakpoints.down('sm'));

  const getPairId = async () => {
    if (token1 && token2) {
      const res = await fetch(
        `${process.env.REACT_APP_LEADERBOARD_APP_URL}/utils/pair-address/${token1.address}/${token2.address}?chainId=${chainId}`,
      );
      if (!res.ok) {
        return null;
      }
      const data = await res.json();

      if (data && data.data) {
        return {
          tokenReversed: isV2
            ? data.data.v2
              ? data.data.v2.tokenReversed
              : false
            : data.data.v3
            ? data.data.v3.tokenReversed
            : false,
          pairId: { v2: data.data.v2?.pairId, v3: data.data.v3?.pairId },
        };
      }
    }
    return null;
  };

  const { data } = useQuery({
    queryKey: ['fetchPairId', token1?.address, token2?.address, chainId],
    queryFn: getPairId,
  });

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
          <Box sx={{ maxWidth: '1536px', margin: 'auto' }}>
            <SwapDefaultMode
              token1={isV2 ? token1 : token1V3}
              token2={isV2 ? token2 : token2V3}
            />
          </Box>
        </>
    </Box>
  );
};

export default SwapPage;