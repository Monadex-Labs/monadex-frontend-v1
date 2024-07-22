'use client'
import React from "react"
import { useBlockNumber } from "@/state/application/hooks"
import { Box } from "@mui/material"
const Footer:React.FC = () => {
   const blockNumber = useBlockNumber()

   return (
    <div className='border-b'>
      <div className="flex gap-2">
      <p className="text-end">{blockNumber}</p>
      </div>
    </div>
   )
}

export default Footer