import { configureStore } from '@reduxjs/toolkit'
import { save, load } from 'redux-localstorage-simple'
import { useDispatch } from 'react-redux'
import user from './user/reducer'
import lists from './list/reducer'
import swap from './swap/reducer'
import transaction from './transactions/reducer'
import multicall from './multicall/reducer'
import application from './application/reducer'
import burn from './burn/reducer'
import mint from './mint/reducer'
import pools from './pools/reducer'

const PERSISTED_KEYS: string[] = ['user', 'transaction', 'lists']

const store = configureStore({
  reducer: {
    user,
    multicall,
    lists,
    application,
    transaction,
    mint,
    burn,
    swap,
    pools
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false, thunk: true }).concat(save({ states: PERSISTED_KEYS })),
  preloadedState: load({ states: PERSISTED_KEYS })
})

export default store
export type AppState = ReturnType<typeof store.getState> // @typescript-eslint/no-unused-vars
export type AppDispatch = typeof store.dispatch
export const useAppDispatch = () => useDispatch<AppDispatch>()
