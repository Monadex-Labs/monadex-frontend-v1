import { TokenAmount, Pair, Currency } from '@monadex/sdk'
import { useMemo } from 'react'
import MonadexV2Pair from "@/constants/abi/JSON/MonadexV2Pair.json"
import { Interface } from '@ethersproject/abi'
import { useMultipleContractSingleData } from '@/state/multicall/hooks'
import { wrappedCurrency } from '@/utils/wrappedCurrency'
import { useConnectWallet } from '@web3-onboard/react'

const PAIR_INTERFACE = new Interface(MonadexV2Pair.abi)
