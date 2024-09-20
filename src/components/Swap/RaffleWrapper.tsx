'use client'
import { Box, Switch } from '@mui/material'
import { RaffleSwapDetails } from './RaffleSwapDetails'
import { useState } from 'react'

export const RaffleWrapper: React.FC<any> = () => {
  const [showRaffle, setShowRaffle] = useState(false)

  const onShowRaffleChange = (): void => {
    setShowRaffle(!showRaffle)
  }

  return (
    <Box className='rounded-md bg-bgColor p-3 border border-primary mb-4'>
      <Box className='flex space-between items-center gap-2'>
        <p>Enter Raffle
        </p>
        <Switch
          checked={showRaffle}
          onChange={onShowRaffleChange}
        />
      </Box>
      {showRaffle && (
        <RaffleSwapDetails />
      )}
    </Box>
  )
}
