import { JSBI, Pair, Percent } from '@monadex/sdk'
import React, { useState } from 'react'
import { Box } from '@mui/material'
import { useTotalSupply } from '@/data/TotalSupply'
import { useWalletData, formatTokenAmount } from '@/utils'
import { useTokenBalance } from '@/state/wallet/hooks'
import { unwrappedToken } from '@/utils/wrappedCurrency'
import { DoubleCurrencyLogo } from '@/components'

interface PositionCardProps {
  pair: Pair
  showUnwrapped?: boolean
  border?: string
}

export const MinimalPositionCard: React.FC<PositionCardProps> = ({
  pair,
  border,
  showUnwrapped = false
}) => {
  const { account } = useWalletData()

  const currency0 = showUnwrapped ? pair.token0 : unwrappedToken(pair.token0)
  const currency1 = showUnwrapped ? pair.token1 : unwrappedToken(pair.token1)

  const [showMore, setShowMore] = useState(false)

  const userPoolBalance = useTokenBalance(
    account ?? undefined,
    pair.liquidityToken
  )
  const totalPoolTokens = useTotalSupply(pair.liquidityToken)

  const poolTokenPercentage =
    !(userPoolBalance == null) &&
    !(totalPoolTokens == null) &&
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? new Percent(userPoolBalance.raw, totalPoolTokens.raw)
      : undefined

  const [token0Deposited, token1Deposited] =
    !!pair &&
    !(totalPoolTokens == null) &&
    !(userPoolBalance == null) &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? [
          pair.getLiquidityValue(
            pair.token0,
            totalPoolTokens,
            userPoolBalance,
            false
          ),
          pair.getLiquidityValue(
            pair.token1,
            totalPoolTokens,
            userPoolBalance,
            false
          )
        ]
      : [undefined, undefined]

  return (
    <Box className='w-full rounded-md p-3 leading-6 text-center' border={border}>
      {(userPoolBalance != null) &&
        JSBI.greaterThan(userPoolBalance.raw, JSBI.BigInt(0))
        ? (
          <Box>
            <p className='font-semibold'>Your Position</p>
            <Box
              className='flex justify-between items-center mt-1'
              onClick={() => setShowMore(!showMore)}
            >
              <Box className='flex items-center'>
                <DoubleCurrencyLogo
                  currency0={currency0}
                  currency1={currency1}
                  size={20}
                />
                <p style={{ marginLeft: 6 }}>
                  {currency0.symbol}/{currency1.symbol}
                </p>
              </Box>
              <p>{formatTokenAmount(userPoolBalance)}</p>
            </Box>
            <Box className='flex justify-between items-center mt-1'>
              <p>Your Pool Share:</p>
              <p>
                {(poolTokenPercentage != null) ? poolTokenPercentage.toFixed(6) + '%' : '-'}
              </p>
            </Box>
            <Box className='flex justify-between items-center mt-1'>
              <p>{currency0.symbol}:</p>
              <p>{formatTokenAmount(token0Deposited)}</p>
            </Box>
            <Box className='flex justify-between items-center mt-1'>
              <p>{currency1.symbol}:</p>
              <p>{formatTokenAmount(token1Deposited)}</p>
            </Box>
          </Box>
          )
        : (
          <p>
            <span role='img' aria-label='wizard-icon'>
              ⭐️
            </span>{' '}
            By adding liquidity you'll earn 0.25% of all trades on this pair proportional to your share of the pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity.
          </p>
          )}
    </Box>
  )
}

export default MinimalPositionCard
