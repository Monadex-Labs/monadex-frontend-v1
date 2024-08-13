import { NextResponse } from 'next/server'
import axios from 'axios'
import { URL } from 'url'
export async function GET (req: Request): Promise<any> {
  try {
    const ParseURL = new URL(req.url)
    const tokenList = ParseURL.searchParams.get('tokenList')
    const { data } = await axios.get(tokenList as string)
    return NextResponse.json(data)
  } catch (error: any) {
    NextResponse.json({ error })
  }
}
