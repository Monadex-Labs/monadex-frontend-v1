import { ChainId, MONAD } from '@monadex/sdk'
import { useWalletData } from '@/utils'
import { useCallback } from 'react'
import useParsedQueryString from './useParseQueryString'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { cp } from 'fs'
export default function useSwapRedirects () : {
  redirectWithCurrency: (currency: any, isInput: boolean, isV2?: boolean) => void
  redirectWithSwitch: () => void
} {
  const pathname = usePathname()
  const router = useRouter()
  const search = useSearchParams().toString()
  const currentPath = pathname + search
  const parsedQs = useParsedQueryString()
  const { chainId } = useWalletData()
  const chainIdToUse = chainId ?? ChainId.SEPOLIA

  const isMonad = useCallback(
    (currency: any) => {
      // ether does not have address
      if (currency?.address !== null) return false

      // Check if it is actually an ether;
      // don't use 'currencyEquals' method from uniswap because,
      // the structure of current currency is modified already
      // thus that method returns always false value in case if the selected
      // token is ETHER.
      const monad = MONAD
      return (
        monad.decimals === currency?.decimals &&
        monad.name === currency?.name &&
        monad.symbol === currency?.symbol
      )
    },
    [chainIdToUse]
  )
  const redirectWithCurrency = useCallback(
    (currency: any, isInput: boolean, isV2 = true) => {
      let redirectPath = ''
      const currencyId = (isV2
        ? isMonad(currency)
        : currency.name === 'MONAD')
        ? 'MND'
        : currency.address
      if (isInput) {
        if (parsedQs.currency0 ?? parsedQs.inputCurrency) { // eslint-disable-line
          if (parsedQs.currency0 !== null) { 
            redirectPath = currentPath.replace(
              `currency0=${parsedQs.currency0}`,
              `currency0=${currencyId}`
            )
          } else {
            redirectPath = currentPath.replace(
              `inputCurrency=${parsedQs.inputCurrency}`,
              `inputCurrency=${currencyId}`
            )
          }
        } else {
          redirectPath = `${currentPath}${
            search === '' ? '?' : '&'
          }currency0=${currencyId}`
        }
      } else {
        if (parsedQs.currency1 ?? parsedQs.outputCurrency) {
          if (parsedQs.currency1) {
            redirectPath = currentPath.replace(
              `currency1=${parsedQs.currency1}`,
              `currency1=${currencyId}`
            )
          } else {
            redirectPath = currentPath.replace(
              `outputCurrency=${parsedQs.outputCurrency}`,
              `outputCurrency=${currencyId}`
            )
          }
        } else {
          redirectPath = `${currentPath}${
            search === '' ? '?' : '&'
          }currency1=${currencyId}`
        }
      }
      router.push(redirectPath)
    },
    [
      currentPath,
      history,
      isMonad,
      parsedQs.currency0,
      parsedQs.currency1,
      parsedQs.inputCurrency,
      parsedQs.outputCurrency
    ]
  )
  const redirectWithSwitch = useCallback(() => {
    let redirectPath = '';
    const inputCurrencyId = parsedQs.currency0 ?? parsedQs.inputCurrency;
    const outputCurrencyId = parsedQs.currency1 ?? parsedQs.outputCurrency;
    if (inputCurrencyId) {
      if (outputCurrencyId) {
        if (parsedQs.currency1) {
          redirectPath = currentPath.replace(
            `currency1=${parsedQs.currency1}`,
            `currency1=${inputCurrencyId}`,
          );
        } else {
          redirectPath = currentPath.replace(
            `outputCurrency=${parsedQs.outputCurrency}`,
            `currency1=${inputCurrencyId}`,
          );
        }
        if (parsedQs.currency0) {
          redirectPath = redirectPath.replace(
            `currency0=${parsedQs.currency0}`,
            `currency0=${outputCurrencyId}`,
          );
        } else {
          redirectPath = redirectPath.replace(
            `inputCurrency=${parsedQs.inputCurrency}`,
            `currency0=${outputCurrencyId}`,
          );
        }
      } else {
        if (parsedQs.currency0) {
          redirectPath = currentPath.replace(
            `currency0=${parsedQs.currency0}`,
            `currency1=${parsedQs.currency0}`,
          );
        } else {
          redirectPath = currentPath.replace(
            `inputCurrency=${inputCurrencyId}`,
            `currency1=${inputCurrencyId}`,
          );
        }
      }
    } else {
      if (outputCurrencyId) {
        if (parsedQs.currency1) {
          redirectPath = currentPath.replace(
            `currency1=${parsedQs.currency1}`,
            `currency0=${parsedQs.currency1}`,
          );
        } else {
          redirectPath = currentPath.replace(
            `outputCurrency=${outputCurrencyId}`,
            `currency0=${outputCurrencyId}`,
          );
        }
      }
    }
    router.push(redirectPath);
  }, [currentPath, history, parsedQs])

  return { redirectWithCurrency, redirectWithSwitch }
}
