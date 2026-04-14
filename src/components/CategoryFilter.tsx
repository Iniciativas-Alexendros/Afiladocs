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

interface CategoryFilterProps {
  active: string
  categories: string[]
  /** 'route' (default) → /tienda/[cat] | 'query' → /tienda?cat=[cat] */
  variant?: 'route' | 'query'
}

function buildHref(c: string, variant: 'route' | 'query'): Route {
  if (c === 'all') return '/tienda'
  if (variant === 'query') return `/tienda?cat=${c}` as Route
  return `/tienda/${c}` as Route
}

export function CategoryFilter({ active, categories, variant = 'route' }: CategoryFilterProps) {
  const all = ['all', ...categories]
  return (
    <nav aria-label="Filtrar por categoría" className="flex flex-wrap gap-2">
      {all.map(c => {
        const isActive = active === c
        const href = buildHref(c, variant)
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
