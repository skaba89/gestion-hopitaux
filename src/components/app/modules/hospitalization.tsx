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
import { useDataStore, type BedUnit } from '@/lib/data-store'
import { useToast } from '@/hooks/use-toast'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } }

type BedStatus = BedUnit['status']

const bedStatusConfig: Record<BedStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  Libre: { label: 'Disponible', color: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800', icon: ShieldCheck },
  Occupé: { label: 'Occupé', color: 'bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800', icon: User },
  Réservé: { label: 'Réservé', color: 'bg-sky-100 text-sky-700 border-sky-300 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800', icon: ShieldCheck },
  'En nettoyage': { label: 'Nettoyage', color: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800', icon: Wrench },
}

export function HospitalizationPage() {
  const { beds, updateBed, admitPatient, dischargeBed } = useDataStore()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [selectedBed, setSelectedBed] = useState<BedUnit | null>(null)

  // New admission form state
  const [admitPatientName, setAdmitPatientName] = useState('')
  const [admitPatientId, setAdmitPatientId] = useState('')
  const [admitBedId, setAdmitBedId] = useState('')

  const occupied = beds.filter(b => b.status === 'Occupé').length
  const available = beds.filter(b => b.status === 'Libre').length
  const reserved = beds.filter(b => b.status === 'Réservé').length
  const cleaning = beds.filter(b => b.status === 'En nettoyage').length
  const occupancyRate = beds.length > 0 ? Math.round((occupied / beds.length) * 100) : 0

  const occupiedBeds = beds.filter(b => b.status === 'Occupé')
  const filteredAdmissions = occupiedBeds.filter(b =>
    b.patient?.toLowerCase().includes(search.toLowerCase()) ||
    b.service.toLowerCase().includes(search.toLowerCase())
  )

  const handleAdmit = () => {
    if (!admitPatientName || !admitBedId) {
      toast({ title: 'Erreur', description: 'Nom patient et lit sont obligatoires', variant: 'destructive' })
      return
    }
    admitPatient(admitBedId, admitPatientName, admitPatientId || '')
    toast({ title: 'Patient admis', description: `${admitPatientName} admis(e) dans le lit ${beds.find(b => b.id === admitBedId)?.number || admitBedId}` })
    setAdmitPatientName('')
    setAdmitPatientId('')
    setAdmitBedId('')
    setShowNewDialog(false)
  }

  const handleDischarge = (bedId: string) => {
    const bed = beds.find(b => b.id === bedId)
    dischargeBed(bedId)
    toast({ title: 'Lit libéré', description: `Lit ${bed?.number || bedId} libéré — patient sorti` })
    setSelectedBed(null)
  }

  const handleReserve = (bedId: string) => {
    const bed = beds.find(b => b.id === bedId)
    updateBed(bedId, { status: 'Réservé' })
    toast({ title: 'Lit réservé', description: `Lit ${bed?.number || bedId} réservé` })
    setSelectedBed(null)
  }

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
          <Plus className="size-4 mr-2" /> Admettre patient
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Taux d'occupation", value: `${occupancyRate}%`, color: 'from-teal-500 to-emerald-600' },
          { label: 'Lits occupés', value: occupied, color: 'from-rose-500 to-red-600' },
          { label: 'Lits disponibles', value: available, color: 'from-emerald-500 to-green-600' },
          { label: 'Réservés / Nettoyage', value: reserved + cleaning, color: 'from-amber-500 to-orange-600' },
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
              <CardDescription className="text-xs">Vue par service</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-3">
                {beds.map((bed, index) => {
                  const config = bedStatusConfig[bed.status]
                  const BedIcon = config.icon
                  return (
                    <motion.div key={bed.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }}
                      className={`p-3 rounded-xl border-2 ${config.color} cursor-pointer hover:opacity-80 transition-opacity`}
                      onClick={() => setSelectedBed(bed)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold">{bed.number}</span>
                        <BedIcon className="size-3.5" />
                      </div>
                      <p className="text-[10px] opacity-70">{bed.service}</p>
                      {bed.patient && <p className="text-xs font-medium mt-1 truncate">{bed.patient}</p>}
                    </motion.div>
                  )
                })}
              </div>
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 text-xs flex-wrap">
                <span className="flex items-center gap-1.5"><span className="size-3 rounded bg-emerald-500" /> Libre</span>
                <span className="flex items-center gap-1.5"><span className="size-3 rounded bg-rose-500" /> Occupé</span>
                <span className="flex items-center gap-1.5"><span className="size-3 rounded bg-sky-500" /> Réservé</span>
                <span className="flex items-center gap-1.5"><span className="size-3 rounded bg-amber-500" /> Nettoyage</span>
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
                  <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">Patients hospitalisés</CardTitle>
                  <CardDescription className="text-xs">{occupiedBeds.length} patients</CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                  <Input placeholder="Rechercher..." className="pl-8 h-8 text-xs w-[160px]" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                {filteredAdmissions.map((bed, index) => (
                  <motion.div key={bed.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
                    className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedBed(bed)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{bed.patient}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{bed.service}</p>
                      </div>
                      <Badge className="bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 text-[10px]">Lit {bed.number}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <Clock className="size-3" /> Depuis le {bed.admissionDate}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedBed} onOpenChange={() => setSelectedBed(null)}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedBed && (
            <>
              <DialogHeader><DialogTitle className="flex items-center gap-2"><Bed className="size-5 text-teal-600" /> Lit {selectedBed.number}</DialogTitle></DialogHeader>
              <div className="space-y-4 py-2">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${bedStatusConfig[selectedBed.status].color}`}>
                    {bedStatusConfig[selectedBed.status].label}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-xs text-slate-500">Service</span><p className="font-medium text-slate-900 dark:text-white">{selectedBed.service}</p></div>
                  <div><span className="text-xs text-slate-500">Statut</span><p className="font-medium text-slate-900 dark:text-white">{bedStatusConfig[selectedBed.status].label}</p></div>
                </div>
                {selectedBed.patient && (
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-xs text-slate-500">Patient</span><p className="font-medium text-slate-900 dark:text-white">{selectedBed.patient}</p></div>
                    <div><span className="text-xs text-slate-500">Date admission</span><p className="font-medium text-slate-900 dark:text-white">{selectedBed.admissionDate || '—'}</p></div>
                  </div>
                )}
              </div>
              <DialogFooter className="flex gap-2">
                {selectedBed.status === 'Occupé' && (
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleDischarge(selectedBed.id)}>Libérer lit</Button>
                )}
                {selectedBed.status === 'Libre' && (
                  <Button variant="outline" onClick={() => handleReserve(selectedBed.id)}>Réserver</Button>
                )}
                <Button variant="outline" onClick={() => setSelectedBed(null)}>Fermer</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* New Admission Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>Admettre patient</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nom patient *</Label>
              <Input placeholder="Nom complet..." value={admitPatientName} onChange={e => setAdmitPatientName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>ID Patient</Label>
              <Input placeholder="ID patient..." value={admitPatientId} onChange={e => setAdmitPatientId(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Lit disponible *</Label>
              <Select value={admitBedId} onValueChange={setAdmitBedId}>
                <SelectTrigger><SelectValue placeholder="Sélectionner un lit..." /></SelectTrigger>
                <SelectContent>
                  {beds.filter(b => b.status === 'Libre').map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.number} — {b.service}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Annuler</Button>
            <Button className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white" onClick={handleAdmit}>Admettre</Button>
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
