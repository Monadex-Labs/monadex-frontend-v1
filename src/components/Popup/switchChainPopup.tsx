'use client'
import Image from 'next/image'
import CustomModal from '../CustomModal/CustomModal'
import { Box, Divider } from '@mui/material'
import { Modal } from '@mui/base'
import { useWalletData, useSwitchNetwork } from '@/utils/index'
import Molandak from '@/static/assets/hedgehog.png'
import MonadLogo from '@/static/assets/monad_logo.png'
import unknownLogo from '@/static/assets/unknown_logo.png'
import { FaArrowRight } from 'react-icons/fa'

interface SettingsModalProps {
  open: boolean
  onClose: () => void
}

export const SwitchChainPopUp: React.FC<SettingsModalProps> = ({ open, onClose }): JSX.Element => {
  const { networkName } = useWalletData()
  const { switchNetwork } = useSwitchNetwork()
  return (
    <CustomModal 
    classname='border max-w-[400px] rounded-md border-primary border-2 p-4 bg-bgColor transition duration-300'
    open={open} 
    onClose={onClose}>
      <Box className=''>

        <Box className=''>
          <Box className='flex flex-col items-center justify-center'>
            <Image src={Molandak} alt='hedgehog' width={150} height={150} />
            <h1 className='text-white text-md font-semibold'>This chain is unsupported</h1>
            <h4 className='text-white text-sm font-light text-center mt-4 opacity-70'>{networkName === 'unknown' ? 'this Chain' : networkName} is unsupported please switch to Monad to continue</h4>
            <Box className='flex items-center justify-center gap-4 mt-4'>
              <Image src={unknownLogo} alt='monad' width={30} height={30} />
              <FaArrowRight />
              <Image src={MonadLogo} alt='monad' width={30} height={30} />

            </Box>
            <button
              className='bg-primary hover:bg-primary/50 text-white focus:shadow-md text-sm px-5 py-2.5 text-center w-full mt-4 rounded-sm'
              onClick={switchNetwork}
            >
              Switch network
            </button>
          </Box>

        </Box>
      </Box>
    </CustomModal>
  )
}
