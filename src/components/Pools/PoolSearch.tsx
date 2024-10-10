'use client'

import { useCallback, useState, useEffect } from 'react'
import { useSetSearchValue } from '@/state/pools/hooks'
import useDebouncedChangeHandler from '@/utils/useDebouncedChangeHandler'
import { isAddress } from '@/utils'

const SearchInput: React.FC = () => {
  const setSearchValue = useSetSearchValue()
  const [searchQuery, setSearchQuery] = useState<string>('')

  const handleInput = useCallback((input: string) => {
    const checksummedInput = isAddress(input)
    setSearchQuery(checksummedInput || input)
  }, [])

  const [searchQueryInput, setSearchQueryInput] = useDebouncedChangeHandler(
    searchQuery,
    handleInput
  )

  // Update global state when searchQuery changes
  useEffect(() => {
    setSearchValue(searchQuery)
  }, [searchQuery, setSearchValue])

  return (
    <input
      type='text'
      placeholder='Search by name, Symbol or Address'
      value={searchQueryInput}
      onChange={(e) => setSearchQueryInput(e.target.value)}
      className='bg-darkPurple focus:outline-none w-[30%] border border-primary p-2 rounded-lg placeholder-white/60 font-regular'
      autoFocus
    />
  )
}

export default SearchInput
