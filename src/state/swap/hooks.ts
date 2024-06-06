import { parseUnits } from '@ethersproject/units'
import { MONAD, WMND, ChainId as MonadChainId, JSBI, Token, TokenAmount, Trade, CurrencyAmount, NativeCurrency} from '@monadex/sdk'
import { Field, replaceSwapState, selectCurrency, setRecipient, switchCurrencies, typeInput, purchasedTicketsOnSwap } from './actions'
import { SwapState } from './reducer'
import { useCallback, useEffect, useState } from 'react'
import { ParsedQs } from 'qs'
import { useDispatch, useSelector } from 'react-redux'
import { isAddress } from 'viem'
import { useCurrencyBalances } from '../wallet/hooks'
import { computeSlippageAdjustedAmounts } from '@/utils/price'


