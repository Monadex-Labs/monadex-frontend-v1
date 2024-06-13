'use client'
import { useConnectWallet } from '@web3-onboard/react'
import { cn } from '@/utils/cn'
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
  return (
    <button
      disabled={connecting}
      onClick={async () => ((wallet != null) ? disconnect(wallet) : connect())}
      className={cn('text-white bg-[#836EF9] hover:bg-[#836EF9]/50 focus:outline-none focus:ring-4 focus:ring-[#836EF9]/50 font-medium rounded-full text-sm px-5 py-2.5 text-center', classNames)}
    >
      {connecting ? 'Connecting' : (wallet !== null) ? 'Connected' : 'Connect Wallet'}
    </button>
  )
}
