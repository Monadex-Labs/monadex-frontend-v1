import { ChainId, Token, NativeCurrency, currencyEquals, ETH } from '@monadex/sdk'
import { Box } from '@mui/material'
import { CurrencyLogo, QuestionHelper } from '@/components'

interface CommonBasesProps {
  chainId?: ChainId
  selectedCurrency?: Token | NativeCurrency | null
  onSelect: (currency: Token | NativeCurrency) => void
}

const CommonBases: React.FC<CommonBasesProps> = ({
  chainId,
  onSelect,
  selectedCurrency
}) => {
  const nativeCurrency = ETH
  return (
    <Box mb={2}>
      <Box display='flex' my={1.5}>
        <Box mr='6px'>
          <span className='font-regular'>Popular</span>
        </Box>
        <QuestionHelper text='These tokens are commonly paired with other tokens.' />
      </Box>
      <Box className='flex flex-wrap'>
        <Box

          className='rounded-full flex p-2 mt-1 mr-2 mb-1 ml-0 items-center bg-secondary3 hover:cursor-pointer'
          onClick={() => {
            if (
              (selectedCurrency == null) ||
              !currencyEquals(selectedCurrency, nativeCurrency)
            ) {
              onSelect(nativeCurrency)
            }
          }}
        >
          <CurrencyLogo currency={nativeCurrency} size='24px' />
          <small className='ml-1'>{nativeCurrency.name}</small>
        </Box>
        {/*
        (chainId != null ? SUGGESTED_BASES[chainId] ?? [] []).map((token: Token) => {
          const selected = Boolean(
            selectedCurrency != null && currencyEquals(selectedCurrency, token)
          )
          return (
            <Box
              className='baseWrapper'
              key={token.address}
              onClick={() => {
                if (!selected) {
                  onSelect(token)
                }
              }}
            >
              <CurrencyLogo currency={token} size='24px' />
              <small>{token.symbol}</small>
            </Box>
          )
        }) */}
      </Box>
    </Box>
  )
}

export default CommonBases
