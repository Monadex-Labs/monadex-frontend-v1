'use client'
import React from 'react'
import Audio from '../common/Audio'
import { useBlockNumber } from '@/state/application/hooks'
import Footer_logo from '@/static/assets/Dex_logo.svg'
import Image from 'next/image'
import Link from 'next/link'
const Footer:React.FC = () => {
   const blockNumber = useBlockNumber()
   return (

    <div className='p-4  mt-10'>
    <div className='flex justify-around p-4  max-w-[90%] mx-auto'>
         <section className='flex  p-2 flex-col'>
            <h3 className='text-gray-400'>Community</h3>
            <Link href={'#'} className='text-white font-medium'>Discord</Link>
            <Link href={'#'} className='text-white font-medium'>Twitter</Link>
         </section >
         <section className='flex  p-2 flex-col'>
            <h3 className='text-gray-400'>News</h3>
            <Link href={'#'} className='text-white font-medium'>Twitter</Link>
         </section>
         <section className='flex  p-2 flex-col'>
            <h3 className='text-gray-400'>Ressources</h3>
            <Link href={'#'} className='text-white font-medium'>Github</Link>
            <Link href={'#'} className='text-white font-medium'>Docs</Link>
         </section>
         <section className='flex p-2 flex-col'>
            <h3 className='text-gray-400'>Links</h3>
            <Link href={'#'} className='text-white font-medium'>Bridge</Link>
            <Link href={'#'} className='text-white font-medium'>Block Explorer</Link>
            <Link href={'#'} className='text-white font-medium'>Home</Link>
         </section>
    </div>
   {blockNumber ? (
       <div className='flex items-center justify-end'>
       <Audio/>
       <p className='text-end text-sm font-fira'>{blockNumber}</p>
     </div>
   ): null}
    </div>
   )
}


export default Footer