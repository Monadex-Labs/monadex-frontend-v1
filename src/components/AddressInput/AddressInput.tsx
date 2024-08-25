import { Box } from '@mui/material'
import { useWalletData, isAddress } from '@/utils'

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
  const error = !Boolean(value.length > 0)
  const address = isAddress(value)
  console.log(error)
  console.log('is addess', value.length > 0)
  return (
    <Box
      className={`rounded-sm text-left p-2 border w-full flex items-center my-3 ${
        error ? 'border-2 border-red-400' : 'border border-secondary2'
      }`}
    >

      <Box className='flex justify-between items-center'>
        <p>{label}</p>
        {address && chainId && (
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
        className='text-grey-300 w-full focus:outline-none bg-transparent'
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
