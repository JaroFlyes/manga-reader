'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BookOpen, Clock, Trash2, ChevronRight } from 'lucide-react'
import { Shell } from '@/components/layout/shell'
import { historyStore } from '@/lib/store'
import type { HistoryEntry } from '@/lib/types'
import { cn } from '@/lib/utils'

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'agora mesmo'
  if (mins < 60) return `${mins}min atrás`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h atrás`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d atrás`
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(iso))
}

export default function LibraryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([])

  useEffect(() => {
    setHistory(historyStore.getAll())
  }, [])

  function handleClearHistory() {
    if (!confirm('Limpar todo o histórico de leitura?')) return
    historyStore.clear()
    setHistory([])
  }

  // Deduplicate: show only the most recent entry per manga
  const deduped = Object.values(
    history.reduce<Record<string, HistoryEntry>>((acc, entry) => {
      if (!acc[entry.manga.id]) acc[entry.manga.id] = entry
      return acc
    }, {})
  )

  return (
    <Shell>
      <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Biblioteca</h1>
            {deduped.length > 0 && (
              <span className="text-sm text-muted-foreground">({deduped.length})</span>
            )}
          </div>
          {deduped.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded-lg hover:bg-destructive/10"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Limpar histórico
            </button>
          )}
        </div>

        {/* Empty state */}
        {deduped.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
            <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center">
              <BookOpen className="w-8 h-8 opacity-30" />
            </div>
            <div className="text-center space-y-1">
              <p className="font-medium text-foreground">Histórico vazio</p>
              <p className="text-sm">Os mangás que voce ler aparecerão aqui</p>
            </div>
          </div>
        )}

        {/* History list */}
        {deduped.length > 0 && (
          <div className="space-y-2">
            {deduped.map((entry) => {
              const progress = entry.totalPages > 0
                ? Math.round((entry.pageIndex / (entry.totalPages - 1)) * 100)
                : 0
              const chapterTitle = entry.chapter.title
                ? `Cap. ${entry.chapter.chapter} — ${entry.chapter.title}`
                : `Capítulo ${entry.chapter.chapter}`

              return (
                <Link
                  key={`${entry.manga.id}-${entry.chapter.id}`}
                  href={`/manga/${entry.manga.id}/chapter/${entry.chapter.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/40 transition-colors group"
                >
                  {/* Cover thumbnail */}
                  <div className="w-14 aspect-[2/3] rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                    {entry.manga.coverUrl ? (
                      <img
                        src={entry.manga.coverUrl}
                        alt={`Capa de ${entry.manga.title}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {entry.manga.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{chapterTitle}</p>

                    {/* Progress bar */}
                    <div className="space-y-0.5">
                      <div className="h-1 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-muted-foreground">
                          {progress}% lido
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {timeAgo(entry.readAt)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 group-hover:text-primary transition-colors" />
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </Shell>
  )
}
