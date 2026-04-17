'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadSupabaseBrowserClient } from '@/lib/supabase/lazy-client'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/password-input'
import { PasswordStrength } from '@/components/ui/password-strength'
import { Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export function ConfirmarPasswordForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [formError, setFormError] = useState<string | null>(null)
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const [password, setPassword] = useState('')

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)
    setConfirmError(null)
    const formData = new FormData(event.currentTarget)
    const pwd = formData.get('password')?.toString()
    const confirm = formData.get('confirm')?.toString()

    if (!pwd || pwd.length < 8) {
      setFormError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    if (pwd !== confirm) {
      setConfirmError('Las contraseñas no coinciden')
      return
    }

    startTransition(async () => {
      const supabase = await loadSupabaseBrowserClient()
      const { error: updateError } = await supabase.auth.updateUser({ password: pwd })

      if (updateError) {
        setFormError('No se pudo actualizar la contraseña. El enlace puede haber expirado.')
        toast.error('Error al actualizar la contraseña')
      } else {
        toast.success('Contraseña actualizada correctamente')
        router.push('/portal')
      }
    })
  }

  return (
    <div className="w-full max-w-md flex flex-col gap-8 rounded-2xl bg-card p-8 shadow-xl ring-1 ring-border">
      <div className="flex flex-col gap-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Nueva contraseña</h1>
        <p className="text-sm text-muted-foreground">
          Introduce tu nueva contraseña para completar la recuperación de acceso.
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
            <Label htmlFor="password">Nueva contraseña</Label>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="Mínimo 8 caracteres"
              className="h-11"
              onChange={(e) => setPassword(e.target.value)}
            />
            <PasswordStrength password={password} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="confirm">Confirmar contraseña</Label>
            <PasswordInput
              id="confirm"
              name="confirm"
              autoComplete="new-password"
              required
              minLength={8}
              className="h-11"
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
          className="h-11 w-full text-base font-semibold"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 size-5 animate-spin" aria-hidden="true" /> Actualizando...
            </>
          ) : (
            'Actualizar contraseña'
          )}
        </Button>
      </form>
    </div>
  )
}
