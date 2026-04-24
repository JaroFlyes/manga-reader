import { NextRequest, NextResponse } from 'next/server'

const MANGADEX_BASE = 'https://api.mangadex.org'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { searchParams } = req.nextUrl
  const order = searchParams.get('order') ?? 'desc'

  try {
    const qParams = new URLSearchParams()
    qParams.set('limit', '500')
    qParams.set(`order[chapter]`, order)
    qParams.append('manga[]', id)
    qParams.append('translatedLanguage[]', 'pt-br')
    qParams.append('translatedLanguage[]', 'en')
    qParams.append('includes[]', 'scanlation_group')
    qParams.append('contentRating[]', 'safe')
    qParams.append('contentRating[]', 'suggestive')

    const res = await fetch(`${MANGADEX_BASE}/chapter?${qParams.toString()}`, {
      headers: { 'User-Agent': 'MangaVerse/1.0 (contact@mangaverse.app)' },
      next: { revalidate: 120 },
    })

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.log('[v0] chapters error', res.status, body.slice(0, 200))
      throw new Error(`MangaDex error: ${res.status}`)
    }

    const json = await res.json()
    const seen = new Set<string>()

    const chapters = (json.data ?? [])
      .map((item: any) => {
        const relationships: any[] = item.relationships ?? []
        const group = relationships.find((r) => r.type === 'scanlation_group')
        const attrs = item.attributes ?? {}
        const chapterNum = attrs.chapter ?? '0'

        if (seen.has(chapterNum)) return null
        seen.add(chapterNum)

        return {
          id: item.id,
          chapter: chapterNum,
          volume: attrs.volume ?? null,
          title: attrs.title ?? null,
          publishAt: attrs.publishAt ?? null,
          mangaId: id,
          mangaTitle: '',
          scanlationGroup: group?.attributes?.name ?? null,
        }
      })
      .filter(Boolean)

    return NextResponse.json({ data: chapters })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
