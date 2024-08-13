import React from 'react'
import { Box, Tooltip, TooltipProps } from '@mui/material'

interface CustomTooltipProps extends TooltipProps {
  padding?: string | number
}

export const CustomTooltip: React.FC<CustomTooltipProps> = ({
  padding = '14px',
  title,
  ...props
}) => (
  <Tooltip
    {...props}
    arrow
    title={<Box padding={padding}>{title}</Box>}
  />
)
