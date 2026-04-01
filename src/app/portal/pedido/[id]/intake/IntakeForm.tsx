'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { submitIntake } from '../../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Loader2, ArrowRight } from 'lucide-react'

export function IntakeForm({ orderId, productName }: { orderId: string, productName: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    startTransition(async () => {
      const result = await submitIntake(orderId, formData)
      
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Formulario completado correctamente. Estamos procesando tu pedido.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <div className="space-y-2 border-b border-slate-100 pb-6">
        <h2 className="text-xl font-semibold text-slate-900">Datos para: {productName}</h2>
        <p className="text-sm text-slate-500">
          Por favor, proporciona la siguiente información para que nuestros abogados y sistemas de IA comiencen a trabajar en tu documento.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="titular" className="text-sm font-medium">Nombre o Razón Social del titular</Label>
          <Input 
            id="titular" 
            name="titular" 
            required 
            placeholder="Ej. Empresa Ficticia S.L. o Juan Pérez"
            className="h-11"
            disabled={isPending}
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="actividad" className="text-sm font-medium">Actividad principal</Label>
          <Input 
            id="actividad" 
            name="actividad" 
            required 
            placeholder="Ej. Venta online de ropa, Agencia de marketing..."
            className="h-11"
            disabled={isPending}
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="detalles" className="text-sm font-medium">Detalles específicos o información adicional</Label>
          <Textarea 
            id="detalles" 
            name="detalles" 
            required 
            placeholder="Describe cualquier particularidad, servicio extra, o contexto que debamos saber."
            className="min-h-[120px] resize-y"
            disabled={isPending}
          />
          <p className="text-xs text-slate-500">
            Cuanta más información nos des, más preciso será el documento final.
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100">
        <Button 
          type="submit" 
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
            </>
          ) : (
            <>
              Enviar información <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
