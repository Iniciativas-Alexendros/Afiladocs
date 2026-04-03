'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function ConfirmarPasswordForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const formData = new FormData(event.currentTarget)
    const password = formData.get('password')?.toString()
    const confirm = formData.get('confirm')?.toString()

    if (!password || password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    if (password !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }

    startTransition(async () => {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({ password })

      if (updateError) {
        setError('No se pudo actualizar la contraseña. El enlace puede haber expirado.')
        toast.error('Error al actualizar la contraseña')
      } else {
        toast.success('Contraseña actualizada correctamente')
        router.push('/portal')
      }
    })
  }

  return (
    <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl ring-1 ring-gray-900/5">
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Nueva contraseña</h1>
        <p className="text-sm text-gray-500">
          Introduce tu nueva contraseña para completar la recuperación de acceso.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nueva contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="Mínimo 8 caracteres"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirmar contraseña</Label>
            <Input
              id="confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className="h-11"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">{error}</p>
        )}

        <Button
          type="submit"
          className="h-11 w-full bg-blue-600 text-base font-semibold hover:bg-blue-700"
          disabled={isPending}
        >
          {isPending ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Actualizando...</>
          ) : (
            'Actualizar contraseña'
          )}
        </Button>
      </form>
    </div>
  )
}
