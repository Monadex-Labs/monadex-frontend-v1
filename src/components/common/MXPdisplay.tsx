'use client'
import gem from '@/static/assets/gem.svg'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useFetchUserXP } from '@/discord/hooks/useFetchUser'
export const Mxpdisplay:React.FC = () => {
  const {data: session} = useSession()
  const {isLoading, userXP} = useFetchUserXP(session)
  console.log('ICI',userXP)
  return (
    <div className='flex border border-secondary1/50 px-3  rounded-full items-center bg-secondary1'>
    <Image src={gem} width={50} height={50} alt='gem image'/>
     <p className='p-2 text-sm font-semibold italic'>{userXP} MXP</p>       
    </div>
    )
}