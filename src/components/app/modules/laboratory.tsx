'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Microscope, Plus, Search, Clock, CheckCircle2, AlertCircle, FlaskConical,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useDataStore, type LabRequest } from '@/lib/data-store'
import { useToast } from '@/hooks/use-toast'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } }

type LabStatus = LabRequest['status']
type LabPriority = LabRequest['priority']

const statusConfig: Record<LabStatus, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  'En attente': { icon: Clock, color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' },
  'En cours': { icon: FlaskConical, color: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800' },
  'Terminé': { icon: CheckCircle2, color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800' },
  'Validé': { icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' },
}

const priorityColors: Record<LabPriority, string> = {
  'Stat': 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
  'Urgent': 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  'Normal': 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
}

export function LaboratoryPage() {
  const { toast } = useToast()
  const { labRequests, addLabRequest, updateLabRequest, validateLabResult } = useDataStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<LabRequest | null>(null)

  // Form state for new lab request
  const [newPatient, setNewPatient] = useState('')
  const [newPatientId, setNewPatientId] = useState('')
  const [newDoctor, setNewDoctor] = useState('')
  const [newType, setNewType] = useState('')
  const [newPriority, setNewPriority] = useState<LabPriority>('Normal')
  const [newNotes, setNewNotes] = useState('')

  const filtered = labRequests.filter(r => {
    const matchSearch = r.patientName.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase()) || r.type.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleStartAnalysis = (id: string) => {
    updateLabRequest(id, { status: 'En cours' })
    setSelectedRequest(null)
    toast({ title: 'Analyse démarrée', description: 'L\'analyse est maintenant en cours.' })
  }

  const handleComplete = (id: string) => {
    updateLabRequest(id, { status: 'Terminé' })
    setSelectedRequest(null)
    toast({ title: 'Analyse terminée', description: 'Les résultats sont prêts pour validation.' })
  }

  const handleValidate = (id: string) => {
    validateLabResult(id)
    setSelectedRequest(null)
    toast({ title: 'Résultats validés', description: 'Les résultats ont été validés avec succès.' })
  }

  const handleAddRequest = () => {
    if (!newPatient || !newType) return
    addLabRequest({
      id: `LAB-${Date.now()}`,
      patientName: newPatient,
      patientId: newPatientId,
      doctor: newDoctor,
      date: new Date().toISOString().split('T')[0],
      type: newType,
      status: 'En attente',
      priority: newPriority,
      results: [],
    })
    setShowNewDialog(false)
    setNewPatient('')
    setNewPatientId('')
    setNewDoctor('')
    setNewType('')
    setNewPriority('Normal')
    setNewNotes('')
    toast({ title: 'Demande créée', description: 'La demande d\'analyse a été enregistrée.' })
  }

  return (
    <motion.div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto" variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/20">
            <Microscope className="size-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Laboratoire</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Gestion des analyses et résultats</p>
          </div>
        </div>
        <Button onClick={() => setShowNewDialog(true)} className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-lg shadow-teal-500/20">
          <Plus className="size-4 mr-2" /> Nouvelle demande
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total demandes', value: labRequests.length, color: 'from-teal-500 to-emerald-600' },
          { label: 'En attente', value: labRequests.filter(r => r.status === 'En attente').length, color: 'from-amber-500 to-orange-600' },
          { label: 'En cours', value: labRequests.filter(r => r.status === 'En cours').length, color: 'from-cyan-500 to-teal-600' },
          { label: 'Validés', value: labRequests.filter(r => r.status === 'Validé').length, color: 'from-emerald-500 to-green-600' },
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
                <Input placeholder="Rechercher patient, code, analyse..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Statut" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="En attente">En attente</SelectItem>
                  <SelectItem value="En cours">En cours</SelectItem>
                  <SelectItem value="Terminé">Terminé</SelectItem>
                  <SelectItem value="Validé">Validé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Lab Requests List */}
      <motion.div variants={itemVariants}>
        <Card className="border-slate-200/60 dark:border-slate-800/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">Demandes d&apos;analyses</CardTitle>
            <CardDescription className="text-xs">{filtered.length} demandes</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
              {filtered.map((req, index) => {
                const config = statusConfig[req.status]
                const StatusIcon = config.icon
                return (
                  <motion.div key={req.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedRequest(req)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center size-10 rounded-full bg-teal-100 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold text-xs">{req.id.slice(-4)}</div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{req.patientName}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{req.doctor} • {req.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ${priorityColors[req.priority]}`}>{req.priority}</span>
                        <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${config.color}`}><StatusIcon className="size-3" />{req.status}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-[10px] bg-slate-100 dark:bg-slate-800">{req.type}</Badge>
                    </div>
                    {req.results.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {req.results.slice(0, 4).map(r => (
                            <div key={r.name} className={`p-2 rounded-lg text-center ${r.abnormal ? 'bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800' : 'bg-slate-50 dark:bg-slate-800'}`}>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400">{r.name}</p>
                              <p className={`text-sm font-bold ${r.abnormal ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>{r.value}</p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500">{r.unit} (Réf: {r.normalRange})</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedRequest && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Microscope className="size-5 text-teal-600" /> {selectedRequest.id}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-xs text-slate-500">Patient</span><p className="font-medium text-slate-900 dark:text-white">{selectedRequest.patientName}</p></div>
                  <div><span className="text-xs text-slate-500">Médecin prescripteur</span><p className="font-medium text-slate-900 dark:text-white">{selectedRequest.doctor}</p></div>
                  <div><span className="text-xs text-slate-500">Date</span><p className="font-medium text-slate-900 dark:text-white">{selectedRequest.date}</p></div>
                  <div><span className="text-xs text-slate-500">Priorité</span><span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ml-1 ${priorityColors[selectedRequest.priority]}`}>{selectedRequest.priority}</span></div>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">Analyse demandée</p>
                  <Badge variant="secondary">{selectedRequest.type}</Badge>
                </div>
                {selectedRequest.results.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">Résultats</p>
                    <div className="border rounded-lg overflow-hidden">
                      <div className="grid grid-cols-5 gap-0 bg-slate-100 dark:bg-slate-800 p-2 text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase">
                        <span>Paramètre</span><span>Valeur</span><span>Unité</span><span>Référence</span><span>Statut</span>
                      </div>
                      {selectedRequest.results.map(r => (
                        <div key={r.name} className={`grid grid-cols-5 gap-0 p-2 border-t border-slate-200 dark:border-slate-700 ${r.abnormal ? 'bg-rose-50/50 dark:bg-rose-950/20' : ''}`}>
                          <span className="text-xs font-medium text-slate-900 dark:text-white">{r.name}</span>
                          <span className={`text-xs font-bold ${r.abnormal ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>{r.value}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">{r.unit}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">{r.normalRange}</span>
                          <span>{r.abnormal ? <AlertCircle className="size-4 text-rose-500" /> : <CheckCircle2 className="size-4 text-emerald-500" />}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter className="flex gap-2">
                {selectedRequest.status === 'En attente' && <Button className="bg-cyan-600 hover:bg-cyan-700 text-white" onClick={() => handleStartAnalysis(selectedRequest.id)}>Démarrer analyse</Button>}
                {selectedRequest.status === 'En cours' && <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleComplete(selectedRequest.id)}>Terminer</Button>}
                {selectedRequest.status === 'Terminé' && <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleValidate(selectedRequest.id)}>Valider résultats</Button>}
                <Button variant="outline" onClick={() => setSelectedRequest(null)}>Fermer</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* New Lab Request Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Plus className="size-5 text-teal-600" /> Nouvelle demande d&apos;analyse</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Patient *</Label><Input placeholder="Nom du patient" value={newPatient} onChange={e => setNewPatient(e.target.value)} /></div>
              <div className="space-y-2"><Label>Priorité</Label><Select value={newPriority} onValueChange={(v) => setNewPriority(v as LabPriority)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Normal">Normal</SelectItem><SelectItem value="Urgent">Urgent</SelectItem><SelectItem value="Stat">Stat</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>ID Patient</Label><Input placeholder="P-XXXX-XXX" value={newPatientId} onChange={e => setNewPatientId(e.target.value)} /></div>
              <div className="space-y-2"><Label>Médecin</Label><Input placeholder="Dr. ..." value={newDoctor} onChange={e => setNewDoctor(e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>Type d&apos;analyse *</Label><Input placeholder="Ex: Hémogramme, Bilan lipidique..." value={newType} onChange={e => setNewType(e.target.value)} /></div>
            <div className="space-y-2"><Label>Notes cliniques</Label><Textarea placeholder="Contexte clinique, symptômes..." rows={2} value={newNotes} onChange={e => setNewNotes(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Annuler</Button>
            <Button className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white" onClick={handleAddRequest}>Envoyer demande</Button>
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
