'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { archiveAlert, dismissAlert, markAlertReviewed } from './actions'

interface Props {
  alertId: string
  status: string
}

type ActionResult = { success?: boolean; error?: string }

export function AlertRowActions({ alertId, status }: Props) {
  const [pending, startTransition] = useTransition()

  if (status === 'archived' || status === 'dismissed') {
    return null
  }

  const run = (fn: (id: string) => Promise<ActionResult>) => {
    startTransition(async () => {
      try {
        const res = await fn(alertId)
        if (res?.error) {
          toast.error(res.error)
          return
        }
        toast.success('Alerta actualizada')
      } catch {
        toast.error('No se pudo actualizar')
      }
    })
  }

  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      {status === 'pending_review' && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={pending}
          className="text-xs"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            run(markAlertReviewed)
          }}
        >
          Marcar revisada
        </Button>
      )}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={pending}
        className="text-xs"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          run(archiveAlert)
        }}
      >
        Archivar
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={pending}
        className="text-xs"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          run(dismissAlert)
        }}
      >
        Descartar
      </Button>
    </div>
  )
}
