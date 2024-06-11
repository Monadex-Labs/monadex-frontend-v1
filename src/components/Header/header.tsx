'use client'
import { Logo } from '@/components/index'
import Monadex from '@/static/assets/Dex_logo.svg'
const Header: React.FC<any> = () => {
  return (
    <header>
      <div>
        <Logo srcs={[Monadex]} alt='Logo' />
      </div>
    </header>
  )
}
export default Header
