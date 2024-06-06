import { parseUnits } from '@ethersproject/units'
import { MONAD, WMND, ChainId as MonadChainId, JSBI, Token, TokenAmount, Trade, CurrencyAmount, NativeCurrency, ChainId } from '@monadex/sdk'
import { Field, replaceSwapState, selectCurrency, setRecipient, switchCurrencies, typeInput, purchasedTicketsOnSwap, RaffleState, SwapDelay } from './actions'
import { useCallback, useEffect, useState } from 'react'
import { ParsedQs } from 'qs'
import { useDispatch, useSelector } from 'react-redux'
import { isAddress } from 'viem'
import { useCurrencyBalances } from '../wallet/hooks'
import { computeSlippageAdjustedAmounts } from '@/utils/price'
import { AppDispatch, AppState } from '../store'
import { cp } from 'fs'
export function useSwapState (): AppState['swap'] {
  return useSelector<AppState, AppState['swap']>((state) => state.swap)
}

export function useSwapActionHandlers (): {
  // the moment when user will select the selection
  onCurrencySelection: (field: Field, currency: Token) => void
  // the moment when user will switch the selection
  onSwitchTokens: () => void
  // the input value
  onUserInput: (field: Field, typedValue: string) => void
  // the moment when user will set the recipient
  onRecipientChange: (recipient: string | null) => void
  //  the moment when user will purchase the tickets
  onPurchasedTickets: (raffle: RaffleState) => void
  // the swap delay state
  onSwapDelay: (swapDelay: SwapDelay) => void

} {
  const dispatch = useDispatch<AppDispatch>()
  const chainId = ChainId.LOCAL // TODO: change the chainId to Monad testnet
  const NATIVE = MONAD // TODO: change the native if we do tests on eth sepolia
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
}
