import { MONAD, currencyEquals, Token } from '@monadex/sdk'
import { TokenInfo } from '@uniswap/token-lists'
import { useCurrencyBalance } from '@/state/wallet/hooks'
import useUSDCPrice from '@/utils/useUSDCPrice'
import { formatTokenAmount } from '@/utils'
import CurrencySelect from '@/components/CurrencySelect'
import { WMATIC_EXTENDED } from '@/constants/addresses'
import { WrappedTokenInfo } from '@/state/list/hooks'
import { useWallets } from '@web3-onboard/react'
import NumericalInput from '../common/NumericalInput'
import { Box } from '@mui/material'

interface CurrencyInputProps {
  title?: string
  handleCurrencySelect: (currency: Token) => void
  currency: Token | undefined
  otherCurrency?: Token | undefined
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
    Boolean(account) && (currency != null)
      ? currencyEquals(currency, MONAD)
        ? ({
            ...MONAD,
            isNative: true,
            isToken: false,
            wrapped: WMATIC_EXTENDED
          })
        : new WrappedTokenInfo(currency as TokenInfo, [])
      : undefined
  const usdPriceV3Obj = useUSDCPrice(currencyV3)
  const usdPriceV3 = Number(usdPriceV3Obj?.toSignificant() ?? 0)
  const usdPrice = !Number.isNaN(usdPriceV3) ? usdPriceV3 : !Number.isNaN(usdPriceV2) ? usdPriceV2 : 0

  return (
    <Box
      id={id}
      className={`swapBox${showPrice === true ? ' priceShowBox' : ''} ${bgClass ??
        'bg-secondary2'}`}
    >
      <Box className='flex justify-between' mb={2}>
        <p>{title ?? 'youPay'}</p>
        <Box className='flex'>
          {Boolean(account) && (currency != null) && showHalfButton === true && (
            <Box className='maxWrapper' onClick={onHalf}>
              <small>50%</small>
            </Box>
          )}
          {Boolean(account) && (currency != null) && showMaxButton === true && (
            <Box className='maxWrapper ml-5' onClick={onMax}>
              <small>max</small>
            </Box>
          )}
        </Box>
      </Box>
      <Box mb={2}>
        <CurrencySelect
          id={id}
          currency={currency}
          otherCurrency={otherCurrency}
          handleCurrencySelect={handleCurrencySelect}
        />
        <Box className='inputWrapper'>
          <NumericalInput
            value={amount}
            align='right'
            color={color}
            placeholder='0.00'
            onUserInput={(val: string) => {
              setAmount(val)
            }}
          />
        </Box>
      </Box>
      <Box className='flex justify-between'>
        <small className={`${color !== undefined ? `text-${color}` : 'text-secondary'}}`}>
          {`Balance: ${formatTokenAmount(selectedCurrencyBalance)}`}
        </small>
        <small className={`${color !== undefined ? `text-${color}` : 'text-secondary'}}`}>
          ${(usdPrice * Number(amount)).toLocaleString('us')}
        </small>
      </Box>
    </Box>
  )
}

export default CurrencyInput
