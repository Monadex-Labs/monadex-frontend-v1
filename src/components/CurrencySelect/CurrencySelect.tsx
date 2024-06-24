import React, { useCallback, useState } from 'react'
import { NativeCurrency, Token } from '@monadex/sdk'
import { CurrencySearchModal, CurrencyLogo } from '@/components'
import { Box } from '@mui/material'

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
  return (
    <Box className='px-3 py-2 rounded-full'>
      <Box
        className={
          bgClass === null
            ? `${(currency !== null) ? 'bg-[#404557]' : 'bg-gradient-to-r from-[#18003E]'}`
            : bgClass
        }
        onClick={handleOpenModal}
      >
        {currency ? (
          <Box className='flex items-center gap-2'>
            <CurrencyLogo currency={currency} size={'28px'} />
            <p className='token-symbol-container'>{currency?.symbol}</p>
          </Box>
        ) : (
          <p>select token</p>
        )}
        {children}
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
