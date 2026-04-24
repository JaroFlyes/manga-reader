'use client'

import { useState, useEffect } from 'react'
import { Heart, Trash2 } from 'lucide-react'
import { Shell } from '@/components/layout/shell'
import { MangaCard } from '@/components/manga/manga-card'
import { favoritesStore } from '@/lib/store'
import type { FavoriteEntry } from '@/lib/types'

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([])

  useEffect(() => {
    setFavorites(favoritesStore.getAll())
  }, [])

  function handleToggle(manga: Parameters<typeof favoritesStore.toggle>[0]) {
    favoritesStore.toggle(manga)
    setFavorites(favoritesStore.getAll())
  }

  function handleClearAll() {
    if (!confirm('Remover todos os favoritos?')) return
    favorites.forEach((f) => favoritesStore.remove(f.manga.id))
    setFavorites([])
  }

  return (
    <Shell>
      <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-accent fill-accent" />
            <h1 className="text-xl font-bold text-foreground">Favoritos</h1>
            {favorites.length > 0 && (
              <span className="text-sm text-muted-foreground">({favorites.length})</span>
            )}
          </div>
          {favorites.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded-lg hover:bg-destructive/10"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Limpar tudo
            </button>
          )}
        </div>

        {/* Empty state */}
        {favorites.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
            <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center">
              <Heart className="w-8 h-8 opacity-30" />
            </div>
            <div className="text-center space-y-1">
              <p className="font-medium text-foreground">Nenhum favorito ainda</p>
              <p className="text-sm">Clique no coracão em qualquer mangá para favoritar</p>
            </div>
          </div>
        )}

        {/* Grid */}
        {favorites.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
            {favorites.map(({ manga }) => (
              <MangaCard
                key={manga.id}
                manga={manga}
                isFavorite={true}
                onFavoriteToggle={handleToggle}
              />
            ))}
          </div>
        )}
      </div>
    </Shell>
  )
}
