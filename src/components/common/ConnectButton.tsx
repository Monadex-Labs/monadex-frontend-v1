'use client'
import { useConnectWallet } from '@web3-onboard/react'
import { cn } from '@/utils/cn'
import { useEffect, useState } from 'react'
import { supportedChainId } from '@/utils/supportedChain'
import { SwitchChainPopUp } from '../Popup/switchChainPopup'
interface ButtonProps {
  classNames?: string
  children?: React.ReactNode
  onClick?: () => void
}

const Base: React.FC<any> = ({ classNames, children, ...rest }: ButtonProps) => {
  return (
    <button
      {...rest}
      className={cn('bg-[#836EF9] hover:bg-[#836EF9]/50 text-white focus:shadow-md text-sm px-5 py-2.5 text-center rounded-sm', classNames)}

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
export const PrimaryButton: React.FC<any> = ({children, classNames, onClick }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn('bg-[#836EF9] hover:bg-[#836EF9]/50 text-white focus:shadow-md text-sm px-5 py-2.5 text-center rounded-sm', classNames)}
    >{children}
    </button>
  )
}

export const ConnectButton: React.FC<any> = ({ classNames, children, ...rest }: ButtonProps) => {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet()
  const [messageBtn, setMsgBtn] = useState<boolean>(false)
  const [hover, setHover] = useState(false)
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
        onMouseOver={() => setHover(true)}
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
              : (hover && wallet != null ? 'Disconnect' : 'Connect')}
      </button>
    </>

  )
}
