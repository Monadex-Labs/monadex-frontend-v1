'use client'
import gem from '@/static/assets/gem.svg'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useFetchUser } from '@/discord/hooks/useFetchUser'
import { CircularProgress } from '@mui/material'

export const Mxpdisplay: React.FC = () => {
  const { data: session } = useSession()
  const { userXP } = useFetchUser(session)

  return (
    <>
      {(userXP !== undefined && session !== undefined)
        ? (
          <div className='flex px-3  rounded-full items-center bg-primary/10'>
            <Image src={gem} width={50} height={50} alt='gem image' className='hidden lg:block' />
            <p className='p-2 text-sm font-semibold italic flex border-primary border-opacity-20'>{(userXP != null) ? userXP : <CircularProgress size={15} color='secondary' />} MXP</p>
          </div>
          )
        : <></>}
    </>
  )
}
