// import { SmartRouter, RouterTypes } from '@/constants/index'
import { SwapDelay, Field } from '@/state/swap/actions'
import {
  tryParseAmount,
  useSwapActionHandlers,
  useSwapState
} from '@/state/swap/hooks'
import {
  useUserSlippageTolerance
} from '@/state/user/hooks'
import { useCurrency } from './Tokens'
import { useTradeExactIn, useTradeExactOut } from '@/hooks/Trades'
import { useSwapCallArguments, SwapCall } from './useSwapCallback'
// import useParsedQueryString from './useParseQueryString'
import { useConnectWallet } from '@web3-onboard/react'
import { ChainId, TokenAmount, Trade } from '@monadex/sdk'
import { useMemo } from 'react'
const useFindBestRoute = (): {
  v2Trade: Trade | null
  swapCalls: SwapCall[]
  bestTradeExactIn: Trade | null
  bestTradeExactOut: Trade | null
} => {
  const user = useConnectWallet()[0]
  const ID = user.wallet?.chains[0].id

  const { onSwapDelay } = useSwapActionHandlers()
  // const parsedQuery = useParsedQueryString()

  const {
    recipient,
    swapDelay,
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId }
  } = useSwapState()

  const [allowedSlippage] = useUserSlippageTolerance()
  // grab the user address and current ChainID
  const chainId: ChainId | undefined = Number(ID) as ChainId
  // const account = user.wallet?.accounts[0].address
  // grab the input / output currency
  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)
  const isExactIn: boolean = independentField === Field.INPUT
  const parsedAmount = chainId !== undefined
    ? tryParseAmount(
      typedValue,
      (isExactIn ? inputCurrency : outputCurrency) ?? undefined
    ) as TokenAmount
    : undefined

  const bestTradeExactIn = useTradeExactIn(
    isExactIn ? parsedAmount : undefined,
    outputCurrency ?? undefined,
    swapDelay,
    onSwapDelay
  )
  const bestTradeExactOut = useTradeExactOut(
    inputCurrency ?? undefined,
    !isExactIn ? parsedAmount : undefined,
    swapDelay,
    onSwapDelay
  )
  const v2Trade = useMemo(() => {
    if (isExactIn) {
      return bestTradeExactIn
    } else {
      return bestTradeExactOut
    }
  }, [bestTradeExactIn, bestTradeExactOut, isExactIn, swapDelay, inputCurrency, outputCurrency])

  const swapCalls = useSwapCallArguments(
    v2Trade ?? undefined,
    allowedSlippage,
    recipient
  )

  if (swapDelay !== SwapDelay.SWAP_COMPLETE) {
    return { v2Trade, swapCalls, bestTradeExactIn, bestTradeExactOut }
  }
  onSwapDelay(SwapDelay.SWAP_REFRESH)

  return { v2Trade, swapCalls, bestTradeExactIn, bestTradeExactOut }
}

export default useFindBestRoute
