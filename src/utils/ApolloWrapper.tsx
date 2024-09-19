'use client'
import { ApolloProvider } from '@apollo/client'
import { client } from '@/apollo/client'
import React from 'react'

export const ApolloWrapper:React.FC<{children : React.ReactNode}> =({children}) => {
    return (
        <ApolloProvider client ={client}>
            {children}
        </ApolloProvider>
    )
} 