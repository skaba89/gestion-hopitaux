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
import { useDataStore, type Appointment } from '@/lib/data-store'
import { useToast } from '@/hooks/use-toast'
import { useTranslation } from '@/i18n/provider'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
}

type AppointmentStatus = Appointment['status']

const statusConfig: Record<AppointmentStatus, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  'Planifié': { icon: AlertCircle, color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' },
  'Confirmé': { icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' },
  'En cours': { icon: Clock, color: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800' },
  'Terminé': { icon: CircleDot, color: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800' },
  'Annulé': { icon: XCircle, color: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-950/40 dark:text-slate-400 dark:border-slate-700' },
  'Non honoré': { icon: XCircle, color: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800' },
}

const statusKeyMap: Record<AppointmentStatus, string> = {
  'Planifié': 'status.planned',
  'Confirmé': 'status.confirmed',
  'En cours': 'status.inProgress',
  'Terminé': 'status.completed',
  'Annulé': 'status.cancelled',
  'Non honoré': 'status.noShow',
}

const typeColors: Record<string, string> = {
  'Consultation': 'bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300',
  'Suivi': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300',
  'Urgence': 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
  'Contrôle': 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300',
  'Prénatal': 'bg-pink-100 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300',
}

const timeSlots = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '14:00', '14:30', '15:00', '15:30', '16:00']

function StatusBadge({ status }: { status: AppointmentStatus }) {
  const { t } = useTranslation('appointments')
  const config = statusConfig[status]
  const Icon = config.icon
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${config.color}`}>
      <Icon className="size-3" />
      {t(statusKeyMap[status], status)}
    </span>
  )
}

export function AppointmentsPage() {
  const { appointments, addAppointment, confirmAppointment, cancelAppointment, updateAppointment, patients } = useDataStore()
  const { toast } = useToast()
  const { t } = useTranslation('appointments')
  const { t: tc } = useTranslation('common')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

  // New appointment form state
  const [newPatientId, setNewPatientId] = useState('')
  const [newDoctor, setNewDoctor] = useState('')
  const [newDate, setNewDate] = useState('2026-05-10')
  const [newTime, setNewTime] = useState('')
  const [newType, setNewType] = useState('')
  const [newDuration, setNewDuration] = useState('30')
  const [newReason, setNewReason] = useState('')

  const filtered = appointments.filter(a => {
    const matchSearch = a.patientName.toLowerCase().includes(search.toLowerCase()) || a.doctor.toLowerCase().includes(search.toLowerCase()) || a.reason.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || a.status === statusFilter
    return matchSearch && matchStatus
  })

  const statusCounts = {
    total: appointments.length,
    confirmed: appointments.filter(a => a.status === 'Confirmé').length,
    planned: appointments.filter(a => a.status === 'Planifié').length,
    completed: appointments.filter(a => a.status === 'Terminé').length,
  }

  const handleConfirm = (id: string) => {
    confirmAppointment(id)
    toast({ title: t('toast.confirmedTitle', 'Rendez-vous confirmé'), description: t('toast.confirmedDesc', 'Le rendez-vous a été confirmé avec succès.') })
    setSelectedAppointment(null)
  }

  const handleCancel = (id: string) => {
    cancelAppointment(id)
    toast({ title: t('toast.cancelledTitle', 'Rendez-vous annulé'), description: t('toast.cancelledDesc', 'Le rendez-vous a été annulé.') })
    setSelectedAppointment(null)
  }

  const handleStartConsultation = (id: string) => {
    updateAppointment(id, { status: 'En cours' })
    toast({ title: t('toast.startedTitle', 'Consultation démarrée'), description: t('toast.startedDesc', 'La consultation est maintenant en cours.') })
    setSelectedAppointment(null)
  }

  const handleComplete = (id: string) => {
    updateAppointment(id, { status: 'Terminé' })
    toast({ title: t('toast.completedTitle', 'Consultation terminée'), description: t('toast.completedDesc', 'La consultation a été marquée comme terminée.') })
    setSelectedAppointment(null)
  }

  const handleMarkNoShow = (id: string) => {
    updateAppointment(id, { status: 'Non honoré' })
    toast({ title: t('toast.noShowTitle', 'Non honoré'), description: t('toast.noShowDesc', 'Le rendez-vous a été marqué comme non honoré.') })
    setSelectedAppointment(null)
  }

  const resetNewForm = () => {
    setNewPatientId('')
    setNewDoctor('')
    setNewDate('2026-05-10')
    setNewTime('')
    setNewType('')
    setNewDuration('30')
    setNewReason('')
  }

  const handleAddAppointment = () => {
    const patient = patients.find(p => p.id === newPatientId)
    if (!patient || !newDoctor || !newDate || !newTime) {
      toast({ title: t('toast.requiredTitle', 'Champs requis'), description: t('toast.requiredDesc', 'Veuillez remplir tous les champs obligatoires.'), variant: 'destructive' })
      return
    }

    const newAppointment: Appointment = {
      id: `RDV-${Date.now()}`,
      patientName: `${patient.firstName} ${patient.lastName}`,
      patientId: patient.id,
      doctor: newDoctor,
      date: newDate,
      time: newTime,
      duration: parseInt(newDuration),
      type: newType || 'Consultation',
      status: 'Planifié',
      reason: newReason,
      notes: '',
    }

    addAppointment(newAppointment)
    toast({ title: t('toast.createdTitle', 'Rendez-vous créé'), description: t('toast.createdDesc', `Rendez-vous pour ${newAppointment.patientName} le ${newDate} à ${newTime}.`) })
    resetNewForm()
    setShowNewDialog(false)
  }

  const doctors = [
    { id: 'dr-diallo', name: 'Dr. Diallo' },
    { id: 'dr-toure', name: 'Dr. Touré' },
    { id: 'dr-bah', name: 'Dr. Bah' },
    { id: 'dr-keita', name: 'Dr. Keita' },
  ]

  return (
    <motion.div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto" variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/20">
            <Calendar className="size-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{t('title', 'Rendez-vous')}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('subtitle', 'Planification et suivi des rendez-vous')}</p>
          </div>
        </div>
        <Button onClick={() => setShowNewDialog(true)} className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-lg shadow-teal-500/20">
          <Plus className="size-4 mr-2" /> {t('newAppointment', 'Nouveau Rendez-vous')}
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: tc('today', "Aujourd'hui"), value: statusCounts.total, color: 'from-teal-500 to-emerald-600' },
          { label: t('stats.confirmed', 'Confirmés'), value: statusCounts.confirmed, color: 'from-emerald-500 to-green-600' },
          { label: t('stats.planned', 'Planifiés'), value: statusCounts.planned, color: 'from-amber-500 to-orange-600' },
          { label: t('stats.completed', 'Terminés'), value: statusCounts.completed, color: 'from-cyan-500 to-teal-600' },
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
                <Input placeholder={t('searchPlaceholder', 'Rechercher patient, médecin, motif...')} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder={tc('status', 'Statut')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allStatuses', 'Tous les statuts')}</SelectItem>
                  <SelectItem value="Planifié">{t('status.planned', 'Planifié')}</SelectItem>
                  <SelectItem value="Confirmé">{t('status.confirmed', 'Confirmé')}</SelectItem>
                  <SelectItem value="En cours">{t('status.inProgress', 'En cours')}</SelectItem>
                  <SelectItem value="Terminé">{t('status.completed', 'Terminé')}</SelectItem>
                  <SelectItem value="Annulé">{t('status.cancelled', 'Annulé')}</SelectItem>
                  <SelectItem value="Non honoré">{t('status.noShow', 'Non honoré')}</SelectItem>
                </SelectContent>
              </Select>
              <Tabs value={view} onValueChange={(v) => setView(v as 'list' | 'calendar')}>
                <TabsList>
                  <TabsTrigger value="list" className="text-xs">{t('listView', 'Liste')}</TabsTrigger>
                  <TabsTrigger value="calendar" className="text-xs">{t('calendarView', 'Calendrier')}</TabsTrigger>
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
              <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">{t('todayAppointments', 'Rendez-vous du jour')}</CardTitle>
              <CardDescription className="text-xs">{filtered.length} {t('appointmentsFound', 'rendez-vous trouvés')}</CardDescription>
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
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{apt.patientName}</p>
                        <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ${typeColors[apt.type] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>{apt.type}</span>
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
                    <p className="text-sm">{t('noAppointmentsFound', 'Aucun rendez-vous trouvé')}</p>
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
                <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">{t('calendarViewDate', 'Vue calendrier — 10 Mai 2026')}</CardTitle>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="size-8"><ChevronLeft className="size-4" /></Button>
                  <Button variant="outline" size="sm" className="text-xs">{tc('today', "Aujourd'hui")}</Button>
                  <Button variant="outline" size="icon" className="size-8"><ChevronRight className="size-4" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 gap-0.5">
                {timeSlots.map(slot => {
                  const apt = appointments.find(a => a.time === slot && a.date === '2026-05-10')
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
                            <span className="text-xs font-medium text-slate-900 dark:text-white">{apt.patientName}</span>
                            <StatusBadge status={apt.status} />
                          </div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">{apt.doctor} — {apt.reason.length > 40 ? apt.reason.slice(0, 40) + '...' : apt.reason}</span>
                        </div>
                      ) : (
                        <div className="flex-1 rounded-lg border border-dashed border-slate-200 dark:border-slate-700 py-2 px-3 text-xs text-slate-300 dark:text-slate-600">{t('available', 'Disponible')}</div>
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
                  {t('appointmentDetails', 'Détails du rendez-vous')}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-xs text-slate-500">{t('patient', 'Patient')}</Label><p className="text-sm font-medium text-slate-900 dark:text-white">{selectedAppointment.patientName}</p></div>
                  <div><Label className="text-xs text-slate-500">{t('doctor', 'Médecin')}</Label><p className="text-sm font-medium text-slate-900 dark:text-white">{selectedAppointment.doctor}</p></div>
                  <div><Label className="text-xs text-slate-500">{t('dateAndTime', 'Date & Heure')}</Label><p className="text-sm font-medium text-slate-900 dark:text-white">{selectedAppointment.date} {t('at', 'à')} {selectedAppointment.time}</p></div>
                  <div><Label className="text-xs text-slate-500">{t('duration', 'Durée')}</Label><p className="text-sm font-medium text-slate-900 dark:text-white">{selectedAppointment.duration} {t('minutes', 'minutes')}</p></div>
                  <div><Label className="text-xs text-slate-500">{t('type', 'Type')}</Label><p><span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${typeColors[selectedAppointment.type] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>{selectedAppointment.type}</span></p></div>
                  <div><Label className="text-xs text-slate-500">{tc('status', 'Statut')}</Label><div className="mt-0.5"><StatusBadge status={selectedAppointment.status} /></div></div>
                </div>
                <div><Label className="text-xs text-slate-500">{t('reason', 'Motif')}</Label><p className="text-sm text-slate-700 dark:text-slate-300 mt-0.5">{selectedAppointment.reason}</p></div>
                {selectedAppointment.notes && (
                  <div><Label className="text-xs text-slate-500">{t('notes', 'Notes')}</Label><p className="text-sm text-slate-700 dark:text-slate-300 mt-0.5">{selectedAppointment.notes}</p></div>
                )}
              </div>
              <DialogFooter className="flex gap-2">
                {(selectedAppointment.status === 'Planifié') && (
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleConfirm(selectedAppointment.id)}>{t('confirmAppointment', 'Confirmer')}</Button>
                )}
                {(selectedAppointment.status === 'Confirmé') && (
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={() => handleStartConsultation(selectedAppointment.id)}>{t('startConsultation', 'Démarrer consultation')}</Button>
                )}
                {(selectedAppointment.status === 'En cours') && (
                  <Button className="bg-cyan-600 hover:bg-cyan-700 text-white" onClick={() => handleComplete(selectedAppointment.id)}>{t('complete', 'Terminer')}</Button>
                )}
                {(selectedAppointment.status === 'Planifié' || selectedAppointment.status === 'Confirmé') && (
                  <Button variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50 dark:text-rose-400 dark:border-rose-800 dark:hover:bg-rose-950/30" onClick={() => handleCancel(selectedAppointment.id)}>{tc('cancel', 'Annuler')}</Button>
                )}
                {(selectedAppointment.status === 'Planifié' || selectedAppointment.status === 'Confirmé') && (
                  <Button variant="outline" className="text-amber-600 border-amber-200 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-800 dark:hover:bg-amber-950/30" onClick={() => handleMarkNoShow(selectedAppointment.id)}>{t('status.noShow', 'Non honoré')}</Button>
                )}
                <Button variant="outline" onClick={() => setSelectedAppointment(null)}>{tc('close', 'Fermer')}</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* New Appointment Dialog */}
      <Dialog open={showNewDialog} onOpenChange={(open) => { setShowNewDialog(open); if (!open) resetNewForm() }}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="size-5 text-teal-600" />
              {t('newAppointment', 'Nouveau Rendez-vous')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('patient', 'Patient')} *</Label>
                <Select value={newPatientId} onValueChange={setNewPatientId}>
                  <SelectTrigger><SelectValue placeholder={t('selectPlaceholder', 'Sélectionner...')} /></SelectTrigger>
                  <SelectContent>
                    {patients.filter(p => p.status === 'Actif').map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.firstName} {p.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('doctor', 'Médecin')} *</Label>
                <Select value={newDoctor} onValueChange={setNewDoctor}>
                  <SelectTrigger><SelectValue placeholder={t('selectPlaceholder', 'Sélectionner...')} /></SelectTrigger>
                  <SelectContent>
                    {doctors.map(d => (
                      <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{tc('date', 'Date')} *</Label>
                <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{tc('time', 'Heure')} *</Label>
                <Select value={newTime} onValueChange={setNewTime}>
                  <SelectTrigger><SelectValue placeholder={t('choosePlaceholder', 'Choisir...')} /></SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(slot => <SelectItem key={slot} value={slot}>{slot}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('type', 'Type')}</Label>
                <Select value={newType} onValueChange={setNewType}>
                  <SelectTrigger><SelectValue placeholder={t('typePlaceholder', 'Type...')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Consultation">{t('types.consultation', 'Consultation')}</SelectItem>
                    <SelectItem value="Suivi">{t('types.followUp', 'Suivi')}</SelectItem>
                    <SelectItem value="Urgence">{t('types.emergency', 'Urgence')}</SelectItem>
                    <SelectItem value="Contrôle">{t('types.checkup', 'Contrôle')}</SelectItem>
                    <SelectItem value="Prénatal">{t('types.prenatal', 'Prénatal')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('duration', 'Durée')} (min)</Label>
                <Select value={newDuration} onValueChange={setNewDuration}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
              <Label>{t('reason', 'Motif')}</Label>
              <Textarea placeholder={t('reasonPlaceholder', 'Décrire le motif du rendez-vous...')} rows={3} value={newReason} onChange={(e) => setNewReason(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowNewDialog(false); resetNewForm() }}>{tc('cancel', 'Annuler')}</Button>
            <Button className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white" onClick={handleAddAppointment}>{tc('save', 'Enregistrer')}</Button>
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
