'use client'

import useSWR from 'swr'
import { useState } from 'react'
import { Shell } from '@/components/layout/shell'
import { MangaCard } from '@/components/manga/manga-card'
import { MangaGridSkeleton } from '@/components/manga/manga-grid-skeleton'
import { useFavorites } from '@/lib/hooks'
import type { Manga } from '@/lib/types'
import { TrendingUp, Flame, ChevronRight } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function HomePage() {
  const [offset, setOffset] = useState(0)
  const { data, isLoading, error } = useSWR<{ data: Manga[] }>(
    `/api/manga/popular?limit=24&offset=${offset}`,
    fetcher
  )
  const { favorites, toggle, isFavorite } = useFavorites()

  const mangas = data?.data ?? []

  return (
    <Shell>
      <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-8">
        {/* Hero Banner */}
        <section>
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/30 via-card to-accent/20 p-6 md:p-8 border border-border">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-accent" />
                <span className="text-xs font-semibold text-accent uppercase tracking-widest">
                  Tendencias
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 text-balance">
                Mangás Populares
              </h1>
              <p className="text-sm text-muted-foreground text-balance">
                Os mangás mais seguidos e lidos da comunidade MangaDex
              </p>
            </div>
            {/* decorative circles */}
            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -right-4 -bottom-8 w-28 h-28 rounded-full bg-accent/10 blur-2xl" />
          </div>
        </section>

        {/* Popular grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-foreground">Em Alta</h2>
            </div>
          </div>

          {isLoading && <MangaGridSkeleton count={24} />}

          {error && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">Erro ao carregar mangás.</p>
              <p className="text-xs mt-1">Verifique sua conexão e tente novamente.</p>
            </div>
          )}

          {!isLoading && mangas.length > 0 && (
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

          {/* Pagination */}
          {!isLoading && mangas.length > 0 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - 24))}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-card border border-border text-foreground disabled:opacity-40 hover:border-primary hover:text-primary transition-colors"
              >
                Anterior
              </button>
              <span className="text-sm text-muted-foreground">
                Página {Math.floor(offset / 24) + 1}
              </span>
              <button
                onClick={() => setOffset(offset + 24)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1"
              >
                Próximo <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </section>

        {/* Favorites section */}
        {favorites.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <span className="text-accent">♥</span> Seus Favoritos
              </h2>
              <a href="/favorites" className="text-xs text-primary hover:underline flex items-center gap-0.5">
                Ver todos <ChevronRight className="w-3 h-3" />
              </a>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
              {favorites.slice(0, 6).map(({ manga }) => (
                <MangaCard
                  key={manga.id}
                  manga={manga}
                  isFavorite={true}
                  onFavoriteToggle={toggle}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </Shell>
  )
}
