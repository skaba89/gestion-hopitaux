'use client'

import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe, Building2, Users, BedDouble, AlertTriangle, Activity,
  TrendingUp, TrendingDown, DollarSign, Stethoscope, ArrowRightLeft,
  Shield, Clock, Heart, MapPin, Siren, FlaskConical, Pill,
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useMultiHospitalStore } from '@/lib/hospital-store'
import {
  type GuineaRegion, REGION_LABELS, REGION_COLORS,
  getBedOccupancyRate,
} from '@/lib/hospital-model'
import { KPICard, kpiPresets } from './shared/kpi-card'
import { PathologyRanking, PathologyList } from './shared/pathology-ranking'
import { TransferTracker } from './shared/transfer-tracker'
import {
  seededInt, seededFloat, formatNumber, formatCurrency,
  generateWeeklyData, NATIONAL_PATHOLOGIES, DISEASE_ALERTS,
} from './shared/seed-utils'

// ─────────── Guinea SVG Map Component ───────────

const REGION_COORDS: Record<GuineaRegion, { x: number; y: number; path: string }> = {
  'Conakry': { x: 65, y: 78, path: 'M55,72 L75,72 L78,78 L75,85 L55,85 L52,78 Z' },
  'Kindia': { x: 50, y: 65, path: 'M30,55 L70,55 L75,72 L55,72 L52,78 L55,85 L35,85 L30,70 Z' },
  'Boké': { x: 25, y: 45, path: 'M10,20 L55,20 L70,55 L30,55 L30,70 L10,60 Z' },
  'Labé': { x: 55, y: 38, path: 'M55,20 L95,20 L95,45 L70,55 L55,55 Z' },
  'Mamou': { x: 55, y: 58, path: 'M55,55 L70,55 L75,72 L55,72 L35,72 L35,55 Z' },
  'Faranah': { x: 72, y: 50, path: 'M95,45 L140,45 L140,65 L100,65 L75,72 L70,55 Z' },
  'Kankan': { x: 100, y: 35, path: 'M95,20 L140,20 L140,45 L95,45 L95,20 Z' },
  'Nzérékoré': { x: 115, y: 68, path: 'M100,65 L140,65 L155,75 L150,95 L120,100 L100,90 Z' },
}

function GuineaMap({ onRegionClick, selectedRegion }: { onRegionClick: (region: GuineaRegion) => void; selectedRegion?: GuineaRegion }) {
  const { hospitals, getHospitalsByRegion } = useMultiHospitalStore()

  const regionStats = useMemo(() => {
    const stats: Record<string, { totalBeds: number; occupiedBeds: number; occupancy: number; hospitalCount: number }> = {}
    const regions: GuineaRegion[] = ['Conakry', 'Kindia', 'Boké', 'Labé', 'Mamou', 'Faranah', 'Kankan', 'Nzérékoré']
    regions.forEach(region => {
      const rh = getHospitalsByRegion(region)
      const totalBeds = rh.reduce((s, h) => s + h.totalBeds, 0)
      const occupiedBeds = rh.reduce((s, h) => s + h.occupiedBeds, 0)
      stats[region] = {
        totalBeds,
        occupiedBeds,
        occupancy: getBedOccupancyRate(occupiedBeds, totalBeds),
        hospitalCount: rh.length,
      }
    })
    return stats
  }, [hospitals, getHospitalsByRegion])

  function getRegionColor(occupancy: number): string {
    if (occupancy >= 90) return '#ef4444'
    if (occupancy >= 80) return '#f59e0b'
    if (occupancy >= 70) return '#14b8a6'
    return '#10b981'
  }

  return (
    <div className="relative">
      <svg viewBox="0 0 170 120" className="w-full h-auto max-h-[320px]">
        {/* Background */}
        <rect x="0" y="0" width="170" height="120" fill="transparent" />

        {/* Regions */}
        {Object.entries(REGION_COORDS).map(([region, coord]) => {
          const stats = regionStats[region]
          const isSelected = selectedRegion === region
          const fillColor = stats ? getRegionColor(stats.occupancy) : '#94a3b8'

          return (
            <g key={region} onClick={() => onRegionClick(region as GuineaRegion)} className="cursor-pointer">
              <path
                d={coord.path}
                fill={fillColor}
                fillOpacity={isSelected ? 0.7 : 0.4}
                stroke={isSelected ? fillColor : '#64748b'}
                strokeWidth={isSelected ? 2 : 1}
                className="transition-all duration-200 hover:fill-opacity-70"
              />
              {/* Hospital dots */}
              {stats && stats.hospitalCount > 0 && (
                <circle
                  cx={coord.x}
                  cy={coord.y}
                  r={Math.max(3, Math.min(6, stats.hospitalCount * 2))}
                  fill="white"
                  stroke={fillColor}
                  strokeWidth={1.5}
                  className="pointer-events-none"
                />
              )}
              {/* Region label */}
              <text
                x={coord.x}
                y={coord.y + 14}
                textAnchor="middle"
                className="text-[6px] font-medium fill-slate-700 dark:fill-slate-300 pointer-events-none"
              >
                {REGION_LABELS[region as GuineaRegion]}
              </text>
            </g>
          )
        })}

        {/* Legend */}
        <g transform="translate(5, 105)">
          <rect x="0" y="0" width="8" height="6" fill="#10b981" fillOpacity={0.6} rx="1" />
          <text x="10" y="5" className="text-[5px] fill-slate-500 dark:fill-slate-400">&lt;70%</text>
          <rect x="30" y="0" width="8" height="6" fill="#14b8a6" fillOpacity={0.6} rx="1" />
          <text x="40" y="5" className="text-[5px] fill-slate-500 dark:fill-slate-400">70-80%</text>
          <rect x="65" y="0" width="8" height="6" fill="#f59e0b" fillOpacity={0.6} rx="1" />
          <text x="75" y="5" className="text-[5px] fill-slate-500 dark:fill-slate-400">80-90%</text>
          <rect x="100" y="0" width="8" height="6" fill="#ef4444" fillOpacity={0.6} rx="1" />
          <text x="110" y="5" className="text-[5px] fill-slate-500 dark:fill-slate-400">&gt;90%</text>
        </g>
      </svg>
    </div>
  )
}

// ─────────── National Dashboard Component ───────────

export function NationalDashboard() {
  const { hospitals, getNationalStats, selectHospital, getHospitalsByRegion, transfers } = useMultiHospitalStore()
  const [selectedRegion, setSelectedRegion] = useState<GuineaRegion | null>(null)
  const [sortField, setSortField] = useState<'occupancy' | 'revenue' | 'satisfaction'>('occupancy')

  const stats = getNationalStats()

  // Deterministic national data
  const totalRevenue = useMemo(() => hospitals.reduce((s, h) => s + seededInt(h.id, 20_000_000, 80_000_000, 100), 0), [hospitals])
  const totalStaff = useMemo(() => hospitals.reduce((s, h) => s + h.services.reduce((ss, svc) => ss + svc.staffCount, 0), 0), [hospitals])

  // Hospital ranking data
  const hospitalRanking = useMemo(() => {
    return hospitals.map(h => {
      const occupancy = getBedOccupancyRate(h.occupiedBeds, h.totalBeds)
      const revenue = seededInt(h.id, 20_000_000, 80_000_000, 100)
      const satisfaction = seededInt(h.id, 65, 92, 200)
      return { ...h, occupancy, revenue, satisfaction }
    }).sort((a, b) => {
      if (sortField === 'occupancy') return b.occupancy - a.occupancy
      if (sortField === 'revenue') return b.revenue - a.revenue
      return b.satisfaction - a.satisfaction
    })
  }, [hospitals, sortField])

  // Regional comparison data
  const regionalData = useMemo(() => {
    const regions: GuineaRegion[] = ['Conakry', 'Kindia', 'Boké', 'Labé', 'Mamou', 'Faranah', 'Kankan', 'Nzérékoré']
    return regions.map(region => {
      const rh = getHospitalsByRegion(region)
      const totalBeds = rh.reduce((s, h) => s + h.totalBeds, 0)
      const occupiedBeds = rh.reduce((s, h) => s + h.occupiedBeds, 0)
      const staff = rh.reduce((s, h) => s + h.services.reduce((ss, svc) => ss + svc.staffCount, 0), 0)
      return {
        region,
        label: REGION_LABELS[region],
        color: REGION_COLORS[region],
        hospitalCount: rh.length,
        totalBeds,
        occupiedBeds,
        occupancy: getBedOccupancyRate(occupiedBeds, totalBeds),
        staff,
      }
    })
  }, [hospitals, getHospitalsByRegion])

  // Weekly trend data
  const weeklyAdmissions = useMemo(() => generateWeeklyData('national-admissions', 350), [])

  // Active inter-hospital transfers
  const interHospitalTransfers = useMemo(() => transfers.filter(t => t.status === 'En attente' || t.status === 'Accepté'), [transfers])

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
            <Globe className="size-8 text-teal-600 dark:text-teal-400" />
            Vue Nationale — République de Guinée
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Supervision centralisée du système de santé national
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 text-xs px-3 py-1">
            <span className="mr-1.5 size-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
            Temps réel
          </Badge>
          <Badge className="bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400 text-xs px-3 py-1">
            Directeur Général
          </Badge>
        </div>
      </div>

      {/* National KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPICard
          title="Patients"
          value={formatNumber(stats.totalPatients)}
          subtitle="aujourd'hui"
          icon={Users}
          trend="+12%"
          trendUp={false}
          {...kpiPresets.clinical}
          delay={0}
        />
        <KPICard
          title="Hôpitaux actifs"
          value={stats.totalHospitals}
          subtitle="établissements"
          icon={Building2}
          trend="+2"
          trendUp={true}
          {...kpiPresets.management}
          delay={0.05}
        />
        <KPICard
          title="Occupation lits"
          value={`${stats.avgOccupancy}%`}
          subtitle="moyenne nationale"
          icon={BedDouble}
          trend={stats.avgOccupancy > 80 ? '+3.2%' : '-1.5%'}
          trendUp={stats.avgOccupancy <= 80}
          {...kpiPresets.occupancy}
          delay={0.1}
        />
        <KPICard
          title="Alertes"
          value={DISEASE_ALERTS.filter(a => a.status === 'Actif').length}
          subtitle="maladies"
          icon={AlertTriangle}
          trend="+2"
          trendUp={false}
          {...kpiPresets.alert}
          delay={0.15}
        />
        <KPICard
          title="Revenus"
          value={formatCurrency(totalRevenue / 1_000_000) + 'M'}
          subtitle="ce mois"
          icon={DollarSign}
          trend="+8.5%"
          trendUp={true}
          {...kpiPresets.financial}
          delay={0.2}
        />
        <KPICard
          title="Personnels"
          value={formatNumber(totalStaff)}
          subtitle="tous établissements"
          icon={Heart}
          trend="+15"
          trendUp={true}
          {...kpiPresets.management}
          delay={0.25}
        />
      </div>

      {/* Map + Regional Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Guinea Map */}
        <Card className="border-slate-200/60 dark:border-slate-800/60 rounded-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin className="size-4 text-teal-600 dark:text-teal-400" />
                  Carte sanitaire nationale
                </CardTitle>
                <CardDescription className="text-xs">Cliquer sur une région pour filtrer</CardDescription>
              </div>
              {selectedRegion && (
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setSelectedRegion(null)}>
                  Réinitialiser
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <GuineaMap onRegionClick={setSelectedRegion} selectedRegion={selectedRegion || undefined} />
          </CardContent>
        </Card>

        {/* Regional Comparison Cards */}
        <Card className="border-slate-200/60 dark:border-slate-800/60 rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="size-4 text-teal-600 dark:text-teal-400" />
              Comparaison régionale
            </CardTitle>
            <CardDescription className="text-xs">8 régions naturelles de Guinée</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 max-h-[310px] overflow-y-auto custom-scrollbar">
              {regionalData
                .filter(r => !selectedRegion || r.region === selectedRegion)
                .map((r, i) => (
                <motion.div
                  key={r.region}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedRegion(selectedRegion === r.region ? null : r.region)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="size-3 rounded-full" style={{ backgroundColor: r.color }} />
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{r.label}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>{r.hospitalCount} hôp.</span>
                      <span>•</span>
                      <span>{formatNumber(r.staff)} pers.</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Occupation</span>
                      <span className={`font-semibold ${r.occupancy >= 80 ? 'text-amber-600 dark:text-amber-400' : 'text-teal-600 dark:text-teal-400'}`}>
                        {r.occupancy}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${r.occupancy >= 90 ? 'bg-red-500' : r.occupancy >= 80 ? 'bg-amber-500' : 'bg-teal-500'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${r.occupancy}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
                      <span>{r.occupiedBeds}/{r.totalBeds} lits</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pathologies + Hospital Ranking + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Pathologies */}
        <PathologyRanking
          data={NATIONAL_PATHOLOGIES}
          title="Top 5 Pathologies nationales"
          description="Classement par nombre de cas"
          limit={5}
        />

        {/* Hospital Performance Ranking */}
        <Card className="border-slate-200/60 dark:border-slate-800/60 rounded-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="size-4 text-teal-600 dark:text-teal-400" />
                  Classement hôpitaux
                </CardTitle>
                <CardDescription className="text-xs">Performance par établissement</CardDescription>
              </div>
              <div className="flex gap-1">
                {(['occupancy', 'revenue', 'satisfaction'] as const).map(field => (
                  <Button
                    key={field}
                    variant={sortField === field ? 'default' : 'ghost'}
                    size="sm"
                    className={`h-6 text-[10px] px-2 ${sortField === field ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
                    onClick={() => setSortField(field)}
                  >
                    {field === 'occupancy' ? 'Occup.' : field === 'revenue' ? 'Revenu' : 'Satisf.'}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="max-h-[280px] overflow-y-auto custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[10px] h-8">#</TableHead>
                    <TableHead className="text-[10px]">Hôpital</TableHead>
                    <TableHead className="text-[10px] text-right">Occup.</TableHead>
                    <TableHead className="text-[10px] text-right">Revenu</TableHead>
                    <TableHead className="text-[10px] text-right">Satisf.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hospitalRanking.slice(0, 10).map((h, i) => (
                    <TableRow
                      key={h.id}
                      className="cursor-pointer hover:bg-teal-50/50 dark:hover:bg-teal-950/20"
                      onClick={() => selectHospital(h.id)}
                    >
                      <TableCell className="text-xs font-bold text-slate-400 py-1.5">{i + 1}</TableCell>
                      <TableCell className="py-1.5">
                        <div>
                          <p className="text-xs font-medium text-slate-900 dark:text-white truncate">{h.shortName}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500">{h.type}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-right py-1.5">
                        <span className={h.occupancy >= 80 ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-slate-700 dark:text-slate-300'}>
                          {h.occupancy}%
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-right py-1.5 text-slate-700 dark:text-slate-300">
                        {(h.revenue / 1_000_000).toFixed(1)}M
                      </TableCell>
                      <TableCell className="text-xs text-right py-1.5">
                        <span className={h.satisfaction >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                          {h.satisfaction}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Disease Alerts */}
        <Card className="border-slate-200/60 dark:border-slate-800/60 rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
              Alertes sanitaires
            </CardTitle>
            <CardDescription className="text-xs">Avec statut OMS</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 max-h-[280px] overflow-y-auto custom-scrollbar">
              {DISEASE_ALERTS.map((alert, i) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{alert.disease}</span>
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        <MapPin className="size-3" />
                        {REGION_LABELS[alert.region]}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge className={`text-[10px] px-1.5 ${alert.status === 'Actif' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800' : alert.status === 'Confirmé' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800' : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800'}`}>
                        {alert.status}
                      </Badge>
                      {alert.whoNotified && (
                        <Badge variant="outline" className="text-[9px] px-1 bg-slate-50 dark:bg-slate-900">
                          <Shield className="size-2.5 mr-0.5" />
                          OMS
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span className="text-rose-600 dark:text-rose-400 font-medium">{alert.cases} cas</span>
                    {alert.deaths > 0 && (
                      <span className="text-red-700 dark:text-red-400 font-medium">{alert.deaths} décès</span>
                    )}
                    <span className="ml-auto text-slate-400 dark:text-slate-500">{alert.date}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Trends + Transfer Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly Admissions Trend */}
        <Card className="border-slate-200/60 dark:border-slate-800/60 rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="size-4 text-teal-600 dark:text-teal-400" />
              Tendues hebdomadaires
            </CardTitle>
            <CardDescription className="text-xs">Admissions nationales cette semaine</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyAdmissions} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="natGradTeal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="natGradGray" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="semaineDerniere" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" fill="url(#natGradGray)" name="Sem. dernière" />
                  <Area type="monotone" dataKey="cetteSemaine" stroke="#14b8a6" strokeWidth={2.5} fill="url(#natGradTeal)" name="Cette semaine" dot={{ r: 3, fill: '#14b8a6', stroke: '#fff', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Transfer Tracking */}
        <Card className="border-slate-200/60 dark:border-slate-800/60 rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <ArrowRightLeft className="size-4 text-teal-600 dark:text-teal-400" />
              Suivi des transferts en temps réel
            </CardTitle>
            <CardDescription className="text-xs">Transferts inter-établissements actifs</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar">
              {interHospitalTransfers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
                  <ArrowRightLeft className="size-10 mb-2 opacity-40" />
                  <p className="text-sm">Aucun transfert en cours</p>
                  <p className="text-xs mt-1">Les transferts entre services apparaîtront ici</p>
                </div>
              ) : (
                interHospitalTransfers.map((t, i) => (
                  <div key={t.id} className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/50">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-slate-900 dark:text-white">
                        {t.patientName}
                      </div>
                      <Badge className={`text-[10px] ${t.status === 'En attente' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'}`}>
                        {t.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {t.fromServiceName} → {t.toServiceName}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
      `}</style>
    </motion.div>
  )
}
