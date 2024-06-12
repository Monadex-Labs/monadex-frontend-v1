import React, { useState, useMemo, useCallback, useEffect } from 'react'
import {
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState
} from '@/state/swap/hooks'
import { useSwapCallback } from '@/hooks/useSwapCallback'

import {
  useUserSlippageTolerance
} from '@/state/user/hooks'
import { Field, SwapDelay } from '@/state/swap/actions'
import {
  CurrencyInput,
  ConfirmSwapModal,
  AdvancedSwapDetails,
  AddressInput
} from '@/components'
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
} from '@/hooks/useApprouveCallback'
import {
  CurrencyAmount,
  JSBI,
  Trade,
  Token,
  ChainId,
  MONAD,
  currencyEquals,
  WMND
} from '@monadex/sdk'
import { ArrowDownward, CurrencyExchange } from '@mui/icons-material'
import { Box, CircularProgress } from '@mui/material'
import { Button } from '@mui/base'
import { useTransactionFinalizer } from '@/state/transactions/hooks'
import useWrapCallback, { WrapType } from '@/hooks/useWrapCallback'
import useToggledVersion, { Version } from '@/hooks/useToggledVersion'
import { computeTradePriceBreakdown, warningSeverity } from '@utils/prices'
import TokenWarningModal from 'components/v3/TokenWarningModal'
import { useHistory } from 'react-router-dom'
import { useAllTokens, useCurrency } from '@/hooks/Tokens'
import useParsedQueryString from '@/hooks/useParsedQueryString'
import useSwapRedirects from '@/hooks/useSwapRedirect'
import { GlobalValue } from '@/constants/index'
import { getConfig } from '@/config/index'
import { wrappedCurrency } from '@/utils/wrappedCurrency'
import { useUSDCPriceFromAddress } from '@/utils/useUSDCPrice'
import { V2_ROUTER_ADDRESS } from '@/constants/v3/addresses'
import { useV2TradeTypeAnalyticsCallback } from './LiquidityHub'
import { SLIPPAGE_AUTO } from '@/state/user/reducer'
import { useWalletInfo } from '@web3modal/ethers5/react'

const Swap: React.FC<{
  currencyBgClass?: string
}> = ({ currencyBgClass }) => {
  const loadedUrlParams = useDefaultsFromURLSearch()
  const history = useHistory()
  const isProMode = useIsProMode()
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
  const handleConfirmTokenWarning = useCallback(() => {
    setDismissTokenWarning(true)
  }, [])

  // reset if they close warning without tokens in params
  const handleDismissTokenWarning = useCallback(() => {
    setDismissTokenWarning(true)
    history.push('/swap?swapIndex=1')
  }, [history])

  // dismiss warning if all imported tokens are in active lists
  const defaultTokens = useAllTokens()
  // const importTokensNotInDefault =
  //   urlLoadedTokens &&
  //   urlLoadedTokens.filter((token: Token) => {
  //     return !Boolean(token.address in defaultTokens);
  //   });

  const { account, chainId } = useWalletData()
  const chainIdToUse = chainId || ChainId.MONAD
  const { independentField, typedValue, recipient, swapDelay } = useSwapState()
  const {
    v1Trade,
    v2Trade,
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError,
    autoSlippage
  } = useDerivedSwapInfo()
  const toggledVersion = useToggledVersion()
  const finalizedTransaction = useTransactionFinalizer()
  const [isExpertMode] = useExpertModeManager()
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
  const tradesByVersion = {
    [Version.v1]: v1Trade,
    [Version.v2]: v2Trade
  }
  const trade = showWrap ? undefined : tradesByVersion[toggledVersion]
  const {
    onCurrencySelection,
    onUserInput,
    onChangeRecipient
  } = useSwapActionHandlers()
  const { address: recipientAddress } = useENSAddress(recipient)
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
    (currencies[Field.INPUT] != null) &&
      (currencies[Field.OUTPUT] != null) &&
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

  const { isConnected } = useWalletData()
  const parsedQs = useParsedQueryString()
  const { redirectWithCurrency, redirectWithSwitch } = useSwapRedirects()
  const parsedCurrency0Id = (parsedQs.currency0 ??
    parsedQs.inputCurrency) as string
  const parsedCurrency1Id = (parsedQs.currency1 ??
    parsedQs.outputCurrency) as string

  const handleCurrencySelect = useCallback(
    (inputCurrency: Token) => {
      setApprovalSubmitted(false) // reset 2 step UI for approvals
      const isSwichRedirect = currencyEquals(inputCurrency, MONAD)
        ? parsedCurrency1Id === 'MONAD'
        : Boolean(parsedCurrency1Id) &&
          inputCurrency !== undefined &&
          Boolean(inputCurrency.address) &&
          inputCurrency.address.toLowerCase() ===
            parsedCurrency1Id.toLowerCase()
      if (isSwichRedirect) {
        redirectWithSwitch()
      } else {
        if (!(inputCurrency.address in defaultTokens)) {
          setDismissTokenWarning(false)
        }
        redirectWithCurrency(inputCurrency, true)
      }
    },
    [
      parsedCurrency1Id,
      redirectWithCurrency,
      redirectWithSwitch,
      chainIdToUse,
      defaultTokens
    ]
  )

  const handleOtherCurrencySelect = useCallback(
    (outputCurrency: Token) => {
      const isSwichRedirect = currencyEquals(
        outputCurrency,
        MONAD
      )
        ? parsedCurrency0Id === 'MONAD'
        : Boolean(parsedCurrency0Id) &&
          outputCurrency !== undefined &&
          Boolean(outputCurrency.address) &&
          outputCurrency.address.toLowerCase() ===
            parsedCurrency0Id.toLowerCase()
      if (isSwichRedirect) {
        redirectWithSwitch()
      } else {
        if (!(outputCurrency.address in defaultTokens)) {
          setDismissTokenWarning(false)
        }
        redirectWithCurrency(outputCurrency, false)
      }
    },
    [
      parsedCurrency0Id,
      redirectWithCurrency,
      redirectWithSwitch,
      chainIdToUse,
      defaultTokens
    ]
  )

  const parsedCurrency0 = useCurrency(parsedCurrency0Id)
  const parsedCurrency1 = useCurrency(parsedCurrency1Id)
  const parsedCurrency0Fetched = !(parsedCurrency0 == null)
  const parsedCurrency1Fetched = !(parsedCurrency1 == null)
  useEffect(() => {
    if (
      history.location.pathname !== '/' &&
      parsedCurrency0Id === '' &&
      parsedCurrency1Id === ''
    ) {
      redirectWithCurrency(MONAD, true)
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
  const selectedTokensNotInDefault =
    selectedTokens?.filter((token: Token) => {
      return !(token.address in defaultTokens)
    })

  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(
    trade,
    allowedSlippage,
    recipient
  )

  const swapButtonText = useMemo(() => {
    if (account !== '') {
      if (!isSupportedNetwork) return 'Switch Network'
      if ((currencies[Field.INPUT] == null) || (currencies[Field.OUTPUT] == null)) {
        return 'Select a token'
      } else if (
        formattedAmounts[Field.INPUT] === '' &&
        formattedAmounts[Field.OUTPUT] === ''
      ) {
        return 'Enter Amount'
      } else if (showWrap) {
        if (wrapInputError) return wrapInputError
        return wrapType === WrapType.WRAP
          ? `Wrap ${MONAD.symbol ?? '[INVALID SYMBOL]'}`
          : wrapType === WrapType.UNWRAP
            ? `Unwrap ${WMND[chainId].symbol ?? '[INVALID SYMBOL]'}`
            : wrapType === WrapType.WRAPPING
              ? `Wrapping ${MONAD.symbol ?? '[INVALID SYMBOL]'}`
              : wrapType === WrapType.UNWRAPPING
                ? `Unwrapping ${WMND[chainId].symbol ?? '[INVALID SYMBOL]'}`
                : ''
      } else if (noRoute && userHasSpecifiedInputOutput) {
        return 'Insufficient liquidity for this trade.'
      } else if (priceImpactSeverity > 3) {
        return `Price impact is more than ${
          Number(
            GlobalValue.percents.ALLOWED_PRICE_IMPACT_HIGH.multiply(
              '100'
            ).toFixed(4)
          )
        }%. Please use best trade or v3.`
      } else {
        return swapInputError ?? swapCallbackError ?? 'Swap'
      }
    } else {
      return 'Connect Wallet'
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
    isExpertMode,
    wrapInputError,
    wrapType,
    chainId,
    swapInputError,
    swapCallbackError
  ])

  const swapButtonDisabled = useMemo(() => {
    const inputCurrency = currencies[Field.INPUT]
    if (account != null) {
      if (!isSupportedNetwork) return false
      if (showWrap) {
        return (
          Boolean(wrapInputError) ||
          wrapType === WrapType.WRAPPING ||
          wrapType === WrapType.UNWRAPPING
        )
      } else if (noRoute && userHasSpecifiedInputOutput) {
        return true
      } else if (showApproveFlow) {
        return (
          !isValid ||
          approval !== ApprovalState.APPROVED ||
          (priceImpactSeverity > 3)
        )
      } else {
        return (
          ((inputCurrency != null) &&
            chainId !== undefined &&
            currencyEquals(inputCurrency, MONAD) &&
            approval === ApprovalState.UNKNOWN) ||
          !isValid ||
          (priceImpactSeverity > 3) ||
          swapCallbackError !== ''
        )
      }
    } else {
      return false
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
    isExpertMode,
    chainId,
    swapCallbackError
  ])

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
    chainIdToUse,
    currencyBalances[Field.INPUT]
  )

  const halfAmountInput: CurrencyAmount | undefined = halfAmountSpend(
    chainIdToUse,
    currencyBalances[Field.INPUT]
  )

  const handleMaxInput = useCallback(() => {
    (maxAmountInput != null) && onUserInput(Field.INPUT, maxAmountInput.toExact())
  }, [maxAmountInput, onUserInput])

  const handleHalfInput = useCallback(() => {
    if (halfAmountInput == null) {
      return
    }

    onUserInput(Field.INPUT, halfAmountInput.toExact())
  }, [halfAmountInput, onUserInput])

  const atMaxAmountInput = Boolean(
    (maxAmountInput != null) && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput)
  )

  const onSwap = (): void => {
    if (showWrap && onWrap) {
      onWrap()
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
    if (txHash != null) {
      onUserInput(Field.INPUT, '')
    }
  }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash])

  const config = getConfig(chainId)
  const fromTokenWrapped = wrappedCurrency(currencies[Field.INPUT], chainId)
  const { price: fromTokenUSDPrice } = useUSDCPriceFromAddress(
    fromTokenWrapped?.address ?? ''
  )

  const onV2TradeAnalytics = useV2TradeTypeAnalyticsCallback(
    currencies,
    allowedSlippage
  )

  const { walletInfo } = useWalletInfo()

  const handleSwap = useCallback(() => {
    onV2TradeAnalytics(trade)
    if (
      priceImpactWithoutFee &&
      !confirmPriceImpactWithoutFee(priceImpactWithoutFee, t)
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
    onV2TradeAnalytics,
    trade,
    priceImpactWithoutFee,
    swapCallback,
    tradeToConfirm,
    showConfirm,
    finalizedTransaction,
    recipient,
    recipientAddress,
    account,
    fromTokenWrapped,
    walletInfo,
    chainId,
    config,
    formattedAmounts,
    fromTokenUSDPrice
  ])

  const fetchingBestRoute =
    swapDelay === SwapDelay.USER_INPUT ||
    swapDelay === SwapDelay.FETCHING_SWAP ||
    swapDelay === SwapDelay.FETCHING_BONUS

  return (
    <Box>
      <TokenWarningModal
        isOpen={selectedTokensNotInDefault.length > 0 && !dismissTokenWarning}
        tokens={selectedTokensNotInDefault}
        onConfirm={handleConfirmTokenWarning}
        onDismiss={handleDismissTokenWarning}
      />
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
        title='From: '
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
      <Box className='exchangeSwap'>
        <CurrencyExchange onClick={redirectWithSwitch} />
      </Box>
      <CurrencyInput
        title='To (estimate):'
        id='swap-currency-output'
        currency={currencies[Field.OUTPUT]}
        showPrice={Boolean(trade && trade.executionPrice)}
        showMaxButton={false}
        otherCurrency={currencies[Field.INPUT]}
        handleCurrencySelect={handleOtherCurrencySelect}
        amount={formattedAmounts[Field.OUTPUT]}
        setAmount={handleTypeOutput}
        color='secondary'
        bgClass={currencyBgClass}
      />
      {trade?.executionPrice && (
        <Box className='swapPrice'>
          <small>Price:</small>
          <small>
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
            <CurrencyExchange
              onClick={() => {
                setMainPrice(!mainPrice)
              }}
            />
          </small>
        </Box>
      )}
      {!showWrap && (
        <Box className='recipientInput'>
          <Box className='recipientInputHeader'>
            {recipient !== null
              ? (
                <ArrowDownward />
                )
              : (
                <Box />
                )}
            <Button
              onClick={() => onChangeRecipient(recipient !== null ? null : '')}
            >
              {recipient !== null
                ? '- Remove send'
                : '+ Add a send (optional)'}
            </Button>
          </Box>
          {recipient !== null && (
            <AddressInput
              label='Recipient'
              placeholder='Wallet Address or ENS name'
              value={recipient}
              onChange={onChangeRecipient}
            />
          )}
        </Box>
      )}
      {!showWrap && fetchingBestRoute
        ? (
          <Box mt={2} className='flex justify-center'>
            <p>Fetching Best Route...</p>
          </Box>
          )
        : (
          <AdvancedSwapDetails trade={trade} />
          )}
      <Box className='swapButtonWrapper'>
        {showApproveFlow && (
          <Box width='48%'>
            <Button
              className='w-full'
              disabled={
                approving ||
                approval !== ApprovalState.NOT_APPROVED ||
                approvalSubmitted
              }
              onClick={async () => {
                setApproving(true)
                try {
                  await approveCallback()
                  setApproving(false)
                } catch (err) {
                  setApproving(false)
                }
              }}
            >
              {approvalSubmitted && approval !== ApprovalState.APPROVED
                ? (
                  <Box className='content'>
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
          <Button
            fullWidth
            disabled={showApproveFlow || (swapButtonDisabled)}
            onClick={account && isSupportedNetwork ? onSwap : isConnected}
          >
            {swapButtonText}
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

export default Swap
