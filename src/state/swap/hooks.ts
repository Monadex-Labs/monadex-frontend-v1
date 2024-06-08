import { parseUnits } from '@ethersproject/units'
import { MONAD, WMND, ChainId, JSBI, Token, TokenAmount, Trade, CurrencyAmount, NativeCurrency } from '@monadex/sdk'
import { Field, replaceSwapState, selectCurrency, setRecipient, switchCurrencies, typeInput, purchasedTicketsOnSwap, RaffleState, SwapDelay, setSwapDelay } from './actions'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ParsedQs } from 'qs'
import { useDispatch, useSelector } from 'react-redux'
import { isAddress } from 'viem'
import { useCurrencyBalances } from '../wallet/hooks'
import { computeSlippageAdjustedAmounts } from '@/utils/price'
import { AppDispatch, AppState } from '../store'
import { MinimaRouterTrade, MonadexTrade } from '@/components/swap/trade'
import { useConnectWallet } from '@web3-onboard/react'
import { useCurrency } from '@/hooks/Tokens'
export function useSwapState (): AppState['swap'] {
  return useSelector<AppState, AppState['swap']>((state) => state.swap)
}

export function useSwapActionHandlers (): {
  // the moment when user will select the selection *
  onCurrencySelection: (field: Field, currency: Token) => void
  // the moment when user will switch the selection *
  onSwitchTokens: () => void
  // the input value *
  onUserInput: (field: Field, typedValue: string) => void
  // the moment when user will set the recipient *
  onRecipientChange: (recipient: string | null) => void
  //  the moment when user will purchase the tickets
  onPurchasedTickets: (raffle: RaffleState) => void
  // the swap delay state *
  onSwapDelay: (swapDelay: SwapDelay) => void

} {
  const dispatch = useDispatch<AppDispatch>()
  const chainId = ChainId.SEPOLIA // TODO: change the chainId to Monad testnet
  const NATIVE = MONAD // TODO: change the native if we do tests on eth sepolia
  const timer = useRef<any>(null)
  const onCurrencySelection = useCallback(
    (field: Field, currency: Token | NativeCurrency) => {
      dispatch(
        selectCurrency({
          field,
          currencyId:
            currency instanceof Token
              ? currency.address
              : currency === NATIVE
                ? 'MONAD'
                : ''
        })
      )
    },
    [dispatch, NATIVE]
  )

  const onSwitchTokens = useCallback(() => {
    dispatch(switchCurrencies())
  }
  , [dispatch])

  const onSwapDelay = useCallback(
    (swapDelay: SwapDelay) => {
      dispatch(setSwapDelay({ swapDelay }))
    },
    [dispatch]
  )

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      dispatch(typeInput({ field, typedValue }))
      if (typedValue === undefined) {
        onSwapDelay(SwapDelay.INIT)
        return
      }
      onSwapDelay(SwapDelay.USER_INPUT)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => {
        onSwapDelay(SwapDelay.USER_INPUT_COMPLETE)
      }, 300)
    },
    [dispatch, onSwapDelay]
  )

  const onRecipientChange = useCallback(
    (recipient: string | null) => {
      dispatch(setRecipient({ recipient }))
    },
    [dispatch]
  )

  // the moment when user will purchase the tickets

  const onPurchasedTickets = useCallback(
    (raffle: RaffleState) => {
      dispatch(purchasedTicketsOnSwap({ raffle }))
    },
    [dispatch]
  )
  return {
    onCurrencySelection,
    onSwitchTokens,
    onUserInput,
    onRecipientChange,
    onPurchasedTickets,
    onSwapDelay
  }
}
// try to parse a user entered amount for a given token

export function tryParseAmount (value?: string, currency?: NativeCurrency | Token): CurrencyAmount | TokenAmount | undefined {
  if ((value === undefined) || (currency === undefined)) {
    return undefined
  }
  try {
    const parseAmount = parseUnits(value, currency.decimals).toString()
    if (parseAmount !== '0') {
      return currency instanceof Token
        ? new TokenAmount(currency, JSBI.BigInt(parseAmount))
        : CurrencyAmount.ether(JSBI.BigInt(parseAmount))
    }
  } catch (error) {
    console.debug(`Failed to parse input amount: "${value}"`, error)
    return undefined
  }
}

function involvesAddress(trade: Trade, checksummedAddress: string): boolean {
  return (
    trade.route.path.some((token) => token.address === checksummedAddress) ||
    trade.route.pairs.some((pair) => pair.liquidityToken.address === checksummedAddress)
  )
}
// from the current swap inputs, compute the best trade and return it.


export function useDerivedSwapInfo (): {
  currencies: { [field in Field]?: Token }
  currencyBalances: { [field in Field]?: TokenAmount }
  parsedAmount: TokenAmount | undefined
  v2Trade: MinimaRouterTrade | MonadexTrade | undefined
  inputError?: string
  showRamp: boolean
  inputError?: string
  useAutoSlippage: number
} {
// grab the informations of the
  const account = useConnectWallet()
  const WALLET_ADDRESS = account?.[0].wallet?.accounts[0].address
  const CHAIN_ID: number | undefined = Number(account?.[0].wallet?.chains[0].id)

  const chainIdToUse = CHAIN_ID ?? ChainId.SEPOLIA // TODO: change the chainId to Monad testnet
  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
    recipient
  } = useSwapState()

  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)
  const receiver: string | null = (recipient === null ? account : recipient) ?? null

  const relevantTokenBalances = useCurrencyBalances(WALLET_ADDRESS ?? undefined, [
    inputCurrency as Token ?? undefined,
    outputCurrency as Token ?? undefined
  ])
  const isExactIn: boolean = independentField === Field.INPUT
  const parsedAmount = tryParseAmount(
    typedValue,
    (isExactIn ? inputCurrency : outputCurrency) ?? undefined
  )
}
/**
 * export interface SwapState {
  readonly independentField: Field
  readonly typedValue: string
  readonly [Field.INPUT]: {
    readonly currencyId?: string | undefined
  }
  readonly [Field.OUTPUT]: {
    readonly currencyId?: string | undefined
  }
  readonly raffle: RaffleState
  readonly swapDelay: SwapDelay
  // the typed recipient address or ENS name, or null if swap should go to sender
  readonly recipient: string | null
}
 */