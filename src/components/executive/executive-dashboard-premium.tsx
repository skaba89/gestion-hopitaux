'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Activity, AlertTriangle, Bed, Clock, FlaskConical, HeartPulse, Siren, TrendingUp, Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { buildExecutiveDashboard } from '@/lib/analytics/executive-kpis'
import { generateDemoHospitalSnapshots } from '@/lib/demo/demo-hospital-data'
import { analyzeEmergencyPressure } from '@/lib/smart-hospital/emergency-pressure'
import { analyzeBedOccupancy } from '@/lib/smart-hospital/bed-management'

const statusClass = {
  GOOD: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  WARNING: 'bg-amber-50 text-amber-700 border-amber-200',
  CRITICAL: 'bg-red-50 text-red-700 border-red-200',
}

const iconMap = {
  bed_occupancy_rate: Bed,
  average_waiting_time: Clock,
  critical_incidents: AlertTriangle,
  pharmacy_stockouts: HeartPulse,
  lab_pending_results: FlaskConical,
  daily_revenue: Wallet,
  staff_pressure: Siren,
}

function formatValue(value: number | string, unit?: string) {
  if (unit === 'GNF' && typeof value === 'number') {
    return `${Math.round(value / 1000000)}M GNF`
  }
  return `${value}${unit && unit !== 'GNF' ? unit : ''}`
}

export function ExecutiveDashboardPremium() {
  const snapshots = generateDemoHospitalSnapshots()
  const main = snapshots[0]
  const dashboard = buildExecutiveDashboard({
    admissionsToday: main.admissionsToday,
    consultationsToday: main.consultationsToday,
    dischargesToday: 84,
    emergencyPatients: main.emergencyPatients,
    criticalIncidents: 3,
    totalBeds: main.totalBeds,
    occupiedBeds: main.occupiedBeds,
    availableDoctors: main.availableDoctors,
    availableNurses: main.availableNurses,
    pharmacyStockouts: main.pharmacyStockouts,
    labPendingResults: main.labPendingResults,
    revenueToday: main.revenueToday,
    averageWaitingMinutes: main.averageWaitingMinutes,
  })

  const emergency = analyzeEmergencyPressure({
    waitingPatients: main.emergencyPatients,
    criticalPatients: 8,
    availableDoctors: main.availableDoctors,
    availableNurses: main.availableNurses,
    averageWaitingMinutes: main.averageWaitingMinutes,
    availableEmergencyBeds: 2,
  })

  const beds = analyzeBedOccupancy([
    { service: 'Urgences', totalBeds: 60, occupiedBeds: 58, availableBeds: 2 },
    { service: 'Médecine', totalBeds: 140, occupiedBeds: 122, availableBeds: 18 },
    { service: 'Maternité', totalBeds: 85, occupiedBeds: 69, availableBeds: 16 },
  ])

  return (
    <div className="space-y-6 p-1">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-900 p-6 text-white shadow-2xl"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Badge className="mb-3 bg-white/10 text-white border-white/20">Supervision exécutive temps réel</Badge>
            <h1 className="text-3xl font-bold tracking-tight">{main.hospitalName}</h1>
            <p className="mt-2 max-w-2xl text-sm text-cyan-100">
              Vue DG: activité, saturation, risques critiques, capacité hospitalière et performance opérationnelle.
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-5 text-center backdrop-blur">
            <div className="text-sm text-cyan-100">Score santé établissement</div>
            <div className="mt-1 text-5xl font-black">{dashboard.healthScore}</div>
            <Badge className="mt-2 bg-white text-slate-900">{dashboard.globalStatus}</Badge>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboard.kpis.map((kpi, index) => {
          const Icon = iconMap[kpi.key as keyof typeof iconMap] || Activity
          return (
            <motion.div
              key={kpi.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <Card className="overflow-hidden border-slate-200/80 shadow-sm transition hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">{kpi.label}</CardTitle>
                  <Icon className="h-5 w-5 text-cyan-700" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatValue(kpi.value, kpi.unit)}</div>
                  <Badge className={`mt-3 border ${statusClass[kpi.status]}`}>{kpi.status}</Badge>
                  <p className="mt-3 text-xs text-slate-500">{kpi.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Siren className="h-5 w-5 text-red-600" /> Pression urgences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{emergency.score}</div>
                <p className="text-sm text-slate-500">{emergency.message}</p>
              </div>
              <Badge className="bg-red-50 text-red-700 border-red-200">{emergency.level}</Badge>
            </div>
            <Progress value={Math.min(emergency.score, 100)} />
            <ul className="space-y-2 text-sm text-slate-600">
              {emergency.recommendations.map(item => <li key={item}>• {item}</li>)}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-cyan-700" /> Priorités DG</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-slate-600">
              {dashboard.priorities.slice(0, 5).map(priority => <li key={priority}>• {priority}</li>)}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bed className="h-5 w-5 text-blue-700" /> Capacité par service</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {beds.map(item => (
            <div key={item.service} className="rounded-2xl border p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{item.service}</div>
                <Badge className={`border ${item.severity === 'CRITICAL' ? 'bg-red-50 text-red-700 border-red-200' : item.severity === 'WARNING' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>{item.severity}</Badge>
              </div>
              <div className="mt-4 text-3xl font-bold">{item.occupancyRate}%</div>
              <Progress value={item.occupancyRate} className="mt-3" />
              <p className="mt-3 text-xs text-slate-500">{item.recommendation}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
