# AFD-RGPD-REG-001 · Registro de actividades de tratamiento (RAT)

**Version:** 0.1.0 · **Estado:** draft (pendiente revision juridica) · **Familia:** RGPD · **Delivery:** `docuseal_fill_only` · **eIDAS:** SES · **Precio:** 19 €

**Indice aplicado:** INDICE_CONTENIDOS.md §D · **Fuentes legales:** RGPD art. 30 · LOPDGDD art. 31 · Guia AEPD "Registro de actividades de tratamiento".

Los campos `{{snake_case}}` son rellenables en DocuSeal. Ninguno es de firma (template sin `signature`).

---

## Nota legal

> Este documento es una plantilla base redactada por Afiladocs (Valencia, Espana) conforme a la normativa espanola vigente en la fecha de su ultima revision juridica indicada al pie. Su adecuacion al caso concreto requiere verificacion por el usuario o su asesor legal. Afiladocs no responde por usos no previstos ni por cambios normativos posteriores a la fecha de revision. Para revisiones expertas sobre tu documento, ver `/revisiones`.

---

## 1. Datos del responsable del tratamiento

- **Denominacion / razon social:** `{{responsable_nombre}}`
- **NIF / CIF:** `{{responsable_nif}}`
- **Domicilio:** `{{responsable_domicilio}}`
- **Contacto:** `{{responsable_email}}` · `{{responsable_telefono}}`
- **Representante legal (si procede):** `{{responsable_representante}}`
- **Delegado de proteccion de datos (DPO):** `{{dpo_nombre}}` · `{{dpo_email}}`
  - Indicar "No procede" si no es obligatorio conforme al art. 37 RGPD y art. 34 LOPDGDD.

> Fundamento: art. 30.1.a RGPD; art. 31 LOPDGDD. La obligacion de llevar RAT alcanza al responsable con mas de 250 empleados y, salvo excepciones, a cualquier otro que realice tratamientos no ocasionales o que incluyan datos de categorias especiales.

## 2. Actividades de tratamiento

Por cada actividad identificada, cumplimentar la tabla del Anexo I. Se recomienda una fila por finalidad diferenciada (p.ej. "gestion de clientes", "seleccion de personal", "videovigilancia", "gestion laboral").

### Campos minimos exigidos por el art. 30.1 RGPD

| Apartado | Contenido requerido |
|---|---|
| a | Nombre y datos de contacto del responsable (y, en su caso, corresponsable y DPO) |
| b | Fines del tratamiento |
| c | Categorias de interesados y de datos personales |
| d | Categorias de destinatarios (incluidos terceros paises) |
| e | Transferencias internacionales y, si procede, documentacion de garantias adecuadas (art. 49.1 parrafo 2) |
| f | Plazos previstos para la supresion de las distintas categorias de datos |
| g | Descripcion general de las medidas tecnicas y organizativas de seguridad (art. 32) |

## 3. Anexo I — Tabla de actividades (rellenar una tabla por cada actividad)

Para cada actividad declarada, rellenar los 9 campos siguientes:

| Campo | Valor |
|---|---|
| Denominacion de la actividad | `{{actividad_1_denominacion}}` |
| Finalidad principal | `{{actividad_1_finalidad}}` |
| Base juridica (art. 6 RGPD + art. 9 si especiales) | `{{actividad_1_base_juridica}}` |
| Categorias de interesados | `{{actividad_1_interesados}}` |
| Categorias de datos | `{{actividad_1_categorias_datos}}` |
| Categorias de destinatarios | `{{actividad_1_destinatarios}}` |
| Transferencias internacionales (pais + garantias) | `{{actividad_1_transferencias}}` |
| Plazo de conservacion | `{{actividad_1_conservacion}}` |
| Medidas de seguridad (referencia al Anexo II) | `{{actividad_1_seguridad}}` |

> El DOCX master incluye **cinco bloques replicados** (`actividad_1_*` ... `actividad_5_*`). Si el responsable necesita mas actividades, se entregara una pagina adicional editable.

### Bases juridicas admisibles (art. 6.1 RGPD)

1. Consentimiento del interesado (letra a)
2. Ejecucion de un contrato (letra b)
3. Obligacion legal (letra c)
4. Intereses vitales (letra d)
5. Interes publico o ejercicio de poderes publicos (letra e)
6. Interes legitimo del responsable o de un tercero (letra f)

Si se tratan datos de categorias especiales (art. 9.1 RGPD — salud, origen etnico, opiniones politicas, convicciones religiosas, afiliacion sindical, datos geneticos o biometricos, vida sexual), identificar la excepcion aplicable del art. 9.2.

## 4. Anexo II — Medidas tecnicas y organizativas de seguridad (art. 32 RGPD)

Marcar las medidas implantadas. Lista no exhaustiva — adaptar al riesgo evaluado.

### 4.1 Control de accesos

- [ ] Politica de contrasenas robustas (longitud minima, complejidad, rotacion si procede)
- [ ] Autenticacion de doble factor para accesos privilegiados
- [ ] Gestion de altas y bajas de usuarios documentada
- [ ] Registros de acceso conservados `{{plazo_logs_accesos}}`

### 4.2 Cifrado y pseudonimizacion

- [ ] Cifrado en transito (TLS 1.2+) para comunicaciones externas
- [ ] Cifrado en reposo en dispositivos portables
- [ ] Pseudonimizacion de identificadores donde sea posible

### 4.3 Resiliencia y continuidad

- [ ] Copias de seguridad con periodicidad `{{periodicidad_backup}}` y prueba de restauracion documentada
- [ ] Plan de continuidad y recuperacion ante desastres
- [ ] Antivirus / EDR actualizado

### 4.4 Gestion de brechas

- [ ] Procedimiento de deteccion, evaluacion y notificacion de brechas (art. 33-34 RGPD)
- [ ] Registro interno de brechas

### 4.5 Organizativas

- [ ] Contratos de encargado del tratamiento (art. 28) con todos los proveedores que acceden a datos
- [ ] Formacion periodica en proteccion de datos al personal
- [ ] Clausulas de confidencialidad en contratos laborales y mercantiles
- [ ] Evaluaciones de impacto (DPIA) cuando procede (art. 35)

## 5. Revisiones y actualizaciones del registro

- **Periodicidad de revision:** `{{periodicidad_revision}}` (recomendado anual o cuando haya cambios sustanciales).
- **Ultima revision:** `{{fecha_ultima_revision}}`.
- **Responsable de la revision:** `{{responsable_revision_nombre}}`.

## 6. Declaracion del responsable

> El abajo firmante declara que las actividades de tratamiento descritas se corresponden con las realizadas efectivamente por la entidad y que las medidas de seguridad indicadas estan implantadas.

- **Lugar y fecha:** `{{lugar_firma}}`, `{{fecha_firma}}`.
- **Nombre:** `{{firmante_nombre}}`.
- **Cargo:** `{{firmante_cargo}}`.

*Template sin zona de firma electronica — se rellena en DocuSeal y el responsable lo firma manualmente o dentro de su propio circuito.*

---

## Campos DocuSeal (listado consolidado)

```
responsable_nombre, responsable_nif, responsable_domicilio, responsable_email,
responsable_telefono, responsable_representante, dpo_nombre, dpo_email,
actividad_1_denominacion, actividad_1_finalidad, actividad_1_base_juridica,
actividad_1_interesados, actividad_1_categorias_datos, actividad_1_destinatarios,
actividad_1_transferencias, actividad_1_conservacion, actividad_1_seguridad,
actividad_2_denominacion, actividad_2_finalidad, actividad_2_base_juridica,
actividad_2_interesados, actividad_2_categorias_datos, actividad_2_destinatarios,
actividad_2_transferencias, actividad_2_conservacion, actividad_2_seguridad,
actividad_3_denominacion, actividad_3_finalidad, actividad_3_base_juridica,
actividad_3_interesados, actividad_3_categorias_datos, actividad_3_destinatarios,
actividad_3_transferencias, actividad_3_conservacion, actividad_3_seguridad,
actividad_4_denominacion, actividad_4_finalidad, actividad_4_base_juridica,
actividad_4_interesados, actividad_4_categorias_datos, actividad_4_destinatarios,
actividad_4_transferencias, actividad_4_conservacion, actividad_4_seguridad,
actividad_5_denominacion, actividad_5_finalidad, actividad_5_base_juridica,
actividad_5_interesados, actividad_5_categorias_datos, actividad_5_destinatarios,
actividad_5_transferencias, actividad_5_conservacion, actividad_5_seguridad,
plazo_logs_accesos, periodicidad_backup, periodicidad_revision,
fecha_ultima_revision, responsable_revision_nombre, lugar_firma, fecha_firma,
firmante_nombre, firmante_cargo
```

## Pie del DOCX master

`Afiladocs · AFD-RGPD-REG-001 · v0.1.0 · revision {{fecha_revision_legal}}`

## TODO para la revision juridica (checkpoint 2)

- Verificar que el listado de medidas del Anexo II refleja la version mas reciente de la Guia AEPD (revisar `aepd.es` antes de firmar).
- Confirmar si conviene anadir columna sobre "decisiones automatizadas / elaboracion de perfiles" para cubrir art. 30.1.g ampliado.
- Decidir si se mantienen 5 bloques de actividad o se ofrece anexo ilimitado (impacta DocuSeal).
- Validar redaccion de la declaracion final (apartado 6) frente a la formula usada en plantillas equivalentes de la AEPD.
