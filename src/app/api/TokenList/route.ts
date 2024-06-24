import { NextResponse } from 'next/server'
import axios from 'axios'
import { parse, UrlWithParsedQuery } from 'url'
export async function GET (req: Request) {
  try {
    const ParseURL: UrlWithParsedQuery = parse(req.url, true)
    const { query } = ParseURL
    const { tokenList } = query
    const f = await axios.get(tokenList as string)
    const res = f.data
    return NextResponse.json({ message: res, statut: '200' })
  } catch (error: any) {
    return NextResponse.json({ error })
  }
}
