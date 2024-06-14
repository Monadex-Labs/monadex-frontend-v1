import React, { useCallback } from 'react'
import { Price } from '@monadex/sdk'
import { Box } from '@mui/material'

interface TradePriceProps {
  price: Price
  showInverted: boolean
  setShowInverted: (showInverted: boolean) => void
}

export default function TradePrice ({
  price,
  showInverted,
  setShowInverted
}: TradePriceProps): React.ReactNode {
  let formattedPrice: string
  try {
    formattedPrice = showInverted
      ? price.toSignificant(4)
      : price.invert()?.toSignificant(4)
  } catch (error) {
    formattedPrice = '0'
  }

  const label = showInverted
    ? `${price.quoteCurrency?.symbol ?? ''}`
    : `${price.baseCurrency?.symbol ?? ''} `
  const labelInverted = showInverted
    ? `${price.baseCurrency?.symbol ?? ''} `
    : `${price.quoteCurrency?.symbol ?? ''}`
  const flipPrice = useCallback(() => setShowInverted(!showInverted), [
    setShowInverted,
    showInverted
  ])

  const text = `${'1 ' + labelInverted + ' = ' + formattedPrice ??
    '-'} ${label}`

  return (
    <Box className='cursor-pointer' onClick={flipPrice}>
      <small>{text}</small>
    </Box>
  )
}
