'use client'
/**
 * AdvancedSwapDetails is used to display the details of a trade using Monadex V1 router
 */
import { Trade, TradeType, Token, CurrencyAmount } from '@monadex/sdk'
import React, { useState } from 'react'
import { Box } from '@mui/material'
import { Field } from '@/state/swap/actions'
import { useUserSlippageTolerance } from '@/state/user/hooks'
import { computeSlippageAdjustedAmounts, computeTradePriceBreakdown } from '@/utils/price'
import SettingsModal from '../CustomModal/SettingsModal'
import QuestionHelper from '../common/QuestionHelper'
import FormattedPriceImpact from '../common/FormattedPriceImpact'
import CurrencyLogo from '../CurrencyLogo'
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
    <Box mt={1.5}>
      {openSettingsModal && (
        <SettingsModal
          open={openSettingsModal}
          onClose={() => setOpenSettingsModal(false)}
        />
      )}
      <Box className='summaryRow'>
          <Box>
            <small>max slippage :</small>
            <QuestionHelper text='slippage helper' />
          </Box>
          <Box
            onClick={() => setOpenSettingsModal(true)}
            className='swapSlippage'
          >
            <small>{allowedSlippage / 100}%</small>
            <MdEdit />
          </Box>
        </Box>
      <Box className='summaryRow'>
          <Box>
            <small>{isExactIn ? 'min received' : 'max sold'}:</small>
            <QuestionHelper text='tx limit Helper' />
            <Box>
            <small>
              {formatTokenAmount(
                slippageAdjustedAmounts[isExactIn ? Field.OUTPUT : Field.INPUT]
              )}{' '}
              {tradeAmount.currency.symbol}
            </small>
            <CurrencyLogo currency={tradeAmount.currency} size='16px' />
          </Box>
          </Box>
          <Box className='summaryRow'>
          <Box>
            <small>priceimpact :</small>
            <QuestionHelper text='priceImpactHelper' />
          </Box>
          <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
        </Box>
          <Box className='summaryRow'>
          <Box>
            <small>liquidityProviderFee :</small>
            <QuestionHelper text='liquidityProviderFeeHelper' />
          </Box>
          <small>
            {formatTokenAmount(realizedLPFee as CurrencyAmount)} {trade.inputAmount.currency.symbol}
          </small>
        </Box>
          <Box className='summaryRow'>
          <Box>
            <small>route :</small>
            <QuestionHelper text='swapRouteHelper' />
          </Box>
          <Box>
            {trade.route.path.map((token, i, path) => {
              const isLastItem: boolean = i === path.length - 1
              return (
                <small key={i}>
                  {token.symbol}{' '}
                  {// this is not to show the arrow at the end of the trade path
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
      {(trade != null) && (
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
