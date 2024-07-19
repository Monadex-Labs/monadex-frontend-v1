import { ChainId } from '@monadex/sdk'
import { Box, Button } from '@mui/material'
import { CustomModal } from '@/components'
import { Close, CheckCircleOutline } from '@mui/icons-material'
import { useWalletData } from '@/utils'
import Image from 'next/image'
import rejected from '@/static/assets/rejected.webp'
import Molandak from '@/static/assets/hedgehog.png'
import checkMark from '@/static/assets/checkmark.svg'
import { TailSpin } from 'react-loader-spinner'

interface useConfirmationPendingContentProps {
  title: string
  pending?: string
  confirm: string
}
export const useConfirmationPendingContent = (pendingText?: string): useConfirmationPendingContentProps => {
  return {
    title: 'Waiting For Confirmation',
    pending: pendingText,
    confirm: 'Please confirm this transaction in your wallet.'
  }
}
interface ConfirmationPendingContentProps {
  onDismiss: () => void
  pendingText?: string
}

export const ConfirmationPendingContent: React.FC<ConfirmationPendingContentProps> = ({
  onDismiss,
  pendingText
}) => {
  const confirmationPendingContent = useConfirmationPendingContent(pendingText)

  return (
    <Box padding={4} overflow='hidden'>
      <Box className='mb-6 flex justify-between'>
      <h5 className='text-lg font-medium'>{confirmationPendingContent.title}</h5>

        <Close onClick={onDismiss} className='text-sm' />
      </Box>
      <Box className='flex justify-center'>
        <Image className='animate-spin' src={Molandak} width={150} alt='molandak'/>
      </Box>
      <Box className='p-2 text-center'>
        {confirmationPendingContent.pending && (
          <p className='font-base'>{confirmationPendingContent.pending}</p>
        )}
        <p className='text-sm mt-2'>{confirmationPendingContent.confirm || ''}</p>
      </Box>
    </Box>
  )
}

interface TransactionSubmittedContentProps {
  onDismiss: () => void
  hash: string | undefined
  chainId: ChainId
  modalContent: string
  txPending?: boolean
}

export const TransactionSubmittedContent: React.FC<TransactionSubmittedContentProps> = ({
  onDismiss,
  chainId,
  hash,
  txPending,
  modalContent
}) => {
  return (
    <Box padding={2}>
      <Box className='text-end p-2'>
        <Close onClick={onDismiss} />
      </Box>
      <Box className='border' mt={3}>
        <p>
          {!txPending && <CheckCircleOutline />}
          {modalContent}
          <Image src={checkMark} width={200} alt='ok'></Image>
        </p>
      </Box>
      <Box className='flex justify-between border' mt={3}>
        {chainId && hash && (
          <a
            href='' // TODO: Add Etherscan link with address
            target='_blank'
            rel='noopener noreferrer'
            style={{ width: '48%', textDecoration: 'none' }}
          >
            <Button className='txSubmitButton'>View Transaction</Button>
          </a>
        )}
        <Button
          className='txSubmitButton'
          style={{ width: '48%' }}
          onClick={onDismiss}
        >
          Close
        </Button>
      </Box>
    </Box>
  )
}
// }

interface ConfirmationModalContentProps {
  title: string
  onDismiss: () => void
  content: () => React.ReactNode
}

export const ConfirmationModalContent: React.FC<ConfirmationModalContentProps> = ({
  title,
  onDismiss,
  content
}) => {
  return (
    <Box padding={4}>
      <Box className='border'>
        <h5>{title}</h5>
        <Close onClick={onDismiss} />
      </Box>
      {content()}
    </Box>
  )
}

interface TransactionErrorContentProps {
  message: string
  onDismiss: () => void
}

export const TransactionErrorContent: React.FC<TransactionErrorContentProps> = ({
  message,
  onDismiss
}) => {
  return (
    <Box padding={2} >
      <Box>
        <Box className='flex justify-between'>
          <h5 className='text-lg font-medium'>error</h5>
          <Close onClick={onDismiss} />
        </Box>
        <Box className='flex justify-center items-center flex-col mb-3 mt-3'>
          <p className='text-lg font-medium'>{message}</p>
          <Image src={rejected} width={200} alt='rejected'></Image>
        </Box>
      </Box>
      <Button 
      className=' text-white bg-gradient-to-r from-[#23006A] to-[#23006A]/50 focus:outline-none font-medium rounded-md text-sm px-5 py-2.5 text-center w-full'
      onClick={onDismiss}

      >
        dismiss
      </Button>
    </Box>
  )
}

interface ConfirmationModalProps {
  isOpen: boolean
  onDismiss: () => void
  hash: string | undefined
  content: () => React.ReactNode
  attemptingTxn: boolean
  pendingText?: string
  modalContent: string
  txPending?: boolean
  modalWrapper?: string
  isTxWrapper?: boolean
}

const TransactionConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onDismiss,
  attemptingTxn,
  txPending,
  hash,
  pendingText,
  content,
  modalContent,
  modalWrapper,
  isTxWrapper = true
}) => {
  const { chainId } = useWalletData()

  if (chainId === undefined) return null

  // confirmation screen
   return (
    <CustomModal
    classname='max-w-[400px] border-none'
      open={isOpen}
      onClose={onDismiss}
      modalWrapper={`${modalWrapper ?? 'INVALID WRAPPER'}${isTxWrapper ? ' txModalWrapper' : ''}`}
    >
      <Box position='relative' zIndex={2} className=''>
        {attemptingTxn
          ? (
            <ConfirmationPendingContent
              onDismiss={onDismiss}
              pendingText={pendingText}
            />
            )
          : hash
            ? (
              <TransactionSubmittedContent
                chainId={chainId}
                txPending={txPending}
                hash={hash}
                onDismiss={onDismiss}
                modalContent={modalContent}
              />
              )
            : (
                content()
              )}
      </Box>
    </CustomModal>
  )
}

export default TransactionConfirmationModal
