"use client";
import Image from 'next/image'
import Monadex from '@/static/assets/Dex_logo.svg'
import Monadex_mobile from '@/static/assets/Dex_logo_mobile.svg'
import { WalletButton } from '../common/Button'
import { useMediaQuery, useTheme, Box } from '@mui/material'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
const Header: React.FC<any> = () => {
  const theme = useTheme()
  const tabletWindowSize = useMediaQuery(theme.breakpoints.down('md'))
  const router = useRouter()
  const paths = [
    {
      id: 'swap-page',
      name: 'Swap',
      path: '/'
    },
    {
      name: 'Pools',
      path: '/pools'
    },
    {
      id: 'Raffle-page',
      name: 'Raffle',
      path: '/raffle'
    },
    {
      id: 'Docs',
      name: 'docs',
      path: 'https://monadex.gitbook.io/monadex'
    }
  ]
  return (
    <Box className='flex justify-between items-center p-4'>
      <Box>
        {tabletWindowSize && (
          <Image src={Monadex_mobile} alt='MonadexLogo' className='cursor-pointer' onClick={() => router.push('/')} width={80} height={80} />
        )}
        {!tabletWindowSize && (
          <Image src={Monadex} alt='MonadexLogo' className='cursor-pointer' onClick={() => router.push('/')} width={230} height={230} />
        )}
      </Box>
      <div className='flex gap-6 p-2'>
        {paths.map((k,v) => {
          return (
            <Link
              className={`text-gray-500 active:text-[#836EF9] font-medium hover:text-[#836EF9] text-md transition-all ${k.id === 'Docs' ? 'underline underline-offset-2 decoration-dotted' : ''}`}
              key={v}
              href={k.path}
            >
              {k.name}
            </Link>
          )
        })}
      </div>
      <div>
        <WalletButton />
      </div>
    </Box>
  )
}
export default Header
