'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft, AlertTriangle, Users, Skull, MapPin, Calendar, Shield, Activity, FileText, Clock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
} from 'recharts'
import type { EpidemiologicalAlert, SurveillanceAlertLevel } from '@/lib/data-store'

/* ─────────── Helpers ─────────── */

function getAlertLevelBadge(level: SurveillanceAlertLevel) {
  switch (level) {
    case 'ÉPIDÉMIE': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800'
    case 'ALERTE': return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
    case 'VEILLE': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
  }
}

/* ─────────── Props ─────────── */

interface AlertDetailProps {
  alert: EpidemiologicalAlert
  onClose: () => void
}

/* ─────────── Component ─────────── */

export function AlertDetail({ alert, onClose }: AlertDetailProps) {
  // Generate mock epidemiological curve data based on alert
  const epiCurveData = React.useMemo(() => {
    const days = 14
    const peakDay = 8
    const data = []
    for (let i = 0; i < days; i++) {
      const factor = i < peakDay ? Math.pow(i / peakDay, 2) : Math.exp(-(i - peakDay) / 4)
      data.push({
        jour: `J${i + 1}`,
        cas: Math.round(alert.caseCount * factor * (0.8 + Math.random() * 0.4)),
        décès: Math.round(alert.deathCount * factor * (0.8 + Math.random() * 0.4)),
      })
    }
    return data
  }, [alert])

  // Mock timeline data
  const timeline = React.useMemo(() => {
    const items = [
      { date: alert.firstCaseDate, label: 'Premier cas identifié', type: 'case' as const },
      { date: alert.createdAt, label: 'Alerte signalée', type: 'alert' as const },
    ]
    if (alert.status === 'En investigation') {
      items.push({ date: alert.updatedAt, label: 'Investigation en cours', type: 'investigation' as const })
    }
    if (alert.alertLevel === 'ÉPIDÉMIE') {
      items.push({ date: alert.updatedAt, label: 'Épidémie déclarée', type: 'epidemic' as const })
    }
    return items
  }, [alert])

  return (
    <motion.div className="p-4 lg:p-6 space-y-6 max-w-[1200px] mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="size-5" />
        </Button>
        <div className="flex items-center gap-3 flex-1">
          <div className={`flex items-center justify-center size-10 rounded-xl ${
            alert.alertLevel === 'ÉPIDÉMIE' ? 'bg-red-100 dark:bg-red-950/40' :
            alert.alertLevel === 'ALERTE' ? 'bg-amber-100 dark:bg-amber-950/40' :
            'bg-emerald-100 dark:bg-emerald-950/40'
          }`}>
            <AlertTriangle className={`size-5 ${
              alert.alertLevel === 'ÉPIDÉMIE' ? 'text-red-500' :
              alert.alertLevel === 'ALERTE' ? 'text-amber-500' :
              'text-emerald-500'
            }`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">{alert.disease}</h1>
              <Badge variant="outline" className={`text-[10px] ${getAlertLevelBadge(alert.alertLevel)}`}>
                {alert.alertLevel}
              </Badge>
              <Badge variant="outline" className={`text-[10px] ${
                alert.status === 'Actif' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300' :
                alert.status === 'En investigation' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300' :
                'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
              }`}>
                {alert.status}
              </Badge>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{alert.location} • {alert.healthZone}</p>
          </div>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Cas confirmés', value: alert.caseCount, icon: Users, color: 'text-amber-600 dark:text-amber-400' },
          { label: 'Décès', value: alert.deathCount, icon: Skull, color: 'text-red-600 dark:text-red-400' },
          { label: 'Lettalité', value: alert.caseCount > 0 ? `${Math.round((alert.deathCount / alert.caseCount) * 100)}%` : '0%', icon: Activity, color: 'text-purple-600 dark:text-purple-400' },
          { label: 'Zones touchées', value: alert.affectedAreas.length, icon: MapPin, color: 'text-teal-600 dark:text-teal-400' },
        ].map(m => (
          <Card key={m.label} className="border-slate-200/60 dark:border-slate-800/60">
            <CardContent className="py-3 flex items-center gap-3">
              <m.icon className={`size-5 ${m.color}`} />
              <div>
                <p className="text-[10px] text-slate-400 uppercase">{m.label}</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{m.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Description */}
      <Card className="border-slate-200/60 dark:border-slate-800/60">
        <CardContent className="py-4">
          <p className="text-sm text-slate-700 dark:text-slate-300">{alert.description}</p>
        </CardContent>
      </Card>

      {/* Epidemiological curve */}
      <Card className="border-slate-200/60 dark:border-slate-800/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Courbe épidémiologique</CardTitle>
          <CardDescription className="text-xs">Évolution des cas sur les 14 derniers jours</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={epiCurveData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                <XAxis dataKey="jour" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="cas" stroke="#f59e0b" strokeWidth={2} fill="#f59e0b" fillOpacity={0.15} name="Cas" />
                <Area type="monotone" dataKey="décès" stroke="#ef4444" strokeWidth={2} fill="#ef4444" fillOpacity={0.1} name="Décès" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Timeline */}
        <Card className="border-slate-200/60 dark:border-slate-800/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Chronologie</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {timeline.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`size-3 rounded-full ${
                      item.type === 'epidemic' ? 'bg-red-500' :
                      item.type === 'alert' ? 'bg-amber-500' :
                      item.type === 'investigation' ? 'bg-purple-500' :
                      'bg-teal-500'
                    }`} />
                    {i < timeline.length - 1 && <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-900 dark:text-white">{item.label}</p>
                    <p className="text-[10px] text-slate-400">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommended actions */}
        <Card className="border-slate-200/60 dark:border-slate-800/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="size-4 text-teal-600 dark:text-teal-400" />
              Actions recommandées
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {alert.recommendedActions.map((action, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-teal-50/50 dark:bg-teal-950/20">
                <Shield className="size-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                <p className="text-xs text-slate-700 dark:text-slate-300">{action}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Affected areas */}
      <Card className="border-slate-200/60 dark:border-slate-800/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="size-4 text-amber-600 dark:text-amber-400" />
            Zones affectées
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            {alert.affectedAreas.map((area, i) => (
              <Badge key={i} variant="outline" className="text-xs bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                <MapPin className="size-3 mr-1" /> {area}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generate report button */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onClose} className="flex-1">
          <ArrowLeft className="size-4 mr-2" /> Retour
        </Button>
        <Button className="flex-1 bg-gradient-to-r from-cyan-500 to-teal-600 text-white">
          <FileText className="size-4 mr-2" /> Générer rapport Ministère
        </Button>
      </div>
    </motion.div>
  )
}
