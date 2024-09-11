'use client'
/**
 * AdvancedSwapDetails is used to display the details of a trade using Monadex V1 router
 */
import Image from 'next/image'
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
import Dash from '@/static/assets/dash.svg'
import { IoIosArrowRoundForward } from 'react-icons/io'
import { usePoolFee } from '@/utils/getPoolFee'

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
  const pairAddress:string | null = trade.route.pairs[0].liquidityToken.address ? trade.route.pairs[0].liquidityToken.address : '...'
  const poolFee = usePoolFee(pairAddress)
  return (
    <Box mt={1.5} className='rounded-sm  flex flex-col p-3 text-textSecondary  mb-2 text-lg transition duration-150 ease-in-out'>
      {openSettingsModal && (
        <SettingsModal
          open={openSettingsModal}
          onClose={() => setOpenSettingsModal(false)}
        />
      )}
      <Box className='flex justify-between items-center font-semibold  text-primary underline underline-offset-3 decoration-dotted	'>
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
        <Box className='py-2 flex justify-between border flex-col border-dashed rounded-lg border-primary mt-1 mb-1'>
          <Box className='flex gap-2 items-center justify-center mb-3'>
            <QuestionHelper text='Routing through these tokens resulted in the best price for your trade.' />
            <p className='text-center text-sm font-semibold'>Route</p>
          </Box>
          <Box className='flex flex-row justify-center items-center gap-3'>
            {trade.route.path.map((token, i, path) => {
              const isLastItem: boolean = i === path.length - 1
              return (
                <React.Fragment key={token.address}>
                  <Box className='flex flex-col items-center gap-2'>
                    <CurrencyLogo currency={token} size='23px' />
                    <p className='text-sm font-semibold'>{token.symbol}</p>
                  </Box>
                  {!isLastItem && (
                    <div className='flex items-center gap-2 flex-col'>
                    <small className='text-white px-3 py-1 rounded-full bg-primary'>{poolFee}</small>
                    <IoIosArrowRoundForward className="text-primary" size={33} />
                    </div>
                  )}
                </React.Fragment>
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
