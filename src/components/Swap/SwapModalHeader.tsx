import React, { useState } from 'react'
import { Percent, Trade, TradeType } from '@monadex/sdk'
import { WarningAmber, ArrowDownward } from '@mui/icons-material'
import { FiatValue } from '../CurrencyInputPanel/FiatValue'

import { AdvancedSwapDetails } from './AdvancedSwapDetails'
import TradePrice from './TradePrice'
import { useUSDCValue } from '@/hooks/useUSDCPrice'
import { isAddress } from 'ethers/lib/utils'
import { shortenAddress } from '@/utils'
import CurrencyLogo from '@/components/CurrencyLogo'
import { computeFiatValuePriceImpact } from '@/utils/computeFiatValuePriceImpact'
import { WrappedCurrency } from '@/models/types'
import { Box } from '@mui/material'
import { Button } from '@mui/base'

interface SwapModalHeaderProps {
  trade: Trade
  allowedSlippage: Percent
  recipient: string | null
  showAcceptChanges: boolean
  onAcceptChanges: () => void
}

export default function SwapModalHeader ({
  trade,
  allowedSlippage,
  recipient,
  showAcceptChanges,
  onAcceptChanges
}: SwapModalHeaderProps): React.ReactNode {
  const [showInverted, setShowInverted] = useState<boolean>(false)

  const fiatValueInput = useUSDCValue(trade.inputAmount)
  const fiatValueOutput = useUSDCValue(trade.outputAmount)

  return (
    <div>
      <Box
        className='bg-secondary1'
        borderRadius='6px'
        padding={2}
        paddingTop={2}
      >
        <Box className='flex justify-between'>
          <small>From</small>
          <FiatValue fiatValue={fiatValueInput} />
        </Box>

        <Box mt={1} className='flex justify-between'>
          <Box className='flex'>
            <Box mr='6px'>
              <CurrencyLogo
                currency={trade.inputAmount.currency as WrappedCurrency}
                size='24px'
              />
            </Box>
            <p className='weight-600'>{trade.inputAmount.currency.symbol}</p>
          </Box>
          <p
            className={`truncatedText weight-600 ${
              showAcceptChanges && trade.tradeType === TradeType.EXACT_OUTPUT
                ? 'text-primary'
                : ''
            }`}
          >
            {trade.inputAmount.toSignificant(6)}
          </p>
        </Box>
      </Box>
      <Box className='swapModalHeaderArrowWrapper'>
        <ArrowDownward />
      </Box>
      <Box className='bg-secondary1' borderRadius='6px' marginTop={1}>
        <Box padding={2}>
          <Box className='flex justify-between'>
            <small>To</small>
            <FiatValue
              fiatValue={fiatValueOutput}
              priceImpact={computeFiatValuePriceImpact(
                fiatValueInput,
                fiatValueOutput
              )}
            />
          </Box>

          <Box mt={1} className='flex justify-between'>
            <Box className='flex'>
              <Box mr='6px'>
                <CurrencyLogo
                  currency={trade.outputAmount.currency as WrappedCurrency}
                  size='24px'
                />
              </Box>
              <p className='weight-600'>{trade.outputAmount.currency.symbol}</p>
            </Box>
            <p className='truncatedText weight-600'>
              {trade.outputAmount.toSignificant(6)}
            </p>
          </Box>
        </Box>
      </Box>

      <Box my={2} px={1} className='flex justify-between'>
        <small>Price</small>
        <TradePrice
          price={trade.executionPrice}
          showInverted={showInverted}
          setShowInverted={setShowInverted}
        />
      </Box>

      <Box className='bg-secondary1' borderRadius='6px' padding={1} mb={2}>
        <AdvancedSwapDetails trade={trade} allowedSlippage={allowedSlippage} />
      </Box>

      {showAcceptChanges
        ? (
          <Box
            mb={2}
            p={1}
            borderRadius='6px'
            className='flex items-center bg-primaryLight justify-between'
          >
            <Box className='flex text-primary'>
              <WarningAmber />
              <small>Price Updated</small>
            </Box>
            <Button
              style={{
                padding: '.5rem',
                width: 'fit-content',
                fontSize: '0.825rem',
                borderRadius: '12px'
              }}
              onClick={onAcceptChanges}
            >
              Accept
            </Button>
          </Box>
          )
        : null}

      <div>
        {trade.tradeType === TradeType.EXACT_INPUT
          ? `Output is estimated. You will receive at least ${trade.minimumAmountOut(allowedSlippage).toSignificant(6)} ${trade.outputAmount.currency.symbol ?? 'INVALID SYMBOL'} or the transaction will revert.`
          : `Input is estimated. You will sell at most ${trade.maximumAmountIn(allowedSlippage).toSignificant(6)} ${trade.inputAmount.currency.symbol ?? 'INVALID SYMBOL'} or the transaction will revert.`}
      </div>
      {recipient !== null
        ? (
          <div>
            {'Output will be sent to' + ' '}
            <b title={recipient}>
              {isAddress(recipient) ? shortenAddress(recipient) : recipient}
            </b>
          </div>
          )
        : null}
    </div>
  )
}
