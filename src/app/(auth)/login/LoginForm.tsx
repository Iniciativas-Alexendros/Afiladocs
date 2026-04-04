'use client'

import { useTransition, useState } from 'react'
import Link from 'next/link'
import { login } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { AlertCircle, Loader2 } from 'lucide-react'

export function LoginForm() {
  const [isPending, startTransition] = useTransition()
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)
    const formData = new FormData(event.currentTarget)

    startTransition(async () => {
      const result = await login(formData)
      if (result?.error) {
        setFormError(result.error)
        toast.error(result.error)
      } else {
        toast.success('Inicio de sesión exitoso')
      }
    })
  }

  return (
    <div className="w-full max-w-md flex flex-col gap-8 rounded-2xl bg-card p-8 shadow-xl ring-1 ring-border">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Bienvenido de nuevo</h1>
        <p className="text-sm text-muted-foreground">
          Entra a tu portal para gestionar tus documentos y servicios.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6"
        aria-describedby={formError ? 'form-error' : undefined}
      >
        {formError && (
          <div
            id="form-error"
            role="alert"
            aria-live="assertive"
            className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
            {formError}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
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
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Contraseña</Label>
              <Link
                href="/recuperar-password"
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
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
          className="h-11 w-full text-base font-semibold"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 size-5 animate-spin" aria-hidden="true" /> Entrando...
            </>
          ) : (
            'Entrar al portal'
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        ¿Aún no tienes cuenta?{' '}
        <Link href="/registro" className="font-semibold text-primary hover:text-primary/80 transition-colors">
          Crea tu cuenta gratis
        </Link>
      </p>
    </div>
  )
}
