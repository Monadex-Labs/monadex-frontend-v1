import { Box, Fade, Backdrop, Modal } from '@mui/material'
import { cn } from '@/utils/cn'
interface CustomModalProps {
  open: boolean
  onClose?: () => void
  children: any
  background?: string
  overflow?: string
  modalWrapper?: string
  hideBackdrop?: boolean
  classname?: string
}

const CustomModal: React.FC<CustomModalProps> = ({
  open,
  onClose,
  children,
  background,
  overflow,
  modalWrapper,
  hideBackdrop,
  classname
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      slots={hideBackdrop != null && hideBackdrop ? undefined : { backdrop: Backdrop }}
      slotProps={
        hideBackdrop != null && hideBackdrop
          ? undefined
          : {
              backdrop: {
                timeout: 500,
                className: 'backdrop-filter backdrop-blur-[9.9px] bg-opacity-30 bg-white'
              }
            }
      }
    >
      <Fade in={open}>
        <Box
          className={cn(`${modalWrapper ?? ''} m-0 p-0 max-w-[700px] max-h-[80vh] overflow-hidden w-full absolute top-1/2 left-1/2 rounded-[10px] transform -translate-x-1/2 -translate-y-1/2 outline-none border border-primary bg-bgColor`, classname)}
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
