-- F4 Ops Avanzado: internal notes on orders, alert lifecycle timestamps, perf indexes.

-- orders.internal_notes: jsonb array of { id, author_id, body, created_at }
ALTER TABLE "orders"
  ADD COLUMN IF NOT EXISTS "internal_notes" JSONB NOT NULL DEFAULT '[]'::jsonb;

-- monitor_alerts: explicit lifecycle timestamps for archived/dismissed states
ALTER TABLE "monitor_alerts"
  ADD COLUMN IF NOT EXISTS "archived_at"  TIMESTAMPTZ(6),
  ADD COLUMN IF NOT EXISTS "dismissed_at" TIMESTAMPTZ(6);

-- Composite index supports /ops/pedidos filtering by status + ordering by created_at DESC.
CREATE INDEX IF NOT EXISTS "orders_status_created_at_idx"
  ON "orders" ("status", "created_at" DESC);

-- Composite index supports /ops/alertas filtering by source + ordering by published_at DESC.
CREATE INDEX IF NOT EXISTS "monitor_alerts_source_published_at_idx"
  ON "monitor_alerts" ("source", "published_at" DESC);
