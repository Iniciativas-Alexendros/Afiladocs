-- supabase/migrations/00003_rls.sql
-- Row Level Security policies for all tables

-- ACTIVAR RLS EN TODAS LAS TABLAS
ALTER TABLE orders           ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents        ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log        ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitor_alerts   ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────────────────────
-- PROFILES
-- ──────────────────────────────────────────────────────────
CREATE POLICY "profiles_own"    ON profiles FOR ALL    USING (auth.uid() = id);
CREATE POLICY "profiles_ops"    ON profiles FOR SELECT USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('ops','admin')
);

-- ──────────────────────────────────────────────────────────
-- ORDERS: clientes ven sus pedidos; ops ven todos
-- ──────────────────────────────────────────────────────────
CREATE POLICY "orders_own"         ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "orders_ops"         ON orders FOR ALL    USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('ops','admin')
);
CREATE POLICY "orders_insert_own"  ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────────
-- DOCUMENTS: clientes ven documentos de sus pedidos
-- ──────────────────────────────────────────────────────────
CREATE POLICY "docs_own" ON documents FOR SELECT USING (
  order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
);
CREATE POLICY "docs_ops" ON documents FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('ops','admin')
);

-- ──────────────────────────────────────────────────────────
-- AUDIT_LOG: solo ops/admin, no clientes
-- ──────────────────────────────────────────────────────────
CREATE POLICY "audit_ops" ON audit_log FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('ops','admin')
);

-- ──────────────────────────────────────────────────────────
-- MONITOR_ALERTS: solo ops/admin
-- ──────────────────────────────────────────────────────────
CREATE POLICY "alerts_ops" ON monitor_alerts FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('ops','admin')
);

-- ──────────────────────────────────────────────────────────
-- SUBSCRIPTIONS: propio usuario + ops
-- ──────────────────────────────────────────────────────────
CREATE POLICY "subs_own" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "subs_ops" ON subscriptions FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('ops','admin')
);

-- DOWN:
-- DROP POLICY IF EXISTS "subs_ops" ON subscriptions;
-- DROP POLICY IF EXISTS "subs_own" ON subscriptions;
-- DROP POLICY IF EXISTS "alerts_ops" ON monitor_alerts;
-- DROP POLICY IF EXISTS "audit_ops" ON audit_log;
-- DROP POLICY IF EXISTS "docs_ops" ON documents;
-- DROP POLICY IF EXISTS "docs_own" ON documents;
-- DROP POLICY IF EXISTS "orders_insert_own" ON orders;
-- DROP POLICY IF EXISTS "orders_ops" ON orders;
-- DROP POLICY IF EXISTS "orders_own" ON orders;
-- DROP POLICY IF EXISTS "profiles_ops" ON profiles;
-- DROP POLICY IF EXISTS "profiles_own" ON profiles;
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE monitor_alerts DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE audit_log DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
