import { NativeCurrency, Token, Fraction, Percent } from '@monadex/sdk'
import React, { useState } from 'react'
import { Box } from '@mui/material'
import { useUserSlippageTolerance } from '@/state/user/hooks'
import { computePriceImpact } from '@/utils/price'
import { QuestionHelper, FormattedPriceImpact, CurrencyLogo, SettingsModal } from '@/components'
import { MdEdit } from 'react-icons/md'
import { basisPointsToPercent } from '@/utils'
import { OptimalRate } from '@paraswap/sdk'
import { ONE, SLIPPAGE_AUTO } from '@/constants'
import { useAutoSlippageToleranceBestTrade } from '@/hooks/useAutoSlippageTolerance'

export enum SwapSide {
  BUY = 'BUY',
  SELL = 'SELL'
}
interface TradeSummaryProps {
  optimalRate: OptimalRate
  allowedSlippage: Percent
  inputCurrency: Token | NativeCurrency
  outputCurrency: Token | NativeCurrency
}
const BestTradeSummary: React.FC<TradeSummaryProps> = ({
  optimalRate,
  allowedSlippage,
  inputCurrency,
  outputCurrency
}) => {
  const [openSettingsModal, setOpenSettingsModal] = useState(false)
  const [userSlippage] = useUserSlippageTolerance()
  const priceImpactWithoutFee = computePriceImpact(optimalRate)
  const isExactIn = optimalRate.side === SwapSide.SELL
  const currency = isExactIn ? outputCurrency : inputCurrency
  const autoSlippage = useAutoSlippageToleranceBestTrade(optimalRate)
  const tradeAmount = isExactIn
    ? new Fraction(ONE)
      .add(userSlippage === SLIPPAGE_AUTO ? autoSlippage : allowedSlippage)
      .invert()
      .multiply(optimalRate.destAmount).quotient
    : new Fraction(ONE)
      .add(userSlippage === SLIPPAGE_AUTO ? autoSlippage : allowedSlippage)
      .multiply(optimalRate.srcAmount).quotient

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
          <small>
            {userSlippage === SLIPPAGE_AUTO
              ? Number(autoSlippage.toSignificant())
              : Number(allowedSlippage.toSignificant())}
            %
          </small>
          <MdEdit />
        </Box>
        <Box className='summaryRow'>
          <Box>
            <small>{isExactIn ? 'min received' : 'max sold'}:</small>
            <QuestionHelper text='tx limit helder' />
          </Box>
          <Box>
            <small>
              {(
                Number(tradeAmount.toString()) /
              10 ** currency.decimals
              ).toLocaleString('us')}{' '}
              {currency.symbol}
            </small>

            <CurrencyLogo currency={currency as Token} size='16px' />
          </Box>
        </Box>
        <Box className='summaryRow'>
          <Box>
            <small>price impact :</small>
            <QuestionHelper text='priceImpactHelper' />
          </Box>
          <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
        </Box>
      </Box>
    </Box>
  )
}

export interface BestTradeAdvancedSwapDetailsProps {
  optimalRate?: OptimalRate | null
  inputCurrency?: Token | NativeCurrency
  outputCurrency?: Token | NativeCurrency
}

export const BestTradeAdvancedSwapDetails: React.FC<BestTradeAdvancedSwapDetailsProps> = ({
  optimalRate,
  inputCurrency,
  outputCurrency
}) => {
  const [allowedSlippage] = useUserSlippageTolerance()
  const pct = basisPointsToPercent(allowedSlippage)

  return (
    <>
      {(inputCurrency != null) && (outputCurrency != null) && (optimalRate != null) && (
        <BestTradeSummary
          optimalRate={optimalRate}
          inputCurrency={inputCurrency}
          outputCurrency={outputCurrency}
          allowedSlippage={pct}
        />
      )}
    </>
  )
}

export default {
  BestTradeSummary,
  BestTradeAdvancedSwapDetails
}
