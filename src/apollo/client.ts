'use client'
import { ApolloClient } from '@apollo/client'
import { InMemoryCache} from '@apollo/client'
const cache:InMemoryCache = new InMemoryCache()
// remove it from here ----
const api_key = "e0b6acbf436b97bf7e5fed47d421c503"

export const client  = new ApolloClient({
    uri : `https://gateway-arbitrum.network.thegraph.com/api/${api_key}/subgraphs/id/7Wfo3Ue4RrupNaFtyMJXPJh128L5cSb5jDDwY8Uahkms`,
    cache,
})

export const blockClient = new ApolloClient({
    uri: `https://gateway.thegraph.com/api/${api_key}/subgraphs/id/9PGjvCHKxma2SKGpvpTr4WSrHTUVk7JzZLQVHXVJFjAE`,
    cache
})




