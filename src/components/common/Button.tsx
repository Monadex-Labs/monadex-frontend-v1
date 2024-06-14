'use client'
import Image from 'next/image'
import { useConnectWallet, useWallets } from '@web3-onboard/react'
import { Avatar } from '@mui/material'
import molandak from '../../static/assets/hedgehog.png'
import { cn } from '@/utils/cn'
import { useEffect, useState } from 'react'
import { supportedChainId } from '@/utils/supportedChain'
interface ButtonProps {
  classNames?: string
  children?: React.ReactNode
}

const Base: React.FC<any> = ({ classNames, children, ...rest }: ButtonProps) => {
  return (
    <button
      {...rest}
      className={`p-8 w-100 font-semibold text-center rounded-sm outline-none 
      border text-white flex content-center items-center flex-nowrap cursor-pointer ${classNames ?? ''}`}

    >
      {children}
    </button>
  )
}

export const ButtonPrimary: React.FC<any> = ({ classNames, children, ...rest }: ButtonProps) => {
  return (
    <Base {...rest} classNames={`bg-indigo-500 hover:bg-indigo-600 text-white focus:shadow-md ${classNames ?? ''}`} />
  )
}

export const WalletButton: React.FC<any> = ({ classNames, children, ...rest }: ButtonProps) => {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet()
  const [message, setMessage] = useState<string>('')
  const [messageBtn, setMsgBtn] = useState<boolean>(false)
  useEffect(() => {
    if (wallet?.chains === null) return undefined
    const checkWallet = supportedChainId(Number(wallet?.chains[0].id))
    if(checkWallet === undefined) {
      setMessage('Unsupported chain')
      setMsgBtn(true)
    } 
  }, [wallet, connecting])
  return (
    <button
      disabled={connecting}
      onClick={async () => ((wallet != null) ?  disconnect(wallet): connect())}
      className={cn('flex p-2 items-center justify-center gap-4 text-white bg-[#836EF9] hover:bg-[#836EF9]/50 focus:outline-none focus:ring-4 focus:ring-[#836EF9]/50 font-medium rounded-full text-sm px-5 py-2.5 text-center', classNames)}
    >
      <Image src={molandak} alt="molandak" width={20} height={20}/>
       {connecting
          ? "Connecting"
          : wallet
          ? `${wallet.accounts[0].address.slice(
              0,
              4
            )}...${wallet.accounts[0].address.slice(-4)}`
          : 'Connect Wallet'}
    </button>
  )
}
