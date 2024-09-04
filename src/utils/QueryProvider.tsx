'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export default function QueryWrapper ({ children }: { children: React.ReactNode }): JSX.Element {
  const queryClient = new QueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
