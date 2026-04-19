# catalog/

Fuente de verdad de trazabilidad del catalogo de productos Afiladocs.

No contiene codigo ejecutable — es **metadata** sobre los 10 SKUs del seed
(`prisma/seeds/products.json`) para trackear que los DOCX master, las templates DocuSeal
y los prices Stripe se mantienen coherentes entre si a lo largo del tiempo.

Esta carpeta es consumida por:

- La skill `~/.claude/skills/AFILADOCS_golive/` (playbook y referencias legales).
- El agente `~/.claude/agents/afiladocs-golive-auditor.md` (verifica que BD + Stripe +
  DocuSeal + Storage siguen coherentes con `manifest.json`).
- El script `scripts/audit-catalog.ts` (CLI, llamable desde el agente o manualmente).

## Estructura

```
catalog/
├── README.md                     # este archivo
├── manifest.json                 # fuente de verdad por SKU (version, hashes, IDs externos)
├── drafts/
│   ├── <SKU>/
│   │   ├── draft-vX.Y.Z.md       # texto fuente de la plantilla legal
│   │   ├── notes-legal.md        # observaciones de la revision juridica
│   │   ├── smoke-test.md         # evidencias del smoke test end-to-end
│   │   └── master-vX.Y.Z.docx    # DOCX maqueteado final (opcional en repo, o en Storage)
└── audit-reports/
    └── YYYY-MM-DD-<alcance>.md   # reportes generados por el agente auditor
```

Los DOCX master pesan poco, pero si el proyecto los considera fuera de alcance para el repo,
se mantienen solo en Supabase Storage (bucket `templates`) y el hash queda en `manifest.json`.

## Flujo basico

1. Abrir PR editando un SKU en `manifest.json` con la nueva version y bullet en `changelog`.
2. Subir el nuevo `master-vX.Y.Z.docx` a Storage (o al repo bajo `drafts/<SKU>/` si es pequeno).
3. Actualizar `storage_sha256[path]` con el nuevo hash SHA256.
4. Crear/actualizar la template DocuSeal y registrar el `docuseal_template_id`.
5. Crear/actualizar el price Stripe y registrar el `stripe_price_id`.
6. Ejecutar `npx tsx scripts/audit-catalog.ts --sku <SKU>` → esperar ✅.
7. Merge + marcar `is_active=true` en `/ops/productos/<SKU>`.

## Versionado

Semver estricto:

- **Mayor** (`2.0.0`): cambio sustantivo de contenido legal (la plantilla anterior no sirve
  para lo mismo). Rompe compatibilidad con clientes que esperaban la version previa.
- **Menor** (`1.1.0`): anade clausulas o campos sin alterar el sentido juridico esencial.
- **Patch** (`1.0.1`): correccion tipografica, de formato o de metadata (tags DocuSeal, etc.).

## Comandos utiles

```bash
# Generar SHA256 de un DOCX master
sha256sum catalog/drafts/AFD-RGPD-CES-001/master-v1.0.0.docx

# Auditar un SKU
npx tsx scripts/audit-catalog.ts --sku AFD-RGPD-CES-001

# Auditar todos
npx tsx scripts/audit-catalog.ts --all

# Guardar reporte
npx tsx scripts/audit-catalog.ts --all --format md > catalog/audit-reports/$(date +%Y-%m-%d)-all.md
```

## Documentos relacionados

- [`prisma/seeds/products.json`](../prisma/seeds/products.json) — seed BD (fuente de verdad
  de los 10 SKUs y sus metadatos inmutables).
- [`prisma/schema.prisma`](../prisma/schema.prisma) — modelo `products` + `product_packs`.
- [`src/lib/catalog/query.ts`](../src/lib/catalog/query.ts) — queries de lectura del catalogo
  desde la app (usa cache React).
- `~/.claude/skills/AFILADOCS_golive/SKILL.md` — skill orquestadora (planificacion + legal).
- `~/.claude/plans/giggly-strolling-gizmo.md` — plan maestro del pivote a tienda.
