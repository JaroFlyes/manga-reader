'use client'

import useSWR from 'swr'
import { use, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Heart, BookOpen, ChevronDown, ChevronUp, SortAsc, SortDesc, Play } from 'lucide-react'
import { Shell } from '@/components/layout/shell'
import { ChapterItem } from '@/components/manga/chapter-item'
import { ChapterListSkeleton } from '@/components/manga/manga-grid-skeleton'
import { useFavorites, useReadStatus } from '@/lib/hooks'
import { historyStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import type { Manga, Chapter, MangaPageProps } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const STATUS_MAP: Record<string, string> = {
  ongoing: 'Em andamento',
  completed: 'Completo',
  hiatus: 'Hiato',
  cancelled: 'Cancelado',
}

export default function MangaDetailPage({ params }: MangaPageProps) {
  const { id } = use(params)
  const [descExpanded, setDescExpanded] = useState(false)
  const [chapterOrder, setChapterOrder] = useState<'asc' | 'desc'>('desc')

  const { data: mangaData, isLoading: mangaLoading } = useSWR<{ data: Manga }>(
    `/api/manga/${id}`,
    fetcher
  )
  const { data: chaptersData, isLoading: chaptersLoading } = useSWR<{ data: Chapter[] }>(
    `/api/manga/${id}/chapters?order=${chapterOrder}`,
    fetcher
  )

  const manga = mangaData?.data
  const chapters: Chapter[] = (chaptersData?.data ?? []).map((c) => ({
    ...c,
    mangaTitle: manga?.title ?? '',
  }))

  const { toggle: toggleFavorite, isFavorite } = useFavorites()
  const { isRead, toggle: toggleRead } = useReadStatus(id)

  const lastEntry = manga ? historyStore.getLastChapter(id) : null
  const favorited = manga ? isFavorite(manga.id) : false

  function handleFavoriteToggle() {
    if (manga) toggleFavorite(manga)
  }

  const firstUnread = chapters.find((c) => !isRead(c.id))
  const continueChapter = lastEntry?.chapter ?? firstUnread

  if (mangaLoading) {
    return (
      <Shell>
        <div className="max-w-screen-xl mx-auto px-4 py-6 animate-pulse space-y-6">
          <div className="flex gap-4">
            <div className="w-32 md:w-44 aspect-[2/3] rounded-xl bg-card flex-shrink-0" />
            <div className="flex-1 space-y-3 pt-2">
              <div className="h-6 bg-card rounded w-3/4" />
              <div className="h-4 bg-card rounded w-1/3" />
              <div className="h-4 bg-card rounded w-1/2" />
              <div className="flex gap-2 mt-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-6 w-16 bg-card rounded-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Shell>
    )
  }

  if (!manga) {
    return (
      <Shell>
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <p>Mangá não encontrado.</p>
        </div>
      </Shell>
    )
  }

  return (
    <Shell>
      <div className="max-w-screen-xl mx-auto">
        {/* Blurred cover background */}
        {manga.coverUrl && (
          <div className="absolute inset-0 h-64 overflow-hidden -z-10 pointer-events-none">
            <img
              src={manga.coverUrl}
              alt=""
              className="w-full h-full object-cover blur-3xl opacity-20 scale-110"
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
          </div>
        )}

        <div className="px-4 pt-4 pb-6 space-y-6">
          {/* Back button */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>

          {/* Hero section */}
          <div className="flex gap-4 md:gap-6">
            {/* Cover */}
            <div className="w-32 md:w-44 flex-shrink-0">
              <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-2xl bg-card">
                {manga.coverUrl ? (
                  <img
                    src={manga.coverUrl}
                    alt={`Capa de ${manga.title}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <BookOpen className="w-8 h-8" />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 pt-1 space-y-3">
              <h1 className="text-xl md:text-2xl font-bold text-foreground leading-snug text-balance">
                {manga.title}
              </h1>

              {manga.author && (
                <p className="text-sm text-muted-foreground">{manga.author}</p>
              )}

              <div className="flex flex-wrap items-center gap-2">
                {manga.status && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-card border border-border text-muted-foreground">
                    {STATUS_MAP[manga.status] ?? manga.status}
                  </span>
                )}
                {manga.year && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-card border border-border text-muted-foreground">
                    {manga.year}
                  </span>
                )}
              </div>

              {/* Genre tags */}
              {manga.genres.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {manga.genres.slice(0, 5).map((genre) => (
                    <span
                      key={genre}
                      className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary font-medium"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-1">
                {continueChapter && (
                  <Link
                    href={`/manga/${id}/chapter/${continueChapter.id}`}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    {lastEntry ? 'Continuar' : 'Ler agora'}
                  </Link>
                )}

                <button
                  onClick={handleFavoriteToggle}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-colors',
                    favorited
                      ? 'bg-accent/15 border-accent/30 text-accent hover:bg-accent/25'
                      : 'bg-card border-border text-muted-foreground hover:border-accent hover:text-accent'
                  )}
                >
                  <Heart className={cn('w-3.5 h-3.5', favorited && 'fill-current')} />
                  {favorited ? 'Favoritado' : 'Favoritar'}
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          {manga.description && (
            <div className="rounded-xl bg-card border border-border p-4 space-y-2">
              <h2 className="text-sm font-semibold text-foreground">Sinopse</h2>
              <p
                className={cn(
                  'text-sm text-muted-foreground leading-relaxed',
                  !descExpanded && 'line-clamp-3'
                )}
              >
                {manga.description}
              </p>
              {manga.description.length > 180 && (
                <button
                  onClick={() => setDescExpanded(!descExpanded)}
                  className="flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                >
                  {descExpanded ? (
                    <>Mostrar menos <ChevronUp className="w-3 h-3" /></>
                  ) : (
                    <>Ler mais <ChevronDown className="w-3 h-3" /></>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Chapters */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">
                Capítulos{' '}
                {chapters.length > 0 && (
                  <span className="text-sm text-muted-foreground font-normal">
                    ({chapters.length})
                  </span>
                )}
              </h2>

              <button
                onClick={() => setChapterOrder(chapterOrder === 'desc' ? 'asc' : 'desc')}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-card"
              >
                {chapterOrder === 'desc' ? (
                  <><SortDesc className="w-4 h-4" /> Mais recente</>
                ) : (
                  <><SortAsc className="w-4 h-4" /> Mais antigo</>
                )}
              </button>
            </div>

            <div className="rounded-xl bg-card border border-border px-4">
              {chaptersLoading && <ChapterListSkeleton />}
              {!chaptersLoading && chapters.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Nenhum capítulo disponível em português ou inglês.
                </p>
              )}
              {!chaptersLoading &&
                chapters.map((chapter, i) => (
                  <ChapterItem
                    key={chapter.id}
                    chapter={chapter}
                    mangaId={id}
                    isRead={isRead(chapter.id)}
                    onToggleRead={toggleRead}
                    isLast={i === chapters.length - 1}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  )
}
