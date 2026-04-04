'use client'

import { useTransition, useState } from 'react'
import Link from 'next/link'
import { register } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/password-input'
import { PasswordStrength } from '@/components/ui/password-strength'
import { toast } from 'sonner'
import { Loader2, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react'

export function RegisterForm() {
  const [isPending, startTransition] = useTransition()
  const [formError, setFormError] = useState<string | null>(null)
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [registered, setRegistered] = useState(false)
  const [emailUsed, setEmailUsed] = useState('')

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)
    setConfirmError(null)
    const formData = new FormData(event.currentTarget)
    const pwd = formData.get('password') as string
    const confirm = formData.get('confirmPassword') as string

    if (pwd !== confirm) {
      setConfirmError('Las contraseñas no coinciden')
      return
    }

    startTransition(async () => {
      const result = await register(formData)
      if (result?.error) {
        setFormError(result.error)
        toast.error(result.error)
      } else {
        setEmailUsed(formData.get('email') as string)
        setRegistered(true)
        toast.success('Cuenta creada con éxito')
      }
    })
  }

  if (registered) {
    return (
      <div className="w-full max-w-md flex flex-col gap-6 rounded-2xl bg-card p-8 shadow-xl ring-1 ring-border text-center">
        <CheckCircle2 className="mx-auto size-12 text-emerald-500" />
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">¡Cuenta creada!</h1>
          <p className="text-sm text-muted-foreground">
            Hemos enviado un email a <strong>{emailUsed}</strong>. Confirma tu cuenta para acceder.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/login">Ir al inicio de sesión</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md flex flex-col gap-8 rounded-2xl bg-card p-8 shadow-xl ring-1 ring-border">
      <div className="flex flex-col gap-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Empieza con Afiladocs</h1>
        <p className="text-sm text-muted-foreground">
          Únete a la plataforma legaltech diseñada para profesionales y empresas exigentes.
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
            <Label htmlFor="fullName">Nombre completo (o Empresa)</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              required
              placeholder="María García"
              className="h-11"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email profesional</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="tu@empresa.com"
              className="h-11"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Contraseña segura</Label>
            <PasswordInput
              id="password"
              name="password"
              required
              minLength={8}
              className="h-11"
              autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <PasswordStrength password={password} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              required
              minLength={8}
              className="h-11"
              autoComplete="new-password"
              aria-describedby={confirmError ? 'confirm-error' : undefined}
            />
            {confirmError && (
              <p id="confirm-error" role="alert" className="text-sm text-destructive">
                {confirmError}
              </p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          className="group h-11 w-full text-base font-semibold"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 size-5 animate-spin" aria-hidden="true" /> Creando cuenta...
            </>
          ) : (
            <span className="flex items-center">
              Crear cuenta gratis
              <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
            </span>
          )}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        ¿Ya tienes una cuenta?{' '}
        <Link href="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
          Inicia sesión aquí
        </Link>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Al registrarte, aceptas nuestros{' '}
        <Link href="/legal/condiciones-generales" className="underline hover:text-foreground">
          Términos
        </Link>{' '}
        y la{' '}
        <Link href="/legal/privacidad" className="underline hover:text-foreground">
          Política de Privacidad
        </Link>.
      </p>
    </div>
  )
}
