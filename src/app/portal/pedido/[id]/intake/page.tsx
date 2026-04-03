import { notFound, redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
import { IntakeForm } from './IntakeForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Completar Datos | Afiladocs',
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function IntakePage({ params }: PageProps) {
  const user = await requireAuth()
  const resolvedParams = await params
  const { id } = resolvedParams

  const order = await prisma.orders.findFirst({
    where: { 
      id: id,
      user_id: user.id 
    }
  })

  if (!order) {
    notFound()
  }

  if (order.status !== 'intake_pending') {
    // Already filled, redirect back to order detail
    redirect(`/portal/pedido/${order.id}`)
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href={`/portal/pedido/${order.id}`} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 mb-4 transition-colors">
          <ArrowLeft className="mr-1 h-4 w-4" /> Volver al pedido
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Formulario de Toma de Datos
        </h1>
      </div>

      <IntakeForm orderId={order.id} productName={order.product_id} />
    </div>
  )
}
