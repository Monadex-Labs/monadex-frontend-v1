import { ChainId, Token, NativeCurrency, currencyEquals, MONAD } from '@monadex/sdk'
import { Box } from '@mui/material'
import { CurrencyLogo, QuestionHelper } from '@/components'

interface CommonBasesProps {
  chainId?: ChainId
  selectedCurrency?: Token | null
  onSelect: (currency: Token | NativeCurrency) => void
}

const CommonBases: React.FC<CommonBasesProps> = ({
  chainId,
  onSelect,
  selectedCurrency
}) => {
  const nativeCurrency = MONAD
  return (
    <Box mb={2}>
      <Box display='flex' my={1.5}>
        <Box mr='6px'>
          <span>Common bases</span>
        </Box>
        <QuestionHelper text='These tokens are commonly paired with other tokens.' />
      </Box>
      <Box className='flex flex-wrap'>
        <Box
          className='baseWrapper'
          onClick={() => {
            if (
              !selectedCurrency ||
              !currencyEquals(selectedCurrency, nativeCurrency)
            ) {
              onSelect(nativeCurrency)
            }
          }}
        >
          <CurrencyLogo currency={nativeCurrency} size='24px' />
          <small>{nativeCurrency.name}</small>
        </Box>
        {/*(chainId != null ? SUGGESTED_BASES[chainId] ?? [] []).map((token: Token) => {
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
        })*/}
      </Box>
    </Box>
  )
}

export default CommonBases
