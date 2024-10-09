import { ETH, ChainId, currencyEquals, NativeCurrency, Token } from '@monadex/sdk'
import { useCallback } from 'react'
import { useParams, useSearchParams, usePathname, useRouter } from 'next/navigation'
import useParsedQueryString from './useParseQueryString'
import { useWalletData } from '@/utils'

export default function usePoolsRedirects (): {
  redirectWithCurrencySingleToken: (currency: any) => void
  redirectWithCurrency: (currency: any, isInput: boolean, isV2?: boolean) => void
  redirectWithSwitch: (currency: any, isInput: boolean, isV2?: boolean) => void
} {
  const router = useRouter()
  const params = useParams()
  const _search = useSearchParams().toString()
  const search = _search === '' ? '' : `?${_search}`
  const path = usePathname()
  const currentPath = path + search
  const parsedQs = useParsedQueryString()

  const getCurrencyId = useCallback((currency: any, isV2 = true) => {
    if (isV2 && currencyEquals(currency, ETH)) return 'ETH'
    if (!isV2 && currency.name === 'ETH') return 'ETH'
    return currency.address
  }, [])

  const redirectWithCurrencySingleToken = useCallback((currency: any) => {
    const currencyId = getCurrencyId(currency)
    let redirectPath = currentPath
    if (parsedQs.currency) {
      redirectPath = redirectPath.replace(`currency=${parsedQs.currency}`, `currency=${currencyId}`)
    } else {
      redirectPath = `${redirectPath}${search === '' ? '?' : '&'}currency=${currencyId}`
    }
    router.push(redirectPath)
  }, [currentPath, parsedQs, router, search, getCurrencyId])

  const redirectWithCurrency = useCallback((currency: any, isInput: boolean, isV2 = true) => {
    const currencyId = getCurrencyId(currency, isV2)
  
    const currencyParamA = params?.currencyIdA ?? parsedQs.currency0
    const currencyParamB = params?.currencyIdB ?? parsedQs.currency1
  
    let redirectPath = currentPath
    if (path.includes('/add')) {
      const paramA = isInput ? currencyId : currencyParamA || ''
      const paramB = isInput ? currencyParamB || '' : currencyId
      redirectPath = `/add/${paramA}/${paramB}${params?.version ? `/${params.version}` : ''}`
    } else {
      const newParams = new URLSearchParams(search)
      newParams.set(isInput ? 'currency0' : 'currency1', currencyId)
      if (!isInput && !newParams.has('currency0')) newParams.set('currency0', currencyParamA as string || '')
      if (isInput && !newParams.has('currency1')) newParams.set('currency1', currencyParamB as string || '')
      redirectPath = `${path}?${newParams.toString()}`
    }
  
    router.push(redirectPath)
  }, [currentPath, parsedQs, router, search, path, params, getCurrencyId])

  const redirectWithSwitch = useCallback((currency: any, isInput: boolean, isV2 = true) => {
    const currencyId = getCurrencyId(currency, isV2)
    const currentParamA = parsedQs.currency0 || params?.currencyIdA
    const currentParamB = parsedQs.currency1 || params?.currencyIdB

    let redirectPath
    if (path.includes('/add')) {
      redirectPath = `/add/${isInput ? currencyId : currentParamA}/${isInput ? currentParamB : currencyId}${
        params?.version ? `/${params.version}` : ''
      }`
    } else {
      redirectPath = `${path}?currency0=${isInput ? currencyId : currentParamB}&currency1=${
        isInput ? currentParamA : currencyId
      }`
    }

    router.push(redirectPath)
  }, [path, parsedQs, params, router, getCurrencyId])

  return {
    redirectWithCurrencySingleToken,
    redirectWithCurrency,
    redirectWithSwitch
  }
}
