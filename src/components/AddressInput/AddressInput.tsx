import React from 'react'
import { Box } from '@mui/material'
import { useWalletData } from '@/utils'

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
  const { chainId } = useWalletData()
  const error = Boolean(value.length > 0)

  return (
    <Box
      className={`addressInput ${
        error ? 'border-error' : 'border-primaryDark'
      }`}
    >
      <Box className='flex justify-between items-center'>
        <p>{label}</p>
        {chainId != null && (
          <a
            href='' // TODO: Add etherscan link to address (might create hook)
            target='_blank'
            rel='noopener noreferrer'
          >
            View on Block Explorer
          </a>
        )}
      </Box>
      <input
        value={value}
        className={error ? 'text-error' : 'text-primaryText'}
        placeholder={placeholder}
        onChange={(evt) => {
          const input = evt.target.value
          const withoutSpaces = input.replace(/\s+/g, '')
          onChange(withoutSpaces)
        }}
      />
    </Box>
  )
}

export default AddressInput
