'use client'
import Image from 'next/image'
import Monadex from '@/static/assets/mona_logo.svg'
import Monadex_mobile from '@/static/assets/Dex_logo_Mobile.svg'
import { ConnectButton } from '@/components/common'
import { useMediaQuery, useTheme, Box } from '@mui/material'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import DropdownMenu from '../common/DropDownMenu'
import { Mxpdisplay } from '../common/MXPdisplay'

const Header: React.FC<any> = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const pathname = usePathname()
  const router = useRouter()
  const paths = [
    {
      id: 'swap-page',
      name: 'Swap',
      path: '/'
    },
    {
      id: 'Pools-page',
      name: 'Pools',
      path: '/pools'
    },
    {
      id: 'Raffle-page',
      name: 'Raffle',
      path: '/raffle'
    },
    {
      id: 'Portfolio-page',
      name: 'Portfolio',
      path: '/portfolio'
    }
  ]
  return (
    <Box className={`flex justify-between w-[95%] mx-auto ${isMobile ? 'hidden' : ''}`}>
      <div className='flex flex-col sm:flex-row items-center justify-between p-2 sm:p-4 gap-8'>
        <Box className='w-full sm:w-auto flex justify-center sm:justify-start'>
          <Image
            src={isMobile ? Monadex_mobile : Monadex}
            priority
            alt='MonadexLogo'
            className='cursor-pointer'
            onClick={() => router.push('/')}
            width={isMobile ? 50 : 200}
            height={isMobile ? 50 : 200}
          />
        </Box>

        <Box className=''>
          <nav className='flex flex-wrap justify-center sm:gap-6 ml-2'>
            {paths.map((k, v) => (
              <Link
                className={`
                  text-gray-500 font-medium text-lg sm:text-md transition-all
                  hover:text-primary focus:text-primary
                  ${pathname === k.path ? 'text-primary' : ''}
                  ${k.id === 'Docs' ? 'underline underline-offset-2 decoration-dotted' : ''}
                `}
                key={v}
                href={k.path}
              >
                {k.name}
              </Link>
            ))}
          </nav>
        </Box>
      </div>
      <Box className='w-full sm:w-auto flex justify-center sm:justify-end items-center gap-3 sm:gap-6 order-2 sm:order-3 mt-4 sm:mt-0'>
        <DropdownMenu />
        {!isMobile && <Mxpdisplay />}
        <ConnectButton />
      </Box>
    </Box>
  )
}
export default Header
