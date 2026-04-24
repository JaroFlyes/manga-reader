import { NextRequest, NextResponse } from 'next/server'

const MANGADEX_BASE = 'https://api.mangadex.org'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const res = await fetch(`${MANGADEX_BASE}/at-home/server/${id}`, {
      headers: { 'User-Agent': 'MangaVerse/1.0' },
    })

    if (!res.ok) throw new Error(`MangaDex error: ${res.status}`)

    const json = await res.json()
    const baseUrl: string = json.baseUrl
    const hash: string = json.chapter.hash
    const pages: string[] = json.chapter.data ?? []
    const dataSaverPages: string[] = json.chapter.dataSaver ?? []

    const fullPages = pages.map((p: string) => `${baseUrl}/data/${hash}/${p}`)
    const saverPages = dataSaverPages.map((p: string) => `${baseUrl}/data-saver/${hash}/${p}`)

    return NextResponse.json({
      data: {
        baseUrl,
        hash,
        pages: fullPages,
        dataSaverPages: saverPages,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
