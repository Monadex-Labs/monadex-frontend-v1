import { MONAD, ChainId, currencyEquals } from '@monadex/sdk'
import { useCallback } from 'react'
import { useParams,  useSearchParams, usePathname, useRouter } from 'next/navigation'
import useParsedQueryString from './useParseQueryString'
import { useWalletData } from '@/utils'

export default function usePoolsRedirects () {
    const { chainId } = useWalletData()
    const chainIdToUse = chainId ?? ChainId.SEPOLIA
    const router = useRouter()
    const params = useParams()
    const search = useSearchParams().toString()
    const path = usePathname()
    const currentPath = path + search
    const parsedQs = useParsedQueryString()
    const currencyIdAParam = params ? params.currencyIdA : undefined
    const currencyIdBParam = params ? params.currencyIdB : undefined
}