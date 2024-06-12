import { ChainId, NativeCurrency, currencyEquals, MONAD, WMND, CurrencyAmount } from '@monadex/sdk'
import { useMemo, useState } from 'react'
import { tryParseAmount } from '@/state/swap/hooks'
import { useTransactionAdder } from '@/state/transactions/hooks'
import { useCurrencyBalance } from '@/state/wallet/hooks'
import { useWalletData, formatTokenAmount } from '@/utils/index'
import { useWMNDContract } from './useContracts'

export enum WrapType {
  NOT_APPLICABLE,
  WRAP,
  UNWRAP,
  WRAPPING,
  UNWRAPPING,
}
const NOT_APPLICABLE = { wrapType: WrapType.NOT_APPLICABLE }
/**
 * Given the selected input and output currency, return a wrap callback
 * @param inputCurrency the selected input currency
 * @param outputCurrency the selected output currency
 * @param typedValue the user input value
 */

export default function useWrapCallback (
  inputCurrency: NativeCurrency | undefined,
  outputCurrency: NativeCurrency | undefined,
  typedValue: string | undefined
): {
    wrapType: WrapType
    execute?: undefined | (() => Promise<void>)
    inputError?: string
  } {
  const { chainId, account } = useWalletData()
  const chainIdToUse = (chainId !== null) ? chainId : ChainId.SEPOLIA
  const nativeCurrency = MONAD
  const wmndContract = useWMNDContract()
  const balance = useCurrencyBalance(account ?? undefined, inputCurrency) as CurrencyAmount
  // we can always parse the amount typed as the input currency, since wrapping is 1:1
  const inputAmount = useMemo(
    () => tryParseAmount(typedValue, inputCurrency),
    [chainIdToUse, inputCurrency, typedValue]
  )
  const addTransaction = useTransactionAdder()
  const [wrapping, setWrapping] = useState(false)
  const [unwrapping, setUnWrapping] = useState(false)
  return useMemo(() => {
    if (wmndContract === null || inputCurrency === null || outputCurrency === null) return NOT_APPLICABLE
    const sufficientBalance = (inputAmount !== null) && (balance !== null) && !balance.lessThan(inputAmount as CurrencyAmount)
    if (
      inputCurrency === nativeCurrency &&
        currencyEquals(MONAD, outputCurrency as NativeCurrency)
    ) {
      return {
        wrapType: wrapping ? WrapType.WRAPPING : WrapType.WRAP,
        execute:
              sufficientBalance && (inputAmount != null)
                ? async () => {
                  setWrapping(true)
                  try {
                    const txReceipt = await wmndContract.deposit({
                      value: `0x${inputAmount.raw.toString(16)}`
                    })
                    addTransaction(txReceipt, {
                      summary: `Wrap ${formatTokenAmount(inputAmount)} ${
                            MONAD.symbol as string
                          } to ${WMND[chainId].symbol as string}`
                    })
                    await txReceipt.wait()
                    setWrapping(false)
                  } catch (error) {
                    setWrapping(false)
                    console.error('Could not wrap', error)
                  }
                }
                : undefined,
        inputError: sufficientBalance ? undefined : 'Insufficient Balance'
      }
    } else if (currencyEquals(MONAD, inputCurrency as NativeCurrency) && outputCurrency === nativeCurrency) {
      return {
        wrapType: unwrapping ? WrapType.UNWRAPPING : WrapType.UNWRAP,
        execute:
              sufficientBalance && (inputAmount != null)
                ? async () => {
                  setUnWrapping(true)
                  try {
                    const txReceipt = await wmndContract.withdraw(`0x${inputAmount.raw.toString(16)}`)
                    addTransaction(txReceipt, {
                      summary: `Unwrap ${formatTokenAmount(inputAmount)} ${WMND[chainId].symbol as string} to ${MONAD.symbol as string}`
                    })
                    await txReceipt.wait()
                    setUnWrapping(false)
                  } catch (error) {
                    setUnWrapping(false)
                    console.error('Could not unwrap', error)
                  }
                }
                : undefined,
        inputError: sufficientBalance ? undefined : 'Insufficient Balance'
      }
    } else {
      return NOT_APPLICABLE
    }
  }, [
    wmndContract,
    chainId,
    inputCurrency,
    outputCurrency,
    inputAmount,
    balance,
    nativeCurrency,
    wrapping,
    addTransaction,
    unwrapping
  ])
}
