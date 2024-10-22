'use client'

import { useCallback, useState, useEffect } from 'react'
import { useSetSearchValue } from '@/state/pools/hooks'
import useDebouncedChangeHandler from '@/utils/useDebouncedChangeHandler'
import { isAddress } from '@/utils'
import { Box } from '@mui/material'
import { IoMdSearch } from 'react-icons/io'

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
    <Box
      className='w-[500px] h-12 gap-3 flex items-center px-3 my-3 rounded-lg outline-none border border-primary border-opacity-20 bg-bgColor/40'
    >
      <IoMdSearch className='text-neutral-200' />
      <input
        type='text'
        placeholder='Search by name, Symbol or Address'
        value={searchQueryInput}
        onChange={(e) => setSearchQueryInput(e.target.value)}
        className='bg-transparent focus:outline-none w-full placeholder:font-regular'
        autoFocus
      />
    </Box>

  )
}

export default SearchInput
