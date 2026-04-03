import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { ConfiguracionForm } from './ConfiguracionForm'

export const metadata = {
  title: 'Configuración | Afiladocs',
}

export default async function ConfiguracionPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, company_name, phone')
    .eq('id', user.id)
    .single()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Configuración</h1>
        <p className="text-slate-500 mt-2">Gestiona tu perfil y preferencias de cuenta.</p>
      </div>

      <ConfiguracionForm
        userId={user.id}
        initialData={{
          full_name: profile?.full_name ?? '',
          company_name: profile?.company_name ?? '',
          phone: profile?.phone ?? '',
        }}
        email={user.email ?? ''}
      />
    </div>
  )
}
