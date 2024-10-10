import { Box } from '@mui/material'
import { useWalletData, isAddress } from '@/utils'
import { IoWarning } from 'react-icons/io5'
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
  const address = isAddress(value)
  const error = (value.length > 0 && address === false)
  return (
    <>
      {error && <small className='flex items-center gap-2 text-yellow font-regular'>The address entered is incorrect <IoWarning/> </small>}
      <Box
        className={`rounded-md text-left p-2 border w-full text-lg flex items-center my-3 ${
        error ? 'border-2 border-red-400' : 'border border-primary'
      }`}
      >
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
    </>

  )
}

export default AddressInput
