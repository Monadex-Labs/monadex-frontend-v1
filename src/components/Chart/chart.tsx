'use client'
import { FC } from 'react'
import { Token } from '@monadex/sdk'
import { usePair } from '@/data/Reserves'
interface Pairs {
  token1: Token | undefined
  token2: Token | undefined
}

export const ChartComponent: FC<Pairs> = ({ token1, token2 }) => {
  const PairState = usePair(token1, token2)
  return (
    <div className='flex flex-col'>
      <div className='border border-primary bg-bgColor rounded-lg p-4'>
        <p className='mb-5 text-gray-600'><span className='text-2xl font-semibold text-primary'>{token1?.symbol}</span> /{token2?.symbol}</p>
        <iframe
          src={`https://dexscreener.com/arbitrum/0x4a86c01d67965f8cb3d0aaa2c655705e64097c31?embed=1&amp;theme=dark&trades=0&info=0`}
          width={900}
          height={600}
          style={{ borderRadius: 8 }}
        />
      </div>
    </div>
  )
}
