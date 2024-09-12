import { SwapDelay, Field } from '@/state/swap/actions'
import {
  tryParseAmount,
  useSwapActionHandlers,
  useSwapState
} from '@/state/swap/hooks'
import {
  useUserSlippageTolerance
} from '@/state/user/hooks'
import { useWalletData } from '@/utils'
import { useCurrency } from './Tokens'
import { useTradeExactIn, useTradeExactOut } from '@/hooks/Trades'
import { useSwapCallArguments, SwapCall } from './useSwapCallback'
import { TokenAmount, Trade } from '@monadex/sdk'


const useFindBestRoute = (): {
  v2Trade: Trade | null
  swapCalls: SwapCall[]
  bestTradeExactIn: Trade | null
  bestTradeExactOut: Trade | null
} => {
  const { chainId } = useWalletData()
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
  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)
  const isExactIn: boolean = independentField === Field.INPUT
  const parsedAmount = chainId
    ? tryParseAmount(
      typedValue,
      (isExactIn ? inputCurrency : outputCurrency) ?? undefined
    ) as TokenAmount
    : undefined

  const bestTradeExactIn = useTradeExactIn( // returning null on bestTradeExactIn
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

  const v2Trade = isExactIn ? bestTradeExactIn : bestTradeExactOut
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
