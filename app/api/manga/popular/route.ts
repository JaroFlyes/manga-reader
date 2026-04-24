import { NextRequest, NextResponse } from 'next/server'

const MANGADEX_BASE = 'https://api.mangadex.org'

function buildCoverUrl(mangaId: string, fileName: string) {
  return `https://uploads.mangadex.org/covers/${mangaId}/${fileName}.512.jpg`
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const limit = searchParams.get('limit') ?? '20'
  const offset = searchParams.get('offset') ?? '0'

  try {
    const params = new URLSearchParams()
    params.set('limit', limit)
    params.set('offset', offset)
    params.set('order[followedCount]', 'desc')
    params.set('hasAvailableChapters', '1')
    params.append('includes[]', 'cover_art')
    params.append('includes[]', 'author')
    params.append('availableTranslatedLanguage[]', 'pt-br')
    params.append('availableTranslatedLanguage[]', 'en')
    params.append('contentRating[]', 'safe')
    params.append('contentRating[]', 'suggestive')

    const url = `${MANGADEX_BASE}/manga?${params.toString()}`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'MangaVerse/1.0 (contact@mangaverse.app)' },
      next: { revalidate: 300 },
    })

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.log('[v0] MangaDex popular error', res.status, body.slice(0, 200))
      return NextResponse.json(
        { error: `MangaDex error: ${res.status}` },
        { status: res.status }
      )
    }

    const json = await res.json()
    const mangas = (json.data ?? []).map((item: any) => parseManga(item))

    return NextResponse.json({ data: mangas })
  } catch (err: any) {
    console.log('[v0] popular fetch error:', err?.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export function parseManga(item: any) {
  const relationships: any[] = item.relationships ?? []
  let coverFileName: string | null = null
  let authorName: string | null = null

  for (const rel of relationships) {
    if (rel.type === 'cover_art') coverFileName = rel.attributes?.fileName ?? null
    if (rel.type === 'author') authorName = rel.attributes?.name ?? null
  }

  const attrs = item.attributes ?? {}
  const title = extractLocalized(attrs.title) ?? 'Unknown'
  const description = extractLocalized(attrs.description)
  const genres = extractGenres(attrs.tags)

  return {
    id: item.id,
    title,
    description,
    coverFileName,
    coverUrl: coverFileName ? buildCoverUrl(item.id, coverFileName) : null,
    genres,
    status: attrs.status ?? null,
    author: authorName,
    year: attrs.year ?? null,
    rating: attrs.contentRating ?? null,
  }
}

function extractLocalized(obj: any): string | null {
  if (!obj) return null
  if (typeof obj === 'string') return obj
  return obj['en'] ?? obj['pt-br'] ?? obj['ja-ro'] ?? obj['ja'] ?? Object.values(obj)[0] ?? null
}

function extractGenres(tags: any[]): string[] {
  if (!Array.isArray(tags)) return []
  return tags
    .map((t: any) => t.attributes?.name?.en ?? '')
    .filter(Boolean)
    .slice(0, 6)
}
