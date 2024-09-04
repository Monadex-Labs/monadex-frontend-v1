'use client'
import { FC } from 'react'
import { Token, NativeCurrency } from '@monadex/sdk'
import { usePair } from '@/data/Reserves'
interface Pairs {
  token1: Token | NativeCurrency | undefined
  token2: Token | NativeCurrency | undefined
}

export const ChartComponent: FC<Pairs> = ({ token1, token2 }) => {
  const PairState = usePair(token1, token2)
  return (
    <div className='flex flex-col'>
      <p className='mb-5 text-gray-600'><span className='text-xl font-semibold text-primary'>{token1?.symbol}</span> /{token2?.symbol}</p>
      <div className=''>
        <iframe
          src={'https://dexscreener.com/arbitrum/0xb7dd20f3fbf4db42fd85c839ac0241d09f72955f?embed=1&amp;theme=dark&trades=0&info=0'}
          width={900}
          height={600}
          style={{ borderRadius: 8 }}
        />
      </div>
    </div>
  )
}
