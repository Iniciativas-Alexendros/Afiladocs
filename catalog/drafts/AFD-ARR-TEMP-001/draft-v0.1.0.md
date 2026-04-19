# AFD-ARR-TEMP-001 · Contrato de arrendamiento de temporada

**Version:** 0.1.0 · **Estado:** draft · **Familia:** arrendamiento · **Delivery:** `docuseal_fill_and_sign` · **eIDAS:** AES · **Precio:** 39 €

**Indice aplicado:** INDICE §A (variante TEMP) · **Fuentes:** Ley 29/1994 LAU Titulo III (art. 3 — uso distinto del de vivienda) · CC arts. 1542-1582 · Jurisprudencia TS 2019-2023 (delimitacion temporada vs. uso turistico).

Este contrato regula un arrendamiento para uso distinto del de vivienda habitual (temporada), con finalidad no turistica (estudios, trabajo, estancia temporal, asistencia sanitaria u otra causa justificada). Para alquiler vacacional o turistico, debe usarse la normativa autonomica de viviendas de uso turistico.

---

## Nota legal

> Plantilla base. Adecuacion al caso concreto requiere verificacion del usuario o su asesor. Ver `/revisiones`.

## 1. Reunidos

**Arrendador:** `{{arrendador_nombre}}`, NIF `{{arrendador_nif}}`, domicilio `{{arrendador_domicilio}}`, telefono `{{arrendador_telefono}}`, email `{{arrendador_email}}`.

**Arrendatario:** `{{arrendatario_nombre}}`, NIF `{{arrendatario_nif}}`, domicilio habitual `{{arrendatario_domicilio}}`, telefono `{{arrendatario_telefono}}`, email `{{arrendatario_email}}`.

## 2. Exponen

**I.** Que el Arrendador es propietario / usufructuario de la vivienda sita en `{{finca_direccion}}`, referencia catastral `{{ref_catastral}}`, superficie `{{superficie_m2}}` m², certificado energetico `{{calificacion_energetica}}` (`{{cee_numero}}`).

**II.** Que el Arrendatario manifiesta necesitar la vivienda por un tiempo limitado debido a la siguiente causa: `{{causa_temporada}}` (por ejemplo: estudios en centro sito en `{{centro_estudios}}`, desempeno laboral temporal en `{{lugar_trabajo}}`, asistencia sanitaria en `{{centro_sanitario}}`, estancia temporal motivada por `{{otra_causa}}`). El Arrendatario mantiene su domicilio habitual en la direccion indicada en el encabezamiento.

**III.** Que ambas partes desean formalizar el arrendamiento al amparo del art. 3 LAU como "uso distinto del de vivienda" y no como arrendamiento de vivienda habitual (Titulo II LAU).

## 3. Clausulas

### 3.1 Objeto y destino

El Arrendador arrienda al Arrendatario la vivienda descrita, con destino a **uso temporal no habitual** del Arrendatario conforme a la causa expresada en el expositivo II. Queda expresamente prohibido:

- destinar la vivienda a vivienda habitual y permanente;
- cualquier modalidad de uso turistico, alquiler vacacional o explotacion economica;
- el subarriendo total o parcial sin autorizacion escrita.

### 3.2 Duracion

El contrato se celebra por un plazo de `{{duracion_meses}}` meses, desde el `{{fecha_inicio}}` al `{{fecha_fin}}`, sin prorrogas automaticas. La terminacion por el transcurso del plazo no requiere denuncia.

Prorroga voluntaria: las partes podran pactar por escrito una prorroga si subsiste la causa temporal del expositivo II.

### 3.3 Renta

Renta total del periodo: `{{renta_total}}` €. Forma de pago: `{{forma_pago}}` (por ejemplo: pago unico al inicio / mensualidades de `{{renta_mensual}}` €/mes dentro de los primeros `{{dia_pago}}` dias de cada mes en la cuenta `{{iban_arrendador}}`).

### 3.4 Fianza

El Arrendatario entrega en este acto una fianza en metalico equivalente a **dos mensualidades** de renta (art. 36 LAU), por importe de `{{fianza_importe}}` €, que sera depositada en `{{organismo_fianzas}}` conforme a la normativa autonomica.

Garantias adicionales: `{{garantias_adicionales}}` (aval bancario / deposito adicional), sujetas al limite del art. 36.5 LAU.

### 3.5 Gastos y servicios

- **Suministros (luz, agua, gas, internet):** `{{suministros_responsable}}`. Si se incluyen en la renta, se pactara limite de consumo razonable.
- **Gastos de comunidad e IBI:** a cargo del Arrendador, salvo pacto en contrario reflejado en el Anexo I.

### 3.6 Conservacion y uso

El Arrendatario se obliga a usar la vivienda con la diligencia propia de un arrendatario ordinario, conservar el mobiliario inventariado (Anexo I), y devolverla en el mismo estado en que la recibe, salvo el desgaste por uso normal.

### 3.7 Subarriendo y cesion

Prohibidos, salvo consentimiento escrito del Arrendador. Cualquier cesion de uso constituye causa de resolucion.

### 3.8 Resolucion

Son causas de resolucion, ademas de las previstas en la LAU para el arrendamiento de uso distinto del de vivienda:

- la desnaturalizacion del destino temporal pactado (uso como vivienda habitual, uso turistico, actividad economica);
- la falta de pago de la renta o cantidades asimiladas;
- danos dolosos o negligentes graves;
- incumplimiento del regimen de subarriendo o cesion.

### 3.9 Proteccion de datos

Los datos personales se trataran conforme al RGPD y la LOPDGDD con la finalidad de gestionar el contrato. Mas informacion en `{{url_politica_privacidad}}`.

### 3.10 Fuero

Juzgados y Tribunales del lugar donde radique la vivienda, con renuncia a cualquier otro fuero.

## 4. Anexos

- **Anexo I:** Inventario y estado de la vivienda a la entrega.
- **Anexo II:** Documentacion acreditativa de la causa temporal (matricula, contrato laboral, informe medico, etc.).
- **Anexo III:** Certificado energetico.

## 5. Firma

En `{{lugar_firma}}`, a `{{fecha_firma}}`.

- Arrendador: `{{signature_arrendador}}`
- Arrendatario: `{{signature_arrendatario}}`

---

## Campos DocuSeal

```
arrendador_nombre, arrendador_nif, arrendador_domicilio, arrendador_telefono, arrendador_email,
arrendatario_nombre, arrendatario_nif, arrendatario_domicilio, arrendatario_telefono, arrendatario_email,
finca_direccion, ref_catastral, superficie_m2, calificacion_energetica, cee_numero,
causa_temporada, centro_estudios, lugar_trabajo, centro_sanitario, otra_causa,
duracion_meses, fecha_inicio, fecha_fin,
renta_total, forma_pago, renta_mensual, dia_pago, iban_arrendador,
fianza_importe, organismo_fianzas, garantias_adicionales,
suministros_responsable,
url_politica_privacidad,
lugar_firma, fecha_firma,
signature_arrendador, signature_arrendatario
```

## Pie

`Afiladocs · AFD-ARR-TEMP-001 · v0.1.0 · revision {{fecha_revision_legal}}`

## TODO checkpoint 2

- Insistir en doctrina TS sobre distincion temporada vs. turistico (plantilla debe resistir recalificacion judicial).
- Confirmar fianza por defecto 2 mensualidades (coherente uso distinto de vivienda).
- Validar clausula 3.8 (desnaturalizacion) como causa autonoma reforzada.
