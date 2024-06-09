import { currencyEquals, MONAD, Token } from '@monadex/sdk'
import { useMemo } from 'react'
import useHttpLocations from '@/hooks/useHttpLocations'
import { WrappedTokenInfo } from '@/state/list/hooks'
import { Logo } from '@/components'
import { getTokenLogoURL } from '@/utils/getTokenLogoURL'
import { useInActiveTokens } from '@/hooks/Tokens'
import Image from 'next/image'

interface CurrencyLogoProps {
  currency?: Token
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
      <div
        style={style}
        className={`currencyLogo roudned-full w-[${size}] h-[${size}]`}
      >
        <Image
          className='ethereumLogo'
          src={nativeCurrencyImage}
          alt='Native Currency Logo'
        />
      </div>
    )
  }

  return (
    <div
      className={`currencyLogo${withoutBg !== undefined ? '' : ' bg-white'} w-[${size}] h-[${size}] rounded-full`}
    >
      <Logo
        srcs={srcs}
        size={size}
        alt={`${currency?.symbol ?? 'token'} logo`}
        symbol={currency?.symbol}
      />
    </div>
  )
}

export default CurrencyLogo
