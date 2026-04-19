# AFD-RGPD-REG-001 · Registro de actividades de tratamiento (RAT)

**Version:** 1.0.0-qa (pendiente firma jurídica humana) · **Delivery:** `docuseal_fill_only` · **eIDAS:** SES · **Precio:** 19 €

**Draft base:** `draft-v0.1.0.md` · **QA preliminar:** `notes-legal.md` (Claude Code, 2026-04-19) · **Fuentes legales vigentes:** RGPD arts. 30, 32, 24, 35; LOPDGDD art. 31; Guía AEPD "Análisis de riesgos" (2018) y "Protección por defecto" (2020); RD 311/2022 ENS; Decisiones UE 2021/914 (SCC) y 2023/1795 (Data Privacy Framework).

Los campos `{{snake_case}}` son rellenables en DocuSeal. Ninguno es de firma (template sin `signature`).

---

## Nota legal

> Este documento es una plantilla base redactada por Afiladocs (Valencia, España) conforme a la normativa española vigente en la fecha de su última revisión jurídica indicada al pie. Su adecuación al caso concreto requiere verificación por el usuario o su asesor legal. Afiladocs no responde por usos no previstos ni por cambios normativos posteriores a la fecha de revisión. **Este RAT debe mantenerse actualizado y a disposición de la Agencia Española de Protección de Datos (art. 30.4 RGPD), sin obligación de presentación previa.** Para revisiones expertas sobre tu documento, ver `/revisiones`.

---

## 1. Datos del responsable del tratamiento

<!-- QA-2026-04-19 · §1 sin cambios sustantivos + nota sobre excepciones del art. 30.5 -->

- **Denominación / razón social:** `{{responsable_nombre}}`
- **NIF / CIF:** `{{responsable_nif}}`
- **Domicilio:** `{{responsable_domicilio}}`
- **Contacto:** `{{responsable_email}}` · `{{responsable_telefono}}`
- **Representante legal (si procede):** `{{responsable_representante}}`
- **Delegado de protección de datos (DPO):** `{{dpo_nombre}}` · `{{dpo_email}}`
  - Indicar "No procede" si no es obligatorio conforme al art. 37 RGPD y art. 34 LOPDGDD.

> **Fundamento y ámbito subjetivo** (art. 30 RGPD + art. 31 LOPDGDD)
>
> La obligación de llevar RAT alcanza a todo responsable, con independencia del tamaño. El art. 30.5 RGPD exime únicamente a empresas/organizaciones de menos de 250 empleados **siempre y cuando se cumplan las tres condiciones acumulativas**:
>
> 1. El tratamiento sea **ocasional** (no habitual en la actividad),
> 2. No incluya **categorías especiales** de datos (art. 9: salud, origen étnico, datos biométricos identificativos, etc.),
> 3. No incluya **datos relativos a condenas e infracciones penales** (art. 10).
>
> En la práctica, casi cualquier pyme con clientes o empleados realiza tratamientos habituales (gestión laboral, facturación, marketing) y por tanto **sí está obligada** al RAT.

## 2. Actividades de tratamiento

<!-- QA-2026-04-19 · ejemplos ampliados + cross-reference arts. 13-14, 22, 35 -->

Por cada actividad identificada, cumplimentar la tabla del Anexo I. Se recomienda una fila por finalidad diferenciada. Ejemplos frecuentes:

- Gestión de clientes y facturación.
- Selección de personal y procesos de entrevista.
- Gestión laboral de empleados (nóminas, altas SS, PRL).
- Videovigilancia.
- Marketing, newsletter y comunicaciones comerciales.
- **Gestión de cookies y analítica web** (Google Analytics, Matomo, etc.).
- Gestión de proveedores.
- Atención a solicitudes ARSULIPO.

**Cross-references obligatorios**:

- Si la actividad implica **decisiones automatizadas o elaboración de perfiles** que produzcan efectos jurídicos o afecten significativamente al interesado → art. 22 RGPD (información reforzada al interesado arts. 13.2.f / 14.2.g) y valoración de DPIA (art. 35).
- Si la actividad presenta **riesgo alto** para derechos y libertades → DPIA obligatoria (art. 35 RGPD + Lista AEPD de tipos de tratamiento sujetos a DPIA).
- Si hay **transferencias internacionales** → documentar garantías (arts. 44-49).

### Campos mínimos exigidos por el art. 30.1 RGPD

| Apartado | Contenido requerido |
|---|---|
| a | Nombre y datos de contacto del responsable (y, en su caso, corresponsable y DPO) |
| b | Fines del tratamiento |
| c | Categorías de interesados y de datos personales |
| d | Categorías de destinatarios (incluidos terceros países) |
| e | Transferencias internacionales y, si procede, documentación de garantías adecuadas: **cláusulas contractuales tipo (Decisión UE 2021/914), normas corporativas vinculantes (art. 47), decisión de adecuación (art. 45 — EE.UU. vía Data Privacy Framework, Decisión UE 2023/1795), o excepciones del art. 49.1** |
| f | Plazos previstos para la supresión de las distintas categorías de datos |
| g | Descripción general de las medidas técnicas y organizativas de seguridad (art. 32) |

## 3. Anexo I — Tabla de actividades (rellenar una tabla por cada actividad)

<!-- QA-2026-04-19 · campo opcional nuevo: actividad_N_perfilado + nota consentimiento empleados -->

Para cada actividad declarada, rellenar los 10 campos siguientes:

| Campo | Valor |
|---|---|
| Denominación de la actividad | `{{actividad_1_denominacion}}` |
| Finalidad principal | `{{actividad_1_finalidad}}` |
| Base jurídica (art. 6 RGPD + art. 9 si especiales) | `{{actividad_1_base_juridica}}` |
| Categorías de interesados | `{{actividad_1_interesados}}` |
| Categorías de datos | `{{actividad_1_categorias_datos}}` |
| Categorías de destinatarios | `{{actividad_1_destinatarios}}` |
| Transferencias internacionales (país + garantías) | `{{actividad_1_transferencias}}` |
| Plazo de conservación | `{{actividad_1_conservacion}}` |
| Medidas de seguridad (referencia al Anexo II) | `{{actividad_1_seguridad}}` |
| **¿Incluye decisiones automatizadas o elaboración de perfiles? (Sí / No)** | `{{actividad_1_perfilado}}` |

> El DOCX master incluye **cinco bloques replicados** (`actividad_1_*` ... `actividad_5_*`). **Para responsables con más de 5 actividades**, Afiladocs entrega sin coste adicional un anexo editable `.docx` que replica esta tabla tantas veces como sea necesario. Solicitar en `soporte@afiladocs.com`.

### Bases jurídicas admisibles (art. 6.1 RGPD)

1. Consentimiento del interesado (letra a) — libre, específico, informado e inequívoco.
2. Ejecución de un contrato (letra b).
3. Obligación legal (letra c).
4. Intereses vitales (letra d).
5. Interés público o ejercicio de poderes públicos (letra e).
6. Interés legítimo del responsable o de un tercero (letra f) — requiere test de ponderación.

> **Datos de empleados**: el consentimiento rara vez es una base válida por la relación de desequilibrio (EDPB Guidelines 5/2020). Acudir preferentemente a ejecución del contrato laboral (b) u obligación legal (c: Estatuto de los Trabajadores, LGSS, PRL, etc.).

Si se tratan datos de **categorías especiales** (art. 9.1 RGPD — salud, origen étnico, opiniones políticas, convicciones religiosas, afiliación sindical, datos genéticos o biométricos identificativos, vida sexual u orientación sexual), identificar la excepción aplicable del art. 9.2. Si se tratan **datos de condenas e infracciones penales** (art. 10), acreditar habilitación legal específica.

## 4. Anexo II — Medidas técnicas y organizativas de seguridad (art. 32 RGPD)

<!-- QA-2026-04-19 · contraseñas actualizadas (NIST 2024) + TLS 1.3 + análisis de riesgos + ENS -->

Marcar las medidas implantadas. Lista no exhaustiva — adaptar al riesgo evaluado (Guía AEPD "Análisis de riesgos en tratamientos de datos", 2018).

### 4.1 Control de accesos

- [ ] Política de contraseñas robustas (longitud mínima 12 caracteres, comprobación frente a listas de compromiso, sin rotación periódica forzada; **rotación obligada tras incidente o sospecha de compromiso** — alineado con NIST SP 800-63B-4 marzo 2024 y recomendaciones INCIBE).
- [ ] Autenticación multifactor (MFA) para accesos privilegiados y remotos.
- [ ] Gestión de altas y bajas de usuarios documentada, con revisión periódica de permisos.
- [ ] Registros de acceso conservados `{{plazo_logs_accesos}}`.

### 4.2 Cifrado y pseudonimización

- [ ] Cifrado en tránsito: **TLS 1.3 preferido; TLS 1.2 como mínimo aceptable** (RFC 8446). No permitir TLS 1.0 / 1.1 / SSL.
- [ ] Cifrado en reposo en dispositivos portables y copias de seguridad.
- [ ] Pseudonimización de identificadores donde sea posible (art. 4.5 RGPD).

### 4.3 Resiliencia y continuidad

- [ ] Copias de seguridad con periodicidad `{{periodicidad_backup}}` y prueba de restauración documentada.
- [ ] Plan de continuidad y recuperación ante desastres.
- [ ] Antivirus / EDR actualizado con gestión centralizada.

### 4.4 Gestión de brechas

- [ ] Procedimiento de detección, evaluación y notificación de brechas (arts. 33-34 RGPD: notificación a la AEPD en 72 h; a los interesados cuando haya alto riesgo).
- [ ] Registro interno de brechas conforme art. 33.5.

### 4.5 Organizativas y responsabilidad proactiva

- [ ] Contratos de encargado del tratamiento (art. 28 RGPD) con todos los proveedores que acceden a datos.
- [ ] Formación periódica en protección de datos al personal.
- [ ] Cláusulas de confidencialidad en contratos laborales y mercantiles.
- [ ] **Evaluaciones de impacto (DPIA) realizadas cuando procede** (art. 35 + Lista AEPD de tipos que requieren DPIA).
- [ ] **Análisis de riesgos documentado** conforme Guía AEPD 2018.
- [ ] Política de privacidad por diseño y por defecto (art. 25) y Guía AEPD 2020.
- [ ] **Cumplimiento ENS (RD 311/2022)** cuando el responsable sea del sector público, operador esencial, o preste servicios a administraciones.
- [ ] Certificaciones voluntarias (ISO/IEC 27001:2022, ISO/IEC 27701:2019) cuando sean proporcionales al riesgo.

## 5. Revisiones y actualizaciones del registro

- **Periodicidad de revisión:** `{{periodicidad_revision}}` (recomendado **anual como mínimo** o cuando haya cambios sustanciales en la organización, finalidades, bases jurídicas, categorías de datos o medidas de seguridad).
- **Última revisión:** `{{fecha_ultima_revision}}`.
- **Responsable de la revisión:** `{{responsable_revision_nombre}}`.

## 6. Declaración del responsable

<!-- QA-2026-04-19 · añadir cita art. 24 responsabilidad proactiva -->

> El abajo firmante declara, en ejercicio del principio de **responsabilidad proactiva (art. 24 RGPD)**, que las actividades de tratamiento descritas se corresponden con las realizadas efectivamente por la entidad, que las medidas técnicas y organizativas indicadas están implantadas y que este Registro se mantendrá actualizado y a disposición de la Agencia Española de Protección de Datos conforme al art. 30.4 RGPD.

- **Lugar y fecha:** `{{lugar_firma}}`, `{{fecha_firma}}`.
- **Nombre:** `{{firmante_nombre}}`.
- **Cargo:** `{{firmante_cargo}}`.

*Template sin zona de firma electrónica — se rellena en DocuSeal y el responsable lo firma manualmente o dentro de su propio circuito interno.*

---

## Campos DocuSeal (listado consolidado, 65 campos)

```text
responsable_nombre, responsable_nif, responsable_domicilio, responsable_email,
responsable_telefono, responsable_representante, dpo_nombre, dpo_email,

# Por cada actividad (×5 bloques, 10 campos = 50 campos)
actividad_N_denominacion, actividad_N_finalidad, actividad_N_base_juridica,
actividad_N_interesados, actividad_N_categorias_datos, actividad_N_destinatarios,
actividad_N_transferencias, actividad_N_conservacion, actividad_N_seguridad,
actividad_N_perfilado

# Anexo II + revisiones + firma
plazo_logs_accesos, periodicidad_backup, periodicidad_revision,
fecha_ultima_revision, responsable_revision_nombre, lugar_firma, fecha_firma,
firmante_nombre, firmante_cargo
```

## Pie del DOCX master

`Afiladocs · AFD-RGPD-REG-001 · v1.0.0 · revisión {{fecha_revision_legal}}`

## Checklist de cierre (tras firma humana)

1. [ ] Revisor humano firma `notes-legal.md` → rellena `legal_reviewed_by` + `legal_reviewed_at` en `manifest.json`.
2. [ ] Bump `manifest.products[sku=AFD-RGPD-REG-001].version` de `0.1.0` → `1.0.0`.
3. [ ] Bump `manifest.products[sku=AFD-RGPD-REG-001].status` de `draft` → `template_ready`.
4. [ ] Maquetar `master-v1.0.0.docx` con los 65 campos en `{{snake_case}}`.
5. [ ] Calcular SHA256 del DOCX → `manifest.products[...].storage_sha256`.
6. [ ] Subir master a bucket `templates/rgpd/AFD-RGPD-REG-001/master-v1.0.0.docx` (Supabase Storage, privado).
7. [ ] Crear template DocuSeal (UI, `fill_only` sin zona de firma) → copiar `docuseal_template_id`.
8. [ ] Crear product+price Stripe LIVE (19 €, metadata `sku=AFD-RGPD-REG-001`, `afiladocs_category=rgpd`, `eidas_level=SES`) → copiar `stripe_price_id`.
9. [ ] Poblar ambos IDs + `*_last_verified` en manifest y en `/ops/productos/AFD-RGPD-REG-001`.
10. [ ] Auditar con `Task(subagent_type="afiladocs-golive-auditor", prompt="Pre-activacion AFD-RGPD-REG-001")` → ✅.
11. [ ] Activar `is_active=true` en Ops.
12. [ ] Smoke test checkout → DocuSeal fill_only → descarga.
13. [ ] Bump `status: live` en manifest + commit `catalog(reg-001): v1.0.0 live`.
