'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Heart, BookOpen, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/providers'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', icon: Home, label: 'Início' },
  { href: '/search', icon: Search, label: 'Buscar' },
  { href: '/favorites', icon: Heart, label: 'Favoritos' },
  { href: '/library', icon: BookOpen, label: 'Biblioteca' },
]

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()

  // hide nav in reader
  const isReader = pathname.includes('/chapter/')

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top bar */}
      {!isReader && (
        <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-sm border-b border-border">
          <div className="max-w-screen-xl mx-auto flex items-center justify-between px-4 h-14">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg tracking-tight text-foreground">
                Manga<span className="text-primary">Verse</span>
              </span>
            </Link>
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>
      )}

      {/* Main content */}
      <main className={cn('flex-1', !isReader && 'pb-20')}>
        {children}
      </main>

      {/* Bottom nav */}
      {!isReader && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-sm border-t border-border">
          <div className="max-w-screen-xl mx-auto flex items-center justify-around h-16 px-2">
            {navItems.map(({ href, icon: Icon, label }) => {
              const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-colors',
                    isActive
                      ? 'text-accent'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon
                    className="w-5 h-5"
                    strokeWidth={isActive ? 2.5 : 1.75}
                  />
                  <span className="text-[10px] font-medium">{label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      )}
    </div>
  )
}
