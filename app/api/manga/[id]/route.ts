import { NextRequest, NextResponse } from 'next/server'
import { parseManga } from '../popular/route'

const MANGADEX_BASE = 'https://api.mangadex.org'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const qParams = new URLSearchParams()
    qParams.append('includes[]', 'cover_art')
    qParams.append('includes[]', 'author')
    qParams.append('includes[]', 'artist')

    const res = await fetch(`${MANGADEX_BASE}/manga/${id}?${qParams.toString()}`, {
      headers: { 'User-Agent': 'MangaVerse/1.0 (contact@mangaverse.app)' },
      next: { revalidate: 600 },
    })

    if (!res.ok) {
      console.log('[v0] manga detail error', res.status)
      throw new Error(`MangaDex error: ${res.status}`)
    }

    const json = await res.json()
    const manga = parseManga(json.data)

    return NextResponse.json({ data: manga })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
