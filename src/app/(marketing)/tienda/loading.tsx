import { Skeleton } from '@/components/ui/skeleton'

export default function TiendaLoading() {
  return (
    <section className="py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-10 space-y-4">
          <Skeleton className="h-8 w-48 mx-auto rounded-full" />
          <Skeleton className="h-12 w-full max-w-lg mx-auto" />
          <Skeleton className="h-6 w-full max-w-sm mx-auto" />
        </div>

        <div className="flex justify-center flex-wrap gap-2 mb-10">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-24 rounded-full" />
          ))}
        </div>

        {/* Altura fija por card = CLS 0 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[280px] rounded-xl" />
          ))}
        </div>
      </div>
    </section>
  )
}
