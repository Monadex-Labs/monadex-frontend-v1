import dbConnect from '@/discord/dbConnect'
import Xp from '@/discord/models'
import { NextResponse } from 'next/server'
import { URL } from 'url'

export async function GET (req: Request): Promise<NextResponse<{
  message: any
}>> {
  const parseUrl: URL = new URL(req.url)
  const id = parseUrl.searchParams.get('id')

  await dbConnect()

  try {
    if (id != null) {
      const data = await Xp.findOne({ user: `<@${id}>` })
      return NextResponse.json({ data: data.points, message: 'success' })
    } else {
      return NextResponse.json({ message: 'User not found' })
    }
  } catch (err: any) {
    return NextResponse.json({ message: err.message })
  }
}
