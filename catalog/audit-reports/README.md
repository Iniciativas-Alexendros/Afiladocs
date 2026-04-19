# audit-reports/

Salidas del agente `afiladocs-golive-auditor` y del script `scripts/audit-catalog.ts`.

**Convencion de nombre:** `YYYY-MM-DD-<alcance>.md`.

Ejemplos:
- `2026-04-18-all.md` — auditoria mensual completa.
- `2026-04-18-AFD-RGPD-CES-001.md` — auditoria puntual pre-activacion.

Los reportes son artefactos de consulta, no fuente de verdad. La verdad vive en
`../manifest.json` + la realidad en Stripe/DocuSeal/Storage/BD. Si un reporte antiguo
contradice el estado actual, regenerarlo antes de actuar.

Politica de retencion: mantener reportes mensuales indefinidamente (son chicos); los
reportes puntuales se pueden purgar tras 90 dias.
