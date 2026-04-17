'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'
import {
  loadSupabaseBrowserClient,
  type SupabaseBrowserClient,
} from '@/lib/supabase/lazy-client'

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
  useEffect(() => {
    let supabase: SupabaseBrowserClient | null = null
    let channel: ReturnType<SupabaseBrowserClient['channel']> | null = null
    let cancelled = false

    async function subscribe() {
      const client = await loadSupabaseBrowserClient()
      if (cancelled) return
      supabase = client
      channel = client
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
    }

    subscribe().catch((err) => {
      console.error(JSON.stringify({
        event: 'portal.realtime.subscribe_failed',
        message: err instanceof Error ? err.message : 'Unknown',
        ts: new Date().toISOString(),
      }))
    })

    return () => {
      cancelled = true
      if (supabase && channel) supabase.removeChannel(channel)
    }
  }, [userId])

  return null
}
