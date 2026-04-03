'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { register } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, ArrowRight } from 'lucide-react'

export function RegisterForm() {
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const password = formData.get('password') as string
    const confirm = formData.get('confirmPassword') as string

    if (password !== confirm) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    startTransition(async () => {
      const result = await register(formData)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Cuenta creada con éxito')
        // Supabase SSR & server action will handle the redirection/revalidation
      }
    })
  }

  return (
    <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl ring-1 ring-gray-900/5">
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Empieza con Afiladocs</h1>
        <p className="text-sm text-gray-500">
          Únete a la plataforma legaltech diseñada para profesionales y empresas exigentes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
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
          
          <div className="space-y-2">
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
          
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña segura</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              className="h-11"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              className="h-11"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="group h-11 w-full bg-slate-900 text-base font-semibold hover:bg-slate-800"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Creando cuenta...
            </>
          ) : (
            <span className="flex items-center">
              Crear cuenta gratis
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          )}
        </Button>
      </form>

      <div className="text-center text-sm text-gray-600">
        ¿Ya tienes una cuenta?{' '}
        <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500 hover:underline">
          Inicia sesión aquí
        </Link>
      </div>
      
      <p className="text-center text-xs text-slate-400">
        Al registrarte, aceptas nuestros{' '}
        <Link href="/legal/condiciones-generales" className="underline hover:text-slate-600">
          Términos
        </Link>{' '}
        y la{' '}
        <Link href="/legal/privacidad" className="underline hover:text-slate-600">
          Política de Privacidad
        </Link>.
      </p>
    </div>
  )
}
