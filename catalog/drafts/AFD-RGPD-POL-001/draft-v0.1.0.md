# AFD-RGPD-POL-001 · Politica de privacidad para sitio web

**Version:** 0.1.0 · **Estado:** draft (pendiente revision juridica) · **Familia:** RGPD · **Delivery:** `docuseal_fill_only` · **eIDAS:** SES · **Precio:** 29 €

**Indice aplicado:** INDICE_CONTENIDOS.md §E · **Fuentes legales:** RGPD arts. 13 y 14 · LSSI-CE art. 10 · LOPDGDD arts. 11-12 · Directrices EDPB 5/2020 (consentimiento) · Directrices EDPB 3/2022 (patrones enganosos).

Los campos `{{snake_case}}` son rellenables en DocuSeal. Ninguno es de firma.

---

## Nota legal

> Este documento es una plantilla base redactada por Afiladocs (Valencia, Espana) conforme a la normativa espanola vigente en la fecha de su ultima revision juridica indicada al pie. Su adecuacion al caso concreto requiere verificacion por el usuario o su asesor legal. Afiladocs no responde por usos no previstos ni por cambios normativos posteriores a la fecha de revision. Para revisiones expertas, ver `/revisiones`.

---

## 1. Responsable del tratamiento (identificacion — LSSI-CE art. 10 y RGPD art. 13.1.a)

- **Denominacion:** `{{responsable_nombre}}`
- **NIF / CIF:** `{{responsable_nif}}`
- **Domicilio:** `{{responsable_domicilio}}`
- **Email:** `{{responsable_email}}`
- **Telefono:** `{{responsable_telefono}}`
- **Datos registrales (si sociedad mercantil):** `{{responsable_datos_registrales}}`
- **Delegado de Proteccion de Datos (si procede):** `{{dpo_nombre}}` · `{{dpo_email}}`

## 2. Finalidades del tratamiento

Se tratan datos personales con las siguientes finalidades. Para cada una se indica su base juridica (art. 6 RGPD) y plazo de conservacion.

### 2.1 Gestion del formulario de contacto y atencion al usuario

- **Datos tratados:** `{{datos_contacto}}` (tipicamente nombre, email, mensaje).
- **Finalidad:** atender consultas e informar sobre los servicios solicitados.
- **Base juridica:** art. 6.1.b RGPD (ejecucion de medidas precontractuales) o art. 6.1.a (consentimiento) si el mensaje no implica contrato.
- **Plazo de conservacion:** `{{conservacion_contacto}}` (por defecto: 1 ano desde el ultimo contacto, salvo obligacion legal de conservacion).

### 2.2 Envio de comunicaciones comerciales (si aplica)

- **Datos tratados:** nombre y email.
- **Finalidad:** envio de newsletters, promociones u otras comunicaciones del responsable.
- **Base juridica:** art. 6.1.a RGPD (consentimiento explicito y diferenciado), conforme a EDPB 5/2020.
- **Plazo:** hasta la revocacion del consentimiento. Cada comunicacion incluye mecanismo de baja sencillo (LSSI-CE art. 22).

### 2.3 Gestion de clientes y facturacion (si aplica)

- **Datos:** identificativos, fiscales, transaccionales.
- **Finalidad:** ejecucion del contrato y cumplimiento de obligaciones fiscales y contables.
- **Base juridica:** art. 6.1.b (ejecucion de contrato) y art. 6.1.c (obligacion legal — Codigo de Comercio art. 30, LGT art. 66).
- **Plazo:** mientras dure la relacion contractual y, tras su finalizacion, los plazos legales exigibles (6 anos contables; 4 anos fiscales; 10 anos blanqueo si aplica).

### 2.4 Analitica y mejora del sitio web (si aplica)

- **Datos:** identificadores tecnicos (cookies propias o de terceros, IP parcial si se anonimiza).
- **Finalidad:** medicion de uso y mejora del servicio.
- **Base juridica:** art. 6.1.a (consentimiento previo obtenido mediante banner de cookies conforme a Guia AEPD).
- **Plazo:** conforme a la politica de cookies.

## 3. Destinatarios de los datos

Los datos podran comunicarse a:

- **Encargados del tratamiento** contratados bajo acuerdo del art. 28 RGPD (p.ej. alojamiento web, correo electronico, pasarela de pago, herramientas de analitica).
- **Administraciones publicas** cuando exista obligacion legal (AEAT, Seguridad Social, Jueces y Tribunales).
- **Entidades financieras** en la gestion de cobros y pagos.

No se cederan datos a terceros con fines distintos de los indicados sin el consentimiento expreso del interesado.

## 4. Transferencias internacionales

Si aplica, detallar:

- **Proveedores en terceros paises:** `{{transferencias_proveedores}}` (p.ej. Google LLC — EEUU, acogido al EU-U.S. Data Privacy Framework conforme a la Decision de adecuacion de 10 de julio de 2023).
- **Garantias aplicables:** decision de adecuacion (art. 45 RGPD) o clausulas contractuales tipo (art. 46.2.c RGPD).

Si no hay transferencias, indicar: "No se realizan transferencias internacionales de datos."

## 5. Derechos del interesado

Conforme a los arts. 15 a 22 RGPD y arts. 12 a 18 LOPDGDD, el interesado puede ejercer los siguientes derechos:

- **Acceso** a sus datos personales.
- **Rectificacion** de datos inexactos o incompletos.
- **Supresion** ("derecho al olvido") cuando proceda.
- **Oposicion** al tratamiento.
- **Limitacion** del tratamiento.
- **Portabilidad** de los datos a otro responsable.
- **No ser objeto de decisiones automatizadas** con efectos juridicos significativos (art. 22 RGPD).

### Canal para ejercerlos

- **Email:** `{{canal_derechos_email}}`
- **Domicilio postal:** `{{canal_derechos_postal}}`

El interesado debera acreditar su identidad. La respuesta se emite en el plazo maximo de un mes (art. 12.3 RGPD), prorrogable dos meses adicionales en supuestos de complejidad.

### Reclamacion ante la autoridad de control

El interesado puede presentar reclamacion ante la **Agencia Espanola de Proteccion de Datos** (www.aepd.es), especialmente cuando no haya obtenido satisfaccion en el ejercicio de sus derechos.

## 6. Cookies

El uso de cookies se rige por la politica especifica disponible en `{{url_politica_cookies}}` (o integrada en esta politica si asi lo prefiere el responsable). En todo caso, se cumplen las directrices de la Guia AEPD de cookies en su version vigente y se solicita consentimiento previo para cookies no estrictamente necesarias (LSSI-CE art. 22.2).

## 7. Menores de edad

El sitio web no esta dirigido a menores de 14 anos. Si se recaban datos de menores, se requerira el consentimiento de los titulares de la patria potestad o tutela (LOPDGDD art. 7).

## 8. Redes sociales y enlaces externos

Si el sitio incluye perfiles de redes sociales o enlaces a webs de terceros, se informa de que el tratamiento de datos en dichas plataformas se rige por sus propias politicas. El responsable no asume responsabilidad sobre dichos tratamientos.

## 9. Seguridad

El responsable aplica medidas tecnicas y organizativas apropiadas al riesgo (art. 32 RGPD) para garantizar la confidencialidad, integridad, disponibilidad y resiliencia del tratamiento.

## 10. Modificaciones

Esta politica puede ser actualizada para adaptarla a cambios normativos o a nuevos tratamientos. Las modificaciones sustanciales se comunicaran a los interesados por los canales habituales.

## 11. Informacion capa 1 para formularios (texto breve para pegar en cada formulario)

> Los datos que nos facilitas seran tratados por `{{responsable_nombre}}` (NIF `{{responsable_nif}}`) con la finalidad de `{{finalidad_breve}}`. La base juridica es `{{base_juridica_breve}}`. Puedes ejercer tus derechos en `{{canal_derechos_email}}`. Mas informacion en nuestra politica de privacidad completa en `{{url_politica_privacidad}}`.

## 12. Fecha de ultima actualizacion

`{{fecha_ultima_actualizacion}}`

---

## Campos DocuSeal (listado consolidado)

```
responsable_nombre, responsable_nif, responsable_domicilio, responsable_email,
responsable_telefono, responsable_datos_registrales, dpo_nombre, dpo_email,
datos_contacto, conservacion_contacto,
transferencias_proveedores,
canal_derechos_email, canal_derechos_postal,
url_politica_cookies, url_politica_privacidad,
finalidad_breve, base_juridica_breve,
fecha_ultima_actualizacion
```

## Pie del DOCX master

`Afiladocs · AFD-RGPD-POL-001 · v0.1.0 · revision {{fecha_revision_legal}}`

## TODO para la revision juridica (checkpoint 2)

- Verificar redaccion del apartado 4 si el responsable usa proveedores en EEUU tras el DPF (julio 2023) — ajustar si la Comision modifica la adecuacion.
- Confirmar que la lista de encargados tipicos del apartado 3 cubre el espectro B2C habitual sin excederse.
- Decidir si la politica de cookies se incluye inline o se referencia (impacta apartado 6).
- Revisar formula de la capa 1 (apartado 11) contra guias AEPD 2024/2025.
- Validar si procede anadir mencion a decisiones automatizadas (art. 22 RGPD) con mas detalle cuando haya perfilado.
