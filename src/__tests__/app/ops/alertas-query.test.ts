import { describe, expect, it } from 'vitest'
import { AlertFiltersSchema, buildAlertsWhere } from '@/app/ops/alertas/query'

describe('buildAlertsWhere', () => {
  it('returns empty object for no filters', () => {
    expect(buildAlertsWhere({})).toEqual({})
  })

  it('applies status unless all', () => {
    expect(buildAlertsWhere({ status: 'pending_review' })).toEqual({
      status: 'pending_review',
    })
    expect(buildAlertsWhere({ status: 'all' })).toEqual({})
  })

  it('applies urgency and source', () => {
    expect(buildAlertsWhere({ urgency: 'alta', source: 'BOE' })).toMatchObject({
      urgency: 'alta',
      source: 'BOE',
    })
  })

  it('builds published_at range from from/to', () => {
    const where = buildAlertsWhere({ from: '2026-01-01', to: '2026-04-15' }) as {
      published_at: { gte: Date; lte: Date }
    }
    expect(where.published_at.gte).toBeInstanceOf(Date)
    expect(where.published_at.lte).toBeInstanceOf(Date)
  })
})

describe('AlertFiltersSchema', () => {
  it('parses valid input', () => {
    const parsed = AlertFiltersSchema.parse({ status: 'archived' })
    expect(parsed.status).toBe('archived')
  })
})
