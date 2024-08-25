'use client'
import Image from 'next/image'
import Monadex from '@/static/assets/mona_logo.svg'
import Monadex_mobile from '@/static/assets/Dex_logo_Mobile.svg'
import { ConnectButton } from '@/components/common'
import { useMediaQuery, useTheme, Box } from '@mui/material'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import DropdownMenu from '../common/DropDownMenu'
import { Mxpdisplay } from '../common/MXPdisplay'
import { useSession } from 'next-auth/react'
const Header: React.FC<any> = () => {
  const theme = useTheme()
  const {status} = useSession()
  const tabletWindowSize = useMediaQuery(theme.breakpoints.down('md'))
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
    <Box className='flex items-center justify-between p-4 gap-3'>
    <Box className="flex-grow-[0.2] p-2">
      {tabletWindowSize && (
        <Image src={Monadex_mobile} priority alt='MonadexLogo' className='cursor-pointer' onClick={() => router.push('/')} width={50} height={50} />
      )}
      {!tabletWindowSize && (
        <Image src={Monadex} priority alt='MonadexLogo' className='cursor-pointer' onClick={() => router.push('/')} width={180} height={180} />
      )}
    </Box>
    <div className='flex-grow flex justify-center p-2'>
      <div className='flex gap-6 p-2'>
        {paths.map((k, v) => {
          return (
            <Link
              className={`text-gray-500 active:text-primary font-medium hover:text-primary text-md transition-all ${k.id === 'Docs' ? 'underline underline-offset-2 decoration-dotted' : ''}`}
              key={v}
              href={k.path}
            >
              {k.name}
            </Link>
          )
        })}
      </div>
    </div>
    <div className='flex gap-6 items-center flex-grow-1 p-2'>
       <Mxpdisplay/>
      <DropdownMenu />
      <ConnectButton />
    </div>
  </Box>
  )
}
export default Header
