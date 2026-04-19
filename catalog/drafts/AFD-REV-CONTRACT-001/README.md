# AFD-REV-CONTRACT-001 · Revision experta de contrato

Producto de **revision humana** (sin DOCX master ni template DocuSeal). El cliente sube su
contrato tras el pago; un abogado lo revisa y devuelve informe en 72h.

## Que trackear aqui

- `notes-legal.md` — criterios internos de revision, rubrica de severidad, glosario.
- `smoke-test.md` — evidencias de un flujo de revision real (cliente → ops → entrega).
- `changelog` — en `catalog/manifest.json` cuando se actualicen criterios internos.

## Que NO trackear

- No hay `draft-vX.md` ni `master.docx` — el contrato lo aporta el cliente.
- No hay template DocuSeal.
- No hay `storage_path` publico (solo `documents/<order_id>/review_<ts>.pdf` por pedido).

## Index del informe final (para el revisor humano)

Ver `~/.claude/skills/AFILADOCS_golive/INDICE_CONTENIDOS.md` seccion "H · Revision experta".
