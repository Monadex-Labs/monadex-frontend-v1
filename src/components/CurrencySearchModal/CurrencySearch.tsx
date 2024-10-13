import { ChainId, Token, ETH, NativeCurrency } from '@monadex/sdk'
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
import { DEFAULT_TOKEN_LIST_URL } from '@/constants/index'
import CommonBases from './CommomBases'
import CurrencyList from './CurrencyList'
import { AppDispatch } from '@/state/store'
import { isAddress, useWalletData } from '@/utils'
import { filterTokens } from '@/utils/filtering'
import { useTokenComparator } from '@/utils/sorting'
import useDebouncedChangeHandler from '@/utils/useDebouncedChangeHandler'
import { useCurrencyBalances } from '@/state/wallet/hooks'
import { IoMdClose, IoMdSearch } from 'react-icons/io'

interface CurrencySearchProps {
  isOpen: boolean
  onDismiss: () => void
  selectedCurrency?: Token | NativeCurrency | null
  onCurrencySelect: (currency: Token | NativeCurrency) => void
  otherSelectedCurrency?: Token | NativeCurrency | null
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
  const { account } = useWalletData()
  const dispatch = useDispatch<AppDispatch>()
  const chainIdToUse = ChainId.SEPOLIA
  const nativeCurrency = ETH
  const handleInput = useCallback((input: string) => {
    const checksummedInput = isAddress(input)
    setSearchQuery(checksummedInput || input) // TODO: isAddress returns boolean, and setSearchQuery accepts string
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
    if (isAddressSearch) return searchToken != null ? [searchToken] : [] // TODO: check for type string or true value on isAddressSearch
    const filteredResult = filterTokens(Object.values(allTokens), searchQuery)
    let filteredInactiveResult: Token[] = []
    // search in inactive token list.
    if (searchQuery != null) {
      filteredInactiveResult = filterTokens(
        Object.values(inactiveTokens),
        searchQuery
      )
    }
    const inactiveAddresses = filteredInactiveResult.map(
      (token) => token.address
    )
    const filteredDefaultTokens = filteredResult.filter(
      (token: any) => !inactiveAddresses.includes(token.address)
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
      ...(searchToken != null ? [searchToken] : []),
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
    account ?? undefined,
    allCurrencies
  )
  const handleCurrencySelect = useCallback(
    (currency: Token | NativeCurrency) => {
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
  useEffect(() => {
    if (selectedListInfo.current === null) {
      dispatch(selectList(DEFAULT_TOKEN_LIST_URL))
    }
  }, [selectedListInfo, dispatch])

  selectedListInfo = useSelectedListInfo()
  return (
    <Box className='pt-5 px-6 h-[80vh] flex flex-col'>
      <Box className='flex justify-between items-center m-[6px]'>
        <h6 className='text-lg'>Select a token</h6>
        <IoMdClose onClick={onDismiss} />
      </Box>
      <Box className='w-full h-12 gap-3 flex items-center px-3 my-3 rounded-lg outline-none border border-primary bg-transparent'>
        <IoMdSearch className='text-neutral-200' />
        <input
          type='text'
          placeholder='Search by name, Symbol or Address'
          value={searchQueryInput}
          ref={inputRef as RefObject<HTMLInputElement>}
          onChange={(e) => setSearchQueryInput(e.target.value)}
          onKeyDown={handleEnter}
          className='bg-transparent focus:outline-none w-full'
          autoFocus
        />
      </Box>
      {showCommonBases && showCommonBases && (
        <CommonBases
          chainId={chainIdToUse}
          onSelect={handleCurrencySelect}
          selectedCurrency={selectedCurrency}
        />
      )}

      <Divider />

      <Box flex={1} className='w-full rounded-tl-lg rounded-tr-lg bg-secondary2 '>
        <CurrencyList
          chainId={chainIdToUse}
          showETH={showETH}
          currencies={filteredSortedTokens}
          onCurrencySelect={handleCurrencySelect}
          otherCurrency={otherSelectedCurrency}
          selectedCurrency={selectedCurrency}
          balances={currencyBalances}
        />
      </Box>
    </Box>
  )
}

export default CurrencySearch
