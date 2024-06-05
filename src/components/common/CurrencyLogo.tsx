import { Token } from '@monadex/sdk'
import React, { useMemo } from 'react'

import useHttpLocations from '@/hooks/useHttpLocations'
import { WrappedTokenInfo } from '@/state/lists/hooks'
import Logo from './Logo'

export default function CurrencyLogo ({
  currency
}: {
  currency?: Token
}): JSX.Element {
  const uriLocations = useHttpLocations(currency instanceof WrappedTokenInfo ? currency.logoURI : undefined)

  const srcs: string[] = useMemo(() => {
    if (currency instanceof Token) {
      if (currency instanceof WrappedTokenInfo) {
        return [...uriLocations, currency.logoURI ?? currency.address]
      }

      return []
    }
    return []
  }, [currency, uriLocations])

  return <Logo srcs={srcs} alt={`${currency?.symbol as string ?? 'token'} logo`} />
}
