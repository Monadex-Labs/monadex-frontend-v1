import { Box } from '@mui/material'
import React, { ReactNode } from 'react'
import { WarningAmber } from '@mui/icons-material'

export default function SwapCallbackError ({ error }: { error: ReactNode }): React.ReactElement<any> {
  return (
    <Box className='flex items-center justify-center'>
      <Box mr='6px'>
        <WarningAmber />
      </Box>
      <p style={{ wordBreak: 'break-word' }}>{error}</p>
    </Box>
  )
}
