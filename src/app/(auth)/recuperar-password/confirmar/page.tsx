import { Metadata } from 'next'
import { ConfirmarPasswordForm } from './ConfirmarPasswordForm'

export const metadata: Metadata = {
  title: 'Nueva contraseña | Afiladocs',
}

export default function ConfirmarPasswordPage() {
  return (
    <div className="flex w-full flex-col items-center justify-center p-4 sm:p-8">
      <ConfirmarPasswordForm />
    </div>
  )
}
