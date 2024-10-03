'use client'
/**
 * AdvancedSwapDetails is used to display the details of a trade using Monadex V1 router
 */
import { Trade, TradeType, CurrencyAmount } from '@monadex/sdk'
import React, { useState } from 'react'
import { Box, Divider } from '@mui/material'
import { Field } from '@/state/swap/actions'
import { useUserSlippageTolerance } from '@/state/user/hooks'
import { computeSlippageAdjustedAmounts, computeTradePriceBreakdown } from '@/utils/price'
import { QuestionHelper, CurrencyLogo, SettingsModal, FormattedPriceImpact } from '@/components'
import { MdEdit } from 'react-icons/md'
import { formatTokenAmount, useWalletData } from '@/utils'
import { useDerivedSwapInfo } from '@/state/swap/hooks'
import { SLIPPAGE_AUTO } from '@/constants'
import { IoIosArrowRoundForward } from 'react-icons/io'
import useUSDCPrice from '@/utils/useUsdcPrice'

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
  const currency = isExactIn ? trade.route.input : trade.route.output

  const usdPriceV2 = Number(useUSDCPrice(currency)?.toSignificant() ?? 0)
  const usdPrice = usdPriceV2

  const price = usdPrice * Number(formatTokenAmount(
    slippageAdjustedAmounts[isExactIn ? Field.OUTPUT : Field.INPUT]
  ))

  const tradeAmount = isExactIn ? trade.outputAmount : trade.inputAmount
  const pairAddress: string | null = trade.route.pairs[0].liquidityToken.address ? trade.route.pairs[0].liquidityToken.address : '...'

  return (
    <Box mt={1.5} className='rounded-sm  flex flex-col p-3 text-textSecondary  mb-2 text-lg'>
      {openSettingsModal && (
        <SettingsModal
          open={openSettingsModal}
          onClose={() => setOpenSettingsModal(false)}
        />
      )}
      <div className='flex flex-col mt-2'>
        <p className='text-md text-white font-regular'>Fees</p>
      </div>
      <Box className='py-2 flex justify-between'>
        <Box className='flex gap-2 flex-row items-center'>
          <QuestionHelper text='A portion of each trade (0.30%) goes to liquidity providers as a protocol incentive.' />
          <small>Liquidity Provider Fee</small>
        </Box>
        <Box className='flex flex-col justify-center items-end'>
          <p className='text-sm text-white font-regular'>
            {price < 0.1
              ? (
                  '<$0.1'
                )
              : price.toLocaleString('us')}
          </p>
          <small>
            {formatTokenAmount(realizedLPFee as CurrencyAmount)} {trade.inputAmount.currency.symbol}
          </small>
        </Box>
      </Box>
      <Divider className='bg-primary/30' />
      <Box className='flex justify-between items-center font-semibold text-primary'>
        <Box className='flex gap-2'>
          <QuestionHelper text='Your transaction will revert if the price changes unfavorably by more than this percentage.' />
          <small>Slippage Tolerance</small>
        </Box>
        <Box
          onClick={() => setOpenSettingsModal(true)}
          className='flex gap-2 justify-center items-center'
        >
          <small>{allowedSlippage / 100}%</small>
          <MdEdit />
        </Box>
      </Box>
      <Box className=''>
        <Box className='flex justify-between items-center'>
          <div className='flex gap-2'>
            <QuestionHelper text='Your transaction will revert if there is a large, unfavorable price movement before it is confirmed.' />
            <small>{isExactIn ? 'Minimum Received' : 'Maximum Sold'}:</small>
          </div>
          <Box className='flex gap-2 justify-center items-center'>
            <small>
              {formatTokenAmount(
                slippageAdjustedAmounts[isExactIn ? Field.OUTPUT : Field.INPUT]
              )}{' '}
              {tradeAmount.currency.symbol}
            </small>
            <CurrencyLogo currency={tradeAmount.currency} size='16px' />
          </Box>
        </Box>

        <Box className='flex justify-between'>
          <Box className='flex gap-2'>
            <QuestionHelper text='The difference between the market price and estimated price due to trade size.' />
            <small>Price impact</small>
          </Box>
          <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
        </Box>
        <Divider className='bg-primary/30' />
        <div className='flex flex-col mt-2'>
          <p className='text-md text-white font-regular'>Route</p>
        </div>
        <Box className='py-1 flex justify-between items-center'>
          <Box className='flex flex-row justify-center items-center gap-1'>
            {trade.route.path.map((token, i, path) => {
              const isLastItem: boolean = i === path.length - 1
              console.log('route lenght', path)
              return (
                <React.Fragment key={token.address}>
                  <Box className='flex flex-col items-center gap-1'>
                    <p className='text-sm font-semibold'>{token.symbol}</p>
                  </Box>
                  {!isLastItem && (
                    <div className='flex items-center justify-center gap-1 flex-col'>
                      <IoIosArrowRoundForward className='' size={33} />
                    </div>
                  )}
                </React.Fragment>
              )
            })}
          </Box>
          <Box className='flex gap-2 items-center justify-center'>
            {/* <QuestionHelper text='Routing through these tokens resulted in the best price for your trade.' /> */}
            <small>100%</small>
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
