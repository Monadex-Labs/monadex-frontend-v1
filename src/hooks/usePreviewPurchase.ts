'use client'
import { useState, useEffect } from 'react'
import { useRaffleContract } from './useContracts'

export default function usePreviewPurchase (tokenAddress: string | undefined, amount: string | undefined, multiplier: number | null): Number | undefined {
  const [previewTickets, setPreviewTickets] = useState<number>(0)
  const RaffleContract = useRaffleContract()
  // TODO: Add error handling (call reverts when token not whitelisted)
  useEffect(() => {
    const fetchPreview = async (): Promise<void> => {
      if (tokenAddress === undefined || amount === undefined || multiplier == null) return
      const preview = await RaffleContract?.previewPurchase(tokenAddress, amount, multiplier)
      setPreviewTickets(preview)
    }
    void fetchPreview()
  }, [tokenAddress, amount, multiplier])

  return previewTickets ?? 0
}
