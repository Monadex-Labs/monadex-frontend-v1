'use client'
import Image from 'next/image'
import Monadex from '@/static/assets/Dex_logo.svg'
import Monadex_mobile from '@/static/assets/Dex_logo_mobile.svg'
import { WalletButton } from '../common/Button'
const Header: React.FC<any> = () => {
  return (
    <header className='flex justify-between'>
      <div>
        <Image src={Monadex} alt='logo' />
      </div>
      <div>
        <WalletButton />
      </div>
    </header>
  )
}
export default Header
