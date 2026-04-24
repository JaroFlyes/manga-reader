export function MangaGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[2/3] rounded-lg bg-card mb-2" />
          <div className="h-3 bg-card rounded w-full mb-1" />
          <div className="h-2.5 bg-card rounded w-2/3" />
        </div>
      ))}
    </div>
  )
}

export function ChapterListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="animate-pulse space-y-0">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-3 border-b border-border/50">
          <div className="w-0.5 h-8 bg-card rounded-full" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 bg-card rounded w-3/4" />
            <div className="h-2.5 bg-card rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}
