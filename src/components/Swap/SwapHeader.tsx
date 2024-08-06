'use client'
import { Box } from '@mui/material'
import { IoIosHelpCircleOutline } from 'react-icons/io'
import React from 'react'

const PageHeader: React.FC<{ isTablet: boolean, pageName: string }> = ({
  isTablet,
  pageName
}) => {
  const helpURL = 'https://discord.gg/ZwGBssxNCx'

  return isTablet
    ? (
      <></>
      )
    : (
      <Box className='flex justify-between items-center p-4 mt-4'>
        <h1 className='text-2xl font-medium opacity-60'>{pageName}</h1>
        {Boolean(helpURL) && (
          <Box
            className='border rounded-md p-2 px-4 flex items-center justify-center opacity-60 gap-2 hover:bg-primary hover:text-white cursor-pointer'
            onClick={() => window.open(helpURL, '_blank')}
          >
            <small>Help</small>
            <IoIosHelpCircleOutline />
          </Box>
        )}
      </Box>
      )
}

export default PageHeader
