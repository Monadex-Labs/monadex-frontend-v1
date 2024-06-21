'use client'
import React, { useState, useMemo } from 'react'
import { Box, Divider } from '@mui/material'
import { FiAlertTriangle } from 'react-icons/fi'
import { QuestionHelper, CustomModal, NumericalInput } from '@/components'
import { useSwapActionHandlers } from '@/state/swap/hooks'
import { useUserSlippageTolerance, useSlippageManuallySet, useUserTransactionTTL } from '@/state/user/hooks'
import { IoMdCloseCircleOutline } from 'react-icons/io'
import { SLIPPAGE_AUTO } from '@/constants'

enum SlippageError {
  InvalidInput = 'InvalidInput',
  RiskyLow = 'RiskyLow',
  RiskyHigh = 'RiskyHigh',
}

enum DeadlineError {
  InvalidInput = 'InvalidInput',
}

interface SettingsModalProps {
  open: boolean
  onClose: () => void
}
const SettingsModal: React.FC<SettingsModalProps> = ({ open, onClose }) => {
  const [userSlippageTolerance, setUserSlippageTolerance] = useUserSlippageTolerance()
  const [slippageManuallySet, setSlippageManuallySet] = useSlippageManuallySet()
  const [ttl, setTtl] = useUserTransactionTTL()
  const { onRecipientChange } = useSwapActionHandlers()
  const [slippageInput, setSlippageInput] = useState('')
  const [deadlineInput, setDeadlineInput] = useState('')

  const slippageInputIsValid =
  slippageInput === '' ||
  (userSlippageTolerance / 100).toFixed(2) ===
    Number.parseFloat(slippageInput).toFixed(2)
  const deadlineInputIsValid =
  deadlineInput === '' || (ttl / 60).toString() === deadlineInput

  const slippageError = useMemo(() => {
    if (slippageInput !== '' && !slippageInputIsValid) {
      return SlippageError.InvalidInput
    } else if (userSlippageTolerance === SLIPPAGE_AUTO) {
      return undefined
    } else if (slippageInputIsValid && userSlippageTolerance < 50) {
      return SlippageError.RiskyLow
    } else if (slippageInputIsValid && userSlippageTolerance > 500) {
      return SlippageError.RiskyHigh
    } else {
      return undefined
    }
  }, [slippageInput, userSlippageTolerance, slippageInputIsValid])
  const slippageAlert =
    !!slippageInput && // eslint-disable-line
    (slippageError === SlippageError.RiskyLow ||
    slippageError === SlippageError.RiskyHigh)

  const deadlineError = useMemo(() => { // eslint-disable-line
    if (deadlineInput !== '' && !deadlineInputIsValid) {
      return DeadlineError.InvalidInput
    } else {
      return undefined
    }
  }, [deadlineInput, deadlineInputIsValid])
  const parseCustomSlippage = (value: string) => {
    setSlippageInput(value)

    try {
      const valueAsIntFromRoundedFloat = Number.parseInt(
        (Number.parseFloat(value) * 100).toString()
      )
      if (
        !Number.isNaN(valueAsIntFromRoundedFloat) &&
        valueAsIntFromRoundedFloat < 5000
      ) {
        setUserSlippageTolerance(valueAsIntFromRoundedFloat)
        if (userSlippageTolerance !== valueAsIntFromRoundedFloat) {
          setSlippageManuallySet(true)
        }
      }
    } catch {}
  }
  const parseCustomDeadline = (value: string) => {
    setDeadlineInput(value)

    try {
      const valueAsInt: number = Number.parseInt(value) * 60
      if (!Number.isNaN(valueAsInt) && valueAsInt > 0) {
        setTtl(valueAsInt)
      }
    } catch {}
  }

  return (
    <CustomModal open={open} onClose={onClose} background='bg-[#836EF9]'>
      <Box mb={3} className='flex items-center justify-between'>
        <h5 className='text-xl '>Settings</h5>
        <IoMdCloseCircleOutline onClick={onClose} />
      </Box>
      <Divider />
      <Box my={2.5} className='flex items-center'>
        <Box mr='6px'>
          <p className='text-[#C6CACF]'>Slippage tolerance</p>
        </Box>
        <QuestionHelper size={20} text='Your transaction will revert if the price changes unfavorably by more than this percentage' />
      </Box>
      <Box mb={2.5}>
        <Box className='flex items-center p-2 gap-3'>
          <Box
            className={`border border-[#23232C] p-1 rounded-sm mr-4${
                userSlippageTolerance === SLIPPAGE_AUTO
                  ? 'bg-neutral-300'
                  : ''
              }`}
            onClick={() => {
              setSlippageInput('')
              setUserSlippageTolerance(SLIPPAGE_AUTO)
              if (userSlippageTolerance !== SLIPPAGE_AUTO) {
                setSlippageManuallySet(true)
              }
            }}
          >
            <small>AUTO</small>
          </Box>
          <Box
            className={`border border-[#23232C] p-1 rounded-sm mr-4${
                userSlippageTolerance === 10 ? ' activeSlippageButton' : ''
              }`}
            onClick={() => {
              setSlippageInput('')
              setUserSlippageTolerance(10)
              if (userSlippageTolerance !== 10) {
                setSlippageManuallySet(true)
              }
            }}
          >
            <small>0.1%</small>
          </Box>
          <Box
            className={`border border-[#23232C] p-1 rounded-sm mr-4${
                userSlippageTolerance === 50 ? 'bg-red-400' : ''
              }`}
            onClick={() => {
              setSlippageInput('')
              setUserSlippageTolerance(50)
              if (userSlippageTolerance !== 50) {
                setSlippageManuallySet(true)
              }
            }}
          >
            <small>0.5%</small>
          </Box>
          <Box
            className={`border border-[#23232C] p-1 rounded-sm mr-4${
                userSlippageTolerance === 100 ? ' activeSlippageButton' : ''
              }`}
            onClick={() => {
              setSlippageInput('')
              setUserSlippageTolerance(100)
              if (userSlippageTolerance !== 100) {
                setSlippageManuallySet(true)
              }
            }}
          >
            <small>1%</small>
          </Box>
          <Box
            className={`${
                slippageAlert ? 'border-primary' : 'border-secondary1'
              }`}
          >
            {slippageAlert && <FiAlertTriangle color='#836EF9' size={16} />}
            <NumericalInput
              placeholder={(userSlippageTolerance / 100).toFixed(2)}
              value={slippageInput}
              fontSize={14}
              fontWeight={500}
              align='right'
              onBlur={() => {
                parseCustomSlippage((userSlippageTolerance / 100).toFixed(2))
              }}
              onUserInput={(value) => parseCustomSlippage(value)}
            />
            <small>%</small>
          </Box>
        </Box>
        {slippageError && (
          <Box mt={1.5}>
            <small className='text-yellow-400'>
              {slippageError === SlippageError.InvalidInput
                ? 'enter valid slippage'
                : slippageError === SlippageError.RiskyLow
                  ? 'tx May Fail'
                  : 'tx May Be Frontrunned'}
            </small>
          </Box>
        )}
      </Box>
      <Divider />
      <Box my={2.5} className='flex items-center'>
        <Box mr='6px'>
            <p>Transaction Deadline </p>
          </Box>
        <QuestionHelper size={20} text='Your transaction will revert if it is pending for more than this long.' />
      </Box>
      <Box mb={2.5} className='flex items-center'>
          <Box className='settingsInputWrapper' maxWidth={168}>
            <NumericalInput
              placeholder={(ttl / 60).toString()}
              value={deadlineInput}
              fontSize={14}
              fontWeight={500}
              onBlur={() => {
                parseCustomDeadline((ttl / 60).toString())
              }}
              onUserInput={(value) => parseCustomDeadline(value)}
            />
          </Box>
          <Box ml={1}>
            <small>minutes</small>
          </Box>
        </Box>
      {deadlineError && (
          <Box mt={1.5}>
            <small className='text-yellow3'>Enter a valid deadline</small>
          </Box>
        )}
    </CustomModal>
  )
}
export default SettingsModal
