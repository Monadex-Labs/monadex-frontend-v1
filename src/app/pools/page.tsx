'use client'
import PageHeader from '@/components/Swap/SwapHeader'
import Link from 'next/link'
const Pool = (): JSX.Element => {
  return (
    <div>
      <PageHeader isTablet={false} pageName='Pools' />
      <Link href='/new' className='border-2 px-4 py-2 text-[#8133FF] border-[#8133FF] rounded-md '>create new position</Link>
    </div>
  )
}

export default Pool
