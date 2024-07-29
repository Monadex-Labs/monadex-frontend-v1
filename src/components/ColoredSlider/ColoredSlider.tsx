import React from 'react'
import { Box, Slider, SliderProps } from '@mui/material'

interface ColoredSliderProps extends SliderProps {
  handleChange: (
    event: Event,
    value: number | number[],
  ) => void
}

const ColoredSlider: React.FC<ColoredSliderProps> = ({
  handleChange,
  ...props
}) => {
  return (
    <Box className='h-1 w-[calc(100% - 16px)] px-3 py-0'>
      <Slider {...props} onChange={handleChange} className='bottom-4 rounded-md' />
    </Box>
  )
}

export default ColoredSlider
