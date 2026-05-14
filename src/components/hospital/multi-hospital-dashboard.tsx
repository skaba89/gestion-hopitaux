'use client'

import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2, MapPin, Phone, Users, Bed, Activity, Stethoscope,
  AlertTriangle, ArrowLeft, ArrowRightLeft, ChevronDown, Shield,
  CheckCircle2, XCircle, Clock, Heart, Scissors, Baby, Brain,
  Droplets, Wind, Pill, FlaskConical, Eye, ShieldAlert,
  UserCheck, UserX, FileText, Send, Siren, TrendingUp,
  Globe, LayoutGrid, List, AlertCircle, Info, Star, Zap,
  Gauge, ThermometerSun, StethoscopeIcon, Briefcase,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useMultiHospitalStore } from '@/lib/hospital-store'
import { useDataStore } from '@/lib/data-store'
import { useStore } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'
import {
  type Hospital,
  type HospitalService,
  type GuineaRegion,
  type ServiceUrgency,
  type MultiHospitalRole,
  type HospitalStats,
  type ServiceStats,
  REGION_LABELS,
  REGION_COLORS,
  getBedOccupancyRate,
  getServiceUrgency,
  ROLE_HIERARCHY,
  ROLE_LABELS,
} from '@/lib/hospital-model'

// ─────────── Animation Variants ───────────

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
}

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.05 } },
}

const staggerItem = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
}

// ─────────── Helper Functions ───────────

const GUINEA_REGIONS: GuineaRegion[] = [
  'Conakry', 'Kindia', 'Boké', 'Labé', 'Mamou', 'Faranah', 'Kankan', 'Nzérékoré',
]

function getUrgencyColor(urgency: ServiceUrgency): string {
  switch (urgency) {
    case 'Critique': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900'
    case 'Surchargé': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900'
    case 'Normale': return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900'
  }
}

function getUrgencyDotColor(urgency: ServiceUrgency): string {
  switch (urgency) {
    case 'Critique': return 'bg-red-500'
    case 'Surchargé': return 'bg-amber-500'
    case 'Normale': return 'bg-emerald-500'
  }
}

function getOccupancyColor(rate: number): string {
  if (rate >= 95) return 'bg-red-500'
  if (rate >= 80) return 'bg-amber-500'
  if (rate >= 60) return 'bg-teal-500'
  return 'bg-emerald-500'
}

function getHospitalTypeLabel(type: string): string {
  switch (type) {
    case 'CHU': return 'Centre Hospitalier Universitaire'
    case 'HGR': return 'Hôpital Régional'
    case 'HGD': return 'Hôpital de District'
    case 'CS': return 'Centre de Santé'
    default: return type
  }
}

const SERVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  AlertTriangle, Heart, Scissors, Baby, Activity, Brain, Droplets,
  Wind, Pill, FlaskConical, Eye, ShieldAlert, Shield, Stethoscope,
}

function ServiceIcon({ name, className }: { name: string; className?: string }) {
  const IconComponent = SERVICE_ICONS[name] || Activity
  return <IconComponent className={className} />
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat('fr-FR').format(n)
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'decimal', minimumFractionDigits: 0 }).format(n) + ' GNF'
}

// ─────────── Sub-Component: Stat Card ───────────

function StatCard({
  title, value, subtitle, icon: Icon, color = 'teal', trend,
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  color?: 'teal' | 'red' | 'amber' | 'emerald' | 'blue' | 'purple'
  trend?: string
}) {
  const colorMap = {
    teal: 'from-teal-500 to-teal-600 shadow-teal-500/20',
    red: 'from-red-500 to-red-600 shadow-red-500/20',
    amber: 'from-amber-500 to-amber-600 shadow-amber-500/20',
    emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-500/20',
    blue: 'from-blue-500 to-blue-600 shadow-blue-500/20',
    purple: 'from-purple-500 to-purple-600 shadow-purple-500/20',
  }
  const iconBgMap = {
    teal: 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400',
    red: 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400',
    amber: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
    blue: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400',
  }

  return (
    <motion.div variants={staggerItem}>
      <Card className="relative overflow-hidden border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {title}
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
              {subtitle && (
                <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
              )}
              {trend && (
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {trend}
                </p>
              )}
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBgMap[color]}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─────────── Sub-Component: Region Card ───────────

function RegionCard({ region }: { region: GuineaRegion }) {
  const { getHospitalsByRegion } = useMultiHospitalStore()
  const hospitals = getHospitalsByRegion(region)
  const totalBeds = hospitals.reduce((s, h) => s + h.totalBeds, 0)
  const occupiedBeds = hospitals.reduce((s, h) => s + h.occupiedBeds, 0)
  const occupancy = getBedOccupancyRate(occupiedBeds, totalBeds)
  const color = REGION_COLORS[region]

  return (
    <motion.div variants={staggerItem}>
      <Card className="border-slate-200 dark:border-slate-800 hover:shadow-md transition-all duration-200">
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white">
              {REGION_LABELS[region]}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                {hospitals.length} établissement{hospitals.length > 1 ? 's' : ''}
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{occupancy}% occupation</span>
            </div>
            <Progress
              value={occupancy}
              className="h-1.5"
            />
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{occupiedBeds}/{totalBeds} lits</span>
              <span>{hospitals.reduce((s, h) => s + h.services.reduce((ss, svc) => ss + svc.staffCount, 0), 0)} personnels</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─────────── Sub-Component: Hospital Card (National Grid) ───────────

function HospitalGridCard({ hospital }: { hospital: Hospital }) {
  const { selectHospital } = useMultiHospitalStore()
  const occupancy = getBedOccupancyRate(hospital.occupiedBeds, hospital.totalBeds)
  const urgency = getServiceUrgency(occupancy)

  return (
    <motion.div variants={staggerItem}>
      <Card
        className="cursor-pointer border-slate-200 dark:border-slate-800 hover:shadow-lg hover:border-teal-300 dark:hover:border-teal-700 transition-all duration-200"
        onClick={() => selectHospital(hospital.id)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {hospital.shortName}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{hospital.name}</p>
            </div>
            <Badge className={`text-[10px] ml-2 ${getUrgencyColor(urgency)}`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1 ${getUrgencyDotColor(urgency)}`} />
              {urgency}
            </Badge>
          </div>

          <div className="flex items-center gap-1.5 mb-2 text-xs text-slate-500 dark:text-slate-400">
            <MapPin className="w-3 h-3" />
            <span>{REGION_LABELS[hospital.region as GuineaRegion]}</span>
            <span className="mx-1">·</span>
            <span className="font-medium text-slate-600 dark:text-slate-300">{hospital.type}</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Occupation des lits</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{occupancy}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getOccupancyColor(occupancy)}`}
                style={{ width: `${occupancy}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{hospital.occupiedBeds}/{hospital.totalBeds} lits</span>
              <span>{hospital.services.length} services</span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <Badge variant="outline" className="text-[10px] bg-slate-50 dark:bg-slate-900">
              {hospital.accreditationLevel}
            </Badge>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <UserCheck className="w-3 h-3" />
              {hospital.directorName}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─────────── Sub-Component: Service Card (Hospital Dashboard) ───────────

function ServiceCard({ service, onClick }: { service: HospitalService; onClick: () => void }) {
  const occupancy = getBedOccupancyRate(service.occupiedBeds, service.totalBeds || 1)

  return (
    <motion.div variants={staggerItem}>
      <Card
        className="cursor-pointer border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all duration-200 overflow-hidden"
        onClick={onClick}
      >
        <div className="h-1" style={{ backgroundColor: service.color }} />
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: service.color + '18', color: service.color }}
              >
                <ServiceIcon name={service.icon} className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{service.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">{service.headDoctorName}</p>
              </div>
            </div>
            <Badge className={`text-[10px] ${getUrgencyColor(service.urgency)}`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1 ${getUrgencyDotColor(service.urgency)}`} />
              {service.urgency}
            </Badge>
          </div>

          {service.totalBeds > 0 && (
            <div className="space-y-1.5 mb-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Lits occupés</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {service.occupiedBeds}/{service.totalBeds} ({occupancy}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getOccupancyColor(occupancy)}`}
                  style={{ width: `${occupancy}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {service.staffCount}
            </span>
            <span className="flex items-center gap-1">
              <Stethoscope className="w-3 h-3" />
              {service.doctorsCount} médecins
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {service.averageWaitTime} min
            </span>
          </div>

          {service.isAutonomous && (
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-teal-600 dark:text-teal-400 flex items-center gap-1 font-medium">
                <Shield className="w-3 h-3" />
                Service autonome
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─────────── Sub-Component: National Overview ───────────

function NationalOverview() {
  const { hospitals, getNationalStats, selectHospital } = useMultiHospitalStore()
  const stats = getNationalStats()
  const [filterRegion, setFilterRegion] = useState<GuineaRegion | 'all'>('all')

  const filteredHospitals = useMemo(() => {
    if (filterRegion === 'all') return hospitals
    return hospitals.filter(h => h.region === filterRegion)
  }, [hospitals, filterRegion])

  return (
    <motion.div variants={fadeIn} initial="initial" animate="animate" exit="exit" className="space-y-6">
      {/* En-tête National */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            Vue Nationale — République de Guinée
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Supervision centralisée du système de santé national
          </p>
        </div>
        <Badge className="bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400 text-xs px-3 py-1">
          <Activity className="w-3 h-3 mr-1" />
          Temps réel
        </Badge>
      </div>

      {/* Statistiques Nationales */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3"
      >
        <StatCard
          title="Hôpitaux"
          value={stats.totalHospitals}
          subtitle="établissements actifs"
          icon={Building2}
          color="teal"
        />
        <StatCard
          title="Lits Total"
          value={formatNumber(stats.totalBeds)}
          subtitle={`${stats.totalOccupied} occupés`}
          icon={Bed}
          color="blue"
        />
        <StatCard
          title="Taux Occupation"
          value={`${stats.avgOccupancy}%`}
          subtitle="moyenne nationale"
          icon={Gauge}
          color={stats.avgOccupancy >= 80 ? 'amber' : 'teal'}
        />
        <StatCard
          title="Patients"
          value={formatNumber(stats.totalPatients)}
          subtitle="aujourd'hui"
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Personnels"
          value={formatNumber(stats.totalStaff)}
          subtitle="tous établissements"
          icon={UserCheck}
          color="emerald"
        />
      </motion.div>

      {/* Cartes Régionales */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          Répartition par Région Naturelle
        </h3>
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          {GUINEA_REGIONS.map(region => (
            <RegionCard key={region} region={region} />
          ))}
        </motion.div>
      </div>

      {/* Filtre et Grille des Hôpitaux */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            Établissements Hospitaliers
          </h3>
          <Select
            value={filterRegion}
            onValueChange={(v) => setFilterRegion(v as GuineaRegion | 'all')}
          >
            <SelectTrigger className="w-[200px] h-8 text-xs">
              <SelectValue placeholder="Filtrer par région" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les régions</SelectItem>
              {GUINEA_REGIONS.map(r => (
                <SelectItem key={r} value={r}>{REGION_LABELS[r]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {filteredHospitals.map(hospital => (
            <HospitalGridCard key={hospital.id} hospital={hospital} />
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}

// ─────────── Sub-Component: Hospital Dashboard ───────────

function HospitalDashboard({ hospital }: { hospital: Hospital }) {
  const { selectService, selectHospital, getHospitalStats, getActiveDelegations } = useMultiHospitalStore()
  const stats = getHospitalStats(hospital.id)
  const delegations = getActiveDelegations(hospital.id)
  const [showManager, setShowManager] = useState(false)

  const occupancy = getBedOccupancyRate(hospital.occupiedBeds, hospital.totalBeds)
  const totalStaff = hospital.services.reduce((s, svc) => s + svc.staffCount, 0)
  const criticalServices = hospital.services.filter(s => s.urgency === 'Critique').length
  const overloadedServices = hospital.services.filter(s => s.urgency === 'Surchargé').length

  return (
    <motion.div variants={fadeIn} initial="initial" animate="animate" exit="exit" className="space-y-6">
      {/* En-tête Hôpital */}
      <div className="relative">
        <div className="h-2 rounded-t-xl" style={{ backgroundColor: hospital.color }} />
        <Card className="rounded-t-none border-t-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 -ml-2"
                    onClick={() => selectHospital(null)}
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Retour
                  </Button>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{hospital.name}</h2>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Badge variant="outline" className="text-[10px] bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800">
                      {hospital.type}
                    </Badge>
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {REGION_LABELS[hospital.region as GuineaRegion]}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {hospital.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <UserCheck className="w-3 h-3" />
                    {hospital.directorName}
                  </span>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500">{hospital.address}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  {hospital.accreditationLevel}
                </Badge>
                {criticalServices > 0 && (
                  <Badge className="bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 text-xs">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {criticalServices} critique{criticalServices > 1 ? 's' : ''}
                  </Badge>
                )}
                {delegations.length > 0 && (
                  <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 text-xs">
                    <ArrowRightLeft className="w-3 h-3 mr-1" />
                    {delegations.length} délégation{delegations.length > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métriques Clés */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        <StatCard
          title="Occupation Lits"
          value={`${occupancy}%`}
          subtitle={`${hospital.occupiedBeds}/${hospital.totalBeds} lits`}
          icon={Bed}
          color={occupancy >= 80 ? 'amber' : 'teal'}
        />
        <StatCard
          title="Patients Aujourd'hui"
          value={stats.totalPatients}
          subtitle={`${stats.totalAdmissions} admissions`}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Consultations"
          value={stats.totalConsultations}
          subtitle={`${stats.totalSurgeries} chirurgies`}
          icon={Stethoscope}
          color="purple"
        />
        <StatCard
          title="Urgences"
          value={stats.totalEmergencies}
          subtitle={`${stats.totalDeaths} décès`}
          icon={Siren}
          color={stats.totalEmergencies > 15 ? 'red' : 'emerald'}
        />
      </motion.div>

      {/* Info complémentaire */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-3 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Personnels présents</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {stats.staffPresentCount}/{stats.staffPresentCount + stats.staffAbsentCount}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Temps attente moyen</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{stats.averageWaitTime} min</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-3 flex items-center gap-2">
            <ThermometerSun className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Services surchargés</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {overloadedServices + criticalServices} / {hospital.services.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-3 flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Taux satisfaction</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{stats.satisfactionRate}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vue Gestionnaire + Services */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <StethoscopeIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          Services de l'établissement ({hospital.services.length})
        </h3>
        <Button
          onClick={() => setShowManager(!showManager)}
          className={`h-8 text-xs ${showManager
            ? 'bg-teal-600 hover:bg-teal-700 text-white'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5 mr-1.5" />
          {showManager ? 'Masquer Vue Gestionnaire' : 'Vue Gestionnaire'}
        </Button>
      </div>

      <AnimatePresence>
        {showManager && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CrossServiceManager hospital={hospital} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grille des Services */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {hospital.services.map(service => (
          <ServiceCard
            key={service.id}
            service={service}
            onClick={() => selectService(service.id)}
          />
        ))}
      </motion.div>
    </motion.div>
  )
}

// ─────────── Sub-Component: Service Dashboard ───────────

function ServiceDashboard({
  hospital,
  service,
}: {
  hospital: Hospital
  service: HospitalService
}) {
  const { selectService, getServiceStats, getActiveDelegations, addDelegation, addTransfer } = useMultiHospitalStore()
  const stats = getServiceStats(hospital.id, service.id)
  const delegations = getActiveDelegations(hospital.id).filter(d => d.serviceId === service.id)
  const occupancy = getBedOccupancyRate(service.occupiedBeds, service.totalBeds || 1)
  const { toast } = useToast()

  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
  const [delegateDialogOpen, setDelegateDialogOpen] = useState(false)
  
  // Transfer dialog state
  const [transferPatientName, setTransferPatientName] = useState('')
  const [transferToServiceId, setTransferToServiceId] = useState('')
  const [transferReason, setTransferReason] = useState('')
  const [transferPriority, setTransferPriority] = useState<'Normal' | 'Urgent' | 'Stat'>('Normal')
  
  // Delegation dialog state
  const [delegatedToName, setDelegatedToName] = useState('')
  const [delegationReason, setDelegationReason] = useState('')
  const [delegationDuration, setDelegationDuration] = useState('1j')

  return (
    <motion.div variants={fadeIn} initial="initial" animate="animate" exit="exit" className="space-y-6">
      {/* En-tête Service */}
      <Card className="overflow-hidden">
        <div className="h-1.5" style={{ backgroundColor: service.color }} />
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 -ml-2"
                  onClick={() => selectService(null)}
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  {hospital.shortName}
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: service.color + '18', color: service.color }}
                >
                  <ServiceIcon name={service.icon} className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{service.name}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Chef de service : {service.headDoctorName}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Badge className={getUrgencyColor(service.urgency)}>
                  <span className={`w-1.5 h-1.5 rounded-full mr-1 ${getUrgencyDotColor(service.urgency)}`} />
                  {service.urgency}
                </Badge>
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {service.phone}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Capacité : {service.dailyCapacity}/jour
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {service.isAutonomous && (
                <Badge className="bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400 text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  Autonome
                </Badge>
              )}
              {delegations.length > 0 && (
                <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 text-xs">
                  <ArrowRightLeft className="w-3 h-3 mr-1" />
                  Délégué
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métriques du Service */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        <StatCard
          title="Patients"
          value={stats.patientCount}
          subtitle={`${stats.admissionCount} admissions`}
          icon={Users}
          color="teal"
        />
        <StatCard
          title="Consultations"
          value={stats.consultationCount}
          subtitle={`${stats.dischargeCount} sorties`}
          icon={Stethoscope}
          color="blue"
        />
        <StatCard
          title="Occupation"
          value={`${stats.bedOccupancyRate}%`}
          subtitle={`${service.occupiedBeds}/${service.totalBeds} lits`}
          icon={Bed}
          color={stats.bedOccupancyRate >= 80 ? 'amber' : 'emerald'}
        />
        <StatCard
          title="Chirurgies"
          value={stats.surgeryCount}
          subtitle={`${stats.emergencyCount} urgences`}
          icon={Scissors}
          color="purple"
        />
      </motion.div>

      {/* Infos détaillées */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Personnel */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              Personnel
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Médecins</span>
              <span className="font-semibold text-slate-900 dark:text-white">{service.doctorsCount}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Infirmiers</span>
              <span className="font-semibold text-slate-900 dark:text-white">{service.nursesCount}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Total</span>
              <span className="font-bold text-slate-900 dark:text-white">{service.staffCount}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-xs">
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <UserCheck className="w-3 h-3" /> Présents
              </span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{stats.staffPresentCount}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                <UserX className="w-3 h-3" /> Absents
              </span>
              <span className="font-semibold text-red-600 dark:text-red-400">{stats.staffAbsentCount}</span>
            </div>
          </CardContent>
        </Card>

        {/* Gestion des Lits */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Bed className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              Gestion des Lits
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {service.totalBeds - service.occupiedBeds}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">lits disponibles</p>
            </div>
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="flex h-full rounded-full">
                <div
                  className={`${getOccupancyColor(occupancy)} transition-all duration-500`}
                  style={{ width: `${occupancy}%` }}
                />
                {occupancy < 100 && (
                  <div
                    className="bg-emerald-400 dark:bg-emerald-600"
                    style={{ width: `${100 - occupancy}%` }}
                  />
                )}
              </div>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-red-600 dark:text-red-400">
                {service.occupiedBeds} occupés
              </span>
              <span className="text-emerald-600 dark:text-emerald-400">
                {service.totalBeds - service.occupiedBeds} libres
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Durée moyenne séjour : {stats.averageStayDuration} jours</span>
            </div>
          </CardContent>
        </Card>

        {/* Indicateur d'Autonomie + Stats */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Shield className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              Autonomie & Activité
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            {service.isAutonomous && (
              <div className="p-2.5 bg-teal-50 dark:bg-teal-950/30 rounded-lg border border-teal-200 dark:border-teal-900">
                <p className="text-xs font-medium text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Ce service fonctionne de manière autonome
                </p>
                <p className="text-[10px] text-teal-600 dark:text-teal-500 mt-1">
                  Le chef de service dispose d'une autorité complète sur les opérations quotidiennes.
                </p>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Transferts</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{stats.transferCount}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Décès</span>
              <span className="font-semibold text-red-600 dark:text-red-400">{stats.deathCount}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Temps attente</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{service.averageWaitTime} min</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Recettes</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(stats.revenue)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Rapides */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          Actions Rapides
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="h-auto py-3 flex-col gap-1.5 border-slate-200 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-700 hover:bg-teal-50 dark:hover:bg-teal-950/30"
              >
                <ArrowRightLeft className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Transférer Patient</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Transférer un Patient</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="text-xs">Patient</Label>
                  <Input
                    placeholder="Nom du patient"
                    className="h-9 text-sm"
                    value={transferPatientName}
                    onChange={(e) => setTransferPatientName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Service de destination</Label>
                  <Select value={transferToServiceId} onValueChange={setTransferToServiceId}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Sélectionner un service" />
                    </SelectTrigger>
                    <SelectContent>
                      {hospital.services
                        .filter(s => s.id !== service.id)
                        .map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Motif du transfert</Label>
                  <Input
                    placeholder="Raison du transfert"
                    className="h-9 text-sm"
                    value={transferReason}
                    onChange={(e) => setTransferReason(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Priorité</Label>
                  <Select value={transferPriority} onValueChange={(v) => setTransferPriority(v as 'Normal' | 'Urgent' | 'Stat')}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Normal">Normal</SelectItem>
                      <SelectItem value="Urgent">Urgent</SelectItem>
                      <SelectItem value="Stat">Stat (immédiat)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  onClick={() => {
                    if (!transferPatientName || !transferToServiceId || !transferReason) {
                      toast({ title: 'Champs requis', description: 'Veuillez remplir tous les champs', variant: 'destructive' })
                      return
                    }
                    const toService = hospital.services.find(s => s.id === transferToServiceId)
                    const result = addTransfer({
                      hospitalId: hospital.id,
                      fromServiceId: service.id,
                      fromServiceName: service.name,
                      toServiceId: transferToServiceId,
                      toServiceName: toService?.name || '',
                      patientId: `PAT-${Date.now()}`,
                      patientName: transferPatientName,
                      reason: transferReason,
                      priority: transferPriority,
                      status: 'En attente',
                    })
                    if (result) {
                      toast({ title: 'Transfert demandé', description: `Transfert de ${transferPatientName} vers ${toService?.name} demandé` })
                      setTransferDialogOpen(false)
                      setTransferPatientName('')
                      setTransferToServiceId('')
                      setTransferReason('')
                      setTransferPriority('Normal')
                    } else {
                      toast({ title: 'Erreur', description: 'Impossible de créer le transfert', variant: 'destructive' })
                    }
                  }}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Demander le Transfert
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={delegateDialogOpen} onOpenChange={setDelegateDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="h-auto py-3 flex-col gap-1.5 border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/30"
              >
                <ArrowRightLeft className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Déléguer Gestion</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Déléguer la Gestion du Service</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="text-xs">Déléguer à (nom)</Label>
                  <Input
                    placeholder="Nom du responsable"
                    className="h-9 text-sm"
                    value={delegatedToName}
                    onChange={(e) => setDelegatedToName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Raison de la délégation</Label>
                  <Input
                    placeholder="Motif de la délégation"
                    className="h-9 text-sm"
                    value={delegationReason}
                    onChange={(e) => setDelegationReason(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Durée</Label>
                  <Select value={delegationDuration} onValueChange={setDelegationDuration}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Durée de la délégation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">1 heure</SelectItem>
                      <SelectItem value="4h">4 heures</SelectItem>
                      <SelectItem value="1j">1 jour</SelectItem>
                      <SelectItem value="1s">1 semaine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => {
                    if (!delegatedToName || !delegationReason) {
                      toast({ title: 'Champs requis', description: 'Veuillez remplir tous les champs', variant: 'destructive' })
                      return
                    }
                    // Calculate expiry based on duration
                    const now = new Date()
                    const durationMs: Record<string, number> = {
                      '1h': 60 * 60 * 1000,
                      '4h': 4 * 60 * 60 * 1000,
                      '1j': 24 * 60 * 60 * 1000,
                      '1s': 7 * 24 * 60 * 60 * 1000,
                    }
                    const expiresAt = new Date(now.getTime() + (durationMs[delegationDuration] || durationMs['1j'])).toISOString()
                    const endDate = new Date(now.getTime() + (durationMs[delegationDuration] || durationMs['1j'])).toISOString()
                    
                    const result = addDelegation({
                      hospitalId: hospital.id,
                      serviceId: service.id,
                      delegatedToUserId: `USR-DEL-${Date.now()}`,
                      delegatedToUserName: delegatedToName,
                      delegatedByUserId: 'USR-001',
                      delegatedByUserName: service.headDoctorName,
                      reason: delegationReason,
                      startDate: now.toISOString(),
                      endDate,
                      expiresAt,
                      status: 'En attente',
                    })
                    if (result) {
                      toast({ title: 'Délégation créée', description: `Gestion déléguée à ${delegatedToName} pour ${delegationDuration === '1h' ? '1 heure' : delegationDuration === '4h' ? '4 heures' : delegationDuration === '1j' ? '1 jour' : '1 semaine'}` })
                      setDelegateDialogOpen(false)
                      setDelegatedToName('')
                      setDelegationReason('')
                      setDelegationDuration('1j')
                    } else {
                      toast({ title: 'Erreur', description: 'Impossible de créer la délégation', variant: 'destructive' })
                    }
                  }}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Confirmer la Délégation
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            className="h-auto py-3 flex-col gap-1.5 border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30"
          >
            <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Rapport du Service</span>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-3 flex-col gap-1.5 border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30"
          >
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Signaler Incident</span>
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

// ─────────── Sub-Component: Cross-Service Manager Panel ───────────

function CrossServiceManager({ hospital }: { hospital: Hospital }) {
  const { getActiveDelegations, revokeDelegation, emergencyTakeover, transfers } = useMultiHospitalStore()
  const delegations = getActiveDelegations(hospital.id)
  const hospitalTransfers = transfers.filter(t => t.hospitalId === hospital.id)
  const [selectedTab, setSelectedTab] = useState('overview')
  const [takeoverServiceId, setTakeoverServiceId] = useState<string | null>(null)
  const [takeoverReason, setTakeoverReason] = useState('')
  const { toast } = useToast()

  const totalBeds = hospital.services.reduce((s, svc) => s + svc.totalBeds, 0)
  const totalOccupied = hospital.services.reduce((s, svc) => s + svc.occupiedBeds, 0)
  const totalStaff = hospital.services.reduce((s, svc) => s + svc.staffCount, 0)
  const totalDoctors = hospital.services.reduce((s, svc) => s + svc.doctorsCount, 0)
  const totalNurses = hospital.services.reduce((s, svc) => s + svc.nursesCount, 0)

  return (
    <motion.div variants={scaleIn} initial="initial" animate="animate" exit="exit">
      <Card className="border-2 border-teal-200 dark:border-teal-900 bg-gradient-to-br from-teal-50/50 to-white dark:from-teal-950/20 dark:to-slate-950">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-teal-800 dark:text-teal-300 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Vue Gestionnaire — {hospital.shortName}
            </CardTitle>
            <Badge className="bg-teal-100 text-teal-700 dark:bg-teal-950/50 dark:text-teal-400 text-[10px]">
              Directeur d'Hôpital
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="bg-slate-100 dark:bg-slate-900 h-8">
              <TabsTrigger value="overview" className="text-xs h-7">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="delegations" className="text-xs h-7">
                Délégations {delegations.length > 0 && `(${delegations.length})`}
              </TabsTrigger>
              <TabsTrigger value="transfers" className="text-xs h-7">Transferts</TabsTrigger>
              <TabsTrigger value="reports" className="text-xs h-7">Rapports</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <div className="space-y-4">
                {/* Résumé consolidé */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{hospital.services.length}</p>
                    <p className="text-[10px] text-slate-500">Services</p>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{totalBeds}</p>
                    <p className="text-[10px] text-slate-500">Lits Total</p>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
                    <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{getBedOccupancyRate(totalOccupied, totalBeds)}%</p>
                    <p className="text-[10px] text-slate-500">Occupation</p>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{totalDoctors}</p>
                    <p className="text-[10px] text-slate-500">Médecins</p>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{totalNurses}</p>
                    <p className="text-[10px] text-slate-500">Infirmiers</p>
                  </div>
                </div>

                {/* Tableau de tous les services */}
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <ScrollArea className="max-h-72">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900/80">
                          <th className="text-left p-2.5 font-semibold text-slate-600 dark:text-slate-400">Service</th>
                          <th className="text-left p-2.5 font-semibold text-slate-600 dark:text-slate-400">Chef</th>
                          <th className="text-center p-2.5 font-semibold text-slate-600 dark:text-slate-400">Lits</th>
                          <th className="text-center p-2.5 font-semibold text-slate-600 dark:text-slate-400">Occupation</th>
                          <th className="text-center p-2.5 font-semibold text-slate-600 dark:text-slate-400">Personnel</th>
                          <th className="text-center p-2.5 font-semibold text-slate-600 dark:text-slate-400">Statut</th>
                          <th className="text-center p-2.5 font-semibold text-slate-600 dark:text-slate-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {hospital.services.map(svc => {
                          const svcOccupancy = getBedOccupancyRate(svc.occupiedBeds, svc.totalBeds || 1)
                          const isDelegated = delegations.some(d => d.serviceId === svc.id)
                          return (
                            <tr key={svc.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                              <td className="p-2.5">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: svc.color }} />
                                  <span className="font-medium text-slate-900 dark:text-white">{svc.name}</span>
                                </div>
                              </td>
                              <td className="p-2.5 text-slate-600 dark:text-slate-400">{svc.headDoctorName}</td>
                              <td className="p-2.5 text-center text-slate-700 dark:text-slate-300">
                                {svc.occupiedBeds}/{svc.totalBeds || '—'}
                              </td>
                              <td className="p-2.5">
                                <div className="flex items-center gap-1.5 justify-center">
                                  <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${getOccupancyColor(svcOccupancy)}`}
                                      style={{ width: `${svcOccupancy}%` }}
                                    />
                                  </div>
                                  <span className={`font-semibold ${svcOccupancy >= 80 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                    {svc.totalBeds > 0 ? `${svcOccupancy}%` : '—'}
                                  </span>
                                </div>
                              </td>
                              <td className="p-2.5 text-center text-slate-700 dark:text-slate-300">{svc.staffCount}</td>
                              <td className="p-2.5 text-center">
                                <Badge className={`text-[10px] ${getUrgencyColor(svc.urgency)}`}>
                                  {svc.urgency}
                                </Badge>
                              </td>
                              <td className="p-2.5 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  {isDelegated && (
                                    <Badge className="text-[9px] bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400">
                                      Délégué
                                    </Badge>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-[10px] text-teal-600 dark:text-teal-400 hover:text-teal-700"
                                    onClick={() => setTakeoverServiceId(svc.id)}
                                  >
                                    Prendre en main
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </ScrollArea>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="delegations" className="mt-4">
              {/* Emergency Takeover Dialog */}
              {takeoverServiceId && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-900 space-y-3">
                  <div className="flex items-center gap-2">
                    <Siren className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-medium text-red-700 dark:text-red-400">
                      Prise en main urgente — {hospital.services.find(s => s.id === takeoverServiceId)?.name}
                    </span>
                  </div>
                  <Input
                    placeholder="Motif de la prise en main urgente"
                    className="h-9 text-sm"
                    value={takeoverReason}
                    onChange={(e) => setTakeoverReason(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white text-xs"
                      onClick={() => {
                        if (!takeoverReason) {
                          toast({ title: 'Motif requis', description: 'Veuillez indiquer le motif de la prise en main', variant: 'destructive' })
                          return
                        }
                        const result = emergencyTakeover(takeoverServiceId, 'USR-DIR', hospital.directorName, takeoverReason)
                        if (result) {
                          toast({ title: 'Prise en main activée', description: `Vous avez pris la direction du service pour 24h` })
                          setTakeoverServiceId(null)
                          setTakeoverReason('')
                        } else {
                          toast({ title: 'Erreur', description: 'Impossible de prendre en main ce service', variant: 'destructive' })
                        }
                      }}
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      Confirmer (24h)
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => { setTakeoverServiceId(null); setTakeoverReason('') }}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              )}
              {delegations.length === 0 && !takeoverServiceId ? (
                <div className="text-center py-8">
                  <Shield className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">Aucune délégation active</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Les délégations de gestion de service apparaîtront ici
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {delegations.map(d => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {hospital.services.find(s => s.id === d.serviceId)?.name || d.serviceId}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Délégué à {d.delegatedToUserName} par {d.delegatedByUserName}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                          Motif : {d.reason}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/30"
                        onClick={() => {
                          revokeDelegation(d.id, 'USR-DIR', hospital.directorName)
                          toast({ title: 'Délégation révoquée', description: `Délégation sur le service ${hospital.services.find(s => s.id === d.serviceId)?.name || ''} révoquée` })
                        }}
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Révoquer
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="transfers" className="mt-4">
              {hospitalTransfers.length === 0 ? (
                <div className="text-center py-8">
                  <ArrowRightLeft className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">Aucun transfert inter-service en cours</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Les demandes de transfert entre services seront visibles ici
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {hospitalTransfers.map(t => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {t.patientName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {t.fromServiceName} → {t.toServiceName}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                          Motif : {t.reason}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-[10px] ${
                          t.status === 'En attente' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' :
                          t.status === 'Accepté' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' :
                          t.status === 'Refusé' ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' :
                          'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {t.status}
                        </Badge>
                        <Badge className="text-[9px] bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400">
                          {t.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="reports" className="mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Card className="border-slate-200 dark:border-slate-800">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Rapport Journalier</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Synthèse de l'activité du jour</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-slate-200 dark:border-slate-800">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Rapport Hebdomadaire</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Tendances et analyses</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-slate-200 dark:border-slate-800">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Rapport d'Occupation</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Taux d'occupation par service</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-slate-200 dark:border-slate-800">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                      <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Rapport Personnel</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Présence et affectations</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─────────── Main Component: Multi-Hospital Dashboard ───────────

export function MultiHospitalDashboard() {
  const {
    hospitals,
    selectedHospitalId,
    selectedServiceId,
    selectHospital,
    selectService,
    getSelectedHospital,
    getSelectedService,
  } = useMultiHospitalStore()

  const selectedHospital = getSelectedHospital()
  const selectedService = getSelectedService()

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Sélecteur d'Hôpital */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-md shadow-teal-500/20 flex items-center justify-center">
            <Building2 className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">HealthFlow Guinea</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Plateforme Multi-Hôpitaux</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={selectedHospitalId || '__none__'}
            onValueChange={(v) => {
              if (v === '__none__') {
                selectHospital(null)
              } else {
                selectHospital(v)
              }
            }}
          >
            <SelectTrigger className="w-[280px] h-9 text-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <Building2 className="w-4 h-4 mr-2 text-teal-600 dark:text-teal-400" />
              <SelectValue placeholder="Sélectionner un hôpital..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">
                <span className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-teal-600" />
                  Vue Nationale (tous les hôpitaux)
                </span>
              </SelectItem>
              {hospitals.map(h => (
                <SelectItem key={h.id} value={h.id}>
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: h.color }} />
                    {h.shortName}
                    <span className="text-slate-400">({h.type})</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Fil d'Ariane */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <button
          onClick={() => selectHospital(null)}
          className={`hover:text-teal-600 dark:hover:text-teal-400 transition-colors ${!selectedHospital ? 'font-semibold text-teal-600 dark:text-teal-400' : ''}`}
        >
          Vue Nationale
        </button>
        {selectedHospital && (
          <>
            <ChevronDown className="w-3 h-3 -rotate-90" />
            <button
              onClick={() => selectService(null)}
              className={`hover:text-teal-600 dark:hover:text-teal-400 transition-colors ${selectedHospital && !selectedService ? 'font-semibold text-teal-600 dark:text-teal-400' : ''}`}
            >
              {selectedHospital.shortName}
            </button>
          </>
        )}
        {selectedService && selectedHospital && (
          <>
            <ChevronDown className="w-3 h-3 -rotate-90" />
            <span className="font-semibold text-teal-600 dark:text-teal-400">
              {selectedService.name}
            </span>
          </>
        )}
      </div>

      <Separator />

      {/* Contenu Principal */}
      <AnimatePresence mode="wait">
        {!selectedHospital ? (
          <NationalOverview key="national" />
        ) : !selectedService ? (
          <HospitalDashboard key={selectedHospital.id} hospital={selectedHospital} />
        ) : (
          <ServiceDashboard key={selectedService.id} hospital={selectedHospital} service={selectedService} />
        )}
      </AnimatePresence>
    </div>
  )
}

export default MultiHospitalDashboard
