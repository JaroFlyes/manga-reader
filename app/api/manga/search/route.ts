import { NextRequest, NextResponse } from 'next/server'
import { parseManga } from '../popular/route'

const MANGADEX_BASE = 'https://api.mangadex.org'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const query = searchParams.get('q')?.trim()
  const limit = searchParams.get('limit') ?? '20'

  if (!query) return NextResponse.json({ data: [] })

  try {
    const params = new URLSearchParams()
    params.set('title', query)
    params.set('limit', limit)
    params.set('hasAvailableChapters', '1')
    params.append('includes[]', 'cover_art')
    params.append('includes[]', 'author')
    params.append('availableTranslatedLanguage[]', 'pt-br')
    params.append('availableTranslatedLanguage[]', 'en')
    params.append('contentRating[]', 'safe')
    params.append('contentRating[]', 'suggestive')

    const res = await fetch(`${MANGADEX_BASE}/manga?${params.toString()}`, {
      headers: { 'User-Agent': 'MangaVerse/1.0 (contact@mangaverse.app)' },
    })

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.log('[v0] MangaDex search error', res.status, body.slice(0, 200))
      throw new Error(`MangaDex error: ${res.status}`)
    }

    const json = await res.json()
    const mangas = (json.data ?? []).map((item: any) => parseManga(item))

    return NextResponse.json({ data: mangas })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
