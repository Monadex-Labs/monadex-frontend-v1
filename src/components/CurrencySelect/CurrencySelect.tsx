import React, { useCallback, useState } from 'react'
import { NativeCurrency, Token } from '@monadex/sdk'
import { CurrencySearchModal, CurrencyLogo } from '@/components'

interface CurrencySelectProps {
  title?: string
  handleCurrencySelect: (currency: Token) => void
  currency: Token | NativeCurrency | undefined
  otherCurrency?: Token | undefined
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
    <div>
      <div
        className={
          bgClass === null
            ? `currencyButton ${(currency != null) ? 'currencySelected' : 'noCurrency'}`
            : bgClass
        }
        onClick={handleOpenModal}
      >
        {(currency != null)
          ? (
            <div className='flex items-center'>
              <CurrencyLogo currency={currency as Token} size='28px' />
              <p className='token-symbol-container'>{currency?.symbol}</p>
            </div>
            )
          : (
            <p>Select a token</p>
            )}
        {children}
      </div>
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
    </div>
  )
}

export default CurrencySelect
