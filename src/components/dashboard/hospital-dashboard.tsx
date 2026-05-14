'use client'

import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2, Users, BedDouble, AlertTriangle, Activity,
  TrendingUp, TrendingDown, ArrowRightLeft, Shield, Clock,
  Heart, Siren, Stethoscope, DollarSign, Pill, FlaskConical,
  ArrowLeft, HandMetal, CheckCircle2, Scissors, Baby, Brain,
  Droplets, Wind, Eye, ShieldAlert, UserCheck, Star, MapPin,
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useMultiHospitalStore } from '@/lib/hospital-store'
import {
  type Hospital, type HospitalService, type GuineaRegion,
  REGION_LABELS, getBedOccupancyRate, getServiceUrgency,
} from '@/lib/hospital-model'
import { KPICard, kpiPresets } from './shared/kpi-card'
import { OccupancyChart } from './shared/occupancy-chart'
import { TransferTracker } from './shared/transfer-tracker'
import { DelegationPanel } from './shared/delegation-panel'
import {
  seededInt, seededFloat, formatNumber, formatCurrency,
  generateWeeklyData, CRITICAL_MEDICATIONS,
} from './shared/seed-utils'

interface HospitalDashboardProps {
  hospitalId: string
}

function getUrgencyColor(urgency: string): string {
  switch (urgency) {
    case 'Critique': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900'
    case 'Surchargé': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900'
    default: return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900'
  }
}

function getOccupancyBarColor(rate: number): string {
  if (rate >= 95) return 'bg-red-500'
  if (rate >= 80) return 'bg-amber-500'
  if (rate >= 60) return 'bg-teal-500'
  return 'bg-emerald-500'
}

const SERVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  AlertTriangle, Heart, Scissors, Baby, Activity, Brain, Droplets,
  Wind, Pill, FlaskConical, Eye, ShieldAlert, Shield, Stethoscope,
}

function ServiceIcon({ name, className }: { name: string; className?: string }) {
  const IconComponent = SERVICE_ICONS[name] || Activity
  return <IconComponent className={className} />
}

export function HospitalDashboard({ hospitalId }: HospitalDashboardProps) {
  const { hospitals, selectHospital, selectService, getHospitalStats, getActiveDelegations } = useMultiHospitalStore()
  const hospital = hospitals.find(h => h.id === hospitalId)
  const [showManager, setShowManager] = useState(false)
  const [activeTab, setActiveTab] = useState('services')

  if (!hospital) {
    return (
      <div className="p-6 text-center text-slate-500 dark:text-slate-400">
        <Building2 className="size-12 mx-auto mb-3 opacity-40" />
        <p>Hôpital non trouvé</p>
        <Button variant="outline" className="mt-4" onClick={() => selectHospital(null)}>
          Retour à la vue nationale
        </Button>
      </div>
    )
  }

  const stats = getHospitalStats(hospital.id)
  const delegations = getActiveDelegations(hospital.id)
  const occupancy = getBedOccupancyRate(hospital.occupiedBeds, hospital.totalBeds)
  const criticalServices = hospital.services.filter(s => s.urgency === 'Critique').length
  const overloadedServices = hospital.services.filter(s => s.urgency === 'Surchargé').length
  const totalStaff = hospital.services.reduce((s, svc) => s + svc.staffCount, 0)

  // Deterministic financial data
  const revenue = seededInt(hospital.id, 20_000_000, 80_000_000, 100)
  const expenses = seededInt(hospital.id, 15_000_000, 60_000_000, 101)
  const pendingPayments = seededInt(hospital.id, 3_000_000, 15_000_000, 102)

  // Weekly trend data
  const weeklyAdmissions = generateWeeklyData(`${hospitalId}-admissions`, stats.totalAdmissions)
  const weeklyDischarges = generateWeeklyData(`${hospitalId}-discharges`, stats.totalDischarges, 0.15)
  const weeklyRevenue = generateWeeklyData(`${hospitalId}-revenue`, revenue / 4)

  // Stock alerts for this hospital
  const hospitalStockAlerts = CRITICAL_MEDICATIONS.map(med => ({
    ...med,
    stock: seededInt(`${hospitalId}-${med.name}`, Math.floor(med.max * 0.05), Math.floor(med.max * 0.35), 400),
  }))

  // Occupancy data by service
  const serviceOccupancyData = hospital.services
    .filter(s => s.totalBeds > 0)
    .map(s => ({
      name: s.name.length > 12 ? s.name.substring(0, 12) + '.' : s.name,
      occupancy: getBedOccupancyRate(s.occupiedBeds, s.totalBeds),
      totalBeds: s.totalBeds,
      occupiedBeds: s.occupiedBeds,
    }))

  // Bed management table
  const bedManagementData = hospital.services.filter(s => s.totalBeds > 0).map(s => ({
    service: s.name,
    total: s.totalBeds,
    occupied: s.occupiedBeds,
    available: s.totalBeds - s.occupiedBeds,
    occupancy: getBedOccupancyRate(s.occupiedBeds, s.totalBeds),
    urgency: s.urgency,
    headDoctor: s.headDoctorName,
  }))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto"
    >
      {/* Header */}
      <div className="relative">
        <div className="h-2 rounded-t-xl" style={{ backgroundColor: hospital.color }} />
        <Card className="rounded-t-none border-t-0 rounded-xl">
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
                    <ArrowLeft className="size-4 mr-1" />
                    Retour
                  </Button>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{hospital.name}</h1>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Badge variant="outline" className="text-[10px] bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800">
                    {hospital.type}
                  </Badge>
                  <span className="flex items-center gap-1"><MapPin className="size-3" />{REGION_LABELS[hospital.region as GuineaRegion]}</span>
                  <span className="flex items-center gap-1"><UserCheck className="size-3" />{hospital.directorName}</span>
                  <span className="flex items-center gap-1"><Star className="size-3" />{hospital.accreditationLevel}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {criticalServices > 0 && (
                  <Badge className="bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 text-xs">
                    <AlertTriangle className="size-3 mr-1" />{criticalServices} critique{criticalServices > 1 ? 's' : ''}
                  </Badge>
                )}
                {delegations.length > 0 && (
                  <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 text-xs">
                    <ArrowRightLeft className="size-3 mr-1" />{delegations.length} délégation{delegations.length > 1 ? 's' : ''}
                  </Badge>
                )}
                <Badge className="bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400 text-xs">
                  Directeur Hôpital
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hospital KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard
          title="Occupation"
          value={`${occupancy}%`}
          subtitle={`${hospital.occupiedBeds}/${hospital.totalBeds} lits`}
          icon={BedDouble}
          trend={occupancy >= 80 ? '+surchargé' : '-normal'}
          trendUp={occupancy < 80}
          {...kpiPresets.occupancy}
          delay={0}
        />
        <KPICard
          title="Patients"
          value={stats.totalPatients}
          subtitle={`${stats.totalAdmissions} admissions`}
          icon={Users}
          trend="+8%"
          trendUp={true}
          {...kpiPresets.clinical}
          delay={0.05}
        />
        <KPICard
          title="Consultations"
          value={stats.totalConsultations}
          subtitle={`${stats.totalSurgeries} chirurgies`}
          icon={Stethoscope}
          trend="+5%"
          trendUp={true}
          {...kpiPresets.management}
          delay={0.1}
        />
        <KPICard
          title="Urgences"
          value={stats.totalEmergencies}
          subtitle={`${stats.totalDeaths} décès`}
          icon={Siren}
          trend={stats.totalEmergencies > 15 ? '+alerte' : '-stable'}
          trendUp={stats.totalEmergencies <= 15}
          {...kpiPresets.critical}
          delay={0.15}
        />
      </div>

      {/* Additional stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-slate-200 dark:border-slate-800 rounded-xl">
          <CardContent className="p-3 flex items-center gap-2">
            <UserCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Personnels présents</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{stats.staffPresentCount}/{stats.staffPresentCount + stats.staffAbsentCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-800 rounded-xl">
          <CardContent className="p-3 flex items-center gap-2">
            <Clock className="size-4 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Temps attente moyen</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{stats.averageWaitTime} min</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-800 rounded-xl">
          <CardContent className="p-3 flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Services sous tension</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{overloadedServices + criticalServices}/{hospital.services.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-800 rounded-xl">
          <CardContent className="p-3 flex items-center gap-2">
            <Heart className="size-4 text-rose-600 dark:text-rose-400" />
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Satisfaction</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{stats.satisfactionRate}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="services" className="text-xs">Services</TabsTrigger>
          <TabsTrigger value="financial" className="text-xs">Finances</TabsTrigger>
          <TabsTrigger value="beds" className="text-xs">Lits</TabsTrigger>
          <TabsTrigger value="delegations" className="text-xs">Délégations</TabsTrigger>
          <TabsTrigger value="transfers" className="text-xs">Transferts</TabsTrigger>
          <TabsTrigger value="stock" className="text-xs">Stocks</TabsTrigger>
        </TabsList>

        {/* Services Tab */}
        <TabsContent value="services" className="mt-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Stethoscope className="size-4 text-teal-600 dark:text-teal-400" />
              Services de l&apos;établissement ({hospital.services.length})
            </h3>
            <Button
              onClick={() => setShowManager(!showManager)}
              className={`h-8 text-xs ${showManager
                ? 'bg-teal-600 hover:bg-teal-700 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              <Shield className="size-3.5 mr-1.5" />
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
                <DelegationPanel hospitalId={hospital.id} services={hospital.services} />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {hospital.services.map((service, i) => {
              const svcOccupancy = getBedOccupancyRate(service.occupiedBeds, service.totalBeds || 1)
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card
                    className="cursor-pointer border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all duration-200 rounded-xl overflow-hidden"
                    onClick={() => selectService(service.id)}
                  >
                    <div className="h-1" style={{ backgroundColor: service.color }} />
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="size-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: service.color + '18', color: service.color }}>
                            <ServiceIcon name={service.icon} className="size-4.5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{service.name}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{service.headDoctorName}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge className={`text-[10px] ${getUrgencyColor(service.urgency)}`}>
                            {service.urgency}
                          </Badge>
                          {service.isAutonomous && (
                            <span className="text-[9px] text-teal-600 dark:text-teal-400 flex items-center gap-0.5 font-medium">
                              <Shield className="size-2.5" />
                              Autonome
                            </span>
                          )}
                        </div>
                      </div>

                      {service.totalBeds > 0 && (
                        <div className="space-y-1.5 mb-3">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500 dark:text-slate-400">Occupation</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{svcOccupancy}%</span>
                          </div>
                          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${getOccupancyBarColor(svcOccupancy)}`} style={{ width: `${svcOccupancy}%` }} />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1"><Users className="size-3" />{service.staffCount}</span>
                        <span className="flex items-center gap-1"><Stethoscope className="size-3" />{service.doctorsCount} médecins</span>
                        <span className="flex items-center gap-1"><Clock className="size-3" />{service.averageWaitTime} min</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KPICard
              title="Revenus ce mois"
              value={formatCurrency(revenue)}
              icon={TrendingUp}
              trend="+8.5%"
              trendUp={true}
              {...kpiPresets.financial}
            />
            <KPICard
              title="Dépenses"
              value={formatCurrency(expenses)}
              icon={TrendingDown}
              trend="+3.2%"
              trendUp={false}
              {...kpiPresets.alert}
            />
            <KPICard
              title="Paiements en attente"
              value={formatCurrency(pendingPayments)}
              icon={DollarSign}
              {...kpiPresets.critical}
            />
          </div>
          <Card className="border-slate-200/60 dark:border-slate-800/60 rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
                Tendance des revenus
              </CardTitle>
              <CardDescription className="text-xs">Évolution hebdomadaire</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyRevenue} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="hospRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Area type="monotone" dataKey="cetteSemaine" stroke="#10b981" strokeWidth={2.5} fill="url(#hospRevenueGrad)" name="Cette semaine" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Beds Tab */}
        <TabsContent value="beds" className="mt-4 space-y-4">
          <OccupancyChart
            data={serviceOccupancyData}
            title={`Gestion des lits — ${hospital.shortName}`}
            description="Taux d'occupation par service"
          />
          <Card className="border-slate-200/60 dark:border-slate-800/60 rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
                Plan de lits détaillé
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Service</TableHead>
                      <TableHead className="text-xs text-center">Total</TableHead>
                      <TableHead className="text-xs text-center">Occupés</TableHead>
                      <TableHead className="text-xs text-center">Disponibles</TableHead>
                      <TableHead className="text-xs text-center">Taux</TableHead>
                      <TableHead className="text-xs">Médecin chef</TableHead>
                      <TableHead className="text-xs">Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bedManagementData.map(row => (
                      <TableRow key={row.service} className="cursor-pointer hover:bg-teal-50/50 dark:hover:bg-teal-950/20" onClick={() => {
                        const svc = hospital.services.find(s => s.name === row.service)
                        if (svc) selectService(svc.id)
                      }}>
                        <TableCell className="text-xs font-medium text-slate-900 dark:text-white py-2">{row.service}</TableCell>
                        <TableCell className="text-xs text-center py-2">{row.total}</TableCell>
                        <TableCell className="text-xs text-center py-2">{row.occupied}</TableCell>
                        <TableCell className="text-xs text-center py-2">
                          <span className={row.available <= 2 ? 'text-red-600 dark:text-red-400 font-bold' : 'text-emerald-600 dark:text-emerald-400'}>
                            {row.available}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-center py-2">
                          <div className="flex items-center gap-2">
                            <Progress value={row.occupancy} className="h-1.5 flex-1" />
                            <span className={`font-semibold ${row.occupancy >= 80 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>
                              {row.occupancy}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-slate-500 dark:text-slate-400 py-2">{row.headDoctor}</TableCell>
                        <TableCell className="py-2">
                          <Badge className={`text-[9px] ${getUrgencyColor(row.urgency)}`}>{row.urgency}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delegations Tab */}
        <TabsContent value="delegations" className="mt-4">
          <DelegationPanel hospitalId={hospital.id} services={hospital.services} />
        </TabsContent>

        {/* Transfers Tab */}
        <TabsContent value="transfers" className="mt-4">
          <TransferTracker hospitalId={hospital.id} services={hospital.services} showCreate={true} />
        </TabsContent>

        {/* Stock Tab */}
        <TabsContent value="stock" className="mt-4">
          <Card className="border-slate-200/60 dark:border-slate-800/60 rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Pill className="size-4 text-amber-600 dark:text-amber-400" />
                Alertes stocks — {hospital.shortName}
              </CardTitle>
              <CardDescription className="text-xs">Médicaments sous seuil critique</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {hospitalStockAlerts.map((med, i) => {
                  const percentage = Math.round((med.stock / med.max) * 100)
                  const isCritical = percentage < 15
                  const isWarning = percentage >= 15 && percentage < 40

                  return (
                    <div key={med.name} className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{med.name}</span>
                        <Badge variant="outline" className={`text-[10px] px-1.5 ${isCritical ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800' : isWarning ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800' : 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800'}`}>
                          {isCritical ? 'Critique' : isWarning ? 'Faible' : 'Attention'}
                        </Badge>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-1.5">
                        <motion.div
                          className={`h-full rounded-full ${isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-teal-500'}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(percentage, 100)}%` }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>{med.stock} {med.unit}</span>
                        <span>Max: {med.max}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Weekly Trends (always visible) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-slate-200/60 dark:border-slate-800/60 rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="size-4 text-teal-600 dark:text-teal-400" />
              Admissions vs Sorties
            </CardTitle>
            <CardDescription className="text-xs">Tendances hebdomadaires</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyAdmissions} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="cetteSemaine" stroke="#14b8a6" strokeWidth={2} name="Admissions" dot={{ r: 3, fill: '#14b8a6' }} />
                  <Line type="monotone" dataKey="semaineDerniere" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" name="Sem. dernière" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 dark:border-slate-800/60 rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="size-4 text-emerald-600 dark:text-emerald-400" />
              Revenus hebdomadaires
            </CardTitle>
            <CardDescription className="text-xs">Évolution cette semaine</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyRevenue} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="hospBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" />
                      <stop offset="95%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Bar dataKey="cetteSemaine" fill="url(#hospBarGrad)" radius={[6, 6, 0, 0]} maxBarSize={48} name="Revenus" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
      `}</style>
    </motion.div>
  )
}
