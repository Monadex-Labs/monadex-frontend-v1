'use client'

import React, { useState } from 'react'
import { Box, Typography } from "@mui/material"
import PoolsRow from "./PoolsRow"
import useBulkPools from "@/hooks/usePools"
import { Token, ChainId } from "@monadex/sdk"
import { useRouter } from 'next/navigation'
import {CircularProgress} from "@mui/material"
import PoolHeader from './PoolHeader'
const Pools: React.FC = () => {
    const router = useRouter()
    const { bulkPairsData, historicalData } = useBulkPools()
    const [_tvl, setTvl] = useState<string>('')

    const processedPools = React.useMemo(() => {
        if (!bulkPairsData || !historicalData) return []
        
        return Object.entries(historicalData).map(([pairAddress, historicalPairData]) => {
            bulkPairsData.map((d:any) => setTvl(d.reserveUSD))
            // Token Class Initialisation
            const token0 = new Token(
                ChainId.SEPOLIA, // Replace with the correct chain ID
                historicalPairData.token0.id,
                18, // Replace with the correct decimals
                historicalPairData.token0.symbol,
                historicalPairData.token0.name
            )

            const token1 = new Token(
                ChainId.SEPOLIA, // Replace with the correct chain ID
                historicalPairData.token1.id,
                18, // Replace with the correct decimals
                historicalPairData.token1.symbol,
                historicalPairData.token1.name
            )

            const volume24h = historicalPairData.volumeUSD
            const fee24h = (parseFloat(volume24h) * 0.003).toString() // Assuming 0.3% fee
            const apr24h = ((parseFloat(fee24h) * 365 * 100) / parseFloat(_tvl)).toString()
            
            // Calculate pool fee percentage (you may need to adjust this based on your data structure)
            const poolFee = "0.3" // Default to 0.3% if not available

            return {
                pairAddress,
                token0,
                token1,
                volume24h,
                fee24h,
                apr24h,
                poolFee
            }
        }).filter(Boolean)
    }, [bulkPairsData, historicalData])

    console.log('p', processedPools)
    return (
        <Box>
            <PoolHeader/>
                <Box mt={6}>
                {processedPools.length == 0 ? (
                <CircularProgress size={15} color='secondary' className='text-center' />
            ) : (
                processedPools.map((pool) => (
                    <PoolsRow
                        key={pool?.pairAddress}
                        poolFee={pool?.poolFee}
                        token0={pool?.token0 as Token}
                        token1={pool?.token1 as Token}
                        volume24h={pool?.volume24h}
                        tvl={_tvl}
                        fee24h={pool?.fee24h as string}
                        apr24h={pool?.apr24h as string}
                        onClick={() => {
                            // Handle click event, e.g., navigate to pool details page
                            router.push(`${process.env.ADD_LIQ_PATH}/pools/new?currency0=${pool.token0.address}&currency1=${pool.token1.address}`)
                        }}
                    />
                ))
            )
                
            }
                </Box>
        </Box>
    )
}

export default Pools