import { ChainId } from '@monadex/sdk'
import { Box, Button } from '@mui/material'
import { CustomModal } from '@/components'
import { Close, CheckCircleOutline } from '@mui/icons-material'
import { useWalletData } from '@/utils'
import Image from 'next/image'
import Molandak from '@/static/assets/hedgehog.png'
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

        <Close onClick={onDismiss} />
      </Box>
      <Box className='flex justify-center'>
        <Image className='animate-spin' src={Molandak} width={200} alt='molandak'/>
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
    <Box padding={4}>
      <Box className='txModalHeader'>
        <h5>{txPending != null ? 'Transaction Submitted' : 'Transaction Completed'}</h5>
        <Close onClick={onDismiss} />
      </Box>
      <Box className='txModalContent txModalContentSuccess'>
        <p>
          {txPending === null && <CheckCircleOutline />}
          {modalContent}
        </p>
      </Box>
      <Box className='flex justify-between' mt={2}>
        {chainId != null && hash != null && (
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
    <Box padding={4}>
      <Box>
        <Box className='txModalHeader'>
          <h5 className='text-error'>Error!</h5>
          <Close onClick={onDismiss} />
        </Box>
        <Box className='txModalContent flex items-center flex-col'>
          <p>{message}</p>
        </Box>
      </Box>
      <Button className='txSubmitButton' onClick={onDismiss}>
        Close
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
    classname='max-w-[500px] border border-orange-300'
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
