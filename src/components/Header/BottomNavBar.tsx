'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HiArrowPath, HiFolder } from 'react-icons/hi2'
import { IoTicketSharp } from 'react-icons/io5'
import { IoIosWater } from 'react-icons/io'

const paths = [
  {
    id: 'swap-page',
    name: 'Swap',
    path: '/',
    logo: <HiArrowPath />
  },
  {
    id: 'Pools-page',
    name: 'Pools',
    path: '/pools',
    logo: <IoIosWater />
  },
  {
    id: 'Raffle-page',
    name: 'Raffle',
    path: '/raffle',
    logo: <IoTicketSharp />
  },
  {
    id: 'Portfolio-page',
    name: 'Portfolio',
    path: '/portfolio',
    logo: <HiFolder />
  }
]

const BottomNavBar: React.FC = () => {
  const pathname = usePathname()

  return (
    <nav className='fixed bottom-0 left-0 right-0 bg-darkPurple border-t border-gray-800 md:hidden z-50'>
      <ul className='flex justify-around items-center h-16'>
        {paths.map((item) => (
          <li key={item.id} className='flex-1'>
            <Link
              href={item.path}
              className={`flex flex-col items-center justify-center h-full ${
                pathname === item.path ? 'text-primary' : 'text-gray-400'
              }`}
            >
              <span className='text-xl mb-1'>{item.logo}</span>
              <span className='text-xs'>{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default BottomNavBar
