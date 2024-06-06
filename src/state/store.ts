import { configureStore } from '@reduxjs/toolkit'
import { save, load } from 'redux-localstorage-simple'
import application from './application/reducer'
import { updateVersion } from './global/actions'
import user from './user/reducer'
// import transactions from '@/state/transactions/reducer'
import swap from '@/state/swap/reducer'
// import mint from '@/state/mint/reducer'
import lists from '@/state/list/reducer'
// import burn from '@/state/burn/reducer'
import multicall from '@/state/multicall/reducer'

const PERSISTED_KEYS: string[] = ['user', 'transactions', 'lists']

const store = configureStore({
  reducer: {
    user,
    swap,
    multicall,
    // burn,
    // mint,
    lists,
    // transactions,
    application

  },
  // middleware: (getDefaultMiddleware) => [...getDefaultMiddleware({ thunk: false }), save({ states: PERSISTED_KEYS })],
  preloadedState: load({ states: PERSISTED_KEYS })
})

store.dispatch(updateVersion())
export default store

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
