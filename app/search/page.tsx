'use client'

import useSWR from 'swr'
import { useState, useRef, useEffect } from 'react'
import { Search, X, Loader2, BookOpen } from 'lucide-react'
import { Shell } from '@/components/layout/shell'
import { MangaCard } from '@/components/manga/manga-card'
import { MangaGridSkeleton } from '@/components/manga/manga-grid-skeleton'
import { useFavorites, useDebounce } from '@/lib/hooks'
import type { Manga } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const SUGGESTIONS = [
  'One Piece', 'Naruto', 'Attack on Titan', 'Demon Slayer',
  'Jujutsu Kaisen', 'My Hero Academia', 'Solo Leveling', 'Tower of God',
]

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const debouncedQuery = useDebounce(query, 500)
  const { toggle, isFavorite } = useFavorites()

  const shouldFetch = debouncedQuery.trim().length >= 2

  const { data, isLoading } = useSWR<{ data: Manga[] }>(
    shouldFetch ? `/api/manga/search?q=${encodeURIComponent(debouncedQuery)}&limit=24` : null,
    fetcher
  )

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const mangas = data?.data ?? []
  const isTyping = query !== debouncedQuery

  return (
    <Shell>
      <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-6">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar mangás, manhwas..."
            className="w-full pl-10 pr-10 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-sm"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('')
                inputRef.current?.focus()
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Suggestions / empty state */}
        {!query && (
          <div className="space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Sugestoes de busca
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setQuery(s)}
                  className="px-3 py-1.5 rounded-full bg-card border border-border text-sm text-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading state */}
        {(isLoading || isTyping) && shouldFetch && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        )}

        {/* Results */}
        {!isLoading && !isTyping && shouldFetch && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {mangas.length === 0
                  ? `Nenhum resultado para "${debouncedQuery}"`
                  : `${mangas.length} resultados para "${debouncedQuery}"`}
              </p>
            </div>

            {mangas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                <BookOpen className="w-10 h-10 opacity-30" />
                <p className="text-sm">Nenhum mangá encontrado</p>
                <p className="text-xs">Tente buscar por outro título</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
                {mangas.map((manga) => (
                  <MangaCard
                    key={manga.id}
                    manga={manga}
                    isFavorite={isFavorite(manga.id)}
                    onFavoriteToggle={toggle}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Short query hint */}
        {query.length === 1 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            Digite pelo menos 2 caracteres para buscar
          </p>
        )}
      </div>
    </Shell>
  )
}
