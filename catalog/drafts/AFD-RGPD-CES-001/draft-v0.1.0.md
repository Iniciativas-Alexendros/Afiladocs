# AFD-RGPD-CES-001 · Contrato de encargado del tratamiento

**Version:** 0.1.0 · **Estado:** draft · **Familia:** RGPD · **Delivery:** `docuseal_fill_and_sign` · **eIDAS:** AES · **Precio:** 39 €

**Indice aplicado:** INDICE §F · **Fuentes:** RGPD art. 28 · LOPDGDD art. 33 · Decision (UE) 2021/915 clausulas tipo responsable-encargado.

---

## Nota legal

> Plantilla base conforme a normativa espanola en la fecha de ultima revision. Adecuacion al caso concreto requiere verificacion del usuario o su asesor. Ver `/revisiones`.

## 1. Partes

**El Responsable:** `{{responsable_nombre}}`, NIF `{{responsable_nif}}`, domicilio `{{responsable_domicilio}}`, representado por `{{responsable_representante}}` (`{{responsable_cargo}}`).

**El Encargado:** `{{encargado_nombre}}`, NIF `{{encargado_nif}}`, domicilio `{{encargado_domicilio}}`, representado por `{{encargado_representante}}` (`{{encargado_cargo}}`).

## 2. Antecedentes

Las Partes mantienen (o formalizan en este acto) una relacion contractual principal consistente en `{{contrato_principal_descripcion}}`. En ejecucion de dicha relacion, el Encargado accedera o tratara datos personales por cuenta del Responsable. El presente documento regula dicho tratamiento conforme al art. 28 RGPD.

## 3. Objeto

El Encargado tratara datos personales por cuenta del Responsable, con sujecion a las instrucciones de este, exclusivamente para las finalidades descritas en el Anexo I y bajo las condiciones del RGPD, LOPDGDD y demas normativa aplicable.

## 4. Detalles del tratamiento (Anexo I del art. 28.3 RGPD)

Se especifican en el Anexo I del presente contrato los siguientes elementos obligatorios:

- objeto del tratamiento;
- duracion del tratamiento;
- naturaleza y finalidad del tratamiento;
- tipo de datos personales;
- categorias de interesados;
- obligaciones y derechos del Responsable.

## 5. Obligaciones del Encargado (art. 28.3 RGPD)

El Encargado se compromete a:

- **(a)** Tratar los datos unicamente conforme a instrucciones documentadas del Responsable, incluso para transferencias internacionales, salvo obligacion legal, en cuyo caso informara al Responsable salvo prohibicion legal.
- **(b)** Garantizar que las personas autorizadas a tratar los datos se han comprometido a respetar la confidencialidad o estan sujetas a obligacion legal equivalente.
- **(c)** Adoptar las medidas tecnicas y organizativas exigidas por el art. 32 RGPD, detalladas en el Anexo II.
- **(d)** Respetar las condiciones para recurrir a subencargados (apartado 6).
- **(e)** Asistir al Responsable, mediante medidas tecnicas y organizativas apropiadas, en la atencion de solicitudes de ejercicio de derechos ARSULIPO de los interesados.
- **(f)** Asistir al Responsable en el cumplimiento de las obligaciones de los arts. 32 a 36 RGPD, teniendo en cuenta la naturaleza del tratamiento y la informacion a disposicion del Encargado.
- **(g)** A eleccion del Responsable, devolver o suprimir todos los datos personales al termino del tratamiento, y eliminar las copias existentes, salvo obligacion legal de conservacion.
- **(h)** Poner a disposicion del Responsable toda la informacion necesaria para demostrar el cumplimiento de las obligaciones del art. 28 y permitir y contribuir a auditorias, incluidas inspecciones, realizadas por el Responsable o un auditor autorizado.

El Encargado informara al Responsable, sin dilacion indebida, si considera que una instruccion infringe el RGPD o la LOPDGDD.

## 6. Subencargados

- El Encargado `{{subencargo_regimen}}` (autorizacion general / autorizacion especifica caso por caso).
- Lista inicial de subencargados autorizados: `{{subencargos_lista_inicial}}`.
- El Encargado notificara cualquier cambio previsto en la adicion o sustitucion de subencargados con `{{subencargos_preaviso_dias}}` dias de antelacion, concediendo al Responsable la posibilidad de oponerse.
- Todo subencargado asumira por contrato las mismas obligaciones que el Encargado bajo este contrato.

## 7. Transferencias internacionales

- `{{transferencias_tratamiento}}` (Si aplica: pais/es de destino, base legal — decision de adecuacion, clausulas contractuales tipo, normas corporativas vinculantes, excepciones art. 49 RGPD).
- Si se usan clausulas tipo de la Comision, se incorporan como Anexo III.

## 8. Violaciones de seguridad

El Encargado notificara al Responsable cualquier violacion de seguridad de datos personales sin dilacion indebida y, en todo caso, **en un plazo maximo de 48 horas** desde su conocimiento, proporcionando la informacion minima del art. 33.3 RGPD (naturaleza, categorias y numero aproximado de interesados, consecuencias probables y medidas adoptadas).

## 9. Derechos de los interesados

Si un interesado ejerce derechos ARSULIPO ante el Encargado, este los trasladara al Responsable en un plazo maximo de `{{plazo_traslado_derechos}}` dias, absteniendose de darles respuesta salvo instruccion del Responsable.

## 10. Responsabilidad

Cada Parte respondera de los danos causados por incumplimiento propio de sus obligaciones. La responsabilidad del Encargado se rige por el art. 82 RGPD. No se establecen limites de responsabilidad para conductas dolosas o gravemente negligentes ni para incumplimientos del RGPD.

## 11. Duracion

Este contrato entra en vigor el `{{fecha_inicio}}` y se mantendra mientras dure la relacion contractual principal, extinguiendose con esta salvo que las partes acuerden lo contrario.

## 12. Ley aplicable y jurisdiccion

Legislacion espanola. Juzgados y Tribunales de `{{jurisdiccion}}`.

## 13. Anexo I — Descripcion detallada del tratamiento

- **Objeto:** `{{anexo1_objeto}}`
- **Duracion:** `{{anexo1_duracion}}`
- **Naturaleza y fin:** `{{anexo1_naturaleza_fin}}`
- **Tipo de datos:** `{{anexo1_tipo_datos}}`
- **Categorias de interesados:** `{{anexo1_categorias_interesados}}`
- **Obligaciones y derechos del Responsable:** `{{anexo1_obligaciones_derechos}}`

## 14. Anexo II — Medidas tecnicas y organizativas

Se aplicaran, como minimo, las siguientes medidas (completar/adaptar al caso):

- control de accesos con autenticacion fuerte;
- cifrado en transito (TLS 1.2+) y en reposo para datos sensibles;
- pseudonimizacion donde sea tecnicamente posible;
- segregacion de entornos (produccion / pruebas);
- copias de seguridad periodicas con prueba de restauracion;
- gestion de vulnerabilidades y parcheado regular;
- formacion periodica del personal en proteccion de datos;
- procedimiento de deteccion, evaluacion y notificacion de brechas;
- auditorias internas y externas periodicas.

## 15. Firmas

- Responsable: `{{signature_responsable}}` — `{{responsable_representante}}`, `{{fecha_firma_responsable}}`
- Encargado: `{{signature_encargado}}` — `{{encargado_representante}}`, `{{fecha_firma_encargado}}`

---

## Campos DocuSeal

```
responsable_nombre, responsable_nif, responsable_domicilio, responsable_representante, responsable_cargo,
encargado_nombre, encargado_nif, encargado_domicilio, encargado_representante, encargado_cargo,
contrato_principal_descripcion,
subencargo_regimen, subencargos_lista_inicial, subencargos_preaviso_dias,
transferencias_tratamiento,
plazo_traslado_derechos, fecha_inicio, jurisdiccion,
anexo1_objeto, anexo1_duracion, anexo1_naturaleza_fin, anexo1_tipo_datos,
anexo1_categorias_interesados, anexo1_obligaciones_derechos,
signature_responsable, fecha_firma_responsable, signature_encargado, fecha_firma_encargado
```

## Pie

`Afiladocs · AFD-RGPD-CES-001 · v0.1.0 · revision {{fecha_revision_legal}}`

## TODO checkpoint 2

- Decidir si el Anexo III (clausulas tipo CE 2021/915) se incorpora por referencia o inline (impacto DocuSeal si inline).
- Validar plazo 48 h de notificacion de brechas (apartado 8) frente a 72 h del Responsable al AEPD (margen operativo).
- Revisar subencargos (apartado 6): autorizacion general vs. especifica por defecto.
