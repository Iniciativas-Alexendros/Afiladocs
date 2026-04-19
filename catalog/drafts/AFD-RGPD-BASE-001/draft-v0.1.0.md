# AFD-RGPD-BASE-001 · Pack RGPD basico (download_after_payment)

**Version:** 0.1.0 · **Estado:** draft · **Familia:** rgpd · **Delivery:** `download_after_payment` · **eIDAS:** SES · **Precio:** 49 €

**Indice aplicado:** INDICE §G · **Fuentes:** RGPD · LOPDGDD · LSSI-CE · Guia AEPD "Adecuacion al RGPD".

Este SKU NO pasa por DocuSeal. Se entrega como **ZIP** descargable mediante signed URL tras el pago (`src/lib/orders/dispatch.ts` → modo `download_after_payment`). Requiere que REG-001 y POL-001 esten ya maquetados (dependencia Oleada 1 → Oleada 3).

---

## Composicion del ZIP `afiladocs-pack-rgpd-basico-v1.0.0.zip`

| # | Fichero | Origen | Proposito |
|---|---------|--------|-----------|
| 1 | `01-registro-actividades-basico.docx` | Subset de REG-001 (2 actividades en lugar de 5) | Registro minimo del art. 30 RGPD |
| 2 | `02-politica-privacidad-web.docx` | Subset de POL-001 (sin menciones a newsletter si B2C basico) | Texto listo para publicar en web |
| 3 | `03-aviso-legal-lssi.docx` | Texto nuevo especifico para el pack | Cumplimiento art. 10 LSSI-CE |
| 4 | `04-clausulas-formularios.docx` | Capa 1 + capa 2 textuales | Para copiar en cada formulario web |
| 5 | `05-politica-cookies.docx` | Plantilla AEPD adaptada | Cumplimiento art. 22.2 LSSI-CE |
| 6 | `LEEME.pdf` | Guia de uso de los 5 ficheros + referencia a `/revisiones` | Onboarding del cliente |

## Caracteristicas del pack

- **Rellenable sin herramientas externas:** los DOCX tienen campos entre corchetes `[ASI_RELLENAR]` para que el cliente los sustituya en su procesador de texto. No requiere firma electronica.
- **Destinado a:** microempresa / autonomo / pyme que publica un sitio web con formulario de contacto y tiene 1-2 actividades de tratamiento.
- **NO apto para:** responsables con categorias especiales de datos, transferencias internacionales complejas, multiples corresponsables, o actividades de alto riesgo que requieran DPIA.

## Estructura ZIP

```
afiladocs-pack-rgpd-basico-v1.0.0.zip
├── LEEME.pdf                              (firmado por Afiladocs)
├── 01-registro-actividades-basico.docx
├── 02-politica-privacidad-web.docx
├── 03-aviso-legal-lssi.docx
├── 04-clausulas-formularios.docx
└── 05-politica-cookies.docx
```

## 03-aviso-legal-lssi.docx (contenido master)

Este es el unico fichero del pack que **no** deriva de otro SKU. A continuacion su contenido base.

---

### AVISO LEGAL (LSSI-CE art. 10 y normativa complementaria)

**Titular del sitio web:**
- Denominacion: `[RAZON_SOCIAL]`
- NIF/CIF: `[NIF]`
- Domicilio: `[DOMICILIO_COMPLETO]`
- Email de contacto: `[EMAIL]`
- Telefono: `[TELEFONO]`
- Datos registrales (sociedades): `[REGISTRO_MERCANTIL_HOJA_TOMO_FOLIO]`
- Colegiacion profesional (si aplica): `[COLEGIO_NUMERO]`

**Objeto del sitio web:** descripcion del servicio o producto ofrecido en `[DOMINIO]`.

**Condiciones generales de uso:**

1. El acceso al sitio web implica el conocimiento y aceptacion de las presentes condiciones. Si no esta conforme, debe abstenerse de su uso.
2. El Titular puede modificar en cualquier momento los contenidos y las condiciones.
3. El usuario se compromete a hacer un uso diligente del sitio web y de la informacion contenida.

**Propiedad intelectual:** todos los contenidos (textos, imagenes, logos, disenos, codigo) son titularidad del Titular o de terceros con autorizacion, y estan protegidos por la normativa de propiedad intelectual. Queda prohibida su reproduccion sin autorizacion expresa.

**Responsabilidad:** el Titular no se hace responsable de los danos derivados del mal uso del sitio web, ni de los contenidos de sitios enlazados.

**Legislacion aplicable y jurisdiccion:** legislacion espanola. Juzgados y Tribunales del domicilio del Titular, sin perjuicio del fuero que corresponda al consumidor.

---

## 04-clausulas-formularios.docx (contenido master)

### Capa 1 (texto breve para pegar junto a cada formulario)

> Tus datos seran tratados por `[RAZON_SOCIAL]` (NIF `[NIF]`) para atender tu `[FINALIDAD_BREVE]`. Base juridica: `[BASE_JURIDICA]`. Puedes ejercer tus derechos en `[EMAIL_DERECHOS]`. Mas informacion en nuestra [Politica de Privacidad](`[URL_POLITICA]`).

### Capa 2 (informacion completa enlazada)

> Se cumple reenviando a la Politica de Privacidad publicada (`02-politica-privacidad-web.docx` una vez rellenada y publicada como HTML).

### Checkboxes obligatorios

- [ ] `He leido y acepto la Politica de Privacidad.` (obligatorio)
- [ ] `Acepto recibir comunicaciones comerciales sobre productos y servicios.` (opcional, granular — no condiciona el envio)

---

## 05-politica-cookies.docx (contenido master)

Incluye:
- Definicion de cookie.
- Tipos de cookies usadas (tecnicas, analiticas, publicidad, etc.) — tabla rellenable.
- Base juridica (tecnicas: art. 22.2 LSSI excepcion; resto: consentimiento).
- Gestion del consentimiento (referencia al banner).
- Como deshabilitar cookies (instrucciones por navegador).
- Contacto DPO / responsable.

(Estructura completa se desarrolla al maquetar, siguiendo la ultima Guia AEPD de cookies.)

---

## LEEME.pdf (contenido)

El `LEEME.pdf` es una guia breve (3-4 paginas) que explica:

1. **Que contiene el pack** y a quien va dirigido.
2. **Orden sugerido de uso:** politica privacidad web → aviso legal → clausulas formularios → politica cookies → registro actividades.
3. **Como rellenarlos:** buscar y reemplazar los `[CAMPO]` en cada DOCX.
4. **Como publicarlos:** indicaciones basicas de donde enlazarlos en un sitio web tipico.
5. **Que NO hace este pack:** avisa expresamente de que no sustituye a una auditoria de proteccion de datos, no cubre DPIA, no cubre transferencias internacionales complejas, no cubre datos de categorias especiales.
6. **Cuando solicitar revision humana:** enlace a `https://afiladocs.com/revisiones` y recomendacion de pasarlo por AFD-REV-CONTRACT-001 si hay dudas.
7. **Actualizaciones:** politica de versionado (quien descarga v1.0.0 puede comprar v1.1.0 con descuento si hay cambios sustanciales — a confirmar comercialmente).
8. **Contacto soporte:** `[EMAIL_SOPORTE]` para incidencias tecnicas del ZIP.

---

## Dependencias de produccion

Este SKU se produce **despues** de Oleada 1 (REG y POL) porque los ficheros 1 y 2 son subsets directos de REG-001 y POL-001.

Pipeline especifico:

1. REG-001 y POL-001 en status `live` en manifest.
2. [C] Generar subset `01-registro-actividades-basico.docx` (solo actividades 1-2 del master REG).
3. [C] Generar subset `02-politica-privacidad-web.docx` (quitar secciones de newsletter si se decide perfil basico).
4. [C] Redactar `03-aviso-legal-lssi.docx`, `04-clausulas-formularios.docx`, `05-politica-cookies.docx` como DOCX nuevos.
5. [C] Generar `LEEME.pdf` desde un MD fuente.
6. [C] Empaquetar los 6 ficheros como `afiladocs-pack-rgpd-basico-v1.0.0.zip`.
7. [C] SHA256 del ZIP completo → `storage_sha256.zip` en manifest.
8. [A] Subir ZIP a Supabase Storage `templates/rgpd/AFD-RGPD-BASE-001/afiladocs-pack-rgpd-basico-v1.0.0.zip`.
9. [A] `/ops/productos/AFD-RGPD-BASE-001` → poblar `storage_path`, NO `docuseal_template_id` (prohibido para `download_after_payment`).
10. [A] Crear price en Stripe LIVE 49 € con metadata `sku=AFD-RGPD-BASE-001`, `afiladocs_category=rgpd`, `delivery_mode=download_after_payment`.
11. [C] Auditar SKU → ✅.
12. Smoke test T3: compra con cupon 100 %, recibir email con signed URL, descargar ZIP, abrir cada DOCX y verificar que los campos `[CAMPO]` aparecen bien.
13. Activar `is_active=true`.

## Pie del LEEME.pdf

`Afiladocs · AFD-RGPD-BASE-001 · v0.1.0 · revision {{fecha_revision_legal}}`

## TODO checkpoint 2

- Decidir perfil "basico" del pack: 2 actividades de tratamiento maximo? o dejar plantilla extensible?
- Validar contenido de `03-aviso-legal-lssi.docx` contra Guia AEPD "Adecuacion al RGPD".
- Confirmar politica comercial de upgrades entre versiones del pack (v1.0.0 → v1.1.0).
- Evaluar si el `LEEME.pdf` debe llevar firma visual de Afiladocs (confianza) o mantenerse como simple guia.
