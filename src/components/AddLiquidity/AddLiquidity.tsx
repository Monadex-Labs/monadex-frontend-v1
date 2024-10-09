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
  ETH,
  TokenAmount,
  ChainId,
  Token
} from '@monadex/sdk'
import { useWalletData } from '@/utils/index'
import { useConnectWallet } from '@web3-onboard/react'
import { useRouterContract } from '@/hooks/useContracts'
import useTransactionDeadline from '@/hooks/useTransactionDeadline'
import { ApprovalState, useApproveCallback } from '@/hooks/useApproveCallback'
import { HiChevronDown, HiChevronUp  } from 'react-icons/hi2'

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
import useParsedQueryString from '@/hooks/useParseQueryString'
import { _useCurrency } from '@/hooks/Tokens'
import { useDerivedSwapInfo } from '@/state/swap/hooks'
import { useParams } from 'next/navigation'
import { V1_ROUTER_ADDRESS } from '@/constants/index'
import usePoolsRedirects from '@/hooks/usePoolsRedirect'
import { SLIPPAGE_AUTO } from '@/state/user/reducer'
import LiquidityButton from './LiquidityButton'

/* TODO: Check if this is the correct place for this */
interface AddLiquidityParams {
  tokenA: string
  tokenB: string
  amountADesired: string
  amountBDesired: string
  amountAMin: string
  amountBMin: string
  receiver: string
  deadline: string
}

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
  const chainIdToUse = chainId ?? ChainId.SEPOLIA
  const nativeCurrency = ETH
  const { useAutoSlippage } = useDerivedSwapInfo()

  const [showConfirm, setShowConfirm] = useState(false)
  const [attemptingTxn, setAttemptingTxn] = useState(false)
  const [txPending, setTxPending] = useState(false)
  const [show, setShowDetails] = useState(false)
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
    params?.currencyIdA != null
      ? params.currencyIdA.toLowerCase() === 'eth'
        ? 'ETH'
        : params.currencyIdA
      : parsedQuery?.currency0 != null
        ? (parsedQuery.currency0 as string)
        : undefined
  const currency1Id =
    params?.currencyIdB
      ? params.currencyIdB.toLowerCase() === 'eth'
        ? 'ETH'
        : params.currencyIdB
      : parsedQuery?.currency1 != null
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
    [dependentField]: noLiquidity
      ? otherTypedValue
      : parsedAmounts[dependentField]?.toExact() ?? ''
  }

  const [approvingA, setApprovingA] = useState(false)
  const [approvingB, setApprovingB] = useState(false)
  const [approvalA, approveACallback] = useApproveCallback(
    parsedAmounts[Field.CURRENCY_A],
    chainId ? V1_ROUTER_ADDRESS[chainId] : undefined
  )
  const [approvalB, approveBCallback] = useApproveCallback(
    parsedAmounts[Field.CURRENCY_B],
    chainId ? V1_ROUTER_ADDRESS[chainId] : undefined
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
      const isSwichRedirect = currencyEquals(currencyA, ETH)
        ? currency1Id === 'ETH'
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
      const isSwichRedirect = currencyEquals(currencyB, ETH)
        ? currency0Id === 'ETH'
        : currencyB?.address?.toLowerCase() === currency0Id?.toLowerCase()
      if (isSwichRedirect) {
        redirectWithSwitch(currencyB, false)
      } else {
        redirectWithCurrency(currencyB, false)  // here we get correctly currencyB
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
    void onAddLiquidity()
    setShowConfirm(true)
  }

  const router = useRouterContract()
  const onAddLiquidity = async (): Promise<void> => {
    if (!chainId || !provider || !account || (router == null)) return
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
        noLiquidity ? 0 : allowedSlippage
      )[0],
      [Field.CURRENCY_B]: calculateSlippageAmount(
        parsedAmountB as TokenAmount,
        noLiquidity ? 0 : allowedSlippage
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
        amountADesired: parsedAmountA.raw.toString(),
        amountBDesired: parsedAmountB.raw.toString(),
        amountAMin: amountsMin[Field.CURRENCY_A].toString(),
        amountBMin: amountsMin[Field.CURRENCY_B].toString(),
        receiver: account,
        deadline: deadline.toHexString()
      }
      value = null
    }
    setAttemptingTxn(true)
    await estimate(args, (value != null) ? { value } : {})
      .then(async (estimatedGasLimit: BigNumber): Promise<any> => {
        return await method(args, {
          ...((value != null) ? { value } : {}),
          gasLimit: calculateGasMargin(estimatedGasLimit)
        })
          .then(async (response) => {
            console.log('Method Response:', response) // Log the response from method

            setAttemptingTxn(false)
            setTxPending(true)

            const summary = `Add ${liquidityTokenData.amountA} ${liquidityTokenData.symbolA ?? 'INVALID SYMBOL'} and ${liquidityTokenData.amountB} ${liquidityTokenData.symbolB ?? 'INVALID SYMBOL'}`

            addTransaction(response, { summary })

            setTxHash(response.hash)

            try {
              const receipt = await response.wait()
              console.log('Transaction Receipt:', receipt) // Log the transaction receipt

              finalizedTransaction(receipt, { summary })
              setTxPending(false)
            } catch (error) {
              console.error('Error waiting for transaction receipt:', error) // Log the error
              setTxPending(false)
              setAddLiquidityErrorMessage('There is an error in transaction.')
            }
          })
      })
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
    if (txHash) {
      onFieldAInput('')
    }
    setTxHash('')
  }, [onFieldAInput, txHash])

  const buttonText = useMemo(() => {
    if (account) {
      if (!isSupportedNetwork) return 'Switch Network'
      return error ?? 'Supply'
    }
    return 'Connect Wallet'
  }, [account, isSupportedNetwork, error])

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
            {`You will receive ${formatTokenAmount(liquidityMinted)} 
            ${currencies[Field.CURRENCY_A]?.symbol ?? 'INVALID SYMBOL'} / 
            ${currencies[Field.CURRENCY_B]?.symbol ?? 'INVALID SYMBOL'} LP Tokens`}
          </h6>
        </Box>
        <Box mb={3} textAlign='center'>
          <small className='text-secondary'>
            {`Output is estimated. If the price changes by more than ${allowedSlippage / 100}% your transaction will revert.`}
          </small>
        </Box>
        <Box className='border'>
          <Button className='w-full' onClick={onAddLiquidity}>
            Confirm Supply
          </Button>
        </Box>
      </Box>
    )
  }

  const handleApproveA = async (): Promise<void> => {
    setApprovingA(true)
    try {
      await approveACallback()
      setApprovingA(false)
    } catch (e) {
      setApprovingA(false)
    }
  }

  const handleApproveB = async (): Promise<void> => {
    setApprovingB(true)
    try {
      await approveBCallback()
      setApprovingB(false)
    } catch (e) {
      setApprovingB(false)
    }
  }
  return (
    <Box>
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
                  title='supplying liquidity'
                  onDismiss={handleDismissConfirmation}
                  content={modalHeader}
                />
                )}
          pendingText={pendingText}
          modalContent={
            txPending ? 'Submitted transaction to add liquidity' : 'Successfully added liquidity'
          }
        />
      )}
      <CurrencyInput
        id='add-liquidity-input-tokens'
        title='Token 1'
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
        title='Token 2'
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
      {currencies[Field.CURRENCY_A] != null &&
        currencies[Field.CURRENCY_B] != null &&
        pairState !== PairState.INVALID &&
        price != null && (
          <Box my={2} className='rounded-sm font-regular  flex flex-col p-3 text-white text-lg transition duration-150 ease-in-out'>
          <Box className='flex gap-2 opacity-80 mt-2 font-regular border py-2 border-primary/30 rounded-md p-2 justify-between items-center ease-out text-lg mb-5'
            onClick={() => setShowDetails(!show)}
            >
              <small>
                1 {currencies[Field.CURRENCY_A]?.symbol} ={' '}
                {price.toSignificant(3)} {currencies[Field.CURRENCY_B]?.symbol}{' '}
              </small>
              <small className='flex items-center gap-2'>
                1 {currencies[Field.CURRENCY_B]?.symbol} ={' '}
                {price.invert().toSignificant(3)}{' '}
                {currencies[Field.CURRENCY_A]?.symbol}{' '}
                {show ? <HiChevronUp size={20} /> : <HiChevronDown size={20} />}
              </small>
             
            </Box>
           {show ? (
            <>
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
              {formatTokenAmount(liquidityMinted)} LP Tokens
            </small>
          </Box>
          </>
           ) : <></>}
          </Box>
      )}
      <LiquidityButton
        approvalA={approvalA}
        approvalB={approvalB}
        currencies={currencies}
        error={error}
        account={account}
        isSupportedNetwork={isSupportedNetwork}
        onAdd={onAdd}
        connect={connect}
        handleApproveA={handleApproveA}
        handleApproveB={handleApproveB}
        approvingA={approvingA}
        approvingB={approvingB}
      />
    </Box>
  )
}

export default AddLiquidity
