import React, { useState, useEffect, useCallback } from 'react'
import { Token, NativeCurrency, TokenAmount, MONAD, JSBI } from '@monadex/sdk'
import { IoIosArrowBack, IoMdAdd, IoMdClose } from 'react-icons/io'
import { Box } from '@mui/material'
import {
  CustomModal,
  CurrencyLogo,
  CurrencySearchModal,
  MinimalPositionCard
} from '@/components'
import { useTokenBalance } from '@/state/wallet/hooks'
import { usePair, PairState } from '@/data/Reserves'
import { usePairAdder } from '@/state/user/hooks'
import { useWalletData, currencyId } from '@/utils'
import Link from 'next/link'
import 'components/styles/PoolFinderModal.scss'

enum Fields {
  TOKEN0 = 0,
  TOKEN1 = 1,
}

interface PoolFinderModalProps {
  open: boolean
  onClose: () => void
}

const PoolFinderModal: React.FC<PoolFinderModalProps> = ({ open, onClose }) => {
  const { account } = useWalletData()

  const [showSearch, setShowSearch] = useState<boolean>(false)
  const [activeField, setActiveField] = useState<number>(Fields.TOKEN1)
  const nativeCurrency = MONAD
  const [currency0, setCurrency0] = useState<Token | NativeCurrency | null>(nativeCurrency)
  const [currency1, setCurrency1] = useState<Token | NativeCurrency | null>(null)

  const [pairState, pair] = usePair(
    currency0 ?? undefined,
    currency1 ?? undefined
  )
  const addPair = usePairAdder()
  useEffect(() => {
    if (pair != null) {
      addPair(pair)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pair?.liquidityToken.address])

  const validPairNoLiquidity: boolean =
    pairState === PairState.NOT_EXISTS ||
    Boolean(
      pairState === PairState.EXISTS &&
        (pair != null) &&
        JSBI.equal(pair.reserve0.raw, JSBI.BigInt(0)) &&
        JSBI.equal(pair.reserve1.raw, JSBI.BigInt(0))
    )

  const position: TokenAmount | undefined = useTokenBalance(
    account ?? undefined,
    pair?.liquidityToken
  )
  const hasPosition = Boolean(
    (position != null) && JSBI.greaterThan(position.raw, JSBI.BigInt(0))
  )

  const handleCurrencySelect = useCallback(
    (currency: Token | NativeCurrency) => {
      if (activeField === Fields.TOKEN0) {
        setCurrency0(currency)
      } else {
        setCurrency1(currency)
      }
    },
    [activeField]
  )

  const handleSearchDismiss = useCallback(() => {
    setShowSearch(false)
  }, [setShowSearch])

  return (
    <CustomModal open={open} onClose={onClose}>
      <Box paddingX={3} paddingY={4}>
        <Box className='flex items-center justify-between'>
          <IoIosArrowBack
            className='text-secondary cursor-pointer'
            onClick={onClose}
          />
          <h6>Import Pool</h6>
          <IoMdClose className='cursor-pointer' onClick={onClose} />
        </Box>
        <Box
          mt={2}
          className='borderedCard'
          onClick={() => {
            setShowSearch(true)
            setActiveField(Fields.TOKEN0)
          }}
        >
          {(currency0 != null)
            ? (
              <Box className='flex items-center'>
                <CurrencyLogo currency={currency0} size='20px' />
                <p className='weight-600' style={{ marginLeft: 6 }}>
                  {currency0.symbol}
                </p>
              </Box>
              )
            : (
              <p className='weight-600'>Select a token</p>
              )}
        </Box>
        <Box my={1} className='flex justify-center'>
          <IoMdAdd size='20' className='text-secondary' />
        </Box>
        <Box
          className='borderedCard'
          onClick={() => {
            setShowSearch(true)
            setActiveField(Fields.TOKEN1)
          }}
        >
          {(currency1 != null)
            ? (
              <Box display='flex'>
                <CurrencyLogo currency={currency1} />
                <p className='weight-600' style={{ marginLeft: 6 }}>
                  {currency1.symbol}
                </p>
              </Box>
              )
            : (
              <p className='weight-600'>Select a token</p>
              )}
        </Box>
        {hasPosition && (
          <Box textAlign='center' mt={2}>
            <p>Pool Found!</p>
            <p className='cursor-pointer text-primary' onClick={onClose}>
              Manage this pool.
            </p>
          </Box>
        )}
        <Box className='poolFinderInfo border'>
          {(currency0 != null) && (currency1 != null)
            ? (
                pairState === PairState.EXISTS
                  ? (
                      hasPosition && (pair != null)
                        ? (
                          <MinimalPositionCard pair={pair} border='none' />
                          )
                        : (
                          <Box textAlign='center'>
                            <p>You don't have liquidity in this pool yet.</p>
                            <Link
                              href={`/new?currency0=${currencyId(currency0)}&currency1=${currencyId(currency1)}`}
                              className='text-primary no-decoration'
                              onClick={onClose}
                            >
                              <p>Add Liquidity.</p>
                            </Link>
                          </Box>
                          )
                    )
                  : validPairNoLiquidity
                    ? (
                      <Box textAlign='center'>
                        <p>No pool found.</p>
                        <Link
                          href={`/new?currency0=${currencyId(currency0)}&currency1=${currencyId(currency1)}`}
                          className='text-primary no-decoration'
                          onClick={onClose}
                        >
                          Create pool.
                        </Link>
                      </Box>
                      )
                    : pairState === PairState.INVALID
                      ? (
                        <p>Invalid pair.</p>
                        )
                      : pairState === PairState.LOADING
                        ? (
                          <p>Loading...</p>
                          )
                        : null
              )
            : (
              <p>
                {!account
                  ? 'Connect to a wallet to find pools.'
                  : 'Select a token to find your liquidity.'}
              </p>
              )}
        </Box>
      </Box>
      {showSearch && (
        <CurrencySearchModal
          isOpen={showSearch}
          onCurrencySelect={handleCurrencySelect}
          onDismiss={handleSearchDismiss}
          showCommonBases
          selectedCurrency={
            (activeField === Fields.TOKEN0 ? currency1 : currency0) ?? undefined
          }
        />
      )}
    </CustomModal>
  )
}

export default PoolFinderModal
