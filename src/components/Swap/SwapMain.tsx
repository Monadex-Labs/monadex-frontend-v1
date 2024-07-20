'use'
import { Box, Button, Menu, MenuItem, Typography } from '@mui/material';
import { KeyboardArrowDown } from '@mui/icons-material';
import { IoEllipsisHorizontal } from "react-icons/io5"; // settings icon
import SettingsModal from '../SettingsModal';
import { ToggleSwitch } from '../common';
import { getConfig } from '@/constants/config';
import { useWalletData } from '@/utils';
import useParsedQueryString from '@/hooks/useParseQueryString';
import useSwapRedirects from '@/hooks/useSwapRedirect';
import React, { lazy, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useUserSlippageTolerance } from '@/state/user/hooks';
import { SlippageWrapper } from './SlippageWrapper';
const Swap = lazy(() =>
  import('@/components/Swap/Swap').then((module) => ({ default: module.default })),
);

const SwapMain:React.FC = () => {
    const [openSettingsModal, setOpenSettingsModal] = useState(false)
   // only one trade option rn : normal tradde or V2
    const [
        userSlippageTolerance,
    ] = useUserSlippageTolerance()
    return (
      <>
        {openSettingsModal && (
        <SettingsModal
          open={openSettingsModal}
          onClose={() => setOpenSettingsModal(false)}
          defaultSlippage={userSlippageTolerance}
        />
      )}
      {/* Header*/}
       <Box display={'flex'} mb={2} className="p-1 ">
        <Box>
          <Typography className='font-medium text-xl'>swap</Typography>
        </Box>
        <Box className='flex items-center' ml={'auto'}>
          <Box className='flex items-center gap-3 p-1'>
            <SlippageWrapper />
            <IoEllipsisHorizontal
              className='cursor-pointer'
              onClick={() => setOpenSettingsModal(true)}
            />
          </Box>
        </Box>
      </Box>
      {/* Widget Body */}
      <Box>
        <Swap />
      </Box>
      </>
    )
} 
export default SwapMain