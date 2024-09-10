'use client'
import { Percent } from '@monadex/sdk'
import { ReactElement } from 'react'
import { warningSeverity } from '@/utils/price'

/**
 * Formatted version of price impact text with warning colors
*/
export function FormattedPriceImpact ({
  priceImpact
}: {
  priceImpact?: Percent
}): ReactElement {
  const severity = warningSeverity(priceImpact)
  return (
    <small
      className={
            severity === 3 || severity === 4
              ? 'text-error'
              : severity === 2
                ? 'text-yellow'
                : severity === 1
                  ? 'text-blueviolet'
                  : 'text-success'
        }
    >
      {/* {(priceImpact != null) ? `${priceImpact.multiply(BigInt(-1)).toFixed(2)}%` : '-'} */}
      {(priceImpact != null) ? `${priceImpact.multiply(BigInt(100)).toFixed(2)}%` : '-'}
    </small>
  )
}
