# AFD-RGPD-CES-001 · Contrato de encargado del tratamiento

**Categoria:** rgpd · **Kind:** template · **Delivery:** docuseal_fill_and_sign · **eIDAS:** AES

## Referencias legales aplicables

Ver tabla maestra en `~/.claude/skills/AFILADOCS_golive/REFERENCIAS_LEGALES.md` — fila
`AFD-RGPD-CES-001`. Resumen: RGPD art. 28; LOPDGDD art. 33; Decision (UE) 2021/915.

## Indice de contenidos

Ver `~/.claude/skills/AFILADOCS_golive/INDICE_CONTENIDOS.md` seccion "F · RGPD · Encargado
del tratamiento".

## Ciclo de vida esperado

- `draft-v0.1.0.md` — borrador inicial (este repo).
- `notes-legal.md` — observaciones de la QA juridica.
- `draft-v1.0.0.md` — tras incorporar notas.
- `master-v1.0.0.docx` — DOCX maqueteado (sube a Storage `rgpd/AFD-RGPD-CES-001/master-v1.0.0.docx`).
- `smoke-test.md` — evidencia del smoke test en Stripe/DocuSeal.

Cuando `master-v1.0.0.docx` esta en Storage, actualizar `storage_sha256` en
`catalog/manifest.json`.

## Campos DocuSeal previstos

- `responsable_nombre` (text), `responsable_nif` (text), `responsable_domicilio` (text).
- `encargado_nombre` (text), `encargado_nif` (text), `encargado_domicilio` (text).
- `objeto_tratamiento` (textarea), `duracion_tratamiento` (text), `naturaleza_fin` (textarea).
- `tipo_datos` (textarea), `categorias_interesados` (textarea).
- `subencargados_autorizados` (checkbox).
- `transferencias_internacionales` (checkbox + text si true).
- `fecha_firma` (date), `lugar_firma` (text).
- `signature_responsable` (signature), `signature_encargado` (signature).
