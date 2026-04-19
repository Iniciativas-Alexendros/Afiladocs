# Catálogo Afiladocs — ciclo de vida de plantillas

**Última revisión:** 2026-04-19
**Ámbito:** los 10 SKUs del seed ([prisma/seeds/products.json](../prisma/seeds/products.json)) desde draft jurídico hasta `status: live` en producción.

El catálogo vive en 4 fuentes que deben mantenerse coherentes: **BD Prisma** (`products`), **`catalog/manifest.json`** (trazabilidad), **Stripe LIVE** (precios) y **DocuSeal self-hosted** (templates). Este doc explica cómo fluye una plantilla entre las 4 y cómo se audita.

Para el orden operativo del go-live → [runbooks/golive-stripe-live.md](runbooks/golive-stripe-live.md).

## Estructura del árbol `catalog/`

```text
catalog/
├── README.md                     # convenciones locales del directorio
├── manifest.json                 # fuente de verdad de trazabilidad (IDs externos, hashes, revisión legal)
├── drafts/
│   └── <SKU>/
│       ├── draft-vX.Y.Z.md       # texto fuente de la plantilla legal (versionado)
│       ├── notes-legal.md        # observaciones de la QA jurídica
│       ├── smoke-test.md         # evidencias del smoke test end-to-end
│       └── master-vX.Y.Z.docx    # DOCX maqueteado (opcional en repo; preferente en Storage)
└── audit-reports/
    └── YYYY-MM-DD-<alcance>.md   # reportes generados por audit-catalog.ts
```

El DOCX master puede vivir en repo (si es pequeño) o sólo en Supabase Storage bucket `templates` — el hash SHA256 queda registrado en `manifest.storage_sha256` en ambos casos.

## Fuentes de verdad (regla autoritativa)

| Información | Autoritativo | Fuente |
|---|---|---|
| SKU, title, price_cents, delivery_mode, eidas_level | Prisma | [prisma/seeds/products.json](../prisma/seeds/products.json) → migración seed |
| `stripe_price_id`, `docuseal_template_id`, versión, `legal_sources`, hashes Storage | Repo | [catalog/manifest.json](../catalog/manifest.json) |
| `is_active` (visibilidad tienda) | BD en vivo | `products` via `/ops/productos` |
| `Status` kanban, notas colaborativas | Notion | DB `📦 Catálogo Afiladocs · vigente` |

El repo es canónico frente a Notion en todo lo que afecte a producción (IDs externos, versiones, referencias legales). Notion es canónico sólo para `Status` del kanban y `Notas`. Ver detalle en `~/.claude/skills/AFILADOCS_golive/NOTION_INTEGRATION.md`.

## Ciclo de vida por SKU

```
draft → qa_legal → template_ready → live → (retired)
```

### 1. `draft` → redacción

- **[C]** Copiar skeleton de `~/.claude/skills/AFILADOCS_golive/INDICE_CONTENIDOS.md` según familia (RGPD / arrendamiento / civil / pack / review).
- **[C]** Redactar con las referencias de `REFERENCIAS_LEGALES.md`. Marcar campos con `{{snake_case}}` consistente.
- **[C]** Guardar como `catalog/drafts/<sku>/draft-v0.1.0.md`.

### 2. `qa_legal` → revisión jurídica

- **[A]** Revisión humana del draft (propio o abogado externo). Observaciones en `notes-legal.md`.
- **[C]** Incorpora cambios → `draft-v1.0.0.md`. Entry en `changelog` del SKU en manifest (`date`, `author`, `note` en 1 línea).
- **[C]** Poblar `legal_reviewed_by`, `legal_reviewed_at` en manifest (ISO timestamp).

**Precedente:** `AFD-RGPD-REG-001` tiene QA jurídica preliminar ejecutada por Claude Code en `notes-legal.md` (2026-04-19, 12 findings, 65 campos DocuSeal). Pendiente firma humana antes de maquetación DOCX.

### 3. `template_ready` → maquetado y templates

**Maquetado DOCX:**
- **[C]** Draft final → DOCX con estilos Afiladocs (fuente, tamaños, cabecera legal, pie con SKU+version).
- **[C]** `catalog/drafts/<sku>/master-v<version>.docx` + `sha256sum` → anotar en `manifest.storage_sha256`.
- Para `AFD-RGPD-BASE-001`: empaquetar ZIP con los 4 DOCX del pack + `LEEME.pdf`.

**Subida a Storage:**
- **[A]** Subir el DOCX/ZIP al bucket `templates` de Supabase (privado, no lectura pública).
  Ruta: `<categoria>/<sku>/master-v<version>.<ext>` (p.ej. `rgpd/AFD-RGPD-CES-001/master-v1.0.0.docx`).
- **[C]** Registrar en `manifest.storage_paths[]`.

**Template DocuSeal** (8 SKUs con delivery_mode docuseal_*):
- **[A]** DocuSeal UI → Templates → New → subir DOCX → anotar cada `{{campo}}` como Field tipado.
- `signature` fields sólo en `fill_and_sign`. Habilitar verificación SMS/certificado en SKUs AES.
- Publicar, copiar template ID.
- **[C]** Actualizar `manifest.docuseal_template_id` + `docuseal_last_verified`.

### 4. `live` → alta en Stripe + activación

Detallado en [runbooks/golive-stripe-live.md](runbooks/golive-stripe-live.md). Resumen:

1. Crear product + price en Stripe LIVE con metadata `sku`, `afiladocs_category`, `eidas_level`.
2. Actualizar `manifest.stripe_price_id` + `stripe_last_verified`.
3. Ejecutar `audit-catalog.ts --sku <SKU>` → exigir ✅.
4. `/ops/productos/[sku]` → pegar IDs externos → `is_active=true`.
5. Bump `manifest.status: live` + changelog entry.

### 5. `retired` → retirada

- **[A]** `/ops/productos/[sku]` → `is_active=false`.
- **[C]** `manifest.status: retired` (definitivo) o `qa_legal` (reprocesar).
- El SKU desaparece de `/tienda`; pedidos pagados siguen `dispatchByProductKind` normal (independiente de `is_active`).

## Versionado (semver estricto)

- **Mayor** (`2.0.0`): cambio sustantivo del contenido legal (plantilla anterior no sirve). Rompe compatibilidad con clientes que esperaban la versión previa.
- **Menor** (`1.1.0`): añade cláusulas o campos sin alterar el sentido jurídico esencial.
- **Patch** (`1.0.1`): corrección tipográfica, de formato o de metadata (tags DocuSeal, etc.).

Cualquier bump debe ir acompañado de entry en `manifest.products[N].changelog` con `date`, `author`, `note` en una línea.

## Audit catalog

Script: [scripts/audit-catalog.ts](../scripts/audit-catalog.ts). No modifica ninguna fuente — sólo lee y reporta coherencia.

### Uso

```bash
# Un SKU
npx tsx scripts/audit-catalog.ts --sku AFD-RGPD-CES-001

# Todos los SKUs
npx tsx scripts/audit-catalog.ts --all

# Guardar reporte
npx tsx scripts/audit-catalog.ts --all --format md > catalog/audit-reports/$(date +%Y-%m-%d)-all.md

# Output JSON (para pipelines)
npx tsx scripts/audit-catalog.ts --all --format json
```

### Qué verifica

| Check | Severidad | Condición |
|---|---|---|
| `bd.exists` | critical | `products.sku` existe en BD |
| `bd.stripe_price_id` | warn | BD ↔ manifest coinciden |
| `bd.docuseal_template_id` | warn | BD ↔ manifest coinciden |
| `bd.is_active_vs_status` | critical | `is_active=true` ↔ `manifest.status=live` |
| `legal.review_age` | warn > 9m · critical > 12m | `legal_reviewed_at` dentro de ventana de revisión |
| `stripe.price.active` | critical | Price activo en Stripe (requiere `STRIPE_SECRET_KEY`) |
| `stripe.price.currency` | warn | `eur` |
| `stripe.price.recurring` | critical | Debe ser `null` (no recurring) |
| `stripe.price.metadata` | warn | `metadata.sku == manifest.sku` |
| `docuseal.template` | critical | Template accesible via `DOCUSEAL_API_URL` (requiere `DOCUSEAL_API_KEY`) |

### Exit codes

- `0` → todos ✅ READY (o partial/skipped si faltan credenciales, pero sin criticals).
- `1` → al menos un SKU en ❌ BLOCK (un check `critical`).
- `2` → error de invocación (SKU no encontrado, `DATABASE_URL` no definida, args inválidos).

### Verdict por SKU

- ✅ **READY** — todos los checks `ok`.
- 🟡 **WARN** — al menos un `warn`, ningún `critical`.
- ❌ **BLOCK** — al menos un `critical`. **No activar `is_active=true`.**
- ⏭️ **PARTIAL** — algunos checks saltados por credenciales ausentes (p.ej. sin `STRIPE_SECRET_KEY`).

### Variables de entorno

Mínimo: `DATABASE_URL` (obligatorio). Para cobertura completa: `STRIPE_SECRET_KEY` + `DOCUSEAL_API_URL` + `DOCUSEAL_API_KEY`. Sin ellas los checks externos se marcan `skipped` y el verdict es `PARTIAL` en lugar de `READY`.

### Agente asociado

El auditor `afiladocs-golive-auditor` (`~/.claude/agents/`) orquesta este script + MCP Stripe + chequeos extra (ej. matching de fields DocuSeal con `{{campos}}` del draft). Se invoca via Task tool desde la skill `AFILADOCS_golive`.

## Comandos útiles

```bash
# Generar SHA256 de un DOCX master
sha256sum catalog/drafts/AFD-RGPD-CES-001/master-v1.0.0.docx

# Ver changelog del manifest
jq '.products[] | select(.sku=="AFD-RGPD-REG-001") | .changelog' catalog/manifest.json

# Listar SKUs por status
jq '.products[] | {sku, status}' catalog/manifest.json
```

## Referencias

- [CLAUDE.md § P0b](../CLAUDE.md#p0b--go-live-stripe-live) — estado canónico del go-live.
- [runbooks/golive-stripe-live.md](runbooks/golive-stripe-live.md) — runbook operativo paso a paso.
- [prisma/seeds/products.json](../prisma/seeds/products.json) — seed BD (fuente inmutable de los 10 SKUs).
- [src/lib/catalog/query.ts](../src/lib/catalog/query.ts) — queries de lectura con cache.
- [catalog/README.md](../catalog/README.md) — convenciones locales del directorio.
- `~/.claude/skills/AFILADOCS_golive/` — skill orquestadora (planificación + referencias legales + playbook extendido).
