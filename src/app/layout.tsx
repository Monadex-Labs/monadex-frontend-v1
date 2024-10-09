import type { Metadata } from 'next'
import QueryWrapper from '@/utils/QueryProvider'
import ReduxProvider from '@/hooks/useReduxProvider'
import { Inter, Fira_Code } from 'next/font/google'
import Updaters from '@/hooks/Updaters'
import './globals.css'
import Web3ProviderWrapper from '@/utils/ProviderWrapper'
import Header from '@/components/Header'
import NextAuthSessionProvider from '@/discord/SessionProvider'
import Footer from '@/components/Footer/footer'
import LoadingScreen from '@/components/common/LoadingScreen'
import { ApolloWrapper } from '@/utils/ApolloWrapper'
import BottomNavBar from '@/components/Header/BottomNavBar'
import Terms from '@/components/Terms'

const inter = Inter({ subsets: ['latin'] })
const firaCode = Fira_Code({ subsets: ['latin'], variable: '--font-fira-code' })
export const metadata: Metadata = {
  title: 'Monadex | The leading DEX on Monad',
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
      <body className={`font-clash ${firaCode.variable}`}>
        <LoadingScreen />
        <NextAuthSessionProvider>
            <QueryWrapper>
              <Web3ProviderWrapper>
                <ReduxProvider>
                  <Updaters />
                  <ApolloWrapper>
                    <Header />
                    {children}
                    <BottomNavBar />
                    <Footer />
                  </ApolloWrapper>
                </ReduxProvider>
              </Web3ProviderWrapper>
            </QueryWrapper>
        </NextAuthSessionProvider>
      </body>
    </html>
  )
}
