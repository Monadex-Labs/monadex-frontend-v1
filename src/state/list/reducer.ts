import { createReducer } from '@reduxjs/toolkit'
import { getVersionUpgrade, VersionUpgrade } from '@uniswap/token-lists'
import { TokenList } from '@uniswap/token-lists/dist/types'
import { updateVersion } from '../global/actions'
import { DEFAULT_TOKEN_LIST_URL } from '@/constants/index'
import { acceptListUpdate, addList, fetchTokenList, removeList, selectList } from './actions'
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
  readonly selectedListUrl: string | undefined
}
export const DEFAULT_TOKEN_LIST = [
  DEFAULT_TOKEN_LIST_URL
]

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
  selectedListUrl: DEFAULT_TOKEN_LIST_URL
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(fetchTokenList.pending, (state, { payload: { requestId, url } }) => {
      state.byUrl[url] = {
        ...state.byUrl[url],
        loadingRequestId: requestId,
        error: null,
        current: null,
        pendingUpdate: null
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
    .addCase(selectList, (state, { payload: url }) => {
      state.selectedListUrl = url
      if (!state.byUrl[url]) {
        state.byUrl[url] = NEW_LIST_STATE
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
      if ((state.selectedListUrl === url)) { // eslint-disable-line @typescript-eslint/prefer-optional-chain
        state.selectedListUrl =
          url === DEFAULT_TOKEN_LIST_URL
            ? Object.keys(state.byUrl)[0]
            : DEFAULT_TOKEN_LIST_URL
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
        state.selectedListUrl = DEFAULT_TOKEN_LIST_URL
      } else if (state.lastInitializedDefaultListOfLists != null) {
        // @ts-expect-error
        const lastInitializedSet = state.lastInitializedDefaultListOfLists.reduce<Set<string>>(
          (s: Set<string>, l: string) => s.add(l),
          new Set()
        )
        const newListOfListsSet = DEFAULT_TOKEN_LIST.reduce<Set<string>>((s: Set<string>, l: string) => s.add(l), new Set())

        DEFAULT_TOKEN_LIST.forEach((listUrl) => {
          if (lastInitializedSet.has(listUrl) !== '') {
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
      if (!state.selectedListUrl) {
        state.selectedListUrl = DEFAULT_TOKEN_LIST_URL
        if (state.byUrl[DEFAULT_TOKEN_LIST_URL] == null) {
          state.byUrl[DEFAULT_TOKEN_LIST_URL] = NEW_LIST_STATE
        }
      }
    })
)
