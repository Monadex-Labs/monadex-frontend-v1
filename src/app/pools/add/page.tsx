'use client'
import React, { lazy, useState } from 'react';
import { Box } from '@mui/material';
import { IoMdSettings } from "react-icons/io";
import  QuestionHelper  from '@/components/common/QuestionHelper'
import SettingsModal from '@/components/CustomModal/SettingsModal';
const AddLiquidity = lazy(() => import('@/components/AddLiquidity'))

const SupplyLiquidity: React.FC = () => {
    const [openSettingsModal, setOpenSettingsModal] = useState(false);
  
    return (
      <>
        {openSettingsModal && (
          <SettingsModal
            open={openSettingsModal}
            onClose={() => setOpenSettingsModal(false)}
          />
        )}
        <Box className='flex justify-between items-center'>
          <p className='weight-600'>{'supplyLiquidity'}</p>
          <Box className='flex items-center'>
            <Box className=''>
              <QuestionHelper
                size={24}
                className='text-secondary'
                text='supplyLiquidityHelp'
              />
            </Box>
            <Box className='headingItem'>
              <IoMdSettings onClick={() => setOpenSettingsModal(true)} className='text-white cursor-pointer' />
            </Box>
          </Box>
        </Box>
        <Box mt={2.5}>
          <AddLiquidity />
        </Box>
      </>
    );
  };
  
  export default SupplyLiquidity;
  