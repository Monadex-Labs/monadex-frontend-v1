'use client'
import useParsedQueryString from '@/hooks/useParseQueryString'
import React, { useEffect, useState } from 'react'
import { useUserSlippageTolerance } from '@/state/user/hooks'
import { SLIPPAGE_AUTO } from '@/state/user/reducer'

export const SlippageWrapper: React.FC = () => {
  const parsedQs = useParsedQueryString()
  const swapSlippage = parsedQs.slippage !== undefined && parsedQs.slippage !== ''
    ? (parsedQs.slippage as string)
    : undefined
  const [
    allowedSlippage,
    setUserSlippageTolerance
  ] = useUserSlippageTolerance()

  const [slippage, setSlippage] = useState(0)

  useEffect(() => {
    if (swapSlippage !== undefined) {
      setUserSlippageTolerance(Number(swapSlippage))
    }
  }, [swapSlippage])

  useEffect(() => {
    setSlippage(allowedSlippage)
  }, [allowedSlippage])

  return (
    <small className='text-xs font-medium px-3 py-2 rounded-full bg-bgColor text-highlight bg-opacity-50 font-semibold'>
      {`${slippage === SLIPPAGE_AUTO ? 'Auto' : slippage / 100} %`}{' '}
      slippage
    </small>
  )
}
// 0xa15C94e0b133111878EA3256aBd5dF22E50B7240
