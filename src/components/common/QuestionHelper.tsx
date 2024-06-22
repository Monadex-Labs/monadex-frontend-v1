import React from 'react'
import { Box } from '@mui/material'
import { AiOutlinePlusCircle, AiOutlineQuestionCircle } from 'react-icons/ai'
import { CustomTooltip } from './Tooltip'
import { cn } from '@/utils/cn'
export const QuestionHelper: React.FC<{
  text: string
  size?: number
  className?: string
}> = ({ text, size = 16, className }) => {
  return (
    <CustomTooltip title={text}>
      <Box className={cn('flex items-center justify-center p-[0.2px] border-none bg-none outline-none rounded-[36px] hover:opacity-70 focus:opacity-70', className)}>
        <AiOutlineQuestionCircle size={size} />
      </Box>
    </CustomTooltip>
  )
}

export const PlusHelper: React.FC<{ text: string, color?: string }> = ({
  text,
  color
}) => {
  return (
    <CustomTooltip title={text}>
      <Box className='flex items-center justify-center p-[0.2px] border-none bg-none outline-none rounded-[36px] hover:opacity-70 focus:opacity-70' color={color}>
        <AiOutlinePlusCircle size={16} />
      </Box>
    </CustomTooltip>
  )
}

export const LightQuestionHelper: React.FC<{ text: string, color: string }> = ({
  text,
  color
}) => {
  return (
    <CustomTooltip title={text}>
      <Box className='lightQuestionWrapper' color={color}>
        <span className='questionMark'>?</span>
      </Box>
    </CustomTooltip>
  )
}
