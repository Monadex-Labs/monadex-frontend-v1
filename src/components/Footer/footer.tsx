'use client'
import React from 'react'
import { useBlockNumber } from '@/state/application/hooks'
import { Box, Button } from '@mui/material'
import { IoLogoDiscord } from 'react-icons/io5'

const Footer:React.FC = () => {
   const blockNumber = useBlockNumber()
   return (
    <div className='border-b'>
      <div className="flex gap-2">
        <button className="flex items-center gap-3 py-3 rounded-md border bg-[#240456] px-6 border border-[#2D1653] text-[#8133FF]"><IoLogoDiscord /> login</button>
      <p className="text-end">{blockNumber}</p>
      </div>
    </div>
   )
}

export default Footer