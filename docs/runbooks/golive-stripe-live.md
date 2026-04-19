# Runbook — Go-live catálogo Stripe LIVE (P0b)

**Última revisión:** 2026-04-19
**Responsables:** `[A]` Alejandro (UIs externas, revisión legal) · `[C]` Claude Code (drafts, manifest, audit)
**Bloqueante para:** activar la tienda en producción (hoy todos los SKUs tienen `is_active=false`).
**Requiere:** acceso Stripe Dashboard en modo LIVE, DocuSeal UI admin, Supabase Storage, `/ops/productos` en afiladocs.com.

## Principio

El catálogo vive en 4 fuentes que deben estar alineadas: **BD Prisma** (`products`), **manifest** ([catalog/manifest.json](../../catalog/manifest.json)), **Stripe LIVE** y **DocuSeal self-hosted**. `/ops/productos` sólo activa un SKU cuando sus IDs externos están presentes en BD; el script [audit-catalog.ts](../CATALOG.md#audit-catalog) verifica coherencia antes de activar.

Playbook completo y owners en `~/.claude/skills/AFILADOCS_golive/PLAYBOOK.md` (privado). Este runbook resume los pasos operativos vivibles desde el repo.

## Pre-requisitos

- [ ] `catalog/manifest.json` tiene los 10 SKUs en `status: draft` (scaffolding hecho 2026-04-18).
- [ ] `catalog/drafts/<SKU>/draft-vX.Y.Z.md` existe y ha pasado QA jurídica (con `notes-legal.md` + firma humana).
- [ ] DOCX master subido a Supabase Storage bucket `templates` (privado) con hash registrado en `manifest.storage_sha256`.
- [ ] Stripe LIVE activo (cuenta empresa validada, NIF correcto).
- [ ] DocuSeal self-hosted operativo (`DOCUSEAL_API_URL` accesible con admin).

## 1. Crear productos en Stripe LIVE (10 SKUs)

Por cada SKU del seed en [prisma/seeds/products.json](../../prisma/seeds/products.json):

1. **[A]** Stripe Dashboard → modo **LIVE** (no Test) → Products → New.
2. Campos:
   - Name: `title` del seed.
   - Description: `description_md` condensado.
   - Price: `price_cents / 100` EUR, **one-time** (no recurring).
   - Tax behavior: **Inclusive** si `vat_mode=included`, **Exclusive** si `excluded`.
   - Metadata: `sku=<SKU>`, `afiladocs_category=<categoria>`, `eidas_level=<SES|AES>`.
3. Copiar `price_...` al buffer.
4. **[C]** Actualizar `catalog/manifest.json` → `stripe_price_id` + `stripe_last_verified` (ISO).

**Orden sugerido** (menor → mayor riesgo): REG → POL → NDA → CES → ARR-VIV → ARR-TEMP → ARR-LOC → CPS → BASE (pack) → REV-CONTRACT.

## 2. Crear templates DocuSeal (8 SKUs con DOCX)

Aplica a SKUs con `delivery_mode IN (docuseal_fill_and_sign, docuseal_fill_only)`. Los 2 restantes:
- `AFD-RGPD-BASE-001` → pack ZIP, sin template DocuSeal.
- `AFD-REV-CONTRACT-001` → human review, sin DOCX master.

Por cada SKU con DOCX:

1. **[A]** DocuSeal UI → Templates → New → subir DOCX master.
2. Anotar cada `{{campo}}` como Field tipado (text/date/number/checkbox/signature). `signature` sólo para `fill_and_sign`.
3. Asignar rol `First Party` (firmante) y/o `Form Submitter`.
4. Para AES (arrendamientos y CES): habilitar verificación SMS o certificado digital según `eidas_level`.
5. Publicar, copiar template ID.
6. **[C]** Actualizar manifest → `docuseal_template_id` + `docuseal_last_verified`.

## 3. Mapear en BD vía `/ops/productos` y activar

Por cada SKU (orden libre, recomendado el mismo del paso 1):

1. **[A]** Entrar en `/ops/productos/[sku]` en afiladocs.com.
2. Pegar `stripe_price_id`.
3. Pegar `docuseal_template_id` (sólo si aplica).
4. Pegar `storage_path` (sólo si aplica).
5. **Antes de activar:** ejecutar audit.
   ```bash
   npx tsx scripts/audit-catalog.ts --sku <SKU>
   ```
   Debe devolver ✅ READY. Si sale 🟡 WARN o ❌ BLOCK, resolver y re-auditar.
6. Marcar `is_active=true`. Guardar.
7. **[C]** Bump `status: live` en manifest + entry en `changelog` del SKU.

**Gate bloqueante:** el auditor **debe** devolver ✅ para cada SKU antes de activar. Verifica: BD ↔ manifest coherentes, Stripe price activo + EUR + non-recurring + metadata correcta, DocuSeal template accesible, revisión legal < 9 meses.

## 4. Rotar webhook secret Stripe LIVE

Pendiente desde 2026-04-14 (CLAUDE.md § "P0b — Go-live Stripe LIVE" paso 4):

1. Stripe Dashboard → Webhooks → endpoint `https://afiladocs.com/api/webhooks/stripe` → **Roll signing secret**.
2. Vercel → env vars → `STRIPE_WEBHOOK_SECRET` = nuevo `whsec_...` (scope Production).
3. Redeploy (push commit trivial a `main` o `vercel --prod`).
4. Verificar en Stripe Dashboard → Webhook deliveries que los últimos eventos tienen firma válida.

Runbook completo de rotación: [rotacion-secretos.md §1](rotacion-secretos.md#1-stripe--stripe_secret_key-y-stripe_webhook_secret).

## 5. Smoke test end-to-end (1 por `delivery_mode`)

Mínimo 4 SKUs (uno de cada flujo). Usar cupón 100% descuento para evitar cargos reales, o tarjeta real + refund posterior.

| Flujo | SKU ejemplo | Validar |
|-------|-------------|---------|
| `fill_and_sign` | AFD-RGPD-CES-001 | Email DocuSeal → rellenar+firmar → webhook → PDF en Storage `documents/` → email `document-ready` → descarga en `/portal/pedido/[id]` |
| `fill_only` | AFD-RGPD-REG-001 | Submission en estado `form.completed` sin firma |
| `download_after_payment` | AFD-RGPD-BASE-001 | Email con URL firmada → descarga ZIP antes de 7 días |
| `human_review` | AFD-REV-CONTRACT-001 | Orden `intake_pending` → subir doc cliente en `/portal` → ops entrega informe en `/ops/pedido/[id]` |

**[C]** Registrar evidencias (IDs de pedido, timestamps) en `catalog/drafts/<sku>/smoke-test.md`.

## 6. Cierre

- [ ] `npx tsx scripts/audit-catalog.ts --all` → ✅ en los 10.
- [ ] Los 10 SKUs en `status: live` en manifest.
- [ ] Commit + tag `catalog/golive-v1.0.0`.
- [ ] Actualizar CLAUDE.md § "Estado" → Fase 4 QA y go-live P0b cerrados.
- [ ] Memoria `project_afiladocs_golive_closed.md` en `~/.claude/projects/-var-home-soyalexendros-Apps-afiladocs-website/memory/`.

## Rollback por SKU

Si un SKU falla tras activar (bug en template, normativa cambia, cliente reporta):

1. **[A]** `/ops/productos/[sku]` → `is_active=false`, guardar.
2. **[C]** Manifest: `status: retired` (retirada definitiva) o `status: qa_legal` (reprocesar). Entry en `changelog`.
3. El SKU desaparece de `/tienda`; los pedidos ya pagados siguen su flujo normal (`dispatchByProductKind` no depende de `is_active`).
4. Si la causa es normativa: nuevo draft con `version` incrementada (semver estricto, ver [CATALOG.md](../CATALOG.md#versionado)) y repetir desde Fase 1 del playbook.

## Referencias

- [CATALOG.md](../CATALOG.md) — flujo drafts → DocuSeal, semver, audit script.
- [CLAUDE.md § P0b](../../CLAUDE.md#p0b--go-live-stripe-live) — fuente canónica del estado del go-live.
- [runbooks/stripe-webhook-fallido.md](stripe-webhook-fallido.md) — si un `checkout.session.completed` no procesa.
- [runbooks/recovery-docuseal.md](recovery-docuseal.md) — si el webhook DocuSeal no entrega el PDF firmado.
- `~/.claude/skills/AFILADOCS_golive/PLAYBOOK.md` — playbook extendido con owners por paso (privado del harness).
