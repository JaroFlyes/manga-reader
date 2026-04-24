import type { FavoriteEntry, HistoryEntry, ReadStatus, ReaderSettings, Manga, Chapter } from './types'

// ─── KEYS ────────────────────────────────────────────────────────────────────
const FAVORITES_KEY = 'mangaverse_favorites'
const HISTORY_KEY = 'mangaverse_history'
const READ_STATUS_KEY = 'mangaverse_read_status'
const SETTINGS_KEY = 'mangaverse_settings'
const THEME_KEY = 'mangaverse_theme'

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function get<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const item = localStorage.getItem(key)
    return item ? (JSON.parse(item) as T) : fallback
  } catch {
    return fallback
  }
}

function set<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage full or unavailable
  }
}

// ─── FAVORITES ───────────────────────────────────────────────────────────────
export const favoritesStore = {
  getAll(): FavoriteEntry[] {
    return get<FavoriteEntry[]>(FAVORITES_KEY, [])
  },

  add(manga: Manga): void {
    const entries = this.getAll()
    if (entries.some((e) => e.manga.id === manga.id)) return
    entries.unshift({ manga, addedAt: new Date().toISOString() })
    set(FAVORITES_KEY, entries)
  },

  remove(mangaId: string): void {
    const entries = this.getAll().filter((e) => e.manga.id !== mangaId)
    set(FAVORITES_KEY, entries)
  },

  has(mangaId: string): boolean {
    return this.getAll().some((e) => e.manga.id === mangaId)
  },

  toggle(manga: Manga): boolean {
    if (this.has(manga.id)) {
      this.remove(manga.id)
      return false
    } else {
      this.add(manga)
      return true
    }
  },
}

// ─── HISTORY ─────────────────────────────────────────────────────────────────
export const historyStore = {
  getAll(): HistoryEntry[] {
    return get<HistoryEntry[]>(HISTORY_KEY, [])
  },

  upsert(manga: Manga, chapter: Chapter, pageIndex: number, totalPages: number): void {
    const entries = this.getAll().filter(
      (e) => !(e.manga.id === manga.id && e.chapter.id === chapter.id)
    )
    entries.unshift({
      manga,
      chapter,
      pageIndex,
      totalPages,
      readAt: new Date().toISOString(),
    })
    // keep last 100 entries
    set(HISTORY_KEY, entries.slice(0, 100))
  },

  getForManga(mangaId: string): HistoryEntry[] {
    return this.getAll().filter((e) => e.manga.id === mangaId)
  },

  getLastChapter(mangaId: string): HistoryEntry | null {
    return this.getForManga(mangaId)[0] ?? null
  },

  clear(): void {
    set(HISTORY_KEY, [])
  },
}

// ─── READ STATUS ─────────────────────────────────────────────────────────────
export const readStatusStore = {
  getAll(): ReadStatus {
    return get<ReadStatus>(READ_STATUS_KEY, {})
  },

  isRead(chapterId: string): boolean {
    return Boolean(this.getAll()[chapterId])
  },

  markRead(chapterId: string): void {
    const status = this.getAll()
    status[chapterId] = true
    set(READ_STATUS_KEY, status)
  },

  markUnread(chapterId: string): void {
    const status = this.getAll()
    delete status[chapterId]
    set(READ_STATUS_KEY, status)
  },

  toggle(chapterId: string): boolean {
    if (this.isRead(chapterId)) {
      this.markUnread(chapterId)
      return false
    } else {
      this.markRead(chapterId)
      return true
    }
  },
}

// ─── READER SETTINGS ─────────────────────────────────────────────────────────
const DEFAULT_SETTINGS: ReaderSettings = {
  mode: 'vertical',
  turboMode: false,
  continuousReading: true,
  dataSaver: false,
}

export const settingsStore = {
  get(): ReaderSettings {
    return { ...DEFAULT_SETTINGS, ...get<Partial<ReaderSettings>>(SETTINGS_KEY, {}) }
  },

  set(settings: Partial<ReaderSettings>): void {
    set(SETTINGS_KEY, { ...this.get(), ...settings })
  },
}

// ─── THEME ───────────────────────────────────────────────────────────────────
export const themeStore = {
  get(): 'dark' | 'light' {
    return get<'dark' | 'light'>(THEME_KEY, 'dark')
  },

  set(theme: 'dark' | 'light'): void {
    set(THEME_KEY, theme)
  },
}
