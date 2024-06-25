'use client'
import {
  getVersionUpgrade,
  VersionUpgrade
} from '@uniswap/token-lists'
import { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useWalletData } from '@/utils'
import useIsWindowVisible from '@/hooks/useWindowVisible'
import { AppDispatch, AppState } from '../store'
import { acceptListUpdate } from './actions'
import { DEFAULT_TOKEN_LIST } from './reducer'
import { useFetchListCallback } from '@/hooks/useFetchListCallback'
import useInterval from '@/hooks/useInterval'

export default function Updater (): null {
  const { provider: library } = useWalletData()
  const dispatch = useDispatch<AppDispatch>()
  const lists = useSelector<AppState, AppState['lists']['byUrl']>(
    (state) => state.lists.byUrl
  )
  const isWindowVisible = useIsWindowVisible()
  const fetchList = useFetchListCallback()
  const fetchAllListsCallback = useCallback(() => {
    if (!isWindowVisible) return
    DEFAULT_TOKEN_LIST.forEach(async (url) =>
      await fetchList(url, true).catch((error) =>
        console.debug('interval list fetching error', error)
      )
    )
  }, [fetchList, isWindowVisible])
  // fetch all lists every 10 minutes, but only after we initialize library
  useInterval(fetchAllListsCallback, (library != null) ? 100000 * 60 * 10 : null)

  // whenever a list is not loaded and not loading, try again to load it
  useEffect(() => {
    Object.keys(lists).forEach((listUrl) => {
      const list = lists[listUrl]

      if ((list.current == null) && !list.loadingRequestId && !list.error) {
        fetchList(listUrl).catch((error) =>
          console.debug('list added fetching error', error)
        )
      }
    })
  }, [dispatch, fetchList, library, lists])
  // automatically update lists if versions are minor/patch
  useEffect(() => {
    Object.keys(lists).forEach((listUrl) => {
      const list = lists[listUrl]
      if ((list.current != null) && (list.pendingUpdate != null)) {
        const bump = getVersionUpgrade(
          list.current.version,
          list.pendingUpdate.version
        )
        switch (bump) {
          case VersionUpgrade.NONE:
            throw new Error('unexpected no version bump')
          case VersionUpgrade.PATCH:
          case VersionUpgrade.MINOR:
          case VersionUpgrade.MAJOR:
            dispatch(acceptListUpdate(listUrl))
        }
      }
    })
  }, [dispatch, lists])
  return null
}
