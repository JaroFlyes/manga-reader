export interface Manga {
  id: string
  title: string
  description: string | null
  coverUrl: string | null
  coverFileName: string | null
  genres: string[]
  status: string | null
  author: string | null
  year: number | null
  rating: number | null
}

export interface Chapter {
  id: string
  chapter: string
  volume: string | null
  title: string | null
  publishAt: string | null
  mangaId: string
  mangaTitle: string
  scanlationGroup: string | null
}

export interface ChapterPages {
  baseUrl: string
  hash: string
  pages: string[]
  dataSaverPages: string[]
}

export interface FavoriteEntry {
  manga: Manga
  addedAt: string
}

export interface HistoryEntry {
  manga: Manga
  chapter: Chapter
  pageIndex: number
  totalPages: number
  readAt: string
}

export interface ReadStatus {
  [chapterId: string]: boolean
}

export type ReaderMode = 'vertical' | 'horizontal'

export interface ReaderSettings {
  mode: ReaderMode
  turboMode: boolean
  continuousReading: boolean
  dataSaver: boolean
}

export interface MangaPageProps {
  params: Promise<{ id: string }>
}

export interface ChapterPageProps {
  params: Promise<{ id: string; chapterId: string }>
}
