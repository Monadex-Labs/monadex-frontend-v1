import { configureStore, getDefaultMiddleware, EnhancedStore } from '@reduxjs/toolkit'
import { save, load } from 'redux-localstorage-simple'
import application from './application/reducer'
import { updateVersion } from './global/actions'
import user from './user/reducer'
import transactions from './transactions/reducer'
import swap from './swap/reducer'
import mint from './mint/reducer'
import lists from './lists/reducer'
import burn from './burn/reducer'
import multicall from './multicall/reducer'

const PERSISTED_KEYS: string[] = ['user', 'transactions', 'lists']

const store: EnhancedStore = configureStore({
  reducer: {
    user,
    swap,
    multicall,
    burn,
    mint,
    lists,
    transactions,
    application

  },
  middleware: [...getDefaultMiddleware({ thunk: false }), save({ states: PERSISTED_KEYS })],
  preloadedState: load({ states: PERSISTED_KEYS })
})

store.dispatch(updateVersion())
export default store

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
