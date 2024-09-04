import { ChainId, ETH } from '@monadex/sdk'
import { useWalletData } from '@/utils'
import { useCallback } from 'react'
import useParsedQueryString from './useParseQueryString'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'

export default function useSwapRedirects (): {
  redirectWithCurrency: (currency: any, isInput: boolean) => void
  redirectWithSwitch: () => void
} {
  const pathname = usePathname()
  const router = useRouter()
  const search = useSearchParams().toString()
  const currentPath = pathname + (search ? `?${search}` : '')
  const parsedQs = useParsedQueryString()
  const { chainId } = useWalletData()
  const chainIdToUse = chainId ?? ChainId.SEPOLIA

  const isMonad = useCallback(
    (currency: any) => {
      if (currency?.address) return false
      const monad = ETH
      return (
        monad.decimals === currency?.decimals &&
        monad.name === currency?.name &&
        monad.symbol === currency?.symbol
      )
    },
    [chainIdToUse]
  )

  const redirectWithCurrency = useCallback(
    (currency: any, isInput: boolean) => {
      let redirectPath = currentPath
      const currencyId = (isMonad(currency) && currency.name === 'Ether') ? 'ETH' : currency.address
      if (isInput) {
        if (parsedQs.currency0 ?? parsedQs.inputCurrency) {
          if (parsedQs.currency0) {
            redirectPath = redirectPath.replace(`currency0=${parsedQs.currency0}`, `currency0=${currencyId}`)
          } else {
            redirectPath = redirectPath.replace(`inputCurrency=${parsedQs.inputCurrency}`, `inputCurrency=${currencyId}`)
          }
        } else {
          redirectPath += (search === '' ? '?' : '&') + `currency0=${currencyId}`
        }
      } else {
        if (parsedQs.currency1 ?? parsedQs.outputCurrency) {
          if (parsedQs.currency1) {
            redirectPath = redirectPath.replace(`currency1=${parsedQs.currency1}`, `currency1=${currencyId}`)
          } else {
            redirectPath = redirectPath.replace(`outputCurrency=${parsedQs.outputCurrency}`, `outputCurrency=${currencyId}`)
          }
        } else {
          redirectPath += (search === '' ? '?' : '&') + `currency1=${currencyId}`
        }
      }
      router.push(redirectPath)
    },
    [currentPath, router, isMonad, parsedQs.currency0, parsedQs.currency1, parsedQs.inputCurrency, parsedQs.outputCurrency, search]
  )

  const redirectWithSwitch = useCallback(() => {
    let redirectPath = currentPath
    const inputCurrencyId = parsedQs.currency0 ?? parsedQs.inputCurrency
    const outputCurrencyId = parsedQs.currency1 ?? parsedQs.outputCurrency
    if (inputCurrencyId) {
      if (outputCurrencyId) {
        if (parsedQs.currency1) {
          redirectPath = redirectPath.replace(`currency1=${parsedQs.currency1}`, `currency1=${inputCurrencyId}`)
        } else {
          redirectPath = redirectPath.replace(`outputCurrency=${parsedQs.outputCurrency}`, `currency1=${inputCurrencyId}`)
        }
        if (parsedQs.currency0) {
          redirectPath = redirectPath.replace(`currency0=${parsedQs.currency0}`, `currency0=${outputCurrencyId}`)
        } else {
          redirectPath = redirectPath.replace(`inputCurrency=${parsedQs.inputCurrency}`, `currency0=${outputCurrencyId}`)
        }
      } else {
        if (parsedQs.currency0) {
          redirectPath = redirectPath.replace(`currency0=${parsedQs.currency0}`, `currency1=${parsedQs.currency0}`)
        } else {
          redirectPath = redirectPath.replace(`inputCurrency=${inputCurrencyId}`, `currency1=${inputCurrencyId}`)
        }
      }
    } else {
      if (outputCurrencyId) {
        if (parsedQs.currency1) {
          redirectPath = redirectPath.replace(`currency1=${parsedQs.currency1}`, `currency0=${parsedQs.currency1}`)
        } else {
          redirectPath = redirectPath.replace(`outputCurrency=${outputCurrencyId}`, `currency0=${outputCurrencyId}`)
        }
      }
    }
    router.push(redirectPath)
  }, [currentPath, router, parsedQs])

  return { redirectWithCurrency, redirectWithSwitch }
}
