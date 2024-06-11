'use client'
import { Provider } from 'react-redux'
import store from '@/state/store'

const ReduxProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  return (
    <Provider store={store}>
      {children}
    </Provider>
  )
}
export default ReduxProvider
