import { SmartRouter, RouterTypes } from '@/constants/index'
import { SwapDelay, Field } from '@/state/swap/actions'
import {
  tryParseAmount,
  useSwapActionHandlers,
  useSwapState
} from '@/state/swap/hooks'
import {
  useUserSlippageTolerance
} from '@/state/user/hooks'
import callWallchainAPI from 'utils/wallchainService'
import { useCurrency } from './Tokens'
import { useTradeExactIn, useTradeExactOut } from '@/hooks/Trades'
import { useSwapCallArguments } from './useSwapCallback'
import useParsedQueryString from './useParseQueryString'
import { useConnectWallet } from '@web3-onboard/react'


