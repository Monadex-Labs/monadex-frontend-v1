import { MONAD, ChainId, currencyEquals, NativeCurrency, Token } from '@monadex/sdk'
import { useCallback } from 'react'
import { useParams, useSearchParams, usePathname, useRouter } from 'next/navigation'
import useParsedQueryString from './useParseQueryString'
import { useWalletData } from '@/utils'

export default function usePoolsRedirects () {
  const { chainId } = useWalletData()
  const chainIdToUse = chainId ?? ChainId.SEPOLIA
  const router = useRouter()
  const params = useParams()
  const _search = useSearchParams().toString()
  const search = _search === '' ? '' : `?${_search}`
  const path = usePathname()
  const currentPath = path + search
  const parsedQs = useParsedQueryString()
  const currencyIdAParam = params ? params.currencyIdA : undefined
  const currencyIdBParam = params ? params.currencyIdB : undefined

  const redirectWithCurrencySingleToken = useCallback((currency: any) => {
    let redirectPath = ''
    const currencyId = currency.name === 'MONAD' ? 'MND' : currency.address
    if (parsedQs.currency) {
      redirectPath = currentPath.replace(`currency=${parsedQs.currency}`, `currency=${currencyId}`)
    } else {
      redirectPath = `${currentPath}${search === '' ? '?' : '&'}currency=${currencyId}`
    }
    router.push(redirectPath)
  }, [currentPath, parsedQs, router, search])
  const redirectWithCurrency = useCallback((currency: any, isInput: boolean, isV2 = true) => {
    let redirectPath = ''
    const currencyId = (isV2 && currencyEquals(currency, MONAD)) ? 'MND' : currency.address
    if (isInput) {
      if (currencyIdAParam ?? parsedQs.currency0) {
        if (currencyIdAParam) {
          redirectPath = currentPath.replace(currencyIdAParam as string, currencyId)
        } else {
          redirectPath = currentPath.replace(`currency0=${parsedQs.currency0}`, `currency0=${currencyId}`)
        }
      } else {
        if (path.includes('/add')) {
          redirectPath = `${currentPath}/${currencyId}/${
                    currencyIdBParam || currencyId === 'MND'
                  }${params && params.version ? `/${params.version}` : ''}`
        } else {
          redirectPath = `${currentPath}${search === '' ? '?' : '&'}currency0=${currencyId}`
        }
      }
    } else {
      if (currencyIdAParam ?? parsedQs.currency1) {
        if (currencyIdBParam) {
          redirectPath = currentPath.replace(currencyIdBParam as string, currencyId)
        } else {
          redirectPath = currentPath.replace(`currency1=${parsedQs.currency0}`, `currency1=${currencyId}`)
        }
      } else {
        if (path.includes('/add')) {
          redirectPath = `${currentPath}/${
                        currencyIdAParam || currencyId === 'ETH'
                      }/${currencyId}${
                        params && params.version ? `/${params.version}` : ''
                      }`
        } else {
          redirectPath = `${currentPath}${search === '' ? '?' : '&'}currency1=${currencyId}`
        }
      }
    }
    router.push(redirectPath)
  }, [
    currentPath,
    parsedQs,
    router,
    search,
    path,
    currencyIdAParam,
    currencyIdBParam,
    chainIdToUse
  ])
  const redirectWithSwitch = useCallback(
    (currency: any, isInput: boolean, isV2 = true) => {
      const currencyId = (isV2
        ? currencyEquals(currency, MONAD)
        : currency.name === 'MONAD')
        ? 'MND'
        : currency.address
      let redirectPath
          if (isInput) {
        if (path.includes('/add')) {
          redirectPath = `/add/${currencyId}/${currencyIdAParam}${
                params && params.version ? `/${params.version}` : ''
              }`
            } else {
          redirectPath = `${path}?currency0=${currencyId}&currency1=${parsedQs.currency0}`
            }
      } else {
        if (path.includes('/add')) {
          redirectPath = `/add/${currencyIdBParam}/${currencyId}${
                params && params.version ? `/${params.version}` : ''
              }`
            } else {
          redirectPath = `${path}?currency0=${parsedQs.currency1}&currency1=${currencyId}`
            }
      }
      router.push(redirectPath)
        },
    [
      chainIdToUse,
      currencyIdAParam,
      currencyIdBParam,
      params,
      parsedQs.currency0,
      parsedQs.currency1
        ],
  )
  return {
    redirectWithCurrencySingleToken,
    redirectWithCurrency,
    redirectWithSwitch
  }
}