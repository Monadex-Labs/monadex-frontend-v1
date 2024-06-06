import { createReducer } from '@reduxjs/toolkit'
import { getVersionUpgrade, VersionUpgrade } from '@uniswap/token-lists'
import { TokenList } from '@uniswap/token-lists/dist/types'
import { DEFAULT_TOKEN_LIST } from '../../constants/index'
import { updateVersion } from '../global/actions'
import { acceptListUpdate, addList, fetchTokenList, removeList } from './actions'

export interface ListsState {
  readonly byUrl: {
    readonly [url: string]: {
      readonly current: TokenList | null
      readonly pendingUpdate: TokenList | null
      readonly loadingRequestId: string | null
      readonly error: string | null
    }
  }
  // this contains the default list of lists from the last time the updateVersion was called, i.e. the app was reloaded
  readonly lastInitializedDefaultListOfLists?: string[]

  // currently active lists
  readonly activeListUrls: string[] | undefined
}

type ListState = ListsState['byUrl'][string]

const NEW_LIST_STATE: ListState = {
  error: null,
  current: null,
  loadingRequestId: null,
  pendingUpdate: null
}

type Mutable<T> = { -readonly [P in keyof T]: T[P] extends ReadonlyArray<infer U> ? U[] : T[P] }

const initialState: ListsState = {
  lastInitializedDefaultListOfLists: DEFAULT_TOKEN_LIST,
  byUrl: {
    ...DEFAULT_TOKEN_LIST.reduce<Mutable<ListsState['byUrl']>>((memo, listUrl) => {
      memo[listUrl] = NEW_LIST_STATE
      return memo
    }, {})
  },
  activeListUrls: DEFAULT_TOKEN_LIST
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(fetchTokenList.pending, (state, { payload: { requestId, url } }) => {
      const current = ((state.byUrl[url]?.current) != null) ? state.byUrl[url]?.current : null
      const pendingUpdate = ((state.byUrl[url]?.pendingUpdate) != null) ? state.byUrl[url]?.pendingUpdate : null
      state.byUrl[url] = {
        ...state.byUrl[url],
        current,
        pendingUpdate,
        loadingRequestId: requestId,
        error: null
      }
    })
    .addCase(fetchTokenList.fulfilled, (state, { payload: { requestId, tokenList, url } }) => {
      const current = state.byUrl[url]?.current
      const loadingRequestId = state.byUrl[url]?.loadingRequestId

      // no-op if update does nothing
      if (current != null) {
        const upgradeType = getVersionUpgrade(current.version, tokenList.version)

        if (upgradeType === VersionUpgrade.NONE) return
        if (loadingRequestId === null || loadingRequestId === requestId) {
          state.byUrl[url] = {
            ...state.byUrl[url],
            loadingRequestId: null,
            error: null,
            current,
            pendingUpdate: tokenList
          }
        }
      } else {
        // activate if on default active
        if (DEFAULT_TOKEN_LIST.includes(url)) {
          state.activeListUrls?.push(url)
        }

        state.byUrl[url] = {
          ...state.byUrl[url],
          loadingRequestId: null,
          error: null,
          current: tokenList,
          pendingUpdate: null
        }
      }
    })
    .addCase(fetchTokenList.rejected, (state, { payload: { url, requestId, errorMessage } }) => {
      if (state.byUrl[url]?.loadingRequestId !== requestId) {
        // no-op since it's not the latest request
        return
      }

      state.byUrl[url] = {
        ...state.byUrl[url],
        loadingRequestId: null,
        error: errorMessage,
        current: null,
        pendingUpdate: null
      }
    })
    .addCase(addList, (state, { payload: url }) => {
      if (state.byUrl[url] == null) {
        state.byUrl[url] = NEW_LIST_STATE
      }
    })
    .addCase(removeList, (state, { payload: url }) => {
      if (state.byUrl[url] != null) {
        delete state.byUrl[url] // eslint-disable-line @typescript-eslint/no-dynamic-delete
      }
      // remove list from active urls if needed
      if ((state.activeListUrls != null) && state.activeListUrls.includes(url)) { // eslint-disable-line @typescript-eslint/prefer-optional-chain
        state.activeListUrls = state.activeListUrls.filter((u) => u !== url)
      }
    })
    .addCase(acceptListUpdate, (state, { payload: url }) => {
      if ((state.byUrl[url]?.pendingUpdate) == null) {
        throw new Error('accept list update called without pending update')
      }
      state.byUrl[url] = {
        ...state.byUrl[url],
        pendingUpdate: null,
        current: state.byUrl[url].pendingUpdate
      }
    })
    .addCase(updateVersion, (state) => {
      // state loaded from localStorage, but new lists have never been initialized
      if (state.lastInitializedDefaultListOfLists !== undefined) {
        state.byUrl = initialState.byUrl
        state.activeListUrls = initialState.activeListUrls
      } else if (state.lastInitializedDefaultListOfLists !== null) {
        // @ts-expect-error
        const lastInitializedSet = state.lastInitializedDefaultListOfLists.reduce<Set<string>>(
          (s: Set<string>, l: string) => s.add(l),
          new Set()
        )
        const newListOfListsSet = DEFAULT_TOKEN_LIST.reduce<Set<string>>((s: Set<string>, l: string) => s.add(l), new Set())

        DEFAULT_TOKEN_LIST.forEach((listUrl) => {
          if (lastInitializedSet.has(listUrl) !== null) {
            state.byUrl[listUrl] = NEW_LIST_STATE
          }
        })

        // @ts-expect-error
        state.lastInitializedDefaultListOfLists.forEach((listUrl: string) => {
          if (newListOfListsSet.has(listUrl)) {
            delete state.byUrl[listUrl] // eslint-disable-line @typescript-eslint/no-dynamic-delete
          }
        })
      }

      state.lastInitializedDefaultListOfLists = DEFAULT_TOKEN_LIST

      // if no active lists, activate defaults
      if (state.activeListUrls == null) {
        state.activeListUrls = DEFAULT_TOKEN_LIST

        // for each list on default list, initialize if needed
        DEFAULT_TOKEN_LIST.map((listUrl: string) => {
          if (state.byUrl[listUrl] == null) {
            state.byUrl[listUrl] = NEW_LIST_STATE
          }
          return true
        })
      }
    })
)
