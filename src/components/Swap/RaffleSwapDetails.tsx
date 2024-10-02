'use client'
import { Box, ToggleButtonGroup, ToggleButton } from '@mui/material'
import { QuestionHelper } from '../common'
import { useSwapActionHandlers, useSwapState } from '@/state/swap/hooks'
import { useEffect, useState } from 'react'
import { useRaffleContract } from '@/hooks/useContracts'
import { Percent } from '@monadex/sdk'

const MultiplierInput = (): JSX.Element => {
  const { multiplier } = useSwapState()
  const {
    onMultiplierChange
  } = useSwapActionHandlers()
  const [percentages, setPercentages] = useState<Array<Percent | null>>([null, null, null])

  const raffleContract = useRaffleContract()

  const handleMultiplierChange = (
    event: React.MouseEvent<HTMLElement>,
    multiplier: number | null
  ): void => {
    onMultiplierChange(multiplier)
  }

  /* TODO: Use this instead of Effect and State method
  const percentage: Percent = multiplier != null
    ? useSingleCallResult(raffleContract, 'getMultiplierToPercentage', [multiplier])?.result?.[0]
    : null
  */

  useEffect(() => {
    const fetchPercentages = async (): Promise<void> => {
      if (raffleContract == null) return
      try {
        const _percentages = []
        for (let i = 0; i < 3; i++) { // TODO: Use RaffleMultipliers enum or from sdk or contract
          const fetchedPercent = await raffleContract.getMultiplierToPercentage(i)
          _percentages.push(fetchedPercent)
        }
        setPercentages(_percentages)
      } catch (error) {
        console.error('Error fetching raffle percentage', error)
        setPercentages([null, null, null])
      }
    }
    void fetchPercentages()
  }, [multiplier, raffleContract])

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
        {percentages.map((percentage, index) =>
          <ToggleButton key={index} className='bg-primary' value={index} aria-label={`Multiplier ${index}`}>{percentage?.numerator.toString()}</ToggleButton>
        )}

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
