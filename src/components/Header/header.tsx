'use client'
import Image from 'next/image'
import { Logo } from '@/components/index'
import Monadex from '@/static/assets/Dex_logo.svg'
import Monadex_mobile from '@/static/assets/Dex_logo_mobile.svg'
const Header: React.FC<any> = () => {
  return (
    <header>
      <div>
        <Image src={Monadex} alt='logo' />
      </div>
    </header>
  )
}
export default Header
