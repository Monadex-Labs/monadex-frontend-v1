'use client'
import { logIn, logOut } from '@/discord/actions'
import { useSession } from 'next-auth/react'
import { ButtonProps } from '@/components/common/ConnectButton'

const Discord2Oauth: React.FC<any> = ({ classNames, children, ...rest }: ButtonProps) => {
  const { data: session, status } = useSession()
  return (
    <button
      onClick={status === 'authenticated' ? logOut : logIn}
      className='justify-center font-medium rounded-lg text-sm px-3 py-2 text-center inline-flex items-center'
    >
      {
        status === 'authenticated' ? `${session?.user?.name ?? 'INVALID NAME'}` : 'Connect Discord'
      }
    </button>
  )
}
export default Discord2Oauth
