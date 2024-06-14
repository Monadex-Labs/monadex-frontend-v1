import React, { ReactNode } from 'react'
import { Trade } from '@monadex/sdk'
import SwapCallbackError from './SwapCallbackError'
import { Box } from '@mui/material'
import { Button } from '@mui/base'

export default function SwapModalFooter ({
  onConfirm,
  swapErrorMessage,
  disabledConfirm
}: {
  trade: Trade
  onConfirm: () => void
  swapErrorMessage: ReactNode | undefined
  disabledConfirm: boolean
}): React.ReactNode {
  return (
    <Box mt={2} className='swapButtonWrapper'>
      <Button onClick={onConfirm} disabled={disabledConfirm} className='w-full'>
        Confirm Swap
      </Button>
      {swapErrorMessage !== undefined ? <SwapCallbackError error={swapErrorMessage} /> : null}
    </Box>
  )
}
