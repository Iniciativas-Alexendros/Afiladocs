'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { ExternalLink, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createBillingPortalSession } from './actions'

interface BillingPortalButtonProps {
  subscriptionId: string
}

export function BillingPortalButton({ subscriptionId }: BillingPortalButtonProps) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      const result = await createBillingPortalSession(subscriptionId)
      if (result.error) {
        toast.error(result.error)
      } else if (result.url) {
        window.location.href = result.url
      }
    })
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={isPending}>
      {isPending ? (
        <><Loader2 className="mr-2 h-3 w-3 animate-spin" /> Cargando...</>
      ) : (
        <><ExternalLink className="mr-2 h-3 w-3" /> Gestionar suscripción</>
      )}
    </Button>
  )
}
