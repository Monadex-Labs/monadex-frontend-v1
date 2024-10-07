'use client'
import { Box, ToggleButtonGroup, ToggleButton } from '@mui/material'
import { QuestionHelper } from '../common'
import { useDerivedSwapInfo, useSwapActionHandlers, useSwapState } from '@/state/swap/hooks'
import { useEffect, useState } from 'react'
import { useRaffleContract } from '@/hooks/useContracts'
import { Percent } from '@monadex/sdk'
import { RAFFLE_MULTIPLIERS } from '@/utils/getRafflePercentage'
import usePreviewPurchase from '@/hooks/usePreviewPurchase'

const MultiplierInput = (): JSX.Element => {
  const {
    multiplier
  } = useSwapState()

  const {
    parsedAmount
  } = useDerivedSwapInfo()

  const {
    onMultiplierChange
  } = useSwapActionHandlers()
  const [percentages, setPercentages] = useState<Array<Percent | null>>([null, null, null])

  const raffleContract = useRaffleContract()
  const previewTickets = usePreviewPurchase(parsedAmount?.token.address, parsedAmount?.raw.toString(), multiplier)

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
        const _percentages: Array<Percent | null> = await Promise.all(Object.values(RAFFLE_MULTIPLIERS).filter(value => typeof value === 'number').map(async (multiplier) => {
          return await raffleContract.getMultiplierToPercentage(multiplier) // eslint-disable-line @typescript-eslint/return-await
        }))
        setPercentages(_percentages)
      } catch (error) {
        console.error('Error fetching raffle percentage', error)
        setPercentages([null, null, null])
      }
    }
    void fetchPercentages()
  }, [multiplier, raffleContract])

  return (
    <Box className='flex flex-col justify-center items-center text-white'>
      <ToggleButtonGroup
        color='secondary'
        value={multiplier}
        exclusive
        onChange={handleMultiplierChange}
        aria-label='multiplier'
        className='flex flex-row'
      >
        {/* TODO: Fetch percentages using getRafflePercentage.ts (pending refactor on getRafflePercentage) */}
        {percentages.map((percentage, index) =>
          <ToggleButton key={index} className='bg-primary' value={index} aria-label={`Multiplier ${index}`}>{percentage?.numerator.toString()}%</ToggleButton>
        )}
      </ToggleButtonGroup>
      {previewTickets != null
        ? <div className='flex flex-row'>Raffle tickets to receive: {previewTickets.toString()}</div>
        : <></>}
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
