import { useRaffleContract } from '@/hooks/useContracts'
import { useEffect, useState } from 'react'

export enum RAFFLE_MULTIPLIERS {
  MULTIPLIER1 = 0,
  MULTIPLIER2 = 1,
  MULTIPLIER3 = 2
}

export function getRafflePercentage (multiplier: RAFFLE_MULTIPLIERS): number | null {
  const [percentage, setPercentage] = useState<number | null>(null)
  const raffleContract = useRaffleContract()

  useEffect(() => {
    const fetchPercentage = async (): Promise<void> => {
      if (raffleContract == null) return
      try {
        const percentage = await raffleContract.getMultiplierToPercentage(multiplier)
        setPercentage(percentage)
      } catch (error) {
        console.error('Error fetching raffle percentage', error)
        setPercentage(null)
      }
    }
    void fetchPercentage()
  }, [multiplier])
  return percentage
}
