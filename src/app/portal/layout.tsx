import { ReactNode } from 'react'
import Link from 'next/link'
import type { Route } from 'next'

import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/(auth)/actions'
import { PortalRealtimeSubscription } from '@/components/PortalRealtimeSubscription'
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'

function getDisplayName(
  profile: { full_name?: string | null; company_name?: string | null } | null,
  email: string | undefined,
) {
  return profile?.full_name ?? profile?.company_name ?? email?.split('@')[0]
}

function isOpsUser(profile: { role?: string | null } | null) {
  return profile?.role === 'admin' || profile?.role === 'ops'
}

interface NavItem {
  name: string
  href: Route<string>
  icon: typeof Home
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', href: '/portal', icon: Home },
  { name: 'Mis Pedidos', href: '/portal/pedidos', icon: FileText },
  { name: 'Suscripciones', href: '/portal/suscripciones', icon: ShieldCheck },
  { name: 'Configuración', href: '/portal/configuracion', icon: Settings },
]

function SidebarNav({ isOps }: { isOps: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-primary"
          >
            <Icon className="mr-3 size-5 shrink-0 text-muted-foreground group-hover:text-primary" aria-hidden="true" />
            <span className="truncate">{item.name}</span>
          </Link>
        )
      })}
      {isOps && (
        <Link
          href="/ops"
          className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 hover:text-amber-800 mt-4 border border-amber-200"
        >
          <Building2 className="mr-3 size-5 shrink-0 text-amber-500 group-hover:text-amber-600" />
          <span className="truncate">Panel de Operaciones</span>
        </Link>
      )}
    </div>
  )
}

function UserProfileCard({ displayName }: { displayName: string | undefined }) {
  return (
    <div className="flex items-center gap-x-4 px-3 py-3 text-sm font-semibold leading-6 text-foreground rounded-lg bg-muted">
      <Avatar>
        <AvatarFallback className="bg-primary/10 text-primary font-bold">
          {displayName?.charAt(0).toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
      <span className="sr-only">Your profile</span>
      <span aria-hidden="true" className="truncate">{displayName}</span>
    </div>
  )
}

function MobileNav({ isOps, displayName, logoutAction }: { isOps: boolean; displayName: string | undefined; logoutAction: () => Promise<void> }) {
  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-card px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 lg:hidden">
      <Sheet>
        <Tooltip>
          <TooltipTrigger asChild>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="-m-2.5 size-11 text-muted-foreground lg:hidden">
                <span className="sr-only">Abrir menú</span>
                <Menu className="size-6" aria-hidden="true" />
              </Button>
            </SheetTrigger>
          </TooltipTrigger>
          <TooltipContent>Abrir menú de navegación</TooltipContent>
        </Tooltip>
        <SheetContent side="left" className="w-72 bg-card flex flex-col pt-5 pb-4">
          <div className="flex shrink-0 items-center px-4 mb-6">
            <span className="text-xl font-bold text-foreground tracking-tight">Afiladocs<span className="text-primary">Portal</span></span>
          </div>
          <div className="mt-5 h-0 flex-1 overflow-y-auto px-2">
            <nav className="flex flex-1 flex-col">
              <SidebarNav isOps={isOps} />
            </nav>
          </div>
          <div className="flex shrink-0 p-4">
            <Separator className="mb-4" />
            <form action={logoutAction} className="w-full">
              <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                <LogOut className="mr-3 size-5" aria-hidden="true" />
                Cerrar sesión
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1"></div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <span className="text-sm font-medium text-foreground">{displayName}</span>
        </div>
      </div>
    </div>
  )
}

function DesktopSidebar({ isOps, displayName, logoutAction }: { isOps: boolean; displayName: string | undefined; logoutAction: () => Promise<void> }) {
  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-border bg-card px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <span className="text-xl font-bold text-foreground tracking-tight">Afiladocs<span className="text-primary">Portal</span></span>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <SidebarNav isOps={isOps} />
            </li>
            <li className="mt-auto">
              <div className="flex flex-col gap-4">
                <UserProfileCard displayName={displayName} />
                <form action={logoutAction}>
                  <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                    <LogOut className="mr-3 size-5" aria-hidden="true" />
                    Cerrar sesión
                  </Button>
                </form>
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, company_name, role')
    .eq('id', user.id)
    .single()

  const displayName = getDisplayName(profile, user.email)
  const isOps = isOpsUser(profile)

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <MobileNav isOps={isOps} displayName={displayName} logoutAction={logout} />
        <DesktopSidebar isOps={isOps} displayName={displayName} logoutAction={logout} />
        <PortalRealtimeSubscription userId={user.id} />
        <main className="lg:pl-72">
          <div className="px-4 py-10 sm:px-6 lg:px-8 lg:py-12 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </TooltipProvider>
  )
}
