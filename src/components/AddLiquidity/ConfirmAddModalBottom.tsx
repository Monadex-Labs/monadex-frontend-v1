import { Fraction, Percent, Token, TokenAmount } from '@monadex/sdk'
import React from 'react'

import { ButtonPrimary } from '../../components/common/Button'
import CurrencyLogo from '@/components/common/CurrencyLogo'
import { Field } from '@/state/mint/actions'
import { RowBetween, RowFixed } from '@/components/common/Row'

export function ConfirmAddModalBottom ({
  noLiquidity,
  price,
  currencies,
  parsedAmounts,
  poolTokenPercentage,
  onAdd
}: {
  noLiquidity?: boolean
  price?: Fraction
  currencies: { [field in Field]?: Token }
  parsedAmounts: { [field in Field]?: TokenAmount }
  poolTokenPercentage?: Percent
  onAdd: () => void
}): JSX.Element {
  return (
    <>
      <RowBetween>
        {currencies[Field.CURRENCY_A]?.symbol} Deposited
        <RowFixed>
          <CurrencyLogo
            currency={currencies[Field.CURRENCY_A]}
          />

          {parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}

        </RowFixed>
      </RowBetween>
      <RowBetween>
        {currencies[Field.CURRENCY_B]?.symbol} Deposited
        <RowFixed>
          <CurrencyLogo
            currency={currencies[Field.CURRENCY_B]}
          />

          {parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)}

        </RowFixed>
      </RowBetween>
      <RowBetween>
        Rates

        {`1 ${currencies[Field.CURRENCY_A]?.symbol as string} = ${price?.toSignificant(
            4
          ) as string} ${currencies[Field.CURRENCY_B]?.symbol as string}`}

      </RowBetween>
      <RowBetween style={{ justifyContent: 'flex-end' }}>

        {`1 ${currencies[Field.CURRENCY_B]?.symbol as string} = ${price
            ?.invert()
            .toSignificant(4) as string} ${currencies[Field.CURRENCY_A]?.symbol as string}`}

      </RowBetween>
      <RowBetween>
        Share of Pool:

        {noLiquidity !== null ? '100' : poolTokenPercentage?.toSignificant(4)}%

      </RowBetween>
      <ButtonPrimary style={{ margin: '20px 0 0 0' }} onClick={onAdd}>
        {noLiquidity !== null ? 'Create Pool & Supply' : 'Confirm Supply'}
      </ButtonPrimary>
    </>
  )
}
