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
  CheckCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  Smartphone,
  CreditCard,
  MessageSquare,
  ShieldCheck,
  Brain,
  AlertCircle,
  Activity,
  MonitorPlay,
  Clock,
  MapPin,
  Eye,
  Shield,
  Lock,
  FileJson,
  Globe,
} from 'lucide-react'
import { useStore, type AppView } from '@/lib/store'
import { useDataStore } from '@/lib/data-store'
import { NetworkStatus } from '@/components/app/network-status'
import { LanguageSwitcher } from '@/components/app/language-switcher'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
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
import { hasPermission, toHFRole, type HFRole } from '@/lib/rbac'

/* ─────────── Navigation Configuration ─────────── */

interface NavItem {
  view: AppView
  label: string
  icon: React.ComponentType<{ className?: string }>
  requiredPermission?: { resource: Parameters<typeof hasPermission>[0]; action: Parameters<typeof hasPermission>[1] }
}

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: 'Principal',
    items: [
      { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { view: 'patients', label: 'Patients', icon: Users, requiredPermission: { resource: 'patients', action: 'read' } },
      { view: 'appointments', label: 'Rendez-vous', icon: Calendar },
      { view: 'consultations', label: 'Consultations', icon: Stethoscope, requiredPermission: { resource: 'consultations', action: 'read' } },
    ],
  },
  {
    label: 'Médical',
    items: [
      { view: 'laboratory', label: 'Laboratoire', icon: Microscope, requiredPermission: { resource: 'laboratory', action: 'read' } },
      { view: 'pharmacy', label: 'Pharmacie', icon: Pill, requiredPermission: { resource: 'pharmacy', action: 'read' } },
      { view: 'hospitalization', label: 'Hospitalisation', icon: Bed, requiredPermission: { resource: 'hospitalization', action: 'read' } },
      { view: 'emergencies', label: 'Urgences', icon: Siren, requiredPermission: { resource: 'emergencies', action: 'read' } },
      { view: 'maternity', label: 'Maternité', icon: Baby, requiredPermission: { resource: 'maternity', action: 'read' } },
      { view: 'vaccination', label: 'Vaccination', icon: Syringe, requiredPermission: { resource: 'vaccinations', action: 'read' } },
    ],
  },
  {
    label: 'Gestion',
    items: [
      { view: 'billing', label: 'Facturation', icon: Receipt, requiredPermission: { resource: 'billing', action: 'read' } },
      { view: 'payments', label: 'Paiements', icon: CreditCard },
      { view: 'messaging', label: 'Messagerie', icon: MessageSquare, requiredPermission: { resource: 'messaging', action: 'send' } },
      { view: 'insurance', label: 'Assurance', icon: ShieldCheck, requiredPermission: { resource: 'insurance', action: 'read' } },
      { view: 'teleconsultation', label: 'Téléconsultation', icon: Video, requiredPermission: { resource: 'telemedicine', action: 'read' } },
      { view: 'analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Télémédecine',
    items: [
      { view: 'video-consultation', label: 'Vidéo Consultation', icon: MonitorPlay, requiredPermission: { resource: 'telemedicine', action: 'read' } },
      { view: 'virtual-waiting-room', label: 'Salle d\'attente', icon: Clock, requiredPermission: { resource: 'telemedicine', action: 'read' } },
      { view: 'asc-dashboard', label: 'Outils ASC', icon: MapPin, requiredPermission: { resource: 'asc', action: 'read' } },
    ],
  },
  {
    label: 'IA Santé',
    items: [
      { view: 'ai-diagnostic', label: 'Diagnostic IA', icon: Brain, requiredPermission: { resource: 'ai', action: 'diagnostic' } },
      { view: 'ai-interactions', label: 'Interactions', icon: AlertCircle, requiredPermission: { resource: 'ai', action: 'interactions' } },
      { view: 'ai-surveillance', label: 'Surveillance', icon: Activity, requiredPermission: { resource: 'ai', action: 'surveillance' } },
    ],
  },
  {
    label: 'Interopérabilité',
    items: [
      { view: 'fhir-explorer', label: 'FHIR Explorer', icon: FileJson },
      { view: 'integration-dashboard', label: 'Intégrations', icon: Globe },
    ],
  },
  {
    label: 'Sécurité',
    items: [
      { view: 'audit-log', label: 'Journal d\'audit', icon: Eye, requiredPermission: { resource: 'admin', action: 'read' } },
      { view: 'security-dashboard', label: 'Sécurité', icon: Shield, requiredPermission: { resource: 'admin', action: 'read' } },
      { view: 'permission-matrix', label: 'Permissions', icon: Lock, requiredPermission: { resource: 'admin', action: 'read' } },
    ],
  },
  {
    label: 'Système',
    items: [
      { view: 'administration', label: 'Administration', icon: Settings2, requiredPermission: { resource: 'admin', action: 'read' } },
      { view: 'settings', label: 'Paramètres', icon: Cog },
      { view: 'patient-portal', label: 'Portail Patient', icon: Smartphone },
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
  payments: 'Paiements Mobile Money',
  messaging: 'Messagerie',
  insurance: 'Assurance Santé',
  teleconsultation: 'Téléconsultation',
  analytics: 'Analytics',
  administration: 'Administration',
  settings: 'Paramètres',
  'patient-portal': 'Portail Patient',
  'ai-diagnostic': 'Diagnostic IA',
  'ai-interactions': 'Interactions médicamenteuses',
  'ai-surveillance': 'Surveillance épidémiologique',
  'video-consultation': 'Vidéo Consultation',
  'virtual-waiting-room': 'Salle d\'attente virtuelle',
  'asc-dashboard': 'Agent de Santé Communautaire',
  'audit-log': 'Journal d\'audit',
  'security-dashboard': 'Tableau de bord sécurité',
  'permission-matrix': 'Matrice de permissions',
  'fhir-explorer': 'FHIR R4 Explorer',
  'integration-dashboard': 'Intégrations & Interopérabilité',
}

/* ─────────── Notification Icon Map ─────────── */

const notifIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle2,
  error: XCircle,
}

const notifColors: Record<string, string> = {
  info: 'text-blue-500',
  warning: 'text-amber-500',
  success: 'text-emerald-500',
  error: 'text-red-500',
}

/* ─────────── App Sidebar ─────────── */

function AppSidebar() {
  const { currentView, setCurrentView, user } = useStore()
  const userRole = toHFRole(user.role)

  // Check if a nav item should be visible
  const isItemVisible = (item: NavItem): boolean => {
    if (!item.requiredPermission) return true
    return hasPermission(userRole, item.requiredPermission.resource, item.requiredPermission.action)
  }

  // Check if a group has any visible items
  const isGroupVisible = (group: { items: NavItem[] }): boolean => {
    return group.items.some(isItemVisible)
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-slate-200 dark:border-slate-800">
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

      <SidebarContent>
        {navGroups.filter(isGroupVisible).map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.filter(isItemVisible).map((item) => (
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

/* ─────────── Notifications Popover ─────────── */

function NotificationsPanel() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useDataStore()
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 size-5 p-0 flex items-center justify-center bg-red-500 text-white text-[10px] border-2 border-white dark:border-slate-950">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold text-sm">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 text-teal-600 hover:text-teal-700"
              onClick={markAllNotificationsRead}
            >
              <CheckCheck className="w-3.5 h-3.5 mr-1" />
              Tout marquer lu
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">Aucune notification</div>
          ) : (
            <div className="divide-y">
              {notifications.map((notif) => {
                const Icon = notifIcons[notif.type] || Info
                return (
                  <button
                    key={notif.id}
                    onClick={() => markNotificationRead(notif.id)}
                    className={`w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${!notif.read ? 'bg-teal-50/50 dark:bg-teal-950/20' : ''}`}
                  >
                    <div className="flex gap-3">
                      <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${notifColors[notif.type]}`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-xs font-medium ${!notif.read ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-slate-400 flex-shrink-0">{notif.time}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{notif.message}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

/* ─────────── Global Search ─────────── */

function GlobalSearch() {
  const { searchQuery, setSearchQuery, setCurrentView } = useStore()
  const { patients, appointments } = useDataStore()
  const [focused, setFocused] = React.useState(false)

  const results = React.useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase()
    const patientResults = patients
      .filter(p => p.firstName.toLowerCase().includes(q) || p.lastName.toLowerCase().includes(q) || p.id.toLowerCase().includes(q))
      .slice(0, 3)
      .map(p => ({ type: 'patient' as const, label: `${p.firstName} ${p.lastName}`, sub: p.id, view: 'patients' as AppView }))
    const apptResults = appointments
      .filter(a => a.patientName.toLowerCase().includes(q) || a.reason.toLowerCase().includes(q))
      .slice(0, 3)
      .map(a => ({ type: 'appointment' as const, label: a.patientName, sub: a.reason, view: 'appointments' as AppView }))
    return [...patientResults, ...apptResults]
  }, [searchQuery, patients, appointments])

  return (
    <div className="hidden md:flex items-center relative max-w-sm flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 z-10" />
      <Input
        placeholder="Rechercher patients, RDV..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 200)}
        className="pl-9 h-9 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-sm focus-visible:ring-teal-500"
      />
      {focused && searchQuery.trim() && results.length > 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
          {results.map((r, i) => (
            <button
              key={i}
              className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
              onClick={() => { setCurrentView(r.view); setSearchQuery(''); setFocused(false) }}
            >
              <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white ${r.type === 'patient' ? 'bg-teal-500' : 'bg-blue-500'}`}>
                {r.type === 'patient' ? <Users className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-900 dark:text-white truncate">{r.label}</p>
                <p className="text-[10px] text-slate-500 truncate">{r.sub}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─────────── Top Header Bar ─────────── */

function TopHeader() {
  const { currentView, setCurrentView, user } = useStore()
  const { resolvedTheme, setTheme } = useTheme()

  const title = viewTitles[currentView] || 'HealthFlow Guinea'

  return (
    <header className="flex h-14 items-center gap-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 lg:px-6">
      <SidebarTrigger className="-ml-1 md:hidden" />
      <SidebarTrigger className="-ml-1 hidden md:flex" />
      <Separator orientation="vertical" className="h-6" />
      <h1 className="text-base font-semibold text-slate-900 dark:text-white truncate">{title}</h1>
      <div className="flex-1" />

      <GlobalSearch />

      <Button variant="ghost" size="icon" className="md:hidden text-slate-500 dark:text-slate-400">
        <Search className="size-5" />
      </Button>

      <NetworkStatus />

      <NotificationsPanel />

      <LanguageSwitcher />

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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="size-9">
              <AvatarFallback className="bg-gradient-to-br from-teal-500 to-emerald-600 text-white text-xs font-bold">
                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.role} — {user.establishment}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setCurrentView('settings')}>
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
