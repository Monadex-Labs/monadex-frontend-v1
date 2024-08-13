'use client'
import Link from 'next/link'
const Pool = (): JSX.Element => {
  return (
    <div className='container mx-auto mt-10'>
      <Link href='/new' className='border-2 px-4 py-2 text-primary border-primary rounded-md '>create new position</Link>
    </div>
  )
}

export default Pool
