'use client'

import { useTransition, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, Trash2 } from 'lucide-react'
import { updateProfile, requestAccountDeletion } from './actions'

interface ConfiguracionFormProps {
  userId: string
  email: string
  initialData: {
    full_name: string
    company_name: string
    phone: string
  }
}

export function ConfiguracionForm({ email, initialData }: ConfiguracionFormProps) {
  const [isPending, startTransition] = useTransition()
  const [isDeletionPending, startDeletionTransition] = useTransition()
  const [showDeletionConfirm, setShowDeletionConfirm] = useState(false)

  function handleProfileSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    startTransition(async () => {
      const result = await updateProfile(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Perfil actualizado correctamente')
      }
    })
  }

  function handleDeletionRequest() {
    startDeletionTransition(async () => {
      const result = await requestAccountDeletion()
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Solicitud enviada. Nos pondremos en contacto contigo en un plazo de 30 días.')
        setShowDeletionConfirm(false)
      }
    })
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Perfil */}
      <Card>
        <CardHeader>
          <CardTitle>Datos del perfil</CardTitle>
          <CardDescription>Actualiza tu información de contacto y empresa.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">El email no se puede cambiar desde aquí.</p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="full_name">Nombre completo</Label>
              <Input
                id="full_name"
                name="full_name"
                defaultValue={initialData.full_name}
                placeholder="Tu nombre completo"
                className="h-10"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="company_name">Empresa</Label>
              <Input
                id="company_name"
                name="company_name"
                defaultValue={initialData.company_name}
                placeholder="Nombre de tu empresa (opcional)"
                className="h-10"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={initialData.phone}
                placeholder="+34 600 000 000"
                className="h-10"
              />
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <><Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" /> Guardando...</>
              ) : (
                'Guardar cambios'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Zona de peligro — RGPD Art. 17 */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Zona de peligro</CardTitle>
          <CardDescription>Acciones irreversibles relacionadas con tu cuenta.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              Puedes solicitar la eliminación permanente de tu cuenta y todos tus datos personales
              de acuerdo con el Art. 17 del RGPD. Esta acción requiere verificación manual y se
              procesará en un plazo máximo de 30 días.
            </p>
            {!showDeletionConfirm ? (
              <Button
                variant="outline"
                size="sm"
                className="border-destructive/30 text-destructive hover:bg-destructive/10"
                onClick={() => setShowDeletionConfirm(true)}
              >
                <Trash2 className="mr-2 size-4" aria-hidden="true" />
                Solicitar eliminación de cuenta
              </Button>
            ) : (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 flex flex-col gap-3">
                <p className="text-sm font-medium text-destructive">
                  ¿Confirmas que deseas solicitar la eliminación de tu cuenta?
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleDeletionRequest}
                    disabled={isDeletionPending}
                  >
                    {isDeletionPending ? (
                      <><Loader2 className="mr-2 size-3 animate-spin" aria-hidden="true" /> Enviando...</>
                    ) : (
                      'Sí, solicitar eliminación'
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowDeletionConfirm(false)}
                    disabled={isDeletionPending}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
