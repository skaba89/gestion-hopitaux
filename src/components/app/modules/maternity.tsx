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
import { useDataStore, type Pregnancy } from '@/lib/data-store'
import { useToast } from '@/hooks/use-toast'
import { useTranslation } from '@/i18n/provider'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } }

type RiskLevel = Pregnancy['riskLevel']
type PregnancyStatus = Pregnancy['status']

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
  const { pregnancies, addPregnancy, addPregnancyVisit } = useDataStore()
  const { toast } = useToast()
  const { t } = useTranslation('maternity')
  const { t: tc } = useTranslation('common')
  const [search, setSearch] = useState('')
  const [riskFilter, setRiskFilter] = useState<string>('all')
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [showVisitDialog, setShowVisitDialog] = useState(false)
  const [selectedPregnancy, setSelectedPregnancy] = useState<Pregnancy | null>(null)

  // New pregnancy form state
  const [newMotherName, setNewMotherName] = useState('')
  const [newMotherId, setNewMotherId] = useState('')
  const [newTerm, setNewTerm] = useState('')
  const [newDueDate, setNewDueDate] = useState('')
  const [newRiskLevel, setNewRiskLevel] = useState<RiskLevel>('Faible')

  // New visit form state
  const [visitDate, setVisitDate] = useState('')
  const [visitTerm, setVisitTerm] = useState('')
  const [visitWeight, setVisitWeight] = useState('')
  const [visitBp, setVisitBp] = useState('')
  const [visitNotes, setVisitNotes] = useState('')

  // Translated labels for data values
  const riskLevelLabels: Record<RiskLevel, string> = {
    Faible: t('riskLevels.low', 'Faible'),
    Moyen: t('riskLevels.medium', 'Moyen'),
    Élevé: t('riskLevels.high', 'Élevé'),
  }
  const statusLabels: Record<PregnancyStatus, string> = {
    'En cours': t('status.active', 'En cours'),
    'Terminée': t('status.completed', 'Terminée'),
    'Suivi post-partum': t('status.postpartum', 'Suivi post-partum'),
  }

  const filtered = pregnancies.filter(p => {
    const matchSearch = p.motherName.toLowerCase().includes(search.toLowerCase())
    const matchRisk = riskFilter === 'all' || p.riskLevel === riskFilter
    return matchSearch && matchRisk
  })

  const handleAddPregnancy = () => {
    if (!newMotherName) {
      toast({ title: t('error', 'Erreur'), description: t('errorMotherNameRequired', 'Nom de la patiente obligatoire'), variant: 'destructive' })
      return
    }
    addPregnancy({
      id: `MAT-${Date.now()}`,
      motherName: newMotherName,
      motherId: newMotherId,
      term: parseInt(newTerm) || 0,
      dueDate: newDueDate,
      riskLevel: newRiskLevel,
      lastVisit: new Date().toISOString().split('T')[0],
      status: 'En cours',
      visits: [],
    })
    toast({ title: t('pregnancyAdded', 'Grossesse ajoutée'), description: t('pregnancyAddedDesc', `Suivi de ${newMotherName} enregistré`) })
    setNewMotherName('')
    setNewMotherId('')
    setNewTerm('')
    setNewDueDate('')
    setNewRiskLevel('Faible')
    setShowNewDialog(false)
  }

  const handleAddVisit = () => {
    if (!selectedPregnancy || !visitDate) {
      toast({ title: t('error', 'Erreur'), description: t('errorVisitDateRequired', 'Date de visite obligatoire'), variant: 'destructive' })
      return
    }
    addPregnancyVisit(selectedPregnancy.id, {
      date: visitDate,
      term: parseInt(visitTerm) || selectedPregnancy.term,
      weight: visitWeight || '—',
      bp: visitBp || '—',
      notes: visitNotes || '—',
    })
    toast({ title: t('visitAdded', 'Visite ajoutée'), description: t('visitAddedDesc', `Visite du ${visitDate} enregistrée pour ${selectedPregnancy.motherName}`) })
    setVisitDate('')
    setVisitTerm('')
    setVisitWeight('')
    setVisitBp('')
    setVisitNotes('')
    setShowVisitDialog(false)
    // Refresh selected pregnancy data from store
    const updated = useDataStore.getState().pregnancies.find(p => p.id === selectedPregnancy.id)
    if (updated) setSelectedPregnancy(updated)
  }

  return (
    <motion.div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto" variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg shadow-pink-500/20"><Baby className="size-5 text-white" /></div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{t('title', 'Maternité')}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('subtitle', 'Suivi des grossesses et accouchements')}</p>
          </div>
        </div>
        <Button onClick={() => setShowNewDialog(true)} className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white shadow-lg shadow-pink-500/20">
          <Plus className="size-4 mr-2" /> {t('newPregnancy', 'Nouvelle grossesse')}
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: t('activePregnancies', 'Grossesses actives'), value: pregnancies.filter(p => p.status === 'En cours').length, color: 'from-pink-500 to-rose-600' },
          { label: t('highRisk', 'Risque élevé'), value: pregnancies.filter(p => p.riskLevel === 'Élevé').length, color: 'from-rose-500 to-red-600' },
          { label: t('mediumRisk', 'Risque moyen'), value: pregnancies.filter(p => p.riskLevel === 'Moyen').length, color: 'from-amber-500 to-orange-600' },
          { label: t('postpartum', 'Post-partum'), value: pregnancies.filter(p => p.status === 'Suivi post-partum').length, color: 'from-teal-500 to-emerald-600' },
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
                <Input placeholder={t('searchPatient', 'Rechercher patiente...')} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder={t('risk', 'Risque')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allLevels', 'Tous niveaux')}</SelectItem>
                  <SelectItem value="Faible">{t('riskLevels.low', 'Faible')}</SelectItem>
                  <SelectItem value="Moyen">{t('riskLevels.medium', 'Moyen')}</SelectItem>
                  <SelectItem value="Élevé">{t('riskLevels.high', 'Élevé')}</SelectItem>
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
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">{t('pregnancyTracking', 'Suivi des grossesses')}</CardTitle>
            <CardDescription className="text-xs">{filtered.length} {t('patients', 'patientes')}</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
              {filtered.map((p, index) => {
                const RiskIcon = riskIcons[p.riskLevel]
                const lastVisit = p.visits.length > 0 ? p.visits[p.visits.length - 1] : null
                return (
                  <motion.div key={p.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedPregnancy(p)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center size-10 rounded-full bg-pink-100 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 font-bold text-sm">
                          {p.motherName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{p.motherName}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{p.motherId} • {statusLabels[p.status]}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${riskColors[p.riskLevel]}`}>
                        <RiskIcon className="size-3" /> {riskLevelLabels[p.riskLevel]}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                        <p className="text-[10px] text-slate-500">{t('term', 'Terme')}</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{p.term > 0 ? `${p.term} SA` : '—'}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                        <p className="text-[10px] text-slate-500">{t('weight', 'Poids')}</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{lastVisit?.weight || '—'} kg</p>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                        <p className="text-[10px] text-slate-500">{t('bloodPressure', 'TA')}</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{lastVisit?.bp || '—'}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                        <p className="text-[10px] text-slate-500">{t('delivery', 'Accouchement')}</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{p.dueDate || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                      <span>{t('lastVisit', 'Dernière visite')}: {p.lastVisit}</span>
                      <span>{t('visits', 'Visites')}: <span className="font-medium text-teal-600 dark:text-teal-400">{p.visits.length}</span></span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedPregnancy && !showVisitDialog} onOpenChange={() => setSelectedPregnancy(null)}>
        <DialogContent className="sm:max-w-[520px]">
          {selectedPregnancy && (
            <>
              <DialogHeader><DialogTitle className="flex items-center gap-2"><Baby className="size-5 text-pink-600" /> {selectedPregnancy.motherName}</DialogTitle></DialogHeader>
              <div className="space-y-4 py-2">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${riskColors[selectedPregnancy.riskLevel]}`}>
                    {t('risk', 'Risque')} {riskLevelLabels[selectedPregnancy.riskLevel]}
                  </span>
                  <span className="text-xs text-slate-500">{statusLabels[selectedPregnancy.status]}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-xs text-slate-500">{t('term', 'Terme')}</span><p className="font-medium">{selectedPregnancy.term > 0 ? `${selectedPregnancy.term} SA` : t('delivered', 'Accouché')}</p></div>
                  <div><span className="text-xs text-slate-500">{t('dueDate', 'Date prévue')}</span><p className="font-medium text-teal-600 dark:text-teal-400">{selectedPregnancy.dueDate || '—'}</p></div>
                  <div><span className="text-xs text-slate-500">{t('patientId', 'ID')}</span><p className="font-medium">{selectedPregnancy.motherId || '—'}</p></div>
                  <div><span className="text-xs text-slate-500">{t('lastVisit', 'Dernière visite')}</span><p className="font-medium">{selectedPregnancy.lastVisit}</p></div>
                </div>
                {selectedPregnancy.visits.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">{t('visitHistory', 'Historique des visites')}</p>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                      {selectedPregnancy.visits.slice().reverse().map((v, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`size-3 rounded-full ${i === 0 ? 'bg-pink-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                            {i < selectedPregnancy.visits.length - 1 && <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />}
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400">{v.date} — {v.term} SA</span>
                            <p className="text-xs text-slate-700 dark:text-slate-300">{v.weight} kg • {t('bloodPressure', 'TA')} {v.bp} • {v.notes}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter className="flex gap-2">
                <Button className="bg-pink-600 hover:bg-pink-700 text-white" onClick={() => setShowVisitDialog(true)}>{t('addVisit', 'Ajouter une visite')}</Button>
                <Button variant="outline" onClick={() => setSelectedPregnancy(null)}>{tc('close', 'Fermer')}</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* New Visit Dialog */}
      <Dialog open={showVisitDialog} onOpenChange={setShowVisitDialog}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Plus className="size-5 text-pink-600" /> {t('addVisit', 'Ajouter une visite')}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>{tc('date', 'Date')} *</Label><Input type="date" value={visitDate} onChange={e => setVisitDate(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-xs">{t('term', 'Terme')} (SA)</Label><Input type="number" placeholder="32" value={visitTerm} onChange={e => setVisitTerm(e.target.value)} /></div>
              <div className="space-y-2"><Label className="text-xs">{t('weight', 'Poids')} (kg)</Label><Input placeholder="72" value={visitWeight} onChange={e => setVisitWeight(e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label className="text-xs">{t('bloodPressureLabel', 'Tension artérielle')}</Label><Input placeholder="12/8" value={visitBp} onChange={e => setVisitBp(e.target.value)} /></div>
            <div className="space-y-2"><Label>{t('notes', 'Notes')}</Label><Textarea placeholder={t('observationsPlaceholder', 'Observations...')} rows={2} value={visitNotes} onChange={e => setVisitNotes(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVisitDialog(false)}>{tc('cancel', 'Annuler')}</Button>
            <Button className="bg-gradient-to-r from-pink-500 to-rose-600 text-white" onClick={handleAddVisit}>{tc('save', 'Enregistrer')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Pregnancy Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Plus className="size-5 text-pink-600" /> {t('newPregnancy', 'Nouvelle grossesse')}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>{t('motherName', 'Nom de la mère')} *</Label><Input placeholder={t('namePlaceholder', 'Nom complet...')} value={newMotherName} onChange={e => setNewMotherName(e.target.value)} /></div>
            <div className="space-y-2"><Label>{t('patientId', 'ID Patient')}</Label><Input placeholder={t('idPlaceholder', 'ID patiente...')} value={newMotherId} onChange={e => setNewMotherId(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-xs">{t('term', 'Terme')} (SA)</Label><Input type="number" placeholder="12" value={newTerm} onChange={e => setNewTerm(e.target.value)} /></div>
              <div className="space-y-2"><Label className="text-xs">{t('expectedDeliveryDate', 'Date prévue accouchement')}</Label><Input type="date" value={newDueDate} onChange={e => setNewDueDate(e.target.value)} /></div>
            </div>
            <div className="space-y-2">
              <Label>{t('riskLevel', 'Niveau de risque')}</Label>
              <Select value={newRiskLevel} onValueChange={(v) => setNewRiskLevel(v as RiskLevel)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Faible">{t('riskLevels.low', 'Faible')}</SelectItem>
                  <SelectItem value="Moyen">{t('riskLevels.medium', 'Moyen')}</SelectItem>
                  <SelectItem value="Élevé">{t('riskLevels.high', 'Élevé')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>{tc('cancel', 'Annuler')}</Button>
            <Button className="bg-gradient-to-r from-pink-500 to-rose-600 text-white" onClick={handleAddPregnancy}>{tc('save', 'Enregistrer')}</Button>
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
