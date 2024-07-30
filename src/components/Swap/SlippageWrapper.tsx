'use client'
import useParsedQueryString from '@/hooks/useParseQueryString'
import React, { useEffect } from 'react'
import { useUserSlippageTolerance } from '@/state/user/hooks'
import { SLIPPAGE_AUTO } from '@/state/user/reducer'

// text slippage
export const SlippageWrapper: React.FC = () => {
  const parsedQs = useParsedQueryString()
  const swapSlippage = parsedQs.slippage // eslint-disable-line
    ? (parsedQs.slippage as string)
    : undefined
  const [
    allowedSlippage,
    setUserSlippageTolerance
  ] = useUserSlippageTolerance()

  useEffect(() => {
    if (swapSlippage) {
      setUserSlippageTolerance(Number(swapSlippage))
    }
  }, [swapSlippage])

  return (
    <small className='text-xs font-medium'>
      {`${allowedSlippage === SLIPPAGE_AUTO ? 'Auto' : allowedSlippage / 100} %`}{' '}
      slippage
    </small>
  )
}
