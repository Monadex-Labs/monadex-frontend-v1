import { useState, useEffect } from 'react'
import { usePairContract } from '@/hooks/useContracts'
import { BigNumber } from '@ethersproject/bignumber'
import { Percent } from '@monadex/sdk'
export function usePoolFee(pairAddress: string | undefined): string | null {
  const [fee, setFee] = useState<string | null>(null)
  const pairContract = usePairContract(pairAddress)
  useEffect(() => {
    const fetchFee = async () => {
      if (pairContract) {
        try {
          const feeBN = await pairContract.getPoolFee()
          const feePercent = new Percent(feeBN.numerator, feeBN.denominator)
          // Convert to percentage string with 2 decimal places
          const feePercentage = `${feePercent.multiply(BigInt(100)).toFixed(2)}%`          
          // Assuming the fee is stored as basis points (e.g., 30 for 0.3%)
          setFee(feePercentage)
        } catch (error) {
          console.error('Error fetching pool fee:', error)
          setFee(null)
        }
      }
    }

    fetchFee()
  }, [pairContract])

  return fee as string
}
