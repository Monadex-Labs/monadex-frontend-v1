'use client'
import React from 'react'
import Audio from '../common/Audio'
import { useBlockNumber } from '@/state/application/hooks'
const Footer: React.FC = () => {
  const blockNumber = useBlockNumber()
  return (
    <div className='p-4  mt-10 absolute bottom-0 w-full'>
      {blockNumber
        ? (
          <div className='flex items-center justify-end'>
            <Audio />
            <p className='text-end text-sm font-fira'>{blockNumber}</p>
          </div>
          )
        : null}
    </div>
  )
}

export default Footer
