'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  MapPin, Wifi, WifiOff, ClipboardList, Navigation, BookOpen, Plus,
  ChevronRight, Users, Activity, AlertTriangle, CheckCircle2, Clock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { demoVisits, demoReferrals, diagnosticGuides, trainingModules, type ASCVisit, type ASCReferral } from '@/lib/asc-tools'
import { DiagnosticGuide } from './diagnostic-guide'
import { VisitForm } from './visit-form'
import { ELearning } from './e-learning'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } }

const severityColors: Record<string, string> = {
  vert: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  jaune: 'bg-amber-100 text-amber-700 border-amber-200',
  orange: 'bg-orange-100 text-orange-700 border-orange-200',
  rouge: 'bg-red-100 text-red-700 border-red-200',
}

const referralStatusColors: Record<string, string> = {
  'En attente': 'bg-amber-50 text-amber-700 border-amber-200',
  'Accepté': 'bg-blue-50 text-blue-700 border-blue-200',
  'En route': 'bg-purple-50 text-purple-700 border-purple-200',
  'Arrivé': 'bg-teal-50 text-teal-700 border-teal-200',
  'Pris en charge': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Terminé': 'bg-slate-50 text-slate-600 border-slate-200',
}

export function ASCDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isGpsEnabled, setIsGpsEnabled] = useState(false)
  const [isOffline, setIsOffline] = useState(false)
  const [showVisitForm, setShowVisitForm] = useState(false)

  const pendingSyncCount = demoVisits.filter(v => v.isOffline && !v.syncedAt).length

  return (
    <motion.div className="p-4 lg:p-6 space-y-4 max-w-[1600px] mx-auto" variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/20">
            <Users className="size-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Agent de Santé Communautaire</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Aminata Condé — Zone de Kaloum</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Offline/Online indicator */}
          <Button
            variant={isOffline ? 'destructive' : 'outline'}
            size="sm"
            className="text-xs h-8"
            onClick={() => setIsOffline(!isOffline)}
          >
            {isOffline ? <WifiOff className="size-3.5 mr-1" /> : <Wifi className="size-3.5 mr-1" />}
            {isOffline ? 'Hors ligne' : 'En ligne'}
            {pendingSyncCount > 0 && (
              <Badge className="ml-1.5 bg-amber-500 text-white text-[10px] px-1 py-0">{pendingSyncCount}</Badge>
            )}
          </Button>
          {/* GPS toggle */}
          <Button
            variant={isGpsEnabled ? 'default' : 'outline'}
            size="sm"
            className={`text-xs h-8 ${isGpsEnabled ? 'bg-teal-600' : ''}`}
            onClick={() => setIsGpsEnabled(!isGpsEnabled)}
          >
            <Navigation className="size-3.5 mr-1" />
            GPS {isGpsEnabled ? 'On' : 'Off'}
          </Button>
          <Button
            size="sm"
            className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-xs h-8"
            onClick={() => setShowVisitForm(true)}
          >
            <Plus className="size-3.5 mr-1" /> Nouvelle visite
          </Button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Visites aujourd'hui", value: demoVisits.length, icon: ClipboardList, color: 'from-teal-500 to-emerald-600' },
          { label: 'Références actives', value: demoReferrals.filter(r => r.status !== 'Terminé').length, icon: AlertTriangle, color: 'from-amber-500 to-orange-600' },
          { label: 'Guides disponibles', value: diagnosticGuides.length, icon: BookOpen, color: 'from-cyan-500 to-teal-600' },
          { label: 'Formations', value: trainingModules.filter(m => m.progress < 100).length, icon: Activity, color: 'from-purple-500 to-indigo-600' },
        ].map(stat => (
          <motion.div key={stat.label} variants={itemVariants}>
            <Card className="relative overflow-hidden border-slate-200/60 dark:border-slate-800/60">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-center justify-between mb-1">
                  <stat.icon className="size-4 text-slate-400" />
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="dashboard" className="text-xs">Visites</TabsTrigger>
          <TabsTrigger value="guides" className="text-xs">Guides</TabsTrigger>
          <TabsTrigger value="referrals" className="text-xs">Références</TabsTrigger>
          <TabsTrigger value="training" className="text-xs">Formation</TabsTrigger>
        </TabsList>

        {/* Visits Tab */}
        <TabsContent value="dashboard" className="mt-4 space-y-3">
          {showVisitForm ? (
            <VisitForm onClose={() => setShowVisitForm(false)} />
          ) : (
            <>
              {demoVisits.map((visit, i) => (
                <motion.div key={visit.id} variants={itemVariants}>
                  <Card className="border-slate-200/60 dark:border-slate-800/60">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-teal-100 dark:bg-teal-950/40 flex items-center justify-center text-teal-700 dark:text-teal-300 text-sm font-bold">
                            {visit.patientName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{visit.patientName}</p>
                            <p className="text-xs text-slate-500">
                              {visit.visitDate} • {visit.location.address}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {visit.isOffline && !visit.syncedAt && (
                            <Badge className="bg-amber-100 text-amber-700 text-[10px]"><WifiOff className="size-3 mr-0.5" /> Sync</Badge>
                          )}
                          {visit.referral && (
                            <Badge className={severityColors[visit.referral.severity]}>{visit.referral.severity === 'rouge' ? 'Urgent' : visit.referral.severity === 'orange' ? 'Modéré' : 'Simple'}</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {visit.symptoms.map(s => (
                          <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
                        ))}
                      </div>
                      {visit.diagnosis && (
                        <p className="text-xs text-teal-700 dark:text-teal-300 font-medium mb-1">Diagnostic: {visit.diagnosis}</p>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {visit.actionsTaken.map(a => (
                          <span key={a} className="text-[10px] text-slate-500 bg-slate-50 dark:bg-slate-800 rounded px-1.5 py-0.5">{a}</span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </>
          )}
        </TabsContent>

        {/* Diagnostic Guides Tab */}
        <TabsContent value="guides" className="mt-4 space-y-3">
          {diagnosticGuides.map(guide => (
            <DiagnosticGuide key={guide.id} guide={guide} />
          ))}
        </TabsContent>

        {/* Referrals Tab */}
        <TabsContent value="referrals" className="mt-4 space-y-3">
          {demoReferrals.map(ref => (
            <motion.div key={ref.id} variants={itemVariants}>
              <Card className="border-slate-200/60 dark:border-slate-800/60">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{ref.patientName}</p>
                      <p className="text-xs text-slate-500">{ref.destination}</p>
                    </div>
                    <Badge className={referralStatusColors[ref.status] || ''}>{ref.status}</Badge>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{ref.reason}</p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <Clock className="size-3" /> {new Date(ref.createdAt).toLocaleString('fr-FR')}
                    <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${severityColors[ref.severity]}`}>
                      {ref.severity === 'rouge' ? 'Urgent' : ref.severity === 'orange' ? 'Modéré' : ref.severity === 'jaune' ? 'Attention' : 'Stable'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        {/* Training Tab */}
        <TabsContent value="training" className="mt-4">
          <ELearning />
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
