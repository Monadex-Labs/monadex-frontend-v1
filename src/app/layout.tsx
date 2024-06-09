import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Web3ProviderWrapper from '@/utils/ProviderWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Monadex',
  description: 'The liquidity factory on Monad'
}

export default function RootLayout ({
  children
}: Readonly<{
  children: React.ReactNode
}>): JSX.Element {
  return (
    <html lang='en'>
      <Web3ProviderWrapper>
        <body className={inter.className}>{children}</body>
      </Web3ProviderWrapper>
    </html>
  )
}
