import React, { useState } from 'react'
import { Box } from '@mui/material'
import { Button } from '@mui/base'
import { Pair, JSBI, Percent } from '@monadex/sdk'
import { unwrappedToken } from '@/utils/wrappedCurrency'
import { useTokenBalance } from '@/state/wallet/hooks'
import { useTotalSupply } from '@/data/TotalSupply'
import { CurrencyLogo, RemoveLiquidityModal } from '@/components'
import { useWalletData, currencyId, formatTokenAmount } from '@/utils'
import { useRouter } from 'next/navigation'
import { BsStars } from 'react-icons/bs'

const PoolPositionCardDetails: React.FC<{ pair: Pair }> = ({ pair }) => {
  const router = useRouter()

  const { account } = useWalletData()
  const [openRemoveModal, setOpenRemoveModal] = useState(false)

  const currency0 = unwrappedToken(pair.token0)
  const currency1 = unwrappedToken(pair.token1)

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
    <>
      <Box className='p-3 md:p-6 mb-3'>
        <Box className='flex items-center justify-between mb-4'>
          <p>Your Pool Tokens:</p>
          <p>{formatTokenAmount(userPoolBalance)}</p>
        </Box>
        <Box className='flex items-center justify-between mb-4'>
          <p>
            Pooled {currency0.symbol}:
          </p>
          <Box className='flex items-center'>
            <p className='mr-2'>{formatTokenAmount(token0Deposited)}</p>
            <CurrencyLogo size='20px' currency={currency0} />
          </Box>
        </Box>

        <Box className='flex items-center justify-between mb-4'>
          <p>
            Pooled {currency1.symbol}:
          </p>
          <Box className='flex items-center'>
            <p className='mr-2'>{formatTokenAmount(token1Deposited)}</p>
            <CurrencyLogo size='20px' currency={currency1} />
          </Box>
        </Box>

        <Box className='flex items-center justify-between mb-4'>
          <p>Your Pool Share:</p>
          <p>
            {(poolTokenPercentage != null)
              ? poolTokenPercentage.toSignificant() + '%'
              : '-'}
          </p>
        </Box>

        <Box className='flex items-center justify-between gap-3'>
          <Button
            className='h-9 flex items-center justify-center rounded-md border border-primary text-primary hover:border-primary2 hover:text-primary2 p-4 bg-transparent w-1/2'
            onClick={() => console.log('Not implemented yet')} // TODO: redirect to info analtytics dashboard for the given currency (pending analytics)
          >
            <p>View Analytics</p>
          </Button>
          <Button
            className='h-9 flex items-center justify-center rounded-md bg-primary hover:bg-primary2 transition w-1/4'
            onClick={() => {
              router.push(
                `/pools/new?currency0=${currencyId(
                  currency0
                )}&currency1=${currencyId(
                  currency1
                )}`
              )
            }}
          >
            <p>Add</p>
          </Button>
          <Button
            className='h-9 flex items-center justify-center rounded-md bg-primary hover:bg-primary2 transition w-1/4 '
            onClick={() => {
              setOpenRemoveModal(true)
            }}
          >
            Remove
          </Button>
          <Button
            className='h-9 flex items-center justify-center rounded-md bg-primary hover:bg-primary2 transition w-1/4 disabled:bg-primary/50'
            disabled
          >
            Farm  <span className='ml-2'> <BsStars /></span>
          </Button>
        </Box>
      </Box>
      {openRemoveModal && (
        <RemoveLiquidityModal
          currency0={currency0}
          currency1={currency1}
          open={openRemoveModal}
          onClose={() => setOpenRemoveModal(false)}
        />
      )}
    </>
  )
}

export default PoolPositionCardDetails
