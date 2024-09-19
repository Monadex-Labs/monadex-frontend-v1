import { Box } from "@mui/material"

interface PoolParams {
    volume : string
    tvl : string
    fee : string
    apr : string
}
'use client'
/**
 * 
 * @returns  const apy0 = parseFloat(pairA.oneDayVolumeUSD * 0.003 * 356 * 100) / parseFloat(pairA.reserveUSD)
          const apy1 = parseFloat(pairB.oneDayVolumeUSD * 0.003 * 356 * 100) / parseFloat(pairB.reserveUSD)
 */
const PoolsRow:React.FC = () => {
    return (
        <Box>

        </Box>
    )
}

export default PoolsRow