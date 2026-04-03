'use client'

import { useTransition } from 'react'
import { opsUpdateOrderStatus, opsUploadDocument } from '../../actions'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export function ChangeStatusForm({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
  const [isPending, startTransition] = useTransition()

  const handleStatusChange = (newStatus: string) => {
    startTransition(async () => {
      const formData = new FormData()
      formData.append('status', newStatus)
      const res = await opsUpdateOrderStatus(orderId, formData)
      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success('Estado actualizado correctamente')
      }
    })
  }

  const statuses = ['intake_pending', 'processing', 'draft_ready', 'completed']

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {statuses.map(s => (
        <Button 
          key={s}
          variant={currentStatus === s ? 'default' : 'outline'}
          size="sm"
          disabled={isPending || currentStatus === s}
          onClick={() => handleStatusChange(s)}
        >
          {isPending && currentStatus !== s ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {s}
        </Button>
      ))}
    </div>
  )
}

export function UploadDocumentForm({ orderId, type }: { orderId: string, type: 'draft' | 'signed' }) {
  const [isPending, startTransition] = useTransition()

  const handleUpload = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await opsUploadDocument(orderId, type, formData)
      if (res?.error) toast.error(res.error)
      else toast.success('Documento subido con éxito')
    })
  }

  const uploadLabel = type === 'draft' ? 'Subir Borrador (.pdf)' : 'Subir Documento Final (.pdf)'

  return (
    <form onSubmit={handleUpload} className="flex flex-col gap-4">
      <input
        type="file"
        name="file"
        accept="application/pdf"
        required
        disabled={isPending}
        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      <Button type="submit" disabled={isPending} className="w-fit">
        {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Subiendo...</> : uploadLabel}
      </Button>
    </form>
  )
}
