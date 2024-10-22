'use client'
import { useState } from 'react'
import { HiX } from 'react-icons/hi'

export default function CautionBanner (): JSX.Element {
  const [remove, setRemove] = useState<boolean>(false)
  return (
    <>
      {!remove
        ? (
          <section
            className='flex font-regular justify-center items-center p-2 bg-primary/50 gap-5'
          >
            <p className='text-white/80'>Always verify you're on the correct website:  <span className='font-clash text-white'> https://app.monadex.exchange </span> Bookmark the URL</p>
            <HiX
              size={20}
              onClick={() => setRemove(true)}
              className='cursor-pointer'
            />
          </section>
          )
        : <></>}
    </>
  )
}
