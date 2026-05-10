'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Siren, Plus, Search, Clock, AlertTriangle, User, Heart, Thermometer, Activity, Shield,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } }

type TriageLevel = 'RED' | 'ORANGE' | 'YELLOW' | 'GREEN' | 'BLUE'
type EmergencyStatus = 'En attente' | 'En traitement' | 'Stabilisé' | 'Transféré'

interface EmergencyCase {
  id: number; caseNumber: string; patient: string; age: number; gender: string
  triage: TriageLevel; status: EmergencyStatus; arrivalTime: string; reason: string
  vitals?: { ta: string; fc: number; temp: number; spo2: number }
}

const demoCases: EmergencyCase[] = [
  { id: 1, caseNumber: 'URG-0301', patient: 'Moussa Condé', age: 45, gender: 'M', triage: 'RED', status: 'En traitement', arrivalTime: '07:15', reason: 'Arrêt cardiaque — RCP en cours', vitals: { ta: '8/5', fc: 40, temp: 35.8, spo2: 78 } },
  { id: 2, caseNumber: 'URG-0302', patient: 'Fatoumata Camara', age: 32, gender: 'F', triage: 'ORANGE', status: 'En traitement', arrivalTime: '08:30', reason: 'Hémorragie post-partum', vitals: { ta: '9/5', fc: 110, temp: 36.5, spo2: 94 } },
  { id: 3, caseNumber: 'URG-0303', patient: 'Abdoulaye Keita', age: 28, gender: 'M', triage: 'YELLOW', status: 'En attente', arrivalTime: '09:00', reason: 'Fracture ouverte jambe gauche — accident moto', vitals: { ta: '13/8', fc: 95, temp: 37.0, spo2: 97 } },
  { id: 4, caseNumber: 'URG-0304', patient: 'Aminata Diallo', age: 19, gender: 'F', triage: 'GREEN', status: 'En attente', arrivalTime: '09:45', reason: 'Paludisme simple — fièvre et vomissements', vitals: { ta: '11/7', fc: 88, temp: 38.5, spo2: 97 } },
  { id: 5, caseNumber: 'URG-0305', patient: 'Lamine Kaba', age: 3, gender: 'M', triage: 'BLUE', status: 'Stabilisé', arrivalTime: '08:00', reason: 'Convulsions fébriles — enfant 3 ans', vitals: { ta: '10/6', fc: 120, temp: 39.8, spo2: 95 } },
]

const triageConfig: Record<TriageLevel, { label: string; color: string; bg: string; border: string; priority: number }> = {
  RED: { label: 'Absolu', color: 'text-white', bg: 'bg-red-600', border: 'border-red-600', priority: 1 },
  ORANGE: { label: 'Urgent', color: 'text-white', bg: 'bg-orange-500', border: 'border-orange-500', priority: 2 },
  YELLOW: { label: 'Semi-urgent', color: 'text-yellow-900', bg: 'bg-yellow-400', border: 'border-yellow-400', priority: 3 },
  GREEN: { label: 'Moins urgent', color: 'text-white', bg: 'bg-emerald-500', border: 'border-emerald-500', priority: 4 },
  BLUE: { label: 'Non urgent', color: 'text-white', bg: 'bg-sky-500', border: 'border-sky-500', priority: 5 },
}

const statusColors: Record<EmergencyStatus, string> = {
  'En attente': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
  'En traitement': 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
  'Stabilisé': 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800',
  'Transféré': 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
}

export function EmergenciesPage() {
  const [search, setSearch] = useState('')
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [selectedCase, setSelectedCase] = useState<EmergencyCase | null>(null)

  const sorted = [...demoCases].sort((a, b) => triageConfig[a.triage].priority - triageConfig[b.triage].priority)
  const filtered = sorted.filter(c => c.patient.toLowerCase().includes(search.toLowerCase()) || c.reason.toLowerCase().includes(search.toLowerCase()))

  const totalToday = demoCases.length
  const critical = demoCases.filter(c => c.triage === 'RED' || c.triage === 'ORANGE').length
  const waiting = demoCases.filter(c => c.status === 'En attente').length
  const treated = demoCases.filter(c => c.status === 'Stabilisé' || c.status === 'Transféré').length

  return (
    <motion.div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto" variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 shadow-lg shadow-rose-500/20"><Siren className="size-5 text-white" /></div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Urgences</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Accueil et triage des urgences</p>
          </div>
        </div>
        <Button onClick={() => setShowNewDialog(true)} className="bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white shadow-lg shadow-rose-500/20">
          <Plus className="size-4 mr-2" /> Nouveau cas
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Cas aujourd'hui", value: totalToday, color: 'from-teal-500 to-emerald-600' },
          { label: 'Critiques', value: critical, color: 'from-rose-500 to-red-600' },
          { label: 'En attente', value: waiting, color: 'from-amber-500 to-orange-600' },
          { label: 'Traîtés', value: treated, color: 'from-emerald-500 to-green-600' },
        ].map(stat => (
          <motion.div key={stat.label} variants={itemVariants}>
            <Card className="relative overflow-hidden border-slate-200/60 dark:border-slate-800/60">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />
              <CardContent className="pt-5 pb-4">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Triage Legend */}
      <motion.div variants={itemVariants}>
        <Card className="border-slate-200/60 dark:border-slate-800/60">
          <CardContent className="py-3">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Triage :</span>
              {Object.entries(triageConfig).map(([key, cfg]) => (
                <span key={key} className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-bold ${cfg.bg} ${cfg.color}`}>{key} — {cfg.label}</span>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search + Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="border-slate-200/60 dark:border-slate-800/60 h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">File d&apos;attente par priorité</CardTitle>
                  <CardDescription className="text-xs">Trié par niveau de triage</CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                  <Input placeholder="Rechercher..." className="pl-8 h-8 text-xs w-[160px]" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1 custom-scrollbar">
                {filtered.map((c, index) => {
                  const triage = triageConfig[c.triage]
                  return (
                    <motion.div key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedCase(c)}
                    >
                      <div className={`flex items-center justify-center size-10 rounded-lg ${triage.bg} ${triage.color} font-black text-sm shrink-0`}>
                        {c.triage}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{c.patient}</p>
                          <span className="text-xs text-slate-400">{c.age} ans, {c.gender}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{c.reason}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{c.arrivalTime}</span>
                        <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${statusColors[c.status]}`}>{c.status}</span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Triage Distribution */}
        <motion.div variants={itemVariants}>
          <Card className="border-slate-200/60 dark:border-slate-800/60 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">Répartition par triage</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {(Object.keys(triageConfig) as TriageLevel[]).map(level => {
                  const cfg = triageConfig[level]
                  const count = demoCases.filter(c => c.triage === level).length
                  const pct = totalToday > 0 ? Math.round((count / totalToday) * 100) : 0
                  return (
                    <div key={level}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className={`size-3 rounded ${cfg.bg}`} />
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{level} — {cfg.label}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{count} ({pct}%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <motion.div className={`h-full rounded-full ${cfg.bg}`} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedCase} onOpenChange={() => setSelectedCase(null)}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedCase && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Siren className="size-5 text-rose-600" />
                  {selectedCase.caseNumber} — {selectedCase.patient}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="flex items-center gap-2">
                  <div className={`flex items-center justify-center size-8 rounded ${triageConfig[selectedCase.triage].bg} ${triageConfig[selectedCase.triage].color} font-bold text-sm`}>{selectedCase.triage}</div>
                  <span className="text-sm font-medium">{triageConfig[selectedCase.triage].label}</span>
                  <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ml-auto ${statusColors[selectedCase.status]}`}>{selectedCase.status}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-xs text-slate-500">Âge / Sexe</span><p className="font-medium text-slate-900 dark:text-white">{selectedCase.age} ans, {selectedCase.gender}</p></div>
                  <div><span className="text-xs text-slate-500">Heure arrivée</span><p className="font-medium text-slate-900 dark:text-white">{selectedCase.arrivalTime}</p></div>
                </div>
                <div><span className="text-xs text-slate-500">Motif</span><p className="text-sm font-medium text-slate-900 dark:text-white mt-0.5">{selectedCase.reason}</p></div>
                {selectedCase.vitals && (
                  <div>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">Constantes</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30"><p className="text-[10px] text-rose-600">TA</p><p className="text-sm font-bold text-rose-700 dark:text-rose-300">{selectedCase.vitals.ta} cmHg</p></div>
                      <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-950/30"><p className="text-[10px] text-cyan-600">FC</p><p className="text-sm font-bold text-cyan-700 dark:text-cyan-300">{selectedCase.vitals.fc} bpm</p></div>
                      <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30"><p className="text-[10px] text-amber-600">T°</p><p className="text-sm font-bold text-amber-700 dark:text-amber-300">{selectedCase.vitals.temp} °C</p></div>
                      <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/30"><p className="text-[10px] text-purple-600">SpO2</p><p className="text-sm font-bold text-purple-700 dark:text-purple-300">{selectedCase.vitals.spo2} %</p></div>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter className="flex gap-2">
                <Button className="bg-teal-600 hover:bg-teal-700 text-white">Prendre en charge</Button>
                <Button variant="outline" onClick={() => setSelectedCase(null)}>Fermer</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* New Emergency Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Siren className="size-5 text-rose-600" /> Nouveau cas d&apos;urgence</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Nom patient *</Label><Input placeholder="Nom complet..." /></div>
              <div className="space-y-2"><Label>Âge</Label><Input type="number" placeholder="Âge" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Sexe</Label><Select><SelectTrigger><SelectValue placeholder="..." /></SelectTrigger><SelectContent><SelectItem value="M">Masculin</SelectItem><SelectItem value="F">Féminin</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>Niveau de triage *</Label><Select><SelectTrigger><SelectValue placeholder="Triage..." /></SelectTrigger><SelectContent>{(Object.keys(triageConfig) as TriageLevel[]).map(l => <SelectItem key={l} value={l}>{l} — {triageConfig[l].label}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="space-y-2"><Label>Motif d&apos;urgence *</Label><Textarea placeholder="Décrire la situation..." rows={3} /></div>
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Constantes (optionnel)</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-xs">TA</Label><Input placeholder="12/8" /></div>
                <div className="space-y-1"><Label className="text-xs">FC</Label><Input type="number" placeholder="80" /></div>
                <div className="space-y-1"><Label className="text-xs">T°</Label><Input type="number" step="0.1" placeholder="37.0" /></div>
                <div className="space-y-1"><Label className="text-xs">SpO2</Label><Input type="number" placeholder="98" /></div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Annuler</Button>
            <Button className="bg-gradient-to-r from-rose-500 to-red-600 text-white" onClick={() => setShowNewDialog(false)}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
      `}</style>
    </motion.div>
  )
}
