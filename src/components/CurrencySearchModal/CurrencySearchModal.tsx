import { Token, MONAD } from '@monadex/sdk'
import React, { useCallback } from 'react'
import { CustomModal } from '@/components'
import CurrencySearch from './CurrencySearch'
import { WrappedTokenInfo } from '@/state/list/hooks'
import { TokenInfo } from '@uniswap/token-lists'
import { useIsV2 } from '@/state/application/hooks'

interface CurrencySearchModalProps {
  isOpen: boolean
  onDismiss: () => void
  selectedCurrency?: Token | null
  // TODO: Ignore typing to support new currency sdk
  onCurrencySelect: (currency: any) => void
  otherSelectedCurrency?: Token | null
  showCommonBases?: boolean
}

const CurrencySearchModal: React.FC<CurrencySearchModalProps> = ({
  isOpen,
  onDismiss,
  onCurrencySelect,
  selectedCurrency,
  otherSelectedCurrency,
  showCommonBases = false
}) => {
  const { isV2 } = useIsV2()
  const nativeCurrency = MONAD

  const handleCurrencySelect = useCallback(
    (currency: Token) => {
      if (!isV2) {
        if (currency.isNative) {
          onCurrencySelect({
            ...nativeCurrency,
            isNative: true,
            isToken: false
          } as Token)
        } else {
          onCurrencySelect(new WrappedTokenInfo(currency as TokenInfo, []))
        }
      } else {
        onCurrencySelect(currency)
      }
      onDismiss()
    },
    [isV2, onDismiss, onCurrencySelect, nativeCurrency]
  )

  return (
    <CustomModal
      open={isOpen}
      onClose={onDismiss}
      modalWrapper='searchModalWrapper'
      hideBackdrop
    >
      <CurrencySearch
        isOpen={isOpen}
        onDismiss={onDismiss}
        onCurrencySelect={handleCurrencySelect}
        onChangeList={() => console.log('Not implemented yet')}
        selectedCurrency={selectedCurrency}
        otherSelectedCurrency={otherSelectedCurrency}
        showCommonBases={showCommonBases}
      />
    </CustomModal>
  )
}

export default CurrencySearchModal
