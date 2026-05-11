'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity, AlertTriangle, TrendingUp, TrendingDown, Minus, Shield, Map, BarChart3, Eye, Search, ChevronRight, X, Users, Skull
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area,
} from 'recharts'
import { useDataStore, type EpidemiologicalAlert, type SurveillanceAlertLevel } from '@/lib/data-store'
import { SurveillanceMap } from '@/components/ai/surveillance-map'
import { AlertDetail } from '@/components/ai/alert-detail'

/* ─────────── Animation ─────────── */

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } }

/* ─────────── Alert Level Helpers ─────────── */

function getAlertLevelBadge(level: SurveillanceAlertLevel) {
  switch (level) {
    case 'ÉPIDÉMIE': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800'
    case 'ALERTE': return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
    case 'VEILLE': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
  }
}

function getRiskColor(score: number): string {
  if (score >= 80) return 'text-red-600 dark:text-red-400'
  if (score >= 60) return 'text-amber-600 dark:text-amber-400'
  if (score >= 40) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-emerald-600 dark:text-emerald-400'
}

function getRiskBarColor(score: number): string {
  if (score >= 80) return 'bg-red-500'
  if (score >= 60) return 'bg-amber-500'
  if (score >= 40) return 'bg-yellow-500'
  return 'bg-emerald-500'
}

function getTrendIcon(trend: string) {
  switch (trend) {
    case 'hausse': return <TrendingUp className="size-4 text-red-500" />
    case 'baisse': return <TrendingDown className="size-4 text-emerald-500" />
    default: return <Minus className="size-4 text-slate-400" />
  }
}

/* ─────────── Main Component ─────────── */

export function SurveillanceDashboard() {
  const { epidemiologicalAlerts, surveillanceData, outbreakPredictions } = useDataStore()
  const [selectedAlert, setSelectedAlert] = useState<EpidemiologicalAlert | null>(null)
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    if (!searchQuery.trim()) return epidemiologicalAlerts
    const q = searchQuery.toLowerCase()
    return epidemiologicalAlerts.filter(a =>
      a.disease.toLowerCase().includes(q) ||
      a.location.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q)
    )
  }, [epidemiologicalAlerts, searchQuery])

  // Zone-specific alerts
  const zoneAlerts = useMemo(() => {
    if (!selectedZone) return epidemiologicalAlerts
    const zone = selectedZone
    return epidemiologicalAlerts.filter(a => a.location.toLowerCase().includes(zone) || a.healthZone.toLowerCase().includes(zone))
  }, [epidemiologicalAlerts, selectedZone])

  // Chart data
  const paludismeData = useMemo(() =>
    surveillanceData.filter(d => d.disease === 'Paludisme').map(d => ({ date: d.date.slice(5), cas: d.caseCount, décès: d.deathCount })),
    [surveillanceData]
  )

  const choleraData = useMemo(() =>
    surveillanceData.filter(d => d.disease === 'Choléra').map(d => ({ date: d.date.slice(5), cas: d.caseCount, décès: d.deathCount })),
    [surveillanceData]
  )

  const allDiseasesTrend = useMemo(() => {
    const dates = [...new Set(surveillanceData.map(d => d.date))].sort()
    return dates.map(date => {
      const dayData = surveillanceData.filter(d => d.date === date)
      return {
        date: date.slice(5),
        Paludisme: dayData.filter(d => d.disease === 'Paludisme').reduce((s, d) => s + d.caseCount, 0),
        Choléra: dayData.filter(d => d.disease === 'Choléra').reduce((s, d) => s + d.caseCount, 0),
        Rougeole: dayData.filter(d => d.disease === 'Rougeole').reduce((s, d) => s + d.caseCount, 0),
        Méningite: dayData.filter(d => d.disease === 'Méningite').reduce((s, d) => s + d.caseCount, 0),
      }
    })
  }, [surveillanceData])

  // Stats
  const activeAlerts = epidemiologicalAlerts.filter(a => a.status === 'Actif').length
  const totalCases = epidemiologicalAlerts.reduce((sum, a) => sum + a.caseCount, 0)
  const totalDeaths = epidemiologicalAlerts.reduce((sum, a) => sum + a.deathCount, 0)
  const criticalAlerts = epidemiologicalAlerts.filter(a => a.alertLevel === 'ÉPIDÉMIE').length

  if (selectedAlert) {
    return <AlertDetail alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
  }

  return (
    <motion.div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto" variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 shadow-lg shadow-cyan-500/20">
            <Activity className="size-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Surveillance épidémiologique</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Surveillance en temps réel des maladies en Guinée</p>
          </div>
        </div>
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 text-xs w-fit">
          <span className="mr-1.5 size-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
          Surveillance active
        </Badge>
      </motion.div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Alertes actives', value: activeAlerts, icon: AlertTriangle, color: 'from-red-500 to-rose-600', iconBg: 'bg-red-50 dark:bg-red-950/40', iconColor: 'text-red-600 dark:text-red-400' },
          { label: 'Total cas', value: totalCases, icon: Users, color: 'from-amber-500 to-orange-600', iconBg: 'bg-amber-50 dark:bg-amber-950/40', iconColor: 'text-amber-600 dark:text-amber-400' },
          { label: 'Décès', value: totalDeaths, icon: Skull, color: 'from-slate-600 to-slate-700', iconBg: 'bg-slate-100 dark:bg-slate-800', iconColor: 'text-slate-600 dark:text-slate-400' },
          { label: 'Épidémies', value: criticalAlerts, icon: Shield, color: 'from-purple-500 to-violet-600', iconBg: 'bg-purple-50 dark:bg-purple-950/40', iconColor: 'text-purple-600 dark:text-purple-400' },
        ].map(stat => (
          <motion.div key={stat.label} variants={itemVariants}>
            <Card className="relative overflow-hidden border-slate-200/60 dark:border-slate-800/60">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />
              <CardContent className="pt-5 pb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
                </div>
                <div className={`flex items-center justify-center size-11 rounded-xl ${stat.iconBg}`}>
                  <stat.icon className={`size-5 ${stat.iconColor}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="map" className="space-y-4">
        <TabsList>
          <TabsTrigger value="map" className="text-xs"><Map className="size-3.5 mr-1.5" />Carte</TabsTrigger>
          <TabsTrigger value="trends" className="text-xs"><BarChart3 className="size-3.5 mr-1.5" />Tendances</TabsTrigger>
          <TabsTrigger value="alerts" className="text-xs"><AlertTriangle className="size-3.5 mr-1.5" />Alertes</TabsTrigger>
          <TabsTrigger value="predictions" className="text-xs"><TrendingUp className="size-3.5 mr-1.5" />Prédictions</TabsTrigger>
        </TabsList>

        {/* Map Tab */}
        <TabsContent value="map" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <Card className="border-slate-200/60 dark:border-slate-800/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Carte des zones de santé</CardTitle>
                  <CardDescription className="text-xs">Cliquez sur une zone pour filtrer les alertes</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <SurveillanceMap
                    alerts={epidemiologicalAlerts}
                    onZoneClick={(id) => setSelectedZone(selectedZone === id ? null : id)}
                    selectedZone={selectedZone}
                  />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-slate-200/60 dark:border-slate-800/60 h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {selectedZone ? `Alertes — ${selectedZone}` : 'Toutes les alertes'}
                    </CardTitle>
                    {selectedZone && (
                      <Button variant="ghost" size="sm" onClick={() => setSelectedZone(null)} className="text-xs h-7">
                        <X className="size-3 mr-1" /> Réinitialiser
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                    {zoneAlerts.map((alert, i) => (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedAlert(alert)}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">{alert.disease}</span>
                          <Badge variant="outline" className={`text-[9px] shrink-0 ${getAlertLevelBadge(alert.alertLevel)}`}>
                            {alert.alertLevel}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5">{alert.location} • {alert.healthZone}</p>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-amber-600 dark:text-amber-400 font-medium">{alert.caseCount} cas</span>
                          {alert.deathCount > 0 && (
                            <span className="text-red-600 dark:text-red-400 font-medium">{alert.deathCount} décès</span>
                          )}
                        </div>
                        <div className="flex items-center justify-end mt-1.5">
                          <ChevronRight className="size-3.5 text-slate-400" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-slate-200/60 dark:border-slate-800/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Tendance paludisme — Conakry</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={paludismeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="cas" stroke="#14b8a6" strokeWidth={2} fill="#14b8a6" fillOpacity={0.15} name="Cas" />
                      <Area type="monotone" dataKey="décès" stroke="#ef4444" strokeWidth={2} fill="#ef4444" fillOpacity={0.1} name="Décès" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200/60 dark:border-slate-800/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Tendance choléra — Kindia</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={choleraData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="cas" stroke="#f59e0b" strokeWidth={2} fill="#f59e0b" fillOpacity={0.15} name="Cas" />
                      <Area type="monotone" dataKey="décès" stroke="#ef4444" strokeWidth={2} fill="#ef4444" fillOpacity={0.1} name="Décès" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200/60 dark:border-slate-800/60 lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Toutes maladies — Comparaison</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={allDiseasesTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="Paludisme" stroke="#14b8a6" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="Choléra" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="Rougeole" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="Méningite" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input placeholder="Rechercher par maladie, lieu..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
          <div className="space-y-3">
            {filteredAlerts.map((alert, i) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="cursor-pointer"
                onClick={() => setSelectedAlert(alert)}
              >
                <Card className="border-slate-200/60 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          alert.alertLevel === 'ÉPIDÉMIE' ? 'bg-red-50 dark:bg-red-950/30' :
                          alert.alertLevel === 'ALERTE' ? 'bg-amber-50 dark:bg-amber-950/30' :
                          'bg-emerald-50 dark:bg-emerald-950/30'
                        }`}>
                          <AlertTriangle className={`size-5 ${
                            alert.alertLevel === 'ÉPIDÉMIE' ? 'text-red-500' :
                            alert.alertLevel === 'ALERTE' ? 'text-amber-500' :
                            'text-emerald-500'
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">{alert.disease}</span>
                            <Badge variant="outline" className={`text-[9px] ${getAlertLevelBadge(alert.alertLevel)}`}>
                              {alert.alertLevel}
                            </Badge>
                            <Badge variant="outline" className={`text-[9px] ${
                              alert.status === 'Actif' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800' :
                              alert.status === 'En investigation' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' :
                              'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                            }`}>
                              {alert.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{alert.location} • {alert.healthZone}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">{alert.description}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{alert.caseCount}</p>
                        <p className="text-[10px] text-slate-400">cas</p>
                        {alert.deathCount > 0 && (
                          <>
                            <p className="text-sm font-bold text-red-600 dark:text-red-400">{alert.deathCount}</p>
                            <p className="text-[10px] text-slate-400">décès</p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 ml-10">
                      <Eye className="size-3.5 text-slate-400" />
                      <span className="text-[10px] text-slate-400">Premier cas : {alert.firstCaseDate}</span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span className="text-[10px] text-slate-400">Zones : {alert.affectedAreas.join(', ')}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {outbreakPredictions.map((prediction, i) => (
              <motion.div
                key={prediction.disease}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="border-slate-200/60 dark:border-slate-800/60">
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{prediction.disease}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Pic prédit : {prediction.predictedPeakDate}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${getRiskColor(prediction.riskScore)}`}>{prediction.riskScore}</p>
                        <p className="text-[10px] text-slate-400">/100 risque</p>
                      </div>
                    </div>

                    {/* Risk bar */}
                    <div className="mb-3">
                      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${getRiskBarColor(prediction.riskScore)}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${prediction.riskScore}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1 }}
                        />
                      </div>
                    </div>

                    {/* Probability & Confidence */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        <p className="text-[10px] text-slate-400">Probabilité épidémie</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{Math.round(prediction.probability * 100)}%</p>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        <p className="text-[10px] text-slate-400">Confiance</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{Math.round(prediction.confidence * 100)}%</p>
                      </div>
                    </div>

                    {/* Preventive actions */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase">Actions préventives</p>
                      {prediction.preventiveActions.map((action, j) => (
                        <div key={j} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                          <Shield className="size-3 text-teal-500 shrink-0" />
                          {action}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Data quality & DHIS2 */}
      <motion.div variants={itemVariants}>
        <Card className="border-slate-200/60 dark:border-slate-800/60">
          <CardContent className="py-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500">Qualité données</span>
                  <Progress value={85} className="w-20 h-1.5" />
                  <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300">85%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500">Cohérence</span>
                  <Progress value={88} className="w-20 h-1.5" />
                  <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300">88%</span>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] text-slate-400">
                Intégration DHIS2 (à venir)
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Disclaimer */}
      <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
        <p className="text-[10px] text-amber-700 dark:text-amber-300 text-center leading-relaxed">
          ⚠️ Les données de surveillance sont basées sur les signalements disponibles et peuvent ne pas refléter la situation réelle complète. Contactez les autorités sanitaires pour les données officielles.
        </p>
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
