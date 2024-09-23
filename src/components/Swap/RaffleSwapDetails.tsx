import { Box, ToggleButtonGroup, ToggleButton } from '@mui/material'
import { QuestionHelper } from '../common'
import { useSwapActionHandlers, useSwapState } from '@/state/swap/hooks'
import { RAFFLE_MULTIPLIERS } from '@/utils/getRafflePercentage'

const MultiplierInput = (): JSX.Element => {
  const { multiplier } = useSwapState()
  const {
    onMultiplierChange
  } = useSwapActionHandlers()

  const handleMultiplierChange = (
    event: React.MouseEvent<HTMLElement>,
    multiplier: number | null
  ): void => {
    onMultiplierChange(multiplier)
  }

  return (
    <Box className='flex justify-center text-white'>
      <ToggleButtonGroup
        color='secondary'
        value={multiplier}
        exclusive
        onChange={handleMultiplierChange}
        aria-label='multiplier'
      >
        {/* TODO: Fetch percentages using getRafflePercentage.ts */}
        <ToggleButton className='bg-primary' value={RAFFLE_MULTIPLIERS.MULTIPLIER1} aria-label='Multiplier 1'>0,1%</ToggleButton>
        <ToggleButton className='bg-primary' value={RAFFLE_MULTIPLIERS.MULTIPLIER2} aria-label='Multiplier 2'>0,5%</ToggleButton>
        <ToggleButton className='bg-primary' value={RAFFLE_MULTIPLIERS.MULTIPLIER3} aria-label='Multiplier 3'>0,8%</ToggleButton>
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
