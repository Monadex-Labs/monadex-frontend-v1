'use client'
import { useState } from "react"
import { useMemo } from "react"
import { useRaffleContract } from "./useContracts"

interface RaffleData {
    address : string
    amount : number
    multiplier : 1 | 2 | 3
}

export default function usePreviewPurchase({address, amount, multiplier}: RaffleData) : Number | undefined {
    const [previewTickets, setPreviewTickets] = useState<number>(0)
    const RaffleContract = useRaffleContract()
    useMemo(async() => {
        const preview = await RaffleContract?.previewPurchase(address, amount, multiplier)
        setPreviewTickets(preview)
    },[address, amount, multiplier])
    
    return previewTickets || 0
}
