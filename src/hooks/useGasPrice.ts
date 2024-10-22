import { JSBI } from '@monadex/sdk'
import { providers } from 'ethers'
import { useQuery } from '@tanstack/react-query'
import { useWalletData } from '@/utils'

export default function useGasPrice (): JSBI | undefined {
const rpc = 'https://sepolia.base.org'
  const { data } = useQuery({
    queryKey: ['gasPrice', rpc],
    queryFn: async () => {
      // Initialize ethers provider using the RPC URL
      const provider = new providers.JsonRpcProvider(rpc)
      // Fetch gas price using ethers
      const gasPrice = await provider.getGasPrice()
      // Convert to JSBI BigInt
      return JSBI.BigInt(gasPrice.toString())
    }
  })

  return data
}
