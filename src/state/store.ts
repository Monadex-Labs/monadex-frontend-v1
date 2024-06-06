import { configureStore, EnhancedStore } from '@reduxjs/toolkit'
import { save, load } from 'redux-localstorage-simple'

const PERSISTED_KEYS: string[] = ['user', 'transactions', 'lists']

const store: EnhancedStore = configureStore({
  reducer: {
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false, thunk: true }).concat(save({ states: PERSISTED_KEYS })),
  preloadedState: load({ states: PERSISTED_KEYS })
})

export default store

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
