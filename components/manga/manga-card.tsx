'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Manga } from '@/lib/types'

interface MangaCardProps {
  manga: Manga
  isFavorite?: boolean
  onFavoriteToggle?: (manga: Manga) => void
  className?: string
}

const STATUS_COLORS: Record<string, string> = {
  ongoing: 'bg-emerald-500/20 text-emerald-400',
  completed: 'bg-blue-500/20 text-blue-400',
  hiatus: 'bg-yellow-500/20 text-yellow-400',
  cancelled: 'bg-red-500/20 text-red-400',
}

const STATUS_LABELS: Record<string, string> = {
  ongoing: 'Em andamento',
  completed: 'Completo',
  hiatus: 'Hiato',
  cancelled: 'Cancelado',
}

export function MangaCard({ manga, isFavorite, onFavoriteToggle, className }: MangaCardProps) {
  return (
    <div className={cn('group relative', className)}>
      <Link href={`/manga/${manga.id}`} className="block">
        {/* Cover Image */}
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-card mb-2 shadow-md">
          {manga.coverUrl ? (
            <img
              src={manga.coverUrl}
              alt={`Capa do mangá ${manga.title}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-card text-muted-foreground text-xs text-center px-2">
              Sem capa
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Status badge */}
          {manga.status && (
            <div className="absolute top-1.5 left-1.5">
              <span
                className={cn(
                  'text-[9px] font-semibold px-1.5 py-0.5 rounded-full',
                  STATUS_COLORS[manga.status] ?? 'bg-muted text-muted-foreground'
                )}
              >
                {STATUS_LABELS[manga.status] ?? manga.status}
              </span>
            </div>
          )}

          {/* Genres on hover */}
          {manga.genres.length > 0 && (
            <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex flex-wrap gap-1">
                {manga.genres.slice(0, 2).map((genre) => (
                  <span
                    key={genre}
                    className="text-[9px] bg-primary/80 text-primary-foreground rounded px-1.5 py-0.5"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Title */}
        <p className="text-xs font-medium leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors">
          {manga.title}
        </p>

        {/* Author */}
        {manga.author && (
          <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{manga.author}</p>
        )}
      </Link>

      {/* Favorite button */}
      {onFavoriteToggle && (
        <button
          onClick={(e) => {
            e.preventDefault()
            onFavoriteToggle(manga)
          }}
          className={cn(
            'absolute top-1.5 right-1.5 w-7 h-7 rounded-full flex items-center justify-center transition-all shadow',
            isFavorite
              ? 'bg-accent text-accent-foreground opacity-100'
              : 'bg-black/40 text-white opacity-0 group-hover:opacity-100'
          )}
          aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Heart className={cn('w-3.5 h-3.5', isFavorite && 'fill-current')} />
        </button>
      )}
    </div>
  )
}
