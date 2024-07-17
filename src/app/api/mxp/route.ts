import dbConnect from '@/discord/dbConnect'
// import * as Xps from "../../../../../discord-bot-template/src/schemas/xps";
import Xp from '@/discord/models'
import { NextResponse } from 'next/server'
import { parse, UrlWithParsedQuery } from 'url'

export async function GET (req: Request): Promise<NextResponse<{
  message: any
}>> {
  const parseUrl: UrlWithParsedQuery = parse(req.url, true)
  const { query } = parseUrl
  const { id } = query

  await dbConnect()

  try {
    if (id !== undefined) {
      const data = await Xp.findOne({ user: `<@${id}>` })
      console.log(data)
      return NextResponse.json({ data: data.points, message: 'success' })
    } else {
      return NextResponse.json({ message: 'User not found' })
    }
  } catch (err: any) {
    return NextResponse.json({ message: err.message })
  }
}
