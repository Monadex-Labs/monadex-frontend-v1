
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
      className={`${showPrice === true ? ' priceShowBox' : ''} ${'bg-darkPurple/50 rounded-md shadow-sm'} p-2 my-2`}
    >
      <div className='flex justify-between mb-2'>
        <p className='text-textSecondary text-md font-semibold p-1'>{title ?? 'you pay'}</p>
        <div className='flex gap-4'>
          {Boolean(account) && (currency != null) && showHalfButton === true && (
            <div className='text-primary font-lg' onClick={onHalf}>
              <small>50%</small>
            </div>
          )}
          {Boolean(account) && (currency != null) && showMaxButton === true && (
            <div className='' onClick={onMax}>
              <small className='text-primary font-lg'>Max</small>
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
        <div className='flex relative pl-2'>
          <NumericalInput
            className='w-full relative outline-none border-none whitespace-nowrap text-ellipsis overflow-hidden text-left bg-transparent text-2xl'
            value={amount}
            align='right'
            color={color}
            placeholder='0'
            onUserInput={(val: any) => {
              console.log('val', val)
              setAmount(val)
            }}
          />
        </div>
      </div>
      <div className='flex justify-between items-center'>
        <div className='flex items-center p-1 gap-3'>
          <small className='text-textSecondary text-md'>
            {`Balance: ${formatTokenAmount(selectedCurrencyBalance)}`}
          </small>
        </div>

        <small className='text-textSecondary text-md p-1'>
          ~ ${(usdPrice * Number(amount)).toLocaleString('us')}
        </small>
      </div>
    </div>
  )
}

export default CurrencyInput
