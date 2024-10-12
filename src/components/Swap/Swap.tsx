import React, { useState, useMemo, useCallback, useEffect } from 'react'
import {
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState
} from '@/state/swap/hooks'
import dynamic from 'next/dynamic'
import { useSwapCallback } from '@/hooks/useSwapCallback'
import { useAppDispatch } from '@/state/store'
import { useUserSlippageTolerance } from '@/state/user/hooks'
import { Field, SwapDelay } from '@/state/swap/actions'
import { AdvancedSwapDetails } from './AdvancedSwapDetails'
import CurrencyInput from '@/components/CurrencyInput/CurrencyInput'
import ConfirmSwapModal from './ConfirmSwapModal'
import { AddressInput } from '@/components'
import { HiChevronDown, HiChevronUp } from 'react-icons/hi2'
import {
  useWalletData,
  useIsSupportedNetwork,
  confirmPriceImpactWithoutFee,
  maxAmountSpend,
  halfAmountSpend
} from '@/utils'

import {
  ApprovalState,
  useApproveCallbackFromTrade
} from '@/hooks/useApproveCallback'

import {
  CurrencyAmount,
  JSBI,
  Trade,
  Token,
  ETH,
  currencyEquals,
  NativeCurrency
} from '@monadex/sdk'
import { Box, CircularProgress } from '@mui/material'
import { Button } from '@mui/base'
import { useTransactionFinalizer } from '@/state/transactions/hooks'
import useWrapCallback, { WrapType } from '@/hooks/useWrapCallback'
import { computeTradePriceBreakdown, warningSeverity } from '@/utils/price'
import { useAllTokens, useCurrency } from '@/hooks/Tokens'
import { wrappedCurrency } from '@/utils/wrappedCurrency'
import { SLIPPAGE_AUTO } from '@/state/user/reducer'
import useParsedQueryString from '@/hooks/useParseQueryString'
import { usePathname } from 'next/navigation'
import useSwapRedirects from '@/hooks/useSwapRedirect'
import { updateUserBalance } from '@/state/balance/action'
import { IoMdArrowDown, IoMdRepeat } from 'react-icons/io'
const SwapButton = dynamic(async () => await import('./SwapButton'), { ssr: false })
const Swap: React.FC<{
  currencyBgClass?: string
}> = ({ currencyBgClass }) => {
  const loadedUrlParams = useDefaultsFromURLSearch()
  const pathname = usePathname()
  const isSupportedNetwork = useIsSupportedNetwork()
  // token warning stuff
  // const [loadedInputCurrency, loadedOutputCurrency] = [
  //   useCurrency(loadedUrlParams?.inputCurrencyId),
  //   useCurrency(loadedUrlParams?.outputCurrencyId),
  // ];
  const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(false)
  const [dropdownDetails, setDropDownDetails] = useState<boolean>(false)
  // const urlLoadedTokens: Token[] = useMemo(
  //   () =>
  //     [loadedInputCurrency, loadedOutputCurrency]?.filter(
  //       (c): c is Token => c instanceof Token,
  //     ) ?? [],
  //   [loadedInputCurrency, loadedOutputCurrency],
  // );

  // dismiss warning if all imported tokens are in active lists
  const defaultTokens = useAllTokens()
  // const importTokensNotInDefault =
  //   urlLoadedTokens &&
  //   urlLoadedTokens.filter((token: Token) => {
  //     return !Boolean(token.address in defaultTokens);
  //   });
  const { account, chainId } = useWalletData()
  const dispatch = useAppDispatch()
  const { independentField, typedValue, recipient, swapDelay } = useSwapState()
  const {
    v2Trade, // eeror potential here on input
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError,
    useAutoSlippage: autoSlippage
  } = useDerivedSwapInfo()
  const finalizedTransaction = useTransactionFinalizer()
  const {
    wrapType,
    execute: onWrap,
    inputError: wrapInputError
  } = useWrapCallback(
    currencies[Field.INPUT],
    currencies[Field.OUTPUT],
    typedValue
  )
  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE

  const trade = showWrap ? undefined : v2Trade
  const {
    onCurrencySelection,
    onUserInput,
    onRecipientChange
    // onPurchasedTickets // TODO: check if needed
  } = useSwapActionHandlers()
  let [allowedSlippage] = useUserSlippageTolerance()
  allowedSlippage =
    allowedSlippage === SLIPPAGE_AUTO ? autoSlippage : allowedSlippage
  const [approving, setApproving] = useState(false)
  const [approval, approveCallback] = useApproveCallbackFromTrade(
    trade,
    allowedSlippage
  )
  const dependentField: Field =
    independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT
  const parsedAmounts = useMemo(() => {
    return showWrap
      ? {
          [Field.INPUT]: parsedAmount,
          [Field.OUTPUT]: parsedAmount
        }
      : {
          [Field.INPUT]:
            independentField === Field.INPUT
              ? parsedAmount
              : trade?.inputAmount,
          [Field.OUTPUT]:
            independentField === Field.OUTPUT
              ? parsedAmount
              : trade?.outputAmount
        }
  }, [parsedAmount, independentField, trade, showWrap])

  const formattedAmounts = useMemo(() => {
    return {
      [independentField]: typedValue,
      [dependentField]: showWrap
        ? parsedAmounts[independentField]?.toExact() ?? ''
        : parsedAmounts[dependentField]?.toExact() ?? ''
    }
  }, [independentField, typedValue, dependentField, showWrap, parsedAmounts])
  const route = trade?.route
  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] != null &&
      currencies[Field.OUTPUT] != null &&
      parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
  )
  const noRoute = route == null
  const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade)
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)
  const [mainPrice, setMainPrice] = useState(true)
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)
  const isValid = !swapInputError
  const showApproveFlow =
    !swapInputError &&
    (approval === ApprovalState.NOT_APPROVED ||
      approval === ApprovalState.PENDING ||
      (approvalSubmitted && approval === ApprovalState.APPROVED)) &&
    !(priceImpactSeverity > 3)

  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    } else if (approval === ApprovalState.APPROVED) {
      setApprovalSubmitted(false)
    }
  }, [approval, approvalSubmitted])

  const parsedQs = useParsedQueryString()
  const { redirectWithCurrency, redirectWithSwitch } = useSwapRedirects()
  const parsedCurrency0Id = (parsedQs.currency0 ??
    parsedQs.inputCurrency) as string
  const parsedCurrency1Id = (parsedQs.currency1 ??
    parsedQs.outputCurrency) as string
  const handleCurrencySelect = useCallback(
    (inputCurrency: Token | NativeCurrency) => {
      setApprovalSubmitted(false) // reset 2 step UI for approvals
      const isSwichRedirect = currencyEquals(inputCurrency, ETH)
        ? parsedCurrency1Id === 'ETH'
        : Boolean(parsedCurrency1Id) &&
          inputCurrency !== undefined &&
          Boolean(inputCurrency instanceof Token && inputCurrency.address) &&
          inputCurrency instanceof Token &&
          inputCurrency.address.toLowerCase() ===
            parsedCurrency1Id.toLowerCase()
      if (isSwichRedirect) {
        redirectWithSwitch()
      } else {
        if (
          !(
            inputCurrency instanceof Token &&
            inputCurrency.address in defaultTokens
          )
        ) {
          setDismissTokenWarning(false)
        }
        redirectWithCurrency(inputCurrency, true)
      }
    },
    [parsedCurrency1Id, redirectWithCurrency, redirectWithSwitch, defaultTokens]
  )

  const handleOtherCurrencySelect = useCallback(
    (outputCurrency: Token | NativeCurrency) => {
      const isSwichRedirect = currencyEquals(outputCurrency, ETH)
        ? parsedCurrency0Id === 'ETH'
        : Boolean(parsedCurrency0Id) &&
          outputCurrency &&
          Boolean(outputCurrency instanceof Token && outputCurrency.address) &&
          outputCurrency instanceof Token &&
          outputCurrency.address.toLowerCase() ===
            parsedCurrency0Id.toLowerCase()
      if (isSwichRedirect) {
        redirectWithSwitch()
      } else {
        if (
          !(
            outputCurrency instanceof Token &&
            outputCurrency.address in defaultTokens
          )
        ) {
          setDismissTokenWarning(false)
        }
        redirectWithCurrency(outputCurrency, false)
      }
    },
    [parsedCurrency0Id, redirectWithCurrency, redirectWithSwitch, defaultTokens]
  )

  const parsedCurrency0 = useCurrency(parsedCurrency0Id)
  const parsedCurrency1 = useCurrency(parsedCurrency1Id)
  const parsedCurrency0Fetched = !(parsedCurrency0 == null)
  const parsedCurrency1Fetched = !(parsedCurrency1 == null)
  useEffect(() => {
    if (
      pathname !== '/' &&
      parsedCurrency0Id === '' &&
      parsedCurrency1Id === ''
    ) {
      redirectWithCurrency(ETH, true)
    } else {
      if (parsedCurrency0 != null) {
        onCurrencySelection(Field.INPUT, parsedCurrency0)
      }
      if (parsedCurrency1 != null) {
        onCurrencySelection(Field.OUTPUT, parsedCurrency1)
      }
    }
  }, [
    parsedCurrency0Id,
    parsedCurrency1Id,
    parsedCurrency0Fetched,
    parsedCurrency1Fetched
  ])

  const selectedTokens: Token[] = useMemo(
    () =>
      [parsedCurrency0, parsedCurrency1]?.filter(
        (c): c is Token => c instanceof Token
      ) ?? [],
    [parsedCurrency0, parsedCurrency1]
  )
  // TODO: check if needed
  const selectedTokensNotInDefault = selectedTokens?.filter((token: Token) => {
    return !(token.address in defaultTokens)
  })

  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(
    trade,
    allowedSlippage,
    recipient
  )

  const [
    {
      showConfirm,
      txPending,
      tradeToConfirm,
      swapErrorMessage,
      attemptingTxn,
      txHash
    },
    setSwapState
  ] = useState<{
    showConfirm: boolean
    txPending?: boolean
    tradeToConfirm: Trade | undefined
    attemptingTxn: boolean
    swapErrorMessage: string | undefined
    txHash: string | undefined
  }>({
    showConfirm: false,
    txPending: false,
    tradeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined
  })

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
    },
    [onUserInput]
  )
  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value)
    },
    [onUserInput]
  )

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(
    chainId,
    currencyBalances[Field.INPUT]
  )

  const halfAmountInput: CurrencyAmount | undefined = halfAmountSpend(
    chainId,
    currencyBalances[Field.INPUT]
  )

  const handleMaxInput = useCallback(() => {
    maxAmountInput != null && onUserInput(Field.INPUT, maxAmountInput.toExact())
  }, [maxAmountInput, onUserInput])

  const handleHalfInput = useCallback(() => {
    if (halfAmountInput == null) {
      return
    }

    onUserInput(Field.INPUT, halfAmountInput.toExact())
  }, [halfAmountInput, onUserInput])

  const atMaxAmountInput = Boolean(
    maxAmountInput != null &&
      parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput)
  )

  const onSwap = (): void => {
    if (showWrap && onWrap != null) {
      void onWrap()
    } else {
      setSwapState({
        tradeToConfirm: trade,
        attemptingTxn: false,
        swapErrorMessage: undefined,
        showConfirm: true,
        txHash: undefined
      })
    }
  }

  const handleAcceptChanges = useCallback(() => {
    setSwapState({
      tradeToConfirm: trade,
      swapErrorMessage,
      txHash,
      attemptingTxn,
      showConfirm
    })
  }, [attemptingTxn, showConfirm, swapErrorMessage, trade, txHash])

  const handleConfirmDismiss = useCallback(() => {
    setSwapState({
      showConfirm: false,
      tradeToConfirm,
      attemptingTxn,
      swapErrorMessage,
      txHash
    })
    // if there was a tx hash, we want to clear the input
    // TODO: INTEGRATE MPX REWARDS WITH TXHASH AND ADDRESS CALL ROUTE ALLOCATE MXP ON BACKEND HERE
    if (txHash) {
      onUserInput(Field.INPUT, '')
    }
  }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash])
  const fromTokenWrapped = wrappedCurrency(currencies[Field.INPUT], chainId)
  // ADD REACT GA FOR ANALYTICS LATER ON

  // const onV2TradeAnalytics = useV2TradeTypeAnalyticsCallback(
  //   currencies,
  //   allowedSlippage
  // )
  const handleSwap = useCallback(() => {
    // onV2TradeAnalytics(trade)
    if (
      priceImpactWithoutFee != null &&
      !confirmPriceImpactWithoutFee(priceImpactWithoutFee)
    ) {
      return
    }
    if (swapCallback == null) {
      return
    }
    setSwapState({
      attemptingTxn: true,
      tradeToConfirm,
      showConfirm,
      swapErrorMessage: undefined,
      txHash: undefined
    })
    swapCallback()
      .then(async ({ response, summary }) => {
        setSwapState({
          attemptingTxn: false,
          txPending: true,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: undefined,
          txHash: response.hash
        })

        try {
          const receipt = await response.wait()
          finalizedTransaction(receipt, {
            summary
          })
          dispatch(updateUserBalance())
          setSwapState({
            attemptingTxn: false,
            txPending: false,
            tradeToConfirm,
            showConfirm,
            swapErrorMessage: undefined,
            txHash: response.hash
          })
        } catch (error: any) {
          setSwapState({
            attemptingTxn: false,
            tradeToConfirm,
            showConfirm,
            swapErrorMessage: error?.message,
            txHash: undefined
          })
        }
      })
      .catch(error => {
        console.log('error', error)
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: error?.message,
          txHash: undefined
        })
      })
  }, [
    // onV2TradeAnalytics,
    trade,
    priceImpactWithoutFee,
    swapCallback,
    tradeToConfirm,
    showConfirm,
    finalizedTransaction,
    recipient,
    account,
    fromTokenWrapped,
    chainId,
    formattedAmounts
  ])
  const fetchingBestRoute =
    swapDelay === SwapDelay.USER_INPUT ||
    swapDelay === SwapDelay.FETCHING_SWAP ||
    swapDelay === SwapDelay.FETCHING_BONUS

  const handleApprove = async (): Promise<void> => {
    setApproving(true)
    try {
      await approveCallback()
      setApproving(false)
    } catch (err) {
      setApproving(false)
    }
  }
  console.log('val1', handleTypeOutput)
  return (
    <Box>
      {showConfirm && (
        <ConfirmSwapModal
          isOpen={showConfirm}
          trade={trade}
          originalTrade={tradeToConfirm}
          onAcceptChanges={handleAcceptChanges}
          attemptingTxn={attemptingTxn}
          txPending={txPending}
          txHash={txHash}
          recipient={recipient}
          allowedSlippage={allowedSlippage}
          onConfirm={handleSwap}
          swapErrorMessage={swapErrorMessage}
          onDismiss={handleConfirmDismiss}
        />
      )}
      <CurrencyInput
        title='Pay'
        id='swap-currency-input'
        currency={currencies[Field.INPUT]}
        onHalf={handleHalfInput}
        onMax={handleMaxInput}
        showHalfButton
        showMaxButton={!atMaxAmountInput}
        otherCurrency={currencies[Field.OUTPUT]}
        handleCurrencySelect={handleCurrencySelect}
        amount={formattedAmounts[Field.INPUT]}
        setAmount={handleTypeInput}
        color='secondary'
        bgClass={currencyBgClass}
      />
      <Box className='cursor-pointer flex justify-center items-center relative'>
        <IoMdRepeat
          onClick={redirectWithSwitch}
          className='text-xl opacity-40'
        />
      </Box>
      <CurrencyInput
        title='Receive'
        data-cy='token-amount-output'
        id='swap-currency-output'
        currency={currencies[Field.OUTPUT]}
        showPrice={Boolean(trade?.executionPrice)}
        showMaxButton={false}
        otherCurrency={currencies[Field.INPUT]}
        handleCurrencySelect={handleOtherCurrencySelect}
        amount={formattedAmounts[Field.OUTPUT]}
        setAmount={handleTypeOutput}
        color='secondary'
        bgClass={currencyBgClass}
      />
      {!showWrap && (
        <Box className=''>
          <Box className='flex space-between items-center p-3 gap-2'>
            <Button
              onClick={() => onRecipientChange(recipient !== null ? null : '')}
              className='text-sm font-clash text-white/60'
            >
              {recipient !== null
                ? 'Remove Recipient -'
                : 'Add Recipient +'}
            </Button>
          </Box>
          {recipient !== null && (
            <AddressInput
              label=''
              placeholder='Destination Address'
              value={recipient}
              onChange={onRecipientChange}
            />
          )}
        </Box>
      )}
      {trade?.executionPrice != null && (
        <Box
          className='flex gap-2 opacity-80 mt-2 font-regular border py-2 border-primary/30 rounded-md p-2 justify-between items-center ease-out mb-5'
          onClick={() => setDropDownDetails(!dropdownDetails)}
        >
          <p className='flex gap-2 items-center'>
            1{' '}
            {
              (mainPrice ? currencies[Field.INPUT] : currencies[Field.OUTPUT])
                ?.symbol
            }{' '}
            ≈ {' '}
            {(mainPrice
              ? trade.executionPrice
              : trade.executionPrice.invert()
            ).toSignificant(6)}{' '}
            {
              (mainPrice ? currencies[Field.OUTPUT] : currencies[Field.INPUT])
                ?.symbol
            }{' '}
            <IoMdRepeat
              className='text-lg cursor-pointer'
              onClick={() => {
                setMainPrice(!mainPrice)
              }}
            />
          </p>
          {dropdownDetails ? <HiChevronUp size={20} /> : <HiChevronDown size={20} />}
        </Box>
      )}
      {dropdownDetails && (
        !showWrap && fetchingBestRoute
? (
          <Box mt={2} className='flex justify-center gap-2 items-center flex-col'>
            <CircularProgress className='text-semibold' size={16} />
            <p className='text-xs mb-2'>Fetching Best Quote</p>
          </Box>
        )
: (
          <AdvancedSwapDetails trade={trade} />
        )
      )}
      <Box>
        <Box>
          <SwapButton
            account={account}
            isSupportedNetwork={isSupportedNetwork}
            currencies={currencies}
            formattedAmounts={formattedAmounts}
            showWrap={showWrap}
            noRoute={noRoute}
            userHasSpecifiedInputOutput={userHasSpecifiedInputOutput}
            priceImpactSeverity={priceImpactSeverity}
            wrapInputError={wrapInputError}
            wrapType={wrapType}
            chainId={chainId}
            swapInputError={swapInputError}
            swapCallbackError={swapCallbackError}
            showApproveFlow={showApproveFlow}
            isValid={isValid}
            approval={approval}
            onSwap={onSwap}
            handleApprove={handleApprove}
          />
        </Box>
      </Box>
    </Box>
  )
}
export default Swap
