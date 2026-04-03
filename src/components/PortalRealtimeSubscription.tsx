'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

const STATUS_LABELS: Record<string, string> = {
  intake_pending: 'Pendiente de datos',
  in_progress: 'En elaboración',
  review: 'En revisión',
  signature_pending: 'Pendiente de firma',
  final: 'Documento listo',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

interface Props {
  userId: string
}

export function PortalRealtimeSubscription({ userId }: Props) {
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`portal-orders-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newStatus = (payload.new as { status?: string })?.status
          if (!newStatus) return
          const label = STATUS_LABELS[newStatus] ?? newStatus
          toast.info(`Estado actualizado: ${label}`, {
            description: 'Tu pedido ha cambiado de estado.',
          })
        },
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  return null
}
