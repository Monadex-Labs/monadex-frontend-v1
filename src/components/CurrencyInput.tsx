import { NativeCurrency, MONAD, currencyEquals } from '@monadex/sdk'
import { TokenInfo } from '@uniswap/token-lists'
import { useCurrencyBalance } from '@/state/wallet/hooks'
import useUSDCPrice from 'utils/useUSDCPrice'
import { formatTokenAmount } from 'utils'
import CurrencySelect from 'components/CurrencySelect'
import { default as useUSDCPriceV3 } from 'hooks/v3/useUSDCPrice'
import { WMATIC_EXTENDED } from 'constants/v3/addresses'
import { WrappedTokenInfo } from '@/state/lists/wrappedTokenInfo'
import { useConnectWallet, useWallets } from '@web3-onboard/react'

interface CurrencyInputProps {
  title?: string
  handleCurrencySelect: (currency: NativeCurrency) => void
  currency: NativeCurrency | undefined
  otherCurrency?: NativeCurrency | undefined
  amount: string
  setAmount: (value: string) => void
  onMax?: () => void
  onHalf?: () => void
  showHalfButton?: boolean
  showMaxButton?: boolean
  showPrice?: boolean
  bgClass?: string
  color?: string
  id?: string
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  handleCurrencySelect,
  currency,
  otherCurrency,
  amount,
  setAmount,
  onMax,
  onHalf,
  showMaxButton,
  showHalfButton,
  title,
  showPrice,
  bgClass,
  color,
  id
}) => {
  const wallets = useWallets()

  const account = wallets[0].accounts[0].address
  const selectedCurrencyBalance = useCurrencyBalance(
    account ?? undefined,
    currency
  )
  const usdPriceV2 = Number(useUSDCPrice(currency)?.toSignificant() ?? 0)
  const currencyV3 =
    chainId && (currency != null)
      ? currencyEquals(currency, MONAD)
        ? ({
            ...MONAD,
            isNative: true,
            isToken: false,
            wrapped: WMATIC_EXTENDED
          } as NativeCurrency)
        : new WrappedTokenInfo(currency as TokenInfo)
      : undefined
  const usdPriceV3Obj = useUSDCPriceV3(currencyV3)
  const usdPriceV3 = Number(usdPriceV3Obj?.toSignificant() ?? 0)
  const usdPrice = usdPriceV3 || usdPriceV2

  return (
    <div
      id={id}
      className={`swapBox${showPrice ? ' priceShowBox' : ''} ${bgClass ??
        'bg-secondary2'}`}
    >
      <div className='flex justify-between mb-2'>
        <p>{title ?? 'youPay'}</p>
        <div className='flex'>
          {account && (currency != null) && showHalfButton && (
            <div className='maxWrapper' onClick={onHalf}>
              <small>50%</small>
            </div>
          )}
          {account && (currency != null) && showMaxButton && (
            <div className='maxWrapper ml-5' onClick={onMax}>
              <small>max</small>
            </div>
          )}
        </div>
      </div>
      <div className='mb-2'>
        <CurrencySelect
          id={id}
          currency={currency}
          otherCurrency={otherCurrency}
          handleCurrencySelect={handleCurrencySelect}
        />
        <div className='inputWrapper'>
          <NumericalInput
            value={amount}
            align='right'
            color={color}
            placeholder='0.00'
            onUserInput={(val) => {
              setAmount(val)
            }}
          />
        </div>
      </div>
      <div className='flex justify-between'>
        <small className={`${color ? `text-${color}` : 'text-secondary'}}`}>
          {t('balance')}: {formatTokenAmount(selectedCurrencyBalance)}
        </small>
        <small className={`${color ? `text-${color}` : 'text-secondary'}}`}>
          ${(usdPrice * Number(amount)).toLocaleString('us')}
        </small>
      </div>
    </div>
  )
}

export default CurrencyInput
