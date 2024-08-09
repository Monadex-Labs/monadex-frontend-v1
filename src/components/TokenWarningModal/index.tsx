import React, { useCallback, useState } from 'react'
import { Box } from '@mui/material'
import { Button } from '@mui/base'
import { Token } from '@monadex/sdk'
import { CustomModal, CurrencyLogo } from '@/components'
import { FiAlertTriangle } from 'react-icons/fi'
import { shortenAddress, useWalletData } from '@/utils'

function TokenWarningCard ({ token }: { token?: Token }): React.ReactElement {
  const { chainId } = useWalletData()

  if (token == null) return <></>

  return (
    <Box mb={2} className='flex' key={token.address}>
      <Box mr={1} className='flex'>
        <CurrencyLogo currency={token} size='32px' />
      </Box>
      <Box>
        <p>
          {token?.name != null && token?.symbol != null && token?.name !== token?.symbol
            ? `${token.name} (${token.symbol})`
            : token?.name ?? token?.symbol}{' '}
        </p>
        {chainId != null && (
          <a
            className='text-primary'
            href='' // TODO: Add ENS link to address
            target='_blank'
            rel='noreferrer'
          >
            <p>
              {shortenAddress(token.address)} (View on Block Explorer)
            </p>
          </a>
        )}
      </Box>
    </Box>
  )
}

export default function TokenWarningModal ({
  isOpen,
  tokens,
  onConfirm,
  onDismiss
}: {
  isOpen: boolean
  tokens: Token[]
  onConfirm: () => void
  onDismiss: () => void
}): React.ReactElement {
  const [understandChecked, setUnderstandChecked] = useState(false)
  const toggleUnderstand = useCallback(
    () => setUnderstandChecked((uc) => !uc),
    []
  )

  return (
    <CustomModal open={isOpen} onClose={onDismiss}>
      <Box padding='24px 16px'>
        <Box mb={2} className='flex items-center justify-center'>
          <Box className='flex' mr={1}>
            <FiAlertTriangle />
          </Box>
          <h5 className='font-semibold text-lg'>Token imported</h5>
        </Box>
        <Box mb={3}>
          <p>
            Anyone can create an ERC20 token on Ethereum/Polygon with <em>any</em> name, including creating fake versions of existing tokens and tokens that claim to represent projects that do not have a token.
          </p>
          <br />
          <p>This interface can load arbitrary tokens by token addresses. Please take extra caution and do your research when interacting with arbitrary ERC20 tokens.</p>
          <br />
          <p>
            If you purchase an arbitrary token, <strong>you may be unable to sell it back.</strong>
          </p>
        </Box>

        {tokens.map((token) => {
          return <TokenWarningCard key={token.address} token={token} />
        })}
        <Box className='flex justify-between items-center'>
          <p style={{ cursor: 'pointer', userSelect: 'none' }} onClick={toggleUnderstand}>
            <input
              type='checkbox'
              checked={understandChecked}
              onChange={toggleUnderstand}
            />{' '}
            I understand
          </p>
          <Button
            disabled={!understandChecked}
            className='rounded-md py-2 px-3 bg-primary hover:bg-primary2 cursor-pointer transition disabled:bg-transparent disabled:text-textSecondary disabled:cursor-auto'
            onClick={() => {
              onConfirm()
            }}
          >
            Continue
          </Button>
        </Box>
      </Box>
    </CustomModal>
  )
}
