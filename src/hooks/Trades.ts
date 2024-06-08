import { Currency, CurrencyAmount, Pair, Token, Trade } from '@monadex/sdk'
import {
  V2_BASES_TO_CHECK_TRADES_AGAINST,
  V2_CUSTOM_BASES,
} from 'constants/v3/addresses';
import flatMap from 'lodash.flatmap'
import { useMemo } from 'react'
import { SwapDelay } from '@/state/swap/actions'
import { PairState, usePairs } from '@/data/Reserves'
import { wrappedCurrency } from '../utils/wrappedCurrency';
