'use client'
import {JSBI, Percent } from '@monadex/sdk'
import React from 'react'
import { warningSeverity } from '@/utils/price'
/**
 * Formatted version of price impact text with warning colors
*/

export default function FormattedPriceImpact ({
  priceImpact
  }: {
  priceImpact?: Percent
}) {
  const severity = warningSeverity(priceImpact)
    return (
      <small
        className={
            severity === 3 || severity === 4
              ?   'text-error'
            : severity === 2
              ? 'text-yellow'
              : severity === 1
                ? 'text-blueviolet'
                : 'text-success'
        }
      >
        {(priceImpact != null) ? `${priceImpact.multiply(-1).toFixed(2)}%` : '-'}
      </small>
  )
}
