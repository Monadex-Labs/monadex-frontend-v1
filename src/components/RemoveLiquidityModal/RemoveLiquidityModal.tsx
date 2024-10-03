import React, { useState, useMemo, useCallback } from 'react'
import { Contract } from '@ethersproject/contracts'
import { IoIosArrowDown, IoIosArrowBack, IoMdClose } from 'react-icons/io'
import { Box } from '@mui/material'
import { Button } from '@mui/base'
import { Token, NativeCurrency, JSBI, Percent } from '@monadex/sdk'
import { BigNumber } from '@ethersproject/bignumber'
import { TransactionResponse } from '@ethersproject/providers'
import {
  CustomModal,
  DoubleCurrencyLogo,
  ColoredSlider,
  CurrencyLogo,
  TransactionConfirmationModal,
  TransactionErrorContent,
  ConfirmationModalContent,
  NumericalInput
} from '@/components'
import {
  useDerivedBurnInfo,
  useBurnState,
  useBurnActionHandlers
} from '@/state/burn/hooks'
import { Field } from '@/state/burn/actions'
import { useUserSlippageTolerance } from '@/state/user/hooks'
import {
  useTransactionAdder,
  useTransactionFinalizer
} from '@/state/transactions/hooks'
import { useTokenBalance } from '@/state/wallet/hooks'
import { usePairContract, useRouterContract } from '@/hooks/useContracts'
import {
  calculateGasMargin,
  calculateSlippageAmount,
  formatTokenAmount,
  useWalletData
} from '@/utils'
import useDebouncedChangeHandler from '@/utils/useDebouncedChangeHandler'
import useTransactionDeadline from '@/hooks/useTransactionDeadline'
import { useApproveCallback, ApprovalState } from '@/hooks/useApproveCallback'
import { useDerivedSwapInfo } from '@/state/swap/hooks'
import { wrappedCurrency } from '@/utils/wrappedCurrency'
import { useTotalSupply } from '@/data/TotalSupply'
import { V1_ROUTER_ADDRESS } from '@/constants'
import { SLIPPAGE_AUTO } from '@/state/user/reducer'

interface RemoveLiquidityModalProps {
  currency0: Token | NativeCurrency
  currency1: Token | NativeCurrency
  open: boolean
  onClose: () => void
}

const RemoveLiquidityModal: React.FC<RemoveLiquidityModalProps> = ({
  currency0,
  currency1,
  open,
  onClose
}) => {
  const [showConfirm, setShowConfirm] = useState(false)
  const [txPending, setTxPending] = useState(false)
  const [approving, setApproving] = useState(false)
  const [attemptingTxn, setAttemptingTxn] = useState(false)
  const [removeErrorMessage, setRemoveErrorMessage] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [txHash, setTxHash] = useState('')
  const addTransaction = useTransactionAdder()
  const finalizedTransaction = useTransactionFinalizer()
  const { chainId, account, provider } = useWalletData()
  const [tokenA, tokenB] = useMemo(
    () => [
      wrappedCurrency(currency0, chainId),
      wrappedCurrency(currency1, chainId)
    ],
    [currency0, currency1, chainId]
  )
  const { independentField, typedValue } = useBurnState()
  const { pair, parsedAmounts, error } = useDerivedBurnInfo(
    currency0,
    currency1
  )
  const deadline = useTransactionDeadline()
  const { onUserInput: _onUserInput } = useBurnActionHandlers()
  const { useAutoSlippage } = useDerivedSwapInfo()

  let [allowedSlippage] = useUserSlippageTolerance()
  allowedSlippage =
    allowedSlippage === SLIPPAGE_AUTO ? useAutoSlippage : allowedSlippage

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      return _onUserInput(field, typedValue)
    },
    [_onUserInput]
  )

  const onLiquidityInput = useCallback(
    (typedValue: string): void => onUserInput(Field.LIQUIDITY, typedValue),
    [onUserInput]
  )

  const liquidityPercentChangeCallback = useCallback(
    (value: number) => {
      onUserInput(Field.LIQUIDITY_PERCENT, value.toString())
    },
    [onUserInput]
  )

  const [
    innerLiquidityPercentage,
    setInnerLiquidityPercentage
  ] = useDebouncedChangeHandler(
    Number.parseInt(parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0)),
    liquidityPercentChangeCallback
  )
  const userPoolBalance = useTokenBalance(
    account ?? undefined,
    pair?.liquidityToken
  )
  const totalPoolTokens = useTotalSupply(pair?.liquidityToken)
  const poolTokenPercentage =
    !(userPoolBalance == null) &&
    !(totalPoolTokens == null) &&
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? new Percent(userPoolBalance.raw, totalPoolTokens.raw)
      : undefined

  const formattedAmounts = {
    [Field.LIQUIDITY_PERCENT]: parsedAmounts[Field.LIQUIDITY_PERCENT].equalTo(
      '0'
    )
      ? '0'
      : parsedAmounts[Field.LIQUIDITY_PERCENT].lessThan(new Percent('1', '100'))
        ? '<1'
        : parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0),
    [Field.LIQUIDITY]:
      independentField === Field.LIQUIDITY
        ? typedValue
        : parsedAmounts[Field.LIQUIDITY]?.toExact() ?? '',
    [Field.CURRENCY_A]:
      independentField === Field.CURRENCY_A
        ? typedValue
        : parsedAmounts[Field.CURRENCY_A]?.toExact() ?? '',
    [Field.CURRENCY_B]:
      independentField === Field.CURRENCY_B
        ? typedValue
        : parsedAmounts[Field.CURRENCY_B]?.toExact() ?? ''
  }

  const [token0Deposited, token1Deposited] =
    !(pair == null) &&
    !(totalPoolTokens == null) &&
    !(userPoolBalance == null) &&
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? [
          pair.getLiquidityValue(
            pair.token0,
            totalPoolTokens,
            userPoolBalance,
            false
          ),
          pair.getLiquidityValue(
            pair.token1,
            totalPoolTokens,
            userPoolBalance,
            false
          )
        ]
      : [undefined, undefined]

  const pairContract: Contract | null = usePairContract(
    pair?.liquidityToken?.address
  )
  const [approval, approveCallback] = useApproveCallback(
    parsedAmounts[Field.LIQUIDITY],
    chainId ? V1_ROUTER_ADDRESS[chainId] : undefined
  )
  const onAttemptToApprove = async () => {
    if ((pairContract == null) || (pair == null) || !provider || (deadline == null)) {
      setErrorMsg('Missing dependencies')
      return
    }
    const liquidityAmount = parsedAmounts[Field.LIQUIDITY]
    if (liquidityAmount == null) {
      setErrorMsg('Missing liquidity amount')
      return
    }
    setApproving(true)
    try {
      await approveCallback()
      setApproving(false)
    } catch (e) {
      setApproving(false)
    }
  }

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)
    setTxHash('')
  }, [])

  const router = useRouterContract()

  const onRemove = async () => {
    if (!chainId || !provider || !account || (deadline == null) || (router == null)) {
      setRemoveErrorMessage('Missing dependencies')
      throw new Error('Missing dependencies')
    }
    const {
      [Field.CURRENCY_A]: currencyAmountA,
      [Field.CURRENCY_B]: currencyAmountB
    } = parsedAmounts
    if ((currencyAmountA == null) || (currencyAmountB == null)) {
      setRemoveErrorMessage('Need to input amounts')
      throw new Error('noInputAmounts')
    }

    const amountsMin = {
      [Field.CURRENCY_A]: calculateSlippageAmount(
        currencyAmountA,
        allowedSlippage
      )[0],
      [Field.CURRENCY_B]: calculateSlippageAmount(
        currencyAmountB,
        allowedSlippage
      )[0]
    }

    const liquidityAmount = parsedAmounts[Field.LIQUIDITY]
    if (liquidityAmount == null) {
      setRemoveErrorMessage('No liquidity.')
      throw new Error('No liquidity.')
    }

    if ((tokenA == null) || (tokenB == null)) {
      setRemoveErrorMessage('Could not wrap')
      throw new Error('Could not wrap')
    }

    let methodNames: string[],
      args: Array<string | string[] | number | boolean>
    // we have approval, use normal remove liquidity
    if (approval === ApprovalState.APPROVED) {
      methodNames = ['removeLiquidity']
      args = [
        tokenA.address,
        tokenB.address,
        liquidityAmount.raw.toString(),
        amountsMin[Field.CURRENCY_A].toString(),
        amountsMin[Field.CURRENCY_B].toString(),
        account,
        deadline.toHexString()
      ]
      // }
    } else {
      setRemoveErrorMessage('Attempting to confirm without approval. Please contact support.')
      throw new Error('confirmWithoutApproval')
    }
    const safeGasEstimates: Array<BigNumber | undefined> = await Promise.all(
      methodNames.map(async (methodName) =>
        await router.estimateGas[methodName](...args)
          .then(calculateGasMargin)
          .catch((error: any) => {
            console.error('estimateGas failed', methodName, args, error)
            setRemoveErrorMessage('There is an error in transaction. Please increase your slippage.')
            throw new Error('removeLiquidityError1')
          })
      )
    )
    const indexOfSuccessfulEstimation = safeGasEstimates.findIndex(
      (safeGasEstimate) => BigNumber.isBigNumber(safeGasEstimate)
    )

    // all estimations failed...
    if (indexOfSuccessfulEstimation === -1) {
      setRemoveErrorMessage('This transaction would fail. Please contact support.')
      throw new Error('This transaction would fail. Please contact support.')
    } else {
      const methodName = methodNames[indexOfSuccessfulEstimation]
      const safeGasEstimate = safeGasEstimates[indexOfSuccessfulEstimation]

      setAttemptingTxn(true)
      await router[methodName](...args, {
        gasLimit: safeGasEstimate
      })
        .then(async (response: TransactionResponse) => {
          setAttemptingTxn(false)
          setTxPending(true)
          const summary = `Remove ${formatTokenAmount(parsedAmounts[Field.CURRENCY_A])} ${currency0.symbol ?? 'INVALID SYMBOL'} 
          and ${formatTokenAmount(parsedAmounts[Field.CURRENCY_B])} ${currency1.symbol ?? 'INVALID SYMBOL'}`

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
            setRemoveErrorMessage('There is an error in transaction. Please increase your slippage.')
          }
        })
        .catch((error: any) => {
          setAttemptingTxn(false)
          // we only care if the error is something _other_ than the user rejected the tx
          console.error(error)
          setRemoveErrorMessage(
            error.code === 'ACTION_REJECTED'
              ? 'Transaction rejected.'
              : 'There is an error in transaction. Please increase your slippage.'
          )
        })
    }
  }

  const modalHeader = () => {
    return (
      <Box>
        <Box className='flex justify-center' mt={10} mb={3}>
          <DoubleCurrencyLogo
            currency0={currency0}
            currency1={currency1}
            size={48}
          />
        </Box>
        <Box mb={6} textAlign='center'>
          <p className='weight-600'>
            {`Removing ${formattedAmounts[Field.LIQUIDITY]} ${currency0.symbol ?? 'INVALID SYMBOL'} / ${currency1.symbol ?? 'INVALID SYMBOL'} LP Tokens`}
            <br />
            You will receive{' '}
            {formatTokenAmount(parsedAmounts[Field.CURRENCY_A])}{' '}
            {currency0.symbol} and{' '}
            {formatTokenAmount(parsedAmounts[Field.CURRENCY_B])}{' '}
            {currency1.symbol}
          </p>
        </Box>
        <Box mb={3} textAlign='center'>
          <small className='text-textSecondary'>
            {`Output is estimated. If the price changes by more than ${allowedSlippage / 100}% your transaction will revert.`}
          </small>
        </Box>
        <Box mt={2}>
          <Button className='bg-primary hover:bg-primary2 transition w-full rounded-md h-12' onClick={onRemove}>
            Confirm
          </Button>
        </Box>
      </Box>
    )
  }

  return (
    <CustomModal open={open} onClose={onClose}>
      <Box paddingX={3} paddingY={4}>
        {showConfirm && (
          <TransactionConfirmationModal
            isOpen={showConfirm}
            onDismiss={handleDismissConfirmation}
            attemptingTxn={attemptingTxn}
            txPending={txPending}
            hash={txHash}
            content={() =>
              removeErrorMessage
                ? (
                  <TransactionErrorContent
                    onDismiss={handleDismissConfirmation}
                    message={removeErrorMessage}
                  />
                  )
                : (
                  <ConfirmationModalContent
                    title='Removing Liquidity'
                    onDismiss={handleDismissConfirmation}
                    content={modalHeader}
                  />
                  )}
            pendingText=''
            modalContent={
              txPending
                ? 'Submitted transaction to remove liquidity'
                : 'Successfully removed liquidity'
            }
          />
        )}
        <Box className='flex items-center justify-between'>
          <IoIosArrowBack
            className='text-secondary cursor-pointer'
            size={24}
            onClick={onClose}
          />
          <h6 className='font-semibold'>Remove Liquidity</h6>
          <IoMdClose size={24} className='cursor-pointer' onClick={onClose} />
        </Box>
        <Box className='mt-6 rounded-md p-4 bg-bgColor border border-secondary1'>
          <Box className='flex items-center justify-between'>
            <small>
              {currency0.symbol} / {currency1.symbol} LP
            </small>
            <small>
              Balance: {formatTokenAmount(userPoolBalance)}
            </small>
          </Box>
          <Box mt={2}>
            <NumericalInput
              className='w-full relative outline-none border-none whitespace-nowrap text-ellipsis overflow-hidden text-left bg-transparent text-2xl'
              placeholder='0'
              value={formattedAmounts[Field.LIQUIDITY]}
              fontSize={28}
              onUserInput={(value) => {
                onLiquidityInput(value)
              }}
            />
          </Box>
          <Box className='flex items-center'>
            <Box flex={1} mr={2} mt={0.5}>
              <ColoredSlider
                min={1}
                max={100}
                step={1}
                value={innerLiquidityPercentage}
                handleChange={(_: any, value: any) =>
                  setInnerLiquidityPercentage(value as number)}
              />
            </Box>
            <small>{formattedAmounts[Field.LIQUIDITY_PERCENT]}%</small>
          </Box>
        </Box>
        <Box className='flex justify-center' my={3}>
          <IoIosArrowDown className='text-secondary' />
        </Box>
        <Box className='p-4 rounded-md bg-secondary1'>
          <Box className='flex justify-between items-center'>
            <p>
              Pooled {currency0.symbol}
            </p>
            <Box className='flex items-center gap-2'>
              <p>{formatTokenAmount(token0Deposited)}</p>
              <CurrencyLogo currency={currency0} />
            </Box>
          </Box>
          <Box className='flex justify-between items-center mt-4'>
            <p className='text-blue7'>
              - Withdraw {currency0.symbol}
            </p>
            <p className='text-blue7'>{formattedAmounts[Field.CURRENCY_A]}</p>
          </Box>
          <Box className='flex justify-between items-center mt-4'>
            <p>
              Pooled {currency1.symbol}
            </p>
            <Box className='flex items-center gap-2'>
              <p>{formatTokenAmount(token1Deposited)}</p>
              <CurrencyLogo currency={currency1} />
            </Box>
          </Box>
          <Box className='flex justify-between items-center mt-4'>
            <p className='text-blue7'>
              - Withdraw {currency1.symbol}
            </p>
            <p className='text-blue7'>{formattedAmounts[Field.CURRENCY_B]}</p>
          </Box>
          <Box className='flex justify-between items-center mt-4'>
            <p>Your Pool Share</p>
            <p>
              {(poolTokenPercentage != null)
                ? poolTokenPercentage.toSignificant() + '%'
                : '-'}
            </p>
          </Box>
        </Box>
        {(pair != null) && (
          <Box className='flex justify-between items-center' mt={2} px={2}>
            <small>
              1 {currency0.symbol} ={' '}
              {(tokenA != null) ? pair.priceOf(tokenA).toSignificant(6) : '-'}{' '}
              {currency1.symbol}
            </small>
            <small>
              1 {currency1.symbol} ={' '}
              {(tokenB != null) ? pair.priceOf(tokenB).toSignificant(6) : '-'}{' '}
              {currency0.symbol}
            </small>
          </Box>
        )}
        <Box mt={2} className='flex justify-between items-center items-center gap-3'>
          <Button
            className='disabled:bg-transparent disabled:text-textSecondary bg-primary hover:bg-primary2 transition w-1/2 rounded-md h-12'
            onClick={onAttemptToApprove}
            disabled={approving || approval !== ApprovalState.NOT_APPROVED}
          >
            {approving
              ? 'Approving...'
              : approval === ApprovalState.APPROVED
                ? 'Approved'
                : 'Approve'}
          </Button>
          <Button
            className='disabled:bg-transparent disabled:text-textSecondary bg-primary hover:bg-primary2 transition w-1/2 rounded-md h-12'
            onClick={() => {
              setRemoveErrorMessage('')
              setShowConfirm(true)
            }}
            disabled={Boolean(error) || approval !== ApprovalState.APPROVED}
          >
            {error ?? 'Remove'}
          </Button>
        </Box>
        <Box mt={2}>
          <p className='text-error'>{errorMsg}</p>
        </Box>
      </Box>
    </CustomModal>
  )
}

export default RemoveLiquidityModal
