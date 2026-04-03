import { ReactNode } from 'react'
import Link from 'next/link'
import { requireRole } from '@/lib/auth'
import { logout } from '@/app/(auth)/actions'
import { 
  BuildingIcon, 
  Home, 
  ShieldAlert, 
  LogOut,
  Users,
  Menu,
  Briefcase,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

export const metadata = {
  title: 'Operaciones | Afiladocs',
  robots: {
    index: false,
    follow: false
  }
}

export default async function OpsLayout({ children }: { children: ReactNode }) {
  // Enforce Ops or Admin access
  const { user, role } = await requireRole(['admin', 'ops'])

  const displayName = user.email?.split('@')[0]

  const navItems = [
    { name: 'Ops Dashboard', href: '/ops', icon: Home },
    { name: 'Gestión Pedidos', href: '/ops/pedidos', icon: FileText },
    { name: 'Gestión Clientes', href: '/ops/clientes', icon: Users },
    { name: 'Monitor Normativo', href: '/ops/monitor', icon: ShieldAlert },
  ]

  const NavLinks = () => (
    <>
      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Icon className="mr-3 h-5 w-5 flex-shrink-0 text-slate-400 group-hover:text-amber-500" aria-hidden="true" />
              <span className="truncate">{item.name}</span>
            </Link>
          )
        })}
        {/* Link back to client portal */}
        <div className="pt-6 mt-6 border-t border-slate-200">
          <Link
            href="/portal"
            className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors"
          >
            <Briefcase className="mr-3 h-5 w-5 flex-shrink-0 text-blue-500" />
            <span className="truncate">Volver a mi Portal</span>
          </Link>
        </div>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Mobile nav */}
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-300 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="-m-2.5 p-2.5 text-slate-700 lg:hidden">
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-white flex flex-col pt-5 pb-4">
            <div className="flex shrink-0 items-center px-4 mb-6">
              <div className="flex items-center gap-2">
                <BuildingIcon className="h-6 w-6 text-amber-600" />
                <span className="text-xl font-bold text-slate-900 tracking-tight">Afiladocs<span className="text-amber-600">Ops</span></span>
              </div>
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
             <span className="text-xs font-semibold px-2 py-1 bg-amber-100 text-amber-800 rounded-md ring-1 ring-inset ring-amber-600/20 mr-2 uppercase">
               {role}
             </span>
            <span className="text-sm font-medium text-slate-700">{displayName}</span>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        {/* Ops has darker styling to differentiate from Client Portal */}
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-slate-300 bg-slate-50 px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-200">
            <BuildingIcon className="h-6 w-6 text-amber-600" />
            <span className="text-xl font-bold text-slate-900 tracking-tight">Afiladocs<span className="text-amber-600">Ops</span></span>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7 pt-4">
              <li>
                <NavLinks />
              </li>
              <li className="mt-auto">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between px-3 py-3 text-sm font-semibold leading-6 text-slate-900 rounded-lg bg-white shadow-sm border border-slate-200">
                    <div className="flex items-center gap-x-3">
                      <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold">
                        {displayName?.charAt(0).toUpperCase() || 'O'}
                      </div>
                      <span aria-hidden="true" className="truncate">{displayName}</span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded uppercase ring-1 ring-inset ring-amber-600/20">
                      {role}
                    </span>
                  </div>
                  <form action={logout}>
                    <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-red-700 hover:bg-red-50">
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
