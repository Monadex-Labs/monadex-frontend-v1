import { NativeCurrency, MONAD, currencyEquals, Token, WMND } from '@monadex/sdk'
import { useCurrencyBalance } from '@/state/wallet/hooks'
import { formatTokenAmount } from '@/utils'
import CurrencySelect from '@/components/CurrencySelect'
// import { WrappedTokenInfo } from '@/state/list/hooks'
import { useWallets } from '@web3-onboard/react'
import { NumericalInput } from '@/components'
import { Box } from '@mui/material'
import useUSDCPrice from '@/utils/useUsdcPrice'

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
  const usdPrice = usdPriceV2
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
          otherCurrency={otherCurrency as Token}
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
          {`Balance: ${formatTokenAmount(selectedCurrencyBalance)}`} {/*eslint-disable-line*/}
        </small>
        <small className={`${color !== undefined ? `text-${color}` : 'text-secondary'}}`}>
          ${(usdPrice * Number(amount)).toLocaleString('us')}
        </small>
      </Box>
    </Box>
  )
}

export default CurrencyInput
