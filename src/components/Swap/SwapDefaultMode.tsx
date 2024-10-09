'use client'
import { Box } from '@mui/material'
import React from 'react'
// import LiquidityPools from './LiquidityPools'; get pools liq component 'it will be on pool overview page'
import SwapMain from './SwapMain'
const SwapDefaultMode: React.FC<{
  token1: any
  token2: any
}> = ({ token1, token2 }) => {
  return (
    <>
      <Box>
        <SwapMain />
      </Box>
    </>
  )
}

export default SwapDefaultMode
