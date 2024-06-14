'use client'
import CustomModal from '../CustomModal/CustomModal'
import { Box } from '@mui/material'
interface SettingsModalProps {
    open: boolean
    onClose: () => void
}

const switchChainPopUp: React.FC<SettingsModalProps> = ({ open, onClose }) => {
 return (
  <CustomModal open={open} onClose={onClose}>

  </CustomModal>
  )
}
export default switchChainPopUp

