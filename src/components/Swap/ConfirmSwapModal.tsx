import React, { ReactElement, ReactNode, useCallback, useMemo } from 'react'
import { Percent, Trade } from '@monadex/sdk'
import TransactionConfirmationModal, {
  ConfirmationModalContent,
  TransactionErrorContent
} from '@/components/TransactionConfirmationModal'
import SwapModalFooter from './SwapModalFooter'
import SwapModalHeader from './SwapModalHeader'

/**
 * Returns true if the trade requires a confirmation of details before we can submit it
 * @param args either a pair of V2 trades or a pair of V3 trades
 */
function tradeMeaningfullyDiffers (
  ...args: [
    Trade,
    Trade,
  ]
): boolean {
  const [tradeA, tradeB] = args
  return (
    tradeA.tradeType !== tradeB.tradeType ||
    !(tradeA.inputAmount.currency === tradeB.inputAmount.currency) ||
    !tradeA.inputAmount.equalTo(tradeB.inputAmount) ||
    !(tradeA.outputAmount.currency === tradeB.outputAmount.currency) ||
    !tradeA.outputAmount.equalTo(tradeB.outputAmount)
  )
}

interface ConfirmSwapModalProps {
  isOpen: boolean
  trade: Trade | undefined
  originalTrade: Trade | undefined
  attemptingTxn: boolean
  txHash: string | undefined
  recipient: string | null
  allowedSlippage: Percent
  onAcceptChanges: () => void
  onConfirm: () => void
  swapErrorMessage: ReactNode | undefined
  onDismiss: () => void
  txPending?: boolean
}

export default function ConfirmSwapModal ({
  trade,
  originalTrade,
  onAcceptChanges,
  allowedSlippage,
  onConfirm,
  onDismiss,
  recipient,
  swapErrorMessage,
  isOpen,
  attemptingTxn,
  txHash,
  txPending
}: ConfirmSwapModalProps): ReactElement {
  const showAcceptChanges = useMemo(
    () =>
      Boolean(
        trade instanceof Trade &&
          originalTrade instanceof Trade &&
          tradeMeaningfullyDiffers(trade, originalTrade)
      ),
    [originalTrade, trade]
  )

  const modalHeader = useCallback(() => {
    return (trade != null)
      ? (
        <SwapModalHeader
          trade={trade}
          allowedSlippage={allowedSlippage}
          recipient={recipient}
          showAcceptChanges={showAcceptChanges}
          onAcceptChanges={onAcceptChanges}
        />
        )
      : null
  }, [allowedSlippage, onAcceptChanges, recipient, showAcceptChanges, trade])

  const modalBottom = useCallback(() => {
    return (trade != null)
      ? (
        <SwapModalFooter
          onConfirm={onConfirm}
          trade={trade}
          disabledConfirm={showAcceptChanges}
          swapErrorMessage={swapErrorMessage}
        />
        )
      : null
  }, [onConfirm, showAcceptChanges, swapErrorMessage, trade])

  // text to show while loading
  const pendingText = `Swapping ${trade?.inputAmount?.toSignificant(6) ?? 'INVALID AMOUNT'} 
    ${trade?.inputAmount?.currency?.symbol ?? 'INVALID SYMBOL'} for 
    ${trade?.outputAmount?.toSignificant(6) ?? 'INVALID AMOUNT'} 
    ${trade?.outputAmount?.currency?.symbol ?? 'INVALID SYMBOL'}`

  const confirmationContent = useCallback(
    () =>
      swapErrorMessage !== undefined
        ? (
          <TransactionErrorContent
            onDismiss={onDismiss}
            message={swapErrorMessage}
          />
          )
        : (
          <ConfirmationModalContent
            title='Confirm Swap'
            onDismiss={onDismiss}
            topContent={modalHeader}
            bottomContent={modalBottom}
          />
          ),
    [onDismiss, modalBottom, modalHeader, swapErrorMessage]
  )

  return (
    <TransactionConfirmationModal
      isOpen={isOpen}
      onDismiss={onDismiss}
      attemptingTxn={attemptingTxn}
      hash={txHash}
      content={confirmationContent}
      pendingText={pendingText}
      txPending={txPending}
    />
  )
}
