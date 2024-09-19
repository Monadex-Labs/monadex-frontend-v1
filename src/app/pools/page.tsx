'use client'
import Link from 'next/link'
import { useEffect } from 'react'
import { ALL_PAIRS, PAIRS_BULK } from '@/apollo/queries' 
// import { useQuery } from '@apollo/client'
import { client } from '@/apollo/client'
import { useFetchPairsData } from '@/state/pools/hooks'

const Pool = (): JSX.Element => {
  const { bulkPairsData, isLoading } = useFetchPairsData()
  console.log('w', bulkPairsData)
  return (
    <div className='container mx-auto mt-10'>
      <Link href='pools/new' className='border-2 px-4 py-2 text-primary border-primary rounded-md '>create new position</Link>
    </div>
  )
}

export default Pool
