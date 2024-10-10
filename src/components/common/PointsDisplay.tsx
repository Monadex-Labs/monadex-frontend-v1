'use client'
import gem from '@/static/assets/gem.svg'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useFetchUserXP } from '@/discord/hooks/useFetchUser'
import { CircularProgress } from '@mui/material'

export const Mxpdisplay: React.FC = () => {
  const { data: session } = useSession()
  const { userXP } = useFetchUserXP(session)

  return (
    <>
      {(userXP !== undefined && session !== undefined)
        ? (
          <div className='flex border border-darkPurple px-3  rounded-full items-center bg-secondary1'>
            <Image src={gem} width={50} height={50} alt='gem image' className='hidden lg:block' />
            <p className='p-2 text-sm font-semibold italic flex gap-2'>{(userXP != null) ? userXP : <CircularProgress size={15} color='secondary' />} MXP</p>
          </div>
          )
        : <></>}
    </>
  )
}
