'use client'
import { useConnectWallet } from '@web3-onboard/react'
import { cn } from '@/utils/cn'
import { useEffect, useState } from 'react'
import { supportedChainId } from '@/utils/supportedChain'
import { SwitchChainPopUp } from '../Popup/switchChainPopup'
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
    <Base {...rest} classNames={`bg-[#23006A] hover:bg-[#23006A]/90 text-white focus:shadow-md ${classNames ?? ''}`} />
  )
}

export const ConnectButton: React.FC<any> = ({ classNames, children, ...rest }: ButtonProps) => {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet()
  const [messageBtn, setMsgBtn] = useState<boolean>(false)
  const checkWallet = supportedChainId(Number(wallet?.chains[0].id))
  useEffect(() => {
    if (Number(wallet?.chains[0].id) === undefined) return undefined
    const checkWallet = supportedChainId(Number(wallet?.chains[0].id))
    if (checkWallet === 'Unsupported chain') {
      setMsgBtn(true)
    } else {
      setMsgBtn(false)
    }
  }, [wallet, connecting, checkWallet])
  return (
    <>
      {messageBtn &&
        <SwitchChainPopUp
          open={messageBtn}
          onClose={() => setMsgBtn(false)}
        />}
      <button
        disabled={connecting}
        onClick={async () => ((wallet != null) ? await disconnect(wallet) : await connect())} // eslint-disable-line
        className={cn('flex p-2 items-center justify-center gap-4 text-white bg-[#836EF9] hover:bg-[#836EF9]/50 focus:outline-none focus:ring-4 focus:ring-[#836EF9]/50 font-medium rounded-full text-sm px-5 py-2.5 text-center', classNames)}
        {...rest}
      >

        {connecting
          ? 'Connecting'
          : (wallet != null)
              ? `${wallet.accounts[0].address.slice(
              0,
              4
            )}...${wallet.accounts[0].address.slice(-4)}`
              : 'Connect Wallet'}
      </button>
    </>

  )
}
