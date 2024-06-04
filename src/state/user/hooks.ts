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
import { useCallback, useMemo } from 'react'
