import { currencyEquals, MONAD, NativeCurrency, Token } from '@monadex/sdk'
import { useMemo } from 'react'
import { Box } from '@mui/material'
import useHttpLocations from '@/hooks/useHttpLocations'
import { WrappedTokenInfo } from '@/state/list/hooks'
import { Logo } from '@/components'
import { getTokenLogoURL } from '@/utils/getTokenLogoURL'
import { useInActiveTokens } from '@/hooks/Tokens'
import Image from 'next/image'

interface CurrencyLogoProps {
  currency?: Token | NativeCurrency
  size?: string
  style?: React.CSSProperties
  withoutBg?: boolean
}

const CurrencyLogo: React.FC<CurrencyLogoProps> = ({
  currency,
  size = '24px',
  style,
  withoutBg
}) => {
  const nativeCurrency = MONAD
  const nativeCurrencyImage = currency?.symbol !== undefined ? '/' + currency?.symbol + '.png' : '/.png'
  const uriLocations = useHttpLocations(
    currency instanceof WrappedTokenInfo
      ? currency?.logoURI ?? currency?.tokenInfo.logoURI
      : undefined
  )

  const inactiveTokenList = useInActiveTokens()

  const srcs: string[] = useMemo(() => {
    if (
      (currency != null) &&
      (currencyEquals(currency, nativeCurrency))
    ) { return [] }

    if (
      currency instanceof WrappedTokenInfo
    ) {
      return [
        ...getTokenLogoURL(
          currency?.address ?? currency?.tokenInfo.address,
          inactiveTokenList
        ),
        ...uriLocations
      ]
    }
    if (currency instanceof Token) {
      return getTokenLogoURL(currency.address, inactiveTokenList)
    }

    return []
  }, [currency, inactiveTokenList, nativeCurrency, uriLocations])

  if (
    (currency != null) &&
    (currencyEquals(currency, nativeCurrency))
  ) {
    return (
      <Box
        style={style}
        width={size}
        height={size}
        borderRadius={size}
        className='currencyLogo'
      >
        <Image
          className='monad logo'
          src={nativeCurrencyImage}
          alt='Native Currency Logo'
        />
      </Box>
    )
  }

  return (
    <Box
      width={size}
      height={size}
      borderRadius={withoutBg != null ? 0 : size}
      className={`currencyLogo${withoutBg != null ? '' : ' bg-white'}`}
    >
      <Logo
        srcs={srcs}
        size={size}
        alt={`${currency?.symbol ?? 'token'} logo`}
        symbol={currency?.symbol}
      />
    </Box>
  )
}

export default CurrencyLogo
