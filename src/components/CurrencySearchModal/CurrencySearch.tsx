import { ChainId, Token, MONAD } from '@monadex/sdk'
import React, {
  KeyboardEvent,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { Box, Divider } from '@mui/material'
import { useDispatch } from 'react-redux'
import { useAllTokens, useToken, useInActiveTokens } from '@/hooks/Tokens'
import { useSelectedListInfo } from '@/state/list/hooks'
import { selectList } from '@/state/list/actions'
import { GlobalConst } from '@/constants/index'
import CommonBases from './CommonBases'
import CurrencyList from './CurrencyList'
import { AppDispatch } from '@/state/store'
import { isAddress } from '@/utils'
import { filterTokens } from '@/utils/filtering'
import { useTokenComparator } from '@/utils/sorting'
import useDebouncedChangeHandler from '@/utils/useDebouncedChangeHandler'
import { useCurrencyBalances } from '@/state/wallet/hooks'
import { useUSDCPricesFromAddresses } from '@/utils/useUSDCPrice'
import { wrappedCurrency } from '@/utils/wrappedCurrency'
import { useWallets } from '@web3-onboard/react'
import { Close, Search } from '@mui/icons-material'

interface CurrencySearchProps {
  isOpen: boolean
  onDismiss: () => void
  selectedCurrency?: Token | null
  onCurrencySelect: (currency: Token) => void
  otherSelectedCurrency?: Token | null
  showCommonBases?: boolean
  onChangeList: () => void
}

const CurrencySearch: React.FC<CurrencySearchProps> = ({
  selectedCurrency,
  onCurrencySelect,
  otherSelectedCurrency,
  showCommonBases,
  onDismiss,
  isOpen
}) => {
  const wallets = useWallets()
  const account = wallets[0].accounts[0].address
  const dispatch = useDispatch<AppDispatch>()
  const chainIdToUse = ChainId.MONAD
  const nativeCurrency = MONAD
  const handleInput = useCallback((input: string) => {
    const checksummedInput = isAddress(input)
    setSearchQuery(checksummedInput || input)
  }, [])

  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchQueryInput, setSearchQueryInput] = useDebouncedChangeHandler(
    searchQuery,
    handleInput
  )

  const allTokens = useAllTokens()
  const inactiveTokens = useInActiveTokens()

  // if they input an address, use it
  const isAddressSearch = isAddress(searchQuery)
  const searchToken = useToken(searchQuery)

  const showETH: boolean = useMemo(() => {
    const s = searchQuery.toLowerCase().trim()
    return s === '' || s === 'e' || s === 'et' || s === 'eth'
  }, [searchQuery])

  const tokenComparator = useTokenComparator(false)

  const filteredTokens: Token[] = useMemo(() => {
    if (isAddressSearch) return (searchToken != null) ? [searchToken] : []
    const filteredResult = filterTokens(Object.values(allTokens), searchQuery)
    let filteredInactiveResult: Token[] = []
    // search in inactive token list.
    if (searchQuery) {
      filteredInactiveResult = filterTokens(
        Object.values(inactiveTokens),
        searchQuery
      )
    }
    const inactiveAddresses = filteredInactiveResult.map(
      (token) => token.address
    )
    const filteredDefaultTokens = filteredResult.filter(
      (token) => !inactiveAddresses.includes(token.address)
    )
    // return filterTokens(Object.values(allTokens), searchQuery);
    return [...filteredDefaultTokens, ...filteredInactiveResult]
  }, [isAddressSearch, searchToken, allTokens, inactiveTokens, searchQuery])

  const filteredSortedTokens: Token[] = useMemo(() => {
    if (searchToken != null) return [searchToken]
    const sorted = filteredTokens.sort(tokenComparator)
    const symbolMatch = searchQuery
      .toLowerCase()
      .split(/\s+/)
      .filter((s) => s.length > 0)
    if (symbolMatch.length > 1) return sorted

    return [
      ...(searchToken ? [searchToken] : []),
      // sort any exact symbol matches first
      ...sorted.filter(
        (token) => token.symbol?.toLowerCase() === symbolMatch[0]
      ),
      ...sorted.filter(
        (token) => token.symbol?.toLowerCase() !== symbolMatch[0]
      )
    ]
  }, [filteredTokens, searchQuery, searchToken, tokenComparator])

  const allCurrencies = showETH
    ? [nativeCurrency, ...filteredSortedTokens]
    : filteredSortedTokens

  const currencyBalances = useCurrencyBalances(
    account || undefined,
    allCurrencies
  )

  const tokenAddresses = allCurrencies
    .map((currency) => {
      const token = wrappedCurrency(currency, chainIdToUse)
      return (token != null) ? token.address.toLowerCase() : ''
    })
    .filter((address, ind, self) => self.indexOf(address) === ind)

  const { prices: usdPrices } = useUSDCPricesFromAddresses(tokenAddresses)

  const handleCurrencySelect = useCallback(
    (currency: Token) => {
      onCurrencySelect(currency)
      onDismiss()
    },
    [onDismiss, onCurrencySelect]
  )

  // clear the input on open
  useEffect(() => {
    if (isOpen) setSearchQuery('')
  }, [isOpen])

  const handleEnter = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        const s = searchQuery.toLowerCase().trim()
        if (s === 'eth') {
          handleCurrencySelect(nativeCurrency)
        } else if (filteredSortedTokens.length > 0) {
          if (
            filteredSortedTokens[0].symbol?.toLowerCase() ===
              searchQuery.trim().toLowerCase() ||
            filteredSortedTokens.length === 1
          ) {
            handleCurrencySelect(filteredSortedTokens[0])
          }
        }
      }
    },
    [filteredSortedTokens, handleCurrencySelect, nativeCurrency, searchQuery]
  )

  // manage focus on modal show
  const inputRef = useRef<HTMLInputElement>()

  let selectedListInfo = useSelectedListInfo()

  if (selectedListInfo.current === null) {
    dispatch(selectList(GlobalConst.utils.DEFAULT_TOKEN_LIST_URL))
  }
  selectedListInfo = useSelectedListInfo()

  return (
    <Box className='currencySearchWrapper'>
      <Box className='currencySearchHeader'>
        <h6>Select a token</h6>
        <Close onClick={onDismiss} />
      </Box>
      <Box className='searchInputWrapper'>
        <Search />
        <input
          type='text'
          placeholder='Search name or paste address'
          value={searchQueryInput}
          ref={inputRef as RefObject<HTMLInputElement>}
          onChange={(e) => setSearchQueryInput(e.target.value)}
          onKeyDown={handleEnter}
          autoFocus
        />
      </Box>
      {showCommonBases != null && (
        <CommonBases
          chainId={chainIdToUse}
          onSelect={handleCurrencySelect}
          selectedCurrency={selectedCurrency}
        />
      )}

      <Divider />

      <Box flex={1}>
        <CurrencyList
          chainId={chainIdToUse}
          showETH={showETH}
          currencies={filteredSortedTokens}
          onCurrencySelect={handleCurrencySelect}
          otherCurrency={otherSelectedCurrency}
          selectedCurrency={selectedCurrency}
          balances={currencyBalances}
          usdPrices={usdPrices}
        />
      </Box>

      <Box className='currencySearchFooter' />
    </Box>
  )
}

export default CurrencySearch
