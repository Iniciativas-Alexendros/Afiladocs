-- supabase/migrations/00001_initial_schema.sql
-- Reversible: DROP TABLE in reverse order of creation

-- EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES (extensión de auth.users)
CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       TEXT,
  company_name    TEXT,
  nif             TEXT,
  phone           TEXT,
  role            TEXT NOT NULL DEFAULT 'client'
    CHECK (role IN ('client','ops','admin')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ORDERS
CREATE TABLE orders (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  product_id            TEXT NOT NULL,
  stripe_session_id     TEXT UNIQUE,
  stripe_payment_intent TEXT,
  amount_cents          INTEGER NOT NULL,
  currency              TEXT NOT NULL DEFAULT 'eur',
  status                TEXT NOT NULL DEFAULT 'intake_pending'
    CHECK (status IN (
      'intake_pending','intake_overdue','in_production',
      'qa_approved','delivered','closed','refunded','manual_review_required'
    )),
  eideas_level          TEXT NOT NULL CHECK (eideas_level IN ('SES','AES')),
  intake_data           JSONB,
  intake_completed_at   TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- DOCUMENTS
CREATE TABLE documents (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id              UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id            TEXT NOT NULL,
  version               TEXT NOT NULL DEFAULT '1.0',
  eideas_level          TEXT NOT NULL CHECK (eideas_level IN ('SES','AES')),
  signature_provider    TEXT,
  documenso_document_id TEXT,
  status                TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','pending_signature','signed','delivered','error')),
  draft_pdf_path        TEXT,
  signed_pdf_path       TEXT,
  hash_sha256_draft     TEXT,
  hash_sha256_signed    TEXT,
  signed_at             TIMESTAMPTZ,
  delivery_url_expires  TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AUDIT LOG
CREATE TABLE audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event       TEXT NOT NULL,
  order_id    UUID REFERENCES orders(id) ON DELETE SET NULL,
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata    JSONB,
  ip_hash     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- MONITOR ALERTS (AFD-LTK-001)
CREATE TABLE monitor_alerts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source       TEXT NOT NULL CHECK (source IN ('BOE','EUR-LEX','AEPD','COM','OTHER')),
  title        TEXT NOT NULL,
  summary      TEXT,
  urgency      TEXT CHECK (urgency IN ('critical','relevant','informative')),
  status       TEXT NOT NULL DEFAULT 'pending_review'
    CHECK (status IN ('pending_review','approved','discarded','sent')),
  raw_url      TEXT,
  published_at DATE,
  areas        TEXT[],
  reviewed_by  UUID REFERENCES auth.users(id),
  reviewed_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SUBSCRIPTIONS (AFD-LTK-001)
CREATE TABLE subscriptions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES auth.users(id),
  product_id              TEXT NOT NULL DEFAULT 'AFD-LTK-001',
  stripe_subscription_id  TEXT UNIQUE,
  status                  TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','cancelled','past_due','trialing')),
  normative_profile       JSONB,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TRIGGER: auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- TRIGGER: updated_at automático
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- DOWN (reverse migration — run manually if needed):
-- DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
-- DROP TRIGGER IF EXISTS subscriptions_updated_at ON subscriptions;
-- DROP TRIGGER IF EXISTS documents_updated_at ON documents;
-- DROP TRIGGER IF EXISTS orders_updated_at ON orders;
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP FUNCTION IF EXISTS set_updated_at();
-- DROP FUNCTION IF EXISTS handle_new_user();
-- DROP TABLE IF EXISTS subscriptions;
-- DROP TABLE IF EXISTS monitor_alerts;
-- DROP TABLE IF EXISTS audit_log;
-- DROP TABLE IF EXISTS documents;
-- DROP TABLE IF EXISTS orders;
-- DROP TABLE IF EXISTS profiles;
