'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Stethoscope, Plus, Search, Heart, Thermometer, Activity, Eye, Clock, FileText, Pill, ShieldAlert,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDataStore, type Consultation } from '@/lib/data-store'
import { useStore } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'
import { useTranslation } from '@/i18n/provider'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } }

type ConsultStatus = Consultation['status']

const statusColors: Record<ConsultStatus, string> = {
  'En cours': 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800',
  'Terminée': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  'En attente': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
}

function VitalCard({ icon: Icon, label, value, unit, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number; unit: string; color: string }) {
  return (
    <div className={`flex items-center gap-2 p-2.5 rounded-lg ${color}`}>
      <Icon className="size-4 shrink-0" />
      <div>
        <p className="text-[10px] uppercase tracking-wider opacity-70">{label}</p>
        <p className="text-sm font-bold">{value} <span className="text-xs font-normal">{unit}</span></p>
      </div>
    </div>
  )
}

export function ConsultationsPage() {
  const { t } = useTranslation('consultations')
  const { t: tc } = useTranslation('common')

  const statusLabels: Record<string, string> = {
    'En cours': t('status.inProgress', 'En cours'),
    'Terminée': t('status.completed', 'Terminée'),
    'En attente': t('status.pending', 'En attente'),
  }

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [selectedConsult, setSelectedConsult] = useState<Consultation | null>(null)

  const { consultations, addConsultation, updateConsultation } = useDataStore()
  const { setCurrentView } = useStore()
  const { toast } = useToast()

  // New consultation form state
  const [newPatient, setNewPatient] = useState('')
  const [newDoctor, setNewDoctor] = useState('')
  const [newMotif, setNewMotif] = useState('')
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [newDiagnosis, setNewDiagnosis] = useState('')
  const [newTa, setNewTa] = useState('')
  const [newFc, setNewFc] = useState('')
  const [newTemp, setNewTemp] = useState('')
  const [newSpo2, setNewSpo2] = useState('')
  const [newPoids, setNewPoids] = useState('')
  const [newMedication, setNewMedication] = useState('')
  const [newDosage, setNewDosage] = useState('')
  const [newDuration, setNewDuration] = useState('')

  const filtered = consultations.filter(c => {
    const matchSearch = c.patientName.toLowerCase().includes(search.toLowerCase()) || c.reason.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    return matchSearch && matchStatus
  })

  const activeCount = consultations.filter(c => c.status === 'En cours').length
  const completedCount = consultations.filter(c => c.status === 'Terminée').length

  const handleNewConsultation = () => {
    if (!newPatient || !newDoctor || !newMotif) return
    addConsultation({
      id: `CONS-${Date.now()}`,
      patientName: newPatient,
      patientId: '',
      doctor: newDoctor,
      date: newDate || new Date().toISOString().split('T')[0],
      time: newTime || new Date().toTimeString().slice(0, 5),
      reason: newMotif,
      diagnosis: newDiagnosis,
      status: 'En attente',
      vitals: { ta: newTa || '—', fc: newFc || '—', temp: newTemp || '—', spo2: newSpo2 || '—', poids: newPoids || '—' },
      prescriptions: newMedication ? [{ medication: newMedication, dosage: newDosage, duration: newDuration, instructions: '' }] : [],
    })
    toast({ title: t('toast.created', 'Consultation créée'), description: t('toast.createdDescription', `Consultation pour ${newPatient} enregistrée.`) })
    setShowNewDialog(false)
    setNewPatient('')
    setNewDoctor('')
    setNewMotif('')
    setNewDate('')
    setNewTime('')
    setNewDiagnosis('')
    setNewTa('')
    setNewFc('')
    setNewTemp('')
    setNewSpo2('')
    setNewPoids('')
    setNewMedication('')
    setNewDosage('')
    setNewDuration('')
  }

  const handleStartConsultation = (id: string) => {
    updateConsultation(id, { status: 'En cours' })
    toast({ title: t('toast.started', 'Consultation démarrée'), description: t('toast.startedDescription', 'La consultation est maintenant en cours.') })
  }

  const handleEndConsultation = (id: string) => {
    updateConsultation(id, { status: 'Terminée' })
    toast({ title: t('toast.completed', 'Consultation terminée'), description: t('toast.completedDescription', 'La consultation a été marquée comme terminée.') })
    if (selectedConsult?.id === id) {
      setSelectedConsult(useDataStore.getState().consultations.find(c => c.id === id) || null)
    }
  }

  return (
    <motion.div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto" variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/20">
            <Stethoscope className="size-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{t('title', 'Consultations')}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('subtitle', 'Suivi des consultations médicales')}</p>
          </div>
        </div>
        <Button onClick={() => setShowNewDialog(true)} className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-lg shadow-teal-500/20">
          <Plus className="size-4 mr-2" /> {t('newConsultation', 'Nouvelle consultation')}
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: t('stats.total', 'Total'), value: consultations.length, color: 'from-teal-500 to-emerald-600' },
          { label: t('status.inProgress', 'En cours'), value: activeCount, color: 'from-cyan-500 to-teal-600' },
          { label: t('stats.completed', 'Terminées'), value: completedCount, color: 'from-emerald-500 to-green-600' },
          { label: t('status.pending', 'En attente'), value: consultations.filter(c => c.status === 'En attente').length, color: 'from-amber-500 to-orange-600' },
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
                <Input placeholder={t('searchPlaceholder', 'Rechercher patient, motif...')} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder={tc('status', 'Statut')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{tc('all', 'Tous')}</SelectItem>
                  <SelectItem value="En cours">{t('status.inProgress', 'En cours')}</SelectItem>
                  <SelectItem value="Terminée">{t('status.completed', 'Terminée')}</SelectItem>
                  <SelectItem value="En attente">{t('status.pending', 'En attente')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Consultation List */}
      <motion.div variants={itemVariants}>
        <Card className="border-slate-200/60 dark:border-slate-800/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">{t('listTitle', 'Liste des consultations')}</CardTitle>
            <CardDescription className="text-xs">{filtered.length} {t('consultationCount', 'consultations')}</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
              {filtered.map((consult, index) => (
                <motion.div
                  key={consult.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedConsult(consult)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center size-10 rounded-full bg-teal-100 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold text-sm">
                        {consult.patientName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{consult.patientName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{consult.doctor} • {consult.date} {consult.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${statusColors[consult.status]}`}>{statusLabels[consult.status] || consult.status}</span>
                      {consult.status === 'En attente' && (
                        <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-7" onClick={(e) => { e.stopPropagation(); handleStartConsultation(consult.id) }}>
                          {t('start', 'Démarrer')}
                        </Button>
                      )}
                      {consult.status === 'En cours' && (
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7" onClick={(e) => { e.stopPropagation(); handleEndConsultation(consult.id) }}>
                          {t('end', 'Terminer')}
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-slate-500 dark:text-slate-400">{t('reason', 'Motif')}:</span>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{consult.reason}</span>
                    {consult.diagnosis && <><span className="text-slate-300 dark:text-slate-600">•</span><span className="text-xs text-teal-600 dark:text-teal-400">{consult.diagnosis}</span></>}
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    <VitalCard icon={Heart} label={t('bloodPressure', 'TA')} value={consult.vitals.ta} unit="cmHg" color="bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300" />
                    <VitalCard icon={Activity} label={t('heartRate', 'FC')} value={consult.vitals.fc} unit="bpm" color="bg-cyan-50 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-300" />
                    <VitalCard icon={Thermometer} label={t('temperature', 'T°')} value={consult.vitals.temp} unit="°C" color="bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300" />
                    <VitalCard icon={Activity} label={t('oxygenSaturation', 'SpO2')} value={consult.vitals.spo2} unit="%" color="bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300" />
                    <VitalCard icon={FileText} label={t('weight', 'Poids')} value={consult.vitals.poids} unit="kg" color="bg-teal-50 text-teal-700 dark:bg-teal-950/30 dark:text-teal-300" />
                  </div>
                  {consult.prescriptions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <Pill className="size-3.5 text-teal-600 dark:text-teal-400" />
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{t('prescriptions', 'Ordonnance')}</span>
                        </div>
                        {consult.prescriptions.length > 1 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setCurrentView('ai-interactions'); }}
                            className="text-[10px] text-amber-600 dark:text-amber-400 font-medium hover:underline flex items-center gap-1"
                          >
                            <ShieldAlert className="size-3" /> {t('checkInteractions', 'Vérifier interactions')}
                          </button>
                        )}
                      </div>
                      {consult.prescriptions.map((p, i) => (
                        <p key={i} className="text-xs text-slate-500 dark:text-slate-400 ml-5">• {p.medication} — {p.dosage} ({p.duration})</p>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedConsult} onOpenChange={() => setSelectedConsult(null)}>
        <DialogContent className="sm:max-w-[550px]">
          {selectedConsult && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Stethoscope className="size-5 text-teal-600" />
                  {t('detailTitle', 'Consultation')} — {selectedConsult.patientName}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-xs text-slate-500">{t('doctor', 'Médecin')}</span><p className="font-medium text-slate-900 dark:text-white">{selectedConsult.doctor}</p></div>
                  <div><span className="text-xs text-slate-500">{tc('date', 'Date')}/{tc('time', 'Heure')}</span><p className="font-medium text-slate-900 dark:text-white">{selectedConsult.date} {selectedConsult.time}</p></div>
                  <div><span className="text-xs text-slate-500">{t('reason', 'Motif')}</span><p className="font-medium text-slate-900 dark:text-white">{selectedConsult.reason}</p></div>
                  <div><span className="text-xs text-slate-500">{t('diagnosis', 'Diagnostic')}</span><p className="font-medium text-teal-700 dark:text-teal-300">{selectedConsult.diagnosis || '—'}</p></div>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">{t('vitals', 'Constantes vitales')}</p>
                  <div className="grid grid-cols-5 gap-2">
                    <VitalCard icon={Heart} label={t('bloodPressure', 'TA')} value={selectedConsult.vitals.ta} unit="cmHg" color="bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300" />
                    <VitalCard icon={Activity} label={t('heartRate', 'FC')} value={selectedConsult.vitals.fc} unit="bpm" color="bg-cyan-50 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-300" />
                    <VitalCard icon={Thermometer} label={t('temperature', 'T°')} value={selectedConsult.vitals.temp} unit="°C" color="bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300" />
                    <VitalCard icon={Activity} label={t('oxygenSaturation', 'SpO2')} value={selectedConsult.vitals.spo2} unit="%" color="bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300" />
                    <VitalCard icon={FileText} label={t('weight', 'Poids')} value={selectedConsult.vitals.poids} unit="kg" color="bg-teal-50 text-teal-700 dark:bg-teal-950/30 dark:text-teal-300" />
                  </div>
                </div>
                {selectedConsult.prescriptions.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">{t('prescriptions', 'Prescriptions')}</p>
                    <div className="space-y-1.5">
                      {selectedConsult.prescriptions.map((p, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-teal-50 dark:bg-teal-950/30">
                          <Pill className="size-3.5 text-teal-600 dark:text-teal-400" />
                          <span className="text-xs font-medium text-slate-900 dark:text-white">{p.medication}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">— {p.dosage} ({p.duration})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                {selectedConsult.status === 'En attente' && (
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={() => { handleStartConsultation(selectedConsult.id); setSelectedConsult(useDataStore.getState().consultations.find(c => c.id === selectedConsult.id) || null) }}>
                    {t('startConsultation', 'Démarrer consultation')}
                  </Button>
                )}
                {selectedConsult.status === 'En cours' && (
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => { handleEndConsultation(selectedConsult.id) }}>
                    {t('end', 'Terminer')}
                  </Button>
                )}
                <Button variant="outline" onClick={() => setSelectedConsult(null)}>{tc('close', 'Fermer')}</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* New Consultation Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-[580px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Plus className="size-5 text-teal-600" /> {t('newConsultation', 'Nouvelle consultation')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t('patientName', 'Patient')} *</Label><Input placeholder={t('patientNamePlaceholder', 'Nom du patient')} value={newPatient} onChange={e => setNewPatient(e.target.value)} /></div>
              <div className="space-y-2"><Label>{t('doctor', 'Médecin')} *</Label><Input placeholder={t('doctorPlaceholder', 'Nom du médecin')} value={newDoctor} onChange={e => setNewDoctor(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{tc('date', 'Date')}</Label><Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} /></div>
              <div className="space-y-2"><Label>{tc('time', 'Heure')}</Label><Input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>{t('reason', 'Motif de consultation')} *</Label><Textarea placeholder={t('reasonPlaceholder', 'Décrire le motif...')} rows={2} value={newMotif} onChange={e => setNewMotif(e.target.value)} /></div>
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('vitals', 'Constantes vitales')}</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1"><Label className="text-xs">{t('bloodPressure', 'TA')} (cmHg)</Label><Input placeholder="12/8" value={newTa} onChange={e => setNewTa(e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">{t('heartRate', 'FC')} (bpm)</Label><Input placeholder="80" value={newFc} onChange={e => setNewFc(e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">{t('temperature', 'T°')} (°C)</Label><Input placeholder="37.0" value={newTemp} onChange={e => setNewTemp(e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">{t('oxygenSaturation', 'SpO2')} (%)</Label><Input placeholder="98" value={newSpo2} onChange={e => setNewSpo2(e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">{t('weight', 'Poids')} (kg)</Label><Input placeholder="65" value={newPoids} onChange={e => setNewPoids(e.target.value)} /></div>
              </div>
            </div>
            <div className="space-y-2"><Label>{t('diagnosis', 'Diagnostic')}</Label><Input placeholder={t('diagnosisPlaceholder', 'Diagnostic...')} value={newDiagnosis} onChange={e => setNewDiagnosis(e.target.value)} /></div>
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('prescriptions', 'Prescription')}</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1"><Label className="text-xs">{t('medication', 'Médicament')}</Label><Input placeholder={t('medicationPlaceholder', 'Nom...')} value={newMedication} onChange={e => setNewMedication(e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">{t('dosage', 'Posologie')}</Label><Input placeholder={t('dosagePlaceholder', 'Dosage...')} value={newDosage} onChange={e => setNewDosage(e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">{t('duration', 'Durée')}</Label><Input placeholder={t('durationPlaceholder', '7 jours')} value={newDuration} onChange={e => setNewDuration(e.target.value)} /></div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>{tc('cancel', 'Annuler')}</Button>
            <Button className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white" onClick={handleNewConsultation}>{tc('save', 'Enregistrer')}</Button>
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
