'use client'
import PageHeader from '@/components/Swap/SwapHeader'
import { useWalletData } from '@/utils/index'
export default function Home (): JSX.Element {
  return (
    <div className='text-center'>
      <PageHeader isTablet={false} pageName='Swap'/>
    </div>
  )
}
