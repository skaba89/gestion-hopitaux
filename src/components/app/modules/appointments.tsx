'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar, Plus, Search, Clock, User, CheckCircle2, AlertCircle, XCircle, CircleDot,
  ChevronLeft, ChevronRight, Filter,
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
}

type AppointmentStatus = 'Confirmé' | 'En attente' | 'Annulé' | 'Terminé'
type AppointmentType = 'Consultation' | 'Suivi' | 'Urgence' | 'Contrôle'

interface Appointment {
  id: number
  patient: string
  doctor: string
  date: string
  time: string
  duration: number
  type: AppointmentType
  status: AppointmentStatus
  reason: string
}

const demoAppointments: Appointment[] = [
  { id: 1, patient: 'Aminata Diallo', doctor: 'Dr. Mamadou Bah', date: '2026-03-05', time: '08:00', duration: 30, type: 'Consultation', status: 'Confirmé', reason: 'Fièvre et maux de tête depuis 3 jours' },
  { id: 2, patient: 'Ibrahim Touré', doctor: 'Dr. Aissatou Sylla', date: '2026-03-05', time: '08:30', duration: 30, type: 'Suivi', status: 'Confirmé', reason: 'Suivi hypertension artérielle' },
  { id: 3, patient: 'Fatoumata Camara', doctor: 'Dr. Mamadou Bah', date: '2026-03-05', time: '09:00', duration: 45, type: 'Consultation', status: 'En attente', reason: 'Douleurs abdominales récurrentes' },
  { id: 4, patient: 'Moussa Condé', doctor: 'Dr. Kadiatou Souaré', date: '2026-03-05', time: '09:30', duration: 30, type: 'Urgence', status: 'Confirmé', reason: 'Crise de paludisme sévère' },
  { id: 5, patient: 'Mariama Bah', doctor: 'Dr. Aissatou Sylla', date: '2026-03-05', time: '10:00', duration: 30, type: 'Contrôle', status: 'En attente', reason: 'Contrôle prénatal 3ème trimestre' },
  { id: 6, patient: 'Abdoulaye Keita', doctor: 'Dr. Mamadou Bah', date: '2026-03-05', time: '10:30', duration: 30, type: 'Suivi', status: 'Annulé', reason: 'Suivi diabète type 2' },
  { id: 7, patient: 'Kadiatou Sylla', doctor: 'Dr. Kadiatou Souaré', date: '2026-03-05', time: '11:00', duration: 30, type: 'Consultation', status: 'Confirmé', reason: 'Infection respiratoire aiguë' },
  { id: 8, patient: 'Lamine Kaba', doctor: 'Dr. Aissatou Sylla', date: '2026-03-05', time: '11:30', duration: 30, type: 'Contrôle', status: 'Terminé', reason: 'Vaccination DTC rappel' },
]

const statusConfig: Record<AppointmentStatus, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  'Confirmé': { icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' },
  'En attente': { icon: AlertCircle, color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' },
  'Annulé': { icon: XCircle, color: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-950/40 dark:text-slate-400 dark:border-slate-700' },
  'Terminé': { icon: CircleDot, color: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800' },
}

const typeColors: Record<AppointmentType, string> = {
  'Consultation': 'bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300',
  'Suivi': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300',
  'Urgence': 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
  'Contrôle': 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300',
}

const timeSlots = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '14:00', '14:30', '15:00', '15:30', '16:00']

function StatusBadge({ status }: { status: AppointmentStatus }) {
  const config = statusConfig[status]
  const Icon = config.icon
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${config.color}`}>
      <Icon className="size-3" />
      {status}
    </span>
  )
}

export function AppointmentsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

  const filtered = demoAppointments.filter(a => {
    const matchSearch = a.patient.toLowerCase().includes(search.toLowerCase()) || a.doctor.toLowerCase().includes(search.toLowerCase()) || a.reason.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || a.status === statusFilter
    return matchSearch && matchStatus
  })

  const statusCounts = {
    total: demoAppointments.length,
    confirmed: demoAppointments.filter(a => a.status === 'Confirmé').length,
    pending: demoAppointments.filter(a => a.status === 'En attente').length,
    completed: demoAppointments.filter(a => a.status === 'Terminé').length,
  }

  return (
    <motion.div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto" variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/20">
            <Calendar className="size-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Rendez-vous</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Planification et suivi des rendez-vous</p>
          </div>
        </div>
        <Button onClick={() => setShowNewDialog(true)} className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-lg shadow-teal-500/20">
          <Plus className="size-4 mr-2" /> Nouveau rendez-vous
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Aujourd'hui", value: statusCounts.total, color: 'from-teal-500 to-emerald-600' },
          { label: 'Confirmés', value: statusCounts.confirmed, color: 'from-emerald-500 to-green-600' },
          { label: 'En attente', value: statusCounts.pending, color: 'from-amber-500 to-orange-600' },
          { label: 'Terminés', value: statusCounts.completed, color: 'from-cyan-500 to-teal-600' },
        ].map((stat) => (
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

      {/* Search + Filter */}
      <motion.div variants={itemVariants}>
        <Card className="border-slate-200/60 dark:border-slate-800/60">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input placeholder="Rechercher patient, médecin, motif..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Statut" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="Confirmé">Confirmé</SelectItem>
                  <SelectItem value="En attente">En attente</SelectItem>
                  <SelectItem value="Annulé">Annulé</SelectItem>
                  <SelectItem value="Terminé">Terminé</SelectItem>
                </SelectContent>
              </Select>
              <Tabs value={view} onValueChange={(v) => setView(v as 'list' | 'calendar')}>
                <TabsList>
                  <TabsTrigger value="list" className="text-xs">Liste</TabsTrigger>
                  <TabsTrigger value="calendar" className="text-xs">Calendrier</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Content */}
      {view === 'list' ? (
        <motion.div variants={itemVariants}>
          <Card className="border-slate-200/60 dark:border-slate-800/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">Rendez-vous du jour</CardTitle>
              <CardDescription className="text-xs">{filtered.length} rendez-vous trouvés</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                {filtered.map((apt, index) => (
                  <motion.div
                    key={apt.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                    onClick={() => setSelectedAppointment(apt)}
                  >
                    <div className="flex flex-col items-center justify-center size-14 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                      <Clock className="size-4 text-teal-600 dark:text-teal-400" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{apt.time}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{apt.patient}</p>
                        <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ${typeColors[apt.type]}`}>{apt.type}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{apt.doctor} • {apt.duration} min</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">{apt.reason}</p>
                    </div>
                    <StatusBadge status={apt.status} />
                  </motion.div>
                ))}
                {filtered.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <Calendar className="size-10 mb-2" />
                    <p className="text-sm">Aucun rendez-vous trouvé</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants}>
          <Card className="border-slate-200/60 dark:border-slate-800/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">Vue calendrier — 5 Mars 2026</CardTitle>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="size-8"><ChevronLeft className="size-4" /></Button>
                  <Button variant="outline" size="sm" className="text-xs">Aujourd&apos;hui</Button>
                  <Button variant="outline" size="icon" className="size-8"><ChevronRight className="size-4" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 gap-0.5">
                {timeSlots.map(slot => {
                  const apt = demoAppointments.find(a => a.time === slot)
                  return (
                    <div key={slot} className="flex items-center gap-3 min-h-[48px] py-1 border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <span className="text-xs font-mono text-slate-500 dark:text-slate-400 w-12 shrink-0">{slot}</span>
                      {apt ? (
                        <div
                          className={`flex-1 rounded-lg px-3 py-2 cursor-pointer transition-opacity hover:opacity-80 ${
                            apt.status === 'Annulé' ? 'bg-slate-100 dark:bg-slate-800 opacity-60' :
                            apt.type === 'Urgence' ? 'bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800' :
                            'bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800'
                          }`}
                          onClick={() => setSelectedAppointment(apt)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-900 dark:text-white">{apt.patient}</span>
                            <StatusBadge status={apt.status} />
                          </div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">{apt.doctor} — {apt.reason.slice(0, 40)}...</span>
                        </div>
                      ) : (
                        <div className="flex-1 rounded-lg border border-dashed border-slate-200 dark:border-slate-700 py-2 px-3 text-xs text-slate-300 dark:text-slate-600">Disponible</div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedAppointment && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Calendar className="size-5 text-teal-600" />
                  Détails du rendez-vous
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-xs text-slate-500">Patient</Label><p className="text-sm font-medium text-slate-900 dark:text-white">{selectedAppointment.patient}</p></div>
                  <div><Label className="text-xs text-slate-500">Médecin</Label><p className="text-sm font-medium text-slate-900 dark:text-white">{selectedAppointment.doctor}</p></div>
                  <div><Label className="text-xs text-slate-500">Date & Heure</Label><p className="text-sm font-medium text-slate-900 dark:text-white">{selectedAppointment.date} à {selectedAppointment.time}</p></div>
                  <div><Label className="text-xs text-slate-500">Durée</Label><p className="text-sm font-medium text-slate-900 dark:text-white">{selectedAppointment.duration} minutes</p></div>
                  <div><Label className="text-xs text-slate-500">Type</Label><p><span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${typeColors[selectedAppointment.type]}`}>{selectedAppointment.type}</span></p></div>
                  <div><Label className="text-xs text-slate-500">Statut</Label><div className="mt-0.5"><StatusBadge status={selectedAppointment.status} /></div></div>
                </div>
                <div><Label className="text-xs text-slate-500">Motif</Label><p className="text-sm text-slate-700 dark:text-slate-300 mt-0.5">{selectedAppointment.reason}</p></div>
              </div>
              <DialogFooter className="flex gap-2">
                {selectedAppointment.status === 'En attente' && (
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Confirmer</Button>
                )}
                {selectedAppointment.status === 'Confirmé' && (
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white">Démarrer consultation</Button>
                )}
                <Button variant="outline" onClick={() => setSelectedAppointment(null)}>Fermer</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* New Appointment Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="size-5 text-teal-600" />
              Nouveau rendez-vous
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Patient *</Label>
                <Select><SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Aminata Diallo</SelectItem>
                    <SelectItem value="2">Ibrahim Touré</SelectItem>
                    <SelectItem value="3">Fatoumata Camara</SelectItem>
                    <SelectItem value="4">Moussa Condé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Médecin *</Label>
                <Select><SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Dr. Mamadou Bah</SelectItem>
                    <SelectItem value="2">Dr. Aissatou Sylla</SelectItem>
                    <SelectItem value="3">Dr. Kadiatou Souaré</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input type="date" defaultValue="2026-03-05" />
              </div>
              <div className="space-y-2">
                <Label>Heure *</Label>
                <Select><SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select><SelectTrigger><SelectValue placeholder="Type..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Consultation">Consultation</SelectItem>
                    <SelectItem value="Suivi">Suivi</SelectItem>
                    <SelectItem value="Urgence">Urgence</SelectItem>
                    <SelectItem value="Contrôle">Contrôle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Durée (min)</Label>
                <Select defaultValue="30"><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="60">60 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Motif</Label>
              <Textarea placeholder="Décrire le motif du rendez-vous..." rows={3} />
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
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
      `}</style>
    </motion.div>
  )
}
