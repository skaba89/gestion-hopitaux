'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Target, Users, Clock, CheckCircle2, AlertTriangle, XCircle,
  ChevronDown, ChevronUp, TrendingUp, BarChart3, Shield, Zap,
  Server, Activity, GraduationCap, DollarSign, Calendar,
  ArrowRight, CircleDot,
} from 'lucide-react'
import {
  GUINEA_HEALTH_ZONES_FULL, DEMO_DEPLOYMENT_PLANS, DEMO_TRAINING_SESSIONS,
  DEMO_INFRA_ALERTS, calculateNationalStatistics,
  PHASE_LABELS, PHASE_COLORS, TRAINING_MODULE_LABELS,
  type DeploymentPlan, type TrainingSession,
} from '@/lib/national-deployment'

/* ─────────── Helpers ─────────── */

function getZoneLabel(code: string): string {
  return GUINEA_HEALTH_ZONES_FULL.find((z) => z.code === code)?.name ?? code
}

function getPhaseProgress(phase: DeploymentPlan['phase']): number {
  const phases = ['planning', 'installation', 'configuration', 'training', 'go-live', 'monitoring', 'completed']
  return Math.round((phases.indexOf(phase) / (phases.length - 1)) * 100)
}

function getSeverityConfig(severity: 'info' | 'warning' | 'critical') {
  const config = {
    info: { Icon: Activity, className: 'bg-blue-100 text-blue-700 border-blue-200', dotClass: 'bg-blue-500' },
    warning: { Icon: AlertTriangle, className: 'bg-amber-100 text-amber-700 border-amber-200', dotClass: 'bg-amber-500' },
    critical: { Icon: XCircle, className: 'bg-red-100 text-red-700 border-red-200', dotClass: 'bg-red-500 animate-pulse' },
  }
  return config[severity]
}

function getTrainingStatusBadge(status: TrainingSession['status']) {
  const config = {
    planned: { label: 'Planifié', className: 'bg-gray-100 text-gray-700 border-gray-200' },
    'in-progress': { label: 'En cours', className: 'bg-blue-100 text-blue-700 border-blue-200' },
    completed: { label: 'Terminé', className: 'bg-green-100 text-green-700 border-green-200' },
    cancelled: { label: 'Annulé', className: 'bg-red-100 text-red-700 border-red-200' },
  }
  const c = config[status]
  return <Badge variant="outline" className={c.className}>{c.label}</Badge>
}

/* ─────────── Main Component ─────────── */

export function NationalSupervision() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null)
  const stats = calculateNationalStatistics()

  const totalBudget = DEMO_DEPLOYMENT_PLANS.reduce((s, p) => s + p.budgetAllocated, 0)
  const totalSpent = DEMO_DEPLOYMENT_PLANS.reduce((s, p) => s + p.budgetSpent, 0)
  const overallProgress = Math.round(DEMO_DEPLOYMENT_PLANS.reduce((s, p) => s + p.progress, 0) / DEMO_DEPLOYMENT_PLANS.length)
  const activeAlerts = DEMO_INFRA_ALERTS.filter((a) => !a.resolvedAt)
  const criticalAlerts = activeAlerts.filter((a) => a.severity === 'critical')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-teal-600" />
            Supervision Nationale
          </h2>
          <p className="text-muted-foreground mt-1">
            Déploiement national HealthFlow — République de Guinée
          </p>
        </div>
        <div className="flex gap-2">
          {criticalAlerts.length > 0 && (
            <Badge className="bg-red-100 text-red-700 border-red-200 animate-pulse">
              <XCircle className="h-3 w-3 mr-1" />{criticalAlerts.length} alerte(s) critique(s)
            </Badge>
          )}
          <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
            <Target className="h-3 w-3 mr-1" />{overallProgress}% global
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
          <TabsTrigger value="deployment">Déploiement</TabsTrigger>
          <TabsTrigger value="training">Formation</TabsTrigger>
          <TabsTrigger value="alerts">Alertes ({activeAlerts.length})</TabsTrigger>
        </TabsList>

        {/* ── Tableau de bord ── */}
        <TabsContent value="dashboard" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Progression globale', value: `${overallProgress}%`, icon: Target, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-950' },
              { label: 'Zones déployées', value: `${GUINEA_HEALTH_ZONES_FULL.filter((z) => z.healthflowStatus === 'deployed' || z.healthflowStatus === 'partial').length}/8`, icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950' },
              { label: 'Budget utilisé', value: `${Math.round((totalSpent / totalBudget) * 100)}%`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950' },
              { label: 'Personnel formé', value: String(DEMO_TRAINING_SESSIONS.filter((t) => t.status === 'completed').reduce((s, t) => s + t.participants.length, 0)), icon: GraduationCap, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950' },
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

          {/* Progress by Zone */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Progression du déploiement par zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {DEMO_DEPLOYMENT_PLANS.map((plan) => (
                  <div key={plan.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-teal-600" />
                        <span className="text-sm font-medium">{plan.zoneName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={PHASE_COLORS[plan.phase]}>{PHASE_LABELS[plan.phase]}</Badge>
                        <span className="text-sm font-semibold">{plan.progress}%</span>
                      </div>
                    </div>
                    <Progress value={plan.progress} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Budget Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                  Budget Déploiement National
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Budget alloué</span>
                    <span className="font-semibold">{(totalBudget / 1000000).toFixed(1)}M GNF</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Dépensé</span>
                    <span className="font-semibold">{(totalSpent / 1000000).toFixed(1)}M GNF</span>
                  </div>
                  <Progress value={Math.round((totalSpent / totalBudget) * 100)} className="h-3" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{Math.round((totalSpent / totalBudget) * 100)}% utilisé</span>
                    <span>Reste: {((totalBudget - totalSpent) / 1000000).toFixed(1)}M GNF</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Statistiques Nationales Clés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted-foreground">Population couverte</span>
                    <span className="font-medium">{(stats.totalPopulation / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted-foreground">Médecins /habitant</span>
                    <span className="font-medium">{stats.doctorPerCapita}</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted-foreground">Lits /habitant</span>
                    <span className="font-medium">{stats.bedPerCapita}</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted-foreground">Couverture HealthFlow</span>
                    <span className="font-medium">{stats.healthflowCoverage}%</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted-foreground">Taux rapportage DHIS2</span>
                    <span className="font-medium">{stats.dhis2ReportingRate}%</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted-foreground">Couverture INS</span>
                    <span className="font-medium">{stats.insCoverage}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Diseases */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-5 w-5 text-red-600" />
                Pathologies les plus fréquentes (Guinée)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.topDiseases.map((disease, i) => (
                  <div key={disease.name} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-4">{i + 1}</span>
                    <span className="text-sm flex-1">{disease.name}</span>
                    <span className="text-sm font-semibold">{disease.cases.toLocaleString('fr-FR')}</span>
                    <Badge variant="outline" className={`text-xs ${disease.trend === 'up' ? 'bg-red-50 text-red-700 border-red-200' : disease.trend === 'down' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                      {disease.trend === 'up' ? '↗ Hausse' : disease.trend === 'down' ? '↘ Baisse' : '→ Stable'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Déploiement ── */}
        <TabsContent value="deployment" className="space-y-4 mt-4">
          {DEMO_DEPLOYMENT_PLANS.map((plan, i) => {
            const isExpanded = expandedPlan === plan.id
            return (
              <motion.div key={plan.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, ease: 'easeOut' }}>
                <Card className={`transition-all ${isExpanded ? 'ring-2 ring-teal-200 dark:ring-teal-800' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between cursor-pointer" onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}>
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <MapPin className="h-5 w-5 text-teal-600" />
                          <h3 className="font-semibold text-base">{plan.zoneName}</h3>
                          <Badge variant="outline" className={PHASE_COLORS[plan.phase]}>{PHASE_LABELS[plan.phase]}</Badge>
                          <Badge variant="outline" className="text-xs">{plan.facilities.length} établissement(s)</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-muted-foreground">Début: {plan.startDate}</span>
                          <span className="text-muted-foreground">Go-Live: {plan.targetGoLive}</span>
                          <span className="font-medium">{plan.progress}%</span>
                        </div>
                        <Progress value={plan.progress} className="h-2" />
                      </div>
                      {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ ease: 'easeOut' }} className="overflow-hidden">
                          <div className="pt-4 space-y-4">
                            {/* Facilities in this plan */}
                            <div>
                              <p className="text-sm font-medium mb-2">Établissements</p>
                              <div className="space-y-2">
                                {plan.facilities.map((f) => (
                                  <div key={f.facilityId} className="flex items-center justify-between p-3 rounded-lg border">
                                    <div>
                                      <p className="text-sm font-medium">{f.facilityName}</p>
                                      <div className="flex items-center gap-1.5 mt-1">
                                        <Badge variant="outline" className={`text-xs ${PHASE_COLORS[f.phase]}`}>{PHASE_LABELS[f.phase]}</Badge>
                                        <span className="text-xs text-muted-foreground">{f.progress}%</span>
                                      </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1 max-w-xs">
                                      {f.completedSteps.map((s) => (
                                        <Badge key={s} className="bg-green-100 text-green-700 border-green-200 text-xs"><CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />{s}</Badge>
                                      ))}
                                      {f.remainingSteps.map((s) => (
                                        <Badge key={s} variant="outline" className="text-xs text-muted-foreground"><CircleDot className="h-2.5 w-2.5 mr-0.5" />{s}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Milestones */}
                            <div>
                              <p className="text-sm font-medium mb-2">Jalons</p>
                              <div className="space-y-2">
                                {plan.milestones.map((m) => (
                                  <div key={m.name} className="flex items-center gap-3 text-sm">
                                    {m.completed ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <CircleDot className="h-4 w-4 text-gray-400" />}
                                    <span className={m.completed ? 'font-medium' : 'text-muted-foreground'}>{m.name}</span>
                                    {m.date && <span className="text-xs text-muted-foreground ml-auto">{m.date}</span>}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Risks */}
                            {plan.risks.length > 0 && (
                              <div>
                                <p className="text-sm font-medium mb-2">Risques</p>
                                <div className="space-y-2">
                                  {plan.risks.map((r, ri) => (
                                    <div key={ri} className={`p-3 rounded-lg border ${r.severity === 'critical' ? 'bg-red-50 border-red-200' : r.severity === 'high' ? 'bg-orange-50 border-orange-200' : 'bg-amber-50 border-amber-200'}`}>
                                      <div className="flex items-center gap-2 mb-1">
                                        <AlertTriangle className="h-3.5 w-3.5" />
                                        <span className="text-sm font-medium">{r.description}</span>
                                        <Badge variant="outline" className="text-xs ml-auto">{r.severity}</Badge>
                                      </div>
                                      <p className="text-xs text-muted-foreground ml-5.5">Mitigation: {r.mitigation}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Budget */}
                            <div className="flex items-center justify-between text-sm p-3 rounded-lg bg-muted/50">
                              <span>Budget: {(plan.budgetAllocated / 1000000).toFixed(1)}M GNF</span>
                              <span>Dépensé: {(plan.budgetSpent / 1000000).toFixed(1)}M GNF ({Math.round((plan.budgetSpent / plan.budgetAllocated) * 100)}%)</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </TabsContent>

        {/* ── Formation ── */}
        <TabsContent value="training" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Sessions complétées', value: String(DEMO_TRAINING_SESSIONS.filter((t) => t.status === 'completed').length), icon: CheckCircle2, color: 'text-green-600' },
              { label: 'En cours', value: String(DEMO_TRAINING_SESSIONS.filter((t) => t.status === 'in-progress').length), icon: Clock, color: 'text-blue-600' },
              { label: 'Personnes certifiées', value: String(DEMO_TRAINING_SESSIONS.flatMap((t) => t.participants).filter((p) => p.status === 'certified').length), icon: GraduationCap, color: 'text-purple-600' },
              { label: 'Score moyen', value: `${Math.round(DEMO_TRAINING_SESSIONS.filter((t) => t.averageScore > 0).reduce((s, t) => s + t.averageScore, 0) / DEMO_TRAINING_SESSIONS.filter((t) => t.averageScore > 0).length)}%`, icon: BarChart3, color: 'text-teal-600' },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, ease: 'easeOut' }}>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
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

          <div className="space-y-3">
            {DEMO_TRAINING_SESSIONS.map((session, i) => (
              <motion.div key={session.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, ease: 'easeOut' }}>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <GraduationCap className="h-4 w-4 text-purple-600" />
                          <h3 className="font-semibold text-sm">{session.moduleName}</h3>
                          {getTrainingStatusBadge(session.status)}
                          <Badge variant="outline" className="text-xs">{getZoneLabel(session.zoneCode)}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{session.facilityName}</span>
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{session.startDate} → {session.endDate}</span>
                          <span className="flex items-center gap-1"><Users className="h-3 w-3" />{session.participants.length} participants</span>
                        </div>
                        {session.status !== 'planned' && (
                          <div className="flex items-center gap-3">
                            <Progress value={session.completionRate} className="flex-1 h-1.5" />
                            <span className="text-xs font-medium">{session.completionRate}%</span>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1.5">
                          {session.participants.map((p) => (
                            <Badge key={p.name} variant="outline" className={`text-xs ${p.status === 'certified' ? 'bg-green-50 text-green-700 border-green-200' : p.status === 'in-progress' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                              {p.status === 'certified' && '✓ '}{p.name} ({p.role})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* ── Alertes Infrastructure ── */}
        <TabsContent value="alerts" className="space-y-4 mt-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Alertes actives', value: activeAlerts.length, color: activeAlerts.length > 0 ? 'text-red-600' : 'text-green-600', bg: activeAlerts.length > 0 ? 'bg-red-50 dark:bg-red-950' : 'bg-green-50 dark:bg-green-950' },
              { label: 'Critiques', value: criticalAlerts.length, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950' },
              { label: 'Résolues aujourd\'hui', value: DEMO_INFRA_ALERTS.filter((a) => a.resolvedAt && new Date(a.resolvedAt).toDateString() === new Date().toDateString()).length, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950' },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, ease: 'easeOut' }}>
                <Card>
                  <CardContent className="p-4">
                    <div className={`p-3 rounded-lg ${stat.bg} text-center`}>
                      <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="space-y-3">
            {DEMO_INFRA_ALERTS.map((alert, i) => {
              const severityConf = getSeverityConfig(alert.severity)
              const isResolved = !!alert.resolvedAt
              return (
                <motion.div key={alert.id} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08, ease: 'easeOut' }}>
                  <Card className={`border-l-4 ${alert.severity === 'critical' ? 'border-l-red-500' : alert.severity === 'warning' ? 'border-l-amber-500' : 'border-l-blue-500'} ${isResolved ? 'opacity-60' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <severityConf.Icon className="h-4 w-4" />
                            <span className="font-semibold text-sm">{alert.facilityName}</span>
                            <Badge variant="outline" className={severityConf.className}>{alert.severity}</Badge>
                            <Badge variant="outline" className="text-xs">{alert.type}</Badge>
                            {isResolved && <Badge className="bg-green-100 text-green-700 border-green-200 text-xs"><CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />Résolu</Badge>}
                          </div>
                          <p className="text-sm">{alert.message}</p>
                          {alert.affectedServices.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {alert.affectedServices.map((s) => (
                                <Badge key={s} variant="outline" className="text-xs bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800">{s}</Badge>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>Détecté: {new Date(alert.detectedAt).toLocaleString('fr-FR')}</span>
                            {alert.resolvedAt && <span>Résolu: {new Date(alert.resolvedAt).toLocaleString('fr-FR')}</span>}
                          </div>
                          {alert.resolution && <p className="text-xs text-green-700 dark:text-green-400">{alert.resolution}</p>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
