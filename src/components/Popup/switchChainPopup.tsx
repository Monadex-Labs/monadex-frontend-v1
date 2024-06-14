'use client'
import Image from 'next/image'
import CustomModal from '../CustomModal/CustomModal'
import { Box } from '@mui/material'
import { useWalletData, useSwitchNetwork } from '@/utils/index'
import Molandak from '@/static/assets/hedgehog.png'
import { useState } from 'react'
import { ButtonPrimary } from '../common/Button'
interface SettingsModalProps {
  open: boolean
  onClose: () => void
}

const switchChainPopUp: React.FC<SettingsModalProps> = ({ open, onClose }) => {
  const { networkName } = useWalletData()
  const [switchingChain, setSwitchingChain] = useState(false)

  return (
    <CustomModal open={open} onClose={onClose}>
      <Box className='border'>
        <h4>{networkName !== 'unknown' ? networkName : 'this Chain'} is unsopported please switch to Monad testnet nerwork</h4>
        <Image src={Molandak} alt='hedgehog' width={300} height={300} />
        <ButtonPrimary
          onClick={() => useSwitchNetwork()}
        >
          Switch to Monad
        </ButtonPrimary>
      </Box>
    </CustomModal>
  )
}
export default switchChainPopUp
