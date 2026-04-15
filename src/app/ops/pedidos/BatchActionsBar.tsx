'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  batchMarkProcessing,
  batchSendIntakeReminder,
  batchAddInternalNote,
} from './actions'

interface Props {
  selectedIds: string[]
  onComplete: () => void
}

export function BatchActionsBar({ selectedIds, onComplete }: Props) {
  const [pending, startTransition] = useTransition()
  const [note, setNote] = useState('')
  const count = selectedIds.length

  const run = (
    action: () => Promise<{ success?: true; error?: string; affected?: number }>,
    successLabel: string,
  ) => {
    startTransition(async () => {
      try {
        const res = await action()
        if (res.error) {
          toast.error(res.error)
          return
        }
        toast.success(`${successLabel} (${res.affected ?? count} pedidos)`)
        onComplete()
      } catch (err) {
        console.error(err)
        toast.error('No se pudo completar la acción')
      }
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/40 p-3">
      <span className="text-sm font-medium text-foreground">
        {count} pedido{count === 1 ? '' : 's'} seleccionado{count === 1 ? '' : 's'}
      </span>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="outline" disabled={pending}>
            Marcar como processing
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Marcar {count} pedidos como processing</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción registra una entrada en audit_log por cada pedido afectado. Solo cambia
              el estado de pedidos en `intake_pending` o `draft_ready`.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                run(
                  () => batchMarkProcessing(selectedIds),
                  'Pedidos marcados como processing',
                )
              }
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="outline" disabled={pending}>
            Enviar recordatorio intake
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enviar recordatorio a {count} clientes</AlertDialogTitle>
            <AlertDialogDescription>
              Envía un email recordando que completen el intake. Queda registrado en audit_log.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                run(
                  () => batchSendIntakeReminder(selectedIds),
                  'Recordatorios enviados',
                )
              }
            >
              Enviar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex items-center gap-2 ml-auto">
        <Input
          placeholder="Nota interna…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="h-9 w-56"
          disabled={pending}
        />
        <Button
          size="sm"
          variant="outline"
          disabled={pending || note.trim().length === 0}
          onClick={() =>
            run(() => {
              const body = note.trim()
              const action = batchAddInternalNote(selectedIds, body)
              setNote('')
              return action
            }, 'Nota añadida')
          }
        >
          Añadir nota
        </Button>
      </div>

      <Button
        size="sm"
        variant="ghost"
        disabled={pending}
        onClick={onComplete}
      >
        Limpiar selección
      </Button>
    </div>
  )
}
