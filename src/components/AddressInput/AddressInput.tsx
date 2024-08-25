import React, { useState } from 'react'
import { Box } from '@mui/material'
import { useWalletData } from '@/utils'
import { isAddress } from '@/utils'
import {CopyToClipboard} from 'react-copy-to-clipboard'

interface AddressInputProps {
  value: string
  onChange: (val: string) => void
  placeholder: string
  label: string
}

const AddressInput: React.FC<AddressInputProps> = ({
  value,
  onChange,
  placeholder,
  label
}) => {
  const [_copy, setCopy] = useState(false)
  const { chainId } = useWalletData()
  const error = !Boolean(value.length > 0)
  const address = isAddress(value)
  return (
    <Box
      className={`rounded-sm text-left p-2 border w-full flex items-center my-3 ${
        error ? 'border-2 border-red-400' : 'border border-secondary2'
      }`}
    >

      <Box className='flex justify-between items-center'>
        <p>{label}</p>
      </Box>
      <input
        value={value}
        className={'text-grey-300 w-full focus:outline-none bg-transparent'}
        placeholder={placeholder}
        onChange={(evt) => {
          const input = evt.target.value
          const withoutSpaces = input.replace(/\s+/g, '')
          onChange(withoutSpaces)
        }}
      />
       <CopyToClipboard text={value}
          onCopy={() => setCopy(true)}>
          <span className='border border-secondary3 text-sm opacity-40 bg-secondary2 p-2'>copy</span>
        </CopyToClipboard>
    </Box>
  )
}

export default AddressInput
