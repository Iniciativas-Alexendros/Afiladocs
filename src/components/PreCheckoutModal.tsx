'use client'

import { useState } from 'react'
import { ShoppingCart, Loader2, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DeliveryBadge } from '@/components/DeliveryBadge'
import { formatCurrency } from '@/lib/format'

interface PreCheckoutModalProps {
  sku: string
  title: string
  price_cents: number
  delivery_mode: string
  sla_label: string
}

export function PreCheckoutModal({
  sku,
  title,
  price_cents,
  delivery_mode,
  sla_label,
}: PreCheckoutModalProps) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)

  async function handleConfirm() {
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
      const data = await res.json() as { url?: string; error?: string }
      if (!res.ok || !data.url) {
        toast.error(data.error ?? 'No se pudo iniciar el pago')
        setPending(false)
        return
      }
      window.location.href = data.url
    } catch {
      toast.error('Error de red. Inténtalo de nuevo.')
      setPending(false)
    }
  }

  return (
    <>
      <Button size="lg" className="w-full sm:w-auto" onClick={() => setOpen(true)}>
        <ShoppingCart className="size-4 mr-2" />
        Comprar ahora
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirma tu pedido</DialogTitle>
            <DialogDescription>
              Revisa los detalles antes de ir al pago seguro con Stripe.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <p className="font-semibold text-foreground leading-snug">{title}</p>

            <div className="flex items-center gap-3">
              <DeliveryBadge mode={delivery_mode} />
              {sla_label && (
                <span className="text-sm text-muted-foreground">{sla_label}</span>
              )}
            </div>

            <p className="text-3xl font-bold text-primary">
              {formatCurrency(price_cents, 'eur')}
            </p>

            <div className="flex items-start gap-2 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              <ShieldCheck className="size-4 shrink-0 mt-0.5 text-primary" />
              <span>
                Pago procesado de forma segura por Stripe. Al confirmar aceptas los{' '}
                <a
                  href="/legal/terminos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-foreground"
                >
                  términos de uso
                </a>
                .
              </span>
            </div>
          </div>

          <DialogFooter showCloseButton={false}>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm} disabled={pending}>
              {pending && <Loader2 className="size-4 mr-2 animate-spin" />}
              Confirmar y pagar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
