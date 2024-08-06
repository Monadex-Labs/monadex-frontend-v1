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
  console.log('dodo',trade.outputAmount,trade.inputAmount )
  return (
    <Box mt={1.5}className='rounded-sm font-fira flex flex-col p-3 text-textSecondary transition duration-150 ease-in-out'>
      {openSettingsModal && (
        <SettingsModal
          open={openSettingsModal}
          onClose={() => setOpenSettingsModal(false)}
        />
      )}
      <Box className='flex justify-between items-center'>
        <Box className='flex gap-2'>
          <QuestionHelper text='slippage helper' />
          <small>max slippage :</small>
        </Box>
        <Box
          onClick={() => setOpenSettingsModal(true)}
          className='flex gap-2'
        >
          <small>{allowedSlippage / 100}%</small>
          <MdEdit />
        </Box>
      </Box>
      <Box className=''>
        <Box className='py-2 flex justify-between items-center'>
          <div className='flex gap-2'>
          <QuestionHelper text='tx limit Helper' />
          <small>{isExactIn ? 'min received' : 'max sold'}:</small>
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
            <QuestionHelper text='priceImpactHelper' />
            <small>price impact :</small>
          </Box>
          <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
        </Box>
        <Box className='py-2 flex justify-between'>
          <Box className='flex gap-2'>
            <QuestionHelper text='liquidityProviderFeeHelper' />
            <small>liquidity Provider Fee :</small>
          </Box>
          <small>
            {formatTokenAmount(realizedLPFee as CurrencyAmount)} {trade.inputAmount.currency.symbol}
          </small>
        </Box>
        <Box className='py-2 flex justify-between'>
          <Box className='flex gap-2'>
          <QuestionHelper text='swapRouteHelper' />
          <small>route :</small>
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
