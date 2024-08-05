import React, { useCallback, useState } from 'react'
import { NativeCurrency, Token } from '@monadex/sdk'
import { CurrencySearchModal, CurrencyLogo } from '@/components'
import { Box } from '@mui/material'
import { IoIosArrowDown } from 'react-icons/io'

interface CurrencySelectProps {
  title?: string
  handleCurrencySelect: (currency: Token) => void
  currency: Token | NativeCurrency | undefined
  otherCurrency?: Token | NativeCurrency | undefined
  id?: string
  bgClass?: string
  children?: any
}

const CurrencySelect: React.FC<CurrencySelectProps> = ({
  handleCurrencySelect,
  currency,
  otherCurrency,
  bgClass,
  children
}) => {
  const [modalOpen, setModalOpen] = useState(false)
  const handleOpenModal = useCallback(() => {
    setModalOpen(true)
  }, [])
  console.log('currency Here', currency)
  return (
    <Box className='px-3 py-2 rounded-md flex justify-between items-center gap-3'>
      <Box
        className={
          bgClass === undefined
            ? `flex items-center gap-3 cursor-pointer p-3 rounded-md border ${currency != null ? 'border-[#2c0c61]' : 'border-[#6051b8]'}`
            : bgClass
        }
        onClick={handleOpenModal}
      >
        {currency != null
          ? (
            <Box className='flex items-center gap-2'>
              <CurrencyLogo currency={currency} size='28px' />
              <p className='ml-1'>{currency?.symbol}</p>
            </Box>
            )
          : (
            <p>Select a token</p>
            )}
        {children}
        <IoIosArrowDown />
      </Box>
      {modalOpen && (
        <CurrencySearchModal
          isOpen={modalOpen}
          onDismiss={() => {
            setModalOpen(false)
          }}
          onCurrencySelect={handleCurrencySelect}
          selectedCurrency={currency}
          showCommonBases
          otherSelectedCurrency={otherCurrency}
        />
      )}
    </Box>
  )
}

export default CurrencySelect
