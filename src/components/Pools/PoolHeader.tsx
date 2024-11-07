'use client'

import Link from 'next/link'
import SearchInput from './PoolSearch'
import { useMediaQuery, useTheme } from '@mui/material'

const PoolHeader: React.FC = () => {
  const theme = useTheme()
  const mobileWindowSize = useMediaQuery(theme.breakpoints.down('sm'))
  return (
    <div className='flex justify-between items-center max-w-[95%] mx-auto md:max-w-[100%]'>
      <SearchInput />
      <Link href='pools/new' className='ml-4 px-4 py-2 border-2 border-primary rounded-md bg-primary text-white transition-colors'>
        {mobileWindowSize ? '+' : ' Create New Position'}
      </Link>
    </div>
  )
}

export default PoolHeader
