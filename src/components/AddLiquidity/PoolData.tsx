import { useToken } from '@/hooks/Tokens'
import { usePair } from '@/data/Reserves'
import { Token } from '@monadex/sdk'
import { Box, Divider, Typography } from '@mui/material'
import { useSearchParams } from 'next/navigation'
import { extractTokenAddresses } from '@/utils'
import { formatTokenAmount } from '@/utils'
import CurrencyLogo from '../CurrencyLogo'
import useUSDCPrice from '@/utils/useUsdcPrice'

const PoolData = (): JSX.Element => {
  // get Token address from url
  const _search = useSearchParams().toString()
  const tokensArray = extractTokenAddresses(_search)
  const map = tokensArray.map((token: string) => {
    return useToken(token)
  })
  const pairs = usePair(map[0] as Token, map[1] as Token)[1]
  const usdPrice0 = Number(useUSDCPrice(pairs?.token0)?.toSignificant() ?? 0)
  const usdPrice1 = Number(useUSDCPrice(pairs?.token1)?.toSignificant() ?? 0)
  const number0 = Number(formatTokenAmount(pairs?.reserve0).replace(/,/g, ''))
  const number1 = Number(formatTokenAmount(pairs?.reserve1).replace(/,/g, ''))

  const sum = (usdPrice0 * number0 + usdPrice1 * number1)

  return (
    <Box
      className='border border-primary border-opacity-20 max-w-[38.13vh] mx-auto rounded-lg mt-5 min-h-[10vh] bg-bgColor p-4'
    >
      {pairs ? (
            <Box>
             <div className='flex items-center gap-3 p-2 flex-col'>
                <article className='flex justify-between w-full '>
                <p className='font-regular'>Pool Liquidity</p>
                 <Typography className='font-clash mb-4'>{`$${sum.toLocaleString('us')}`}</Typography>
                </article>
                <Divider />
                <article className='flex justify-between w-full'>
                <div className='flex items-center gap-2'>
                <CurrencyLogo currency={pairs.token0}/>
                <p className='font-regular'>{`Pooled ${pairs.token0?.symbol}`}</p>
                </div>
                 <Typography className='font-regular text-white/80'>{formatTokenAmount(pairs?.reserve0)}</Typography>
                </article>
                
                <article className='flex justify-between w-full'>
                <div className='flex items-center gap-2'>
                <CurrencyLogo currency={pairs.token1}/>
                <p className='font-regular'>{`Pooled ${pairs.token1?.symbol}`}</p>
                </div>
                 <Typography className='font-regular text-white/80'>{formatTokenAmount(pairs?.reserve1)}</Typography>
                </article>

             </div>
            </Box>
      ): (
        <p>loading...</p>
      )}
    </Box>
  )
}
export default PoolData
