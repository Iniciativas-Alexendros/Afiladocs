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
    <div className="space-y-6 max-w-2xl">
      {/* Perfil */}
      <Card>
        <CardHeader>
          <CardTitle>Datos del perfil</CardTitle>
          <CardDescription>Actualiza tu información de contacto y empresa.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} disabled className="bg-slate-50" />
              <p className="text-xs text-slate-500">El email no se puede cambiar desde aquí.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="full_name">Nombre completo</Label>
              <Input
                id="full_name"
                name="full_name"
                defaultValue={initialData.full_name}
                placeholder="Tu nombre completo"
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_name">Empresa</Label>
              <Input
                id="company_name"
                name="company_name"
                defaultValue={initialData.company_name}
                placeholder="Nombre de tu empresa (opcional)"
                className="h-10"
              />
            </div>
            <div className="space-y-2">
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
            <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700">
              {isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
              ) : (
                'Guardar cambios'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Zona de peligro — RGPD Art. 17 */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-700">Zona de peligro</CardTitle>
          <CardDescription>Acciones irreversibles relacionadas con tu cuenta.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-slate-600 mb-3">
              Puedes solicitar la eliminación permanente de tu cuenta y todos tus datos personales
              de acuerdo con el Art. 17 del RGPD. Esta acción requiere verificación manual y se
              procesará en un plazo máximo de 30 días.
            </p>
            {!showDeletionConfirm ? (
              <Button
                variant="outline"
                size="sm"
                className="border-red-300 text-red-700 hover:bg-red-50"
                onClick={() => setShowDeletionConfirm(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Solicitar eliminación de cuenta
              </Button>
            ) : (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-3">
                <p className="text-sm font-medium text-red-800">
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
                      <><Loader2 className="mr-2 h-3 w-3 animate-spin" /> Enviando...</>
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
