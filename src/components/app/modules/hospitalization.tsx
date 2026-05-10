'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Bed, Plus, Search, User, Clock, ArrowRight, Activity, Home, Wrench, ShieldCheck,
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

type BedStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE'
type AdmissionStatus = 'ACTIVE' | 'DISCHARGED'

interface BedInfo { id: string; room: string; floor: string; status: BedStatus; patient?: string; admissionDate?: string; department?: string }
interface Admission { id: number; patient: string; doctor: string; department: string; room: string; bed: string; admissionDate: string; reason: string; status: AdmissionStatus; events: { date: string; event: string }[] }

const demoBeds: BedInfo[] = [
  { id: 'A-101', room: 'Chambre 101', floor: 'Étage 1', status: 'OCCUPIED', patient: 'Aminata Diallo', admissionDate: '03/03/2026', department: 'Médecine Interne' },
  { id: 'A-102', room: 'Chambre 101', floor: 'Étage 1', status: 'OCCUPIED', patient: 'Moussa Condé', admissionDate: '04/03/2026', department: 'Urgences' },
  { id: 'A-103', room: 'Chambre 102', floor: 'Étage 1', status: 'AVAILABLE' },
  { id: 'A-104', room: 'Chambre 102', floor: 'Étage 1', status: 'MAINTENANCE' },
  { id: 'B-201', room: 'Chambre 201', floor: 'Étage 2', status: 'OCCUPIED', patient: 'Ibrahim Touré', admissionDate: '01/03/2026', department: 'Cardiologie' },
  { id: 'B-202', room: 'Chambre 201', floor: 'Étage 2', status: 'AVAILABLE' },
  { id: 'B-203', room: 'Chambre 202', floor: 'Étage 2', status: 'OCCUPIED', patient: 'Fatoumata Camara', admissionDate: '05/03/2026', department: 'Maternité' },
  { id: 'B-204', room: 'Chambre 202', floor: 'Étage 2', status: 'AVAILABLE' },
]

const demoAdmissions: Admission[] = [
  { id: 1, patient: 'Aminata Diallo', doctor: 'Dr. Mamadou Bah', department: 'Médecine Interne', room: '101', bed: 'A-101', admissionDate: '03/03/2026', reason: 'Paludisme sévère avec anémie', status: 'ACTIVE', events: [{ date: '03/03', event: 'Admission — Paludisme sévère' }, { date: '04/03', event: 'Transfusion sanguine 2 culots' }, { date: '05/03', event: 'Amélioration clinique' }] },
  { id: 2, patient: 'Moussa Condé', doctor: 'Dr. Kadiatou Souaré', department: 'Urgences', room: '101', bed: 'A-102', admissionDate: '04/03/2026', reason: 'Crise hypertensive', status: 'ACTIVE', events: [{ date: '04/03', event: 'Admission urgences — Crise hypertensive' }, { date: '05/03', event: 'Stabilisation TA 14/9' }] },
  { id: 3, patient: 'Ibrahim Touré', doctor: 'Dr. Aissatou Sylla', department: 'Cardiologie', room: '201', bed: 'B-201', admissionDate: '01/03/2026', reason: 'Insuffisance cardiaque décompensée', status: 'ACTIVE', events: [{ date: '01/03', event: 'Admission — Insuffisance cardiaque' }, { date: '02/03', event: 'ECG + Echographie cardiaque' }, { date: '04/03', event: 'Ajustement traitement' }] },
  { id: 4, patient: 'Fatoumata Camara', doctor: 'Dr. Mamadou Bah', department: 'Maternité', room: '202', bed: 'B-203', admissionDate: '05/03/2026', reason: 'Surveillance grossesse à terme', status: 'ACTIVE', events: [{ date: '05/03', event: 'Admission — Grossesse 39 SA' }] },
]

const bedStatusConfig: Record<BedStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  AVAILABLE: { label: 'Disponible', color: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800', icon: ShieldCheck },
  OCCUPIED: { label: 'Occupé', color: 'bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800', icon: User },
  MAINTENANCE: { label: 'Maintenance', color: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800', icon: Wrench },
}

export function HospitalizationPage() {
  const [search, setSearch] = useState('')
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null)

  const occupied = demoBeds.filter(b => b.status === 'OCCUPIED').length
  const available = demoBeds.filter(b => b.status === 'AVAILABLE').length
  const maintenance = demoBeds.filter(b => b.status === 'MAINTENANCE').length
  const occupancyRate = Math.round((occupied / demoBeds.length) * 100)

  return (
    <motion.div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto" variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/20"><Bed className="size-5 text-white" /></div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Hospitalisation</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Gestion des admissions et lits</p>
          </div>
        </div>
        <Button onClick={() => setShowNewDialog(true)} className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-lg shadow-teal-500/20">
          <Plus className="size-4 mr-2" /> Nouvelle admission
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Taux d\'occupation', value: `${occupancyRate}%`, color: 'from-teal-500 to-emerald-600' },
          { label: 'Lits occupés', value: occupied, color: 'from-rose-500 to-red-600' },
          { label: 'Lits disponibles', value: available, color: 'from-emerald-500 to-green-600' },
          { label: 'En maintenance', value: maintenance, color: 'from-amber-500 to-orange-600' },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bed Occupancy Grid */}
        <motion.div variants={itemVariants}>
          <Card className="border-slate-200/60 dark:border-slate-800/60 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">Occupation des lits</CardTitle>
              <CardDescription className="text-xs">Vue par chambre et étage</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-3">
                {demoBeds.map((bed, index) => {
                  const config = bedStatusConfig[bed.status]
                  const BedIcon = config.icon
                  return (
                    <motion.div key={bed.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }}
                      className={`p-3 rounded-xl border-2 ${config.color} cursor-pointer hover:opacity-80 transition-opacity`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold">{bed.id}</span>
                        <BedIcon className="size-3.5" />
                      </div>
                      <p className="text-[10px] opacity-70">{bed.room} • {bed.floor}</p>
                      {bed.patient && <p className="text-xs font-medium mt-1 truncate">{bed.patient}</p>}
                    </motion.div>
                  )
                })}
              </div>
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 text-xs">
                <span className="flex items-center gap-1.5"><span className="size-3 rounded bg-emerald-500" /> Disponible</span>
                <span className="flex items-center gap-1.5"><span className="size-3 rounded bg-rose-500" /> Occupé</span>
                <span className="flex items-center gap-1.5"><span className="size-3 rounded bg-amber-500" /> Maintenance</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Admissions List */}
        <motion.div variants={itemVariants}>
          <Card className="border-slate-200/60 dark:border-slate-800/60 h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">Admissions actives</CardTitle>
                  <CardDescription className="text-xs">{demoAdmissions.length} patients hospitalisés</CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                  <Input placeholder="Rechercher..." className="pl-8 h-8 text-xs w-[160px]" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                {demoAdmissions.filter(a => a.patient.toLowerCase().includes(search.toLowerCase())).map((adm, index) => (
                  <motion.div key={adm.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
                    className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedAdmission(adm)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{adm.patient}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{adm.doctor} • {adm.department}</p>
                      </div>
                      <Badge className="bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 text-[10px]">Lit {adm.bed}</Badge>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{adm.reason}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <Clock className="size-3" /> Depuis le {adm.admissionDate}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedAdmission} onOpenChange={() => setSelectedAdmission(null)}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedAdmission && (
            <>
              <DialogHeader><DialogTitle className="flex items-center gap-2"><Bed className="size-5 text-teal-600" /> {selectedAdmission.patient}</DialogTitle></DialogHeader>
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-xs text-slate-500">Médecin</span><p className="font-medium text-slate-900 dark:text-white">{selectedAdmission.doctor}</p></div>
                  <div><span className="text-xs text-slate-500">Département</span><p className="font-medium text-slate-900 dark:text-white">{selectedAdmission.department}</p></div>
                  <div><span className="text-xs text-slate-500">Chambre / Lit</span><p className="font-medium text-slate-900 dark:text-white">{selectedAdmission.room} / {selectedAdmission.bed}</p></div>
                  <div><span className="text-xs text-slate-500">Date admission</span><p className="font-medium text-slate-900 dark:text-white">{selectedAdmission.admissionDate}</p></div>
                </div>
                <div><span className="text-xs text-slate-500">Motif</span><p className="text-sm text-slate-700 dark:text-slate-300 mt-0.5">{selectedAdmission.reason}</p></div>
                <div>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">Historique d&apos;hospitalisation</p>
                  <div className="space-y-2">
                    {selectedAdmission.events.map((ev, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`size-3 rounded-full ${i === selectedAdmission.events.length - 1 ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                          {i < selectedAdmission.events.length - 1 && <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />}
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400">{ev.date}</span>
                          <p className="text-xs text-slate-700 dark:text-slate-300">{ev.event}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter className="flex gap-2">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Programmer sortie</Button>
                <Button variant="outline" onClick={() => setSelectedAdmission(null)}>Fermer</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* New Admission Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>Nouvelle admission</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Patient *</Label><Select><SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger><SelectContent><SelectItem value="1">Aminata Diallo</SelectItem><SelectItem value="2">Ibrahim Touré</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>Médecin *</Label><Select><SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger><SelectContent><SelectItem value="1">Dr. Mamadou Bah</SelectItem><SelectItem value="2">Dr. Aissatou Sylla</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Département</Label><Select><SelectTrigger><SelectValue placeholder="Département..." /></SelectTrigger><SelectContent><SelectItem value="med">Médecine Interne</SelectItem><SelectItem value="chir">Chirurgie</SelectItem><SelectItem value="mat">Maternité</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>Lit</Label><Select><SelectTrigger><SelectValue placeholder="Lit disponible..." /></SelectTrigger><SelectContent>{demoBeds.filter(b => b.status === 'AVAILABLE').map(b => <SelectItem key={b.id} value={b.id}>{b.id} — {b.room}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="space-y-2"><Label>Motif d&apos;admission *</Label><Textarea placeholder="Décrire le motif..." rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Annuler</Button>
            <Button className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white" onClick={() => setShowNewDialog(false)}>Admettre</Button>
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
