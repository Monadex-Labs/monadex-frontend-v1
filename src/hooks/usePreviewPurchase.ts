'use client'
import { useState, useEffect } from 'react'
import { useRaffleContract } from './useContracts'
import { RAFFLE_MULTIPLIERS } from '@/utils/getRafflePercentage'

interface RaffleData {
  tokenAddress: string
  amount: number
  multiplier: RAFFLE_MULTIPLIERS
}

export default function usePreviewPurchase ({ tokenAddress, amount, multiplier }: RaffleData): Number | undefined {
  const [previewTickets, setPreviewTickets] = useState<number>(0)
  const RaffleContract = useRaffleContract()
  useEffect(() => {
    const fetchPreview = async (): Promise<void> => {
      const preview = await RaffleContract?.previewPurchase(tokenAddress, amount, multiplier)
      setPreviewTickets(preview)
    }
    void fetchPreview()
  }, [tokenAddress, amount, multiplier])

  return previewTickets ?? 0
}
