-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "full_name" TEXT,
    "company_name" TEXT,
    "nif" TEXT,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'client',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "product_id" TEXT NOT NULL,
    "product_sku" TEXT,
    "stripe_session_id" TEXT,
    "stripe_payment_intent" TEXT,
    "amount_cents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'eur',
    "status" TEXT NOT NULL DEFAULT 'intake_pending',
    "eidas_level" TEXT NOT NULL,
    "intake_data" JSONB,
    "intake_completed_at" TIMESTAMPTZ(6),
    "invoice_id" TEXT,
    "invoice_pdf" TEXT,
    "invoiced_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "product_id" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "eidas_level" TEXT NOT NULL,
    "signature_provider" TEXT,
    "documenso_document_id" TEXT,
    "signing_document_id" TEXT,
    "signing_provider" TEXT DEFAULT 'docuseal',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "draft_pdf_path" TEXT,
    "signed_pdf_path" TEXT,
    "hash_sha256_draft" TEXT,
    "hash_sha256_signed" TEXT,
    "signed_at" TIMESTAMPTZ(6),
    "delivery_url_expires" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event" TEXT NOT NULL,
    "order_id" UUID,
    "user_id" UUID,
    "metadata" JSONB,
    "ip_hash" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monitor_alerts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "source" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "urgency" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending_review',
    "raw_url" TEXT,
    "published_at" DATE,
    "areas" TEXT[],
    "reviewed_by" UUID,
    "reviewed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "monitor_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "sku" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description_md" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "price_cents" INTEGER NOT NULL,
    "vat_mode" TEXT NOT NULL DEFAULT 'included',
    "stripe_price_id" TEXT,
    "docuseal_template_id" TEXT,
    "storage_path" TEXT,
    "delivery_mode" TEXT NOT NULL,
    "eidas_level" TEXT NOT NULL DEFAULT 'SES',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("sku")
);

-- CreateTable
CREATE TABLE "product_packs" (
    "pack_sku" TEXT NOT NULL,
    "child_sku" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_packs_pkey" PRIMARY KEY ("pack_sku","child_sku")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "product_id" TEXT NOT NULL DEFAULT 'AFD-LTK-001',
    "stripe_subscription_id" TEXT,
    "stripe_customer_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "normative_profile" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "orders_stripe_session_id_key" ON "orders"("stripe_session_id");

-- CreateIndex
CREATE INDEX "orders_user_id_idx" ON "orders"("user_id");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orders_stripe_session_id_idx" ON "orders"("stripe_session_id");

-- CreateIndex
CREATE INDEX "orders_product_id_created_at_idx" ON "orders"("product_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "orders_product_sku_created_at_idx" ON "orders"("product_sku", "created_at" DESC);

-- CreateIndex
CREATE INDEX "documents_order_id_idx" ON "documents"("order_id");

-- CreateIndex
CREATE INDEX "documents_documenso_document_id_idx" ON "documents"("documenso_document_id");

-- CreateIndex
CREATE INDEX "documents_signing_document_id_idx" ON "documents"("signing_document_id");

-- CreateIndex
CREATE INDEX "documents_status_idx" ON "documents"("status");

-- CreateIndex
CREATE INDEX "audit_log_order_id_created_at_idx" ON "audit_log"("order_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "audit_log_event_created_at_idx" ON "audit_log"("event", "created_at" DESC);

-- CreateIndex
CREATE INDEX "monitor_alerts_status_created_at_idx" ON "monitor_alerts"("status", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE INDEX "products_category_is_active_display_order_idx" ON "products"("category", "is_active", "display_order");

-- CreateIndex
CREATE INDEX "products_is_active_display_order_idx" ON "products"("is_active", "display_order");

-- CreateIndex
CREATE INDEX "product_packs_pack_sku_idx" ON "product_packs"("pack_sku");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripe_subscription_id_key" ON "subscriptions"("stripe_subscription_id");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_product_sku_fkey" FOREIGN KEY ("product_sku") REFERENCES "products"("sku") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_packs" ADD CONSTRAINT "product_packs_pack_sku_fkey" FOREIGN KEY ("pack_sku") REFERENCES "products"("sku") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_packs" ADD CONSTRAINT "product_packs_child_sku_fkey" FOREIGN KEY ("child_sku") REFERENCES "products"("sku") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
