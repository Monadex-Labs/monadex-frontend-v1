'use client'
import Image from 'next/image'
import Monadex from '@/static/assets/mona_logo.svg'
import Monadex_mobile from '@/static/assets/Dex_logo_Mobile.svg'
import { ConnectButton } from '@/components/common'
import { useMediaQuery, useTheme, Box } from '@mui/material'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import DropdownMenu from '../common/DropDownMenu'
import { Mxpdisplay } from '../common/PointsDisplay'
import { HiArrowPath, HiFolder } from 'react-icons/hi2'
import { IoTicketSharp } from 'react-icons/io5'
import { IoIosWater } from 'react-icons/io'
import TicketModal from '../Raffles/ticketsDisplay'
const Header: React.FC<any> = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))

  const pathname = usePathname()
  const router = useRouter()
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
  return (
    <Box className='flex justify-between w-[95%] mx-auto items-center'>
      <div className='flex flex-col sm:flex-row items-center justify-between p-2 sm:p-4 gap-8'>
        <Box className='w-full sm:w-auto flex justify-center sm:justify-start'>
          <Image
            src={isTablet ? Monadex_mobile : Monadex}
            alt='MonadexLogo'
            className='cursor-pointer'
            onClick={() => router.push('/')}
            width={isTablet ? 40 : 150}
            height={isTablet ? 40 : 150}
          />
        </Box>

        <Box className={`${isTablet ? 'hidden' : ''}`}>
          <nav className='flex flex-wrap justify-center sm:gap-6 ml-2'>
            {paths.map((k, v) => (
              <div key={v} className='flex items-center'>
                {/* <p className='mr-3 text-lg text-white/60'>{k.logo}</p> */}
                <Link
                  className={`
                  text-gray-500 font-medium text-lg md:text-xl transition-all
                  hover:text-primary focus:text-primary
                  ${pathname === k.path ? 'text-primary' : ''}
                  ${k.id === 'Docs' ? 'underline underline-offset-2 decoration-dotted' : ''}
                `}
                  key={v}
                  href={k.path}
                >
                  {k.name}
                </Link>
              </div>
            ))}
          </nav>
        </Box>
      </div>
      <Box className='flex items-center gap-4'>
        <DropdownMenu />
        {!isTablet && <Mxpdisplay />}
        {!isTablet && <TicketModal />}
        <ConnectButton
          className='flex p-2 items-center justify-center gap-4 text-white bg-primary hover:bg-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/50 font-regular rounded-full text-sm px-5 py-2.5 text-center' 
        />
      </Box>
    </Box>
  )
}
export default Header
