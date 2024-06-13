'use client'
import SwapPageHeader from '@/components/Swap/SwapHeader'
import { useWalletData } from '@/utils'
export default function Home (): JSX.Element {
  const { chainId, account, isConnected, findProvider } = useWalletData()
  console.log(chainId, account, isConnected)
  console.log('dod', findProvider)
  return (
    <div className='text-center'>
      <SwapPageHeader isTablet={false} />
    </div>
  )
}
