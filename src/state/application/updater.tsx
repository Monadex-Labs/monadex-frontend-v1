'use client'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import useDebounce from '@/hooks/useDebounce'
import useIsWindowVisible from '@/hooks/useWindowVisible'
import { updateBlockNumber } from './actions'
import { useWalletData } from '@/utils'
import { ChainId } from '@monadex/sdk'

export default function Updater (): null {
  const { findProvider: library, chainId } = useWalletData()
  const currentChain = chainId || ChainId.SEPOLIA
  const dispatch = useDispatch()

  const windowVisible = useIsWindowVisible()

  const [state, setState] = useState<{
    chainId: number | undefined
    blockNumber: number | null
    loading: boolean
  }>({
    chainId: currentChain,
    blockNumber: null,
    loading: true
  })

  const blockNumberCallback = useCallback(
    (blockNumber: number) => {
      setState((state) => {
        if (chainId === state.chainId) {
          return { chainId, blockNumber, loading: false }
        }
        return state
      })
    },
    [chainId, setState]
  )

  // Initial fetch of block number
  useEffect(() => {
    if (!library || !windowVisible) return

    let state = false
    library
      .getBlockNumber()
      .then((blockNumber) => {
        if (!state) {
          p(blockNumber)
        }
      })
      .catch((error) => {
        console.error(`Failed to get initial block number for chainId: ${chainId}`, error)
      })

    return () => {
      state = true
    }
  }, [library, windowVisible, chainId, blockNumberCallback])

  // Listener for block updates
  useEffect(() => {
    if (!library || !windowVisible) return

    library.on('block', blockNumberCallback)

    return () => {
      library.removeListener('block', blockNumberCallback)
    }
  }, [library, windowVisible, blockNumberCallback])

  // Network change listener
  useEffect(() => {
    if (!library) return

    const handleNetworkChange = (newNetwork: { chainId: number }) => {
      if (state.chainId && newNetwork.chainId !== state.chainId) {
        setTimeout(() => {
          document.location.reload()
        }, 1500)
      }
    }

    library.on('network', handleNetworkChange)

    return () => {
      library.removeListener('network', handleNetworkChange)
    }
  }, [library, state.chainId])

  const debouncedState = useDebounce(state, 100)

  useEffect(() => {
    if (!chainId || debouncedState.loading || !windowVisible) return
    dispatch(
      updateBlockNumber({
        chainId,
        blockNumber: debouncedState.blockNumber as number
      })
    )
  }, [
    windowVisible,
    dispatch,
    debouncedState.blockNumber,
    debouncedState.loading,
    chainId
  ])

  return null
}
