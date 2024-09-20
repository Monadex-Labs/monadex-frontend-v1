import { Box, ToggleButtonGroup, ToggleButton } from '@mui/material'
import { QuestionHelper } from '../common'
import { useState } from 'react'

const MultiplierInput = (): JSX.Element => {
  const [multiplier, setMultiplier] = useState<string | null>('2')

  const handleMultiplierChange = (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: string | null
  ): void => {
    setMultiplier(newAlignment)
  } // TODO: Dispatch an action (pending state for multiplier)

  return (
    <Box className='flex justify-center text-white'>
      <ToggleButtonGroup
        color='secondary'
        value={multiplier}
        exclusive
        onChange={handleMultiplierChange}
        aria-label='multiplier'
      >
        <ToggleButton className='bg-primary' value='1' aria-label='Multiplier 1'>0,1%</ToggleButton>
        <ToggleButton className='bg-primary' value='2' aria-label='Multiplier 2'>0,5%</ToggleButton>
        <ToggleButton className='bg-primary' value='3' aria-label='Multiplier 3'>0,8%</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  )
}

export const RaffleSwapDetails: React.FC<any> = () => {
  return (
    <div>
      <Box className='flex mb-3'>
        <p className='mr-2'>Select a Multiplier</p>
        <QuestionHelper text='You will receive a smaller or bigger amount of tickets based on the multiplier you select.' />
      </Box>
      <MultiplierInput />
    </div>
  )
}
