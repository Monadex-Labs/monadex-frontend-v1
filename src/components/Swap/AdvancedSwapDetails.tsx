import React, { useMemo } from 'react'
import { Percent, TradeType, Trade } from '@monadex/sdk'
import { computeRealizedLPFeePercent } from '@/utils/prices'
import FormattedPriceImpact from './FormattedPriceImpact'
import SwapRoute from './SwapRoute'
import { Box } from '@mui/material'

interface AdvancedSwapDetailsProps {
  trade?: Trade
  allowedSlippage: Percent
}

export function AdvancedSwapDetails ({
  trade,
  allowedSlippage
}: AdvancedSwapDetailsProps): React.ReactNode {
  const { realizedLPFee, priceImpact } = useMemo(() => {
    if (trade == null) return { realizedLPFee: undefined, priceImpact: undefined }

    const realizedLpFeePercent = computeRealizedLPFeePercent(trade)
    const realizedLPFee = trade.inputAmount.multiply(realizedLpFeePercent)
    const priceImpact = trade.priceImpact.subtract(realizedLpFeePercent)
    return { priceImpact, realizedLPFee }
  }, [trade])

  return (trade == null)
    ? null
    : (
      <Box>
        <Box className='flex justify-between' mb={0.5}>
          <p className='caption'>Liquidity Provider Fee</p>
          <p className='caption weight-600 ml-1'>
            {(realizedLPFee != null)
              ? `${realizedLPFee.toSignificant(4)} ${
                trade.inputAmount.currency.symbol ?? 'INVALID SYMBOL'
              }`
              : '-'}
          </p>
        </Box>

        <Box className='flex justify-between' mb={0.5}>
          <p className='caption'>Route</p>
          <div className='caption weight-600 ml-1'>
            <SwapRoute trade={trade} />
          </div>
        </Box>

        <Box className='flex justify-between' mb={0.5}>
          <p className='caption'>Price Impact</p>
          <p className='caption weight-600 ml-1'>
            <FormattedPriceImpact priceImpact={priceImpact} />
          </p>
        </Box>

        <Box className='flex justify-between' mb={0.5}>
          <p className='caption'>
            {trade.tradeType === TradeType.EXACT_INPUT
              ? 'Minimum Received'
              : 'Maximum Sold'}
          </p>
          <p className='caption weight-600 ml-1'>
            {trade.tradeType === TradeType.EXACT_INPUT
              ? `${trade.minimumAmountOut(allowedSlippage).toSignificant(6)} ${
                trade.outputAmount.currency.symbol ?? 'INVALID SYMBOL'
              }`
              : `${trade.maximumAmountIn(allowedSlippage).toSignificant(6)} ${
                trade.inputAmount.currency.symbol ?? 'INVALID SYMBOL'
              }`}
          </p>
        </Box>

        <Box className='flex justify-between'>
          <p className='caption'>Slippage Tolerance</p>
          <p className='caption weight-600 ml-1'>{allowedSlippage.toFixed(2)}%</p>
        </Box>
      </Box>
      )
}
