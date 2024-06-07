import { SmartRouter, RouterTypes } from '@/constants/index'
import { SwapDelay, Field } from '@/state/swap/actions';
import {
  tryParseAmount,
  useSwapActionHandlers,
  useSwapState,
} from '@/state/swap/hooks'
import {
  useUserSlippageTolerance
} from '@/state/user/hooks'
import callWallchainAPI from 'utils/wallchainService'
import { useCurrency } from './Tokens'
import { useTradeExactIn, useTradeExactOut } from '@/'
import { useActiveWeb3React } from 'hooks'
import { useSwapCallArguments } from './useSwapCallback'
import useParsedQueryString from './useParsedQueryString'
