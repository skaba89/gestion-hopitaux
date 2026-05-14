'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  MapPin, Building2, Users, BedDouble, AlertTriangle, Activity,
  TrendingUp, TrendingDown, ArrowRightLeft, Shield, Clock,
  Heart, Siren, Stethoscope, DollarSign, Pill, FlaskConical,
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  BarChart, Bar,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useMultiHospitalStore } from '@/lib/hospital-store'
import {
  type GuineaRegion, type Hospital, REGION_LABELS, REGION_COLORS,
  getBedOccupancyRate, getServiceUrgency,
} from '@/lib/hospital-model'
import { KPICard, kpiPresets } from './shared/kpi-card'
import { OccupancyChart } from './shared/occupancy-chart'
import { TransferTracker } from './shared/transfer-tracker'
import {
  seededInt, seededFloat, formatNumber, formatCurrency,
  generateWeeklyData, generateMonthlyData, CRITICAL_MEDICATIONS,
} from './shared/seed-utils'

interface RegionalDashboardProps {
  regionCode: GuineaRegion
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

export function RegionalDashboard({ regionCode }: RegionalDashboardProps) {
  const { hospitals, getHospitalsByRegion, selectHospital, getNationalStats } = useMultiHospitalStore()
  const regionHospitals = getHospitalsByRegion(regionCode)
  const nationalStats = getNationalStats()

  const regionLabel = REGION_LABELS[regionCode]
  const regionColor = REGION_COLORS[regionCode]

  // Regional stats
  const regionalStats = useMemo(() => {
    const totalBeds = regionHospitals.reduce((s, h) => s + h.totalBeds, 0)
    const occupiedBeds = regionHospitals.reduce((s, h) => s + h.occupiedBeds, 0)
    const totalStaff = regionHospitals.reduce((s, h) => s + h.services.reduce((ss, svc) => ss + svc.staffCount, 0), 0)
    const totalRevenue = regionHospitals.reduce((s, h) => s + seededInt(h.id, 5_000_000, 30_000_000, 100), 0)
    const avgOccupancy = getBedOccupancyRate(occupiedBeds, totalBeds)
    const activeEmergencies = regionHospitals.reduce((s, h) => s + seededInt(h.id, 5, 25, 300), 0)

    return { totalBeds, occupiedBeds, totalStaff, totalRevenue, avgOccupancy, activeEmergencies }
  }, [regionHospitals])

  // Occupancy by hospital chart data
  const occupancyData = useMemo(() => {
    return regionHospitals.map(h => ({
      name: h.shortName,
      occupancy: getBedOccupancyRate(h.occupiedBeds, h.totalBeds),
      totalBeds: h.totalBeds,
      occupiedBeds: h.occupiedBeds,
    }))
  }, [regionHospitals])

  // Epidemiological curve data
  const epiCurveData = useMemo(() => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
    return months.map((month, i) => ({
      mois: month,
      paludisme: seededInt(`${regionCode}-palu`, 50, 300, i),
      diarrhee: seededInt(`${regionCode}-diarrhee`, 30, 150, i + 12),
      respiratoire: seededInt(`${regionCode}-resp`, 20, 120, i + 24),
    }))
  }, [regionCode])

  // Staff distribution data for PieChart
  const staffDistribution = useMemo(() => {
    const medecins = regionHospitals.reduce((s, h) => s + h.services.reduce((ss, svc) => ss + svc.doctorsCount, 0), 0)
    const infirmiers = regionHospitals.reduce((s, h) => s + h.services.reduce((ss, svc) => ss + svc.nursesCount, 0), 0)
    const autres = regionalStats.totalStaff - medecins - infirmiers
    return [
      { name: 'Médecins', value: medecins, color: '#0d9488' },
      { name: 'Infirmiers', value: infirmiers, color: '#7c3aed' },
      { name: 'Autres', value: Math.max(0, autres), color: '#f59e0b' },
    ]
  }, [regionHospitals, regionalStats.totalStaff])

  // Stock alerts for region
  const regionalStockAlerts = useMemo(() => {
    return CRITICAL_MEDICATIONS.map(med => ({
      ...med,
      stock: seededInt(`${regionCode}-${med.name}`, Math.floor(med.max * 0.05), Math.floor(med.max * 0.4), 400),
    }))
  }, [regionCode])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className="size-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: regionColor + '20', color: regionColor }}>
              <MapPin className="size-5" />
            </div>
            Région {regionLabel}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {regionHospitals.length} établissement{regionHospitals.length > 1 ? 's' : ''} dans la région
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="text-xs px-3 py-1" style={{ backgroundColor: regionColor + '18', color: regionColor, borderColor: regionColor + '40' }}>
            Directeur Régional
          </Badge>
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 text-xs px-3 py-1">
            <span className="mr-1.5 size-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
            En ligne
          </Badge>
        </div>
      </div>

      {/* Regional KPIs vs National Average */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KPICard
          title="Occupation régionale"
          value={`${regionalStats.avgOccupancy}%`}
          subtitle={`Moy. nationale: ${nationalStats.avgOccupancy}%`}
          icon={BedDouble}
          trend={regionalStats.avgOccupancy > nationalStats.avgOccupancy ? '+au-dessus' : '-en dessous'}
          trendUp={regionalStats.avgOccupancy <= nationalStats.avgOccupancy}
          {...kpiPresets.occupancy}
          delay={0}
        />
        <KPICard
          title="Lits régionaux"
          value={formatNumber(regionalStats.totalBeds)}
          subtitle={`${regionalStats.occupiedBeds} occupés`}
          icon={BedDouble}
          {...kpiPresets.clinical}
          delay={0.05}
        />
        <KPICard
          title="Urgences actives"
          value={regionalStats.activeEmergencies}
          subtitle="dans la région"
          icon={Siren}
          trend={regionalStats.activeEmergencies > 15 ? '+élevé' : '-normal'}
          trendUp={regionalStats.activeEmergencies <= 15}
          {...kpiPresets.alert}
          delay={0.1}
        />
        <KPICard
          title="Personnels"
          value={formatNumber(regionalStats.totalStaff)}
          subtitle="en activité"
          icon={Users}
          {...kpiPresets.management}
          delay={0.15}
        />
        <KPICard
          title="Revenus régionaux"
          value={`${(regionalStats.totalRevenue / 1_000_000).toFixed(1)}M`}
          subtitle="GNF ce mois"
          icon={DollarSign}
          trend="+6.2%"
          trendUp={true}
          {...kpiPresets.financial}
          delay={0.2}
        />
      </div>

      {/* Hospital Cards */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
          <Building2 className="size-4 text-teal-600 dark:text-teal-400" />
          Établissements de la région {regionLabel}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {regionHospitals.map((hospital, i) => {
            const occupancy = getBedOccupancyRate(hospital.occupiedBeds, hospital.totalBeds)
            const urgency = getServiceUrgency(occupancy)
            const activeEmergencies = seededInt(hospital.id, 3, 18, 300)
            const staffOnDuty = Math.round(hospital.services.reduce((s, svc) => s + svc.staffCount, 0) * 0.85)

            return (
              <motion.div
                key={hospital.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card
                  className="cursor-pointer border-slate-200 dark:border-slate-800 hover:shadow-lg hover:border-teal-300 dark:hover:border-teal-700 transition-all duration-200 rounded-xl overflow-hidden"
                  onClick={() => selectHospital(hospital.id)}
                >
                  <div className="h-1.5" style={{ backgroundColor: hospital.color }} />
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{hospital.name}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="size-3" />
                          {hospital.prefecture} • {hospital.type}
                        </p>
                      </div>
                      <Badge className={`text-[10px] ml-2 ${getUrgencyColor(urgency)}`}>
                        {urgency}
                      </Badge>
                    </div>

                    {/* Occupancy bar */}
                    <div className="space-y-1.5 mb-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400">Occupation des lits</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{occupancy}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${getOccupancyBarColor(occupancy)}`} style={{ width: `${occupancy}%` }} />
                      </div>
                    </div>

                    {/* Quick stats */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                          <Siren className="size-3" />
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{activeEmergencies}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">Urgences</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                          <Users className="size-3" />
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{staffOnDuty}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">En service</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                          <Activity className="size-3" />
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{hospital.services.length}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">Services</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Epidemiological Curve + Staff Distribution + Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Epidemiological Curve */}
        <Card className="border-slate-200/60 dark:border-slate-800/60 rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="size-4 text-teal-600 dark:text-teal-400" />
              Surveillance épidémiologique
            </CardTitle>
            <CardDescription className="text-xs">Courbe épidémiologique régionale</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={epiCurveData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                  <XAxis dataKey="mois" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="paludisme" stroke="#dc2626" strokeWidth={2} dot={false} name="Paludisme" />
                  <Line type="monotone" dataKey="diarrhee" stroke="#f59e0b" strokeWidth={2} dot={false} name="Diarrhée" />
                  <Line type="monotone" dataKey="respiratoire" stroke="#0d9488" strokeWidth={2} dot={false} name="Respiratoire" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Staff Distribution PieChart */}
        <Card className="border-slate-200/60 dark:border-slate-800/60 rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="size-4 text-teal-600 dark:text-teal-400" />
              Répartition du personnel
            </CardTitle>
            <CardDescription className="text-xs">{formatNumber(regionalStats.totalStaff)} personnels au total</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={staffDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {staffDistribution.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatNumber(value)} />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value: string) => <span className="text-xs text-slate-600 dark:text-slate-400">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Regional Stock Alerts */}
        <Card className="border-slate-200/60 dark:border-slate-800/60 rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Pill className="size-4 text-amber-600 dark:text-amber-400" />
              Alertes stocks régionaux
            </CardTitle>
            <CardDescription className="text-xs">Médicaments critiques</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 max-h-[280px] overflow-y-auto custom-scrollbar">
              {regionalStockAlerts.map((med, i) => {
                const percentage = Math.round((med.stock / med.max) * 100)
                const isCritical = percentage < 15
                const isWarning = percentage >= 15 && percentage < 40

                return (
                  <div key={med.name} className="p-2.5 rounded-lg bg-slate-50/80 dark:bg-slate-900/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-900 dark:text-white truncate pr-2">{med.name}</span>
                      <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${isCritical ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800' : isWarning ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800' : 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800'}`}>
                        {isCritical ? 'Critique' : isWarning ? 'Faible' : 'OK'}
                      </Badge>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-1">
                      <div
                        className={`h-full rounded-full ${isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-teal-500'}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
                      <span>{med.stock} {med.unit}</span>
                      <span>Max: {med.max}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Occupancy Chart + Transfers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <OccupancyChart
          data={occupancyData}
          title={`Occupation des lits — ${regionLabel}`}
          description="Par établissement hospitalier"
        />
        <TransferTracker hospitalId={regionHospitals[0]?.id || ''} showCreate={false} />
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
