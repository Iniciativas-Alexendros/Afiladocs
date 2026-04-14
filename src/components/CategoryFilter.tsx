import Link from 'next/link'
import type { Route } from 'next'
import { Badge } from '@/components/ui/badge'

const LABELS: Record<string, string> = {
  all: 'Todas',
  rgpd: 'RGPD',
  arrendamiento: 'Arrendamiento',
  civil: 'Civil',
  mercantil: 'Mercantil',
  pack: 'Packs',
  reclamacion: 'Reclamaciones',
  review: 'Revisiones expertas',
}

export function CategoryFilter({ active, categories }: { active: string; categories: string[] }) {
  const all = ['all', ...categories]
  return (
    <nav aria-label="Filtrar por categoría" className="flex flex-wrap gap-2">
      {all.map(c => {
        const isActive = active === c
        const href = (c === 'all' ? '/tienda' : `/tienda/${c}`) as Route
        return (
          <Link key={c} href={href} aria-current={isActive ? 'page' : undefined}>
            <Badge
              variant={isActive ? 'default' : 'outline'}
              className={isActive ? '' : 'hover:bg-accent cursor-pointer'}
            >
              {LABELS[c] ?? c}
            </Badge>
          </Link>
        )
      })}
    </nav>
  )
}
