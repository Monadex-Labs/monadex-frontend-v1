'use client'

import { ALLOWED_PRICE_IMPACT_HIGH } from '@/constants'
import { ApprovalState } from '@/hooks/useApproveCallback'
import { WrapType } from '@/hooks/useWrapCallback'
import { ChainId, ETH, NativeCurrency, Token, WMND, currencyEquals } from '@monadex/sdk'
import { Field } from '@/state/swap/actions'
import { useEffect, useState, useMemo } from 'react'
import { Button } from '@mui/base'
import { useConnectWallet } from '@web3-onboard/react'
import { useWalletData } from '@/utils'
import { Box, CircularProgress } from '@mui/material'
import { useSwitchNetwork } from '@/utils'

interface Props {
  account: string
  isSupportedNetwork: boolean
  currencies: {
    INPUT?: Token | NativeCurrency | undefined
    OUTPUT?: Token | NativeCurrency | undefined
  }
  formattedAmounts: {
    [x: string]: string
  }
  showWrap: boolean
  noRoute: boolean
  userHasSpecifiedInputOutput: boolean
  priceImpactSeverity: 0 | 4 | 3 | 1 | 2
  wrapInputError: string | undefined
  wrapType: WrapType
  chainId: ChainId
  swapInputError: string | undefined
  swapCallbackError: string | null
  showApproveFlow: boolean
  isValid: boolean
  approval: ApprovalState
  handleApprove: () => Promise<void>
  onSwap: () => void
}

const SwapButton = (props: Props): JSX.Element => {
  const {
    account,
    isSupportedNetwork,
    currencies,
    formattedAmounts,
    showWrap,
    noRoute,
    userHasSpecifiedInputOutput,
    priceImpactSeverity,
    wrapInputError,
    wrapType,
    chainId,
    swapInputError,
    swapCallbackError,
    showApproveFlow,
    isValid,
    approval,
    onSwap,
    handleApprove
  } = props

  const [, connect] = useConnectWallet()
  const { isConnected } = useWalletData()
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)
  const { switchNetwork } = useSwitchNetwork()
  const buttonState = useMemo(() => {
    if (!account) return { text: 'Connect Wallet', action: connect, disabled: false }
    if (account && !isSupportedNetwork) return { text: 'Switch Network', action: () => switchNetwork , disabled: false }
    if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) return { text: 'Select a token', action: () => {}, disabled: true }
    if (formattedAmounts[Field.INPUT] === '' && formattedAmounts[Field.OUTPUT] === '') return { text: 'Enter Amount', action: () => {}, disabled: true }
    
    if (showWrap) {
      if (wrapInputError) return { text: wrapInputError, action: () => {}, disabled: true }
      const wrapText = wrapType === WrapType.WRAP ? `Wrap` : wrapType === WrapType.UNWRAP ? `Unwrap` : ''
      const symbol = wrapType === WrapType.WRAP ? ETH.symbol : WMND[chainId].symbol
      return { 
        text: `${wrapText} Monad ${symbol ?? '[INVALID SYMBOL]'}`,
        action: onSwap,
        disabled: wrapType === WrapType.WRAPPING || wrapType === WrapType.UNWRAPPING
      }
    }

    if (noRoute && userHasSpecifiedInputOutput) return { text: 'Insufficient liquidity for this trade.', action: () => {}, disabled: true }
    if (priceImpactSeverity > 3) return { 
      text: `Price impact is more than ${Number(ALLOWED_PRICE_IMPACT_HIGH.multiply('100').toFixed(4))}`,
      action: () => {},
      disabled: true
    }

    switch (approval) {
      case ApprovalState.PENDING:
        return { text: 'Approving', action: () => {}, disabled: true }
      case ApprovalState.NOT_APPROVED:
        return { 
          text: `Approve ${currencies[Field.INPUT]?.symbol ?? '[INVALID SYMBOL]'}`,
          action: handleApprove,
          disabled: false
        }
      case ApprovalState.APPROVED:
        return { 
          text: swapInputError ?? swapCallbackError ?? 'Swap',
          action: onSwap,
          disabled: !isValid || !!swapCallbackError
        }
      default:
        return { text: 'Unknown approval state', action: () => {}, disabled: true }
    }
  }, [
    account,
    isSupportedNetwork,
    currencies,
    formattedAmounts,
    showWrap,
    noRoute,
    userHasSpecifiedInputOutput,
    priceImpactSeverity,
    wrapInputError,
    wrapType,
    chainId,
    swapInputError,
    swapCallbackError,
    approval,
    isValid,
    onSwap,
    handleApprove,
    connect
  ])

  const handleClick = async () => {
    if (buttonState.action === handleApprove) {
      setApprovalSubmitted(true)
    }
    await buttonState.action()
  }

  return (
    <Button
      className='w-full bg-primary py-4 px-4 rounded-md disabled:opacity-40 bg-opacity-90 text-lg'
      disabled={buttonState.disabled}
      onClick={handleClick}
    >
      {approval === ApprovalState.PENDING ? (
        <Box className='flex items-center justify-center'>
          Approving <CircularProgress size={16} className="ml-2" />
        </Box>
      ) : (
        buttonState.text
      )}
    </Button>
  )
}

export default SwapButton