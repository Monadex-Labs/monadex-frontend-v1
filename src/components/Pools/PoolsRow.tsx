'use client'
import { Box, Typography, CircularProgress } from '@mui/material'
import { getTokenLogoURL } from '@/utils/getTokenLogoURL'
import DoubleCurrencyLogo from '../DoubleCurrencyLogo'
import { Token, NativeCurrency } from '@monadex/sdk'
interface PoolParams {
  poolFee: string | undefined
  token0: Token
  token1: Token
  volume24h: string
  tvl: string
  fee24h: string
  apr24h: string
  onClick: () => void
}

const PoolsRow: React.FC<PoolParams> = ({ token0, token1, volume24h, tvl, fee24h, apr24h, onClick, poolFee }) => {
  const formatCurrency = (value: string): string => {
    const num = parseFloat(value)
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num)
  }
  return (
    <Box
      flex={1} padding={2} onClick={onClick}
      className='border-2 rounded-lg border-primary shadow-md bg-bgColor hover:bg-primary2/50 hover:transition-all flex hover:cursor-pointer mb-3 items-center justify-center'
    >
      <Box
        ml={1} height={32}
        className='flex'
      >
        <DoubleCurrencyLogo currency0={token0} currency1={token1} size={30} />
        <Box className='flex items-center p-2 ml-2 gap-2'>
          <p className='leading-4 '>{token0?.symbol || 'MDX'}</p>
          -
          <p className='leading-4'>{token1?.symbol || 'PEPE'}</p>
        </Box>

        <Box className='bg-primary rounded-full flex items-center justify-center ml-2' minWidth={60}>
          <p className='text-sm'>{poolFee || '...'}%</p>
        </Box>
      </Box>
      <Box className='flex items-center justify-between w-full ml-[12rem]'>
        <StatItem value={formatCurrency(volume24h)} />
        <StatItem value={formatCurrency(tvl)} />
        <StatItem value={formatCurrency(fee24h)} />
        <StatItem value={`${parseFloat(apr24h).toFixed(2)}%`} />
      </Box>
    </Box>

  )
}
const StatItem: React.FC<{ value: string }> = ({ value }) => (
  <Typography sx={{ textAlign: 'right', flex: 1 }}>
    {value}
  </Typography>
)

export default PoolsRow
