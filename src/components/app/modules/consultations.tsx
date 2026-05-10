'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Stethoscope, Plus, Search, Heart, Thermometer, Activity, Eye, Clock, FileText, Pill,
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

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } }

type ConsultStatus = 'En cours' | 'Terminée' | 'En attente'

interface Vitals { ta: string; fc: number; temp: number; spo2: number; poids: number }
interface Prescription { medication: string; dosage: string; duration: string }
interface Consultation {
  id: number; patient: string; doctor: string; date: string; time: string; motif: string
  status: ConsultStatus; vitals: Vitals; diagnosis: string; prescriptions: Prescription[]
}

const demoConsultations: Consultation[] = [
  { id: 1, patient: 'Aminata Diallo', doctor: 'Dr. Mamadou Bah', date: '05/03/2026', time: '08:15', motif: 'Fièvre et céphalées', status: 'En cours', vitals: { ta: '12/8', fc: 88, temp: 38.5, spo2: 96, poids: 62 }, diagnosis: 'Paludisme simple', prescriptions: [{ medication: 'Artéméther/Luméfantrine', dosage: '4 comprimés x 2/jour', duration: '3 jours' }, { medication: 'Paracétamol 500mg', dosage: '1 comprimé x 3/jour', duration: '3 jours' }] },
  { id: 2, patient: 'Ibrahim Touré', doctor: 'Dr. Aissatou Sylla', date: '05/03/2026', time: '09:00', motif: 'Suivi HTA', status: 'Terminée', vitals: { ta: '16/9.5', fc: 72, temp: 36.8, spo2: 98, poids: 85 }, diagnosis: 'Hypertension artérielle contrôlée', prescriptions: [{ medication: 'Amlodipine 5mg', dosage: '1 comprimé/jour', duration: '30 jours' }] },
  { id: 3, patient: 'Fatoumata Camara', doctor: 'Dr. Mamadou Bah', date: '05/03/2026', time: '09:45', motif: 'Douleurs abdominales', status: 'En attente', vitals: { ta: '11/7', fc: 92, temp: 37.2, spo2: 97, poids: 58 }, diagnosis: '', prescriptions: [] },
  { id: 4, patient: 'Moussa Condé', doctor: 'Dr. Kadiatou Souaré', date: '05/03/2026', time: '10:30', motif: 'Toux et difficulté respiratoire', status: 'En cours', vitals: { ta: '13/8', fc: 95, temp: 37.8, spo2: 93, poids: 70 }, diagnosis: 'Infection respiratoire aiguë', prescriptions: [{ medication: 'Amoxicilline 500mg', dosage: '1 gélule x 3/jour', duration: '7 jours' }, { medication: 'Salbutamol inhalé', dosage: '2 bouffées x 3/jour', duration: '5 jours' }] },
  { id: 5, patient: 'Kadiatou Sylla', doctor: 'Dr. Aissatou Sylla', date: '04/03/2026', time: '14:00', motif: 'Céphalées chroniques', status: 'Terminée', vitals: { ta: '14/9', fc: 78, temp: 36.6, spo2: 99, poids: 65 }, diagnosis: 'Céphalée de tension', prescriptions: [{ medication: 'Ibuprofène 400mg', dosage: '1 comprimé si douleur', duration: '5 jours' }] },
  { id: 6, patient: 'Abdoulaye Keita', doctor: 'Dr. Mamadou Bah', date: '04/03/2026', time: '15:30', motif: 'Blessure au pied droit', status: 'Terminée', vitals: { ta: '12/8', fc: 80, temp: 36.9, spo2: 98, poids: 78 }, diagnosis: 'Plaie simple pied droit', prescriptions: [{ medication: 'Amoxicilline/Acide clavulanique', dosage: '1 comprimé x 2/jour', duration: '7 jours' }, { medication: 'Doliprane 1g', dosage: '1 comprimé x 3/jour', duration: '3 jours' }] },
]

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

  const filtered = demoConsultations.filter(c => {
    const matchSearch = c.patient.toLowerCase().includes(search.toLowerCase()) || c.motif.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    return matchSearch && matchStatus
  })

  const activeCount = demoConsultations.filter(c => c.status === 'En cours').length
  const completedCount = demoConsultations.filter(c => c.status === 'Terminée').length

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
          { label: 'Total', value: demoConsultations.length, color: 'from-teal-500 to-emerald-600' },
          { label: 'En cours', value: activeCount, color: 'from-cyan-500 to-teal-600' },
          { label: 'Terminées', value: completedCount, color: 'from-emerald-500 to-green-600' },
          { label: 'En attente', value: demoConsultations.filter(c => c.status === 'En attente').length, color: 'from-amber-500 to-orange-600' },
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
                        {consult.patient.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{consult.patient}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{consult.doctor} • {consult.date} {consult.time}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${statusColors[consult.status]}`}>{consult.status}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Motif:</span>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{consult.motif}</span>
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
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Pill className="size-3.5 text-teal-600 dark:text-teal-400" />
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Ordonnance</span>
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
                  Consultation — {selectedConsult.patient}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-xs text-slate-500">Médecin</span><p className="font-medium text-slate-900 dark:text-white">{selectedConsult.doctor}</p></div>
                  <div><span className="text-xs text-slate-500">Date/Heure</span><p className="font-medium text-slate-900 dark:text-white">{selectedConsult.date} {selectedConsult.time}</p></div>
                  <div><span className="text-xs text-slate-500">Motif</span><p className="font-medium text-slate-900 dark:text-white">{selectedConsult.motif}</p></div>
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
              <DialogFooter><Button variant="outline" onClick={() => setSelectedConsult(null)}>Fermer</Button></DialogFooter>
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
              <div className="space-y-2"><Label>Patient *</Label><Select><SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger><SelectContent><SelectItem value="1">Aminata Diallo</SelectItem><SelectItem value="2">Ibrahim Touré</SelectItem><SelectItem value="3">Fatoumata Camara</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>Médecin *</Label><Select><SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger><SelectContent><SelectItem value="1">Dr. Mamadou Bah</SelectItem><SelectItem value="2">Dr. Aissatou Sylla</SelectItem></SelectContent></Select></div>
            </div>
            <div className="space-y-2"><Label>Motif de consultation *</Label><Textarea placeholder="Décrire le motif..." rows={2} /></div>
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Constantes vitales</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1"><Label className="text-xs">TA (cmHg)</Label><Input placeholder="12/8" /></div>
                <div className="space-y-1"><Label className="text-xs">FC (bpm)</Label><Input placeholder="80" type="number" /></div>
                <div className="space-y-1"><Label className="text-xs">T° (°C)</Label><Input placeholder="37.0" type="number" step="0.1" /></div>
                <div className="space-y-1"><Label className="text-xs">SpO2 (%)</Label><Input placeholder="98" type="number" /></div>
                <div className="space-y-1"><Label className="text-xs">Poids (kg)</Label><Input placeholder="65" type="number" /></div>
              </div>
            </div>
            <div className="space-y-2"><Label>Diagnostic</Label><Input placeholder="Diagnostic..." /></div>
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Prescription</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1"><Label className="text-xs">Médicament</Label><Input placeholder="Nom..." /></div>
                <div className="space-y-1"><Label className="text-xs">Posologie</Label><Input placeholder="Dosage..." /></div>
                <div className="space-y-1"><Label className="text-xs">Durée</Label><Input placeholder="7 jours" /></div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Annuler</Button>
            <Button className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white" onClick={() => setShowNewDialog(false)}>Enregistrer</Button>
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
