# AFD-REV-CONTRACT-001 · Revision experta de contrato (human_review)

**Version:** 0.1.0 · **Estado:** draft · **Familia:** review · **Delivery:** `human_review` · **eIDAS:** SES · **Precio:** 99 €

**Indice aplicado:** INDICE §H · **Fuentes:** variable segun contrato aportado por el cliente.

Este SKU **no tiene DOCX master ni template DocuSeal ni fichero en Storage**. La entrega es un informe humano producido por un profesional sobre el documento que el cliente aporta tras el pago.

---

## Flujo tecnico (ya implementado)

1. Cliente compra → Stripe checkout → webhook `checkout.session.completed`.
2. `src/lib/orders/dispatch.ts` con `delivery_mode=human_review` crea `orders.status=intake_pending` sin submission DocuSeal.
3. Email `intake-required.tsx` al cliente con enlace a `/portal/pedido/[id]`.
4. Cliente sube su contrato (PDF o DOCX) al portal → Supabase Storage bucket `uploads/<order_id>/`.
5. Email a `ops@afiladocs.com` notificando nuevo intake (fila en `monitor_alerts` si SLA > 48 h).
6. Revisor entra a `/ops/pedido/[id]`, descarga el contrato, redacta el informe de revision siguiendo la plantilla del apartado siguiente.
7. Revisor carga informe final PDF en `/ops/pedido/[id]` → Supabase Storage `documents/<order_id>/review_<ts>.pdf`.
8. Trigger `documents.status=final` → email `review-ready.tsx` al cliente con signed URL de descarga.
9. Cliente descarga desde `/portal/pedido/[id]`.

## Plantilla interna del informe de revision (para uso del profesional)

No se entrega al cliente esta plantilla como tal, pero todos los informes deben seguir esta estructura para consistencia.

---

### INFORME DE REVISION DE CONTRATO · Afiladocs

**Referencia pedido:** `[ORDER_ID]`
**Cliente:** `[NOMBRE_CLIENTE]` · `[EMAIL_CLIENTE]`
**Fecha de emision:** `[FECHA]`
**Revisor:** `[NOMBRE_REVISOR]` · Colegiado `[COLEGIO_NUMERO]`
**Documento revisado:** `[TITULO_CONTRATO]`, fecha `[FECHA_CONTRATO]`, paginas `[NUM_PAGINAS]`

---

#### 1. Resumen ejecutivo

Tres a cinco lineas con:

- Tipo de contrato y normativa aplicable principal.
- Valoracion general (viable / viable con ajustes / alto riesgo).
- Top-3 riesgos identificados.
- Recomendacion de actuacion (firmar / renegociar / no firmar sin cambios).

#### 2. Analisis clausula por clausula

Tabla en 4 columnas:

| Clausula | Observacion | Norma aplicable | Propuesta |
|----------|-------------|-----------------|-----------|
| [numero y titulo] | [descripcion tecnica del problema o confirmacion de correccion] | [articulo concreto + codigo de la norma] | [redaccion alternativa o indicacion "mantener"] |

Cubrir todas las clausulas del contrato aportado, incluso las que estan correctamente redactadas (indicar "sin observaciones").

#### 3. Riesgos identificados por severidad

- **Alta:** riesgos que pueden llevar a nulidad, sancion administrativa o perdida economica significativa. Intervencion obligatoria antes de firmar.
- **Media:** riesgos de litigiosidad o interpretacion conflictiva. Recomendable revisar.
- **Baja:** mejoras de redaccion o clausulas no optimas.

Por cada riesgo: descripcion, consecuencia probable, clausula afectada, propuesta de mitigacion.

#### 4. Propuestas de redaccion alternativa

Seleccionar 3-5 clausulas criticas y ofrecer texto alternativo completo (no solo indicaciones). Formato "redline" preferido si se entrega en DOCX; bloque claro "Texto actual" / "Texto propuesto" si es PDF.

#### 5. Aspectos de proteccion de datos (si procede)

Si el contrato implica tratamiento de datos personales:

- ¿Hay acuerdo de encargado (art. 28 RGPD) o esta incorporado?
- ¿Se identifican transferencias internacionales y sus garantias?
- ¿Plazos de conservacion son razonables?
- ¿Medidas de seguridad referenciadas?

#### 6. Puntos a negociar con la contraparte

Lista priorizada de 3-5 puntos que el cliente deberia plantear en la negociacion, ordenados por criticidad/valor.

#### 7. Advertencias finales y limitaciones del informe

- Este informe revisa el documento aportado tal cual, sin acceso a correspondencia previa ni contexto contractual completo.
- Las propuestas se basan en la normativa espanola vigente a la fecha de emision.
- No sustituye el asesoramiento letrado continuado en caso de litigio.

#### 8. Firma

Firma manuscrita o electronica del revisor con indicacion de nombre, colegio y numero de colegiado. Fecha.

---

## SLA operativo

| Parametro | Valor objetivo |
|-----------|---------------|
| Tiempo desde pago hasta email intake al cliente | < 5 minutos (automatizado) |
| Tiempo desde subida cliente hasta inicio revision | < 24 h habiles |
| Tiempo desde inicio revision hasta entrega informe | 48-72 h habiles (contrato < 10 paginas) / 5 dias habiles (> 10 paginas) |
| Tiempo total percibido por cliente (pago → informe) | < 7 dias naturales en el 95 % de los casos |

SLA monitorizado por cron `/api/cron/sla-monitor` (ya implementado). Si la alerta salta, ops debe intervenir.

## Campos DocuSeal

**Ninguno.** Este SKU no pasa por DocuSeal.

## Campos Storage

**Ninguno en `templates/`.** Los artefactos se generan bajo demanda en `uploads/<order_id>/` (input cliente) y `documents/<order_id>/` (output revision).

## Pie de los informes emitidos

`Afiladocs · AFD-REV-CONTRACT-001 · Informe v1 · revisor {{nombre_revisor}} · fecha {{fecha_emision}}`

## TODO checkpoint 2

- Decidir si la plantilla interna del informe se publica como material de apoyo al revisor (Notion interno) o se mantiene solo en esta skill.
- Confirmar SLA operativo con revisor humano designado (apartado de SLA).
- Validar contenido del apartado 7 (advertencias) como disclaimer legal suficiente.
- Definir politica de revisiones secundarias si el cliente pide aclaraciones al informe (incluidas? con coste adicional?).
