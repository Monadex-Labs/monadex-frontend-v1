import { Box, Fade, Backdrop } from '@mui/material'
import { Modal } from '@mui/base'

interface CustomModalProps {
  open: boolean
  onClose?: () => void
  children: any
  background?: string
  overflow?: string
  modalWrapper?: string
  hideBackdrop?: boolean
}

const CustomModal: React.FC<CustomModalProps> = ({
  open,
  onClose,
  children,
  background,
  overflow,
  modalWrapper,
  hideBackdrop
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      BackdropComponent={hideBackdrop ? undefined : Backdrop}
      BackdropProps={
        hideBackdrop
          ? undefined
          : { timeout: 500, classes: { root: 'backdrop-opacity-10 backdrop-invert bg-white/30' } }
      }
    >
      <Fade in={open}>
        <Box
          className={`${modalWrapper != null ? modalWrapper : ''} border max-w-fit rounded-md border-[#836EF9] border-2 p-4 transition duration-300 bg-[#23006A]`}
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
