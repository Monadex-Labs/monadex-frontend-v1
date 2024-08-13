import React from 'react'
import { Box } from '@mui/material'

export const ToggleSwitch: React.FC<{
  disabled?: boolean
  toggled: boolean
  onToggle: () => void
}> = ({ toggled, onToggle, disabled }) => {
  return (
    <Box
      className={`${toggled ? ' toggled' : ''}${
        disabled != null ? ' opacity-disabled' : ' cursor-pointer'
      }`}
      onClick={() => {
        if (disabled == null) {
          onToggle()
        }
      }}
    >
      <Box className='innerCircle' />
    </Box>
  )
}
