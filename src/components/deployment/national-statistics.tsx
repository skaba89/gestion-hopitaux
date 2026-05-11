'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { motion } from 'framer-motion'
import {
  BarChart3, Users, TrendingUp, TrendingDown, Minus, Heart, Stethoscope,
  MapPin, Activity, Shield, Baby, Pill, Bed, Syringe, CreditCard,
  Database, Globe, Zap, AlertTriangle, CheckCircle2, XCircle,
  ArrowUpRight, ArrowDownRight, MinusCircle, PieChart,
} from 'lucide-react'
import {
  GUINEA_HEALTH_ZONES_FULL, DEMO_FACILITIES, calculateNationalStatistics,
} from '@/lib/national-deployment'

/* ─────────── Helpers ─────────── */

function getTrendIcon(trend: 'up' | 'down' | 'stable') {
  if (trend === 'up') return <ArrowUpRight className="h-4 w-4 text-red-500" />
  if (trend === 'down') return <ArrowDownRight className="h-4 w-4 text-green-500" />
  return <MinusCircle className="h-4 w-4 text-gray-400" />
}

function getTrendLabel(trend: 'up' | 'down' | 'stable') {
  if (trend === 'up') return 'Hausse'
  if (trend === 'down') return 'Baisse'
  return 'Stable'
}

/* ─────────── Main Component ─────────── */

export function NationalStatistics() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedZone, setSelectedZone] = useState<string>('all')
  const stats = calculateNationalStatistics()

  const zoneData = useMemo(() => {
    if (selectedZone === 'all') return null
    return GUINEA_HEALTH_ZONES_FULL.find((z) => z.code === selectedZone)
  }, [selectedZone])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-teal-600" />
            Statistiques Nationales
          </h2>
          <p className="text-muted-foreground mt-1">
            Indicateurs sanitaires — République de Guinée
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
            <Globe className="h-3 w-3 mr-1" />Guinée
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
          <TabsTrigger value="personnel">Personnel</TabsTrigger>
          <TabsTrigger value="pathologies">Pathologies</TabsTrigger>
          <TabsTrigger value="zones">Par Zone</TabsTrigger>
        </TabsList>

        {/* ── Vue d'ensemble ── */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Population', value: `${(stats.totalPopulation / 1000000).toFixed(1)}M`, icon: Users, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-950' },
              { label: 'Établissements', value: String(stats.totalFacilities), icon: Heart, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950' },
              { label: 'Lits hospitaliers', value: stats.totalHospitalBeds.toLocaleString('fr-FR'), icon: Bed, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950' },
              { label: 'Consult./jour', value: String(stats.averageConsultationsPerDay), icon: Stethoscope, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950' },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, ease: 'easeOut' }}>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${stat.bg}`}><stat.icon className={`h-5 w-5 ${stat.color}`} /></div>
                      <div>
                        <p className="text-xl font-bold">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="h-5 w-5 text-emerald-600" />
                  Couverture des systèmes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'HealthFlow (HIS)', value: stats.healthflowCoverage, color: 'bg-teal-500' },
                  { label: 'INS (Identité Nationale)', value: stats.insCoverage, color: 'bg-purple-500' },
                  { label: 'DHIS2 (Rapportage)', value: stats.dhis2ReportingRate, color: 'bg-blue-500' },
                  { label: 'Uptime moyen', value: Math.round(stats.averageUptime), color: 'bg-emerald-500' },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{item.label}</span>
                      <span className="font-semibold">{item.value}%</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <motion.div className={`h-full rounded-full ${item.color}`} initial={{ width: 0 }} animate={{ width: `${item.value}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Ratios de santé
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: 'Médecin / habitant', value: stats.doctorPerCapita, icon: Stethoscope, desc: 'OMS recommande: 1/1000' },
                  { label: 'Infirmier / habitant', value: stats.nursePerCapita, icon: Heart, desc: 'OMS recommande: 1/400' },
                  { label: 'Lit / habitant', value: stats.bedPerCapita, icon: Bed, desc: 'OMS recommande: 1/1000' },
                ].map((item) => (
                  <div key={item.label} className="p-3 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <item.icon className="h-4 w-4 text-teal-600" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      <span className="text-lg font-bold text-teal-600">{item.value}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Personnel ── */}
        <TabsContent value="personnel" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Médecins', value: stats.totalDoctors.toLocaleString('fr-FR'), icon: Stethoscope, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950' },
              { label: 'Infirmiers', value: stats.totalNurses.toLocaleString('fr-FR'), icon: Heart, color: 'text-pink-600', bg: 'bg-pink-50 dark:bg-pink-950' },
              { label: 'Sages-femmes', value: stats.totalMidwives.toLocaleString('fr-FR'), icon: Baby, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950' },
              { label: 'ASC', value: stats.totalASCAgents.toLocaleString('fr-FR'), icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950' },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, ease: 'easeOut' }}>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${stat.bg}`}><stat.icon className={`h-5 w-5 ${stat.color}`} /></div>
                      <div>
                        <p className="text-xl font-bold">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-5 w-5 text-teal-600" />
                Répartition du personnel par zone sanitaire
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {GUINEA_HEALTH_ZONES_FULL.map((zone) => {
                  const totalStaff = zone.doctors + zone.nurses + zone.midwives + zone.ascAgents
                  const maxStaff = Math.max(...GUINEA_HEALTH_ZONES_FULL.map((z) => z.doctors + z.nurses + z.midwives + z.ascAgents))
                  return (
                    <div key={zone.code} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-teal-600" />
                          <span className="font-medium">{zone.name}</span>
                          <span className="text-muted-foreground">({(zone.population / 1000000).toFixed(2)}M hab.)</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-blue-600">{zone.doctors} médecins</span>
                          <span className="text-pink-600">{zone.nurses} inf.</span>
                          <span className="text-purple-600">{zone.midwives} sf</span>
                          <span className="text-emerald-600">{zone.ascAgents} ASC</span>
                        </div>
                      </div>
                      <div className="flex h-3 rounded-full overflow-hidden bg-muted">
                        <motion.div className="bg-blue-500" initial={{ width: 0 }} animate={{ width: `${(zone.doctors / maxStaff) * 100}%` }} transition={{ duration: 0.5, ease: 'easeOut' }} />
                        <motion.div className="bg-pink-500" initial={{ width: 0 }} animate={{ width: `${(zone.nurses / maxStaff) * 100}%` }} transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }} />
                        <motion.div className="bg-purple-500" initial={{ width: 0 }} animate={{ width: `${(zone.midwives / maxStaff) * 100}%` }} transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }} />
                        <motion.div className="bg-emerald-500" initial={{ width: 0 }} animate={{ width: `${(zone.ascAgents / maxStaff) * 100}%` }} transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-blue-500" />Médecins</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-pink-500" />Infirmiers</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-purple-500" />Sages-femmes</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-500" />ASC</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Pathologies ── */}
        <TabsContent value="pathologies" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Top 8 pathologies — Guinée (estimation annuelle)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.topDiseases.map((disease, i) => {
                  const maxCases = stats.topDiseases[0].cases
                  const pct = Math.round((disease.cases / maxCases) * 100)
                  return (
                    <motion.div key={disease.name} className="flex items-center gap-3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08, ease: 'easeOut' }}>
                      <span className="text-sm font-medium w-4 text-right">{i + 1}</span>
                      <span className="text-sm w-40 truncate">{disease.name}</span>
                      <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden relative">
                        <motion.div
                          className={`h-full rounded-full ${disease.trend === 'up' ? 'bg-red-400' : disease.trend === 'down' ? 'bg-green-400' : 'bg-amber-400'}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, delay: i * 0.1, ease: 'easeOut' }}
                        />
                        <span className="absolute inset-0 flex items-center justify-end pr-2 text-xs font-bold">
                          {disease.cases.toLocaleString('fr-FR')}
                        </span>
                      </div>
                      <div className="w-16 flex items-center gap-1">
                        {getTrendIcon(disease.trend)}
                        <span className="text-xs">{getTrendLabel(disease.trend)}</span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-5 w-5 text-red-600" />
                  Pathologies en hausse
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.topDiseases.filter((d) => d.trend === 'up').map((d) => (
                    <div key={d.name} className="flex items-center justify-between p-2 rounded-lg bg-red-50 dark:bg-red-950/50">
                      <div className="flex items-center gap-2">
                        <ArrowUpRight className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium">{d.name}</span>
                      </div>
                      <span className="text-sm font-bold text-red-600">{d.cases.toLocaleString('fr-FR')}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingDown className="h-5 w-5 text-green-600" />
                  Pathologies en baisse
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.topDiseases.filter((d) => d.trend === 'down').map((d) => (
                    <div key={d.name} className="flex items-center justify-between p-2 rounded-lg bg-green-50 dark:bg-green-950/50">
                      <div className="flex items-center gap-2">
                        <ArrowDownRight className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">{d.name}</span>
                      </div>
                      <span className="text-sm font-bold text-green-600">{d.cases.toLocaleString('fr-FR')}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Par Zone ── */}
        <TabsContent value="zones" className="space-y-4 mt-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Zone sanitaire:</span>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant={selectedZone === 'all' ? 'default' : 'outline'} onClick={() => setSelectedZone('all')}>Toutes</Button>
              {GUINEA_HEALTH_ZONES_FULL.map((z) => (
                <Button key={z.code} size="sm" variant={selectedZone === z.code ? 'default' : 'outline'} onClick={() => setSelectedZone(z.code)}>{z.name}</Button>
              ))}
            </div>
          </div>

          {selectedZone === 'all' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {GUINEA_HEALTH_ZONES_FULL.map((zone, i) => (
                <motion.div key={zone.code} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, ease: 'easeOut' }}>
                  <Card className="border-l-4 border-l-teal-400">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="h-4 w-4 text-teal-600" />
                        <h3 className="font-semibold">{zone.name}</h3>
                        <Badge variant="outline" className="text-xs">{(zone.population / 1000000).toFixed(2)}M hab.</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="text-muted-foreground">Établissements:</span> <span className="font-medium">{zone.healthFacilities}</span></div>
                        <div><span className="text-muted-foreground">Médecins:</span> <span className="font-medium">{zone.doctors}</span></div>
                        <div><span className="text-muted-foreground">Lits:</span> <span className="font-medium">{zone.hospitalBeds}</span></div>
                        <div><span className="text-muted-foreground">Districts:</span> <span className="font-medium">{zone.districts.length}</span></div>
                        <div><span className="text-muted-foreground">Ambulances:</span> <span className="font-medium">{zone.ambulances}</span></div>
                        <div><span className="text-muted-foreground">Connectivité:</span> <span className="font-medium">{zone.connectivity.toUpperCase()}</span></div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : zoneData ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-teal-600" />
                    {zoneData.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 rounded-lg bg-teal-50 dark:bg-teal-950"><p className="text-xl font-bold text-teal-600">{(zoneData.population / 1000000).toFixed(2)}M</p><p className="text-xs text-muted-foreground">Population</p></div>
                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950"><p className="text-xl font-bold text-blue-600">{zoneData.healthFacilities}</p><p className="text-xs text-muted-foreground">Établissements</p></div>
                    <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950"><p className="text-xl font-bold text-purple-600">{zoneData.doctors}</p><p className="text-xs text-muted-foreground">Médecins</p></div>
                    <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950"><p className="text-xl font-bold text-emerald-600">{zoneData.hospitalBeds}</p><p className="text-xs text-muted-foreground">Lits</p></div>
                  </div>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-sm font-medium mb-2">Districts ({zoneData.districts.length})</p>
                    <div className="space-y-2">
                      {zoneData.districts.map((d) => (
                        <div key={d.code} className="flex items-center justify-between p-2 rounded-lg border">
                          <div>
                            <p className="text-sm font-medium">{d.name}</p>
                            <p className="text-xs text-muted-foreground">{d.mainFacility} — {(d.population / 1000).toFixed(0)}k hab.</p>
                          </div>
                          <Badge variant="outline" className={`text-xs ${d.healthflowStatus === 'deployed' ? 'bg-green-50 text-green-700' : d.healthflowStatus === 'partial' ? 'bg-amber-50 text-amber-700' : 'bg-gray-50 text-gray-500'}`}>
                            {d.healthflowStatus === 'deployed' ? 'Déployé' : d.healthflowStatus === 'partial' ? 'Partiel' : d.healthflowStatus === 'pending' ? 'En attente' : 'Planifié'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  )
}
