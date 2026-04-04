'use client'

import { useTransition, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export function RecuperarPasswordForm() {
  const [isPending, startTransition] = useTransition()
  const [sent, setSent] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)
    const formData = new FormData(event.currentTarget)
    const email = formData.get('email')?.toString().trim()

    if (!email) return

    startTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/recuperar-password/confirmar`,
      })

      if (error) {
        setFormError('No se pudo enviar el email. Inténtalo de nuevo.')
        toast.error('No se pudo enviar el email. Inténtalo de nuevo.')
      } else {
        setSent(true)
      }
    })
  }

  if (sent) {
    return (
      <div className="w-full max-w-md flex flex-col gap-6 rounded-2xl bg-card p-8 shadow-xl ring-1 ring-border text-center">
        <div className="flex justify-center">
          <CheckCircle2 className="size-12 text-emerald-500" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Revisa tu email</h1>
          <p className="text-sm text-muted-foreground">
            Si el email está registrado, recibirás un enlace para restablecer tu contraseña en los próximos minutos.
          </p>
        </div>
        <Link href="/login" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
          Volver al inicio de sesión
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md flex flex-col gap-8 rounded-2xl bg-card p-8 shadow-xl ring-1 ring-border">
      <div className="flex flex-col gap-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Recuperar contraseña</h1>
        <p className="text-sm text-muted-foreground">
          Introduce tu email y te enviaremos un enlace para restablecer tu contraseña.
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

        <Button
          type="submit"
          className="h-11 w-full text-base font-semibold"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 size-5 animate-spin" aria-hidden="true" /> Enviando...
            </>
          ) : (
            'Enviar enlace de recuperación'
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
          Volver al inicio de sesión
        </Link>
      </p>
    </div>
  )
}
