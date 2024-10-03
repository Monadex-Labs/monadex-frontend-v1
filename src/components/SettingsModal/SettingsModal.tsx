'use client'
import React, { useState, useMemo, useEffect } from 'react'
import { Box, Divider } from '@mui/material'
import { QuestionHelper, CustomModal, NumericalInput } from '@/components'
import { useSwapActionHandlers } from '@/state/swap/hooks'
import { useUserSlippageTolerance, useSlippageManuallySet, useUserTransactionTTL } from '@/state/user/hooks'
import { IoMdClose, IoMdWarning } from 'react-icons/io'
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
  defaultSlippage?: number
}
const SettingsModal: React.FC<SettingsModalProps> = ({ open, onClose, defaultSlippage = 0 }) => {
  const [userSlippageTolerance, setUserSlippageTolerance] = useUserSlippageTolerance()
  const [slippageManuallySet, setSlippageManuallySet] = useSlippageManuallySet()
  const [ttl, setTtl] = useUserTransactionTTL()
  const { onRecipientChange } = useSwapActionHandlers()
  const [slippageInput, setSlippageInput] = useState('')
  const [deadlineInput, setDeadlineInput] = useState('')
  const userSlippageIsSet = !!userSlippageTolerance
  useEffect(() => {
    if (!userSlippageIsSet && defaultSlippage > 0) {
      setUserSlippageTolerance(defaultSlippage)
    }
  }, [defaultSlippage, setUserSlippageTolerance, userSlippageIsSet])

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
    <CustomModal open={open} onClose={onClose} classname='p-6 max-w-[500px]'>
      <Box mb={3} className='flex items-center justify-between'>
        <h5 className='font-semibold text-xl'>Settings</h5>
        <IoMdClose onClick={onClose} size={24} />
      </Box>
      <Box my={2.5} className='flex items-center'>
        <Box mr='6px'>
          <p className='text-textSecondary'>Slippage tolerance</p>
        </Box>
        <QuestionHelper size={20} text='Your transaction will revert if the price changes unfavorably by more than this percentage' />
      </Box>
      <Box mb={2.5}>
        <Box className='flex items-center p-2 gap-2'>
          <Box
            className={`w-[62px] h-10 rounded-md border border-secondary2 flex items-center justify-center cursor-pointer mr-4 ${
                userSlippageTolerance === SLIPPAGE_AUTO
                  ? 'bg-primary'
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
            className={`w-[62px] h-10 rounded-md border border-secondary2 flex items-center justify-center cursor-pointer mr-4 ${
                userSlippageTolerance === 10 ? ' bg-primary' : ''
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
            className={`w-[62px] h-10 rounded-md border border-secondary2 flex items-center justify-center cursor-pointer mr-4 ${
                userSlippageTolerance === 50 ? 'bg-primary' : ''
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
            className={`w-[62px] h-10 rounded-md border border-secondary2 flex items-center justify-center cursor-pointer mr-4 ${
                userSlippageTolerance === 100 ? ' bg-primary' : ''
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
            className={`flex h-10 rounded-md px-0 py-8 flex-1 items-center bg-bgColor ${
                slippageAlert ? 'border-yellow' : 'border-secondary1'
              }`}
          >
            {slippageAlert && <IoMdWarning className='text-yellow' size={25} />}
            <NumericalInput
              className='w-full relative outline-none whitespace-nowrap text-ellipsis overflow-hidden text-left border-b border-primary bg-transparent mr-1'
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
            <small className='text-yellow'>
              {slippageError === SlippageError.InvalidInput
                ? 'Enter a valid slippage percentage'
                : slippageError === SlippageError.RiskyLow
                  ? 'Your transaction may fail'
                  : 'Your transaction may be frontrun'}
            </small>
          </Box>
        )}
      </Box>
      <Divider className='bg-primary' />
      <Box my={2.5} className='flex items-center'>
        <Box mr='6px'>
          <p className='text-textSecondary'>Transaction Deadline</p>
        </Box>
        <QuestionHelper size={20} text='Your transaction will revert if it is pending for more than this long.' />
      </Box>
      <Box mb={2.5} className='flex items-center gap-3'>
        <Box className='flex h-10 rounded-md px-0 py-8 flex-1 items-center bg-bgColor' maxWidth={168}>
          <NumericalInput
            className='w-full relative outline-none whitespace-nowrap rounded-md text-ellipsis overflow-hidden text-left bg-primary px-3 text-2xl'
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
          <small className='text-yellow'>Enter a valid deadline</small>
        </Box>
      )}
    </CustomModal>
  )
}
export default SettingsModal
