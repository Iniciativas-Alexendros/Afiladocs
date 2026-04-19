# AFD-CIV-CPS-001 · Contrato de prestacion de servicios

**Version:** 0.1.0 · **Estado:** draft · **Familia:** civil · **Delivery:** `docuseal_fill_and_sign` · **eIDAS:** AES · **Precio:** 39 €

**Indice aplicado:** INDICE §B · **Fuentes:** CC arts. 1583-1587 (arrendamiento de servicios); CC arts. 1544 y ss.; Ley 3/2004 (morosidad); Ley 15/2007 Defensa Competencia (si aplica); Jurisprudencia TS 2022-2023 (delimitacion servicios vs. laboral).

---

## Nota legal

> Plantilla base. Adecuacion al caso concreto requiere verificacion del usuario o su asesor. Ver `/revisiones`.

## 1. Partes

**El Cliente:** `{{cliente_nombre}}`, NIF `{{cliente_nif}}`, domicilio `{{cliente_domicilio}}`, representado por `{{cliente_representante}}` (`{{cliente_cargo}}`).

**El Proveedor:** `{{proveedor_nombre}}`, NIF `{{proveedor_nif}}`, domicilio `{{proveedor_domicilio}}`, representado por `{{proveedor_representante}}` (`{{proveedor_cargo}}`). Epigrafe IAE: `{{proveedor_iae}}`.

## 2. Antecedentes

**I.** Que el Cliente precisa los servicios descritos en la clausula 3 de este contrato.

**II.** Que el Proveedor esta interesado en prestarlos, declarando contar con los medios materiales y humanos necesarios para ello y cumplir con las obligaciones fiscales y de Seguridad Social derivadas de su actividad, como empresario independiente.

**III.** Que, en consecuencia, convienen el presente contrato de arrendamiento de servicios al amparo de los arts. 1544 y 1583 y ss. CC, con expresa exclusion de cualquier relacion laboral.

## 3. Objeto

### 3.1 Alcance

El Proveedor se compromete a prestar al Cliente los siguientes servicios: `{{descripcion_servicio}}`.

### 3.2 Entregables

Los entregables principales son: `{{lista_entregables}}`.

### 3.3 Criterios de aceptacion

Cada entregable se aceptara conforme a los siguientes criterios: `{{criterios_aceptacion}}`. El Cliente dispondra de `{{plazo_aceptacion_dias}}` dias habiles desde la entrega para aceptar o formular objeciones motivadas. Transcurrido ese plazo sin objeciones, el entregable se considerara tacitamente aceptado.

## 4. Plazo y hitos

- **Inicio:** `{{fecha_inicio}}`.
- **Fin:** `{{fecha_fin}}`.
- **Hitos intermedios:** `{{hitos_intermedios}}`.

## 5. Precio y facturacion

### 5.1 Importe

Importe total: `{{importe_total}}` € + IVA `{{iva_porcentaje}}`%. Desglose por hitos: `{{desglose_hitos}}`.

### 5.2 Facturacion y pago

El Proveedor emitira factura `{{periodicidad_facturacion}}` (por ejemplo: por hito alcanzado, mensualmente, al finalizar). El Cliente abonara las facturas en un plazo no superior a 30 dias desde la fecha de emision, conforme a la Ley 3/2004. Los pagos se realizaran mediante transferencia a la cuenta `{{iban_proveedor}}`.

### 5.3 Intereses de demora

La morosidad en el pago devengara intereses conforme a la Ley 3/2004, sin necesidad de intimacion.

## 6. Obligaciones del Proveedor

- Prestar los servicios conforme a la lex artis y con la diligencia exigible a un profesional del sector.
- Actuar como empresario independiente, con medios propios, organizacion propia y asuncion de riesgo. No existe vinculo laboral alguno con el Cliente.
- Cumplir con las obligaciones fiscales, de Seguridad Social, de prevencion de riesgos laborales y cualesquiera otras derivadas de su condicion de empresario independiente.
- Respetar los plazos y los criterios de aceptacion.
- Guardar confidencialidad sobre la informacion recibida (clausula 9).

## 7. Obligaciones del Cliente

- Facilitar la informacion, accesos y colaboracion razonables.
- Pagar el precio en los plazos convenidos.
- Designar un interlocutor unico para la gestion del contrato.

## 8. Propiedad intelectual e industrial

### 8.1 Entregables finales

Los derechos de explotacion sobre los entregables finales se ceden al Cliente con caracter no exclusivo / exclusivo (a elegir en `{{regimen_cesion_ip}}`), por el plazo maximo legalmente permitido y para todos los paises y modalidades de explotacion, a partir del pago integro del precio.

### 8.2 Herramientas y know-how previos del Proveedor

Las herramientas, metodologias, librerias y conocimientos preexistentes del Proveedor no se ceden. El Cliente obtiene una licencia de uso no exclusiva, perpetua e intransferible, limitada al uso de los entregables.

## 9. Confidencialidad

Las partes se obligan a guardar confidencialidad sobre la informacion intercambiada durante la duracion del contrato y durante `{{confidencialidad_anos}}` anos tras su terminacion. Si las partes suscriben un acuerdo especifico de confidencialidad (NDA), este prevalecera.

## 10. Proteccion de datos

Si la prestacion implica tratamiento de datos personales por cuenta del Cliente, las partes suscribiran el correspondiente acuerdo de encargado del tratamiento conforme al art. 28 RGPD (ver catalogo Afiladocs AFD-RGPD-CES-001).

## 11. Responsabilidad

Cada parte respondera de los danos y perjuicios directos que cause a la otra por incumplimiento de sus obligaciones. La responsabilidad del Proveedor se limita a `{{limite_responsabilidad}}` (por defecto: importe total del contrato en los 12 meses anteriores al incumplimiento). Este limite no sera aplicable en caso de dolo o culpa grave, ni a obligaciones de pago o de confidencialidad.

## 12. Subcontratacion

El Proveedor `{{subcontratacion_regimen}}` (esta facultado / no esta facultado / requiere autorizacion escrita) para subcontratar parte de los servicios. En todo caso, respondera ante el Cliente como si los hubiera prestado directamente.

## 13. Duracion y terminacion

### 13.1 Duracion

Del `{{fecha_inicio}}` al `{{fecha_fin}}`. Prorroga por periodos de `{{prorroga_meses}}` meses salvo denuncia por cualquiera de las partes con `{{preaviso_denuncia_dias}}` dias de antelacion.

### 13.2 Resolucion por incumplimiento

La parte cumplidora podra resolver el contrato ante el incumplimiento esencial de la otra, previo requerimiento por escrito concediendo un plazo de `{{plazo_subsanacion_dias}}` dias para subsanar, sin perjuicio de la indemnizacion por danos y perjuicios.

## 14. No competencia / no solicitacion (opcional)

`{{clausula_no_competencia}}` (incluir o suprimir). Si se incluye, alcance: `{{alcance_no_competencia}}`; duracion post-contractual: `{{duracion_no_competencia_meses}}` meses; compensacion al Proveedor: `{{compensacion_no_competencia}}` €. Estas clausulas deben ser razonables y limitadas en tiempo, territorio y objeto para resultar validas.

## 15. Fuerza mayor

Ninguna parte respondera del incumplimiento derivado de causas de fuerza mayor, debidamente acreditadas. Si la situacion se prolonga mas de `{{fuerza_mayor_meses}}` meses, cualquiera de las partes podra resolver el contrato sin indemnizacion.

## 16. Ley aplicable y jurisdiccion

Legislacion espanola. Juzgados y Tribunales de `{{jurisdiccion}}`, con renuncia a cualquier otro fuero.

## 17. Notificaciones

Seran validas las notificaciones efectuadas a los domicilios y correos electronicos indicados en el encabezamiento, o a los que posteriormente se comuniquen por escrito.

## 18. Firma

- Cliente: `{{signature_cliente}}` — `{{cliente_representante}}`, `{{fecha_firma_cliente}}`
- Proveedor: `{{signature_proveedor}}` — `{{proveedor_representante}}`, `{{fecha_firma_proveedor}}`

---

## Campos DocuSeal

```
cliente_nombre, cliente_nif, cliente_domicilio, cliente_representante, cliente_cargo,
proveedor_nombre, proveedor_nif, proveedor_domicilio, proveedor_representante, proveedor_cargo, proveedor_iae,
descripcion_servicio, lista_entregables, criterios_aceptacion, plazo_aceptacion_dias,
fecha_inicio, fecha_fin, hitos_intermedios,
importe_total, iva_porcentaje, desglose_hitos,
periodicidad_facturacion, iban_proveedor,
regimen_cesion_ip, confidencialidad_anos,
limite_responsabilidad,
subcontratacion_regimen,
prorroga_meses, preaviso_denuncia_dias, plazo_subsanacion_dias,
clausula_no_competencia, alcance_no_competencia, duracion_no_competencia_meses, compensacion_no_competencia,
fuerza_mayor_meses, jurisdiccion,
signature_cliente, fecha_firma_cliente, signature_proveedor, fecha_firma_proveedor
```

## Pie

`Afiladocs · AFD-CIV-CPS-001 · v0.1.0 · revision {{fecha_revision_legal}}`

## TODO checkpoint 2

- Reforzar redaccion de independencia del Proveedor (apartado 2.III + 6) frente a jurisprudencia TS 2022-2023 sobre laboralizacion.
- Decidir regimen cesion IP por defecto (exclusiva con entrega de fuentes vs. no exclusiva).
- Validar limite responsabilidad estandar (apartado 11) — hay debate si doctrina valida cap al precio del contrato.
