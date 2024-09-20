'use client'
import Link from 'next/link'
import { useEffect } from 'react'
import { ALL_PAIRS, PAIRS_BULK } from '@/apollo/queries' 
import Pools from '@/components/Pools/Pools'
import { client } from '@/apollo/client'
// import { useFetchPairsData } from '@/state/pools/hooks'
import { PrimaryButton } from '@/components'
import useBulkPools from '@/hooks/usePools'
const Pool = (): JSX.Element => {
  const { bulkPairsData, isLoading, historicalData } = useBulkPools()
  // console.log('w', bulkPairsData, isLoading)
  console.log('w', historicalData)
  
  return (
    <div className='container mx-auto mt-10'>
      {/* <Link href='pools/new' className='border-2 px-4 py-2 text-primary border-primary rounded-md '>create new position</Link> */}
      <Pools/>
    </div>
  )
}

export default Pool
