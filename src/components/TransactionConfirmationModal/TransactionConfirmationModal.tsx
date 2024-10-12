import { ChainId } from '@monadex/sdk'
import { Box, CircularProgress } from '@mui/material'
import { Button } from '@mui/base'
import { CustomModal } from '@/components'
import { useWalletData } from '@/utils'
import Image from 'next/image'
import rejected from '@/static/assets/rejected.webp'
import Molandak from '@/static/assets/hedgehog.png'
import jimCheers from '@/static/assets/jim_cheers.png'
import { IoMdClose } from 'react-icons/io'

interface useConfirmationPendingContentProps {
  title: string
  pending?: string
  confirm: string
}
export const useConfirmationPendingContent = (pendingText?: string): useConfirmationPendingContentProps => {
  return {
    title: 'Waiting for Confirmation',
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
      <Box className='flex items-center justify-end relative mb-5'>
        <IoMdClose className='cursor-pointer z-10' size={24} onClick={onDismiss} />
      </Box>
      <Box className='flex justify-center my-5'>
        <Image className='animate-spin' src={Molandak} width={100} alt='molandak' />
      </Box>
      <Box className='p-2 text-center'>
        <h5 className='text-lg font-medium'>{confirmationPendingContent.title}</h5>
        {confirmationPendingContent.pending && (
          <p className='font-base'>{confirmationPendingContent.pending}</p>
        )}
        <p className='text-sm mt-2 font-medium opacity-40'>{confirmationPendingContent.confirm ?? ''}</p>
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
      <Box className='flex items-center justify-end relative mb-5'>
        <h5 className='absolute w-full text-center font-medium'>{txPending ? 'Transaction Submitted' : 'Transaction Completed'}</h5>
        <IoMdClose className='cursor-pointer z-10' size={24} onClick={onDismiss} />
      </Box>
      <Box className='mt-5 px-4 py-0 text-center flex flex-col justify-center items-center gap-5'>
        {txPending ? <CircularProgress size={60} /> : <Image src={jimCheers} width={200} alt='ok' />}
        <p>
          {modalContent}
        </p>
      </Box>
      <Box className='flex justify-between' mt={3}>
        {chainId && hash && (
          <a
            href='' // TODO: Add Etherscan link with address
            target='_blank'
            rel='noopener noreferrer'
            style={{ width: '48%', textDecoration: 'none' }}
          >
            <Button className=' w-full h-12 text-md rounded-md text-textPrimary bg-secondary1'>View Transaction</Button>
          </a>
        )}
        <Button
          className=' w-full h-12 text-md rounded-md text-textPrimary bg-secondary1'
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
  id?: string
}

export const ConfirmationModalContent: React.FC<ConfirmationModalContentProps> = ({
  id,
  title,
  onDismiss,
  content
}) => {
  return (
    <Box padding={4}>
      <Box className='flex items-center justify-end relative mb-5'>
        <h5 className='absolute w-full text-center font-medium'
          id={id}
        >{title}</h5>
        <IoMdClose className='cursor-pointer z-10' size={24} onClick={onDismiss} />
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
    <Box padding={2}>
      <Box>
        <Box className='flex items-center justify-end relative mb-5'>
          <h5 className='absolute w-full text-center font-medium'>Error</h5>
          <IoMdClose className='cursor-pointer z-10' size={24} onClick={onDismiss} />
        </Box>
        <Box className='flex justify-center items-center flex-col mb-3 mt-3'>
          <p className='text-lg font-medium break-all overflow-scroll max-h-44'>{message}</p>
          <Image src={rejected} width={150} alt='rejected' className='my-5' />
        </Box>
      </Box>
      <Button
        className=' text-white bg-secondary1 focus:outline-none font-medium rounded-md text-sm px-5 py-2.5 text-center w-full'
        onClick={onDismiss}
      >
        Dismiss
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
      modalWrapper={`${modalWrapper ?? 'INVALID WRAPPER'}${isTxWrapper ? ' max-w-[400px]' : ''}`}
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
