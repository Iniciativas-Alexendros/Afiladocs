import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
import Link from 'next/link'
import { ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BillingPortalButton } from './BillingPortalButton'

export const metadata = {
  title: 'Suscripciones | Afiladocs',
}

function getSubscriptionBadge(status: string) {
  switch (status) {
    case 'active':
      return <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">Activa</span>
    case 'canceled':
      return <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">Cancelada</span>
    case 'past_due':
      return <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">Pago pendiente</span>
    default:
      return <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">{status}</span>
  }
}

export default async function SuscripcionesPage() {
  const user = await requireAuth()

  const subscriptions = await prisma.subscriptions.findMany({
    where: { user_id: user.id },
    orderBy: { created_at: 'desc' },
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Suscripciones</h1>
        <p className="text-slate-500 mt-2">Gestiona tus planes de actualización continua.</p>
      </div>

      {subscriptions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <ShieldCheck className="h-6 w-6 text-slate-400" />
          </div>
          <h3 className="mt-4 font-semibold text-slate-900">Sin suscripciones activas</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
            Accede a actualizaciones normativas continuas con nuestros planes de suscripción.
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link href="/servicios">Ver planes</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((sub) => (
            <Card key={sub.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-slate-400" />
                  {sub.product_id ?? 'Suscripción'}
                </CardTitle>
                {getSubscriptionBadge(sub.status)}
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-slate-500">
                  Activa desde: <span className="font-medium text-slate-700">
                    {new Date(sub.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </p>
                {sub.status === 'active' && sub.stripe_subscription_id && (
                  <div className="flex items-center gap-2">
                    <BillingPortalButton subscriptionId={sub.stripe_subscription_id} />
                  </div>
                )}
                {sub.status === 'canceled' && (
                  <Button asChild variant="outline" size="sm">
                    <Link href="/servicios">
                      Renovar suscripción <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
