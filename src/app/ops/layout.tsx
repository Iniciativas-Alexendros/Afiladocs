import { ReactNode } from 'react'
import Link from 'next/link'
import type { Route } from 'next'
import { requireRole } from '@/lib/auth'
import {
  BuildingIcon,
  Home,
  Menu,
  Briefcase,
  FileText,
  Package,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { LogoutButton } from './LogoutButton'

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

  const navItems: { name: string; href: Route<string>; icon: typeof Home }[] = [
    { name: 'Ops Dashboard', href: '/ops', icon: Home },
    { name: 'Gestión Pedidos', href: '/ops/pedidos', icon: FileText },
    { name: 'Catálogo', href: '/ops/productos', icon: Package },
    { name: 'Auditoría', href: '/ops/auditoria' as Route<string>, icon: ShieldCheck },
    // '/ops/clientes' and '/ops/monitor' pages not yet implemented
  ]

  const NavLinks = () => (
    <>
      <div className="flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Icon className="mr-3 size-5 shrink-0 text-muted-foreground group-hover:text-amber-500" aria-hidden="true" />
              <span className="truncate">{item.name}</span>
            </Link>
          )
        })}
        {/* Link back to client portal */}
        <Separator className="my-6" />
        <Link
          href="/portal"
          className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
        >
          <Briefcase className="mr-3 size-5 shrink-0 text-primary" />
          <span className="truncate">Volver a mi Portal</span>
        </Link>
      </div>
    </>
  )

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-muted">
        {/* Mobile nav */}
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
                <div className="flex items-center gap-2">
                  <BuildingIcon className="size-6 text-amber-600" />
                  <span className="text-xl font-bold text-foreground tracking-tight">Afiladocs<span className="text-amber-600">Ops</span></span>
                </div>
              </div>
              <div className="mt-5 h-0 flex-1 overflow-y-auto px-2">
                <nav className="flex flex-1 flex-col">
                  <NavLinks />
                </nav>
              </div>
              <div className="flex shrink-0 p-4">
                <Separator className="mb-4" />
                <LogoutButton />
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800 uppercase text-[10px] font-bold">
                {role}
              </Badge>
              <span className="text-sm font-medium text-foreground">{displayName}</span>
            </div>
          </div>
        </div>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-border bg-card/80 px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center gap-2 border-b border-border">
              <BuildingIcon className="size-6 text-amber-600" />
              <span className="text-xl font-bold text-foreground tracking-tight">Afiladocs<span className="text-amber-600">Ops</span></span>
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7 pt-4">
                <li>
                  <NavLinks />
                </li>
                <li className="mt-auto">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between px-3 py-3 text-sm font-semibold leading-6 text-foreground rounded-lg bg-muted shadow-sm border border-border">
                      <div className="flex items-center gap-x-3">
                        <Avatar>
                          <AvatarFallback className="bg-foreground text-background font-bold">
                            {displayName?.charAt(0).toUpperCase() || 'O'}
                          </AvatarFallback>
                        </Avatar>
                        <span aria-hidden="true" className="truncate">{displayName}</span>
                      </div>
                      <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800 uppercase text-[10px] font-bold">
                        {role}
                      </Badge>
                    </div>
                    <LogoutButton />
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
    </TooltipProvider>
  )
}
