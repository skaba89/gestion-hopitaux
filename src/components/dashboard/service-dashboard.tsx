'use client'

import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users, BedDouble, AlertTriangle, Activity, TrendingUp, TrendingDown,
  ArrowRightLeft, Shield, Clock, Heart, Stethoscope, DollarSign,
  ArrowLeft, CheckCircle2, Siren, Scissors, Baby, Brain, Droplets,
  Wind, Pill, FlaskConical, Eye, ShieldAlert, UserCheck, UserX,
  Phone, FileText, HandMetal, Zap,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useMultiHospitalStore } from '@/lib/hospital-store'
import {
  type Hospital, type HospitalService, type GuineaRegion,
  REGION_LABELS, getBedOccupancyRate, getServiceUrgency,
} from '@/lib/hospital-model'
import { KPICard, kpiPresets } from './shared/kpi-card'
import { TransferTracker } from './shared/transfer-tracker'
import { DelegationPanel } from './shared/delegation-panel'
import {
  seededInt, seededFloat, formatNumber, formatCurrency,
  generateWeeklyData,
} from './shared/seed-utils'

interface ServiceDashboardProps {
  hospitalId: string
  serviceId: string
}

const SERVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  AlertTriangle, Heart, Scissors, Baby, Activity, Brain, Droplets,
  Wind, Pill, FlaskConical, Eye, ShieldAlert, Shield, Stethoscope,
}

function ServiceIcon({ name, className }: { name: string; className?: string }) {
  const IconComponent = SERVICE_ICONS[name] || Activity
  return <IconComponent className={className} />
}

function getUrgencyColor(urgency: string): string {
  switch (urgency) {
    case 'Critique': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900'
    case 'Surchargé': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900'
    default: return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900'
  }
}

function getUrgencyDotColor(urgency: string): string {
  switch (urgency) {
    case 'Critique': return 'bg-red-500'
    case 'Surchargé': return 'bg-amber-500'
    default: return 'bg-emerald-500'
  }
}

export function ServiceDashboard({ hospitalId, serviceId }: ServiceDashboardProps) {
  const { hospitals, selectService, selectHospital, getServiceStats, getActiveDelegations, addTransfer, addDelegation } = useMultiHospitalStore()
  const hospital = hospitals.find(h => h.id === hospitalId)
  const service = hospital?.services.find(s => s.id === serviceId)

  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
  const [delegateDialogOpen, setDelegateDialogOpen] = useState(false)
  const [incidentDialogOpen, setIncidentDialogOpen] = useState(false)

  const [transferForm, setTransferForm] = useState({
    toServiceId: '',
    patientName: '',
    reason: '',
    priority: 'Normal' as 'Normal' | 'Urgent' | 'Stat',
  })

  const [delegateForm, setDelegateForm] = useState({
    delegateName: '',
    reason: '',
  })

  const [incidentForm, setIncidentForm] = useState({
    type: '',
    description: '',
    severity: 'Modéré' as 'Mineur' | 'Modéré' | 'Grave',
  })

  const stats = hospital && service ? getServiceStats(hospital.id, service.id) : { consultationCount: 0, totalAdmissions: 0, totalDischarges: 0, totalEmergencies: 0, totalDeaths: 0, bedOccupancyRate: 0, staffPresentCount: 0, staffAbsentCount: 0, patientCount: 0, admissionCount: 0, dischargeCount: 0, surgeryCount: 0, emergencyCount: 0, deathCount: 0, transferCount: 0, averageStayDuration: 0, revenue: 0, expenses: 0 }
  const delegations = hospital ? getActiveDelegations(hospital.id).filter(d => d.serviceId === serviceId) : []
  const occupancy = service ? getBedOccupancyRate(service.occupiedBeds, service.totalBeds || 1) : 0

  // Deterministic budget data
  const budget = service ? seededInt(service.id, 5_000_000, 30_000_000, 500) : 0
  const actualSpending = service ? seededInt(service.id, 3_000_000, 25_000_000, 501) : 0
  const budgetUsage = budget > 0 ? Math.round((actualSpending / budget) * 100) : 0

  // Weekly trend data
  const weeklyConsultations = generateWeeklyData(`${serviceId}-consultations`, stats.consultationCount, 0.2)

  // Bed occupancy visual
  const bedVisual = useMemo(() => {
    const totalBeds = service?.totalBeds || 0
    const occupiedBeds = service?.occupiedBeds || 0
    const beds: { id: number; occupied: boolean }[] = []
    for (let i = 0; i < totalBeds; i++) {
      beds.push({ id: i + 1, occupied: i < occupiedBeds })
    }
    return beds
  }, [service?.totalBeds, service?.occupiedBeds])

  // Staff distribution
  const staffData = service ? [
    { name: 'Médecins', value: service.doctorsCount, color: '#0d9488' },
    { name: 'Infirmiers', value: service.nursesCount, color: '#7c3aed' },
    { name: 'Autres', value: Math.max(0, service.staffCount - service.doctorsCount - service.nursesCount), color: '#f59e0b' },
  ].filter(d => d.value > 0) : []

  // Patient list (deterministic from service data)
  const patientList = useMemo(() => {
    const occupiedBeds = service?.occupiedBeds || 0
    const guineanNames = [
      'Mamadou Diallo', 'Fatoumata Bâ', 'Ibrahima Camara', 'Aissatou Sylla',
      'Ousmane Touré', 'Kadiatou Bah', 'Alpha Condé', 'Mariama Sangaré',
      'Souleymane Sow', 'Aminata Kouyaté', 'Lamine Traoré', 'Djenabou Baldé',
      'Moussa Cissé', 'Hawa Diabaté', 'Abdoulaye Doumbouya',
    ]
    return Array.from({ length: Math.min(occupiedBeds, 15) }, (_, i) => ({
      id: `PAT-${serviceId}-${i + 1}`,
      name: guineanNames[i % guineanNames.length],
      bed: i + 1,
      daysSinceAdmission: seededInt(`${serviceId}-patient-${i}`, 1, 14, 600),
      status: i === 0 ? 'Critique' : i < 3 ? 'Sous observation' : 'Stable',
    }))
  }, [serviceId, service?.occupiedBeds])

  if (!hospital || !service) {
    return (
      <div className="p-6 text-center text-slate-500 dark:text-slate-400">
        <Activity className="size-12 mx-auto mb-3 opacity-40" />
        <p>Service non trouvé</p>
        <Button variant="outline" className="mt-4" onClick={() => selectService(null)}>
          Retour à l&apos;hôpital
        </Button>
      </div>
    )
  }

  const handleTransfer = () => {
    if (!transferForm.toServiceId || !transferForm.patientName) return
    const toService = hospital.services.find(s => s.id === transferForm.toServiceId)
    addTransfer({
      hospitalId,
      fromServiceId: serviceId,
      fromServiceName: service.name,
      toServiceId: transferForm.toServiceId,
      toServiceName: toService?.name || '',
      patientId: `PAT-${Date.now()}`,
      patientName: transferForm.patientName,
      reason: transferForm.reason,
      priority: transferForm.priority,
      status: 'En attente',
    })
    setTransferForm({ toServiceId: '', patientName: '', reason: '', priority: 'Normal' })
    setTransferDialogOpen(false)
  }

  const handleDelegate = () => {
    if (!delegateForm.delegateName) return
    addDelegation({
      hospitalId,
      serviceId,
      delegatedToUserId: `USR-${Date.now()}`,
      delegatedToUserName: delegateForm.delegateName,
      delegatedByUserId: 'current-user',
      delegatedByUserName: 'Chef de Service',
      reason: delegateForm.reason || `Délégation du service ${service.name}`,
      startDate: new Date().toISOString(),
      status: 'Active',
    })
    setDelegateForm({ delegateName: '', reason: '' })
    setDelegateDialogOpen(false)
  }

  const handleIncident = () => {
    // Log incident (in a real system this would be an API call)
    setIncidentForm({ type: '', description: '', severity: 'Modéré' })
    setIncidentDialogOpen(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto"
    >
      {/* Service Header */}
      <Card className="overflow-hidden rounded-xl">
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
                  <ArrowLeft className="size-4 mr-1" />
                  {hospital.shortName}
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="size-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: service.color + '18', color: service.color }}
                >
                  <ServiceIcon name={service.icon} className="size-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{service.name}</h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Chef de service : {service.headDoctorName}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Badge className={`${getUrgencyColor(service.urgency)}`}>
                  <span className={`size-1.5 rounded-full mr-1 ${getUrgencyDotColor(service.urgency)}`} />
                  {service.urgency}
                </Badge>
                <span className="flex items-center gap-1"><Phone className="size-3" />{service.phone}</span>
                <span className="flex items-center gap-1"><Clock className="size-3" />Capacité: {service.dailyCapacity}/jour</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {service.isAutonomous && (
                <Badge className="bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400 text-xs">
                  <Shield className="size-3 mr-1" />
                  Autonome
                </Badge>
              )}
              {delegations.length > 0 && (
                <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 text-xs">
                  <ArrowRightLeft className="size-3 mr-1" />
                  Délégué
                </Badge>
              )}
              <Badge className="bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400 text-xs">
                Chef de Service
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard
          title="Patients"
          value={stats.patientCount}
          subtitle={`${stats.admissionCount} admissions`}
          icon={Users}
          trend="+5%"
          trendUp={true}
          {...kpiPresets.clinical}
          delay={0}
        />
        <KPICard
          title="Consultations"
          value={stats.consultationCount}
          subtitle={`${stats.dischargeCount} sorties`}
          icon={Stethoscope}
          trend="+3%"
          trendUp={true}
          {...kpiPresets.management}
          delay={0.05}
        />
        <KPICard
          title="Occupation"
          value={`${stats.bedOccupancyRate}%`}
          subtitle={`${service.occupiedBeds}/${service.totalBeds} lits`}
          icon={BedDouble}
          trend={stats.bedOccupancyRate >= 80 ? '+surchargé' : '-normal'}
          trendUp={stats.bedOccupancyRate < 80}
          {...kpiPresets.occupancy}
          delay={0.1}
        />
        <KPICard
          title="Temps attente"
          value={`${service.averageWaitTime} min`}
          subtitle="moyenne aujourd'hui"
          icon={Clock}
          trend={service.averageWaitTime > 30 ? '+long' : '-ok'}
          trendUp={service.averageWaitTime <= 30}
          {...kpiPresets.alert}
          delay={0.15}
        />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button className="h-9 text-xs bg-teal-600 hover:bg-teal-700" onClick={() => setTransferDialogOpen(true)}>
          <ArrowRightLeft className="size-3.5 mr-1.5" />
          Transférer patient
        </Button>
        <Button className="h-9 text-xs bg-purple-600 hover:bg-purple-700" onClick={() => setDelegateDialogOpen(true)}>
          <HandMetal className="size-3.5 mr-1.5" />
          Demander délégation
        </Button>
        <Button className="h-9 text-xs bg-amber-600 hover:bg-amber-700" onClick={() => setIncidentDialogOpen(true)}>
          <AlertTriangle className="size-3.5 mr-1.5" />
          Signaler incident
        </Button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Patient List */}
        <Card className="border-slate-200/60 dark:border-slate-800/60 rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="size-4 text-teal-600 dark:text-teal-400" />
              Patients du service
            </CardTitle>
            <CardDescription className="text-xs">
              {patientList.length} patient{patientList.length > 1 ? 's' : ''} hospitalisé{patientList.length > 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
              {patientList.map((patient, i) => (
                <motion.div
                  key={patient.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="p-2.5 rounded-lg bg-slate-50/80 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{patient.name}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span>Lit {patient.bed}</span>
                        <span>•</span>
                        <span>{patient.daysSinceAdmission}j</span>
                      </div>
                    </div>
                    <Badge className={`text-[9px] px-1.5 ${patient.status === 'Critique' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800' : patient.status === 'Sous observation' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800' : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'}`}>
                      {patient.status}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bed Occupancy Visual */}
        <Card className="border-slate-200/60 dark:border-slate-800/60 rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <BedDouble className="size-4 text-teal-600 dark:text-teal-400" />
              Plan des lits
            </CardTitle>
            <CardDescription className="text-xs">
              {service.totalBeds - service.occupiedBeds} lits disponibles sur {service.totalBeds}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Visual bed grid */}
            <div className="grid grid-cols-5 gap-1.5 mb-4">
              {bedVisual.map((bed) => (
                <div
                  key={bed.id}
                  className={`aspect-square rounded-md flex items-center justify-center text-[9px] font-bold transition-all duration-200 ${
                    bed.occupied
                      ? 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800'
                      : 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                  }`}
                  title={`Lit ${bed.id}: ${bed.occupied ? 'Occupé' : 'Disponible'}`}
                >
                  {bed.id}
                </div>
              ))}
            </div>

            {/* Summary bar */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1"><span className="size-2.5 rounded-sm bg-red-500 inline-block" /> Occupé</span>
                <span className="flex items-center gap-1"><span className="size-2.5 rounded-sm bg-emerald-500 inline-block" /> Libre</span>
              </div>
              <div className="flex h-4 rounded-full overflow-hidden">
                <div className="bg-red-500 transition-all duration-500" style={{ width: `${occupancy}%` }} />
                <div className="bg-emerald-500 transition-all duration-500" style={{ width: `${100 - occupancy}%` }} />
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-red-600 dark:text-red-400 font-medium">{service.occupiedBeds} occupés</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">{service.totalBeds - service.occupiedBeds} libres</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Durée moyenne séjour : {stats.averageStayDuration} jours
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Staff + Autonomy + Budget */}
        <div className="space-y-4">
          {/* Staff on duty */}
          <Card className="border-slate-200/60 dark:border-slate-800/60 rounded-xl">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Users className="size-4 text-teal-600 dark:text-teal-400" />
                Personnel en service
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="flex items-center justify-center mb-3">
                <div className="h-[120px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={staffData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={4} dataKey="value">
                        {staffData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Médecins</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{service.doctorsCount}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Infirmiers</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{service.nursesCount}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-xs">
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <UserCheck className="size-3" /> Présents
                  </span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{stats.staffPresentCount}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                    <UserX className="size-3" /> Absents
                  </span>
                  <span className="font-semibold text-red-600 dark:text-red-400">{stats.staffAbsentCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Autonomy Indicator */}
          <Card className="border-slate-200/60 dark:border-slate-800/60 rounded-xl">
            <CardContent className="p-4">
              {service.isAutonomous ? (
                <div className="p-3 bg-teal-50 dark:bg-teal-950/30 rounded-lg border border-teal-200 dark:border-teal-900">
                  <p className="text-xs font-medium text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
                    <CheckCircle2 className="size-4" />
                    Service autonome
                  </p>
                  <p className="text-[10px] text-teal-600 dark:text-teal-500 mt-1">
                    Le chef de service dispose d&apos;une autorité complète sur les opérations quotidiennes, le budget et les ressources.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-900">
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <Shield className="size-4" />
                    Service supervisé
                  </p>
                  <p className="text-[10px] text-amber-600 dark:text-amber-500 mt-1">
                    Ce service dépend de la direction de l&apos;établissement pour les décisions majeures.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Budget vs Actual */}
          <Card className="border-slate-200/60 dark:border-slate-800/60 rounded-xl">
            <CardContent className="p-4 space-y-2">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <DollarSign className="size-4 text-emerald-600 dark:text-emerald-400" />
                Budget vs Dépenses
              </p>
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Budget: {formatCurrency(budget)}</span>
                <span>Dépenses: {formatCurrency(actualSpending)}</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${budgetUsage > 90 ? 'bg-red-500' : budgetUsage > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(budgetUsage, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs">
                <span className={`${budgetUsage > 90 ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'}`}>
                  Utilisation: {budgetUsage}%
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Reste: {formatCurrency(budget - actualSpending)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Weekly Trend + Transfers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-slate-200/60 dark:border-slate-800/60 rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="size-4 text-teal-600 dark:text-teal-400" />
              Consultations cette semaine
            </CardTitle>
            <CardDescription className="text-xs">Évolution quotidienne</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyConsultations} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="svcBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" />
                      <stop offset="95%" stopColor="#0d9488" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="cetteSemaine" fill="url(#svcBarGrad)" radius={[6, 6, 0, 0]} maxBarSize={40} name="Cette semaine" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <TransferTracker hospitalId={hospitalId} services={hospital.services} showCreate={true} />
      </div>

      {/* Transfer Patient Dialog */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transférer un patient</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Service de destination</Label>
              <Select value={transferForm.toServiceId} onValueChange={(v) => setTransferForm(s => ({ ...s, toServiceId: v }))}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Choisir le service" />
                </SelectTrigger>
                <SelectContent>
                  {hospital.services.filter(s => s.id !== serviceId).map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Nom du patient</Label>
              <Input
                value={transferForm.patientName}
                onChange={(e) => setTransferForm(s => ({ ...s, patientName: e.target.value }))}
                placeholder="Nom complet"
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Motif</Label>
              <Input
                value={transferForm.reason}
                onChange={(e) => setTransferForm(s => ({ ...s, reason: e.target.value }))}
                placeholder="Raison du transfert"
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Priorité</Label>
              <Select value={transferForm.priority} onValueChange={(v) => setTransferForm(s => ({ ...s, priority: v as 'Normal' | 'Urgent' | 'Stat' }))}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                  <SelectItem value="Stat">Stat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setTransferDialogOpen(false)}>Annuler</Button>
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700" onClick={handleTransfer}>Transférer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delegate Dialog */}
      <Dialog open={delegateDialogOpen} onOpenChange={setDelegateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Demander une délégation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900 rounded-lg">
              <p className="text-xs text-teal-700 dark:text-teal-400">
                <Shield className="size-3.5 inline mr-1" />
                Vous demandez la délégation du service <strong>{service.name}</strong>
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Déléguer à</Label>
              <Input
                value={delegateForm.delegateName}
                onChange={(e) => setDelegateForm(s => ({ ...s, delegateName: e.target.value }))}
                placeholder="Nom du gestionnaire"
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Raison</Label>
              <Input
                value={delegateForm.reason}
                onChange={(e) => setDelegateForm(s => ({ ...s, reason: e.target.value }))}
                placeholder="Motif de la délégation"
                className="h-9 text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDelegateDialogOpen(false)}>Annuler</Button>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={handleDelegate}>Confirmer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Incident Dialog */}
      <Dialog open={incidentDialogOpen} onOpenChange={setIncidentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Signaler un incident</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Type d&apos;incident</Label>
              <Select value={incidentForm.type} onValueChange={(v) => setIncidentForm(s => ({ ...s, type: v }))}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Choisir le type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medical">Événement médical</SelectItem>
                  <SelectItem value="chute">Chute de patient</SelectItem>
                  <SelectItem value="infection">Infection nosocomiale</SelectItem>
                  <SelectItem value="medication">Erreur médicamenteuse</SelectItem>
                  <SelectItem value="equipment">Défaillance équipement</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Sévérité</Label>
              <Select value={incidentForm.severity} onValueChange={(v) => setIncidentForm(s => ({ ...s, severity: v as 'Mineur' | 'Modéré' | 'Grave' }))}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mineur">Mineur</SelectItem>
                  <SelectItem value="Modéré">Modéré</SelectItem>
                  <SelectItem value="Grave">Grave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Description</Label>
              <Input
                value={incidentForm.description}
                onChange={(e) => setIncidentForm(s => ({ ...s, description: e.target.value }))}
                placeholder="Décrire l'incident"
                className="h-9 text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIncidentDialogOpen(false)}>Annuler</Button>
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700" onClick={handleIncident}>Signaler</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
      `}</style>
    </motion.div>
  )
}
