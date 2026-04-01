import { Metadata } from 'next'
import { RegisterForm } from './RegisterForm'

export const metadata: Metadata = {
  title: 'Crear cuenta',
  description: 'Regístrate en Afiladocs, tu plataforma legaltech de confianza.',
}

export default function RegisterPage() {
  return (
    <div className="flex w-full flex-col items-center justify-center p-4 sm:p-8">
      <RegisterForm />
    </div>
  )
}
