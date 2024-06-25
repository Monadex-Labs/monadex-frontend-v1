'use client'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import useDebounce from '@/hooks/useDebounce'
import useIsWindowVisible from '@/hooks/useWindowVisible'
import { updateBlockNumber } from './actions'
import { useWalletData } from '@/utils'
import { ChainId } from '@monadex/sdk'

export default function Updater (): null {
  const {
    findProvider: library,
    chainId
  } = useWalletData()
  const currentChain = chainId ? chainId : ChainId.SEPOLIA
  const dispatch = useDispatch()

  const windowVisible = useIsWindowVisible()

  const [state, setState] = useState<{
    chainId: number | undefined
    blockNumber: number | null
  }>({
    chainId,
    blockNumber: null
  })

  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000))

  const blockNumberCallback = useCallback(
    (blockNumber: number) => {
      setState((state) => {
        if (chainId === state.chainId) {
          if (typeof state.blockNumber !== 'number') { return { chainId, blockNumber } }
          return {
            chainId,
            blockNumber
          }
        }
        return state
      })
    },
    [chainId, setState]
  )

  // this is for refreshing eth price every 10 mins
  useEffect(() => {
    const interval = setInterval(() => {
      const _currentTime = Math.floor(Date.now() / 1000)
      setCurrentTime(_currentTime)
    }, 600000)
    return () => clearInterval(interval)
  }, [])

  // attach/detach listeners
  useEffect(() => {
    setState({ chainId, blockNumber: null })
    if (library === undefined || !windowVisible) return undefined

    library
      .getBlockNumber()
      .then(blockNumberCallback)
      .catch((error) =>
        console.error(
          `Failed to get block number for chainId: ${chainId}`,
          error
        )
      )

    library.on('block', blockNumberCallback)

    if (library !== undefined) {
      library.on('network', (newNetwork) => {
        if (state.chainId != null && newNetwork.chainId !== state.chainId) {
          setTimeout(() => {
            document.location.reload()
          }, 1500)
        }
      })
    }

    return () => {
      library.removeListener('block', blockNumberCallback)
      if (library != null) {
        library.removeListener('network', (newNetwork) => {
          if (state.chainId != null && newNetwork.chainId !== state.chainId) {
            setTimeout(() => {
              document.location.reload()
            }, 1500)
          }
        })
      }
    }
  }, [currentChain, chainId, windowVisible])

  const debouncedState = useDebounce(state, 100)

  useEffect(() => {
    if (
      debouncedState.chainId == null ||
      debouncedState.blockNumber == null ||
      !windowVisible
    ) { return }
    dispatch(
      updateBlockNumber({
        chainId: debouncedState.chainId,
        blockNumber: debouncedState.blockNumber
      })
    )
  }, [
    windowVisible,
    dispatch,
    debouncedState.blockNumber,
    debouncedState.chainId
  ])

  return null
}
