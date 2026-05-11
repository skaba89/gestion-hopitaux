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
import { useDataStore, type EmergencyCase } from '@/lib/data-store'
import { useToast } from '@/hooks/use-toast'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } }

type TriageLevel = EmergencyCase['triageLevel']
type EmergencyStatus = EmergencyCase['status']

const triageConfig: Record<TriageLevel, { label: string; color: string; bg: string; border: string; priority: number }> = {
  Rouge: { label: 'Absolu', color: 'text-white', bg: 'bg-red-600', border: 'border-red-600', priority: 1 },
  Orange: { label: 'Urgent', color: 'text-white', bg: 'bg-orange-500', border: 'border-orange-500', priority: 2 },
  Jaune: { label: 'Semi-urgent', color: 'text-yellow-900', bg: 'bg-yellow-400', border: 'border-yellow-400', priority: 3 },
  Vert: { label: 'Moins urgent', color: 'text-white', bg: 'bg-emerald-500', border: 'border-emerald-500', priority: 4 },
  Bleu: { label: 'Non urgent', color: 'text-white', bg: 'bg-sky-500', border: 'border-sky-500', priority: 5 },
}

const statusColors: Record<EmergencyStatus, string> = {
  'En attente': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
  'Pris en charge': 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800',
  'En cours': 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
  'Terminé': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  'Transféré': 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
}

export function EmergenciesPage() {
  const { emergencies, addEmergency, updateEmergency, takeCharge } = useDataStore()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [selectedCase, setSelectedCase] = useState<EmergencyCase | null>(null)
  const [doctorName, setDoctorName] = useState('')

  // New emergency form state
  const [newPatientName, setNewPatientName] = useState('')
  const [newPatientId, setNewPatientId] = useState('')
  const [newTriageLevel, setNewTriageLevel] = useState<TriageLevel>('Jaune')
  const [newReason, setNewReason] = useState('')

  const sorted = [...emergencies].sort((a, b) => triageConfig[a.triageLevel].priority - triageConfig[b.triageLevel].priority)
  const filtered = sorted.filter(c => c.patientName.toLowerCase().includes(search.toLowerCase()) || c.reason.toLowerCase().includes(search.toLowerCase()))

  const totalToday = emergencies.length
  const critical = emergencies.filter(c => c.triageLevel === 'Rouge' || c.triageLevel === 'Orange').length
  const waiting = emergencies.filter(c => c.status === 'En attente').length
  const treated = emergencies.filter(c => c.status === 'Terminé' || c.status === 'Transféré').length

  const handleAddEmergency = () => {
    if (!newPatientName || !newReason) {
      toast({ title: 'Erreur', description: 'Nom patient et motif sont obligatoires', variant: 'destructive' })
      return
    }
    addEmergency({
      id: `URG-${Date.now()}`,
      patientName: newPatientName,
      patientId: newPatientId,
      arrivalTime: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      triageLevel: newTriageLevel,
      reason: newReason,
      status: 'En attente',
      doctor: null,
    })
    toast({ title: 'Urgence ajoutée', description: `${newPatientName} enregistré(e) en urgence` })
    setNewPatientName('')
    setNewPatientId('')
    setNewTriageLevel('Jaune')
    setNewReason('')
    setShowNewDialog(false)
  }

  const handleTakeCharge = () => {
    if (!selectedCase || !doctorName) {
      toast({ title: 'Erreur', description: 'Nom du médecin requis', variant: 'destructive' })
      return
    }
    takeCharge(selectedCase.id, doctorName)
    toast({ title: 'Pris en charge', description: `${selectedCase.patientName} pris(e) en charge par ${doctorName}` })
    setDoctorName('')
    setSelectedCase(null)
  }

  const handleTerminate = () => {
    if (!selectedCase) return
    updateEmergency(selectedCase.id, { status: 'Terminé' })
    toast({ title: 'Terminé', description: `Cas de ${selectedCase.patientName} terminé` })
    setSelectedCase(null)
  }

  const handleTransfer = () => {
    if (!selectedCase) return
    updateEmergency(selectedCase.id, { status: 'Transféré' })
    toast({ title: 'Transféré', description: `${selectedCase.patientName} transféré(e)` })
    setSelectedCase(null)
  }

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
          <Plus className="size-4 mr-2" /> Nouveau patient urgence
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Cas aujourd'hui", value: totalToday, color: 'from-teal-500 to-emerald-600' },
          { label: 'Critiques', value: critical, color: 'from-rose-500 to-red-600' },
          { label: 'En attente', value: waiting, color: 'from-amber-500 to-orange-600' },
          { label: 'Traités', value: treated, color: 'from-emerald-500 to-green-600' },
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
              {(Object.keys(triageConfig) as TriageLevel[]).map(key => {
                const cfg = triageConfig[key]
                return (
                  <span key={key} className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-bold ${cfg.bg} ${cfg.color}`}>{key} — {cfg.label}</span>
                )
              })}
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
                  const triage = triageConfig[c.triageLevel]
                  return (
                    <motion.div key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedCase(c)}
                    >
                      <div className={`flex items-center justify-center size-10 rounded-lg ${triage.bg} ${triage.color} font-black text-sm shrink-0`}>
                        {c.triageLevel}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{c.patientName}</p>
                          {c.patientId && <span className="text-xs text-slate-400">{c.patientId}</span>}
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
                  const count = emergencies.filter(c => c.triageLevel === level).length
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
                  {selectedCase.id} — {selectedCase.patientName}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="flex items-center gap-2">
                  <div className={`flex items-center justify-center size-8 rounded ${triageConfig[selectedCase.triageLevel].bg} ${triageConfig[selectedCase.triageLevel].color} font-bold text-sm`}>{selectedCase.triageLevel}</div>
                  <span className="text-sm font-medium">{triageConfig[selectedCase.triageLevel].label}</span>
                  <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ml-auto ${statusColors[selectedCase.status]}`}>{selectedCase.status}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-xs text-slate-500">Heure arrivée</span><p className="font-medium text-slate-900 dark:text-white">{selectedCase.arrivalTime}</p></div>
                  <div><span className="text-xs text-slate-500">Médecin</span><p className="font-medium text-slate-900 dark:text-white">{selectedCase.doctor || '—'}</p></div>
                </div>
                <div><span className="text-xs text-slate-500">Motif</span><p className="text-sm font-medium text-slate-900 dark:text-white mt-0.5">{selectedCase.reason}</p></div>
                {selectedCase.patientId && (
                  <div><span className="text-xs text-slate-500">ID Patient</span><p className="text-sm font-medium text-slate-900 dark:text-white mt-0.5">{selectedCase.patientId}</p></div>
                )}
              </div>
              <DialogFooter className="flex flex-col gap-2 sm:flex-row">
                {selectedCase.status === 'En attente' && (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Input placeholder="Nom médecin..." value={doctorName} onChange={e => setDoctorName(e.target.value)} className="h-9 text-sm" />
                    <Button className="bg-teal-600 hover:bg-teal-700 text-white whitespace-nowrap" onClick={handleTakeCharge}>Prendre en charge</Button>
                  </div>
                )}
                {(selectedCase.status === 'Pris en charge' || selectedCase.status === 'En cours') && (
                  <>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleTerminate}>Terminer</Button>
                    <Button variant="outline" onClick={handleTransfer}>Transférer</Button>
                  </>
                )}
                <Button variant="outline" onClick={() => setSelectedCase(null)}>Fermer</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* New Emergency Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Siren className="size-5 text-rose-600" /> Nouveau patient urgence</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Nom patient *</Label><Input placeholder="Nom complet..." value={newPatientName} onChange={e => setNewPatientName(e.target.value)} /></div>
              <div className="space-y-2"><Label>ID Patient</Label><Input placeholder="ID patient..." value={newPatientId} onChange={e => setNewPatientId(e.target.value)} /></div>
            </div>
            <div className="space-y-2">
              <Label>Niveau de triage *</Label>
              <Select value={newTriageLevel} onValueChange={(v) => setNewTriageLevel(v as TriageLevel)}>
                <SelectTrigger><SelectValue placeholder="Triage..." /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(triageConfig) as TriageLevel[]).map(l => <SelectItem key={l} value={l}>{l} — {triageConfig[l].label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Motif d&apos;urgence *</Label><Textarea placeholder="Décrire la situation..." rows={3} value={newReason} onChange={e => setNewReason(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Annuler</Button>
            <Button className="bg-gradient-to-r from-rose-500 to-red-600 text-white" onClick={handleAddEmergency}>Enregistrer</Button>
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
