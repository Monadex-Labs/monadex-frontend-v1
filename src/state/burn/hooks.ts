import {
  JSBI,
  NativeCurrency,
  Pair,
  Percent,
  Token,
  TokenAmount
} from '@monadex/sdk'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { usePair } from '@/data/Reserves'
import { useTotalSupply } from '@/data/TotalSupply'
import { useWalletData } from '@/utils'
import { AppDispatch, AppState } from '../store'
// import { wrappedCurrency } from '@/utils/wrappedCurrency'
import { tryParseAmount } from '@/state/swap/hooks'
import { useTokenBalances } from '@/state/wallet/hooks'
import { Field, typeInput } from './actions'

export function useBurnState (): AppState['burn'] {
  return useSelector<AppState, AppState['burn']>((state) => state.burn)
}

export function useDerivedBurnInfo (
  currencyA: Token | NativeCurrency | undefined,
  currencyB: Token | NativeCurrency | undefined
): {
    pair?: Pair | null
    parsedAmounts: {
      [Field.LIQUIDITY_PERCENT]: Percent
      [Field.LIQUIDITY]?: TokenAmount
      [Field.CURRENCY_A]?: TokenAmount
      [Field.CURRENCY_B]?: TokenAmount
    }
    error?: string
  } {
  const { account } = useWalletData()
  const { independentField, typedValue } = useBurnState()

  // pair + totalsupply
  const [, pair] = usePair(currencyA, currencyB)
  // balances
  const relevantTokenBalances = useTokenBalances(account ?? undefined, [
    pair?.liquidityToken as Token
  ])
  const userLiquidity: undefined | TokenAmount = relevantTokenBalances?.[pair?.liquidityToken?.address ?? '']
  const [tokenA, tokenB] = [currencyA as Token, currencyB as Token]
  const tokens = {
    [Field.CURRENCY_A]: tokenA,
    [Field.CURRENCY_B]: tokenB,
    [Field.LIQUIDITY]: pair?.liquidityToken
  }
  const totalSupply = useTotalSupply(pair?.liquidityToken)
  const liquidityValueA =
    (pair != null) &&
    (totalSupply !== undefined) &&
    (userLiquidity !== undefined) &&
    (tokenA != null) &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalSupply?.raw, userLiquidity?.raw)
      ? new TokenAmount(tokenA, pair.getLiquidityValue(tokenA, totalSupply, userLiquidity, false).raw)
      : undefined
  const liquidityValueB =
      (pair != null) &&
      (totalSupply !== undefined) &&
      (userLiquidity !== undefined) &&
      (tokenB != null) &&
      // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
      JSBI.greaterThanOrEqual(totalSupply?.raw, userLiquidity?.raw)
        ? new TokenAmount(tokenB, pair.getLiquidityValue(tokenB, totalSupply, userLiquidity, false).raw)
        : undefined
  const liquidityValues: {
    [Field.CURRENCY_A]?: TokenAmount
    [Field.CURRENCY_B]?: TokenAmount
  } = {
    [Field.CURRENCY_A]: liquidityValueA,
    [Field.CURRENCY_B]: liquidityValueB
  }
  let percentToRemove: Percent = new Percent('0', '100')
  // user specified a %
  if (independentField === Field.LIQUIDITY_PERCENT) {
    percentToRemove = new Percent(typedValue, '100')
  } else if (independentField === Field.LIQUIDITY) {
    // user specified a specific amount of liquidity tokens
    if (pair?.liquidityToken !== undefined) {
      const independentAmount = tryParseAmount(
        typedValue,
        pair.liquidityToken
      )
      if (
        (independentAmount !== undefined) &&
        (userLiquidity !== undefined) &&
        !independentAmount.greaterThan(userLiquidity)
      ) {
        percentToRemove = new Percent(independentAmount.raw, userLiquidity.raw)
      }
    }
  } else {
    // user specified a specific amount of token a or b
    if (tokens[independentField] !== undefined) {
      const independentAmount = tryParseAmount(
        typedValue,
        tokens[independentField]
      )
      const liquidityValue = liquidityValues[independentField]
      if (
        (independentAmount != null) &&
        (liquidityValue != null) &&
        !independentAmount.greaterThan(liquidityValue)
      ) {
        percentToRemove = new Percent( // eslint-disable-line
          independentAmount.raw,
          liquidityValue.raw
        )
      }
    }
  }
  const parsedAmounts: {
    [Field.LIQUIDITY_PERCENT]: Percent
    [Field.LIQUIDITY]?: TokenAmount
    [Field.CURRENCY_A]?: TokenAmount
    [Field.CURRENCY_B]?: TokenAmount
  } = {
    [Field.LIQUIDITY_PERCENT]: percentToRemove,
    [Field.LIQUIDITY]:
      (userLiquidity !== undefined) && (percentToRemove !== undefined) && percentToRemove.greaterThan('0')
        ? new TokenAmount(
          userLiquidity.token,
          percentToRemove.multiply(userLiquidity.raw).quotient
        )
        : undefined,
    [Field.CURRENCY_A]:
        tokenA && percentToRemove && percentToRemove.greaterThan('0') && liquidityValueA // eslint-disable-line
          ? new TokenAmount(tokenA, percentToRemove.multiply(liquidityValueA.raw).quotient)
          : undefined,
    [Field.CURRENCY_B]:
        tokenB && percentToRemove && percentToRemove.greaterThan('0') && liquidityValueB // eslint-disable-line
          ? new TokenAmount(tokenB, percentToRemove.multiply(liquidityValueB.raw).quotient)
          : undefined
  }
  let error: string | undefined
  if (account === undefined) {
    error = 'Connect Wallet' // eslint-disable-line
  }
  if (!parsedAmounts[Field.LIQUIDITY] || !parsedAmounts[Field.CURRENCY_A] || !parsedAmounts[Field.CURRENCY_B]) { // eslint-disable-line
    error = error ?? 'Enter an amount' // eslint-disable-line
  }
  return { pair, parsedAmounts, error }
}
export function useBurnActionHandlers (): {
  onUserInput: (field: Field, typedValue: string) => void
} {
  const dispatch = useDispatch<AppDispatch>()
  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      dispatch(typeInput({ field, typedValue }))
    },
    [dispatch]
  )
  return {
    onUserInput
  }
}
