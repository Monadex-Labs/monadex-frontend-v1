import type { Metadata } from 'next'
import QueryWrapper from '@/utils/QueryProvider'
import ReduxProvider from '@/hooks/useReduxProvider'
import { Inter, Fira_Code } from 'next/font/google'
import Updaters from '@/hooks/Updaters'
import './globals.css'
import Web3ProviderWrapper from '@/utils/ProviderWrapper'
import Header from '@/components/Header'
const inter = Inter({ subsets: ['latin'] })
const fira_code = Fira_Code({ subsets: ['latin'], variable: '--font-fira-code' })
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
    // wrap redux provider
    <html lang='en-US'>
      <body className={`${inter.className} ${fira_code.variable} max-w-[95%] mx-auto`}>
        <QueryWrapper>
          <Web3ProviderWrapper>
            <ReduxProvider>
              <Updaters />
              <Header />
              {children}
            </ReduxProvider>
          </Web3ProviderWrapper>
        </QueryWrapper>
      </body>
    </html>
  )
}
