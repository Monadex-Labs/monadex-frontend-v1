'use client'
import { useConnectWallet } from '@web3-onboard/react'
import { cn } from '@/utils/cn'
import React, { memo, useEffect, useState } from 'react'
import { supportedChainId } from '@/utils/supportedChain'
import { SwitchChainPopUp } from '../Popup/switchChainPopup'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
  children: React.ReactNode
}

/**
 *  @Base Buttton
*/

export const PrimaryButton: React.FC<ButtonProps> = memo(({
  children,
  className,
  onClick,
  ...rest
}: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        className
      )}
      {...rest}
    >
      {children}
    </button>
  )
})

/**
 *  @connection Butttonp
 *
*/

export const ConnectButton: React.FC<ButtonProps> = ({ className, children, ...rest }: ButtonProps) => {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet()
  const [isHovering, setIsHovering] = useState(false)
  const [buttonText, setButtonText] = useState<string>('Connect wallet')
  const [dismiss, setDismiss] = useState(false)

  useEffect(() => {
    const checkWallet = (wallet != null) ? supportedChainId(Number(wallet.chains[0].id)) : null
    if ((wallet != null) && checkWallet === 'Unsupported chain') {
      setDismiss(true)
    }
    if (wallet != null) {
      const address = wallet.accounts[0]?.address
      setButtonText(address ? `${address.slice(0, 4)}...${address.slice(-4)}` : 'Connected')
    } else {
      setButtonText('Connect wallet')
    }
  }, [wallet])

  const handleClick = async () => {
    if (wallet != null) {
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
        className={className}
        {...rest}
      >
        {connecting ? 'Connecting' : (isHovering && (wallet != null) ? 'Disconnect' : buttonText)}
      </button>
      {dismiss && <SwitchChainPopUp open={dismiss} onClose={() => setDismiss(false)} />}
    </div>
  )
}
