import { Token, Fraction, Trade, TradeType } from '@monadex/sdk'
import React, { useMemo } from 'react'
import { Box } from '@mui/material'
import { Button } from '@mui/base'
import { Field } from '@/state/swap/actions'
import { DoubleCurrencyLogo } from '@/components'
import { computeSlippageAdjustedAmounts } from '@/utils/price'
import {
  basisPointsToPercent,
  formatTokenAmount
} from '@/utils'
import { ONE } from '@/constants'
import { IoMdArrowDown, IoMdWarning } from 'react-icons/io'

interface SwapModalHeaderProps {
  trade?: Trade
  inputCurrency?: Token
  outputCurrency?: Token
  allowedSlippage: number
  showAcceptChanges: boolean
  onAcceptChanges: () => void
  onConfirm: () => void
}

const SwapModalHeader: React.FC<SwapModalHeaderProps> = ({
  trade,
  inputCurrency,
  outputCurrency,
  allowedSlippage,
  showAcceptChanges,
  onAcceptChanges,
  onConfirm
}) => {
  const slippageAdjustedAmounts = useMemo(
    () => computeSlippageAdjustedAmounts(trade, allowedSlippage),
    [trade, allowedSlippage]
  )

  const pct = basisPointsToPercent(allowedSlippage)

  const bestTradeAmount = (trade != null)
    ? trade.tradeType === TradeType.EXACT_INPUT
      ? new Fraction(ONE).add(pct).invert().multiply(trade.outputAmount).quotient
      : new Fraction(ONE).add(pct).multiply(trade.inputAmount).quotient
    : undefined

  return (
    <Box>
      <Box mt={5} className='flex justify-center'>
        <DoubleCurrencyLogo
          currency0={(trade != null) ? trade.inputAmount.currency : inputCurrency as Token}
          currency1={
            (trade != null) ? trade.outputAmount.currency : outputCurrency as Token
          }
          size={38}
        />
      </Box>
      <Box className='mx-6 my-0 flex flex-col items-center'>
        <p>
          Swap {' '}
          {(trade != null)
            ? formatTokenAmount(trade.inputAmount)
            : ''}{' '}
          {(trade != null)
            ? trade.inputAmount.currency.symbol
            : inputCurrency?.symbol}{' '}
        </p>
        <IoMdArrowDown className='m-3' />
        <p>
          {(trade != null)
            ? formatTokenAmount(trade.outputAmount)
            : ''}{' '}
          {(trade != null)
            ? trade.outputAmount.currency.symbol
            : outputCurrency?.symbol}
        </p>
      </Box>
      {showAcceptChanges && (
        <Box className='p-1 '>
          <Box className='flex justify-center mt-2 mb-4 items-center gap-2'>
            <IoMdWarning className='text-yellow' />
            <p className='text-sm font-medium text-yellow'>Price Updated</p>
          </Box>
          <Button
            onClick={onAcceptChanges}
            className=' w-full bg-gradient-to-r from-[#23006A] to-[#23006A]/50 py-4 px-4 rounded-md disabled:opacity-40'
          >
            Accept
          </Button>
        </Box>
      )}
      <Box className='text-sm text-center'>
        {trade?.tradeType === TradeType.EXACT_INPUT
          ? (
            <p className='font-medium p-1 opacity-40 mt-4'>
              {`Output is estimated. You will receive at least ${
              trade
                ? formatTokenAmount(slippageAdjustedAmounts[Field.OUTPUT])
                : (bestTradeAmount != null) && (outputCurrency != null)
                ? (
                    Number(bestTradeAmount.toString()) /
                    10 ** outputCurrency.decimals
                  ).toLocaleString()
                : ''
            } ${
              trade
                ? trade.outputAmount.currency.symbol ?? 'INVALID SYMBOL'
                : outputCurrency?.symbol ?? 'INVALID SYMBOL'
            } or the transaction will revert.`}
            </p>
            )
          : trade?.tradeType === TradeType.EXACT_OUTPUT
            ? (
              <p className='font-medium p-1 opacity-40 mt-4'>
                {`Input is estimated. You will sell at most ${
              trade
                ? formatTokenAmount(slippageAdjustedAmounts[Field.INPUT])
                : (bestTradeAmount != null) && (inputCurrency != null)
                ? (
                    Number(bestTradeAmount.toString()) /
                    10 ** inputCurrency.decimals
                  ).toLocaleString()
                : ''
            } ${
              trade
                ? trade.inputAmount.currency.symbol ?? 'INVALID SYMBOL'
                : inputCurrency?.symbol ?? 'INVALID SYMBOL'
            }  or the transaction will revert.`}
              </p>
              )
            : (
              <></>
              )}
        <Button onClick={onConfirm} className='mt-4 w-full bg-gradient-to-r from-[#23006A] to-[#23006A]/50 py-4 px-4 rounded-md disabled:opacity-40'>
          Confirm Swap
        </Button>
      </Box>
    </Box>
  )
}

export default SwapModalHeader
