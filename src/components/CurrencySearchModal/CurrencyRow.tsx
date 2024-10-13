import { ChainId, CurrencyAmount, ETH, Token } from '@monadex/sdk'
import React, { useState, useCallback, useMemo } from 'react'
import { Box, Tooltip, CircularProgress, ListItem } from '@mui/material'
import { WrappedTokenInfo } from '@/state/list/hooks'
import { useAddUserToken, useRemoveUserAddedToken } from '@/state/user/hooks'
import { useIsUserAddedToken, useCurrency, _useCurrency } from '@/hooks/Tokens'
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
    : currency === ETH
      ? 'ETH'
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
}

const CurrencyRow: React.FC<CurrenyRowProps> = ({
  currency,
  onSelect,
  isSelected,
  otherSelected,
  style,
  isOnSelectedList,
  balance
}) => {
  const { account, chainId, provider } = useWalletData()
  const key = currencyKey(currency)
  const customAdded = useIsUserAddedToken(currency)
  const nativeCurrency = ETH
  const useChain = chainId ?? ChainId.SEPOLIA

  const removeToken = useRemoveUserAddedToken()
  const addToken = useAddUserToken()
  const isMetamask = getIsMetaMaskWallet() && isOnSelectedList

  const addTokenToMetamask = (
    tokenAddress: string,
    tokenSymbol: string,
    tokenDecimals: number,
    tokenImage: any
  ): void => {
    if ((provider?.provider?.request) != null) {
      try {
        provider.provider.request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20',
            options: {
              address: tokenAddress,
              symbol: tokenSymbol,
              decimals: tokenDecimals,
              image: tokenImage
            }
          } as unknown as any[]
        })
      } catch (error) {
        console.error('Error adding token to MetaMask:', error)
      }
    }
  }

  const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(true)

  const selectedToken = _useCurrency(
    wrappedCurrency(currency, useChain)?.address
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
        id={`token-item-${key}`}
        selected={otherSelected || isSelected}
        onClick={() => {
          if (!isSelected && !otherSelected) onSelect()
        }}
      >
        <Box className='w-full bg-transparent flex p-4 items-center gap-3'>
          {(otherSelected || isSelected) && <FiCheck />}
          <CurrencyLogo currency={currency} size='32px' />
          <Box ml={1} height={32}>
            <Box className='flex items-center'>
              <small className='font-regular text-md'>{currency.symbol}</small>
              {isMetamask != null &&
                currency !== nativeCurrency &&
                !(currency.name === 'ETH') && (
                  <Box
                    ml='4px'
                    onClick={(event: any) => {
                      addTokenToMetamask(
                        currency.address,
                        currency.symbol ?? 'INVALID SYMBOL',
                        currency.decimals,
                        getTokenLogoURL(currency.address)
                      )
                      event.stopPropagation()
                    }}
                  >
                    <PlusHelper text='Add to metamask' />
                  </Box>
              )}
            </Box>
            {isOnSelectedList != null && isOnSelectedList
              ? (
                <span className='text-textSecondary'>{currency.name}</span>
                )
              : (
                <Box className='flex items-center'>
                  <span className='text-sm font-semibold'>
                    {customAdded ? 'Added by user' : 'Found by address'}
                  </span>
                  <Box
                    ml={2}
                    className='text-xs font-medium bg-primary2 px-3 py-1 rounded-full '
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
            {balance != null
              ? (
                <>
                  <Balance balance={balance} />
                </>
                )
              : account != null
                ? (
                  <CircularProgress size={15} color='secondary' />
                  )
                : null}
          </Box>
        </Box>
      </ListItem>
    </>
  )
}

export default CurrencyRow
