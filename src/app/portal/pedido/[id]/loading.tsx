export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-slate-200 rounded-md" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-32 bg-slate-100 rounded-xl border border-slate-200" />
        <div className="h-32 bg-slate-100 rounded-xl border border-slate-200" />
      </div>
      <div className="h-48 bg-slate-100 rounded-xl border border-slate-200" />
    </div>
  )
}
