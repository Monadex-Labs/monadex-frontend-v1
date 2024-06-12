import { Box, Fade } from '@mui/material'
import { Modal } from '@mui/base'

interface CustomModalProps {
  open: boolean
  onClose?: () => void
  children: any
  background?: string
  overflow?: string
  modalWrapper?: string
}

const CustomModal: React.FC<CustomModalProps> = ({
  open,
  onClose,
  children,
  background,
  overflow,
  modalWrapper
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
    >
      <Fade in={open}>
        <Box
          className={`${modalWrapper != null ? modalWrapper : ''} modalWrapperV3`}
          bgcolor={background}
          overflow={overflow}
        >
          {children}
        </Box>
      </Fade>
    </Modal>
  )
}

export default CustomModal
