import { Token, Fraction, Trade, TradeType } from '@monadex/sdk'
import React, { useMemo } from 'react'
import { Box } from '@mui/material'
import { Button } from '@mui/base'
import { Field } from '@/state/swap/actions'
import { DoubleCurrencyLogo } from '@/components'
import { useUSDCPriceFromAddress } from '@/utils/useUsdcPrice'
import { computeSlippageAdjustedAmounts } from '@/utils/price'
import { ArrowDownward, WarningAmber } from '@mui/icons-material'
import {
  basisPointsToPercent,
  formatTokenAmount,
  useWalletData
} from '@/utils'
import { OptimalRate, SwapSide } from '@paraswap/sdk'
import { ONE } from '@/constants'
import { wrappedCurrency } from '@/utils/wrappedCurrency'

interface SwapModalHeaderProps {
  trade?: Trade
  optimalRate?: OptimalRate | null
  inputCurrency?: Token
  outputCurrency?: Token
  allowedSlippage: number
  showAcceptChanges: boolean
  onAcceptChanges: () => void
  onConfirm: () => void
}

const SwapModalHeader: React.FC<SwapModalHeaderProps> = ({
  trade,
  optimalRate,
  inputCurrency,
  outputCurrency,
  allowedSlippage,
  showAcceptChanges,
  onAcceptChanges,
  onConfirm
}) => {
  const { chainId } = useWalletData()
  const slippageAdjustedAmounts = useMemo(
    () => computeSlippageAdjustedAmounts(trade, allowedSlippage),
    [trade, allowedSlippage]
  )
  const wrappedToken = wrappedCurrency(
    trade != null ? trade.inputAmount.currency : inputCurrency,
    chainId
  )
  const { price: usdPrice } = useUSDCPriceFromAddress(
    wrappedToken?.address ?? ''
  )

  const pct = basisPointsToPercent(allowedSlippage)

  const bestTradeAmount =
    optimalRate != null
      ? optimalRate.side === SwapSide.SELL
        ? new Fraction(ONE).add(pct).invert().multiply(optimalRate.destAmount)
          .quotient
        : new Fraction(ONE).add(pct).multiply(optimalRate.srcAmount).quotient
      : undefined

  return (
    <Box>
      <Box mt={10} className='flex justify-center'>
        <DoubleCurrencyLogo
          currency0={trade != null ? trade.inputAmount.currency : inputCurrency}
          currency1={
            trade != null ? trade.outputAmount.currency : outputCurrency
          }
          size={48}
        />
      </Box>
      <Box className='swapContent'>
        <p>
          Swap{' '}
          {optimalRate != null
            ? (
                Number(optimalRate.srcAmount) /
                10 ** optimalRate.srcDecimals
              ).toLocaleString('us')
            : trade != null
              ? formatTokenAmount(trade.inputAmount)
              : ''}{' '}
          {trade != null
            ? trade.inputAmount.currency.symbol
            : inputCurrency?.symbol}{' '}
          ($
          {(
            (usdPrice ?? 0) *
            (optimalRate != null
              ? Number(optimalRate.srcAmount) / 10 ** optimalRate.srcDecimals
              : trade != null
                ? Number(trade.inputAmount.toSignificant())
                : 0)
          ).toLocaleString('us')}
          )
        </p>
        <ArrowDownward />
        <p>
          {optimalRate != null
            ? (
                Number(optimalRate.destAmount) /
                10 ** optimalRate.destDecimals
              ).toLocaleString('us')
            : trade != null
              ? formatTokenAmount(trade.outputAmount)
              : ''}{' '}
          {trade != null
            ? trade.outputAmount.currency.symbol
            : outputCurrency?.symbol}
        </p>
      </Box>
      {showAcceptChanges && (
        <Box className='priceUpdate'>
          <Box>
            <WarningAmber />
            <p>Price Updated</p>
          </Box>
          <Button onClick={onAcceptChanges}>Accept</Button>
        </Box>
      )}
      <Box className='transactionText'>
        {trade?.tradeType === TradeType.EXACT_INPUT ||
        optimalRate?.side === SwapSide.SELL
          ? (
            <p className='small'>
              {`Output is estimated. You will receive at least ${
              trade != null
                ? formatTokenAmount(slippageAdjustedAmounts[Field.OUTPUT])
                : bestTradeAmount != null && outputCurrency != null
                ? (
                    Number(bestTradeAmount.toString()) /
                    10 ** outputCurrency.decimals
                  ).toLocaleString()
                : ''
            } ${
              trade != null
                ? trade.outputAmount.currency.symbol ?? 'INVALID SYMBOL'
                : outputCurrency?.symbol ?? 'INVALID SYMBOL'
            } or the transaction will revert.`}
            </p>
            )
          : trade?.tradeType === TradeType.EXACT_OUTPUT ||
          optimalRate?.side === SwapSide.BUY
            ? (
              <p className='small'>
                {`Input is estimated. You will sell at most ${
              trade != null
                ? formatTokenAmount(slippageAdjustedAmounts[Field.INPUT])
                : bestTradeAmount != null && inputCurrency != null
                ? (
                    Number(bestTradeAmount.toString()) /
                    10 ** inputCurrency.decimals
                  ).toLocaleString()
                : ''
            } ${
              trade != null
                ? trade.inputAmount.currency.symbol ?? 'INVALID SYMBOL'
                : inputCurrency?.symbol ?? 'INVALID SYMBOL'
            }  or the transaction will revert.`}
              </p>
              )
            : (
              <></>
              )}
        <Button onClick={onConfirm} className='swapButton'>
          Confirm Swap
        </Button>
      </Box>
    </Box>
  )
}

export default SwapModalHeader
