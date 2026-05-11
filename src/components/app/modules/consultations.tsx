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
    toast({ title: 'Consultation créée', description: `Consultation pour ${newPatient} enregistrée.` })
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
    toast({ title: 'Consultation démarrée', description: 'La consultation est maintenant en cours.' })
  }

  const handleEndConsultation = (id: string) => {
    updateConsultation(id, { status: 'Terminée' })
    toast({ title: 'Consultation terminée', description: 'La consultation a été marquée comme terminée.' })
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
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Consultations</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Suivi des consultations médicales</p>
          </div>
        </div>
        <Button onClick={() => setShowNewDialog(true)} className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-lg shadow-teal-500/20">
          <Plus className="size-4 mr-2" /> Nouvelle consultation
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: consultations.length, color: 'from-teal-500 to-emerald-600' },
          { label: 'En cours', value: activeCount, color: 'from-cyan-500 to-teal-600' },
          { label: 'Terminées', value: completedCount, color: 'from-emerald-500 to-green-600' },
          { label: 'En attente', value: consultations.filter(c => c.status === 'En attente').length, color: 'from-amber-500 to-orange-600' },
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
                <Input placeholder="Rechercher patient, motif..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Statut" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="En cours">En cours</SelectItem>
                  <SelectItem value="Terminée">Terminée</SelectItem>
                  <SelectItem value="En attente">En attente</SelectItem>
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
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">Liste des consultations</CardTitle>
            <CardDescription className="text-xs">{filtered.length} consultations</CardDescription>
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
                      <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${statusColors[consult.status]}`}>{consult.status}</span>
                      {consult.status === 'En attente' && (
                        <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-7" onClick={(e) => { e.stopPropagation(); handleStartConsultation(consult.id) }}>
                          Démarrer
                        </Button>
                      )}
                      {consult.status === 'En cours' && (
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7" onClick={(e) => { e.stopPropagation(); handleEndConsultation(consult.id) }}>
                          Terminer
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Motif:</span>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{consult.reason}</span>
                    {consult.diagnosis && <><span className="text-slate-300 dark:text-slate-600">•</span><span className="text-xs text-teal-600 dark:text-teal-400">{consult.diagnosis}</span></>}
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    <VitalCard icon={Heart} label="TA" value={consult.vitals.ta} unit="cmHg" color="bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300" />
                    <VitalCard icon={Activity} label="FC" value={consult.vitals.fc} unit="bpm" color="bg-cyan-50 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-300" />
                    <VitalCard icon={Thermometer} label="T°" value={consult.vitals.temp} unit="°C" color="bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300" />
                    <VitalCard icon={Activity} label="SpO2" value={consult.vitals.spo2} unit="%" color="bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300" />
                    <VitalCard icon={FileText} label="Poids" value={consult.vitals.poids} unit="kg" color="bg-teal-50 text-teal-700 dark:bg-teal-950/30 dark:text-teal-300" />
                  </div>
                  {consult.prescriptions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <Pill className="size-3.5 text-teal-600 dark:text-teal-400" />
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Ordonnance</span>
                        </div>
                        {consult.prescriptions.length > 1 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setCurrentView('ai-interactions'); }}
                            className="text-[10px] text-amber-600 dark:text-amber-400 font-medium hover:underline flex items-center gap-1"
                          >
                            <ShieldAlert className="size-3" /> Vérifier interactions
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
                  Consultation — {selectedConsult.patientName}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-xs text-slate-500">Médecin</span><p className="font-medium text-slate-900 dark:text-white">{selectedConsult.doctor}</p></div>
                  <div><span className="text-xs text-slate-500">Date/Heure</span><p className="font-medium text-slate-900 dark:text-white">{selectedConsult.date} {selectedConsult.time}</p></div>
                  <div><span className="text-xs text-slate-500">Motif</span><p className="font-medium text-slate-900 dark:text-white">{selectedConsult.reason}</p></div>
                  <div><span className="text-xs text-slate-500">Diagnostic</span><p className="font-medium text-teal-700 dark:text-teal-300">{selectedConsult.diagnosis || '—'}</p></div>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">Constantes vitales</p>
                  <div className="grid grid-cols-5 gap-2">
                    <VitalCard icon={Heart} label="TA" value={selectedConsult.vitals.ta} unit="cmHg" color="bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300" />
                    <VitalCard icon={Activity} label="FC" value={selectedConsult.vitals.fc} unit="bpm" color="bg-cyan-50 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-300" />
                    <VitalCard icon={Thermometer} label="T°" value={selectedConsult.vitals.temp} unit="°C" color="bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300" />
                    <VitalCard icon={Activity} label="SpO2" value={selectedConsult.vitals.spo2} unit="%" color="bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300" />
                    <VitalCard icon={FileText} label="Poids" value={selectedConsult.vitals.poids} unit="kg" color="bg-teal-50 text-teal-700 dark:bg-teal-950/30 dark:text-teal-300" />
                  </div>
                </div>
                {selectedConsult.prescriptions.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">Prescriptions</p>
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
                    Démarrer consultation
                  </Button>
                )}
                {selectedConsult.status === 'En cours' && (
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => { handleEndConsultation(selectedConsult.id) }}>
                    Terminer
                  </Button>
                )}
                <Button variant="outline" onClick={() => setSelectedConsult(null)}>Fermer</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* New Consultation Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-[580px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Plus className="size-5 text-teal-600" /> Nouvelle consultation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Patient *</Label><Input placeholder="Nom du patient" value={newPatient} onChange={e => setNewPatient(e.target.value)} /></div>
              <div className="space-y-2"><Label>Médecin *</Label><Input placeholder="Nom du médecin" value={newDoctor} onChange={e => setNewDoctor(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Date</Label><Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} /></div>
              <div className="space-y-2"><Label>Heure</Label><Input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>Motif de consultation *</Label><Textarea placeholder="Décrire le motif..." rows={2} value={newMotif} onChange={e => setNewMotif(e.target.value)} /></div>
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Constantes vitales</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1"><Label className="text-xs">TA (cmHg)</Label><Input placeholder="12/8" value={newTa} onChange={e => setNewTa(e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">FC (bpm)</Label><Input placeholder="80" value={newFc} onChange={e => setNewFc(e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">T° (°C)</Label><Input placeholder="37.0" value={newTemp} onChange={e => setNewTemp(e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">SpO2 (%)</Label><Input placeholder="98" value={newSpo2} onChange={e => setNewSpo2(e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">Poids (kg)</Label><Input placeholder="65" value={newPoids} onChange={e => setNewPoids(e.target.value)} /></div>
              </div>
            </div>
            <div className="space-y-2"><Label>Diagnostic</Label><Input placeholder="Diagnostic..." value={newDiagnosis} onChange={e => setNewDiagnosis(e.target.value)} /></div>
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Prescription</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1"><Label className="text-xs">Médicament</Label><Input placeholder="Nom..." value={newMedication} onChange={e => setNewMedication(e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">Posologie</Label><Input placeholder="Dosage..." value={newDosage} onChange={e => setNewDosage(e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">Durée</Label><Input placeholder="7 jours" value={newDuration} onChange={e => setNewDuration(e.target.value)} /></div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Annuler</Button>
            <Button className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white" onClick={handleNewConsultation}>Enregistrer</Button>
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
