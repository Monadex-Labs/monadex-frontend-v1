'use client'
import SwapPageHeader from '@/components/Swap/SwapHeader'
import { useWalletData } from '@/utils'
export default function Home (): JSX.Element {
 
  return (
    <div className='text-center'>
      <SwapPageHeader isTablet={false} />
    </div>
  )
}
