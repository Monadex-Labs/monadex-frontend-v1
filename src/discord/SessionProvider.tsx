'use client'
import { SessionProvider } from 'next-auth/react'
const NextAuthSessionProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  return (
    <SessionProvider refetchInterval={5 * 60}>
      {children}
    </SessionProvider>
  )
}

export default NextAuthSessionProvider
