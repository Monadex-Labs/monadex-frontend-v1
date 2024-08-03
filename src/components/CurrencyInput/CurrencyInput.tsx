
import { NativeCurrency, Token } from '@monadex/sdk'
import { useCurrencyBalance } from '@/state/wallet/hooks'
import { formatTokenAmount, useWalletData } from '@/utils'
import CurrencySelect from '@/components/CurrencySelect'
import NumericalInput from '@/components/NumericalInput'
import useUSDCPrice from '@/utils/useUsdcPrice'
interface CurrencyInputProps {
  title?: string
  handleCurrencySelect: (currency: NativeCurrency | Token) => void
  currency: Token | NativeCurrency | undefined
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
      className={`${showPrice === true ? ' priceShowBox' : ''} ${'bg-[#1F0050]/50 rounded-sm shadow-sm'} p-2 my-2`}
    >
      <div className='flex justify-between mb-2'>
        <p className='text-[#493E5D] text-sm font-semibold p-1'>{title ?? 'you pay'}</p>
        <div className='flex'>
          {Boolean(account) && (currency != null) && showHalfButton === true && (
            <div className='text-[#8133FF] font-lg' onClick={onHalf}>
              <small>50%</small>
            </div>
          )}
        </div>
      </div>
      <div className='flex justify-between p-1 items-center'>
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
            onUserInput={(val: any) => {
              setAmount(val)
            }}
          />
        </div>
      </div>
      <div className='flex justify-between items-center'>
        <div className='flex items-center p-1 gap-3'>
          <small className='text-[#493E5D] text-md'>
            {`Balance: ${formatTokenAmount(selectedCurrencyBalance)}`}
          </small>
          {Boolean(account) && (currency != null) && showMaxButton === true && (
              <div className='' onClick={onMax}>
                <small className='text-[#8133FF] font-lg'>Max</small>
              </div>
            )}
        </div>
        
        <small className='text-[#493E5D] text-md p-1'>
          ${(usdPrice * Number(amount)).toLocaleString('us')}
        </small>
      </div>
    </div>
  )
}

export default CurrencyInput
