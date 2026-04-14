'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, ShoppingCart } from 'lucide-react'

export function BuyButton({ sku, label = 'Comprar ahora' }: { sku: string; label?: string }) {
  const [pending, setPending] = useState(false)

  async function onClick() {
    setPending(true)
    try {
      const origin = window.location.origin
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ variantId: sku, quantity: 1 }],
          successUrl: `${origin}/pago-exitoso?sku=${sku}`,
          cancelUrl: `${origin}/producto/${sku}`,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) {
        toast.error(data.error ?? 'No se pudo iniciar el pago')
        setPending(false)
        return
      }
      window.location.href = data.url
    } catch {
      toast.error('Error de red')
      setPending(false)
    }
  }

  return (
    <Button onClick={onClick} disabled={pending} size="lg" className="w-full sm:w-auto">
      {pending ? <Loader2 className="size-4 mr-2 animate-spin" /> : <ShoppingCart className="size-4 mr-2" />}
      {label}
    </Button>
  )
}
