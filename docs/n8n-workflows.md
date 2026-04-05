# n8n Workflows — Afiladocs

Documentacion de los workflows n8n que interactuan con la plataforma Afiladocs.

---

## 1. Formulario de contacto (existente)

**Endpoint n8n:** configurado via `N8N_CONTACT_WEBHOOK_URL`
**Trigger:** POST desde `/api/contact` cuando un usuario envia el formulario de contacto.
**Flujo:** Afiladocs envia los datos del formulario a n8n, que puede derivarlos a email, CRM, Notion, etc.

### Payload enviado por Afiladocs

```json
{
  "name": "string",
  "email": "string",
  "phone": "string (opcional)",
  "message": "string",
  "rgpd_accepted": true,
  "timestamp": "ISO 8601"
}
```

### Workflow sugerido en n8n

```
[Webhook Trigger] → [Notion: crear entrada en BD de leads]
                   → [Email: notificar a ops@afiladocs.com]
                   → [Slack/Telegram: alerta al equipo (opcional)]
```

---

## 2. Monitor normativo — Ingesta de alertas (nuevo)

**Endpoint Afiladocs:** `POST https://afiladocs.com/api/webhooks/n8n-alerts`
**Autenticacion:** `Authorization: Bearer <N8N_ALERTS_WEBHOOK_SECRET>`
**Direccion:** n8n envia alertas A Afiladocs (inverso al formulario de contacto).

### Proposito

Automatizar la ingesta de alertas legales y regulatorias en la tabla `monitor_alerts` de la base de datos. Las alertas aparecen automaticamente en el panel ops (`/ops/alertas`) para revision por el equipo.

### Payload — Alerta individual

```json
{
  "source": "BOE",
  "title": "Ley 12/2026 de modificacion de la LAU",
  "summary": "Cambios en prorroga obligatoria y fianzas de arrendamientos urbanos",
  "urgency": "alta",
  "raw_url": "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-12345",
  "published_at": "2026-04-05",
  "areas": ["arrendamientos", "derecho-civil"]
}
```

### Payload — Batch (hasta 50 alertas)

```json
[
  {
    "source": "BOE",
    "title": "...",
    "urgency": "alta",
    "areas": ["fiscal"]
  },
  {
    "source": "DOGV",
    "title": "...",
    "urgency": "baja",
    "areas": ["autonomico", "valencia"]
  }
]
```

### Campos del payload

| Campo | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| `source` | string | Si | Fuente de la alerta (BOE, DOGV, DOUE, CGPJ, AEPD, etc.) |
| `title` | string | Si | Titulo de la norma o alerta (max 500 chars) |
| `summary` | string | No | Resumen del contenido (max 2000 chars) |
| `urgency` | enum | No | `alta`, `media` (default), `baja` |
| `raw_url` | string | No | URL a la fuente original |
| `published_at` | string | No | Fecha de publicacion (ISO 8601 o YYYY-MM-DD) |
| `areas` | string[] | No | Areas de derecho afectadas (max 10) |

### Respuestas

| Codigo | Significado |
|--------|-------------|
| `200` | `{ "received": true, "count": N }` — alertas creadas |
| `401` | Token invalido o ausente |
| `422` | Validacion Zod fallida (detalle en respuesta) |
| `503` | `N8N_ALERTS_WEBHOOK_SECRET` no configurado |

### Comportamiento adicional

- Las alertas con `urgency: "alta"` **disparan un email automatico** a `ops@afiladocs.com` con enlace directo al panel de alertas.
- Todas las alertas se crean con `status: "pending_review"`.
- Tras la ingesta, se ejecuta `revalidateTag('alerts')` para invalidar cache del panel ops.

---

## 3. Workflow n8n: Monitor BOE/DOGV (recomendado)

### Descripcion

Workflow que monitoriza el BOE (Boletin Oficial del Estado) y el DOGV (Diario Oficial de la Generalitat Valenciana) diariamente, extrae las disposiciones relevantes para las areas de derecho de Afiladocs, y las envia al webhook de alertas.

### Arquitectura del workflow

```
[Schedule Trigger: 07:00 CET L-V]
    |
    ├─→ [HTTP Request: BOE API RSS]
    │       → [XML Parse]
    │       → [Filter: areas relevantes]
    │       → [Set: formatear payload]
    │
    ├─→ [HTTP Request: DOGV RSS]
    │       → [XML Parse]
    │       → [Filter: areas relevantes]
    │       → [Set: formatear payload]
    │
    └─→ [Merge: combinar resultados]
            → [Code: clasificar urgencia]
            → [HTTP Request: POST afiladocs.com/api/webhooks/n8n-alerts]
```

### Nodos detallados

#### 3.1 Schedule Trigger

- **Tipo:** Schedule Trigger
- **Cron:** `0 7 * * 1-5` (lunes a viernes a las 07:00 CET)

#### 3.2 HTTP Request — BOE

- **URL:** `https://www.boe.es/rss/boe.php?s=1` (seccion I: Disposiciones generales)
- **Metodo:** GET
- **Response Format:** XML

#### 3.3 XML Parse

- **Property:** `data` (output del HTTP Request)
- Extrae `item[]` con `title`, `link`, `description`, `pubDate`

#### 3.4 Filter — Areas relevantes

- **Tipo:** IF / Code node
- **Condicion:** titulo o descripcion contiene keywords:
  ```
  arrendamiento|alquiler|proteccion datos|RGPD|LOPDGDD|
  consumidor|autonomo|factura|impuesto|IVA|IRPF|
  sociedad limitada|mercantil|laboral|contrato|
  propiedad intelectual|comercio electronico|firma electronica
  ```

#### 3.5 Code — Clasificar urgencia

```javascript
// Logica de clasificacion
for (const item of items) {
  const title = item.json.title.toLowerCase();
  
  if (title.includes('ley orgánica') || title.includes('real decreto-ley')) {
    item.json.urgency = 'alta';
  } else if (title.includes('real decreto') || title.includes('orden')) {
    item.json.urgency = 'media';
  } else {
    item.json.urgency = 'baja';
  }
  
  // Detectar areas
  const areas = [];
  if (/arrendamiento|alquiler/i.test(title)) areas.push('arrendamientos');
  if (/datos|rgpd|lopdgdd|privacidad/i.test(title)) areas.push('proteccion-datos');
  if (/consumidor/i.test(title)) areas.push('consumo');
  if (/fiscal|impuesto|iva|irpf|factura/i.test(title)) areas.push('fiscal');
  if (/laboral|trabajo|empleo/i.test(title)) areas.push('laboral');
  if (/mercantil|sociedad/i.test(title)) areas.push('mercantil');
  
  item.json.areas = areas.length > 0 ? areas : ['general'];
}

return items;
```

#### 3.6 Set — Formatear payload

```javascript
// Mapear al schema del webhook
return items.map(item => ({
  json: {
    source: 'BOE', // o 'DOGV'
    title: item.json.title,
    summary: item.json.description?.substring(0, 2000) || null,
    urgency: item.json.urgency,
    raw_url: item.json.link,
    published_at: item.json.pubDate,
    areas: item.json.areas,
  }
}));
```

#### 3.7 HTTP Request — POST a Afiladocs

- **URL:** `https://afiladocs.com/api/webhooks/n8n-alerts`
- **Metodo:** POST
- **Headers:**
  - `Authorization: Bearer {{$env.N8N_ALERTS_WEBHOOK_SECRET}}`
  - `Content-Type: application/json`
- **Body:** Array de alertas formateadas

---

## 4. Workflow n8n: Monitor AEPD (recomendado)

### Descripcion

Monitoriza la Agencia Espanola de Proteccion de Datos para resoluciones, guias y sanciones relevantes.

### Arquitectura

```
[Schedule Trigger: 08:00 CET L-V]
    → [HTTP Request: AEPD RSS/scrape]
    → [Code: extraer resoluciones nuevas]
    → [Filter: relevantes para clientes Afiladocs]
    → [Set: urgency=alta si sancion > 100k EUR]
    → [HTTP Request: POST afiladocs.com/api/webhooks/n8n-alerts]
```

### Fuentes AEPD

- Resoluciones: `https://www.aepd.es/es/informes-y-resoluciones/resoluciones`
- Blog/Noticias: `https://www.aepd.es/es/prensa-y-comunicacion/notas-de-prensa`

---

## 5. Workflow n8n: Monitor CGPJ / Jurisprudencia (opcional)

### Descripcion

Busqueda periodica en CENDOJ de sentencias relevantes por materias.

### Arquitectura

```
[Schedule Trigger: semanal, lunes 06:00]
    → [HTTP Request: CENDOJ busqueda por materias]
    → [Code: filtrar por tribunales y fechas]
    → [Set: formatear como alertas]
    → [HTTP Request: POST afiladocs.com/api/webhooks/n8n-alerts]
```

---

## Configuracion en n8n

### Variables de entorno necesarias en n8n

| Variable | Valor |
|----------|-------|
| `N8N_ALERTS_WEBHOOK_SECRET` | Mismo valor que en Vercel env vars |
| `AFILADOCS_ALERTS_URL` | `https://afiladocs.com/api/webhooks/n8n-alerts` |

### Credenciales

Crear una credencial de tipo "Header Auth" en n8n:
- **Name:** `Afiladocs Alerts Webhook`
- **Header Name:** `Authorization`
- **Header Value:** `Bearer <N8N_ALERTS_WEBHOOK_SECRET>`

---

## Testing

### Curl de prueba (alerta individual)

```bash
curl -X POST https://afiladocs.com/api/webhooks/n8n-alerts \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "BOE",
    "title": "Real Decreto-ley 5/2026 de medidas urgentes en materia de vivienda",
    "summary": "Ampliacion de prorroga extraordinaria de contratos de alquiler",
    "urgency": "alta",
    "raw_url": "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-99999",
    "published_at": "2026-04-05",
    "areas": ["arrendamientos", "derecho-civil"]
  }'
```

### Curl de prueba (batch)

```bash
curl -X POST https://afiladocs.com/api/webhooks/n8n-alerts \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '[
    {"source":"BOE","title":"Test alerta 1","urgency":"media","areas":["fiscal"]},
    {"source":"DOGV","title":"Test alerta 2","urgency":"baja","areas":["autonomico"]}
  ]'
```

### Respuesta esperada

```json
{ "received": true, "count": 2 }
```
