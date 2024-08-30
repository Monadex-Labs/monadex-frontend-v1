import { currencyEquals, ETH, NativeCurrency, Token } from '@monadex/sdk'
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
  className?: string
}

const CurrencyLogo: React.FC<CurrencyLogoProps> = ({
  currency,
  size = '24px', // TODO: Refactor size to be a number
  style,
  withoutBg,
  className
}) => {
  const nativeCurrency = ETH
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
          // currency?.address ?? currency?.tokenInfo.address,
          // inactiveTokenList
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
        className={`${className ?? ''} flex content-center items-center overflow-hidden`}
      >
        <Image
          className='w-100 h-100'
          src={nativeCurrencyImage}
          alt='Native Currency Logo'
          width={24} // TODO: use prop size here
          height={24}
        />
      </Box>
    )
  }

  return (
    <Box
      width={size}
      height={size}
      borderRadius={withoutBg != null ? 0 : size}
      className={`${className ?? ''} flex content-center items-center overflow-hidden ${withoutBg != null ? '' : ' bg-white'}`}
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
