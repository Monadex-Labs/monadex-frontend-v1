import { useToken } from '@/hooks/Tokens'
import { usePair } from '@/data/Reserves'
import { Pair, Token, JSBI } from '@monadex/sdk'
import { Box, Divider, Typography } from '@mui/material'
import { useSearchParams } from 'next/navigation'
import { extractTokenAddresses, formatTokenAmount, useWalletData } from '@/utils'
import CurrencyLogo from '../CurrencyLogo'
import { useTotalSupply } from '@/data/TotalSupply'
import { usePoolUSDCPosition } from '@/utils/useUsdcPrice'
import { useV2LiquidityPool } from '@/hooks'
import { useTokenBalance } from '@/state/wallet/hooks'

const PoolData = (): JSX.Element => {
  const { account } = useWalletData()
  const _search = useSearchParams().toString()
  const tokensArray = extractTokenAddresses(_search)
  const map = tokensArray.map((token: string) => {
    return useToken(token)
  })
  const pairs = usePair(map[0] as Token, map[1] as Token)[1]
  const sum = usePoolUSDCPosition(pairs as Pair)

  const position = useV2LiquidityPool(account, pairs?.liquidityToken.address)
  const userPoolBalance = useTokenBalance(account, position?.pair?.liquidityToken)
  const totalPoolTokens = useTotalSupply(pairs?.liquidityToken)

  const [token0Deposited, token1Deposited] =
  !(pairs == null) &&
  !(totalPoolTokens == null) &&
  !(userPoolBalance == null) &&
  // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
  JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
    ? [
        pairs.getLiquidityValue(
          pairs.token0,
          totalPoolTokens,
          userPoolBalance,
          false
        ),
        pairs.getLiquidityValue(
          pairs.token1,
          totalPoolTokens,
          userPoolBalance,
          false
        )
      ]
    : [undefined, undefined]

  const personalUSDCBalance = usePoolUSDCPosition(pairs as Pair, true, token0Deposited, token1Deposited)
  console.log('here', personalUSDCBalance)
  return (
    <Box
      className='flex flex-col max-w-[500px]  p-4 mx-auto rounded-2xl border border-primary border-opacity-25 bg-bgColor mt-3'
    >
      <Box>
        <div className='flex gap-3 p-2 flex-col'>
          <article className='flex justify-between w-full '>
            <p className='font-regular'>Pool Liquidity</p>
            {(pairs != null) ? <Typography className='font-clash'>{`$${sum.toLocaleString('us')}`}</Typography> : '-'}
          </article>
          <Divider className='bg-primary/30' />
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
          <Divider className='bg-primary/30' />
        </div>
        <Box className='p-2'>
          <div className='flex items-center justify-between'>
            <p className='font-regular text-start text-white/80'>LP token Balance</p>
            <Typography className='font-regular text-start text-white'>{formatTokenAmount(userPoolBalance)}</Typography>
          </div>
          <div className='flex items-center justify-between'>
            <p className='font-regular text-start text-white/80'>My position</p>
            {(pairs != null) ? <Typography className='font-clash text-primary'>{`$${personalUSDCBalance.toLocaleString('us')}`}</Typography> : '-'}
          </div>
        </Box>
      </Box>

    </Box>
  )
}
export default PoolData
