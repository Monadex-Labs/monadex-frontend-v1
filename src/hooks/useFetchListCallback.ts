import { nanoid } from '@reduxjs/toolkit'
import { TokenList } from '@uniswap/token-lists'
import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/state/store'
import getTokenList from '@/utils/getTokenList'
import { fetchTokenList } from '@/state/list/actions'
import { DEFAULT_TOKEN_LIST_URL } from '@/constants'

export function useFetchListCallback (): (

  listUrl: string,
  skipValidation?: boolean,
) => Promise<TokenList> {
  const dispatch = useDispatch<AppDispatch>()

  return useCallback(
    async (listUrl: string = DEFAULT_TOKEN_LIST_URL, skipValidation?: boolean) => {
      console.log('here')
      const requestId = nanoid()
      dispatch(fetchTokenList.pending({ requestId, url: listUrl }))
      return await getTokenList(listUrl, true)
        .then((tokenList) => {
          dispatch(
            fetchTokenList.fulfilled({ url: listUrl, tokenList, requestId })
          )
          return tokenList
        })
        .catch((error) => {
          console.debug(`Failed to get list at url ${listUrl}`, error)
          dispatch(
            fetchTokenList.rejected({
              url: listUrl,
              requestId,
              errorMessage: error.message
            })
          )
          throw error
        })
    },
    [dispatch]
  )
}
