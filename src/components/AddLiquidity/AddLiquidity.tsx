import { useCallback, useEffect, useState, useMemo, ReactElement } from 'react'
import { Box } from '@mui/material'
import { Button } from '@mui/base'
import {
  CurrencyInput,
  TransactionErrorContent,
  TransactionConfirmationModal,
  ConfirmationModalContent,
  DoubleCurrencyLogo
} from '@/components'
import { TransactionResponse } from '@ethersproject/providers'
import { BigNumber } from '@ethersproject/bignumber'
import {
  currencyEquals,
  MONAD,
  TokenAmount,
  ChainId,
  Token,
  CurrencyAmount,
  NativeCurrency
} from '@monadex/sdk'
import { useWalletData } from '@/utils/index'
import { useConnectWallet } from '@web3-onboard/react'
import { useRouterContract } from '@/hooks/useContracts'
import useTransactionDeadline from '@/hooks/useTransactionDeadline'
import { ApprovalState, useApproveCallback } from '@/hooks/useApprouveCallback'
import { Field } from '@/state/mint/actions'
import { PairState } from '@/data/Reserves'
import {
  useTransactionAdder,
  useTransactionFinalizer
} from '@/state/transactions/hooks'
import {
  useDerivedMintInfo,
  useMintActionHandlers,
  useMintState
} from '@/state/mint/hooks'
import { useTokenBalance } from '@/state/wallet/hooks'
import { useUserSlippageTolerance } from '@/state/user/hooks'

import {
  maxAmountSpend,
  calculateSlippageAmount,
  calculateGasMargin,
  useIsSupportedNetwork,
  formatTokenAmount,
  halfAmountSpend
} from '@/utils'
import { wrappedCurrency } from '@/utils/wrappedCurrency'
import { PiTestTubeFill } from 'react-icons/pi' // liquidity icon
import useParsedQueryString from '@/hooks/useParseQueryString'
import { _useCurrency } from '@/hooks/Tokens'
import { useDerivedSwapInfo } from '@/state/swap/hooks'
import { useParams } from 'next/navigation'
import { V1_ROUTER_ADDRESS } from '@/constants/index'
import usePoolsRedirects from '@/hooks/usePoolsRedirect'
import { SLIPPAGE_AUTO } from '@/state/user/reducer'

/* TODO: Check if this is the correct place for this */
interface AddLiquidityParams {
  tokenA: string
  tokenB: string
  amountADesired: BigNumber
  amountBDesired: BigNumber
  amountAMin: BigNumber
  amountBMin: BigNumber
  receiver: string
  deadline: BigNumber
}

// TODO: use BigNumber to match uint256 (pending confirmation)
interface AddLiquidityNative {
  token: string
  amountTokenDesired: string
  amountTokenMin: string
  amountNativeTokenMin: string
  receiver: string
  deadline: string
}

const AddLiquidity: React.FC<{
  currencyBgClass?: string
}> = ({ currencyBgClass }) => {
  const [addLiquidityErrorMessage, setAddLiquidityErrorMessage] = useState<
  string | null
  >(null)
  const isSupportedNetwork = useIsSupportedNetwork()
  const { account, chainId, provider } = useWalletData()
  const chainIdToUse = chainId ?? ChainId.MONAD
  const nativeCurrency = MONAD
  const { useAutoSlippage } = useDerivedSwapInfo()

  const [showConfirm, setShowConfirm] = useState(false)
  const [attemptingTxn, setAttemptingTxn] = useState(false)
  const [txPending, setTxPending] = useState(false)
  let [allowedSlippage] = useUserSlippageTolerance()
  allowedSlippage =
    allowedSlippage === SLIPPAGE_AUTO ? useAutoSlippage : allowedSlippage
  const deadline = useTransactionDeadline()
  const [txHash, setTxHash] = useState('')
  const addTransaction = useTransactionAdder()
  const finalizedTransaction = useTransactionFinalizer()

  // queried currency
  const params: any = useParams()
  const parsedQuery = useParsedQueryString()
  const currency0Id =
    params?.currencyIdA
      ? params.currencyIdA.toLowerCase() === 'mnd'
        ? 'MND'
        : params.currencyIdA
      : parsedQuery && parsedQuery.currency0
        ? (parsedQuery.currency0 as string)
        : undefined
  const currency1Id =
    params?.currencyIdB
      ? params.currencyIdB.toLowerCase() === 'mnd'
        ? 'MND'
        : params.currencyIdB
      : parsedQuery?.currency1
        ? (parsedQuery.currency1 as string)
        : undefined
  const currency0 = _useCurrency(currency0Id)
  const currency1 = _useCurrency(currency1Id)

  const { independentField, typedValue, otherTypedValue } = useMintState()
  const {
    dependentField,
    currencies,
    pair,
    pairState,
    currencyBalances,
    parsedAmounts,
    price,
    noLiquidity,
    liquidityMinted,
    poolTokenPercentage,
    error
  } = useDerivedMintInfo()
  const liquidityTokenData = {
    amountA: formatTokenAmount(parsedAmounts[Field.CURRENCY_A]),
    symbolA: currencies[Field.CURRENCY_A]?.symbol,
    amountB: formatTokenAmount(parsedAmounts[Field.CURRENCY_B]),
    symbolB: currencies[Field.CURRENCY_B]?.symbol
  }

  const pendingText = `Supplying ${liquidityTokenData.amountA} ${liquidityTokenData.symbolA ?? 'INVALID SYMBOL'} and ${liquidityTokenData.amountB} ${liquidityTokenData.symbolB ?? 'INVALID SYMBOL'}`

  const {
    onFieldAInput,
    onFieldBInput,
    onCurrencySelection
  } = useMintActionHandlers(noLiquidity, chainIdToUse)

  const maxAmounts: { [field in Field]?: TokenAmount } = [
    Field.CURRENCY_A,
    Field.CURRENCY_B
  ].reduce((accumulator, field) => {
    return {
      ...accumulator,
      [field]: maxAmountSpend(chainIdToUse, currencyBalances[field])
    }
  }, {})

  const halfAmounts: { [field in Field]?: TokenAmount } = [
    Field.CURRENCY_A,
    Field.CURRENCY_B
  ].reduce((accumulator, field) => {
    return {
      ...accumulator,
      [field]: halfAmountSpend(chainIdToUse, currencyBalances[field])
    }
  }, {})

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: noLiquidity != null
      ? otherTypedValue
      : parsedAmounts[dependentField]?.toExact() ?? ''
  }

  const [approvingA, setApprovingA] = useState(false)
  const [approvingB, setApprovingB] = useState(false)
  const [approvalA, approveACallback] = useApproveCallback(
    parsedAmounts[Field.CURRENCY_A],
    chainId != null ? V1_ROUTER_ADDRESS[chainId] : undefined
  )
  const [approvalB, approveBCallback] = useApproveCallback(
    parsedAmounts[Field.CURRENCY_B],
    chainId != null ? V1_ROUTER_ADDRESS[chainId] : undefined
  )

  const userPoolBalance = useTokenBalance(
    account ?? undefined,
    pair?.liquidityToken
  )
  const atMaxAmounts: { [field in Field]?: TokenAmount } = [
    Field.CURRENCY_A,
    Field.CURRENCY_B
  ].reduce((accumulator, field) => {
    return {
      ...accumulator,
      [field]: maxAmounts[field]?.equalTo(parsedAmounts[field] ?? '0')
    }
  }, {})

  const { redirectWithCurrency, redirectWithSwitch } = usePoolsRedirects()
  const handleCurrencyASelect = useCallback(
    (currencyA: any) => {
      const isSwichRedirect = currencyEquals(currencyA, MONAD)
        ? currency1Id === 'MND'
        : currencyA?.address?.toLowerCase() === currency1Id?.toLowerCase()
      if (isSwichRedirect) {
        redirectWithSwitch(currencyA, true)
      } else {
        redirectWithCurrency(currencyA, true)
      }
    },
    [redirectWithCurrency, currency1Id, redirectWithSwitch]
  )

  useEffect(() => {
    if (currency0 != null) {
      onCurrencySelection(Field.CURRENCY_A, currency0)
    }
  }, [currency0Id])

  const handleCurrencyBSelect = useCallback(
    (currencyB: any) => {
      const isSwichRedirect = currencyEquals(currencyB, MONAD)
        ? currency0Id === 'MND'
        : currencyB?.address?.toLowerCase() === currency0Id?.toLowerCase()
      if (isSwichRedirect) {
        redirectWithSwitch(currencyB, false)
      } else {
        redirectWithCurrency(currencyB, false)
      }
    },
    [redirectWithCurrency, currency0Id, redirectWithSwitch]
  )

  useEffect(() => {
    if (currency1 != null) {
      onCurrencySelection(Field.CURRENCY_B, currency1)
    }
  }, [currency1Id])

  const onAdd = (): void => {
    setAddLiquidityErrorMessage(null)
    setTxHash('')
    onAddLiquidity()
    setShowConfirm(true)
  }

  const router = useRouterContract()
  const onAddLiquidity = async (): Promise<void> => {
    if (!chainId || (provider == null) || !account || (router == null)) return
    const {
      [Field.CURRENCY_A]: parsedAmountA,
      [Field.CURRENCY_B]: parsedAmountB
    } = parsedAmounts
    if (
      (parsedAmountA == null) ||
      (parsedAmountB == null) ||
      (currencies[Field.CURRENCY_A] == null) ||
      (currencies[Field.CURRENCY_B] == null) ||
      (deadline == null)
    ) {
      return
    }
    const amountsMin = {
      [Field.CURRENCY_A]: calculateSlippageAmount(
        parsedAmountA as TokenAmount,
        noLiquidity != null ? 0 : allowedSlippage
      )[0],
      [Field.CURRENCY_B]: calculateSlippageAmount(
        parsedAmountB as TokenAmount,
        noLiquidity != null ? 0 : allowedSlippage
      )[0]
    }
    let estimate,
      method: (...args: any) => Promise<TransactionResponse>,
      args: AddLiquidityParams | AddLiquidityNative,
      value: BigNumber | null
    if (
      currencies[Field.CURRENCY_A] === nativeCurrency ||
      currencies[Field.CURRENCY_B] === nativeCurrency
    ) {
      const tokenBIsETH = currencies[Field.CURRENCY_B] === nativeCurrency
      estimate = router.estimateGas.addLiquidityNative
      method = router.addLiquidityNative
      args = {
        token: wrappedCurrency(
          tokenBIsETH
            ? currencies[Field.CURRENCY_A]
            : currencies[Field.CURRENCY_B],
          chainId
        )?.address ?? '', // token
        amountTokenDesired: (tokenBIsETH ? parsedAmountA : parsedAmountB).raw.toString(), // token desired
        amountTokenMin: amountsMin[
          tokenBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B
        ].toString(), // token min
        amountNativeTokenMin: amountsMin[
          tokenBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A
        ].toString(), // eth min
        receiver: account,
        deadline: deadline.toHexString()
      }
      value = BigNumber.from(
        (tokenBIsETH ? parsedAmountB : parsedAmountA).raw.toString()
      )
    } else {
      estimate = router.estimateGas.addLiquidity
      method = router.addLiquidity
      args = {
        tokenA: wrappedCurrency(currencies[Field.CURRENCY_A], chainId)?.address ?? '',
        tokenB: wrappedCurrency(currencies[Field.CURRENCY_B], chainId)?.address ?? '',
        amountADesired: BigNumber.from(parsedAmountA.raw.toString()),
        amountBDesired: BigNumber.from(parsedAmountB.raw.toString()),
        amountAMin: BigNumber.from(amountsMin[Field.CURRENCY_A].toString()),
        amountBMin: BigNumber.from(amountsMin[Field.CURRENCY_B].toString()),
        receiver: account,
        deadline
      }
      value = null
    }
    setAttemptingTxn(true)
    await estimate(args, (value != null) ? { value } : {})
      .then(async (estimatedGasLimit: BigNumber): Promise<any> =>
        await method(args, {
          ...((value != null) ? { value } : {}),
          gasLimit: calculateGasMargin(estimatedGasLimit)
        }).then(async (response) => {
          setAttemptingTxn(false)
          setTxPending(true)
          const summary = `Add ${liquidityTokenData.amountA} ${liquidityTokenData.symbolA ?? 'INVALID SYMBOL'} and ${liquidityTokenData.amountB} ${liquidityTokenData.symbolB ?? 'INVALID SYMBOL'}`

          addTransaction(response, {
            summary
          })

          setTxHash(response.hash)

          try {
            const receipt = await response.wait()
            finalizedTransaction(receipt, {
              summary
            })
            setTxPending(false)
          } catch (error) {
            setTxPending(false)
            setAddLiquidityErrorMessage('There is an error in transaction.')
          }
        })
      )
      .catch((error: any) => {
        setAttemptingTxn(false)
        setAddLiquidityErrorMessage(
          error?.code === 'ACTION_REJECTED' ? 'Transaction rejected' : error?.message
        )
        // we only care if the error is   something _other_ than the user rejected the tx
        if (error?.code !== 'ACTION_REJECTED') {
          console.error(error)
        }
      })
  }

  const [, connect] = useConnectWallet()
  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)
    // if there was a tx hash, we want to clear the input
    if (txHash !== undefined) {
      onFieldAInput('')
    }
    setTxHash('')
  }, [onFieldAInput, txHash])

  const buttonText = useMemo(() => {
    if (account !== undefined) {
      if (!isSupportedNetwork) return 'Switch Network'
      return error ?? 'Supply'
    }
    return 'Connect Wallet'
  }, [account, isSupportedNetwork, error])

  // const handleButtonClick = async () => {
  //   if (approvalA !== ApprovalState.APPROVED && approvalA !== ApprovalState.PENDING) {
  //     setApprovingA(true)
  //     try {
  //       await approveACallback()
  //     } catch (e) {
  //       // Handle error if needed
  //     } finally {
  //       setApprovingA(false)
  //     }
  //   } else if (approvalB !== ApprovalState.APPROVED && approvalB !== ApprovalState.PENDING) {
  //     setApprovingB(true)
  //     try {
  //       await approveBCallback()
  //     } catch (e) {
  //       // Handle error if needed
  //     } finally {
  //       setApprovingB(false)
  //     }
  //   } else if (account && isSupportedNetwork) {
  //     onAdd()
  //   } else {
  //     await connect()
  //   }
  // }
  // const getButtonText = () => {
  //   if (approvalA === ApprovalState.PENDING) {
  //     return `approving ${currencies[Field.CURRENCY_A]?.symbol}`
  //   } else if (approvalB === ApprovalState.PENDING) {
  //     return `approving ${currencies[Field.CURRENCY_B]?.symbol}`
  //   } else if (approvalA !== ApprovalState.APPROVED) {
  //     return `approve ${currencies[Field.CURRENCY_A]?.symbol}`
  //   } else if (approvalB !== ApprovalState.APPROVED) {
  //     return `approve ${currencies[Field.CURRENCY_B]?.symbol}`
  //   } else if (!account || !isSupportedNetwork) {
  //     return 'connect'
  //   } else {
  //     return buttonText
  //   }
  // }
  // const isButtonDisabled = () => {
  //   if (approvalA === ApprovalState.PENDING || approvalB === ApprovalState.PENDING) {
  //     return true
  //   }
  //   if (Boolean(account) && isSupportedNetwork) {
  //     return Boolean(error) || approvalA !== ApprovalState.APPROVED || approvalB !== ApprovalState.APPROVED
  //   }
  //   return false
  // }
  const modalHeader = (): ReactElement => {
    return (
      <Box className='border'>
        <Box mt={10} mb={3} className='flex justify-center'>
          <DoubleCurrencyLogo
            currency0={currencies[Field.CURRENCY_A] as Token}
            currency1={currencies[Field.CURRENCY_B] as Token}
            size={48}
          />
        </Box>
        <Box mb={6} textAlign='center'>
          <h6>
            {pendingText}
            <br />
            {`You will receive ${formatTokenAmount(liquidityMinted)} ${currencies[Field.CURRENCY_A]?.symbol} / ${currencies[Field.CURRENCY_B]?.symbol} LP Tokens`}
          </h6>
        </Box>
        <Box mb={3} textAlign='center'>
          <small className='text-secondary'>
            {`Output is estimated. If the price changes by more than ${allowedSlippage / 100}% your transaction will revert.`}
          </small>
        </Box>
        <Box className='swapButtonWrapper'>
          <Button className='w-full' onClick={onAddLiquidity}>
            Confirm Supply
          </Button>
        </Box>
      </Box>
    )
  }
  return (
    <Box className=''>
      {showConfirm && (
        <TransactionConfirmationModal
          isOpen={showConfirm}
          onDismiss={handleDismissConfirmation}
          attemptingTxn={attemptingTxn}
          txPending={txPending}
          hash={txHash}
          content={() =>
            addLiquidityErrorMessage
              ? (
                <TransactionErrorContent
                  onDismiss={handleDismissConfirmation}
                  message={addLiquidityErrorMessage}
                />
                )
              : (
                <ConfirmationModalContent
                  title='supplyingliquidity'
                  onDismiss={handleDismissConfirmation}
                  content={modalHeader}
                />
                )}
          pendingText={pendingText}
          modalContent={
            txPending ? 'submittedTxLiquidity' : 'successAddedliquidity'
          }
        />
      )}
      <CurrencyInput
        id='add-liquidity-input-tokens'
        title='token 1'
        currency={currencies[Field.CURRENCY_A]}
        showHalfButton={Boolean(maxAmounts[Field.CURRENCY_A])}
        showMaxButton={atMaxAmounts[Field.CURRENCY_A] == null}
        onMax={() =>
          onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '')}
        onHalf={() => {
          const halfAmount = halfAmounts[Field.CURRENCY_A]
          if (halfAmount != null) {
            onFieldAInput(halfAmount.toExact())
          }
        }}
        handleCurrencySelect={handleCurrencyASelect}
        amount={formattedAmounts[Field.CURRENCY_A]}
        setAmount={onFieldAInput}
        bgClass={currencyBgClass}
      />
      <CurrencyInput
        id='add-liquidity-input-tokenb'
        title='token 2'
        showHalfButton={Boolean(maxAmounts[Field.CURRENCY_B])}
        currency={currencies[Field.CURRENCY_B]}
        showMaxButton={atMaxAmounts[Field.CURRENCY_B] == null}
        onHalf={() => {
          const maxAmount = maxAmounts[Field.CURRENCY_B]
          if (maxAmount != null) {
            onFieldBInput(
              maxAmount.divide('2').toFixed(maxAmount.currency.decimals)
            )
          }
        }}
        onMax={() =>
          onFieldBInput(maxAmounts[Field.CURRENCY_B]?.toExact() ?? '')}
        handleCurrencySelect={handleCurrencyBSelect}
        amount={formattedAmounts[Field.CURRENCY_B]}
        setAmount={onFieldBInput}
        bgClass={currencyBgClass}
        showPrice
      />
      {(currencies[Field.CURRENCY_A] != null) &&
        (currencies[Field.CURRENCY_B] != null) &&
        pairState !== PairState.INVALID &&
        (price != null) && (
          <Box my={2} className='rounded-sm font-fira flex flex-col p-3 text-[#ABABAB] transition duration-150 ease-in-out'>
            <Box className='p-2 flex justify-between'>
              <small>
                1 {currencies[Field.CURRENCY_A]?.symbol} ={' '}
                {price.toSignificant(3)} {currencies[Field.CURRENCY_B]?.symbol}{' '}
              </small>
              <small>
                1 {currencies[Field.CURRENCY_B]?.symbol} ={' '}
                {price.invert().toSignificant(3)}{' '}
                {currencies[Field.CURRENCY_A]?.symbol}{' '}
              </small>
            </Box>
            <Box className='p-2 flex justify-between'>
              <small>Your Pool Share</small>
              <small>
                {(poolTokenPercentage != null)
                  ? poolTokenPercentage.toSignificant(6) + '%'
                  : '-'}
              </small>
            </Box>
            <Box className='p-2 flex justify-between'>
              <small>LP Tokens Received</small>
              <small>
                {formatTokenAmount(userPoolBalance)} LP Tokens
              </small>
            </Box>
          </Box>
      )}
      <Box className='flex-wrap'>
        {(approvalA === ApprovalState.NOT_APPROVED ||
          approvalA === ApprovalState.PENDING ||
          approvalB === ApprovalState.NOT_APPROVED ||
          approvalB === ApprovalState.PENDING) &&
          !error && (
            <Box className='flex fullWidth justify-between mb-2'>
              {approvalA !== ApprovalState.APPROVED && (
                <Box
                  className={`w-[${approvalB !== ApprovalState.APPROVED ? '48%' : '100%'}]`}
                >
                  <Button
                    className='w-full py-4 px-4 bg-gradient-to-r from-[#23006A] to-[#23006A]/50'
                    onClick={async () => {
                      setApprovingA(true)
                      try {
                        await approveACallback()
                        setApprovingA(false)
                      } catch (e) {
                        setApprovingA(false)
                      }
                    }}
                    disabled={approvingA || approvalA === ApprovalState.PENDING}
                  >
                    {approvalA === ApprovalState.PENDING
                      ? `approving ${
                          currencies[Field.CURRENCY_A]?.symbol
                        }`
                      : `approve ${
                          currencies[Field.CURRENCY_A]?.symbol
                        }`}
                  </Button>
                </Box>
              )}
              {approvalB !== ApprovalState.APPROVED && (
                <Box
                  className={`w-[${approvalA !== ApprovalState.APPROVED ? '48%' : '100%'}]`}
                >
                  <Button
                    className='w-full py-4 px-4 bg-gradient-to-r from-[#23006A] to-[#23006A]/50'
                    onClick={async () => {
                      setApprovingB(true)
                      try {
                        await approveBCallback()
                        setApprovingB(false)
                      } catch (e) {
                        setApprovingB(false)
                      }
                    }}
                    disabled={approvingB || approvalB === ApprovalState.PENDING}
                  >
                    {approvalB === ApprovalState.PENDING
                      ? `approving ${
                          currencies[Field.CURRENCY_B]?.symbol
                        }`
                      : `approve ${
                          currencies[Field.CURRENCY_B]?.symbol
                        }`}
                  </Button>
                </Box>
              )}
            </Box>
        )}
        <Button
          className='w-full bg-gradient-to-r from-[#23006A] to-[#23006A]/50 py-4 px-4'
          disabled={
            Boolean(account) &&
            isSupportedNetwork &&
            (Boolean(error) ||
              approvalA !== ApprovalState.APPROVED ||
              approvalB !== ApprovalState.APPROVED)
          }
          onClick={account && isSupportedNetwork ? onAdd : async () => await connect()}
        >
          {buttonText}
        </Button>
      </Box>
    </Box>
  )
}

export default AddLiquidity
