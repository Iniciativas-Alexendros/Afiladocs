# drafts/

Una carpeta por SKU. Contenido esperado (los archivos se crean conforme avanza el go-live):

```
drafts/<SKU>/
├── README.md              # stub con referencias legales + campos DocuSeal previstos
├── draft-v0.1.0.md        # borrador inicial del texto legal
├── notes-legal.md         # observaciones de la QA juridica humana
├── draft-v1.0.0.md        # texto final tras incorporar notas
├── master-v1.0.0.docx     # DOCX maqueteado final (opcional aqui, puede vivir solo en Storage)
└── smoke-test.md          # evidencias del smoke test end-to-end (ID pedido, capturas)
```

Ya creados como referencia completa: `AFD-RGPD-CES-001/README.md` (template fill_and_sign),
`AFD-REV-CONTRACT-001/README.md` (review humano). Los 8 restantes se pueblan al llegar a esos
SKUs en la ejecucion del playbook (`~/.claude/skills/AFILADOCS_golive/PLAYBOOK.md` §"Orden
sugerido de ejecucion").

## Reglas

- No commitear PDFs/DOCX > 1 MB; si pesan mas, mantenerlos solo en Supabase Storage.
- Toda edicion de un `draft-vX.Y.Z.md` con cambio sustantivo requiere bump de `version` en
  `catalog/manifest.json` + entrada en el `changelog` del SKU.
- Nunca subir un DOCX con campos {{...}} no mapeados en DocuSeal (romperia el flujo del
  submission).
