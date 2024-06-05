import { ChainId, Pair, Token } from '@monadex/sdk'
import {
  addSerializedPair,
  addSerializedToken,
  removeSerializedToken,
  SerializedPair,
  SerializedToken,
  updateUserDeadline,
  updateUserSlippageTolerance,
  toggleURLWarning
} from './actions'
import { useCallback, useMemo, useEffect } from 'react'
import flatMap from 'lodash.flatmap'
import { AppDispatch, AppState } from '../store'
import { useAllTokens } from '@/hooks/Tokens'
