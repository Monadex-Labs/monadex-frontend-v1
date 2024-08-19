'use client'

import { ALLOWED_PRICE_IMPACT_HIGH } from "@/constants"
import { ApprovalState } from "@/hooks/useApproveCallback"
import { WrapType } from "@/hooks/useWrapCallback"
import { ChainId, MONAD, Token, WMND, currencyEquals } from "@monadex/sdk"
import { Field } from '@/state/swap/actions'
import { useEffect, useMemo, useState } from "react"
import { Button } from "@mui/base"
import { useConnectWallet } from "@web3-onboard/react"
import { useWalletData } from "@/utils"

type Props = {
  account: string
  isSupportedNetwork: boolean
  currencies: {
    INPUT?: Token | undefined;
    OUTPUT?: Token | undefined;
  }
  formattedAmounts: {
    [x: string]: string;
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
    onSwap
  } = props

  const [, connect] = useConnectWallet()
  const { isConnected } = useWalletData()
  const [swapButtonText, setSwapButtonText] = useState('')
  const [swapButtonDisabled, setSwapButtonDisabled] = useState(true)
  
  useEffect(() => {
    if (account) {
      if (!isSupportedNetwork) setSwapButtonText('Switch Network')
      if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
        setSwapButtonText('Select a token')
      } else if (
        formattedAmounts[Field.INPUT] === '' &&
        formattedAmounts[Field.OUTPUT] === ''
      ) {
        setSwapButtonText('Enter Amount')
      } else if (showWrap) {
        if (wrapInputError) setSwapButtonText(wrapInputError)
        setSwapButtonText(wrapType === WrapType.WRAP
          ? `Wrap Monad ${MONAD.symbol ?? '[INVALID SYMBOL]'}`
          : wrapType === WrapType.UNWRAP
          ? `Unwrap Monad ${WMND[chainId].symbol ?? '[INVALID SYMBOL]'}`
          : wrapType === WrapType.WRAPPING
          ? `Wrapping Monad ${MONAD.symbol ?? '[INVALID SYMBOL]'}`
          : wrapType === WrapType.UNWRAPPING
          ? `Unwrapping Monad ${WMND[chainId].symbol ?? '[INVALID SYMBOL]'}`
          : '')
      } else if (noRoute && userHasSpecifiedInputOutput) {
        setSwapButtonText('Insufficient liquidity for this trade.')
      } else if (priceImpactSeverity > 3) {
        setSwapButtonText(`Price impact is more than ${Number(
          ALLOWED_PRICE_IMPACT_HIGH.multiply('100').toFixed(4)
        )}`)
      } else {
        setSwapButtonText(swapInputError ?? swapCallbackError ?? 'Swap')
      }
    } else {
      setSwapButtonText('Connect Wallet')
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
    swapCallbackError
  ])

  useEffect(() => {
    const inputCurrency = currencies[Field.INPUT]

    if (account) {
      if (!isSupportedNetwork) setSwapButtonDisabled(false)
      if (showWrap) {
        setSwapButtonDisabled(
          Boolean(wrapInputError) ||
          wrapType === WrapType.WRAPPING ||
          wrapType === WrapType.UNWRAPPING
        )
      } else if (noRoute && userHasSpecifiedInputOutput) {
        setSwapButtonDisabled(true)
      } else if (showApproveFlow) {
        setSwapButtonDisabled(
          !isValid ||
          approval !== ApprovalState.APPROVED ||
          priceImpactSeverity > 3
        )
      } else {
        setSwapButtonDisabled(
          (inputCurrency &&
            chainId &&
            currencyEquals(inputCurrency, MONAD) &&
            approval === ApprovalState.UNKNOWN) ||
          !isValid ||
          priceImpactSeverity > 3 ||
          !!swapCallbackError
        )
      }
    } else {
      setSwapButtonDisabled(false)
    }
  }, [
    currencies,
    account,
    isSupportedNetwork,
    showWrap,
    noRoute,
    userHasSpecifiedInputOutput,
    showApproveFlow,
    wrapInputError,
    wrapType,
    isValid,
    approval,
    priceImpactSeverity,
    chainId,
    swapCallbackError
  ])
  return (
    <Button
      className='w-full bg-primary py-4 px-4 rounded-md disabled:opacity-40'
      disabled={showApproveFlow || (swapButtonDisabled as boolean)}
      onClick={isConnected && isSupportedNetwork ? onSwap : async () => await connect()}

    >
      {swapButtonText}
    </Button>
  )
}

export default SwapButton
