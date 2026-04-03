import { Metadata } from 'next'
import { RecuperarPasswordForm } from './RecuperarPasswordForm'

export const metadata: Metadata = {
  title: 'Recuperar contraseña | Afiladocs',
  description: 'Recupera el acceso a tu cuenta de Afiladocs.',
}

export default function RecuperarPasswordPage() {
  return (
    <div className="flex w-full flex-col items-center justify-center p-4 sm:p-8">
      <RecuperarPasswordForm />
    </div>
  )
}
