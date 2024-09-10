'use'
import { Box } from '@mui/material'
import React, { lazy } from 'react'
const Swap = lazy(async () =>
  await import('@/components/Swap/Swap').then(module => ({ default: module.default }))
)

const SwapMain: React.FC = () => {
  return (
    <>
      <Box>
        <Swap />
      </Box>
    </>
  )
}
export default SwapMain
