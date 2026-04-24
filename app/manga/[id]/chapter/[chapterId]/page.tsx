'use client'

import useSWR from 'swr'
import { use, useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, ChevronLeft, ChevronRight, Settings, BookOpen,
  LayoutPanelLeft, AlignJustify, Zap, RefreshCw, Check, X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { historyStore, readStatusStore } from '@/lib/store'
import { useReaderSettings, useKeyboard } from '@/lib/hooks'
import type { ChapterPageProps, ChapterPages, Chapter } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ReaderPage({ params }: ChapterPageProps) {
  const { id: mangaId, chapterId } = use(params)
  const [currentPage, setCurrentPage] = useState(0)
  const [uiVisible, setUiVisible] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const scrollRef = useRef<HTMLDivElement>(null)
  const uiTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { settings, updateSettings } = useReaderSettings()

  const { data: pagesData, isLoading } = useSWR<{ data: ChapterPages }>(
    `/api/chapter/${chapterId}/pages`,
    fetcher
  )

  // Get adjacent chapters
  const { data: chaptersData } = useSWR<{ data: Chapter[] }>(
    `/api/manga/${mangaId}/chapters?order=asc`,
    fetcher
  )

  const pages = settings.dataSaver
    ? (pagesData?.data?.dataSaverPages ?? [])
    : (pagesData?.data?.pages ?? [])

  const chapters = chaptersData?.data ?? []
  const currentChapterIdx = chapters.findIndex((c) => c.id === chapterId)
  const prevChapter = chapters[currentChapterIdx - 1] ?? null
  const nextChapter = chapters[currentChapterIdx + 1] ?? null
  const currentChapter = chapters[currentChapterIdx]

  const totalPages = pages.length

  // Save history when reading
  useEffect(() => {
    if (!currentChapter || pages.length === 0) return
    const manga = { id: mangaId, title: currentChapter.mangaTitle } as any
    historyStore.upsert(manga, currentChapter, currentPage, totalPages)
    if (currentPage === totalPages - 1) {
      readStatusStore.markRead(chapterId)
    }
  }, [currentPage, currentChapter, pages.length, mangaId, chapterId, totalPages])

  // Auto-hide UI
  function resetUiTimer() {
    setUiVisible(true)
    if (uiTimer.current) clearTimeout(uiTimer.current)
    uiTimer.current = setTimeout(() => setUiVisible(false), 3500)
  }

  useEffect(() => {
    resetUiTimer()
    return () => { if (uiTimer.current) clearTimeout(uiTimer.current) }
  }, [])

  function goNext() {
    if (settings.mode === 'horizontal') {
      if (currentPage < totalPages - 1) {
        setCurrentPage((p) => p + 1)
      } else if (settings.continuousReading && nextChapter) {
        window.location.href = `/manga/${mangaId}/chapter/${nextChapter.id}`
      }
    }
  }

  function goPrev() {
    if (settings.mode === 'horizontal') {
      if (currentPage > 0) setCurrentPage((p) => p - 1)
    }
  }

  function goNextChapter() {
    if (nextChapter) window.location.href = `/manga/${mangaId}/chapter/${nextChapter.id}`
  }

  function goPrevChapter() {
    if (prevChapter) window.location.href = `/manga/${mangaId}/chapter/${prevChapter.id}`
  }

  useKeyboard({
    ArrowRight: goNext,
    ArrowLeft: goPrev,
    ArrowDown: goNext,
    ArrowUp: goPrev,
    ' ': goNext,
    Escape: () => setSettingsOpen(false),
  })

  // Turbo preload: preload next 3 pages
  useEffect(() => {
    if (!settings.turboMode || pages.length === 0) return
    for (let i = currentPage + 1; i <= Math.min(currentPage + 3, pages.length - 1); i++) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = pages[i]
    }
  }, [currentPage, pages, settings.turboMode])

  const chapterTitle = currentChapter
    ? currentChapter.title
      ? `Cap. ${currentChapter.chapter} — ${currentChapter.title}`
      : `Capítulo ${currentChapter.chapter}`
    : `Capítulo`

  return (
    <div
      className="fixed inset-0 bg-black flex flex-col reader-page overflow-hidden"
      onMouseMove={resetUiTimer}
      onTouchStart={resetUiTimer}
    >
      {/* Top bar */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 z-50 transition-transform duration-300',
          uiVisible ? 'translate-y-0' : '-translate-y-full'
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/90 to-transparent">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Link
              href={`/manga/${mangaId}`}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
            </Link>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{chapterTitle}</p>
              {totalPages > 0 && (
                <p className="text-white/60 text-xs">
                  {settings.mode === 'horizontal'
                    ? `${currentPage + 1} / ${totalPages}`
                    : `${totalPages} páginas`}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Mode toggle */}
            <button
              onClick={() => updateSettings({ mode: settings.mode === 'vertical' ? 'horizontal' : 'vertical' })}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              title={settings.mode === 'vertical' ? 'Modo horizontal' : 'Modo vertical'}
            >
              {settings.mode === 'vertical'
                ? <LayoutPanelLeft className="w-4 h-4 text-white" />
                : <AlignJustify className="w-4 h-4 text-white" />}
            </button>

            {/* Settings */}
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <Settings className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Settings panel */}
      {settingsOpen && (
        <div className="absolute top-16 right-3 z-50 bg-zinc-900/95 border border-white/10 rounded-xl p-4 w-64 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-sm font-semibold">Configuracoes</h3>
            <button onClick={() => setSettingsOpen(false)} className="text-white/60 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            <ToggleSetting
              label="Modo Turbo"
              description="Pre-carrega proximas paginas"
              icon={<Zap className="w-3.5 h-3.5" />}
              value={settings.turboMode}
              onChange={(v) => updateSettings({ turboMode: v })}
            />
            <ToggleSetting
              label="Leitura Continua"
              description="Proximo capitulo automatico"
              icon={<RefreshCw className="w-3.5 h-3.5" />}
              value={settings.continuousReading}
              onChange={(v) => updateSettings({ continuousReading: v })}
            />
            <ToggleSetting
              label="Economia de dados"
              description="Imagens em resolucao menor"
              icon={<BookOpen className="w-3.5 h-3.5" />}
              value={settings.dataSaver}
              onChange={(v) => updateSettings({ dataSaver: v })}
            />

            {/* Zoom (horizontal only) */}
            {settings.mode === 'horizontal' && (
              <div className="space-y-1.5 pt-1">
                <p className="text-xs text-white/60">Zoom ({Math.round(zoom * 100)}%)</p>
                <input
                  type="range"
                  min={50}
                  max={200}
                  value={zoom * 100}
                  onChange={(e) => setZoom(Number(e.target.value) / 100)}
                  className="w-full accent-indigo-500"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* VERTICAL MODE */}
      {settings.mode === 'vertical' && (
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto"
          onClick={() => setUiVisible((v) => !v)}
        >
          {isLoading && (
            <div className="flex items-center justify-center h-screen">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          )}
          <div className="flex flex-col items-center">
            {pages.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`Página ${i + 1}`}
                className="w-full max-w-3xl"
                loading={i < 3 ? 'eager' : 'lazy'}
                crossOrigin="anonymous"
              />
            ))}

            {/* Next chapter prompt */}
            {pages.length > 0 && settings.continuousReading && (
              <div className="w-full max-w-3xl py-12 flex flex-col items-center gap-4 border-t border-white/10">
                <p className="text-white/60 text-sm">Fim do capitulo</p>
                {nextChapter ? (
                  <button
                    onClick={goNextChapter}
                    className="px-6 py-2.5 rounded-full bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-colors flex items-center gap-2"
                  >
                    Proximo capitulo <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <Link
                    href={`/manga/${mangaId}`}
                    className="px-6 py-2.5 rounded-full bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
                  >
                    Voltar ao manga
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* HORIZONTAL MODE */}
      {settings.mode === 'horizontal' && (
        <div className="flex-1 flex items-center justify-center relative overflow-hidden">
          {isLoading && (
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          )}

          {!isLoading && pages.length > 0 && (
            <img
              key={currentPage}
              src={pages[currentPage]}
              alt={`Página ${currentPage + 1}`}
              className="max-h-full max-w-full object-contain transition-opacity duration-150"
              style={{ transform: `scale(${zoom})` }}
              crossOrigin="anonymous"
            />
          )}

          {/* Left / Right tap zones */}
          <button
            onClick={goPrev}
            className="absolute left-0 top-0 h-full w-1/3 flex items-center justify-start pl-3 opacity-0 hover:opacity-100 transition-opacity"
            aria-label="Página anterior"
          >
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <ChevronLeft className="w-5 h-5 text-white" />
            </div>
          </button>
          <button
            onClick={goNext}
            className="absolute right-0 top-0 h-full w-1/3 flex items-center justify-end pr-3 opacity-0 hover:opacity-100 transition-opacity"
            aria-label="Próxima página"
          >
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <ChevronRight className="w-5 h-5 text-white" />
            </div>
          </button>
        </div>
      )}

      {/* Bottom bar */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 z-50 transition-transform duration-300',
          uiVisible ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        <div className="bg-gradient-to-t from-black/90 to-transparent px-4 pt-6 pb-4 space-y-3">
          {/* Chapter navigation */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={goPrevChapter}
              disabled={!prevChapter}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs disabled:opacity-30 hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              {prevChapter ? `Cap. ${prevChapter.chapter}` : 'Primeiro'}
            </button>

            <Link
              href={`/manga/${mangaId}`}
              className="flex items-center gap-1 text-xs text-white/60 hover:text-white"
            >
              <BookOpen className="w-3.5 h-3.5" /> Lista
            </Link>

            <button
              onClick={goNextChapter}
              disabled={!nextChapter}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs disabled:opacity-30 hover:bg-white/20 transition-colors"
            >
              {nextChapter ? `Cap. ${nextChapter.chapter}` : 'Último'}
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Page scrubber (horizontal mode) */}
          {settings.mode === 'horizontal' && totalPages > 1 && (
            <div className="space-y-1">
              <input
                type="range"
                min={0}
                max={totalPages - 1}
                value={currentPage}
                onChange={(e) => setCurrentPage(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-white/40">
                <span>1</span>
                <span>{totalPages}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ToggleSetting({
  label,
  description,
  icon,
  value,
  onChange,
}: {
  label: string
  description: string
  icon: React.ReactNode
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-indigo-400 flex-shrink-0">{icon}</span>
        <div className="min-w-0">
          <p className="text-white text-xs font-medium">{label}</p>
          <p className="text-white/40 text-[10px] truncate">{description}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={cn(
          'flex-shrink-0 w-10 h-5 rounded-full transition-colors relative',
          value ? 'bg-indigo-600' : 'bg-white/20'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform',
            value ? 'translate-x-5' : 'translate-x-0.5'
          )}
        />
      </button>
    </div>
  )
}
