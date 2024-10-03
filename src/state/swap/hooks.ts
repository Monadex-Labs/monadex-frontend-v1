import { parseUnits } from '@ethersproject/units'
import { ETH, ChainId, JSBI, Token, TokenAmount, Trade, CurrencyAmount, NativeCurrency, Percent } from '@monadex/sdk'
import { Field, replaceSwapState, selectCurrency, setRecipient, switchCurrencies, typeInput, purchasedTicketsOnSwap, RaffleState, SwapDelay, setSwapDelay } from './actions'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GlobalData, SLIPPAGE_AUTO } from '../../constants/index'
import { useDispatch, useSelector } from 'react-redux'
import { ParsedQs } from 'qs'
import { SwapState } from './reducer'
import { isAddress } from 'viem'
import { useCurrencyBalances } from '../wallet/hooks'
import { computeSlippageAdjustedAmounts } from '@/utils/price'
import { AppDispatch, AppState } from '../store'
import { _useCurrency, useCurrency } from '@/hooks/Tokens'
import useFindBestRoute from '@/hooks/useFindBestRouter'
import { useUserSlippageTolerance, useSlippageManuallySet } from '../user/hooks'
import { formatAdvancedPercent } from '@/utils/numbers'
import useParsedQueryString from '@/hooks/useParseQueryString'
import { useWalletData } from '@/utils'
export function useSwapState (): AppState['swap'] {
  return useSelector<AppState, AppState['swap']>((state) => state.swap)
}

export function useSwapActionHandlers (): {
  // the moment when user will select the selection *
  onCurrencySelection: (field: Field, currency: Token | NativeCurrency) => void
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
  const NATIVE = ETH // TODO: change the native if we do tests on eth sepolia
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
                ? 'ETH'
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
      if (!typedValue) {
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
  if (!value || (currency == null)) {
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

const BAD_RECIPIENT_ADDRESSES: string[] = [// TODO: UPDATE THIS WITH MONAD ADDRESSER
  '0x16104a43529389C139D92f3AC9EbB79Cff22694E', // v2 factory
  '0x8aA814fB63504711BC3619684c1d4dc449a9ea44', // v2 raffle 01
  '0xD80b04Ed45b12F4871d9be252dB4db7F6785AbE8', // v2 router 02
  '0xbcf86B64696B6e429D248526EfDaaC9aDcABe561', // v2 timelock
  '0xc995D06c9BFD62Bf7E9E50328Cd9B5584370041A' // v2 gouvernor
]

export function involvesAddress (trade: Trade, checksummedAddress: string): boolean {
  return (
    trade.route.path.some((token) => token.address === checksummedAddress) ||
    trade.route.pairs.some((pair) => pair.liquidityToken.address === checksummedAddress)
  )
}
// from the current swap inputs, compute the best trade and return it.

export function useDerivedSwapInfo (): {
  currencies: { [field in Field]?: Token | NativeCurrency }
  currencyBalances: { [field in Field]?: TokenAmount | CurrencyAmount }
  parsedAmount: TokenAmount | undefined
  v2Trade: Trade | undefined
  inputError?: string
  useAutoSlippage: number
} {
// grab the informations of the
  const { account: address, chainId, networkName } = useWalletData()
  console.log('networkName', networkName)
  const parsedQuery = useParsedQueryString()
  const CHAIN_ID: ChainId | undefined = chainId
  const chainIdToUse = CHAIN_ID ?? ChainId.SEPOLIA // TODO: change the chainId to Monad testnet
  const swapSlippage = parsedQuery?.slippage // eslint-disable-line
    ? (parsedQuery?.slippage as string)
    : undefined

  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
    recipient
  } = useSwapState()

  const inputCurrency = _useCurrency(inputCurrencyId)
  const outputCurrency = _useCurrency(outputCurrencyId)
  const receiver: string | null = (recipient === null ? address : recipient) ?? null

  const relevantTokenBalances = useCurrencyBalances(address ?? undefined, [
    inputCurrency ?? undefined,
    outputCurrency ?? undefined
  ])
  const isExactIn: boolean = independentField === Field.INPUT
  const parsedAmount = tryParseAmount(
    typedValue,
    (isExactIn ? inputCurrency : outputCurrency) ?? undefined
  ) as TokenAmount

  const { v2Trade, bestTradeExactIn, bestTradeExactOut } = useFindBestRoute()

  const currencyBalances = { // eslint-disable-line
    [Field.INPUT]: relevantTokenBalances?.[0],
    [Field.OUTPUT]: relevantTokenBalances?.[1]
  }

  const currencies: { [field in Field]?: Token | NativeCurrency } = {
    [Field.INPUT]: inputCurrency ?? undefined,
    [Field.OUTPUT]: outputCurrency ?? undefined
  }

  let inputError: string | undefined
  if (address === undefined) {
    inputError = 'Connect Wallet'
  }

  if (!parsedAmount) { // eslint-disable-line
    inputError = inputError ?? 'Enter an amount' // eslint-disable-line
  }
  if (currencies[Field.INPUT] === undefined || currencies[Field.OUTPUT] === undefined) {
    inputError = inputError ?? 'Select a token' // eslint-disable-line
  }
  const formattedTo = isAddress(receiver) ? receiver : null

  if (receiver === null || formattedTo === null) {
    inputError = inputError ?? 'Enter a recipient' // eslint-disable-line
  } else {
    if (BAD_RECIPIENT_ADDRESSES.includes(formattedTo) ||
      (bestTradeExactIn && involvesAddress(bestTradeExactIn, formattedTo)) || // eslint-disable-line
      (bestTradeExactOut && involvesAddress(bestTradeExactOut, formattedTo)) // eslint-disable-line
    ){ inputError = inputError ?? 'Invalid recipient' // eslint-disable-line
    }
  }
  const [
    allowedSlippage,
    setUserSlippageTolerance
  ] = useUserSlippageTolerance()

  const [slippageManuallySet] = useSlippageManuallySet()
  const FIXED_AUTO_SLIPPAGE = new Percent(JSBI.BigInt(5), JSBI.BigInt(10000)) // 0.5%
  const autoSlippage = useMemo(() => {
    return allowedSlippage === SLIPPAGE_AUTO
      ? Math.ceil(
          Number(
            parseFloat(formatAdvancedPercent(FIXED_AUTO_SLIPPAGE)).toFixed(2)
          ) * 100
        )
      : allowedSlippage
  }, [allowedSlippage])
  const slippageAdjustedAmount = v2Trade && autoSlippage && computeSlippageAdjustedAmounts(v2Trade, autoSlippage) // eslint-disable-line
  // compare input balance to max input based on version
  const [balanceIn, amountIn] = [
    currencyBalances[Field.INPUT],
    slippageAdjustedAmount ? slippageAdjustedAmount[Field.INPUT] as TokenAmount : null // eslint-disable-line
  ]
  if (
    balanceIn && // eslint-disable-line
    amountIn && // eslint-disable-line
    balanceIn.lessThan(amountIn)
  ) {
    inputError = 'Insufficient ' + amountIn.token.symbol + ' balance' // eslint-disable-line
  }
  // ADJUST AUTO SLIPPAGE TOLERANCE FOR STABLE COINS TO 0.1%
  useEffect(() => {
    const stableCoins = GlobalData.stableCoins[chainIdToUse]
    const stableCoinAddresses =
      stableCoins && stableCoins.length > 0 // eslint-disable-line
        ? stableCoins.map((token) => token.address.toLowerCase())
        : []
    if (!swapSlippage && !slippageManuallySet) { // eslint-disable-line
      if (
        inputCurrencyId &&  // eslint-disable-line
        outputCurrencyId && // eslint-disable-line
        stableCoinAddresses.includes(inputCurrencyId.toLowerCase()) &&
        stableCoinAddresses.includes(outputCurrencyId.toLowerCase())
      ) {
        setUserSlippageTolerance(10)
      } else {
        setUserSlippageTolerance(SLIPPAGE_AUTO)
      }
    }
  }, [
    inputCurrencyId,
    outputCurrencyId,
    setUserSlippageTolerance,
    chainIdToUse,
    slippageManuallySet
  ])

  return {
    currencies,
    currencyBalances,
    inputError,
    parsedAmount,
    v2Trade: v2Trade as Trade,
    useAutoSlippage: autoSlippage
  }
}
function parseCurrencyFromURLParameter (urlParam: any): string {
  if (typeof urlParam === 'string') {
    const valid = isAddress(urlParam) ? urlParam : null
    if (valid !== null) return valid
    if (urlParam.toUpperCase() === 'ETH') return 'ETH'
    if (valid === null) return 'ETH'// TODO: review this
  }
  return ''
}

function parseTokenAmountURLParameter (urlParam: any): string {
  return typeof urlParam === 'string' && !isNaN(parseFloat(urlParam))
    ? urlParam
    : ''
}

function parseIndependentFieldURLParameter (urlParam: any): Field {
  return typeof urlParam === 'string' && urlParam.toLowerCase() === 'output'
    ? Field.OUTPUT
    : Field.INPUT
}
function parseBooleanURLParameter (param: any): string {
  return param ? 'true' : 'false' // eslint-disable-line
}
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/

function validatedRecipient (recipient: any): string | null {
  if (typeof recipient !== 'string') return null
  const address = isAddress(recipient) ? recipient : null
  if (address) return address // eslint-disable-line
  if (ADDRESS_REGEX.test(recipient)) return recipient
  return null
}
export function queryParametersToSwapState (parsedQs: ParsedQs): SwapState {
  let inputCurrency = parseCurrencyFromURLParameter(
    parsedQs.currency0 ?? parsedQs.inputCurrency
  )
  let outputCurrency = parseCurrencyFromURLParameter(
    parsedQs.currency1 ?? parsedQs.outputCurrency
  )
  if (inputCurrency === outputCurrency) {
    if (typeof parsedQs.outputCurrency === 'string') {
      inputCurrency = ''
    } else {
      outputCurrency = ''
    }
  }
  const recipient = validatedRecipient(parsedQs.recipient)
  // Assuming parsedQs has raffle related parameters
  const raffleState = {
    ticketsPurchased: parseBooleanURLParameter(parsedQs.ticketsPurchased),
    multiplier: parseTokenAmountURLParameter(parsedQs.multiplier),
    minimumTokensToReceive: parseTokenAmountURLParameter(parsedQs.minimumTokensToReceive)
  }
  return {
    [Field.INPUT]: {
      currencyId: inputCurrency
    },
    [Field.OUTPUT]: {
      currencyId: outputCurrency
    },
    typedValue: parseTokenAmountURLParameter(parsedQs.exactAmount),
    independentField: parseIndependentFieldURLParameter(parsedQs.exactField),
    recipient,
    swapDelay: SwapDelay.INIT,
    raffle: {
      ...raffleState
    }
  }
}
// updates the swap state to use the defaults for a given network
export function useDefaultsFromURLSearch ():
| {
  inputCurrencyId: string | undefined
  outputCurrencyId: string | undefined
}
| undefined {
  const { chainId: Id } = useWalletData()
  const chainId = Id
  const parsedQs = useParsedQueryString()
  const dispatch = useDispatch<AppDispatch>()
  const [result, setResult] = useState<{ inputCurrencyId: string | undefined, outputCurrencyId: string | undefined } | undefined>()
  
  const parseAndDispatch = useCallback(() => {
    if (!chainId) return

    const parsed = queryParametersToSwapState(parsedQs)
    dispatch(
      replaceSwapState({
        typedValue: parsed.typedValue,
        field: parsed.independentField,
        inputCurrencyId: parsed[Field.INPUT].currencyId,
        outputCurrencyId: parsed[Field.OUTPUT].currencyId,
        recipient: parsed.recipient,
        swapDelay: SwapDelay.INIT,
        raffle: {
          ticketsPurchased: parsed.raffle.ticketsPurchased,
          multiplier: parsed.raffle.multiplier,
          minimumTicketsToReceive: parsed.raffle.minimumTicketsToReceive
        }
      })
    )
    setResult({
      inputCurrencyId: parsed[Field.INPUT].currencyId,
      outputCurrencyId: parsed[Field.OUTPUT].currencyId
    })
  }, [chainId, parsedQs, dispatch])

  useEffect(() => {
    parseAndDispatch()
  }, [parseAndDispatch])
  
  return result
}
