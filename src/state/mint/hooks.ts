import {
  Token,
  CurrencyAmount,
  ETH,
  JSBI,
  Pair,
  Percent,
  Price,
  TokenAmount,
  ChainId,
  NativeCurrency
} from '@monadex/sdk'
import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { PairState, usePair } from '@/data/Reserves'
import { useTotalSupply } from '@/data/TotalSupply'
import { useWalletData } from '@/utils'
import { wrappedCurrency, wrappedCurrencyAmount } from '@/utils/wrappedCurrency'
import { AppDispatch, AppState } from '../store'
import { tryParseAmount } from '@/state/swap/hooks'
import { useCurrencyBalances } from '@/state/wallet/hooks'
import { _useCurrency } from '@/hooks/Tokens'
import { Field, typeInput, selectCurrency } from './actions'

const ZERO = JSBI.BigInt(0)

export function useMintState (): AppState['mint'] {
  return useSelector<AppState, AppState['mint']>((state) => state.mint)
}
export function useDerivedMintInfo (): {
  dependentField: Field
  currencies: { [field in Field]?: Token | NativeCurrency }
  pair?: Pair | null
  pairState: PairState
  currencyBalances: { [field in Field]?: TokenAmount | CurrencyAmount }
  parsedAmounts: { [field in Field]?: TokenAmount | CurrencyAmount }
  price?: Price
  noLiquidity?: boolean
  liquidityMinted?: TokenAmount
  poolTokenPercentage?: Percent
  error?: string
} {
  const { account, chainId } = useWalletData()
  const nativeCurrency = ETH
  const {
    independentField,
    typedValue,
    [Field.CURRENCY_A]: { currencyId: currencyAId },
    [Field.CURRENCY_B]: { currencyId: currencyBId },
    otherTypedValue
  } = useMintState()
  const currencyA = _useCurrency(currencyAId)
  const currencyB = _useCurrency(currencyBId)
  const dependentField = independentField === Field.CURRENCY_A ? Field.CURRENCY_B : Field.CURRENCY_A
  // *
  // tokens
  const currencies: { [field in Field]?: NativeCurrency | Token } = useMemo(
    () => ({
      [Field.CURRENCY_A]: currencyA ?? undefined,
      [Field.CURRENCY_B]: currencyB ?? undefined
    }),
    [currencyA, currencyB]
  )
  // pair
  const [pairState, pair] = usePair(
    currencies[Field.CURRENCY_A],
    currencies[Field.CURRENCY_B]
  )
  const totalSupply = useTotalSupply(pair?.liquidityToken)
  const noLiquidity: boolean =
    pairState === PairState.NOT_EXISTS ||
    Boolean((totalSupply !== undefined) && JSBI.equal(totalSupply.raw, ZERO))
  // balances
  const balances = useCurrencyBalances(account ?? undefined, [
    currencies[Field.CURRENCY_A],
    currencies[Field.CURRENCY_B]
  ])
  const currencyBalances: { [field in Field]?: CurrencyAmount | TokenAmount } = {
    [Field.CURRENCY_A]: balances?.[0] as TokenAmount,
    [Field.CURRENCY_B]: balances?.[1] as TokenAmount
  }

  // amounts
  const independentAmount: CurrencyAmount | TokenAmount | undefined = tryParseAmount(
    typedValue,
    currencies[independentField]
  )

  const dependentAmount: CurrencyAmount | undefined = useMemo(() => {
    if (noLiquidity) {
      if (otherTypedValue && currencies[dependentField]) { // eslint-disable-line
        return tryParseAmount(
          otherTypedValue,
          currencies[dependentField]
        )
      }
      return undefined
    } else if (independentAmount instanceof CurrencyAmount) {
      // we wrap the currencies just to get the price in terms of the other token
      const wrappedIndependentAmount = wrappedCurrencyAmount(
        independentAmount,
        chainId
      )
      const [tokenA, tokenB] = [
        wrappedCurrency(currencyA ?? undefined, chainId),
        wrappedCurrency(currencyB ?? undefined, chainId)
      ]
      if (tokenA && tokenB && wrappedIndependentAmount && pair) { // eslint-disable-line
        const dependentCurrency =
          dependentField === Field.CURRENCY_B ? currencyB : currencyA
        const independentPrice =
          dependentField === Field.CURRENCY_B
            ? pair.priceOf(tokenA)
            : pair.priceOf(tokenB)
        try {
          const dependentTokenAmount = independentPrice.quote(
            wrappedIndependentAmount
          )
          return dependentCurrency === nativeCurrency
            ? CurrencyAmount.ether(dependentTokenAmount.raw)
            : dependentTokenAmount
        } catch (error) {
          // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
          console.debug('Failed to quote amount', error)
        }
      }
      return undefined
    } else {
      return undefined
    }
  }, [
    noLiquidity,
    independentAmount,
    otherTypedValue,
    currencies,
    dependentField,
    chainId,
    currencyA,
    currencyB,
    pair,
    nativeCurrency
  ])

  const parsedAmounts: {
    [field in Field]: CurrencyAmount | TokenAmount | undefined;
  } = useMemo(() => {
    return {
      [Field.CURRENCY_A]:
        independentField === Field.CURRENCY_A
          ? independentAmount
          : dependentAmount,
      [Field.CURRENCY_B]:
        independentField === Field.CURRENCY_A
          ? dependentAmount
          : independentAmount
    }
  }, [dependentAmount, independentAmount, independentField])

  const price = useMemo(() => {
    if (noLiquidity) {
      const {
        [Field.CURRENCY_A]: currencyAAmount,
        [Field.CURRENCY_B]: currencyBAmount
      } = parsedAmounts
      if (currencyAAmount && currencyBAmount) { // eslint-disable-line
        return new Price(
          currencyAAmount.currency,
          currencyBAmount.currency,
          currencyAAmount.raw,
          currencyBAmount.raw
        )
      }
      return undefined
    } else {
      const wrappedCurrencyA = wrappedCurrency(currencyA ?? undefined, chainId)
      return pair && wrappedCurrencyA // eslint-disable-line
        ? pair.priceOf(wrappedCurrencyA)
        : undefined
    }
  }, [chainId, currencyA, noLiquidity, pair, parsedAmounts])
  // liquidity minted
  const liquidityMinted = useMemo(() => {
    const {
      [Field.CURRENCY_A]: currencyAAmount,
      [Field.CURRENCY_B]: currencyBAmount
    } = parsedAmounts
    const [tokenAmountA, tokenAmountB] = [
      wrappedCurrencyAmount(currencyAAmount, chainId),
      wrappedCurrencyAmount(currencyBAmount, chainId)
    ]
    if (pair && totalSupply && tokenAmountA && tokenAmountB) { // eslint-disable-line
      return pair.getLiquidityMinted(totalSupply, tokenAmountA, tokenAmountB)
    } else {
      return undefined
    }
  }, [parsedAmounts, chainId, pair, totalSupply])

  const poolTokenPercentage = useMemo(() => {
    if (liquidityMinted && totalSupply) { // eslint-disable-line
      return new Percent(
        liquidityMinted.raw,
        totalSupply.add(liquidityMinted).raw
      )
    } else {
      return undefined
    }
  }, [liquidityMinted, totalSupply])

  let error: string | undefined
  if (account === undefined) {
    error = 'Connect Wallet'
  }

  if (pairState === PairState.INVALID) {
    error = error ?? 'Invalid pair'
  }

  if (!parsedAmounts[Field.CURRENCY_A] || !parsedAmounts[Field.CURRENCY_B]) { // eslint-disable-line
    error = error ?? 'Enter an amount' // eslint-disable-line
  }
  const {
    [Field.CURRENCY_A]: currencyAAmount,
    [Field.CURRENCY_B]: currencyBAmount
  } = parsedAmounts

  if (
    (currencyAAmount !== undefined) &&
    currencyBalances?.[Field.CURRENCY_A]?.lessThan(currencyAAmount) // eslint-disable-line
  ) {
    error = `Insufficient ${currencies[Field.CURRENCY_A]?.symbol as string} balance`
    if (
      (currencyBAmount !== undefined) &&
      currencyBalances?.[Field.CURRENCY_B]?.lessThan(currencyBAmount) // eslint-disable-line
    ) {
      error = `Insufficient ${currencies[Field.CURRENCY_B]?.symbol as string} balance` // eslint-disable-line
    }
  }
  return {
    dependentField,
    currencies,
    pair,
    pairState,
    currencyBalances,
    parsedAmounts,
    price,
    noLiquidity,
    liquidityMinted,
    poolTokenPercentage,
    error
  }
}
export function useMintActionHandlers (
  noLiquidity: boolean | undefined,
  chainId: ChainId
): {
    onFieldAInput: (typedValue: string) => void
    onFieldBInput: (typedValue: string) => void
    onCurrencySelection: (field: Field, currency: Token | NativeCurrency) => void
  } {
  const dispatch = useDispatch<AppDispatch>()

  const onFieldAInput = useCallback(
    (typedValue: string) => {
      dispatch(
        typeInput({
          field: Field.CURRENCY_A,
          typedValue,
          noLiquidity: noLiquidity === true
        })
      )
    },
    [dispatch, noLiquidity]
  )
  const onFieldBInput = useCallback(
    (typedValue: string) => {
      dispatch(
        typeInput({
          field: Field.CURRENCY_B,
          typedValue,
          noLiquidity: noLiquidity === true
        })
      )
    },
    [dispatch, noLiquidity]
  )

  const onCurrencySelection = useCallback(
    (field: Field, currency: Token | NativeCurrency) => {
      dispatch(
        selectCurrency({
          field,
          currencyId:
              currency instanceof Token
                ? currency.address
                : currency === ETH
                  ? 'ETH'
                  : ''
        })
      )
    },
    [chainId, dispatch]
  )
  return {
    onFieldAInput,
    onFieldBInput,
    onCurrencySelection
  }
}
