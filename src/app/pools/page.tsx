'use client'
import Pools from '@/components/Pools/Pools'
const Pool = (): JSX.Element => {

  return (
    <div className='container mx-auto mt-10'>
      {/* <Link href='pools/new' className='border-2 px-4 py-2 text-primary border-primary rounded-md '>create new position</Link> */}
      <Pools/>
    </div>
  )
}

export default Pool
