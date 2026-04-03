import { ReactNode } from 'react'
import Link from 'next/link'

import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/(auth)/actions'
import {
  Home,
  FileText,
  ShieldCheck,
  Settings,
  Building2,
  LogOut,
  Menu
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const user = await requireAuth()
  const supabase = await createClient()

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, company_name, role')
    .eq('id', user.id)
    .single()

  const displayName = profile?.full_name || profile?.company_name || user.email?.split('@')[0]

  const navItems = [
    { name: 'Dashboard', href: '/portal', icon: Home },
    { name: 'Mis Pedidos', href: '/portal/pedidos', icon: FileText },
    { name: 'Suscripciones', href: '/portal/suscripciones', icon: ShieldCheck },
    { name: 'Configuración', href: '/portal/configuracion', icon: Settings },
  ]

  // If user is admin/ops, show link to ops panel
  const isOps = profile?.role === 'admin' || profile?.role === 'ops'

  const NavLinks = () => (
    <>
      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600"
            >
              <Icon className="mr-3 h-5 w-5 flex-shrink-0 text-slate-400 group-hover:text-blue-600" aria-hidden="true" />
              <span className="truncate">{item.name}</span>
            </Link>
          )
        })}
        {isOps && (
          <Link
            href="/ops"
            className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 hover:text-amber-800 mt-4 border border-amber-200"
          >
            <Building2 className="mr-3 h-5 w-5 flex-shrink-0 text-amber-500 group-hover:text-amber-600" />
            <span className="truncate">Panel de Operaciones</span>
          </Link>
        )}
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile nav */}
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="-m-2.5 p-2.5 text-slate-700 lg:hidden">
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-white flex flex-col pt-5 pb-4">
            <div className="flex shrink-0 items-center px-4 mb-6">
              <span className="text-xl font-bold text-slate-900 tracking-tight">Afiladocs<span className="text-blue-600">Portal</span></span>
            </div>
            <div className="mt-5 h-0 flex-1 overflow-y-auto px-2">
              <nav className="flex flex-1 flex-col">
                <NavLinks />
              </nav>
            </div>
            <div className="flex shrink-0 border-t border-slate-200 p-4">
              <form action={logout} className="w-full">
                <Button variant="ghost" className="w-full justify-start text-slate-700 hover:text-red-600 hover:bg-red-50">
                  <LogOut className="mr-3 h-5 w-5 text-slate-400" />
                  Cerrar sesión
                </Button>
              </form>
            </div>
          </SheetContent>
        </Sheet>
        
        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          <div className="flex flex-1"></div>
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            <span className="text-sm font-medium text-slate-700">{displayName}</span>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-slate-200 bg-white px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <span className="text-xl font-bold text-slate-900 tracking-tight">Afiladocs<span className="text-blue-600">Portal</span></span>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <NavLinks />
              </li>
              <li className="mt-auto">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-x-4 px-3 py-3 text-sm font-semibold leading-6 text-slate-900 rounded-lg bg-slate-50">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                      {displayName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="sr-only">Your profile</span>
                    <span aria-hidden="true" className="truncate">{displayName}</span>
                  </div>
                  <form action={logout}>
                    <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-red-600 hover:bg-red-50">
                      <LogOut className="mr-3 h-5 w-5" />
                      Cerrar sesión
                    </Button>
                  </form>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <main className="lg:pl-72">
        <div className="px-4 py-10 sm:px-6 lg:px-8 lg:py-12 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
