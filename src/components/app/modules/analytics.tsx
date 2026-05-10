'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3, Users, TrendingUp, Activity, DollarSign, Bed, Stethoscope, Calendar,
} from 'lucide-react'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } }

const consultationTrend = [
  { month: 'Oct', consultations: 420, revenue: 8500000 },
  { month: 'Nov', consultations: 480, revenue: 9200000 },
  { month: 'Déc', consultations: 390, revenue: 7800000 },
  { month: 'Jan', consultations: 510, revenue: 10200000 },
  { month: 'Fév', consultations: 530, revenue: 10800000 },
  { month: 'Mars', consultations: 560, revenue: 11500000 },
]

const admissionsByDept = [
  { dept: 'Urgences', count: 145 },
  { dept: 'Maternité', count: 120 },
  { dept: 'Méd. Interne', count: 98 },
  { dept: 'Chirurgie', count: 85 },
  { dept: 'Pédiatrie', count: 72 },
  { dept: 'Cardiologie', count: 45 },
]

const diseaseDistribution = [
  { name: 'Paludisme', value: 28, color: '#14b8a6' },
  { name: 'IRA', value: 19, color: '#06b6d4' },
  { name: 'Diarrhée', value: 15, color: '#f59e0b' },
  { name: 'Hypertension', value: 12, color: '#ef4444' },
  { name: 'Diabète', value: 9, color: '#8b5cf6' },
  { name: 'Autres', value: 17, color: '#64748b' },
]

const kpiCards = [
  { label: 'Consultations', value: '560', trend: '+5.6%', up: true, icon: Stethoscope, color: 'from-teal-500 to-emerald-600', bg: 'bg-teal-50 dark:bg-teal-950/40', iconColor: 'text-teal-600 dark:text-teal-400' },
  { label: 'Revenus', value: '11.5M', trend: '+6.5%', up: true, icon: DollarSign, color: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40', iconColor: 'text-emerald-600 dark:text-emerald-400' },
  { label: 'Patients', value: '1,247', trend: '+8.2%', up: true, icon: Users, color: 'from-cyan-500 to-teal-600', bg: 'bg-cyan-50 dark:bg-cyan-950/40', iconColor: 'text-cyan-600 dark:text-cyan-400' },
  { label: 'Taux occupation', value: '68%', trend: '-2%', up: false, icon: Bed, color: 'from-amber-500 to-orange-600', bg: 'bg-amber-50 dark:bg-amber-950/40', iconColor: 'text-amber-600 dark:text-amber-400' },
]

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 shadow-xl">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.name}: {entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  )
}

export function AnalyticsPage() {
  const [period, setPeriod] = useState('6m')

  return (
    <motion.div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto" variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/20"><BarChart3 className="size-5 text-white" /></div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Analytique</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Tableaux de bord et indicateurs</p>
          </div>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1m">1 mois</SelectItem>
            <SelectItem value="3m">3 mois</SelectItem>
            <SelectItem value="6m">6 mois</SelectItem>
            <SelectItem value="1y">1 an</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpiCards.map(kpi => (
          <motion.div key={kpi.label} variants={itemVariants}>
            <Card className="relative overflow-hidden border-slate-200/60 dark:border-slate-800/60">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${kpi.color}`} />
              <CardContent className="pt-5 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{kpi.label}</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{kpi.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className={`size-3 ${kpi.up ? 'text-emerald-500' : 'text-rose-500 rotate-180'}`} />
                      <span className={`text-xs font-semibold ${kpi.up ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{kpi.trend}</span>
                    </div>
                  </div>
                  <div className={`flex items-center justify-center size-11 rounded-xl ${kpi.bg}`}><kpi.icon className={`size-5 ${kpi.iconColor}`} /></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Consultation Trend */}
        <motion.div variants={itemVariants}>
          <Card className="border-slate-200/60 dark:border-slate-800/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">Évolution des consultations</CardTitle>
              <CardDescription className="text-xs">Tendance sur 6 mois</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={consultationTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="consultations" stroke="#14b8a6" strokeWidth={2.5} dot={{ r: 4, fill: '#14b8a6', stroke: '#fff', strokeWidth: 2 }} name="Consultations" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Revenue Trend */}
        <motion.div variants={itemVariants}>
          <Card className="border-slate-200/60 dark:border-slate-800/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">Évolution des revenus</CardTitle>
              <CardDescription className="text-xs">Revenus mensuels en GNF</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={consultationTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000000).toFixed(0)}M`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="revenue" stroke="#14b8a6" strokeWidth={2.5} fill="url(#revGrad)" name="Revenus (GNF)" dot={{ r: 4, fill: '#14b8a6', stroke: '#fff', strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Admissions by Department */}
        <motion.div variants={itemVariants}>
          <Card className="border-slate-200/60 dark:border-slate-800/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">Admissions par service</CardTitle>
              <CardDescription className="text-xs">Répartition ce trimestre</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={admissionsByDept} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="admGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" />
                        <stop offset="95%" stopColor="#0d9488" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                    <XAxis dataKey="dept" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="url(#admGrad)" radius={[6, 6, 0, 0]} maxBarSize={48} name="Admissions" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Disease Distribution */}
        <motion.div variants={itemVariants}>
          <Card className="border-slate-200/60 dark:border-slate-800/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">Distribution pathologies</CardTitle>
              <CardDescription className="text-xs">Répartition des diagnostics</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[280px] flex items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={diseaseDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                      {diseaseDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value}%`} />
                    <Legend verticalAlign="bottom" height={36} formatter={(value: string) => <span className="text-xs text-slate-600 dark:text-slate-400">{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
