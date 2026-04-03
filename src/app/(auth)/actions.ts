'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma/client'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'El email y la contraseña son obligatorios' }
  }

  const supabase = await createClient()

  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // Audit log — failed login attempt (no user_id available on failure)
    console.warn(JSON.stringify({
      event: 'auth.login_failed',
      email,
      reason: error.message,
      ts: new Date().toISOString(),
    }))
    return { error: error.message }
  }

  // Audit log — successful login
  if (data.user) {
    try {
      await prisma.audit_log.create({
        data: {
          event: 'auth.login',
          user_id: data.user.id,
          metadata: { email: data.user.email },
        },
      })
    } catch {
      // Non-blocking — login still succeeds if audit log fails
    }
  }

  revalidatePath('/', 'layout')
  redirect('/portal')
}

export async function register(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string | undefined

  if (!email || !password) {
    return { error: 'El email y la contraseña son obligatorios' }
  }

  const supabase = await createClient()

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Si requiere confirmación por email, redirigimos a una página de aviso
  if (data.user?.identities?.length === 0) {
    return { error: 'El email ya está registrado' }
  }

  revalidatePath('/', 'layout')
  redirect('/portal')
}

export async function logout() {
  const supabase = await createClient()

  // Get current user before signing out for audit log
  const { data: { user } } = await supabase.auth.getUser()

  await supabase.auth.signOut()

  // Audit log — logout
  if (user) {
    try {
      await prisma.audit_log.create({
        data: {
          event: 'auth.logout',
          user_id: user.id,
          metadata: { email: user.email },
        },
      })
    } catch {
      // Non-blocking
    }
  }

  revalidatePath('/', 'layout')
  redirect('/login')
}
