import { useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import useDebounce from '@/hooks/useDebounce'
import useIsWindowVisible from '@/hooks/useIsWindowVisible'
import { updateBlockNumber } from './actions'
import { useMaticPrice } from './hooks'
import { getMaticPrice } from 'utils/v3-graph'
import { useWalletData } from '@/utils'

export default function Updater (): null {
  const {
    findProvider: library,
    chainId
  } = useWalletData()

  const dispatch = useDispatch()
  const { updateMaticPrice } = useMaticPrice()

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

  useEffect(() => {
    if (chainId === undefined || state.chainId !== chainId) return
    const fetchMaticPrice = async (): Promise<void> => {
      try {
        const [
          maticPrice,
          maticOneDayPrice,
          maticPriceChange
        ] = await getMaticPrice(chainId)
        updateMaticPrice({
          price: maticPrice,
          oneDayPrice: maticOneDayPrice,
          maticPriceChange
        })
      } catch (e) {
        console.log(e)
      }
    }
    void fetchMaticPrice()
  }, [currentTime, chainId, state.chainId])

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
  }, [chainId, windowVisible])

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
