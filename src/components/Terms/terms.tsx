'use client'
import React, { ReactNode, useEffect, useState } from 'react'
import CustomModal from '../CustomModal'
import { Box, Button, Checkbox } from '@mui/material'

export default function Terms ({ children }: { children: ReactNode }): JSX.Element {
  const [readTerms, setReadTerms] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const currentTOSVersion = process.env.REACT_APP_TOS_VERSION

  useEffect(() => {
    const savedTermsVersion = localStorage.getItem('tosVersion')
    if (
      !savedTermsVersion ||
      !currentTOSVersion ||
      savedTermsVersion !== currentTOSVersion
    ) {
      setShowTerms(true)
    }
  }, [currentTOSVersion])

  const confirmTOS = (): void => {
    localStorage.setItem('tosVersion', currentTOSVersion ?? '')
    setShowTerms(false)
  }

  if (showTerms) {
    return (
      <CustomModal open={showTerms}>
        <div className='w-fit h-fit p-5'>
          <h5 className='text-2xl font-regular mb-4'>Terms of Service</h5>
          <Box my={2} className='max-w-fit'>
            <p className='font-regular'>
              Before using Monadex, please carefully read and agree to our <a href="https://docs.monadex.exchange/references/terms-of-use" className='text-primary font-clash' target="_blank" rel="noopener noreferrer">Terms of Service</a>. Your use of our platform is subject to these terms.
            </p>
          </Box>
          <Box className='flex items-start my-4'>
            <Checkbox
              checked={readTerms}
              onChange={() => setReadTerms(!readTerms)}
              color="primary"
            />
            <p className='ml-2'>
              I confirm that I have read, understood, and agree to be bound by the Monadex Terms of Service, including all disclaimers and risk warnings contained therein.
            </p>
          </Box>
          <Box className='flex items-start my-4'>
            <Checkbox
              checked={agreeTerms}
              onChange={() => setAgreeTerms(!agreeTerms)}
              color="primary"
            />
            <p className='ml-2'>
              I acknowledge that using Monadex involves risks, including but not limited to the risk of loss of funds. I understand and accept these risks, and I agree to use the platform at my own discretion and risk.
            </p>
          </Box>
          
          <Box mt={4}>
            <Button
              fullWidth
              disabled={!readTerms || !agreeTerms}
              onClick={confirmTOS}
              variant="contained"
              color="primary"
              className='text-white bg-primary hover:bg-primary-darkPurple font-regular'
            >
              I Agree to the Terms of Service
            </Button>
          </Box>
        </div>
      </CustomModal>
    )
  }

  return <>{children}</>
}