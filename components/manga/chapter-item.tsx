'use client'

import Link from 'next/link'
import { Check, BookOpen, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Chapter } from '@/lib/types'

interface ChapterItemProps {
  chapter: Chapter
  mangaId: string
  isRead: boolean
  onToggleRead: (chapterId: string) => void
  isLast?: boolean
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(iso))
  } catch {
    return ''
  }
}

export function ChapterItem({ chapter, mangaId, isRead, onToggleRead, isLast }: ChapterItemProps) {
  const displayTitle = chapter.title
    ? `Cap. ${chapter.chapter} — ${chapter.title}`
    : `Capítulo ${chapter.chapter}`

  return (
    <div
      className={cn(
        'flex items-center gap-2 py-3 px-1 border-b border-border/50 group',
        isLast && 'border-b-0'
      )}
    >
      {/* Read indicator line */}
      <div
        className={cn(
          'w-0.5 h-8 rounded-full flex-shrink-0 transition-colors',
          isRead ? 'bg-primary/40' : 'bg-muted'
        )}
      />

      {/* Chapter link */}
      <Link
        href={`/manga/${mangaId}/chapter/${chapter.id}`}
        className="flex-1 min-w-0 group/link"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p
              className={cn(
                'text-sm font-medium leading-snug truncate transition-colors',
                isRead
                  ? 'text-muted-foreground group-hover/link:text-foreground'
                  : 'text-foreground group-hover/link:text-primary'
              )}
            >
              {displayTitle}
            </p>
            <div className="flex items-center gap-3 mt-0.5">
              {chapter.publishAt && (
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {formatDate(chapter.publishAt)}
                </span>
              )}
              {chapter.scanlationGroup && (
                <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                  {chapter.scanlationGroup}
                </span>
              )}
            </div>
          </div>

          {/* Reading icon */}
          <div className="flex-shrink-0 mt-0.5">
            {isRead ? (
              <BookOpen className="w-4 h-4 text-primary/60" />
            ) : (
              <BookOpen className="w-4 h-4 text-muted-foreground/30 group-hover/link:text-muted-foreground transition-colors" />
            )}
          </div>
        </div>
      </Link>

      {/* Toggle read button */}
      <button
        onClick={() => onToggleRead(chapter.id)}
        className={cn(
          'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all border',
          isRead
            ? 'bg-primary/20 border-primary/30 text-primary hover:bg-destructive/20 hover:border-destructive/30 hover:text-destructive'
            : 'bg-transparent border-border text-muted-foreground hover:bg-primary/10 hover:border-primary/30 hover:text-primary opacity-0 group-hover:opacity-100'
        )}
        title={isRead ? 'Marcar como não lido' : 'Marcar como lido'}
      >
        <Check className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
