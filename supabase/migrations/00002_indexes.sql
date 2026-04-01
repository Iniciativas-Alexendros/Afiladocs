-- supabase/migrations/00002_indexes.sql
-- Performance indexes for common query patterns

CREATE INDEX idx_orders_user_id         ON orders(user_id);
CREATE INDEX idx_orders_status          ON orders(status);
CREATE INDEX idx_orders_stripe_session  ON orders(stripe_session_id) WHERE stripe_session_id IS NOT NULL;
CREATE INDEX idx_orders_product_created ON orders(product_id, created_at DESC);
CREATE INDEX idx_documents_order_id     ON documents(order_id);
CREATE INDEX idx_documents_documenso    ON documents(documenso_document_id) WHERE documenso_document_id IS NOT NULL;
CREATE INDEX idx_audit_log_order_id     ON audit_log(order_id, created_at DESC);
CREATE INDEX idx_audit_log_event        ON audit_log(event, created_at DESC);
CREATE INDEX idx_monitor_alerts_status  ON monitor_alerts(status, created_at DESC);

-- DOWN:
-- DROP INDEX IF EXISTS idx_monitor_alerts_status;
-- DROP INDEX IF EXISTS idx_audit_log_event;
-- DROP INDEX IF EXISTS idx_audit_log_order_id;
-- DROP INDEX IF EXISTS idx_documents_documenso;
-- DROP INDEX IF EXISTS idx_documents_order_id;
-- DROP INDEX IF EXISTS idx_orders_product_created;
-- DROP INDEX IF EXISTS idx_orders_stripe_session;
-- DROP INDEX IF EXISTS idx_orders_status;
-- DROP INDEX IF EXISTS idx_orders_user_id;
