'use client'

import React from 'react'
import { useTheme } from 'next-themes'
import {
  LayoutDashboard,
  Users,
  Calendar,
  Stethoscope,
  Microscope,
  Pill,
  Bed,
  Siren,
  Baby,
  Syringe,
  Receipt,
  Video,
  BarChart3,
  Settings2,
  Cog,
  Heart,
  Bell,
  Search,
  Sun,
  Moon,
  LogOut,
  User,
  Settings,
  Menu,
} from 'lucide-react'
import { useStore, type AppView } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar'

/* ─────────── Navigation Configuration ─────────── */

interface NavItem {
  view: AppView
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: 'Principal',
    items: [
      { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { view: 'patients', label: 'Patients', icon: Users },
      { view: 'appointments', label: 'Rendez-vous', icon: Calendar },
      { view: 'consultations', label: 'Consultations', icon: Stethoscope },
    ],
  },
  {
    label: 'Médical',
    items: [
      { view: 'laboratory', label: 'Laboratoire', icon: Microscope },
      { view: 'pharmacy', label: 'Pharmacie', icon: Pill },
      { view: 'hospitalization', label: 'Hospitalisation', icon: Bed },
      { view: 'emergencies', label: 'Urgences', icon: Siren },
      { view: 'maternity', label: 'Maternité', icon: Baby },
      { view: 'vaccination', label: 'Vaccination', icon: Syringe },
    ],
  },
  {
    label: 'Gestion',
    items: [
      { view: 'billing', label: 'Facturation', icon: Receipt },
      { view: 'teleconsultation', label: 'Téléconsultation', icon: Video },
      { view: 'analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Système',
    items: [
      { view: 'administration', label: 'Administration', icon: Settings2 },
      { view: 'settings', label: 'Paramètres', icon: Cog },
    ],
  },
]

/* ─────────── View Title Map ─────────── */

const viewTitles: Record<AppView, string> = {
  landing: '',
  dashboard: 'Dashboard',
  patients: 'Gestion des Patients',
  appointments: 'Rendez-vous',
  consultations: 'Consultations',
  laboratory: 'Laboratoire',
  pharmacy: 'Pharmacie & Stock',
  hospitalization: 'Hospitalisation',
  emergencies: 'Urgences',
  maternity: 'Maternité',
  vaccination: 'Vaccination',
  billing: 'Facturation & Paiements',
  teleconsultation: 'Téléconsultation',
  analytics: 'Analytics',
  administration: 'Administration',
  settings: 'Paramètres',
}

/* ─────────── App Sidebar ─────────── */

function AppSidebar() {
  const { currentView, setCurrentView, user } = useStore()

  return (
    <Sidebar collapsible="icon" className="border-r border-slate-200 dark:border-slate-800">
      {/* Logo Area */}
      <SidebarHeader className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              onClick={() => setCurrentView('dashboard')}
              className="hover:bg-teal-50 dark:hover:bg-teal-950/30"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 shadow-md shadow-teal-500/20">
                <Heart className="size-4 text-white" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold text-slate-900 dark:text-white">HealthFlow</span>
                <span className="truncate text-[10px] font-medium text-teal-600 dark:text-teal-400 tracking-wider uppercase">
                  Guinea
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      {/* Navigation */}
      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.view}>
                    <SidebarMenuButton
                      isActive={currentView === item.view}
                      onClick={() => setCurrentView(item.view)}
                      tooltip={item.label}
                      className={
                        currentView === item.view
                          ? 'bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 font-medium hover:bg-teal-100 dark:hover:bg-teal-950/50'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                      }
                    >
                      <item.icon className={
                        currentView === item.view
                          ? 'text-teal-600 dark:text-teal-400'
                          : 'text-slate-500 dark:text-slate-400'
                      } />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarSeparator />

      {/* User Info at Bottom */}
      <SidebarFooter className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-gradient-to-br from-teal-500 to-emerald-600 text-white text-xs font-bold">
                      {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-slate-900 dark:text-white">{user.name}</span>
                    <span className="truncate text-xs text-slate-500 dark:text-slate-400">{user.role}</span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.role}</p>
                    <p className="text-xs text-muted-foreground">{user.establishment}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setCurrentView('settings')}>
                  <Settings className="mr-2 size-4" />
                  Paramètres
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setCurrentView('landing')}
                  className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                >
                  <LogOut className="mr-2 size-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

/* ─────────── Top Header Bar ─────────── */

function TopHeader() {
  const { currentView, setCurrentView } = useStore()
  const { resolvedTheme, setTheme } = useTheme()

  const title = viewTitles[currentView] || 'HealthFlow Guinea'

  return (
    <header className="flex h-14 items-center gap-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 lg:px-6">
      {/* Sidebar trigger (mobile) */}
      <SidebarTrigger className="-ml-1 md:hidden" />

      {/* Sidebar trigger (desktop) */}
      <SidebarTrigger className="-ml-1 hidden md:flex" />

      <Separator orientation="vertical" className="h-6" />

      {/* Current page title */}
      <h1 className="text-base font-semibold text-slate-900 dark:text-white truncate">
        {title}
      </h1>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search bar */}
      <div className="hidden md:flex items-center relative max-w-sm flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
        <Input
          placeholder="Rechercher..."
          className="pl-9 h-9 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-sm focus-visible:ring-teal-500"
        />
      </div>

      {/* Mobile search button */}
      <Button variant="ghost" size="icon" className="md:hidden text-slate-500 dark:text-slate-400">
        <Search className="size-5" />
      </Button>

      {/* Notification bell */}
      <Button variant="ghost" size="icon" className="relative text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
        <Bell className="size-5" />
        <Badge className="absolute -top-1 -right-1 size-5 p-0 flex items-center justify-center bg-red-500 text-white text-[10px] border-2 border-white dark:border-slate-950">
          3
        </Badge>
      </Button>

      {/* Dark/Light mode toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        aria-label="Changer le thème"
      >
        <Sun className="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Button>

      {/* User avatar dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="size-9">
              <AvatarFallback className="bg-gradient-to-br from-teal-500 to-emerald-600 text-white text-xs font-bold">
                MD
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">Dr. Mamadou Diallo</p>
              <p className="text-xs text-muted-foreground">Médecin - Hôpital Donka</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 size-4" />
            Profil
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setCurrentView('settings')}>
            <Settings className="mr-2 size-4" />
            Paramètres
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setCurrentView('landing')}
            className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
          >
            <LogOut className="mr-2 size-4" />
            Déconnexion
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}

/* ─────────── App Shell ─────────── */

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <TopHeader />
        <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950/50">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
