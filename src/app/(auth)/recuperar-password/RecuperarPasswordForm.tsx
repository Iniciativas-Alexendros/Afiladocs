'use client'

import { useTransition, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export function RecuperarPasswordForm() {
  const [isPending, startTransition] = useTransition()
  const [sent, setSent] = useState(false)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = formData.get('email')?.toString().trim()

    if (!email) return

    startTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/recuperar-password/confirmar`,
      })

      if (error) {
        toast.error('No se pudo enviar el email. Inténtalo de nuevo.')
      } else {
        setSent(true)
      }
    })
  }

  if (sent) {
    return (
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-xl ring-1 ring-gray-900/5 text-center">
        <div className="flex justify-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Revisa tu email</h1>
          <p className="text-sm text-gray-500">
            Si el email está registrado, recibirás un enlace para restablecer tu contraseña en los próximos minutos.
          </p>
        </div>
        <Link href="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500">
          Volver al inicio de sesión
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl ring-1 ring-gray-900/5">
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Recuperar contraseña</h1>
        <p className="text-sm text-gray-500">
          Introduce tu email y te enviaremos un enlace para restablecer tu contraseña.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="tu@email.com"
            className="h-11"
          />
        </div>

        <Button
          type="submit"
          className="h-11 w-full bg-blue-600 text-base font-semibold hover:bg-blue-700"
          disabled={isPending}
        >
          {isPending ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Enviando...</>
          ) : (
            'Enviar enlace de recuperación'
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-600">
        <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500">
          Volver al inicio de sesión
        </Link>
      </p>
    </div>
  )
}
