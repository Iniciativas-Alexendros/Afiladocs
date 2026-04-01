import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="space-y-2">
        <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest">
          Error 404
        </p>
        <h1 className="text-4xl font-bold tracking-tight">
          Página no encontrada
        </h1>
        <p className="text-muted-foreground max-w-md">
          La página que buscas no existe o ha sido movida.
        </p>
      </div>
      <Link
        href="/"
        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-6 py-2.5 text-sm font-medium transition-colors"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
