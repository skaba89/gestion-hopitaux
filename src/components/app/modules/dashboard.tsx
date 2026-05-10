'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Calendar,
  Bed,
  Siren,
  TrendingUp,
  TrendingDown,
  Clock,
  Star,
  Activity,
  ArrowRight,
  AlertTriangle,
  Heart,
  Thermometer,
  Stethoscope,
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

/* ─────────── Animation Variants ─────────── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
}

const cardHover = {
  rest: { scale: 1 },
  hover: { scale: 1.02, transition: { duration: 0.2 } },
}

/* ─────────── Mock Data ─────────── */

const kpiData = [
  {
    label: 'Patients aujourd\'hui',
    value: '24',
    trend: '+12%',
    trendUp: true,
    sublabel: 'vs hier',
    icon: Users,
    gradient: 'from-teal-500 to-emerald-600',
    bgLight: 'bg-teal-50',
    bgDark: 'dark:bg-teal-950/40',
    iconColor: 'text-teal-600 dark:text-teal-400',
  },
  {
    label: 'Rendez-vous',
    value: '18',
    trend: '+5%',
    trendUp: true,
    sublabel: 'vs hier',
    icon: Calendar,
    gradient: 'from-cyan-500 to-teal-600',
    bgLight: 'bg-cyan-50',
    bgDark: 'dark:bg-cyan-950/40',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
  },
  {
    label: 'Lits disponibles',
    value: '42/120',
    trend: '-3%',
    trendUp: false,
    sublabel: 'vs hier',
    icon: Bed,
    gradient: 'from-amber-500 to-orange-600',
    bgLight: 'bg-amber-50',
    bgDark: 'dark:bg-amber-950/40',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    label: 'Urgences',
    value: '7',
    trend: '+2',
    trendUp: false,
    sublabel: 'vs hier',
    icon: Siren,
    gradient: 'from-rose-500 to-red-600',
    bgLight: 'bg-rose-50',
    bgDark: 'dark:bg-rose-950/40',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
]

const consultationData = [
  { day: 'Lun', cetteSemaine: 32, semaineDerniere: 28 },
  { day: 'Mar', cetteSemaine: 38, semaineDerniere: 35 },
  { day: 'Mer', cetteSemaine: 45, semaineDerniere: 40 },
  { day: 'Jeu', cetteSemaine: 41, semaineDerniere: 38 },
  { day: 'Ven', cetteSemaine: 36, semaineDerniere: 32 },
  { day: 'Sam', cetteSemaine: 18, semaineDerniere: 15 },
  { day: 'Dim', cetteSemaine: 8, semaineDerniere: 6 },
]

const admissionData = [
  { service: 'Urgences', admissions: 28 },
  { service: 'Chirurgie', admissions: 19 },
  { service: 'Maternité', admissions: 24 },
  { service: 'Pédiatrie', admissions: 15 },
  { service: 'Méd. Interne', admissions: 21 },
]

const upcomingAppointments = [
  { id: 1, patient: 'Fatoumata Camara', doctor: 'Dr. Diallo', time: '09:00', status: 'Confirmé' as const },
  { id: 2, patient: 'Ibrahim Keita', doctor: 'Dr. Bah', time: '09:30', status: 'En attente' as const },
  { id: 3, patient: 'Aminata Touré', doctor: 'Dr. Diallo', time: '10:00', status: 'Urgent' as const },
  { id: 4, patient: 'Moussa Condé', doctor: 'Dr. Souaré', time: '10:30', status: 'Confirmé' as const },
  { id: 5, patient: 'Kadiatou Diallo', doctor: 'Dr. Bah', time: '11:00', status: 'En attente' as const },
]

const stockAlerts = [
  { id: 1, name: 'Paracétamol 500mg', stock: 45, min: 200, unit: 'comprimés' },
  { id: 2, name: 'Amoxicilline 250mg', stock: 12, min: 100, unit: 'gélules' },
  { id: 3, name: 'Sérum physiologique', stock: 8, min: 50, unit: 'flacons' },
  { id: 4, name: 'Quinine 300mg', stock: 23, min: 80, unit: 'ampoules' },
  { id: 5, name: 'Métronidazole', stock: 5, min: 60, unit: 'comprimés' },
]

const pathologies = [
  { name: 'Paludisme', count: 145, percentage: 28 },
  { name: 'IRA', count: 98, percentage: 19 },
  { name: 'Diarrhée', count: 76, percentage: 15 },
  { name: 'Hypertension', count: 62, percentage: 12 },
  { name: 'Diabète', count: 48, percentage: 9 },
]

const departmentPerformance = [
  { name: 'Urgences', waitTime: '22 min', satisfaction: 4.2, color: 'rose' },
  { name: 'Maternité', waitTime: '18 min', satisfaction: 4.5, color: 'pink' },
  { name: 'Pédiatrie', waitTime: '15 min', satisfaction: 4.7, color: 'sky' },
  { name: 'Chirurgie', waitTime: '25 min', satisfaction: 4.0, color: 'teal' },
  { name: 'Méd. Interne', waitTime: '20 min', satisfaction: 4.3, color: 'emerald' },
]

/* ─────────── Status Badge Helper ─────────── */

function StatusBadge({ status }: { status: 'Confirmé' | 'En attente' | 'Urgent' }) {
  const variants: Record<string, string> = {
    'Confirmé': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    'En attente': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    'Urgent': 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
  }
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${variants[status]}`}>
      {status === 'Urgent' && <AlertTriangle className="mr-1 size-3" />}
      {status}
    </span>
  )
}

/* ─────────── Custom Tooltip ─────────── */

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 shadow-xl">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  )
}

/* ─────────── Main Dashboard Component ─────────── */

export function DashboardPage() {
  const today = new Date()
  const dateStr = today.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <motion.div
      className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ───── Welcome Header ───── */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Bonjour, Dr. Mamadou Diallo
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            <Activity className="size-4 text-teal-500" />
            <span className="capitalize">{dateStr}</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-teal-600 dark:text-teal-400 font-medium">Hôpital Donka</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 text-xs px-3 py-1">
            <span className="mr-1.5 size-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
            Système opérationnel
          </Badge>
        </div>
      </motion.div>

      {/* ───── KPI Cards Row ───── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, index) => (
          <motion.div key={kpi.label} variants={itemVariants}>
            <motion.div
              variants={cardHover}
              initial="rest"
              whileHover="hover"
              className="h-full"
            >
              <Card className="relative overflow-hidden border-slate-200/60 dark:border-slate-800/60 h-full">
                {/* Gradient accent at top */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${kpi.gradient}`} />
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {kpi.label}
                      </p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                        {kpi.value}
                      </p>
                      <div className="flex items-center gap-1.5">
                        {kpi.trendUp ? (
                          <TrendingUp className="size-3.5 text-emerald-500" />
                        ) : (
                          <TrendingDown className="size-3.5 text-rose-500" />
                        )}
                        <span className={`text-xs font-semibold ${kpi.trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {kpi.trend}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          {kpi.sublabel}
                        </span>
                      </div>
                    </div>
                    <div className={`flex items-center justify-center size-12 rounded-xl ${kpi.bgLight} ${kpi.bgDark}`}>
                      <kpi.icon className={`size-6 ${kpi.iconColor}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* ───── Charts Row ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Consultations Line Chart */}
        <motion.div variants={itemVariants}>
          <Card className="border-slate-200/60 dark:border-slate-800/60 h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
                    Consultations cette semaine
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Comparaison avec la semaine précédente
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-teal-500" />
                    Cette semaine
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                    Semaine dernière
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={consultationData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradientTeal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradientGray" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 12, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="semaineDerniere"
                      stroke="#94a3b8"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      fill="url(#gradientGray)"
                      name="Semaine dernière"
                    />
                    <Area
                      type="monotone"
                      dataKey="cetteSemaine"
                      stroke="#14b8a6"
                      strokeWidth={2.5}
                      fill="url(#gradientTeal)"
                      name="Cette semaine"
                      dot={{ r: 4, fill: '#14b8a6', stroke: '#fff', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: '#14b8a6', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Admissions Bar Chart */}
        <motion.div variants={itemVariants}>
          <Card className="border-slate-200/60 dark:border-slate-800/60 h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
                    Admissions par service
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Répartition des admissions ce mois
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <ArrowRight className="size-3.5" />
                  107 total
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={admissionData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" />
                        <stop offset="95%" stopColor="#0d9488" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                    <XAxis
                      dataKey="service"
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="admissions"
                      fill="url(#barGradient)"
                      radius={[6, 6, 0, 0]}
                      name="Admissions"
                      maxBarSize={48}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ───── Middle Row ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upcoming Appointments */}
        <motion.div variants={itemVariants}>
          <Card className="border-slate-200/60 dark:border-slate-800/60 h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center size-8 rounded-lg bg-teal-50 dark:bg-teal-950/40">
                    <Calendar className="size-4 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
                      Prochains rendez-vous
                    </CardTitle>
                    <CardDescription className="text-xs">
                      5 rendez-vous à venir
                    </CardDescription>
                  </div>
                </div>
                <button className="text-xs text-teal-600 dark:text-teal-400 font-medium hover:underline flex items-center gap-1">
                  Voir tout <ArrowRight className="size-3" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
                {upcomingAppointments.map((apt) => (
                  <motion.div
                    key={apt.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: apt.id * 0.06 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    <div className="flex items-center justify-center size-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
                      <Clock className="size-4 text-slate-400 dark:text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {apt.patient}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {apt.doctor}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {apt.time}
                      </span>
                      <StatusBadge status={apt.status} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Critical Stock Alerts */}
        <motion.div variants={itemVariants}>
          <Card className="border-slate-200/60 dark:border-slate-800/60 h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center size-8 rounded-lg bg-rose-50 dark:bg-rose-950/40">
                    <AlertTriangle className="size-4 text-rose-600 dark:text-rose-400" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
                      Alertes stocks critiques
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Médicaments sous seuil minimum
                    </CardDescription>
                  </div>
                </div>
                <button className="text-xs text-rose-600 dark:text-rose-400 font-medium hover:underline flex items-center gap-1">
                  Gérer <ArrowRight className="size-3" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
                {stockAlerts.map((item, index) => {
                  const percentage = Math.round((item.stock / item.min) * 100)
                  const isCritical = percentage < 15
                  const isWarning = percentage >= 15 && percentage < 40
                  const barColor = isCritical
                    ? 'bg-rose-500'
                    : isWarning
                      ? 'bg-amber-500'
                      : 'bg-teal-500'
                  const barBg = isCritical
                    ? 'bg-rose-100 dark:bg-rose-950/30'
                    : isWarning
                      ? 'bg-amber-100 dark:bg-amber-950/30'
                      : 'bg-teal-100 dark:bg-teal-950/30'

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.06 }}
                      className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate pr-2">
                          {item.name}
                        </p>
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 shrink-0 ${
                            isCritical
                              ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                              : isWarning
                                ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                                : 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800'
                          }`}
                        >
                          {isCritical ? 'Critique' : isWarning ? 'Faible' : 'Attention'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className={`flex-1 h-2 rounded-full ${barBg} overflow-hidden`}>
                          <motion.div
                            className={`h-full rounded-full ${barColor}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(percentage, 100)}%` }}
                            transition={{ duration: 1, delay: index * 0.1, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{item.stock}</span> {item.unit}
                        </span>
                        <span>
                          Min: {item.min} {item.unit}
                        </span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ───── Bottom Row ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Frequent Pathologies */}
        <motion.div variants={itemVariants}>
          <Card className="border-slate-200/60 dark:border-slate-800/60 h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center size-8 rounded-lg bg-purple-50 dark:bg-purple-950/40">
                    <Stethoscope className="size-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
                      Pathologies fréquentes
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Top 5 diagnostics ce mois
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {pathologies.map((pathology, index) => {
                  const colors = [
                    { bar: 'bg-teal-500', bg: 'bg-teal-100 dark:bg-teal-950/30', text: 'text-teal-700 dark:text-teal-300' },
                    { bar: 'bg-cyan-500', bg: 'bg-cyan-100 dark:bg-cyan-950/30', text: 'text-cyan-700 dark:text-cyan-300' },
                    { bar: 'bg-amber-500', bg: 'bg-amber-100 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-300' },
                    { bar: 'bg-rose-500', bg: 'bg-rose-100 dark:bg-rose-950/30', text: 'text-rose-700 dark:text-rose-300' },
                    { bar: 'bg-purple-500', bg: 'bg-purple-100 dark:bg-purple-950/30', text: 'text-purple-700 dark:text-purple-300' },
                  ]
                  const color = colors[index]

                  return (
                    <div key={pathology.name} className="group">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center size-6 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400">
                            {index + 1}
                          </span>
                          <span className="text-sm font-medium text-slate-900 dark:text-white">
                            {pathology.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold ${color.text}`}>
                            {pathology.count} cas
                          </span>
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            {pathology.percentage}%
                          </span>
                        </div>
                      </div>
                      <div className={`h-2 rounded-full ${color.bg} overflow-hidden`}>
                        <motion.div
                          className={`h-full rounded-full ${color.bar}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${pathology.percentage * 3.2}%` }}
                          transition={{ duration: 0.8, delay: index * 0.1, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Department Performance */}
        <motion.div variants={itemVariants}>
          <Card className="border-slate-200/60 dark:border-slate-800/60 h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center size-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40">
                    <Heart className="size-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
                      Performance services
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Temps d&apos;attente et satisfaction
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {departmentPerformance.map((dept, index) => {
                  const deptIcons: Record<string, React.ComponentType<{ className?: string }>> = {
                    Urgences: Siren,
                    Maternité: Heart,
                    Pédiatrie: Thermometer,
                    Chirurgie: Activity,
                    'Méd. Interne': Stethoscope,
                  }
                  const satisfactionColor = dept.satisfaction >= 4.5
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : dept.satisfaction >= 4.0
                      ? 'text-teal-600 dark:text-teal-400'
                      : 'text-amber-600 dark:text-amber-400'

                  const DeptIcon = deptIcons[dept.name] || Activity

                  return (
                    <motion.div
                      key={dept.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.06 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center justify-center size-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
                        <DeptIcon className="size-4 text-slate-500 dark:text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {dept.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Clock className="size-3 text-slate-400" />
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            Attente: {dept.waitTime}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Star className={`size-4 ${satisfactionColor} fill-current`} />
                        <span className={`text-sm font-bold ${satisfactionColor}`}>
                          {dept.satisfaction}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">/5</span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </motion.div>
  )
}
