'use client'
import { useWalletData, formatTokenAmount } from '@/utils'
import { useTokenBalance } from '@/state/wallet/hooks'
import { Box } from '@mui/material'
import { Token } from '@monadex/sdk'
import { IoTicketSharp } from 'react-icons/io5'
import { RAFFLE_ADDRESS } from '@/constants'
const TicketModal: React.FC = () => {
  const { account, chainId } = useWalletData()
  // instanciate new Token class for useTokenBalance()
  const RaffleTicketsToken = new Token(
    chainId,
    RAFFLE_ADDRESS,
    18
  )
  const RaffleBalance = useTokenBalance(account, RaffleTicketsToken)
  return (
    <>
      {account
        ? (
          <div className='flex px-3 rounded-full items-center'>
            <p className='text-lg'><IoTicketSharp /></p>
            <p className='p-2 text-sm font-semibold italic flex gap-2'>{formatTokenAmount(RaffleBalance)}</p>
          </div>
          )
        : <></>}
    </>
  )
}

export default TicketModal
