import React, { useState } from 'react'
import { Box } from '@mui/material'
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io'
import { Pair } from '@monadex/sdk'
import { unwrappedToken } from '@/utils/wrappedCurrency'
import { DoubleCurrencyLogo } from '@/components'
import PoolPositionCardDetails from './PoolPositionCardDetails'

const PoolPositionCard: React.FC<{ pair: Pair }> = ({ pair }) => {
  const currency0 = unwrappedToken(pair.token0)
  const currency1 = unwrappedToken(pair.token1)

  const [showMore, setShowMore] = useState(false)

  return (
    <Box
      className={`w-100 border border-secondary2 rounded-md overflow-hidden ${
        showMore ? 'bg-secondary2' : 'bg-transparent'
      }`}
    >
      <Box className='flex items-center justify-between px-4 py-3 md:p-7'>
        <Box className='flex items-center'>
          <DoubleCurrencyLogo
            currency0={currency0}
            currency1={currency1}
            size={28}
          />
          <p className='font-semibold' style={{ marginLeft: 16 }}>
            {!currency0 || !currency1
              ? 'Loading'
              : `${currency0.symbol ?? 'INVALID SYMBOl'}/${currency1.symbol ?? 'INVALID SYMBOl'}`}
          </p>
        </Box>

        <Box
          className='flex items-center text-primary cursor-pointer'
          onClick={() => setShowMore(!showMore)}
        >
          <p style={{ marginRight: 8 }}>Manage</p>
          {showMore ? <IoIosArrowUp size='20' /> : <IoIosArrowDown size='20' />}
        </Box>
      </Box>

      {showMore && <PoolPositionCardDetails pair={pair} />}
    </Box>
  )
}

export default PoolPositionCard
