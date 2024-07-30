'use client'
import React from 'react'
import { useState } from 'react'
import { useBlockNumber } from '@/state/application/hooks'
import { Box, Button } from '@mui/material'
import { IoLogoDiscord } from 'react-icons/io5'
import UseDiscordLogin from '@/discord/connectPopup'
const Footer:React.FC = () => {
   const blockNumber = useBlockNumber()
   return (

    <>

    </>
   )
}


export default Footer