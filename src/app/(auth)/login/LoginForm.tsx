'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { login } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export function LoginForm() {
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    startTransition(async () => {
      const result = await login(formData)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Inicio de sesión exitoso')
        // El action se encarga de revalidar y redirigir, pero si queremos hacer algo extra
      }
    })
  }

  return (
    <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl ring-1 ring-gray-900/5">
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Bienvenido de nuevo</h1>
        <p className="text-sm text-gray-500">
          Entra a tu portal para gestionar tus documentos y servicios.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
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
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Contraseña</Label>
              <Link
                href="/recuperar-password"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="h-11"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="h-11 w-full bg-blue-600 text-base font-semibold transition-all hover:bg-blue-700 hover:shadow-md"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Entrando...
            </>
          ) : (
            'Entrar al portal'
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-600">
        ¿Aún no tienes cuenta?{' '}
        <Link href="/registro" className="font-semibold text-blue-600 hover:text-blue-500">
          Crea tu cuenta gratis
        </Link>
      </p>
    </div>
  )
}
