import { Metadata } from 'next'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = {
  title: 'Iniciar sesión',
  description: 'Inicia sesión en tu cuenta de Afiladocs.',
}

export default function LoginPage() {
  return (
    <div className="flex w-full flex-col items-center justify-center p-4 sm:p-8">
      <LoginForm />
    </div>
  )
}
