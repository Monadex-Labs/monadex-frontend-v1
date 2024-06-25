import { CurrencyAmount, MONAD, Token } from '@monadex/sdk'
import React, { useState, useCallback, useMemo } from 'react'
import { Box, Tooltip, CircularProgress, ListItem } from '@mui/material'
import { WrappedTokenInfo } from '@/state/list/hooks'
import { useAddUserToken, useRemoveUserAddedToken } from '@/state/user/hooks'
import { useIsUserAddedToken, useCurrency } from '@/hooks/Tokens'
import { CurrencyLogo, PlusHelper, TokenWarningModal } from '@/components'
import { getTokenLogoURL } from '@/utils/getTokenLogoURL'
import { formatNumber, formatTokenAmount } from '@/utils/index'
import { getIsMetaMaskWallet } from '@/utils/connectors'
import { wrappedCurrency } from '@/utils/wrappedCurrency'
import { useWalletData } from '@/utils'
import { FiCheck } from 'react-icons/fi'

// TODO Investigate: shouldnt this key return 'ETH' not 'MONAD'
function currencyKey (currency: Token): string {
  return currency instanceof Token
    ? currency.address
    : currency === MONAD
      ? 'MONAD'
      : ''
}

function Balance ({ balance }: { balance: CurrencyAmount }): JSX.Element {
  return (
    <p className='small' title={balance.toExact()}>
      {formatTokenAmount(balance)}
    </p>
  )
}

function TokenTags ({ currency }: { currency: Token }): JSX.Element {
  if (!(currency instanceof WrappedTokenInfo)) {
    return <span />
  }

  const tags = currency.tags
  if (tags === undefined || tags.length === 0) return <span />

  const tag = tags[0]
  return (
    <Box>
      <Tooltip title={tag.description}>
        <Box className='tag' key={tag.id}>
          {tag.name}
        </Box>
      </Tooltip>
      {tags.length > 1
        ? (
          <Tooltip
            title={tags
              .slice(1)
              .map(({ name, description }) => `${name}: ${description}`)
              .join('; \n')}
          >
            <Box className='tag'>...</Box>
          </Tooltip>
          )
        : null}
    </Box>
  )
}

interface CurrenyRowProps {
  currency: Token
  onSelect: () => void
  isSelected: boolean
  otherSelected: boolean
  style: any
  isOnSelectedList?: boolean
  balance: CurrencyAmount | undefined
  usdPrice: number
}

const CurrencyRow: React.FC<CurrenyRowProps> = ({
  currency,
  onSelect,
  isSelected,
  otherSelected,
  style,
  isOnSelectedList,
  balance,
  usdPrice
}) => {
  const { account, chainId, provider } = useWalletData()
  const key = currencyKey(currency)
  const customAdded = useIsUserAddedToken(currency)
  const nativeCurrency = MONAD

  const removeToken = useRemoveUserAddedToken()
  const addToken = useAddUserToken()
  const isMetamask = getIsMetaMaskWallet() && isOnSelectedList

  const addTokenToMetamask = async (
    tokenAddress: any,
    tokenSymbol: any,
    tokenDecimals: any,
    tokenImage: any
  ): Promise<void> => {
    if (provider?.provider?.request != null) {
      await provider.provider.request({
        method: 'wallet_watchAsset',
        params: [{
          type: 'ERC20',
          options: {
            address: tokenAddress,
            symbol: tokenSymbol,
            decimals: tokenDecimals,
            image: tokenImage
          }
        }]
      })
    }
  }

  const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(true)

  const selectedToken = useCurrency(
    wrappedCurrency(currency, chainId)?.address
  )

  const selectedTokens: Token[] = useMemo(
    () => [selectedToken]?.filter((c): c is Token => c instanceof Token) ?? [],
    [selectedToken]
  )

  const selectedTokensNotInDefault = selectedTokens

  const handleConfirmTokenWarning = useCallback(() => {
    setDismissTokenWarning(true)
  }, [])

  // reset if they close warning without tokens in params
  const handleDismissTokenWarning = useCallback(() => {
    setDismissTokenWarning(true)
  }, [])

  // only show add or remove buttons if not on selected list
  return (
    <>
      <TokenWarningModal
        isOpen={!dismissTokenWarning}
        tokens={selectedTokensNotInDefault}
        onConfirm={handleConfirmTokenWarning}
        onDismiss={handleDismissTokenWarning}
      />
      <ListItem
        button
        style={style}
        key={key}
        selected={otherSelected || isSelected}
        onClick={() => {
          if (!isSelected && !otherSelected) onSelect()
        }}
      >
        <Box className='w-full bg-transparent flex p-4'>
          {(otherSelected || isSelected) && <FiCheck />}
          <CurrencyLogo currency={currency} size='32px' />
          <Box ml={1} height={32}>
            <Box className='flex items-center'>
              <small className='currencySymbol'>{currency.symbol}</small>
              {isMetamask != null &&
                currency !== nativeCurrency &&
                !(currency.name === 'MONAD') && (
                  <Box
                    className='border bg-red-300'
                    ml='2px'
                    onClick={(event: any) => {
                      addTokenToMetamask( // eslint-disable-line
                        currency.address,
                        currency.symbol,
                        currency.decimals,
                        // currency.address
                        getTokenLogoURL()  
                      )
                      event.stopPropagation()
                    }}
                  >
                    <PlusHelper text='Add to metamask' />
                  </Box>
              )}
            </Box>
            {isOnSelectedList != null
              ? (
                <span className='text-[#C6CACF]'>{currency.name}</span>
                )
              : (
                <Box className='flex items-center'>
                  <span>
                    {customAdded ? 'Added by user' : 'Found by address'}
                  </span>
                  <Box
                    ml={0.5}
                    className='text-primary'
                    onClick={(event) => {
                      event.stopPropagation()
                      if (customAdded) {
                        if (chainId != null && currency instanceof Token) { removeToken(chainId, currency.address) }
                      } else {
                        if (currency instanceof Token) {
                          addToken(currency)
                          setDismissTokenWarning(false)
                        }
                      }
                    }}
                  >
                    <span>
                      {customAdded ? 'Remove' : 'Add'}
                    </span>
                  </Box>
                </Box>
                )}
          </Box>

          <Box flex={1} />
          <TokenTags currency={currency} />
          <Box textAlign='right'>
            {(balance != null)
              ? (
                <>
                  <Balance balance={balance} />
                  <span className='text-secondary'>
                    ${formatNumber(Number(balance.toExact()) * usdPrice)}
                  </span>
                </>
                )
              : account != null
                ? (
                  <CircularProgress size={24} color='secondary' />
                  )
                : null}
          </Box>
        </Box>
      </ListItem>
    </>
  )
}

export default CurrencyRow
