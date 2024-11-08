import { Token, currencyEquals, Trade } from '@monadex/sdk'
import React, { useCallback, useMemo } from 'react'
import {
  TransactionConfirmationModal,
  TransactionErrorContent,
  ConfirmationModalContent
} from '@/components'
import SwapModalHeader from './SwapModalHeader'
import { formatTokenAmount } from '@/utils'

/**
 * Returns true if the trade requires a confirmation of details before we can submit it
 * @param tradeA trade A
 * @param tradeB trade B
 */
function tradeMeaningfullyDiffers (tradeA: Trade, tradeB: Trade): boolean {
  return (
    tradeA.tradeType !== tradeB.tradeType ||
    !currencyEquals(tradeA.inputAmount.currency, tradeB.inputAmount.currency) ||
    !tradeA.inputAmount.equalTo(tradeB.inputAmount) ||
    !currencyEquals(
      tradeA.outputAmount.currency,
      tradeB.outputAmount.currency
    ) ||
    !tradeA.outputAmount.equalTo(tradeB.outputAmount)
  )
}

interface ConfirmSwapModalProps {
  isOpen: boolean
  trade?: Trade
  originalTrade?: Trade
  inputCurrency?: Token
  outputCurrency?: Token
  attemptingTxn: boolean
  txPending?: boolean
  txHash: string | undefined
  recipient: string | null
  allowedSlippage: number
  onAcceptChanges: () => void
  onConfirm: () => void
  swapErrorMessage: string | undefined
  onDismiss: () => void
}

const ConfirmSwapModal: React.FC<ConfirmSwapModalProps> = ({
  trade,
  inputCurrency,
  outputCurrency,
  originalTrade,
  onAcceptChanges,
  allowedSlippage,
  onConfirm,
  onDismiss,
  swapErrorMessage,
  isOpen,
  attemptingTxn,
  txHash,
  txPending
}) => {
  const showAcceptChanges = useMemo(
    () =>
      Boolean(
        (trade != null) &&
          (originalTrade != null) &&
          tradeMeaningfullyDiffers(trade, originalTrade)
      ),
    [originalTrade, trade]
  )

  const modalHeader = useCallback(() => {
    return (trade != null)
      ? (
        <SwapModalHeader
          trade={trade}
          inputCurrency={inputCurrency}
          outputCurrency={outputCurrency}
          allowedSlippage={allowedSlippage}
          onConfirm={onConfirm}
          showAcceptChanges={showAcceptChanges}
          onAcceptChanges={onAcceptChanges}
        />
        )
      : null
  }, [
    allowedSlippage,
    onAcceptChanges,
    showAcceptChanges,
    trade,
    onConfirm,
    inputCurrency,
    outputCurrency
  ])

  const amount1 = formatTokenAmount(trade?.inputAmount)
  const symbol1 = (trade != null)
    ? trade?.inputAmount?.currency?.symbol
    : inputCurrency?.symbol
  const amount2 = formatTokenAmount(trade?.outputAmount)
  const symbol2 = (trade != null)
    ? trade?.outputAmount?.currency?.symbol
    : outputCurrency?.symbol
  // text to show while loading
  const pendingText = `Swapping ${amount1} ${symbol1 ?? 'INVALID SYMBOL'} for ${amount2} ${symbol2 ?? 'INVALID SYMBOL'}`
  const confirmationContent = useCallback(
    () =>
      swapErrorMessage
        ? (
          <TransactionErrorContent
            onDismiss={onDismiss}
            message={swapErrorMessage}
          />
          )
        : (
          <ConfirmationModalContent
            title='Confirm Transaction'
            onDismiss={onDismiss}
            content={modalHeader}
          />
          ),
    [onDismiss, modalHeader, swapErrorMessage]
  )
  return (
    <TransactionConfirmationModal
      isOpen={isOpen}
      onDismiss={onDismiss}
      attemptingTxn={attemptingTxn}
      hash={txHash}
      txPending={txPending}
      content={confirmationContent}
      pendingText={pendingText}
      modalContent={txPending ? 'Submitted transaction to swap your tokens' : 'Successfully swapped your tokens'}
    />
  )
}

export default ConfirmSwapModal
