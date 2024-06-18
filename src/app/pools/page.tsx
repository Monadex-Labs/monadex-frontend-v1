'use client'
import PageHeader from '@/components/Swap/SwapHeader'
import { useRouter } from 'next/navigation'
import { PrimaryButton } from '@/components'
const Pool = (): JSX.Element => {
  const router = useRouter()
  return (
    <div>
      <PageHeader isTablet={false} pageName='Pools' />
      <PrimaryButton
        onClick={() => router.push('/pools/add')}
      >
        add liquidity
      </PrimaryButton>
    </div>
  )
}

export default Pool
