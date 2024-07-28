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
      <Slider {...props} onChange={handleChange} className='w-1 h-1 bottom-4 rounded-md bg-white hover:after:bg-bgColor' /> {/* TODO: Pending add more styles */}
    </Box>
  )
}

export default ColoredSlider
