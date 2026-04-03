export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-64 bg-slate-200 rounded-md" />
        <div className="h-4 w-96 bg-slate-100 rounded-md" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-28 bg-slate-100 rounded-xl border border-slate-200" />
        ))}
      </div>
      <div className="space-y-3">
        <div className="h-6 w-48 bg-slate-200 rounded-md" />
        <div className="h-64 bg-slate-100 rounded-xl border border-slate-200" />
      </div>
    </div>
  )
}
