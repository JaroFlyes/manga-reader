'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { favoritesStore, historyStore, readStatusStore, settingsStore } from './store'
import type { Manga, Chapter, ReaderSettings } from './types'

// ─── DEBOUNCE ─────────────────────────────────────────────────────────────────
export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

// ─── FAVORITES ────────────────────────────────────────────────────────────────
export function useFavorites() {
  const [favorites, setFavorites] = useState(favoritesStore.getAll())

  const refresh = useCallback(() => setFavorites(favoritesStore.getAll()), [])

  const toggle = useCallback(
    (manga: Manga) => {
      favoritesStore.toggle(manga)
      refresh()
    },
    [refresh]
  )

  const isFavorite = useCallback(
    (mangaId: string) => favorites.some((f) => f.manga.id === mangaId),
    [favorites]
  )

  return { favorites, toggle, isFavorite, refresh }
}

// ─── HISTORY ─────────────────────────────────────────────────────────────────
export function useHistory() {
  const [history, setHistory] = useState(historyStore.getAll())

  const refresh = useCallback(() => setHistory(historyStore.getAll()), [])

  const addEntry = useCallback(
    (manga: Manga, chapter: Chapter, pageIndex: number, totalPages: number) => {
      historyStore.upsert(manga, chapter, pageIndex, totalPages)
    },
    []
  )

  return { history, addEntry, refresh }
}

// ─── READ STATUS ─────────────────────────────────────────────────────────────
export function useReadStatus(mangaId?: string) {
  const [readStatus, setReadStatus] = useState(readStatusStore.getAll())

  const refresh = useCallback(() => setReadStatus(readStatusStore.getAll()), [])

  const toggle = useCallback(
    (chapterId: string) => {
      readStatusStore.toggle(chapterId)
      refresh()
    },
    [refresh]
  )

  const isRead = useCallback(
    (chapterId: string) => Boolean(readStatus[chapterId]),
    [readStatus]
  )

  return { isRead, toggle, refresh }
}

// ─── READER SETTINGS ─────────────────────────────────────────────────────────
export function useReaderSettings() {
  const [settings, setSettingsState] = useState<ReaderSettings>(settingsStore.get())

  const updateSettings = useCallback((update: Partial<ReaderSettings>) => {
    settingsStore.set(update)
    setSettingsState(settingsStore.get())
  }, [])

  return { settings, updateSettings }
}

// ─── KEYBOARD NAVIGATION ─────────────────────────────────────────────────────
export function useKeyboard(handlers: Record<string, () => void>) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // skip when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const handler = handlers[e.key]
      if (handler) {
        e.preventDefault()
        handler()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handlers])
}

// ─── INTERSECTION OBSERVER ────────────────────────────────────────────────────
export function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, inView }
}
