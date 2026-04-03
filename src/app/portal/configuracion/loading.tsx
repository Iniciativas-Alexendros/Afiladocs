export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse max-w-2xl">
      <div className="space-y-2">
        <div className="h-8 w-48 bg-slate-200 rounded-md" />
        <div className="h-4 w-64 bg-slate-100 rounded-md" />
      </div>
      <div className="rounded-xl border border-slate-200 p-6 space-y-4 bg-white">
        <div className="h-6 w-32 bg-slate-200 rounded" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-24 bg-slate-100 rounded" />
            <div className="h-10 bg-slate-100 rounded-md" />
          </div>
        ))}
        <div className="h-10 w-32 bg-slate-200 rounded-md" />
      </div>
    </div>
  )
}
