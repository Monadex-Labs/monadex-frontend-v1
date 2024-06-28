import { NextResponse } from 'next/server'
import axios from 'axios'
import { parse, UrlWithParsedQuery } from 'url'
export async function GET (req: Request) {
  try {
    const ParseURL: UrlWithParsedQuery = parse(req.url, true)
    const { query } = ParseURL
    const { tokenList } = query
    const { data } = await axios.get(tokenList as string)
    return NextResponse.json(data)
  } catch (error: any) {
    NextResponse.json({ error })
  }
}
