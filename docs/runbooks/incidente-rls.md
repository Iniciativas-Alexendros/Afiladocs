# Runbook — Violación de RLS (cliente ve datos de otro cliente)

**Última revisión:** 2026-04-14
**Severidad:** S0 si se confirma exposición de datos personales. Obligación RGPD art. 33: notificar AEPD en < 72h.

## Señales de alarma

- Cliente reporta ver un pedido, documento o perfil que no reconoce.
- Sentry captura `CrossTenantAccess` o tracelas con `user_id` distinto al `auth.user.id`.
- Audit log muestra `event: 'document.downloaded'` con `user_id` distinto al propietario del documento.
- Review de código descubre una query sin filtro `user_id` en portal.

## Contención inmediata (< 15 min)

1. **Cortar exposición.** Si el bug está localizado en una ruta concreta:
   - Opción rápida: desactivar la ruta vía feature flag (Edge Config en F6) o revertir el deploy ([rollback-vercel.md](rollback-vercel.md)).
   - Si no hay rollback posible: forzar 503 en la ruta añadiendo un gate en el server component y redeploy urgente.
2. **Invalidar sesiones sospechosas.** Supabase Dashboard → Auth → Users → para los `user_id` afectados: **Sign out all sessions**.
3. **Notificar internamente.** Crear canal/thread de incident con timeline arrancado.

## Diagnóstico técnico

### 1. Identificar el alcance

```sql
-- todas las descargas del usuario afectado en las últimas 72h
select user_id, order_id, metadata, created_at
from audit_log
where user_id = '<afectado>' and event = 'document.downloaded'
order by created_at desc;

-- documentos accedidos que no eran suyos
select d.id, d.order_id, o.user_id as owner, a.user_id as accessor, a.created_at
from audit_log a
join documents d on d.id = (a.metadata->>'document_id')::uuid
join orders o on o.id = d.order_id
where a.event = 'document.downloaded'
  and o.user_id != a.user_id
  and a.created_at > now() - interval '72 hours';
```

Si la segunda query devuelve filas → exposición confirmada.

### 2. Causa raíz probable

| Categoría | Ejemplo |
|-----------|---------|
| **Query sin filtro `user_id`** | `prisma.orders.findFirst({where: {id}})` sin `AND user_id = auth.user.id` |
| **Server action sin `requireAuth()`** | Handler expone datos antes del gate |
| **RLS de Supabase desactivada** | `pg_policies` muestra tabla con `rowsecurity = false` |
| **Signed URL mal generada** | URL sin expiración o firmada con service role key sin check previo |
| **Cache contaminado** | `unstable_cache` sin tag por `user_id`, devuelve datos de otro |

### 3. Verificar RLS en Supabase

```sql
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('orders', 'documents', 'subscriptions', 'profiles', 'audit_log', 'monitor_alerts');
-- rowsecurity debe ser true en todas

select tablename, policyname, permissive, cmd, qual
from pg_policies
where schemaname = 'public';
```

Las políticas deben filtrar siempre por `auth.uid() = user_id` (o equivalente) en `SELECT/UPDATE/DELETE` para tablas de tenant.

### 4. Verificar el código

```bash
rg -n "prisma\.(orders|documents|subscriptions|profiles)\.(findFirst|findMany|update|delete)" src/app/portal src/app/api/checkout
```

Toda llamada desde portal/API de cliente debe incluir `user_id: user.id` en el `where`. Si aparece una sin él → bug confirmado.

## Mitigación definitiva

1. **Parche de código.** PR hotfix con:
   - Añadir filtro `user_id` en la query culpable.
   - Test de regresión (`vitest` / `playwright`) que verifique que un usuario A no puede leer recurso de B.
2. **Reforzar RLS.** Activar políticas faltantes:

   ```sql
   alter table public.orders enable row level security;

   create policy orders_owner_select
   on public.orders for select
   using (auth.uid() = user_id);
   ```

   Si ya existen pero el bug pasó el filtro de aplicación, confirmar que el cliente usa el **anon key** vía RLS y no el **service role key** en paths que deberían ir RLS-protected.
3. **Purgar cache.** `revalidateTag('orders')` y `revalidateTag('documents')` tras el parche. Si hay Upstash/Redis, flush.
4. **Rotar sesiones.** Tras el deploy del parche, invalidar todas las sesiones en Supabase Auth si hay sospecha de explotación activa.

## Comunicación

### Interna

- Equipo técnico: timeline + causa raíz + mitigación en incident channel.
- @Alexendros (DPO de facto): evaluar notificación AEPD.

### Clientes afectados

Si ha habido exposición confirmada y contiene datos personales identificativos:

- Email directo en < 24h con: qué dato se expuso, a quién, desde cuándo, qué se ha hecho, acciones recomendadas (cambio de contraseña).
- Registrar el envío en `audit_log` `event: 'rgpd.breach_notified'`, `metadata: {user_id, breach_id}`.

### AEPD (RGPD art. 33)

Obligatorio si la exposición afecta a datos personales y hay riesgo para derechos/libertades de los afectados. Plazo: **72 horas** desde detección.

1. Acceder a sede electrónica AEPD → formulario "Notificación de brechas de seguridad".
2. Información mínima: naturaleza, categorías y número aproximado de afectados, medidas adoptadas, datos de contacto del DPO.
3. Guardar justificante en `/compliance/breaches/` (privado, fuera del repo).

## Post-mortem

1. Issue `incident/<fecha>-rls-<slug>` con timeline completo.
2. Lista de tablas auditadas y estado de RLS al momento del incidente (snapshot de `pg_policies`).
3. Mejoras preventivas:
   - Test automático en CI: query portal con user A, intentar leer recurso de user B, esperar 404/403.
   - Review obligatoria de todas las queries nuevas en portal/API por un segundo ingeniero.
   - F4: añadir check periódico `pg_policies` que alerte si RLS se desactiva accidentalmente.

## Referencias

- [guias/guia-seguridad.md](../guias/guia-seguridad.md) — política RLS y reglas de acceso.
- [CLAUDE.md](../../CLAUDE.md) — regla absoluta: "SIEMPRE valida rgpd_accepted === true server-side antes de procesar datos personales".
- Supabase Docs: <https://supabase.com/docs/guides/database/postgres/row-level-security>
- AEPD, Guía para la notificación de brechas de datos personales: <https://www.aepd.es/guias/guia-notificacion-brechas-datos.pdf>
