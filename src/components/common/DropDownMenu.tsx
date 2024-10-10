'use client'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { IoEllipsisHorizontal } from 'react-icons/io5'
import { SignIn, SignOut } from '@/discord/buttons-actions'
import { useSession } from 'next-auth/react'
export default function DropDownMenu ():JSX.Element {
  const { status } = useSession()
  console.log('status', status)
  return (
    <Menu as='div' className='relative inline-block text-left' translate='yes'>
      <div>
        <MenuButton className='inline-flex w-full justify-center text-md'>
          <IoEllipsisHorizontal className='text-xl text-gray-500' />
        </MenuButton>
      </div>

      <MenuItems
        transition
        className='absolute right-0 z-10 mt-2 w-[190px] origin-top-right transition focus:outline-none bg-bgColor shadow-sm rounded-md p-2'
      >
        <div className='py-1 transition'>

          <MenuItem>
            {status === 'authenticated'
              ? (
                <SignOut />
                )
              : (
                <SignIn />
                )}
          </MenuItem>
          <MenuItem>
            <a
              href='https://x.com/Monadex_labs'
              className='block  py-2 text-sm text-white/60 data-[focus]:text-gray-100'
            >
              Twitter
            </a>
          </MenuItem>
          <MenuItem>
            <a
              href='https://github.com/Monadex-Labs'
              className='block px-4 py-2 text-sm text-white/60  data-[focus]:text-gray-100'
            >
              Github
            </a>
          </MenuItem>
          <MenuItem>
            <a
              href='https://monadex.gitbook.io/monadex'
              className='block px-4 py-2 text-sm text-white/60 data-[focus]:text-gray-100'
            >
              Docs
            </a>
          </MenuItem>
          <MenuItem>
            <a
              href='https://monadex.gitbook.io/monadex'
              className='block px-4 py-2 text-sm text-white/60 data-[focus]:text-gray-100'
            >
              Discord
            </a>
          </MenuItem>
        </div>
      </MenuItems>
    </Menu>
  )
}
