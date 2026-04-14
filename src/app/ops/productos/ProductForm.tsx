'use client'

import { useActionState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { createProduct, updateProduct, type ProductFormState } from './actions'

type Product = {
  sku: string
  slug: string
  title: string
  description_md: string
  category: string
  kind: string
  price_cents: number
  vat_mode: string
  stripe_price_id: string | null
  docuseal_template_id: string | null
  storage_path: string | null
  delivery_mode: string
  eidas_level: string
  is_active: boolean
  display_order: number
}

const CATEGORIES = ['rgpd', 'arrendamiento', 'civil', 'mercantil', 'pack', 'reclamacion', 'review']
const KINDS = ['template', 'review', 'pack']
const DELIVERY_MODES = ['docuseal_fill_and_sign', 'docuseal_fill_only', 'download_after_payment', 'human_review']
const EIDAS_LEVELS = ['SES', 'AES']
const VAT_MODES = ['included', 'excluded']

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return <Button type="submit" disabled={pending}>{pending ? 'Guardando…' : label}</Button>
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null
  return <p className="text-xs text-red-600 mt-1">{errors.join(' · ')}</p>
}

export function ProductForm({ product }: { product?: Product }) {
  const mode = product ? 'edit' : 'new'
  const initial: ProductFormState = { ok: false }
  const [state, formAction] = useActionState(
    mode === 'edit' ? updateProduct : createProduct,
    initial,
  )

  useEffect(() => {
    if (state.ok && state.message) toast.success(state.message)
    else if (!state.ok && state.message && !state.fieldErrors) toast.error(state.message)
    else if (state.fieldErrors) toast.error('Revisa los errores del formulario')
  }, [state])

  const p = product

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" name="sku" required defaultValue={p?.sku} readOnly={mode === 'edit'}
            className={mode === 'edit' ? 'bg-muted font-mono' : 'font-mono'} />
          <FieldError errors={state.fieldErrors?.sku} />
        </div>
        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" required defaultValue={p?.slug} />
          <FieldError errors={state.fieldErrors?.slug} />
        </div>
      </div>

      <div>
        <Label htmlFor="title">Título</Label>
        <Input id="title" name="title" required defaultValue={p?.title} />
        <FieldError errors={state.fieldErrors?.title} />
      </div>

      <div>
        <Label htmlFor="description_md">Descripción (markdown)</Label>
        <Textarea id="description_md" name="description_md" required rows={5} defaultValue={p?.description_md} />
        <FieldError errors={state.fieldErrors?.description_md} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="category">Categoría</Label>
          <select id="category" name="category" required defaultValue={p?.category ?? 'rgpd'}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <Label htmlFor="kind">Kind</Label>
          <select id="kind" name="kind" required defaultValue={p?.kind ?? 'template'}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
            {KINDS.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <div>
          <Label htmlFor="delivery_mode">Delivery mode</Label>
          <select id="delivery_mode" name="delivery_mode" required defaultValue={p?.delivery_mode ?? 'docuseal_fill_and_sign'}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
            {DELIVERY_MODES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="price_cents">Precio (céntimos)</Label>
          <Input id="price_cents" name="price_cents" type="number" min="0" required defaultValue={p?.price_cents ?? 0} />
          <FieldError errors={state.fieldErrors?.price_cents} />
        </div>
        <div>
          <Label htmlFor="vat_mode">IVA</Label>
          <select id="vat_mode" name="vat_mode" required defaultValue={p?.vat_mode ?? 'included'}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
            {VAT_MODES.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <Label htmlFor="eidas_level">eIDAS</Label>
          <select id="eidas_level" name="eidas_level" required defaultValue={p?.eidas_level ?? 'SES'}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
            {EIDAS_LEVELS.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="stripe_price_id">Stripe price_id</Label>
          <Input id="stripe_price_id" name="stripe_price_id" placeholder="price_…" defaultValue={p?.stripe_price_id ?? ''} />
          <FieldError errors={state.fieldErrors?.stripe_price_id} />
        </div>
        <div>
          <Label htmlFor="docuseal_template_id">DocuSeal template_id</Label>
          <Input id="docuseal_template_id" name="docuseal_template_id" defaultValue={p?.docuseal_template_id ?? ''} />
          <FieldError errors={state.fieldErrors?.docuseal_template_id} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="storage_path">Storage path (Supabase)</Label>
          <Input id="storage_path" name="storage_path" placeholder="templates/rgpd-registro-actividades.docx"
            defaultValue={p?.storage_path ?? ''} />
          <FieldError errors={state.fieldErrors?.storage_path} />
        </div>
        <div>
          <Label htmlFor="display_order">Orden visual</Label>
          <Input id="display_order" name="display_order" type="number" min="0" required defaultValue={p?.display_order ?? 0} />
          <FieldError errors={state.fieldErrors?.display_order} />
        </div>
      </div>

      <label className="flex items-center gap-3 text-sm">
        <Checkbox name="is_active" defaultChecked={p?.is_active ?? false} />
        <span>Activo (visible en tienda)</span>
      </label>

      <div className="flex gap-3 pt-4 border-t border-border">
        <SubmitButton label={mode === 'edit' ? 'Guardar cambios' : 'Crear producto'} />
      </div>
    </form>
  )
}
