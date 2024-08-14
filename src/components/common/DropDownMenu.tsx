import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { IoEllipsisHorizontal } from 'react-icons/io5'
import {SignIn}  from '@/discord/buttons-actions'
export default function Example() {
    return (
      <Menu as="div" className="relative inline-block text-right">
        <div>
          <MenuButton className="inline-flex w-full justify-center text-md">
          <IoEllipsisHorizontal className='text-md text-gray-500'/>
          </MenuButton>
        </div>
  
        <MenuItems
          transition
          className="absolute right-0 z-10 mt-2 w-56 origin-top-right transition focus:outline-none"
        >
          <div className="py-1 transition">
              <MenuItem>
                <SignIn/>
              </MenuItem>
            <MenuItem>
              <a
                href="https://x.com/Monadex_labs"
                className="block px-4 py-2 text-sm text-gray-700 data-[focus]:text-gray-100"
              >
                twitter
              </a>
            </MenuItem>
            <MenuItem>
              <a
                href="https://github.com/Monadex-Labs"
                className="block px-4 py-2 text-sm text-gray-700 data-[focus]:text-gray-100"
              >
                github
              </a>
            </MenuItem>
            <MenuItem>
              <a
                href="https://monadex.gitbook.io/monadex"
                className="block px-4 py-2 text-sm text-gray-700 data-[focus]:text-gray-100"
              >
                docs
              </a>
            </MenuItem>
          </div>
        </MenuItems>
      </Menu>
    )
  }