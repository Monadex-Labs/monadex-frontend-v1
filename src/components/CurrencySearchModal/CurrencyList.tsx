import {
  currencyEquals,
  Token,
  MONAD,
  NativeCurrency,
  CurrencyAmount,
  ChainId,
  WMND
} from '@monadex/sdk'
import React, { useMemo, useCallback } from 'react'
import { Virtuoso } from 'react-virtuoso'
import { useSelectedTokenList } from '@/state/list/hooks'
import { isTokensOnList } from '@/utils'
import CurrencyRow from './CurrencyRow'

interface CurrencyListProps {
  currencies: Token[]
  selectedCurrency?: NativeCurrency | Token | null
  onCurrencySelect: (currency: Token) => void
  otherCurrency?: NativeCurrency | Token | null
  showETH: boolean
  chainId: ChainId
  balances: (CurrencyAmount | undefined)[]
  usdPrices?: Array<{ address: string, price: number }>
}
  
const CurrencyList: React.FC<CurrencyListProps> = ({
  currencies,
  selectedCurrency,
  onCurrencySelect,
  otherCurrency,
  showETH,
  chainId,
  balances,
  usdPrices
}) => {
  const nativeCurrency = MONAD
  const itemData = useMemo(
    () => (showETH ? [nativeCurrency, ...currencies] : currencies),
    [currencies, nativeCurrency, showETH]
  )
  const selectedTokenList = useSelectedTokenList()
  const isOnSelectedList = useMemo(
    () => isTokensOnList(selectedTokenList, itemData, chainId),
    [selectedTokenList, itemData, chainId]
  )

  const Row = useCallback(
    ({ data, index, style }: { data: any[], index: number, style?: any }) => {
      const currency = data[index]
      const isSelected = Boolean(
        selectedCurrency  && currencyEquals(selectedCurrency, currency)
      )
      const otherSelected = Boolean(
        otherCurrency  && currencyEquals(otherCurrency, currency)
      )
      const handleSelect = (): void => onCurrencySelect(currency)
      const token =
          currencyEquals(currency, MONAD) || currency.name === 'MONAD'
            ? WMND[chainId]
            : currency
      const usdPrice = usdPrices
        ? usdPrices.find(
          (item) =>
            item.address.toLowerCase() === token?.address.toLowerCase()
        )
        : undefined
      return (
        <CurrencyRow
          style={style}
          currency={currency}
          isSelected={isSelected}
          onSelect={handleSelect}
          otherSelected={otherSelected}
          isOnSelectedList={isOnSelectedList[index]}
          balance={balances[index]}
          usdPrice={usdPrice ? usdPrice.price : 0}
        />
      )
    },
    [
      onCurrencySelect,
      otherCurrency,
      selectedCurrency,
      isOnSelectedList,
      balances,
      usdPrices,
      chainId
    ]
  )

  return (
    <Virtuoso
      totalCount={itemData.length}
      itemContent={(index: number) => Row({ data: itemData, index })}
    />
  )
}

export default CurrencyList
