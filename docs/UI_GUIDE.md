# UI Guide — Afiladocs

**Última revisión:** 2026-04-14
**Stack:** Next.js 15.3 + React 19 + Tailwind CSS v4.1 + shadcn/ui (Radix primitives) + DM Sans (next/font) + sonner (toasts).

## Tabla de contenidos

- [Design tokens](#design-tokens)
- [Tipografía](#tipografía)
- [Inventario de componentes `src/components/ui/`](#inventario-de-componentes-srccomponentsui)
- [Variantes de Button](#variantes-de-button)
- [Patrón formularios (RHF + Zod)](#patrón-formularios-rhf--zod)
- [Toasts con sonner](#toasts-con-sonner)
- [Accesibilidad](#accesibilidad)
- [Reglas de composición](#reglas-de-composición)

## Design tokens

Definidos en [src/app/globals.css](../src/app/globals.css) bajo `@theme inline`. Los valores son HSL sin `hsl()` (se envuelven en runtime con `hsl(var(--foo))`) para permitir `color-mix`/opacidad.

### Light (`:root`)

| Token | Valor | Uso |
|-------|-------|-----|
| `--primary` | `42 52% 48%` | Acciones principales (oro Afiladocs) |
| `--primary-foreground` | `0 0% 100%` | Texto sobre `primary` |
| `--secondary` | `0 0% 35%` | Acciones secundarias (gris oscuro) |
| `--accent` | `214 67% 13%` | Acentos oscuros (azul marino) |
| `--destructive` | `0 84% 60%` | Errores, eliminación |
| `--muted` / `--muted-foreground` | `0 0% 35%` | Texto atenuado |
| `--border` | `36 14% 87%` | Bordes por defecto |
| `--ring` | `42 52% 48%` | Focus ring (= primary) |
| `--background` | `36 20% 95%` | Fondo página (beige claro) |
| `--foreground` | `0 0% 10%` | Texto principal |
| `--card` / `--popover` | `0 0% 100%` | Superficies elevadas |
| `--input` | `0 0% 100%` | Fondo inputs |
| `--radius` | `0.5rem` | Base radio (`sm/md/lg/xl` derivados con `calc`) |

### Dark (`.dark`)

Mantiene `--primary`, `--accent`, `--destructive`, `--ring`. Cambian las superficies:

- `--background: 0 0% 10%`, `--foreground: 0 0% 95%`
- `--card: 0 0% 15%`, `--popover: 0 0% 15%`
- `--secondary: 0 0% 25%`, `--muted: 0 0% 25%`, `--muted-foreground: 0 0% 65%`
- `--border: 0 0% 25%`, `--input: 0 0% 20%`

### Sidebar

Set paralelo de tokens (`--sidebar-*`) para el shell de ops/portal: `--sidebar-background`, `--sidebar-foreground`, `--sidebar-primary`, `--sidebar-accent`, `--sidebar-border`, `--sidebar-ring`.

## Tipografía

- **Familia:** DM Sans vía [next/font](https://nextjs.org/docs/app/api-reference/components/font) — cargada en [src/app/layout.tsx](../src/app/layout.tsx).
- **Pesos preload:** `400`, `500`, `600`, `700`.
- **Subsets:** `latin`, `latin-ext` (cubre ES + catalán, gallego, euskera).
- **Estrategia:** `display: 'swap'` — muestra fallback inmediato.
- **Variable CSS:** `--font-sans` inyectada en `@theme` y consumida por Tailwind.
- **Stack fallback:** `"DM Sans", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`.

## Inventario de componentes [src/components/ui/](../src/components/ui/)

**Regla absoluta:** no editar estos archivos directamente. Si un componente no cubre un caso, crear un wrapper en `src/components/` que lo componga. Las actualizaciones vienen del CLI de shadcn.

| Archivo | Radix primitive | Propósito |
|---------|-----------------|-----------|
| `button.tsx` | `@radix-ui/react-slot` | Botón multi-variante (CVA) |
| `input.tsx` | nativo | Input de texto |
| `label.tsx` | `@radix-ui/react-label` | Label asociada accesible |
| `textarea.tsx` | nativo | Textarea |
| `checkbox.tsx` | `@radix-ui/react-checkbox` | Checkbox estilizado |
| `select.tsx` | `@radix-ui/react-select` | Select + SelectItem composables |
| `dialog.tsx` | `@radix-ui/react-dialog` | Modal |
| `alert-dialog.tsx` | `@radix-ui/react-alert-dialog` | Confirmaciones destructivas |
| `accordion.tsx` | `@radix-ui/react-accordion` | Secciones plegables |
| `sheet.tsx` | `@radix-ui/react-dialog` | Drawer lateral (cart, mobile nav) |
| `tooltip.tsx` | `@radix-ui/react-tooltip` | Tooltip hover/focus |
| `avatar.tsx` | `@radix-ui/react-avatar` | Avatar + fallback iniciales |
| `progress.tsx` | `@radix-ui/react-progress` | Barra progreso |
| `separator.tsx` | `@radix-ui/react-separator` | Divisor horizontal/vertical |
| `card.tsx` | composición | Card + Header/Title/Content/Footer |
| `badge.tsx` | composición | Etiquetas de estado |
| `skeleton.tsx` | composición | Placeholder mientras carga |
| `table.tsx` | nativo | Table + Thead/Tbody/Tr/Td |
| `password-input.tsx` | custom | Input con toggle visibilidad |
| `password-strength.tsx` | custom | Medidor fuerza contraseña |
| `sonner.tsx` | sonner | Wrapper del Toaster con tokens del tema |

## Variantes de Button

Definidas en [src/components/ui/button.tsx](../src/components/ui/button.tsx) usando `class-variance-authority`.

| `variant` | Clases clave |
|-----------|--------------|
| `default` | `bg-primary text-primary-foreground hover:bg-primary/90` |
| `destructive` | `bg-destructive text-white hover:bg-destructive/90` |
| `outline` | `border bg-background hover:bg-accent hover:text-accent-foreground` |
| `secondary` | `bg-secondary text-secondary-foreground hover:bg-secondary/80` |
| `ghost` | `hover:bg-accent hover:text-accent-foreground` |
| `link` | `text-primary underline-offset-4 hover:underline` |

| `size` | Clases |
|--------|--------|
| `default` | `h-9 px-4 py-2` |
| `sm` | `h-8 px-3 gap-1.5 rounded-md` |
| `lg` | `h-10 px-6 rounded-md` |
| `icon` | `size-9` |

## Patrón formularios (RHF + Zod)

Dos patrones coexisten en el repo:

1. **Formularios simples (contacto)** — `useState` + validación manual en el hook + Zod server-side en la API route. Ejemplo: [src/hooks/useContactForm.tsx](../src/hooks/useContactForm.tsx) + [src/app/api/contact/route.ts](../src/app/api/contact/route.ts).
2. **Formularios complejos (ops/productos, registro)** — `react-hook-form` + `zodResolver`. Este es el patrón preferido para nuevos formularios:

```tsx
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const Schema = z.object({
  email: z.string().email(),
  rgpd_accepted: z.literal(true, { message: 'Debes aceptar la política' }),
})
type FormValues = z.infer<typeof Schema>

export function ExampleForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(Schema),
  })

  async function onSubmit(values: FormValues) {
    const res = await fetch('/api/contact', { method: 'POST', body: JSON.stringify(values) })
    if (!res.ok) return toast.error('No se pudo enviar')
    toast.success('Enviado correctamente')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" {...register('email')} aria-invalid={!!errors.email} />
      {errors.email && <p role="alert">{errors.email.message}</p>}
      <Button type="submit" disabled={isSubmitting}>Enviar</Button>
    </form>
  )
}
```

**Regla absoluta (CLAUDE.md):** toda API route que reciba datos personales valida Zod + `rgpd_accepted === true` server-side antes de persistir. La validación cliente es mejora UX, no reemplaza la del server.

## Toasts con sonner

- Componente montado una sola vez en [src/app/layout.tsx](../src/app/layout.tsx) mediante `<Toaster />` de [src/components/ui/sonner.tsx](../src/components/ui/sonner.tsx).
- El wrapper inyecta tokens del tema (`--normal-bg`, `--normal-text`, `--normal-border`) → los toasts respetan light/dark automáticamente.
- API pública:

```ts
import { toast } from 'sonner'
toast.success('Guardado')
toast.error('Error al guardar')
toast.info('Información')
toast.warning('Cuidado')
toast('Mensaje neutro')
toast.promise(fetch('/api/x'), { loading: 'Guardando…', success: 'Hecho', error: 'Falló' })
```

## Accesibilidad

Afiladocs se compromete con WCAG 2.1 AA:

- **Focus:** siempre visible. `--ring` pinta el outline vía `focus-visible:ring-2 focus-visible:ring-ring`.
- **Radix primitives** traen keyboard navigation + aria correctos. No reimplementar modal/select/dialog sin primitiva.
- **Contraste:** texto `foreground` sobre `background` cumple 7:1 en light y ~10:1 en dark (validado con WebAIM). Elementos `muted` bajan a 4.5:1 mínimo.
- **Labels:** todo control asociado a `<Label htmlFor>` o envuelto en `<Label>`.
- **Errores:** anunciados con `role="alert"` o `aria-live="polite"`.
- **Imágenes:** `next/image` con `alt` obligatorio; `alt=""` sólo para decorativas.

## Reglas de composición

1. **"use client" sólo donde es necesario** — por defecto RSC. Cliente sólo si hay hooks React (`useState`, `useEffect`), eventos DOM o `next/navigation` client hooks.
2. **Path alias `@/`** — importar como `@/components/ui/button`, no rutas relativas profundas.
3. **`cn()` helper** — combinar clases condicionales con [src/lib/utils.ts](../src/lib/utils.ts) (`clsx + tailwind-merge`). Evita colisiones tipo `bg-red-500 bg-blue-500`.
4. **Sin `!important`** — si aparece, refactorizar el token o el orden del prop `className`.
5. **Iconos** — `lucide-react`. Tamaño por defecto `size-4` o `size-5`, heredan `currentColor` del padre.
6. **Imágenes de producto/blog** — SIEMPRE `next/image` con `sizes` explícito; nunca `<img>`.
7. **Animación** — `framer-motion` para transiciones no triviales; `tw-animate-css` para CSS-only.

Cualquier contribución que rompa alguna de estas reglas será rechazada en review (ver [guias/guia-ui-ux.md](guias/guia-ui-ux.md) para el checklist completo).
