export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-48 bg-slate-200 rounded-md" />
        <div className="h-4 w-64 bg-slate-100 rounded-md" />
      </div>
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-36 bg-slate-100 rounded-xl border border-slate-200" />
        ))}
      </div>
    </div>
  )
}
