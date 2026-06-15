# AFD-CIV-NDA-001 · QA jurídica preliminar

**Fecha QA:** 2026-06-15 · **Revisor:** Claude Code (checkpoint técnico — no sustituye validación humana) · **Draft fuente:** `draft-v0.1.0.md` · **Draft resultante:** `draft-v1.0.0.md` · **Estado propuesto:** pendiente firma jurídica humana antes de maquetación DOCX.

## Resolución de los 3 TODOs del draft v0.1.0

### TODO 1 · Importe por defecto de la cláusula penal (apartado 9)

Estado normativo: la cláusula penal está regulada en los arts. 1152-1155 CC y es de libre pacto (art. 1255 CC). No existe un importe legal por defecto. Un importe fijo predeterminado en una plantilla genérica es arriesgado: un valor desproporcionado podría ser moderado judicialmente (art. 1154 CC), y uno demasiado bajo desincentiva poco el incumplimiento.

**Decisión**: dejar el campo `{{clausula_penal_importe}}` **libre, sin valor por defecto**, e incorporar instrucción explícita en §9 para indicar "0" si no se desea cláusula penal (en cuyo caso rige la indemnización general por daños del art. 1101 CC). Se añade cita expresa del art. 1152 CC.

### TODO 2 · ¿NDA unilateral como variante o mantener solo bilateral?

**Decisión**: mantener **solo bilateral** en este SKU. El NDA bilateral cubre el caso de uso más frecuente (intercambio recíproco en negociaciones, due diligence, colaboraciones) y la redacción bilateral funciona también cuando una sola parte divulga (la otra simplemente no aporta información). Una variante unilateral se valora como SKU futuro si hay demanda, no como bloqueante de go-live. Documentado como sugerencia, no como cambio en v1.0.0.

### TODO 3 · Cita Ley 1/2019 frente a reformas 2024-2025

⚠️ **No verificado**: no puedo confirmar de memoria reformas de la Ley 1/2019 posteriores a enero de 2026. La redacción de v1.0.0 cita la Ley 1/2019 en su texto base (transposición de la Dir. UE 2016/943), que es estable. **Acción para el revisor humano**: confirmar antes de la firma que no hay reforma vigente de la Ley 1/2019 ni de los arts. 278-280 CP que altere las citas; si la hubiera, actualizar las referencias. Marcado también en "Límites explícitos".

## Observaciones adicionales (findings nuevos)

| #   | Sección | Hallazgo                                                                      | Acción en v1.0.0                                                                             |
| --- | ------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 1   | General | El v0.1.0 carecía de tildes (texto sin diacríticos).                          | Texto reescrito con ortografía completa.                                                     |
| 2   | §1      | No mencionaba capacidad/representación de los firmantes.                      | Añadida nota de capacidad y poder bastante + tratamiento de persona física.                  |
| 3   | §3.1    | Los tres requisitos del art. 1.1 Ley 1/2019 estaban comprimidos en una línea. | Desglosados de forma explícita (secreta / valor / medidas razonables).                       |
| 4   | §3.2    | Faltaba regla de carga de la prueba de las exclusiones.                       | Añadida nota: la carga recae en la Receptora.                                                |
| 5   | §4      | No se explicitaba la responsabilidad por personas con acceso.                 | Añadida cláusula de responsabilidad por terceros con acceso.                                 |
| 6   | §5      | Plazo sin orientación de razonabilidad.                                       | Añadida nota de razonabilidad (2-5 años orientativo) + persistencia del secreto empresarial. |
| 7   | §6      | Devolución sin plazo.                                                         | Añadido campo `{{plazo_devolucion_dias}}`.                                                   |
| 8   | §7      | RGPD tratado superficialmente; faltaba rol de las partes.                     | Ampliado: art. 28 (encargado) y art. 26 (corresponsabilidad) según rol.                      |
| 9   | §9      | Medidas cautelares solo citaban LEC.                                          | Añadida referencia a arts. 20-25 Ley 1/2019 (medidas específicas para secretos).             |
| 10  | §12     | Sumisión de fuero sin matiz de consumidores.                                  | Añadida nota sobre inoponibilidad frente a consumidor.                                       |
| 11  | Campos  | 18 → 20 campos tras añadir `plazo_devolucion_dias` (y consolidar).            | Listado actualizado.                                                                         |

## Veredicto

✅ **draft-v1.0.0.md listo para revisión humana de cierre**. Los 3 TODOs del v0.1.0 se resuelven y se incorporan 11 observaciones. Cambios marcados en el v1.0.0 con comentarios `<!-- QA-2026-06-15 -->`.

Tras la firma humana:

1. Bump `manifest.json` → `legal_reviewed_by`, `legal_reviewed_at`, `version: 1.0.0`, `status: template_ready`.
2. Maquetación DOCX + SHA256.
3. Seguir pasos 4-13 del checklist de cierre.

## Límites explícitos de esta QA

- Revisión técnica normativa, no asesoramiento legal vinculante.
- No suple la validación de un abogado colegiado con responsabilidad profesional.
- **Pendiente de verificación humana**: vigencia exacta de la Ley 1/2019 y arts. 278-280 CP frente a posibles reformas posteriores a enero de 2026 (ver TODO 3).
- No cubre NDA sujetos a Derecho extranjero ni cláusulas sectoriales específicas (p. ej. defensa, sanitario).
- Vigencia temporal: re-revisar si `legal_reviewed_at > 9m` (warning del auditor).
