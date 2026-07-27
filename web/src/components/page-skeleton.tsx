import { Skeleton } from '@/components/ui/skeleton'

export function PageSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8">
      <div className="flex items-center gap-2 text-zinc-500 mb-4">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-600 border-t-purple-500" />
        <span className="text-sm">Carregando...</span>
      </div>
      <div className="grid gap-4 w-full max-w-7xl mx-auto md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-lg bg-zinc-900/50" />
        ))}
      </div>
      <Skeleton className="h-64 w-full max-w-7xl mx-auto rounded-lg bg-zinc-900/50 mt-4" />
    </div>
  )
}
