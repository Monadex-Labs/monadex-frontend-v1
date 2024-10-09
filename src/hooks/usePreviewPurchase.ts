'use client'
import { useState, useEffect } from 'react'
import { useRaffleContract } from './useContracts'

export default function usePreviewPurchase (tokenAddress: string | undefined, amount: string | undefined, multiplier: number | null): number | undefined {
  const [previewTickets, setPreviewTickets] = useState<number | undefined>()
  const RaffleContract = useRaffleContract()
  useEffect(() => {
    const fetchPreview = async (): Promise<void> => {
      if (tokenAddress === undefined || amount === undefined || multiplier == null) return
      try {
        const preview = await RaffleContract?.previewPurchase(tokenAddress, amount, multiplier)
        setPreviewTickets(preview)
      } catch (error) {
        console.error('Error fetching raffle percentage', error)
        setPreviewTickets(undefined)
      }
    }
    void fetchPreview()
  }, [tokenAddress, amount, multiplier])

  return previewTickets
}
