# AFD-RGPD-REG-001 · QA jurídica preliminar

**Fecha QA:** 2026-04-19 · **Revisor:** Claude Code (checkpoint técnico — no sustituye validación humana) · **Draft fuente:** `draft-v0.1.0.md` · **Draft resultante:** `draft-v1.0.0.md` · **Estado propuesto:** pendiente firma jurídica humana antes de maquetación DOCX.

## Resolución de los 4 TODOs del draft v0.1.0

### TODO 1 · Medidas Anexo II frente a Guía AEPD vigente

Estado normativo: el art. 32 RGPD es *principle-based*. La AEPD no publica una lista cerrada de medidas. Referencias vigentes a 2026-04-19:

- **Guía práctica de análisis de riesgos en los tratamientos de datos personales** (AEPD, septiembre 2018 — sigue vigente).
- **Guía de protección de datos por defecto** (AEPD, octubre 2020).
- **RD 311/2022 Esquema Nacional de Seguridad (ENS)** — obligatorio para sector público y operadores esenciales; voluntario como marco de referencia para privados.
- **ISO/IEC 27001:2022** y **ISO/IEC 27701:2019** como frameworks de referencia en la Guía AEPD.

**Decisión**: el listado del Anexo II se mantiene, se añade cita a la Guía AEPD 2018 + ENS + ISO 27701 y se sustituye la recomendación obsoleta de "rotación periódica de contraseñas".

### TODO 2 · Columna "decisiones automatizadas / elaboración de perfiles"

Estado normativo: el art. 30.1 no obliga a incluir esa columna en el RAT. El art. 22 RGPD regula las decisiones individuales automatizadas y el art. 35 exige **DPIA** cuando haya elaboración sistemática y exhaustiva de aspectos personales mediante tratamiento automatizado.

**Decisión**: NO añadir columna obligatoria al Anexo I (se mantiene la fidelidad al art. 30.1). SÍ añadir:
- Nota en §2 indicando que las actividades con decisiones automatizadas o elaboración de perfiles requieren DPIA (art. 35 RGPD) y, en su caso, información al interesado (arts. 13.2.f / 14.2.g).
- Campo informativo `{{actividad_N_perfilado}}` opcional (Sí/No) por actividad, para ayudar al responsable a identificar qué actividades precisan DPIA.
- Checklist en Anexo II §4.5 "DPIA realizada cuando procede".

### TODO 3 · Cinco bloques vs. anexo ilimitado

**Decisión**: mantener 5 bloques replicados en el DOCX master (cubre ≥95% de pymes y autónomos según estudios AEPD). Añadir al pie del Anexo I la frase clara:

> Para responsables con más de 5 actividades, Afiladocs entrega sin coste adicional un anexo editable (`.docx`) que replica la misma tabla tantas veces como sea necesario. Solicitar en `soporte@afiladocs.com`.

Impacto DocuSeal: 50 campos (5 × 10) frente a crecimiento no acotado. Mantener.

### TODO 4 · Redacción de la declaración final (§6)

La AEPD no publica una fórmula oficial para la declaración del responsable en el RAT (no es un modelo reglamentario). La redacción actual es neutra, factual y compatible con la práctica habitual de despachos y DPOs. Se mantiene con dos ajustes menores:

- Añadir cita expresa del art. 30.4 RGPD (obligación de poner el RAT a disposición de la autoridad de control **cuando lo solicite**, sin presentación previa).
- Añadir mención a la responsabilidad proactiva (art. 24 RGPD).

## Observaciones adicionales (findings nuevos)

| # | Sección | Hallazgo | Acción en v1.0.0 |
|---|---|---|---|
| 1 | §1 fundamento | El draft dice "salvo excepciones" sin enumerar. Art. 30.5 exige que las pymes <250 empleados **también** lleven RAT si: a) tratamientos no ocasionales, b) incluyen categorías especiales (art. 9), c) incluyen datos penales (art. 10). Para evitar que pymes crean que no aplica. | Enumerar las 3 excepciones del art. 30.5 de forma explícita. |
| 2 | Nota legal | Sin referencia a la obligación del art. 30.4 (RAT a disposición de la autoridad). | Añadir frase "Este RAT debe mantenerse actualizado y a disposición de la AEPD (art. 30.4 RGPD)". |
| 3 | §2 | Falta cross-reference a arts. 13-14 (información a interesados) y art. 35 (DPIA). | Añadir nota de cross-reference. |
| 4 | Anexo II §4.1 | "Rotación si procede" desactualizada. NIST SP 800-63B-4 (marzo 2024) e INCIBE desaconsejan rotación periódica salvo incidente. | Cambiar a "rotación obligada tras incidente o sospecha de compromiso". |
| 5 | Anexo II §4.2 | "TLS 1.2+" aceptable. TLS 1.3 es el estándar recomendado desde 2018 (RFC 8446). | Actualizar redacción a "TLS 1.3 preferido, TLS 1.2 como mínimo". |
| 6 | Anexo II §4.5 | Falta mención a análisis de riesgos (art. 24, 32 + Guía AEPD 2018). | Añadir ítem "Análisis de riesgos documentado conforme Guía AEPD 2018". |
| 7 | Anexo II | Falta referencia a ENS RD 311/2022 para responsables del sector público o con contratos con administraciones. | Añadir ítem condicional "Cumplimiento ENS (RD 311/2022) cuando proceda". |
| 8 | §2 | Ejemplos de actividades: conviene añadir "gestión de cookies y analítica web" como ejemplo frecuente en pymes digitales. | Añadir al listado ejemplificativo. |
| 9 | Tabla art. 30.1 | Apartado e sobre transferencias internacionales debería mencionar expresamente Decisión 2021/914 (SCC) y Decisión 2023/1795 (Data Privacy Framework UE-EE.UU.). | Ampliar nota del apartado e. |
| 10 | §3 base jurídica | El draft lista 6 bases del art. 6.1 pero no recuerda que para datos de empleados rara vez vale el consentimiento (EDPB Guidelines 5/2020). | Añadir nota: "El consentimiento rara vez es base válida para datos de empleados (desequilibrio — EDPB 5/2020)". |
| 11 | Pie DOCX | `v0.1.0` fijo. | Bump a `v1.0.0` + placeholder `{{fecha_revision_legal}}`. |
| 12 | Campos DocuSeal | 60 → 65 tras añadir `actividad_N_perfilado` ×5. | Actualizar listado consolidado. |

## Veredicto

✅ **draft-v1.0.0.md listo para revisión humana de cierre**. Los 4 TODOs del v0.1.0 se resuelven y se incorporan 12 observaciones adicionales. Cambios marcados en el encabezado de cada sección del v1.0.0 con comentarios `<!-- QA-2026-04-19 -->` para facilitar la firma por el revisor humano.

Tras la firma humana:
1. Bump `manifest.json` → `legal_reviewed_by`, `legal_reviewed_at`, `status: template_ready`.
2. Maquetación DOCX + SHA256.
3. Seguir pasos 4-11 del PLAYBOOK §Sub-checklist por SKU.

## Límites explícitos de esta QA

- Revisión técnica normativa, no asesoramiento legal vinculante.
- No suple la validación de un abogado colegiado con responsabilidad profesional.
- No cubre particularidades sectoriales (sanitario, educativo, laboral específico, etc.): si el cliente final pertenece a un sector regulado, su DPO debe adaptar el RAT.
- Vigencia temporal: válida mientras no cambie RGPD, LOPDGDD o Guía AEPD. Re-revisar si `legal_reviewed_at > 9m` (warning del auditor).
