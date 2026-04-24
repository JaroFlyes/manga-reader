import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MangaVerse - Leitor de Mangá & Manhwa',
  description: 'Leia seus mangás e manhwas favoritos com suporte a capítulos, favoritos e histórico de leitura.',
  keywords: ['manga', 'manhwa', 'leitor', 'mangadex', 'anime'],
}

export const viewport: Viewport = {
  themeColor: '#1A1A2E',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="dark bg-background" suppressHydrationWarning>
      <body className={`${geist.className} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
