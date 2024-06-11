import { Token, TokenAmount } from '@monadex/sdk'
import { useMemo } from 'react'
import { useTokenContract } from './useContracts'
import { useLastTransactionHash } from '@/state/transactions/hooks'
import { useQuery, UseQueryResult } from '@tanstack/react-query'

function useTokenAllowanceData (
  tokenAddress?: string,
  owner?: string,
  spender?: string
): UseQueryResult<any> {
  const contract = useTokenContract(tokenAddress, false)
  const lastTx = useLastTransactionHash()

  return useQuery({
    queryKey: ['token-allowance', tokenAddress, owner, spender, lastTx],
    queryFn: async () => {
      if ((contract == null) || !spender || !owner) return null // eslint-disable-line
      const res = await contract.allowance(owner, spender)
      return res
    }
  })
}

export function useTokenAllowance (
  token?: Token,
  owner?: string,
  spender?: string
): TokenAmount | undefined {
  const { data: allowance } = useTokenAllowanceData(
    token?.address,
    owner,
    spender
  )

  return useMemo(
    () =>
      (token != null) && allowance // eslint-disable-line
        ? new TokenAmount(token, allowance.toString())
        : undefined,
    [token, allowance]
  )
}
