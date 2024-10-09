'use client'
import React from 'react'
import Audio from '../common/Audio'
import { useBlockNumber } from '@/state/application/hooks'
const Footer: React.FC = () => {
  const blockNumber = useBlockNumber()
  return (
    <div className='hidden fixed bottom-0 left-0 right-0 md:block p-4 mt-10 w-full'>
      {blockNumber != null
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
