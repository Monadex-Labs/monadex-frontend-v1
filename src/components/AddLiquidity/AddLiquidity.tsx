// import { useCallback, useEffect, useState, useMemo } from 'react'
// import {
//   CurrencyInput,
//   TransactionErrorContent,
//   TransactionConfirmationModal,
//   ConfirmationModalContent,
//   DoubleCurrencyLogo
// } from '@/components'
// import { TransactionResponse } from '@ethersproject/providers'
// import { BigNumber } from '@ethersproject/bignumber'
// import {
//   currencyEquals,
//   MONAD,
//   TokenAmount,
//   ChainId
// } from '@monadex/sdk'
// import { useRouterContract } from '@/hooks/useContracts'
// import useTransactionDeadline from '@/hooks/useTransactionDeadline'
// import { ApprovalState, useApproveCallback } from '@/hooks'
// import { Field } from 'state/mint/actions'
// import { PairState } from 'data/Reserves'
// import {
//   useTransactionAdder,
//   useTransactionFinalizer
// } from 'state/transactions/hooks'
// import {
//   useDerivedMintInfo,
//   useMintActionHandlers,
//   useMintState
// } from 'state/mint/hooks'
// import { useTokenBalance } from 'state/wallet/hooks'
// import { useIsExpertMode, useUserSlippageTolerance } from 'state/user/hooks'
// import {
//   maxAmountSpend,
//   calculateSlippageAmount,
//   calculateGasMargin,
//   useIsSupportedNetwork,
//   formatTokenAmount,
//   halfAmountSpend
// } from 'utils'
// import { wrappedCurrency } from 'utils/wrappedCurrency'
// import { ReactComponent as AddLiquidityIcon } from 'assets/images/AddLiquidityIcon.svg'
// import useParsedQueryString from 'hooks/useParsedQueryString'
// import { useCurrency } from 'hooks/Tokens'
// import { useDerivedSwapInfo } from 'state/swap/hooks'
// import { useParams } from 'react-router-dom'
// import { V2_ROUTER_ADDRESS } from 'constants/v3/addresses'
// import usePoolsRedirect from 'hooks/usePoolsRedirect'
// import { SLIPPAGE_AUTO } from 'state/user/reducer'
// import { ButtonPrimary } from '@/components/common'

// const AddLiquidity: React.FC<{
//   currencyBgClass?: string
// }> = ({ currencyBgClass }) => {
//   const [addLiquidityErrorMessage, setAddLiquidityErrorMessage] = useState<
//   string | null
//   >(null)

//   const isSupportedNetwork = useIsSupportedNetwork()
//   const { account, chainId, library } = useActiveWeb3React()
//   const chainIdToUse = chainId || ChainId.MONAD
//   const nativeCurrency = MONAD
//   const { autoSlippage } = useDerivedSwapInfo()

//   const [showConfirm, setShowConfirm] = useState(false)
//   const [attemptingTxn, setAttemptingTxn] = useState(false)
//   const [txPending, setTxPending] = useState(false)
//   let [allowedSlippage] = useUserSlippageTolerance()
//   allowedSlippage =
//     allowedSlippage === SLIPPAGE_AUTO ? autoSlippage : allowedSlippage
//   const deadline = useTransactionDeadline()
//   const [txHash, setTxHash] = useState('')
//   const addTransaction = useTransactionAdder()
//   const finalizedTransaction = useTransactionFinalizer()

//   // queried currency
//   const params: any = useParams()
//   const parsedQuery = useParsedQueryString()
//   const currency0Id =
//     params && params.currencyIdA
//       ? params.currencyIdA.toLowerCase() === 'matic' ||
//         params.currencyIdA.toLowerCase() === 'eth'
//         ? 'ETH'
//         : params.currencyIdA
//       : parsedQuery && parsedQuery.currency0
//         ? (parsedQuery.currency0 as string)
//         : undefined
//   const currency1Id =
//     params && params.currencyIdB
//       ? params.currencyIdB.toLowerCase() === 'matic' ||
//         params.currencyIdB.toLowerCase() === 'eth'
//         ? 'ETH'
//         : params.currencyIdBMATIC
//       : parsedQuery && parsedQuery.currency1
//         ? (parsedQuery.currency1 as string)
//         : undefined
//   const currency0 = useCurrency(currency0Id)
//   const currency1 = useCurrency(currency1Id)

//   const { independentField, typedValue, otherTypedValue } = useMintState()
//   const expertMode = useIsExpertMode()
//   const {
//     dependentField,
//     currencies,
//     pair,
//     pairState,
//     currencyBalances,
//     parsedAmounts,
//     price,
//     noLiquidity,
//     liquidityMinted,
//     poolTokenPercentage,
//     error
//   } = useDerivedMintInfo()

//   const liquidityTokenData = {
//     amountA: formatTokenAmount(parsedAmounts[Field.CURRENCY_A]),
//     symbolA: currencies[Field.CURRENCY_A]?.symbol,
//     amountB: formatTokenAmount(parsedAmounts[Field.CURRENCY_B]),
//     symbolB: currencies[Field.CURRENCY_B]?.symbol
//   }

//   const pendingText = `Supplying ${liquidityTokenData.amountA} ${liquidityTokenData.symbolA} and ${liquidityTokenData.amountB} ${liquidityTokenData.symbolB}`

//   const {
//     onFieldAInput,
//     onFieldBInput,
//     onCurrencySelection
//   } = useMintActionHandlers(noLiquidity, chainIdToUse)

//   const maxAmounts: { [field in Field]?: TokenAmount } = [
//     Field.CURRENCY_A,
//     Field.CURRENCY_B
//   ].reduce((accumulator, field) => {
//     return {
//       ...accumulator,
//       [field]: maxAmountSpend(chainIdToUse, currencyBalances[field])
//     }
//   }, {})

//   const halfAmounts: { [field in Field]?: TokenAmount } = [
//     Field.CURRENCY_A,
//     Field.CURRENCY_B
//   ].reduce((accumulator, field) => {
//     return {
//       ...accumulator,
//       [field]: halfAmountSpend(chainIdToUse, currencyBalances[field])
//     }
//   }, {})

//   const formattedAmounts = {
//     [independentField]: typedValue,
//     [dependentField]: noLiquidity
//       ? otherTypedValue
//       : parsedAmounts[dependentField]?.toExact() ?? ''
//   }

//   const [approvingA, setApprovingA] = useState(false)
//   const [approvingB, setApprovingB] = useState(false)
//   const [approvalA, approveACallback] = useApproveCallback(
//     parsedAmounts[Field.CURRENCY_A],
//     chainId ? V2_ROUTER_ADDRESS[chainId] : undefined
//   )
//   const [approvalB, approveBCallback] = useApproveCallback(
//     parsedAmounts[Field.CURRENCY_B],
//     chainId ? V2_ROUTER_ADDRESS[chainId] : undefined
//   )

//   const userPoolBalance = useTokenBalance(
//     account ?? undefined,
//     pair?.liquidityToken
//   )

//   const atMaxAmounts: { [field in Field]?: TokenAmount } = [
//     Field.CURRENCY_A,
//     Field.CURRENCY_B
//   ].reduce((accumulator, field) => {
//     return {
//       ...accumulator,
//       [field]: maxAmounts[field]?.equalTo(parsedAmounts[field] ?? '0')
//     }
//   }, {})

//   const { redirectWithCurrency, redirectWithSwitch } = usePoolsRedirect()

//   const handleCurrencyASelect = useCallback(
//     (currencyA: any) => {
//       const isSwichRedirect = currencyEquals(currencyA, MONAD)
//         ? currency1Id === 'ETH'
//         : currency1Id &&
//           currencyA &&
//           currencyA.address &&
//           currencyA.address.toLowerCase() === currency1Id.toLowerCase()
//       if (isSwichRedirect) {
//         redirectWithSwitch(currencyA, true)
//       } else {
//         redirectWithCurrency(currencyA, true)
//       }
//     },
//     [redirectWithCurrency, currency1Id, redirectWithSwitch]
//   )

//   useEffect(() => {
//     if (currency0) {
//       onCurrencySelection(Field.CURRENCY_A, currency0)
//     }
//   }, [currency0Id])

//   const handleCurrencyBSelect = useCallback(
//     (currencyB: any) => {
//       const isSwichRedirect = currencyEquals(currencyB, MONAD)
//         ? currency0Id === 'ETH'
//         : currencyB &&
//           currencyB.address &&
//           currency0Id &&
//           currencyB.address.toLowerCase() === currency0Id.toLowerCase()
//       if (isSwichRedirect) {
//         redirectWithSwitch(currencyB, false)
//       } else {
//         redirectWithCurrency(currencyB, false)
//       }
//     },
//     [redirectWithCurrency, currency0Id, redirectWithSwitch]
//   )

//   useEffect(() => {
//     if (currency1) {
//       onCurrencySelection(Field.CURRENCY_B, currency1)
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [currency1Id])

//   const onAdd = () => {
//     setAddLiquidityErrorMessage(null)
//     setTxHash('')
//     if (expertMode) {
//       onAddLiquidity()
//     } else {
//       setShowConfirm(true)
//     }
//   }

//   const router = useRouterContract()

//   const onAddLiquidity = async () => {
//     if (!chainId || !library || !account || !router) return

//     const {
//       [Field.CURRENCY_A]: parsedAmountA,
//       [Field.CURRENCY_B]: parsedAmountB
//     } = parsedAmounts
//     if (
//       !parsedAmountA ||
//       !parsedAmountB ||
//       !currencies[Field.CURRENCY_A] ||
//       !currencies[Field.CURRENCY_B] ||
//       !deadline
//     ) {
//       return
//     }

//     const amountsMin = {
//       [Field.CURRENCY_A]: calculateSlippageAmount(
//         parsedAmountA,
//         noLiquidity ? 0 : allowedSlippage
//       )[0],
//       [Field.CURRENCY_B]: calculateSlippageAmount(
//         parsedAmountB,
//         noLiquidity ? 0 : allowedSlippage
//       )[0]
//     }

//     let estimate,
//       method: (...args: any) => Promise<TransactionResponse>,
//       args: Array<string | string[] | number>,
//       value: BigNumber | null
//     if (
//       currencies[Field.CURRENCY_A] === nativeCurrency ||
//       currencies[Field.CURRENCY_B] === nativeCurrency
//     ) {
//       const tokenBIsETH = currencies[Field.CURRENCY_B] === nativeCurrency
//       estimate = router.estimateGas.addLiquidityETH
//       method = router.addLiquidityETH
//       args = [
//         wrappedCurrency(
//           tokenBIsETH
//             ? currencies[Field.CURRENCY_A]
//             : currencies[Field.CURRENCY_B],
//           chainId
//         )?.address ?? '', // token
//         (tokenBIsETH ? parsedAmountA : parsedAmountB).raw.toString(), // token desired
//         amountsMin[
//           tokenBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B
//         ].toString(), // token min
//         amountsMin[
//           tokenBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A
//         ].toString(), // eth min
//         account,
//         deadline.toHexString()
//       ]
//       value = BigNumber.from(
//         (tokenBIsETH ? parsedAmountB : parsedAmountA).raw.toString()
//       )
//     } else {
//       estimate = router.estimateGas.addLiquidity
//       method = router.addLiquidity
//       args = [
//         wrappedCurrency(currencies[Field.CURRENCY_A], chainId)?.address ?? '',
//         wrappedCurrency(currencies[Field.CURRENCY_B], chainId)?.address ?? '',
//         parsedAmountA.raw.toString(),
//         parsedAmountB.raw.toString(),
//         amountsMin[Field.CURRENCY_A].toString(),
//         amountsMin[Field.CURRENCY_B].toString(),
//         account,
//         deadline.toHexString()
//       ]
//       value = null
//     }

//     setAttemptingTxn(true)
//     await estimate(...args, (value != null) ? { value } : {})
//       .then(async (estimatedGasLimit: number) =>
//         await method(...args, {
//           ...((value != null) ? { value } : {}),
//           gasLimit: calculateGasMargin(estimatedGasLimit)
//         }).then(async (response) => {
//           setAttemptingTxn(false)
//           setTxPending(true)
//           const summary = `Add ${liquidityTokenData.amountA} ${liquidityTokenData.symbolA} and ${liquidityTokenData.amountB} ${liquidityTokenData.symbolB}`

//           addTransaction(response, {
//             summary
//           })

//           setTxHash(response.hash)

//           try {
//             const receipt = await response.wait()
//             finalizedTransaction(receipt, {
//               summary
//             })
//             setTxPending(false)
//           } catch (error) {
//             setTxPending(false)
//             setAddLiquidityErrorMessage('There is an error in transaction.')
//           }
//         })
//       )
//       .catch((error: any) => {
//         setAttemptingTxn(false)
//         setAddLiquidityErrorMessage(
//           error?.code === 'ACTION_REJECTED' ? 'Transaction rejected' : error?.message
//         )
//         // we only care if the error is   something _other_ than the user rejected the tx
//         if (error?.code !== 'ACTION_REJECTED') {
//           console.error(error)
//         }
//       })
//   }

//   const { connectWallet } = useConnectWallet(isSupportedNetwork)

//   const handleDismissConfirmation = useCallback(() => {
//     setShowConfirm(false)
//     // if there was a tx hash, we want to clear the input
//     if (txHash) {
//       onFieldAInput('')
//     }
//     setTxHash('')
//   }, [onFieldAInput, txHash])

//   const buttonText = useMemo(() => {
//     if (account) {
//       if (!isSupportedNetwork) return 'Switch Network'
//       return error ?? 'S  upply'
//     }
//     return 'Connect Wallet'
//   }, [account, isSupportedNetwork, error])

//   const modalHeader = () => {
//     return (
//       <div>
//         <div className='flex justify-center mt-10 mb-3'>
//           <DoubleCurrencyLogo
//             currency0={currencies[Field.CURRENCY_A]}
//             currency1={currencies[Field.CURRENCY_B]}
//             size={48}
//           />
//         </div>
//         <div className='mb-6 text-center'>
//           <h6>
//             {pendingText}
//             <br />
//             {`You will receive ${formatTokenAmount(liquidityMinted)} ${currencies[Field.CURRENCY_A]?.symbol} / ${currencies[Field.CURRENCY_B]?.symbol} LP Tokens`}
//           </h6>
//         </div>
//         <div className='mb-3 text-center'>
//           <small className='text-secondary'>
//             {`Output is estimated. If the price changes by more than ${allowedSlippage / 100}% your transaction will revert.`}
//           </small>
//         </div>
//         <div className='swapButtonWrapper'>
//           <ButtonPrimary fullWidth onClick={onAddLiquidity}>
//             Confirm Supply
//           </ButtonPrimary>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div>
//       {showConfirm && (
//         <TransactionConfirmationModal
//           isOpen={showConfirm}
//           onDismiss={handleDismissConfirmation}
//           attemptingTxn={attemptingTxn}
//           txPending={txPending}
//           hash={txHash}
//           content={() =>
//             addLiquidityErrorMessage
//               ? (
//                 <TransactionErrorContent
//                   onDismiss={handleDismissConfirmation}
//                   message={addLiquidityErrorMessage}
//                 />
//                 )
//               : (
//                 <ConfirmationModalContent
//                   title='supplyingliquidity'
//                   onDismiss={handleDismissConfirmation}
//                   content={modalHeader}
//                 />
//                 )}
//           pendingText={pendingText}
//           modalContent={
//             txPending ? 'submittedTxLiquidity' : 'successAddedliquidity'
//           }
//         />
//       )}
//       <CurrencyInput
//         id='add-liquidity-input-tokena'
//         title='token'
//         currency={currencies[Field.CURRENCY_A]}
//         showHalfButton={Boolean(maxAmounts[Field.CURRENCY_A])}
//         showMaxButton={atMaxAmounts[Field.CURRENCY_A] == null}
//         onMax={() =>
//           onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '')}
//         onHalf={() => {
//           const halfAmount = halfAmounts[Field.CURRENCY_A]
//           if (halfAmount != null) {
//             onFieldAInput(halfAmount.toExact())
//           }
//         }}
//         handleCurrencySelect={handleCurrencyASelect}
//         amount={formattedAmounts[Field.CURRENCY_A]}
//         setAmount={onFieldAInput}
//         bgClass={currencyBgClass}
//       />
//       <div className='exchangeSwap'>
//         <AddLiquidityIcon />
//       </div>
//       <CurrencyInput
//         id='add-liquidity-input-tokenb'
//         title='token'
//         showHalfButton={Boolean(maxAmounts[Field.CURRENCY_B])}
//         currency={currencies[Field.CURRENCY_B]}
//         showMaxButton={atMaxAmounts[Field.CURRENCY_B] == null}
//         onHalf={() => {
//           const maxAmount = maxAmounts[Field.CURRENCY_B]
//           if (maxAmount != null) {
//             onFieldBInput(
//               maxAmount.divide('2').toFixed(maxAmount.currency.decimals)
//             )
//           }
//         }}
//         onMax={() =>
//           onFieldBInput(maxAmounts[Field.CURRENCY_B]?.toExact() ?? '')}
//         handleCurrencySelect={handleCurrencyBSelect}
//         amount={formattedAmounts[Field.CURRENCY_B]}
//         setAmount={onFieldBInput}
//         bgClass={currencyBgClass}
//       />
//       {currencies[Field.CURRENCY_A] &&
//         currencies[Field.CURRENCY_B] &&
//         pairState !== PairState.INVALID &&
//         price && (
//           <div className='my-2'>
//             <div className='swapPrice'>
//               <small>
//                 1 {currencies[Field.CURRENCY_A]?.symbol} ={' '}
//                 {price.toSignificant(3)} {currencies[Field.CURRENCY_B]?.symbol}{' '}
//               </small>
//               <small>
//                 1 {currencies[Field.CURRENCY_B]?.symbol} ={' '}
//                 {price.invert().toSignificant(3)}{' '}
//                 {currencies[Field.CURRENCY_A]?.symbol}{' '}
//               </small>
//             </div>
//             <div className='swapPrice'>
//               <small>Your Pool Share</small>
//               <small>
//                 {poolTokenPercentage
//                   ? poolTokenPercentage.toSignificant(6) + '%'
//                   : '-'}
//               </small>
//             </div>
//             <div className='swapPrice'>
//               <small>lpTokenReceived</small>
//               <small>
//                 {formatTokenAmount(userPoolBalance)} lpTokens
//               </small>
//             </div>
//           </div>
//       )}
//       <div className='swapButtonWrapper flex-wrap'>
//         {(approvalA === ApprovalState.NOT_APPROVED ||
//           approvalA === ApprovalState.PENDING ||
//           approvalB === ApprovalState.NOT_APPROVED ||
//           approvalB === ApprovalState.PENDING) &&
//           !error && (
//             <div className='flex fullWidth justify-between mb-2'>
//               {approvalA !== ApprovalState.APPROVED && (
//                 <div
//                   className={`w-[${approvalB !== ApprovalState.APPROVED ? '48%' : '100%'}]`}
//                 >
//                   <ButtonPrimary
//                     fullWidth
//                     onClick={async () => {
//                       setApprovingA(true)
//                       try {
//                         await approveACallback()
//                         setApprovingA(false)
//                       } catch (e) {
//                         setApprovingA(false)
//                       }
//                     }}
//                     disabled={approvingA || approvalA === ApprovalState.PENDING}
//                   >
//                     {approvalA === ApprovalState.PENDING
//                       ? `approving ${
//                           currencies[Field.CURRENCY_A]?.symbol
//                         }`
//                       : `approve ${
//                           currencies[Field.CURRENCY_A]?.symbol
//                         }`}
//                   </ButtonPrimary>
//                 </div>
//               )}
//               {approvalB !== ApprovalState.APPROVED && (
//                 <div
//                   className={`w-[${approvalA !== ApprovalState.APPROVED ? '48%' : '100%'}]`}
//                 >
//                   <ButtonPrimary
//                     fullWidth
//                     onClick={async () => {
//                       setApprovingB(true)
//                       try {
//                         await approveBCallback()
//                         setApprovingB(false)
//                       } catch (e) {
//                         setApprovingB(false)
//                       }
//                     }}
//                     disabled={approvingB || approvalB === ApprovalState.PENDING}
//                   >
//                     {approvalB === ApprovalState.PENDING
//                       ? `approving ${
//                           currencies[Field.CURRENCY_B]?.symbol
//                         }`
//                       : `approve ${
//                           currencies[Field.CURRENCY_B]?.symbol
//                         }`}
//                   </ButtonPrimary>
//                 </div>
//               )}
//             </div>
//         )}
//         <ButtonPrimary
//           fullWidth
//           disabled={
//             Boolean(account) &&
//             isSupportedNetwork &&
//             (Boolean(error) ||
//               approvalA !== ApprovalState.APPROVED ||
//               approvalB !== ApprovalState.APPROVED)
//           }
//           onClick={account && isSupportedNetwork ? onAdd : connectWallet}
//         >
//           {buttonText}
//         </ButtonPrimary>
//       </div>
//     </div>
//   )
// }

// export default AddLiquidity
