'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import type { KpiRange } from '@/lib/prisma/orders'

const OPTIONS: Array<{ value: KpiRange; label: string }> = [
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: '90d', label: '90d' },
  { value: 'mtd', label: 'MTD' },
]

export function KpiRangeFilter({ defaultRange = '30d' }: { defaultRange?: KpiRange }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = (searchParams.get('range') as KpiRange | null) ?? defaultRange

  const update = useCallback(
    (value: KpiRange) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('range', value)
      router.replace(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams],
  )

  return (
    <div
      role="tablist"
      aria-label="Filtro de rango temporal"
      className="inline-flex items-center gap-1 rounded-lg border border-border bg-card p-1"
    >
      {OPTIONS.map((opt) => {
        const active = current === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => update(opt.value)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              active
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export default KpiRangeFilter
