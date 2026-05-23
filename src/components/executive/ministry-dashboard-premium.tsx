'use client'

import React from 'react'
import { Activity, AlertTriangle, Globe2, Hospital, ShieldAlert, Syringe } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { buildMinistryDashboard } from '@/lib/analytics/ministry-kpis'

const snapshots = [
  {
    region: 'Conakry',
    hospitals: 14,
    totalBeds: 2100,
    occupiedBeds: 1980,
    consultationsToday: 8400,
    emergencyPatients: 950,
    criticalAlerts: 6,
    vaccinationCoverage: 81,
    stockoutFacilities: 3,
  },
  {
    region: 'Kankan',
    hospitals: 7,
    totalBeds: 780,
    occupiedBeds: 610,
    consultationsToday: 2400,
    emergencyPatients: 280,
    criticalAlerts: 2,
    vaccinationCoverage: 72,
    stockoutFacilities: 1,
  },
  {
    region: 'Labé',
    hospitals: 5,
    totalBeds: 520,
    occupiedBeds: 390,
    consultationsToday: 1800,
    emergencyPatients: 190,
    criticalAlerts: 1,
    vaccinationCoverage: 76,
    stockoutFacilities: 0,
  },
]

const statusClass = {
  GOOD: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  WARNING: 'bg-amber-50 text-amber-700 border-amber-200',
  CRITICAL: 'bg-red-50 text-red-700 border-red-200',
}

export function MinistryDashboardPremium() {
  const dashboard = buildMinistryDashboard(snapshots)

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border bg-gradient-to-r from-slate-950 via-indigo-950 to-blue-900 p-6 text-white shadow-2xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Badge className="mb-3 border-white/20 bg-white/10 text-white">Ministère de la Santé — Supervision Nationale</Badge>
            <h1 className="text-3xl font-bold">HealthFlow National Command Center</h1>
            <p className="mt-2 max-w-3xl text-sm text-blue-100">
              Supervision temps réel des établissements, alertes sanitaires, saturation hospitalière et activité nationale.
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-5 text-center backdrop-blur">
            <div className="text-sm text-blue-100">Score santé national</div>
            <div className="mt-1 text-5xl font-black">{dashboard.nationalHealthScore}</div>
            <Badge className="mt-2 bg-white text-slate-900">Supervision nationale</Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Établissements supervisés</CardTitle>
            <Hospital className="h-5 w-5 text-blue-700" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboard.totalHospitals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Occupation nationale</CardTitle>
            <Activity className="h-5 w-5 text-cyan-700" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboard.occupancyRate}%</div>
            <Progress value={dashboard.occupancyRate} className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Alertes critiques</CardTitle>
            <ShieldAlert className="h-5 w-5 text-red-700" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboard.criticalAlerts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Consultations du jour</CardTitle>
            <Syringe className="h-5 w-5 text-emerald-700" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboard.consultationsToday.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Globe2 className="h-5 w-5 text-blue-700" /> Supervision régionale</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-3">
          {dashboard.regions.map(region => (
            <div key={region.region} className="rounded-2xl border p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold">{region.region}</div>
                  <div className="text-sm text-slate-500">{region.consultationsToday.toLocaleString()} consultations</div>
                </div>
                <Badge className={`border ${statusClass[region.status]}`}>{region.status}</Badge>
              </div>

              <div className="mt-5 text-4xl font-black">{region.occupancyRate}%</div>
              <Progress value={region.occupancyRate} className="mt-3" />

              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="text-slate-500">Urgences</div>
                  <div className="text-xl font-bold">{region.emergencyPatients}</div>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="text-slate-500">Vaccination</div>
                  <div className="text-xl font-bold">{region.vaccinationCoverage}%</div>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 p-3 text-sm text-amber-800">
                {region.priority}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-red-600" /> Priorités nationales</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm text-slate-600">
            {dashboard.nationalPriorities.map(item => <li key={item}>• {item}</li>)}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
