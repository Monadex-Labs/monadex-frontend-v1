'use client'
/**
 * AdvancedSwapDetails is used to display the details of a trade using Monadex V1 router
 */
import { Trade, TradeType, CurrencyAmount } from '@monadex/sdk'
import React, { useState } from 'react'
import { Box } from '@mui/material'
import { Field } from '@/state/swap/actions'
import { useUserSlippageTolerance } from '@/state/user/hooks'
import { computeSlippageAdjustedAmounts, computeTradePriceBreakdown } from '@/utils/price'
import { QuestionHelper, CurrencyLogo, SettingsModal, FormattedPriceImpact } from '@/components'
import { MdEdit } from 'react-icons/md'
import { formatTokenAmount } from '@/utils'
import { useDerivedSwapInfo } from '@/state/swap/hooks'
import { SLIPPAGE_AUTO } from '@/constants'
interface TradeSummaryProps {
  trade: Trade
  allowedSlippage: number
}
export const TradeSummary: React.FC<TradeSummaryProps> = ({
  trade,
  allowedSlippage
}) => {
  const [openSettingsModal, setOpenSettingsModal] = useState(false)
  const { priceImpactWithoutFee, realizedLPFee } = computeTradePriceBreakdown(trade)
  const isExactIn = trade.tradeType === TradeType.EXACT_INPUT
  const slippageAdjustedAmounts = computeSlippageAdjustedAmounts(
    trade,
    allowedSlippage
  )
  const tradeAmount = isExactIn ? trade.outputAmount : trade.inputAmount

  return (
    <Box mt={1.5} className='rounded-sm  flex flex-col p-3 text-textSecondary transition duration-150 ease-in-out'>
      {openSettingsModal && (
        <SettingsModal
          open={openSettingsModal}
          onClose={() => setOpenSettingsModal(false)}
        />
      )}
      <Box className='flex justify-between items-center font-semibold text-primary underline underline-offset-3 decoration-dotted	'>
        <Box className='flex gap-2'>
          <QuestionHelper text='Your transaction will revert if the price changes unfavorably by more than this percentage.' />
          <small>Max Slippage:</small>
        </Box>
        <Box
          onClick={() => setOpenSettingsModal(true)}
          className='flex gap-2'
        >
          <small>{allowedSlippage / 100}%</small>
          <MdEdit />
        </Box>
      </Box>
      <Box className='mt-3'>
        <Box className='py-2 flex justify-between items-center'>
          <div className='flex gap-2'>
            <QuestionHelper text='Your transaction will revert if there is a large, unfavorable price movement before it is confirmed.' />
            <small>{isExactIn ? 'Minimum Received' : 'Maximum Sold'}:</small>
          </div>
          <Box className='flex gap-2'>
            <small>
              {formatTokenAmount(
                slippageAdjustedAmounts[isExactIn ? Field.OUTPUT : Field.INPUT]
              )}{' '}
              {tradeAmount.currency.symbol}
            </small>
            <CurrencyLogo currency={tradeAmount.currency} size='16px' />
          </Box>
        </Box>
        <Box className='py-2 flex justify-between'>
          <Box className='flex gap-2'>
            <QuestionHelper text='The difference between the market price and estimated price due to trade size.' />
            <small>Price impact:</small>
          </Box>
          <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
        </Box>
        <Box className='py-2 flex justify-between'>
          <Box className='flex gap-2'>
            <QuestionHelper text='A portion of each trade (0.30%) goes to liquidity providers as a protocol incentive.' />
            <small>Liquidity Provider Fee:</small>
          </Box>
          <small>
            {formatTokenAmount(realizedLPFee as CurrencyAmount)} {trade.inputAmount.currency.symbol}
          </small>
        </Box>
        <Box className='py-2 flex justify-between'>
          <Box className='flex gap-2 items-center'>
            <QuestionHelper text='Routing through these tokens resulted in the best price for your trade.' />
            <small>Route:</small>
          </Box>
          <Box>
            {trade.route.path.map((token, i, path) => {
              const isLastItem: boolean = i === path.length - 1
              return (
                <small key={i}>
                  {token.symbol}{' '}
                  {
                  isLastItem ? '' : ' > '
                  }
                </small>
              )
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
export interface AdvancedSwapDetailsProps {
  trade?: Trade
}

export const AdvancedSwapDetails: React.FC<AdvancedSwapDetailsProps> = ({
  trade
}) => {
  const [allowedSlippage] = useUserSlippageTolerance()
  const { useAutoSlippage } = useDerivedSwapInfo()

  return (
    <>
      {trade && (
        <TradeSummary
          trade={trade}
          allowedSlippage={
            allowedSlippage === SLIPPAGE_AUTO ? useAutoSlippage : allowedSlippage
          }
        />
      )}
    </>
  )
}
