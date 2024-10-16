import { NextResponse } from 'next/server'
import axios from 'axios'
import { URL } from 'url'
import { DEFAULT_TOKEN_LIST_URL } from '@/constants'

export async function GET (req: Request): Promise<NextResponse> {
  try {
    // Parse the incoming request URL
    const ParseURL = new URL(req.url)
    // Extract the 'tokenList' query parameter
    const tokenList = ParseURL.searchParams.get('tokenList')

    if (!tokenList && !DEFAULT_TOKEN_LIST_URL ) {
      return NextResponse.json({ error: 'Missing tokenList parameter' }, { status: 400 })
    }

    // Fetch the data from the external URL
    const { data } = await axios.get(tokenList ?? DEFAULT_TOKEN_LIST_URL)

    console.log('data', data)
    // Return the data as a response
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error fetching tokenList:', error)

    // Return the error response (ensuring return is present)
    return NextResponse.json({ error: 'Failed to fetch data', details: error.message }, { status: 500 })
  }
}
