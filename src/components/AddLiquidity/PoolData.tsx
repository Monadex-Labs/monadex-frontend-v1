import { useToken } from '@/hooks/Tokens'
import { usePair } from '@/data/Reserves'
import { Token } from '@monadex/sdk'
import { Box, Divider, Typography } from '@mui/material'
import { useSearchParams } from 'next/navigation'
import { extractTokenAddresses, formatTokenAmount, useWalletData } from '@/utils'
import CurrencyLogo from '../CurrencyLogo'
import useUSDCPrice from '@/utils/useUsdcPrice'
import { useV2LiquidityPool } from '@/hooks'
import { useTokenBalance } from '@/state/wallet/hooks'
const PoolData = (): JSX.Element => {
  const { account } = useWalletData()
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

  const position = useV2LiquidityPool(account, pairs?.liquidityToken.address)
  const lpBalance = useTokenBalance(account, position?.pair?.liquidityToken)
  return (
    <Box
      className='flex flex-col max-w-[500px]  p-4 mx-auto rounded-2xl border border-primary border-opacity-25 bg-bgColor mt-5'
    >

      <Box>
        <div className='flex items-center gap-3 p-2 flex-col'>
          <article className='flex justify-between w-full '>
            <p className='font-regular'>Pool Liquidity</p>
            {(pairs != null) ? <Typography className='font-clash mb-4'>{`$${sum.toLocaleString('us')}`}</Typography> : '-'}
          </article>
          <Divider />
          <article className='flex justify-between w-full'>
            <div className='flex items-center gap-2'>
              <CurrencyLogo currency={pairs?.token0} />
              <p className='font-regular'>{`Pooled ${pairs?.token0?.symbol ?? '-'}`}</p>
            </div>
            <Typography className='font-regular text-white/80'>{formatTokenAmount(pairs?.reserve0)}</Typography>
          </article>

          <article className='flex justify-between w-full'>
            <div className='flex items-center gap-2'>
              <CurrencyLogo currency={pairs?.token1} />
              <p className='font-regular'>{`Pooled ${pairs?.token1?.symbol ?? '-'}`}</p>
            </div>
            <Typography className='font-regular text-white/80'>{formatTokenAmount(pairs?.reserve1)}</Typography>
          </article>
          <Divider />
        </div>
        <Box className='p-2'>
          <Typography className='font-regular text-start text-white/80 '>My position</Typography>
          <div className='flex items-center justify-between'>
            <p className='font-regular text-start text-white/80 mt-3'>LP token Balance</p>
            <Typography className='font-regular text-start text-white mt-3'>{formatTokenAmount(lpBalance)}</Typography>
          </div>
        </Box>
      </Box>

    </Box>
  )
}
export default PoolData
