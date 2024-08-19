import React, { useState, useMemo, useCallback, useEffect } from 'react'
import {
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState
} from '@/state/swap/hooks'
import { useSwapCallback } from '@/hooks/useSwapCallback'
import { useAppDispatch } from '@/state/store'
import {
  useUserSlippageTolerance
} from '@/state/user/hooks'
import { Field, SwapDelay } from '@/state/swap/actions'
import { AdvancedSwapDetails } from './AdvancedSwapDetails'
import CurrencyInput from '@/components/CurrencyInput/CurrencyInput'
import ConfirmSwapModal from './ConfirmSwapModal'
import { AddressInput } from '@/components'
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
  MONAD,
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
import SwapButton from './SwapButton'

const Swap: React.FC<{
  currencyBgClass?: string
}> = ({ currencyBgClass }) => {
  const pathname = usePathname()
  const isSupportedNetwork = useIsSupportedNetwork()
  // token warning stuff
  // const [loadedInputCurrency, loadedOutputCurrency] = [
  //   useCurrency(loadedUrlParams?.inputCurrencyId),
  //   useCurrency(loadedUrlParams?.outputCurrencyId),
  // ];
  const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(
    false
  )
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
  const { account, chainId, isConnected } = useWalletData()
  const dispatch = useAppDispatch()
  const { independentField, typedValue, recipient, swapDelay } = useSwapState()
  const {
    v2Trade,  // eeror potential here on input
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
    onRecipientChange,
    // onPurchasedTickets // TODO: check if needed
  } = useSwapActionHandlers()
  let [allowedSlippage] = useUserSlippageTolerance()
  allowedSlippage = allowedSlippage === SLIPPAGE_AUTO ? autoSlippage : allowedSlippage
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
    (currencies[Field.INPUT]) &&
      (currencies[Field.OUTPUT]) &&
      parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
  )
  const noRoute = !route
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
          const isSwichRedirect = currencyEquals(inputCurrency, MONAD)
            ? parsedCurrency1Id === 'MONAD'
            : Boolean(parsedCurrency1Id) &&
              inputCurrency !== undefined &&
              Boolean(inputCurrency instanceof Token && inputCurrency.address) &&
              inputCurrency instanceof Token && inputCurrency.address.toLowerCase() ===
                parsedCurrency1Id.toLowerCase()
          if (isSwichRedirect) {
            redirectWithSwitch()
          } else {
            if (!(inputCurrency instanceof Token && inputCurrency.address in defaultTokens)) {
              setDismissTokenWarning(false)
            }
            redirectWithCurrency(inputCurrency, true)
          }
        },
        [
          parsedCurrency1Id,
          redirectWithCurrency,
          redirectWithSwitch,
          defaultTokens
        ]
      )
    
      const handleOtherCurrencySelect = useCallback(
        (outputCurrency: Token | NativeCurrency) => {
          const isSwichRedirect = currencyEquals(
            outputCurrency,
            MONAD
          )
            ? parsedCurrency0Id === 'MONAD'
            : Boolean(parsedCurrency0Id) &&
              outputCurrency &&
              Boolean(outputCurrency instanceof Token && outputCurrency.address) &&
              outputCurrency instanceof Token && outputCurrency.address.toLowerCase() ===
                parsedCurrency0Id.toLowerCase()
          if (isSwichRedirect) {
            redirectWithSwitch()
          } else {
            if (!(outputCurrency instanceof Token && outputCurrency.address in defaultTokens)) {
              setDismissTokenWarning(false)
            }
            redirectWithCurrency(outputCurrency, false)
          }
        },
        [
          parsedCurrency0Id,
          redirectWithCurrency,
          redirectWithSwitch,
          defaultTokens
        ]
      )
    
      const parsedCurrency0 = useCurrency(parsedCurrency0Id)
      const parsedCurrency1 = useCurrency(parsedCurrency1Id)
      const parsedCurrency0Fetched = !!parsedCurrency0
      const parsedCurrency1Fetched = !!parsedCurrency1 
      useEffect(() => {
        if (
          pathname !== '/' &&
          parsedCurrency0Id === '' &&
          parsedCurrency1Id === ''
        ) {
          redirectWithCurrency(MONAD, true)
        } else {
          if (parsedCurrency0) {
            onCurrencySelection(Field.INPUT, parsedCurrency0)
          }
          if (parsedCurrency1) {
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
      const selectedTokensNotInDefault =
        selectedTokens?.filter((token: Token) => {
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
        (maxAmountInput) && onUserInput(Field.INPUT, maxAmountInput.toExact())
      }, [maxAmountInput, onUserInput])
    
      const handleHalfInput = useCallback(() => {
        if (!halfAmountInput) {
          return
        }
    
        onUserInput(Field.INPUT, halfAmountInput.toExact())
      }, [halfAmountInput, onUserInput])
    
      const atMaxAmountInput = Boolean(
        (maxAmountInput) && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput)
      )
    
      const onSwap = () => {
        if (showWrap && onWrap) {
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
          (priceImpactWithoutFee) &&
          !confirmPriceImpactWithoutFee(priceImpactWithoutFee)
        ) {
          return
        }
        if (!swapCallback) {
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
          .catch((error) => {
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
      title='From '
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
      <IoMdRepeat onClick={redirectWithSwitch} className='text-xl opacity-40' />
    </Box>
    <CurrencyInput
      title='To'
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
    {((trade?.executionPrice)) && (
      <Box className='flex gap-2 opacity-40 mt-2'>
        <small>Price:</small>
        <small className='flex gap-2'>
          1{' '}
          {
            (mainPrice ? currencies[Field.INPUT] : currencies[Field.OUTPUT])
              ?.symbol
          }{' '}
          ={' '}
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
        </small>
      </Box>
    )}
    {!showWrap && (
      <Box className=''>
        <Box className='flex space-between items-center p-3 gap-2 '>
          {recipient !== null
            ? (
              <IoMdArrowDown className='text-sm opacity-40' />
              )
            : (
              <Box />
              )}
          <Button
            onClick={() => onRecipientChange(recipient !== null ? null : '')}
            className='w-full text-xs py-2 my-4 rounded-sm text-xl font-medium opacity-40 bg-gradient-to-b from-[#1E0349] border border-secondary3'
          >
            
            {recipient !== null
              ? 'Remove Recipient Address'
              : 'Add Recipient Address'}
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
    {!showWrap && fetchingBestRoute
      ? (
        <Box mt={2} className='flex justify-center gap-2 items-center flex-col'>
          <CircularProgress size={16} />
          <p className='text-xs mb-2'>Fetching Best Route</p>
        </Box>
        )
      : (
        <AdvancedSwapDetails trade={trade} />
        )}
    <Box className=''>
      {showApproveFlow && (
        <Box width='48%'>
          <Button
            className='w-full'
            disabled={
              approving ||
              approval !== ApprovalState.NOT_APPROVED ||
              approvalSubmitted
            }
            onClick={() => { void handleApprove() }}
          >
            {approvalSubmitted && approval !== ApprovalState.APPROVED
              ? (
                <Box className='border'>
                  Approving <CircularProgress size={16} />
                </Box>
                )
              : approvalSubmitted && approval === ApprovalState.APPROVED
                ? 'Approved'
                : (
              `Approve ${currencies[Field.INPUT]?.symbol ?? '[INVALID SYMBOL]'}`
                  )}
          </Button>
        </Box>
      )}
      <Box width={showApproveFlow ? '48%' : '100%'}>
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
        ></SwapButton>
      </Box>
    </Box>
  </Box>
  )
}
export default Swap
