'use client'
import { useConnectWallet } from '@web3-onboard/react'
import { cn } from '@/utils/cn'
import React, { useCallback, useEffect, useState } from 'react'
import { supportedChainId } from '@/utils/supportedChain'
import { SwitchChainPopUp } from '../Popup/switchChainPopup'

export interface ButtonProps {
  classNames?: string
  children?: React.ReactNode
  onClick?: () => void
}

const Base: React.FC<any> = ({ classNames, children, ...rest }: ButtonProps) => {
  return (
    <button
      {...rest}
      className={cn('bg-primary hover:bg-primary/50 text-white focus:shadow-md text-sm px-5 py-2.5 text-center rounded-sm', classNames)}
    >
      {children}
    </button>
  )
}

export const ButtonPrimary: React.FC<any> = ({ classNames, children, ...rest }: ButtonProps) => {
  return (
    <Base {...rest} />
  )
}
export const PrimaryButton: React.FC<any> = ({ children, classNames, onClick }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn('bg-primary hover:bg-primary/50 text-white focus:shadow-md text-sm px-5 py-2.5 text-center rounded-sm', classNames)}
    >{children}
    </button>
  )
}

export const ConnectButton: React.FC<any> = ({ classNames, children, ...rest }: ButtonProps) => {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet()
  const [isHovering, setIsHovering] = useState(false)
  const [buttonText, setButtonText] = useState<string>('Connect wallet')
  const [dismiss, setDismiss] = useState(false)
  

  useEffect(() => {
    const checkWallet = wallet ? supportedChainId(Number(wallet.chains[0].id)) : null
    if (wallet && checkWallet === 'Unsupported chain') {
      setDismiss(true)
    }
    if (wallet) {
      const address = wallet.accounts[0]?.address
      setButtonText(address ? `${address.slice(0, 4)}...${address.slice(-4)}` : 'Connected')
    } else {
      setButtonText('Connect wallet')
    }
  }, [wallet])

  const handleClick = async () => {
    if (wallet) {
      await disconnect(wallet)
    } else {
      await connect()
    }
  }

  return (
   <div>
    <button
    disabled={connecting}
    onMouseEnter={() => setIsHovering(true)}
    onMouseLeave={() => setIsHovering(false)}
    onClick={handleClick}
    className={cn('flex p-2 items-center justify-center gap-4 text-white bg-primary hover:bg-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/50 font-medium rounded-full text-sm px-5 py-2.5 text-center', classNames)}
    {...rest}
    >
    {connecting ? 'Connecting' : (isHovering && wallet ? 'Disconnect' : buttonText)}
    </button>
    {dismiss && <SwitchChainPopUp open={dismiss} onClose={() => setDismiss(false)}/>}
   </div>
  )
}