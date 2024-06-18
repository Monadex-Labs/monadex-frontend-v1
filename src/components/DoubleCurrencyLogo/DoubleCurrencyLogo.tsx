import { NativeCurrency, Token } from '@monadex/sdk'
import React from 'react'
import { Box } from '@mui/material'
import { CurrencyLogo } from '@/components'

interface DoubleCurrencyLogoProps {
  size?: number
  currency0?: Token | NativeCurrency
  currency1?: Token | NativeCurrency
}
const DoubleCurrencyLogo: React.FC<DoubleCurrencyLogoProps> = ({
  currency0,
  currency1,
  size = 16
}: DoubleCurrencyLogoProps) => {
  return (
    <Box className='doubleCurrencyLogo'>
      <CurrencyLogo currency={currency0} size={size.toString() + 'px'} />
      <CurrencyLogo currency={currency1} size={size.toString() + 'px'} />
    </Box>
  )
}

export default DoubleCurrencyLogo
