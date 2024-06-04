import { useMemo } from 'react'
import { Contract } from '@ethersproject/contracts'








function useContracts(
    addresses: (string | undefined)[] | undefined,
    ABI: any,
    withSignerIfPossible = true
  ): (Contract | null)[] | null {
    const { address: account } = useCelo()
    const library = useProvider()
  
    return useMemo(() => {
      if (!addresses || !ABI || !library) return null
      return addresses.map((address) => {
        if (!address) return null
        return getContract(address, ABI, library, withSignerIfPossible && account ? account : undefined)
      })
    }, [addresses, ABI, library, withSignerIfPossible, account])
  }




// export async function useRouter() {

// }
