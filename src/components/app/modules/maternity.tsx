'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Baby, Plus, Search, Heart, Activity, AlertTriangle, ShieldCheck, Clock, TrendingUp,
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

type RiskLevel = 'Faible' | 'Moyen' | 'Élevé'
type PregnancyStatus = 'En cours' | 'Accouché' | 'Suivi post-partum'

interface Pregnancy {
  id: number; patient: string; age: number; term: number; status: PregnancyStatus; riskLevel: RiskLevel
  lastVisit: string; nextVisit: string; weight: number; bp: string; fhr: number
  notes: string; gravida: number; para: number
}

const demoPregnancies: Pregnancy[] = [
  { id: 1, patient: 'Fatoumata Camara', age: 28, term: 39, status: 'En cours', riskLevel: 'Élevé', lastVisit: '03/03/2026', nextVisit: '06/03/2026', weight: 78, bp: '13/8', fhr: 140, notes: 'Pré-éclampsie surveillée. Césarienne programmée.', gravida: 2, para: 1 },
  { id: 2, patient: 'Mariama Bah', age: 24, term: 32, status: 'En cours', riskLevel: 'Moyen', lastVisit: '01/03/2026', nextVisit: '08/03/2026', weight: 72, bp: '12/7', fhr: 145, notes: 'Anémie légère. Supplémentation fer + acide folique.', gravida: 1, para: 0 },
  { id: 3, patient: 'Aminata Diallo', age: 31, term: 24, status: 'En cours', riskLevel: 'Faible', lastVisit: '28/02/2026', nextVisit: '14/03/2026', weight: 68, bp: '11/7', fhr: 152, notes: 'Grossesse normale. Échographie morphologique prévue.', gravida: 3, para: 2 },
  { id: 4, patient: 'Kadiatou Sylla', age: 19, term: 16, status: 'En cours', riskLevel: 'Moyen', lastVisit: '25/02/2026', nextVisit: '11/03/2026', weight: 60, bp: '11/6', fhr: 148, notes: 'Primipare jeune. Suivi r recommandé.', gravida: 1, para: 0 },
  { id: 5, patient: 'Aïssatou Doupour', age: 35, term: 0, status: 'Suivi post-partum', riskLevel: 'Faible', lastVisit: '25/02/2026', nextVisit: '25/03/2026', weight: 65, bp: '12/8', fhr: 0, notes: 'Accouchement eutocique le 18/02. Bébé en bonne santé.', gravida: 4, para: 4 },
  { id: 6, patient: 'Hawa Touré', age: 27, term: 36, status: 'En cours', riskLevel: 'Élevé', lastVisit: '04/03/2026', nextVisit: '06/03/2026', weight: 82, bp: '15/9', fhr: 135, notes: 'Diabète gestationnel. Surveillance rapprochée.', gravida: 2, para: 1 },
]

const riskColors: Record<RiskLevel, string> = {
  Faible: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  Moyen: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
  Élevé: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
}

const riskIcons: Record<RiskLevel, React.ComponentType<{ className?: string }>> = {
  Faible: ShieldCheck,
  Moyen: AlertTriangle,
  Élevé: AlertTriangle,
}

export function MaternityPage() {
  const [search, setSearch] = useState('')
  const [riskFilter, setRiskFilter] = useState<string>('all')
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [selectedPregnancy, setSelectedPregnancy] = useState<Pregnancy | null>(null)

  const filtered = demoPregnancies.filter(p => {
    const matchSearch = p.patient.toLowerCase().includes(search.toLowerCase())
    const matchRisk = riskFilter === 'all' || p.riskLevel === riskFilter
    return matchSearch && matchRisk
  })

  return (
    <motion.div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto" variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg shadow-pink-500/20"><Baby className="size-5 text-white" /></div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Maternité</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Suivi des grossesses et accouchements</p>
          </div>
        </div>
        <Button onClick={() => setShowNewDialog(true)} className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white shadow-lg shadow-pink-500/20">
          <Plus className="size-4 mr-2" /> Nouvelle grossesse
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Grossesses actives', value: demoPregnancies.filter(p => p.status === 'En cours').length, color: 'from-pink-500 to-rose-600' },
          { label: 'Risque élevé', value: demoPregnancies.filter(p => p.riskLevel === 'Élevé').length, color: 'from-rose-500 to-red-600' },
          { label: 'Risque moyen', value: demoPregnancies.filter(p => p.riskLevel === 'Moyen').length, color: 'from-amber-500 to-orange-600' },
          { label: 'Post-partum', value: demoPregnancies.filter(p => p.status === 'Suivi post-partum').length, color: 'from-teal-500 to-emerald-600' },
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

      {/* Search/Filter */}
      <motion.div variants={itemVariants}>
        <Card className="border-slate-200/60 dark:border-slate-800/60">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input placeholder="Rechercher patiente..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Risque" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous niveaux</SelectItem>
                  <SelectItem value="Faible">Faible</SelectItem>
                  <SelectItem value="Moyen">Moyen</SelectItem>
                  <SelectItem value="Élevé">Élevé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Pregnancy List */}
      <motion.div variants={itemVariants}>
        <Card className="border-slate-200/60 dark:border-slate-800/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">Suivi des grossesses</CardTitle>
            <CardDescription className="text-xs">{filtered.length} patientes</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
              {filtered.map((p, index) => {
                const RiskIcon = riskIcons[p.riskLevel]
                return (
                  <motion.div key={p.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedPregnancy(p)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center size-10 rounded-full bg-pink-100 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 font-bold text-sm">
                          {p.patient.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{p.patient}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{p.age} ans • G{p.gravida}P{p.para} • {p.status}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${riskColors[p.riskLevel]}`}>
                        <RiskIcon className="size-3" /> {p.riskLevel}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                        <p className="text-[10px] text-slate-500">Terme</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{p.term > 0 ? `${p.term} SA` : '—'}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                        <p className="text-[10px] text-slate-500">Poids</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{p.weight} kg</p>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                        <p className="text-[10px] text-slate-500">TA</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{p.bp}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                        <p className="text-[10px] text-slate-500">FCF</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{p.fhr > 0 ? `${p.fhr} bpm` : '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                      <span>Dernière visite: {p.lastVisit}</span>
                      <span>Prochaine: <span className="font-medium text-teal-600 dark:text-teal-400">{p.nextVisit}</span></span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedPregnancy} onOpenChange={() => setSelectedPregnancy(null)}>
        <DialogContent className="sm:max-w-[520px]">
          {selectedPregnancy && (
            <>
              <DialogHeader><DialogTitle className="flex items-center gap-2"><Baby className="size-5 text-pink-600" /> {selectedPregnancy.patient}</DialogTitle></DialogHeader>
              <div className="space-y-4 py-2">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${riskColors[selectedPregnancy.riskLevel]}`}>
                    Risque {selectedPregnancy.riskLevel}
                  </span>
                  <span className="text-xs text-slate-500">{selectedPregnancy.status}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-xs text-slate-500">Âge</span><p className="font-medium">{selectedPregnancy.age} ans</p></div>
                  <div><span className="text-xs text-slate-500">Parité</span><p className="font-medium">G{selectedPregnancy.gravida}P{selectedPregnancy.para}</p></div>
                  <div><span className="text-xs text-slate-500">Terme</span><p className="font-medium">{selectedPregnancy.term > 0 ? `${selectedPregnancy.term} SA` : 'Accouché'}</p></div>
                  <div><span className="text-xs text-slate-500">FCF</span><p className="font-medium">{selectedPregnancy.fhr > 0 ? `${selectedPregnancy.fhr} bpm` : '—'}</p></div>
                  <div><span className="text-xs text-slate-500">Poids / TA</span><p className="font-medium">{selectedPregnancy.weight} kg / {selectedPregnancy.bp}</p></div>
                  <div><span className="text-xs text-slate-500">Prochaine visite</span><p className="font-medium text-teal-600 dark:text-teal-400">{selectedPregnancy.nextVisit}</p></div>
                </div>
                <div><span className="text-xs text-slate-500">Notes</span><p className="text-sm text-slate-700 dark:text-slate-300 mt-0.5">{selectedPregnancy.notes}</p></div>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setSelectedPregnancy(null)}>Fermer</Button></DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* New Pregnancy Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Plus className="size-5 text-pink-600" /> Nouvelle grossesse</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Patiente *</Label><Select><SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger><SelectContent><SelectItem value="1">Aminata Diallo</SelectItem><SelectItem value="2">Mariama Bah</SelectItem></SelectContent></Select></div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2"><Label className="text-xs">Gravidité</Label><Input type="number" placeholder="1" /></div>
              <div className="space-y-2"><Label className="text-xs">Parité</Label><Input type="number" placeholder="0" /></div>
              <div className="space-y-2"><Label className="text-xs">Terme (SA)</Label><Input type="number" placeholder="12" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-xs">DDR</Label><Input type="date" /></div>
              <div className="space-y-2"><Label>Niveau de risque</Label><Select defaultValue="Faible"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Faible">Faible</SelectItem><SelectItem value="Moyen">Moyen</SelectItem><SelectItem value="Élevé">Élevé</SelectItem></SelectContent></Select></div>
            </div>
            <div className="space-y-2"><Label>Notes</Label><Textarea placeholder="Antécédents, observations..." rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Annuler</Button>
            <Button className="bg-gradient-to-r from-pink-500 to-rose-600 text-white" onClick={() => setShowNewDialog(false)}>Enregistrer</Button>
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
