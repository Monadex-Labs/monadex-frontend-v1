import { NativeCurrency, Token } from '@monadex/sdk'
import { useCurrencyBalance } from '@/state/wallet/hooks'
import { formatTokenAmount, useWalletData } from '@/utils'
import CurrencySelect from '@/components/CurrencySelect'
import NumericalInput from '@/components/NumericalInput'
import useUSDCPrice from '@/utils/useUsdcPrice'
interface CurrencyInputProps {
  title?: string
  handleCurrencySelect: (currency: NativeCurrency | Token) => void
  currency: Token | undefined
  otherCurrency?: Token | NativeCurrency | undefined
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
  const { account } = useWalletData()
  const selectedCurrencyBalance = useCurrencyBalance(
    account ?? undefined,
    currency
  )
  const usdPriceV2 = Number(useUSDCPrice(currency)?.toSignificant() ?? 0)
  const usdPrice = usdPriceV2
  return (
    <div
      id={id}
      className={`swapBox${showPrice === true ? ' priceShowBox' : ''} ${bgClass ??
        'bg-secondary2'}`}
    >
      <div className='flex justify-between mb-2'>
        <p>{title ?? 'youPay'}</p>
        <div className='flex'>
          {Boolean(account) && (currency != null) && showHalfButton === true && (
            <div className='maxWrapper' onClick={onHalf}>
              <small>50%</small>
            </div>
          )}
          {Boolean(account) && (currency != null) && showMaxButton === true && (
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
          otherCurrency={otherCurrency as Token}
          handleCurrencySelect={handleCurrencySelect}
        />
        <div className='inputWrapper'>
          <NumericalInput
            value={amount}
            align='right'
            color={color}
            placeholder='0.00'
            onUserInput={(val: any) => {
              setAmount(val)
            }}
          />
        </div>
      </div>
      <div className='flex justify-between'>
        <small className={`${color !== undefined ? `text-${color}` : 'text-secondary'}}`}>
          {`Balance: ${formatTokenAmount(selectedCurrencyBalance)}`}
        </small>
        <small className={`${color !== undefined ? `text-${color}` : 'text-secondary'}}`}>
          ${(usdPrice * Number(amount)).toLocaleString('us')}
        </small>
      </div>
    </div>
  )
}

export default CurrencyInput
