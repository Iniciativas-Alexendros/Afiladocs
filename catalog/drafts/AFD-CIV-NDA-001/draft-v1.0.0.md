# AFD-CIV-NDA-001 · Acuerdo bilateral de confidencialidad (NDA)

**Version:** 1.0.0-qa (pendiente firma jurídica humana) · **Delivery:** `docuseal_fill_and_sign` · **eIDAS:** AES · **Precio:** 29 €

**Draft base:** `draft-v0.1.0.md` · **QA preliminar:** `notes-legal.md` (Claude Code, 2026-06-15) · **Fuentes legales vigentes:** CC art. 1255 (autonomía de la voluntad) y arts. 1101 y ss. (responsabilidad contractual); Ley 1/2019, de 20 de febrero, de Secretos Empresariales (transposición Dir. UE 2016/943); CP arts. 278-280; LEC arts. 721 y ss. (medidas cautelares); RGPD art. 28 y LOPDGDD.

Los campos `{{snake_case}}` son rellenables en DocuSeal. Los campos `signature_*` son zonas de firma electrónica (template `fill_and_sign`, eIDAS AES).

---

## Nota legal

> Este documento es una plantilla base redactada por Afiladocs (Valencia, España) conforme a la normativa española vigente en la fecha de su última revisión jurídica indicada al pie. Su adecuación al caso concreto requiere verificación por el usuario o su asesor legal. Afiladocs no responde por usos no previstos ni por cambios normativos posteriores a la fecha de revisión. **La validez de la protección como secreto empresarial (Ley 1/2019) exige que la información sea objeto de medidas razonables para mantenerla secreta (art. 1.1); este NDA es una de esas medidas, pero no la única exigible.** Para revisiones expertas sobre tu documento, ver `/revisiones`.

---

## 1. Partes

<!-- QA-2026-06-15 · §1 sin cambios sustantivos; capacidad y representación reforzadas en nota -->

**De una parte**, `{{parte_a_nombre}}`, con NIF `{{parte_a_nif}}` y domicilio en `{{parte_a_domicilio}}`, representada en este acto por `{{parte_a_representante}}` en su condición de `{{parte_a_cargo}}` (en adelante, "Parte A").

**De otra parte**, `{{parte_b_nombre}}`, con NIF `{{parte_b_nif}}` y domicilio en `{{parte_b_domicilio}}`, representada en este acto por `{{parte_b_representante}}` en su condición de `{{parte_b_cargo}}` (en adelante, "Parte B").

Las Partes actúan simultáneamente como emisoras y receptoras de Información Confidencial (carácter **bilateral**).

> **Capacidad y representación.** Cada firmante manifiesta tener poder bastante y vigente para obligar a la parte que representa. Para personas físicas que contratan en nombre propio, deben omitirse los campos de representante y cargo (indicar "No procede").

## 2. Objeto y propósito

El presente acuerdo regula el intercambio de Información Confidencial entre las Partes con el único propósito de `{{proposito}}` (en adelante, el "Propósito"). El uso de la Información Confidencial para cualquier fin ajeno al Propósito queda expresamente prohibido.

## 3. Definición de Información Confidencial

### 3.1 Ámbito positivo

Se considera Información Confidencial toda información, en cualquier soporte y formato, divulgada por una Parte (Emisora) a la otra (Receptora) con ocasión del Propósito, incluyendo a título enunciativo: información técnica, comercial, financiera, estratégica, planes de negocio, clientes, proveedores, know-how, código fuente, diseños, datos personales, y cualquier otra información marcada como confidencial o que, por su naturaleza, deba razonablemente considerarse como tal.

A los efectos de la protección reforzada de la **Ley 1/2019 de Secretos Empresariales**, la información tendrá la consideración de secreto empresarial (art. 1.1) cuando cumpla acumulativamente: (i) ser **secreta**, en el sentido de no ser generalmente conocida ni fácilmente accesible para personas de los círculos en que normalmente se utilice; (ii) tener **valor empresarial**, real o potencial, precisamente por ser secreta; y (iii) haber sido objeto de **medidas razonables** para mantenerla secreta por parte de quien legítimamente la controla.

### 3.2 Exclusiones

No se considerará Información Confidencial la que:

- sea o pase a ser de dominio público sin incumplimiento por la Receptora;
- fuera ya conocida por la Receptora con anterioridad, de forma documentada;
- sea desarrollada independientemente por la Receptora sin uso de la Información Confidencial;
- sea recibida lícitamente de un tercero sin obligación de confidencialidad;
- deba ser divulgada por mandato legal o resolución judicial (en tal caso, la Receptora lo notificará previamente a la Emisora siempre que sea legalmente posible, y limitará la divulgación al mínimo exigido).

> **Carga de la prueba.** Corresponde a la Receptora acreditar que la información incurre en alguna de las exclusiones anteriores.

## 4. Obligaciones de la Receptora

La Receptora se obliga a:

- usar la Información Confidencial **exclusivamente** para el Propósito;
- guardar el más estricto secreto sobre la Información Confidencial;
- aplicar medidas de seguridad razonables, no inferiores a las aplicadas a su propia información confidencial de análoga importancia;
- limitar el acceso al personal, asesores y colaboradores con necesidad de conocerla ("need to know"), previamente vinculados por obligaciones de confidencialidad equivalentes a las de este acuerdo;
- no copiar, reproducir ni transmitir la Información Confidencial sin autorización escrita de la Emisora;
- notificar inmediatamente a la Emisora cualquier acceso no autorizado o sospecha de fuga, cooperando en la mitigación.

> La Receptora responde de los incumplimientos de las personas a las que dé acceso como si fueran propios.

## 5. Duración

El deber de confidencialidad se extiende durante la vigencia del Propósito y se prolonga durante `{{duracion_anos}}` años tras su terminación por cualquier causa. **Para la información que constituya secreto empresarial en sentido estricto (Ley 1/2019), la obligación se mantiene mientras conserve tal carácter**, con independencia del plazo anterior.

> **Razonabilidad del plazo.** Un plazo desproporcionado para información que no sea secreto empresarial podría reputarse abusivo. Se recomienda fijar entre 2 y 5 años salvo justificación específica del Propósito.

## 6. Devolución y destrucción

Al fin del Propósito, o a requerimiento de la Emisora, la Receptora devolverá o destruirá toda copia de la Información Confidencial (incluidas copias electrónicas y notas derivadas), certificándolo por escrito en un plazo de `{{plazo_devolucion_dias}}` días. Podrá conservarse copia en archivos de seguridad y respaldo por el tiempo requerido por políticas internas de retención o por obligación legal, sujeta al deber de confidencialidad mientras se conserve.

## 7. Protección de datos personales

<!-- QA-2026-06-15 · ampliado: rol de las partes y art. 28 RGPD -->

Si el intercambio incluye datos personales, las Partes cumplirán el RGPD y la LOPDGDD. La parte Emisora garantiza haber informado a los interesados (arts. 13-14 RGPD) y disponer de base jurídica para la comunicación. **Si una Parte trata datos personales por cuenta de la otra, se formalizará el correspondiente contrato de encargado del tratamiento (art. 28 RGPD) con carácter previo al acceso.** Si ambas determinan conjuntamente fines y medios, valorarán la figura de corresponsabilidad (art. 26 RGPD).

## 8. Sin licencia implícita de derechos de propiedad intelectual e industrial

Este acuerdo no transmite ni concede licencia alguna sobre derechos de propiedad intelectual, industrial, know-how o cualquier otro derecho sobre la Información Confidencial, más allá del uso estricto para el Propósito. Toda titularidad permanece en la Parte Emisora.

## 9. Remedios

El incumplimiento de este acuerdo facultará a la Emisora para reclamar:

- la **cesación inmediata** de la conducta infractora;
- **indemnización por daños y perjuicios** conforme al art. 9 Ley 1/2019 (cuando se trate de secreto empresarial) y a los arts. 1101 y ss. CC;
- **medidas cautelares** (arts. 721 y ss. LEC, y arts. 20-25 Ley 1/2019 para secretos empresariales);
- en su caso, las **acciones penales** que correspondan (arts. 278-280 CP — descubrimiento y revelación de secretos de empresa).

Las Partes pactan una **cláusula penal** (art. 1152 CC) por importe de `{{clausula_penal_importe}}` € por cada incumplimiento, sin perjuicio de la indemnización por el daño real si este excede dicho importe. Si se prefiere no fijar cláusula penal, indíquese "0" y la responsabilidad se regirá por las reglas generales de indemnización de daños.

## 10. Relación entre las Partes

Este acuerdo no crea relación de agencia, sociedad, joint venture, laboral ni representación alguna entre las Partes. Ninguna Parte podrá obligar a la otra frente a terceros.

## 11. Cesión

Ninguna Parte podrá ceder, subrogar ni transmitir los derechos y obligaciones derivados del presente acuerdo sin el consentimiento escrito de la otra, salvo en supuestos de sucesión empresarial universal, en cuyo caso el deber de confidencialidad vincula al sucesor.

## 12. Ley aplicable y jurisdicción

Este acuerdo se rige por la legislación española. Las Partes, con renuncia expresa a cualquier otro fuero que pudiera corresponderles, se someten a los Juzgados y Tribunales de `{{jurisdiccion}}`.

> Si alguna de las Partes es consumidor (persona física ajena a actividad empresarial), la sumisión expresa de fuero puede no ser oponible (normativa de consumidores); en tal caso prevalece el fuero legal imperativo.

## 13. Firmas

<!-- QA-2026-06-15 · zona de firma electrónica AES (DocuSeal fill_and_sign) -->

- Por la Parte A: `{{signature_parte_a}}` — `{{parte_a_representante}}`, `{{fecha_firma_a}}`
- Por la Parte B: `{{signature_parte_b}}` — `{{parte_b_representante}}`, `{{fecha_firma_b}}`

_Documento firmado electrónicamente mediante firma avanzada (eIDAS AES) a través de DocuSeal. La integridad y autoría quedan garantizadas por el sello y la traza de auditoría del proveedor de firma._

---

## Campos DocuSeal (listado consolidado, 20 campos)

```text
# Partes (10 campos)
parte_a_nombre, parte_a_nif, parte_a_domicilio, parte_a_representante, parte_a_cargo,
parte_b_nombre, parte_b_nif, parte_b_domicilio, parte_b_representante, parte_b_cargo,

# Contenido del acuerdo (4 campos)
proposito, duracion_anos, plazo_devolucion_dias, clausula_penal_importe, jurisdiccion,

# Firma electrónica (4 campos)
signature_parte_a, fecha_firma_a, signature_parte_b, fecha_firma_b
```

## Pie del DOCX master

`Afiladocs · AFD-CIV-NDA-001 · v1.0.0 · revisión {{fecha_revision_legal}}`

## Checklist de cierre (tras firma humana)

1. [ ] Revisor humano firma `notes-legal.md` → rellena `legal_reviewed_by` + `legal_reviewed_at` en `manifest.json`.
2. [ ] Bump `manifest.products[sku=AFD-CIV-NDA-001].version` de `0.1.0` → `1.0.0`.
3. [ ] Bump `manifest.products[sku=AFD-CIV-NDA-001].status` de `draft` → `template_ready`.
4. [ ] Maquetar `master-v1.0.0.docx` con los 20 campos en `{{snake_case}}` (2 zonas `signature_*`).
5. [ ] Calcular SHA256 del DOCX → `manifest.products[...].storage_sha256`.
6. [ ] Subir master a bucket `templates/civil/AFD-CIV-NDA-001/master-v1.0.0.docx` (Supabase Storage, privado).
7. [ ] Crear template DocuSeal (UI, `fill_and_sign` con 2 zonas de firma) → copiar `docuseal_template_id`.
8. [ ] Crear product+price Stripe LIVE (29 €, metadata `sku=AFD-CIV-NDA-001`, `afiladocs_category=civil`, `eidas_level=AES`) → copiar `stripe_price_id`.
9. [ ] Poblar ambos IDs + `*_last_verified` en manifest y en `/ops/productos/AFD-CIV-NDA-001`.
10. [ ] Auditar con `npx tsx scripts/audit-catalog.ts --sku AFD-CIV-NDA-001` → ✅ READY.
11. [ ] Activar `is_active=true` en Ops.
12. [ ] Smoke test checkout → DocuSeal fill_and_sign → descarga firmada.
13. [ ] Bump `status: live` en manifest + commit `catalog(nda-001): v1.0.0 live`.
