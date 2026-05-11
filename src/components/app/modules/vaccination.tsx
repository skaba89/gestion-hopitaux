'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Syringe, Plus, Search, ShieldCheck, Clock, AlertCircle, CheckCircle2, Baby, Calendar,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useDataStore, type VaccineRecord } from '@/lib/data-store'
import { useToast } from '@/hooks/use-toast'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } }

const scheduleTemplate = [
  { name: 'BCG', ageMonths: 0 },
  { name: 'VPO0', ageMonths: 0 },
  { name: 'VPO1+DTC1', ageMonths: 2 },
  { name: 'VPO2+DTC2', ageMonths: 4 },
  { name: 'VPO3+DTC3', ageMonths: 6 },
  { name: 'Rougeole', ageMonths: 9 },
  { name: 'Rappel DTC', ageMonths: 18 },
  { name: 'Rougeole 2', ageMonths: 24 },
]

function getAgeMonths(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth)
  const now = new Date()
  return (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth())
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 shadow-xl">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="text-sm font-bold text-teal-600">{payload[0].value}%</p>
    </div>
  )
}

export function VaccinationPage() {
  const [search, setSearch] = useState('')
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<VaccineRecord | null>(null)

  const { vaccineRecords, addVaccineRecord, administerVaccine } = useDataStore()
  const { toast } = useToast()

  // New child form state
  const [newChildName, setNewChildName] = useState('')
  const [newChildId, setNewChildId] = useState('')
  const [newDob, setNewDob] = useState('')

  const filtered = vaccineRecords.filter(r =>
    r.childName.toLowerCase().includes(search.toLowerCase()) || r.childId.toLowerCase().includes(search.toLowerCase())
  )

  const dueVaccinations = useMemo(() =>
    vaccineRecords.flatMap(r => {
      const ageMonths = getAgeMonths(r.dateOfBirth)
      return r.vaccines
        .filter(v => v.status !== 'Fait' && new Date(v.scheduledDate) <= new Date())
        .map(v => ({ child: r.childName, vaccine: v.name, scheduledDate: v.scheduledDate }))
    }),
    [vaccineRecords]
  )

  const coverageData = useMemo(() => {
    const vaccineNames = new Set<string>()
    vaccineRecords.forEach(r => r.vaccines.forEach(v => vaccineNames.add(v.name)))
    return Array.from(vaccineNames).map(name => {
      const total = vaccineRecords.filter(r => r.vaccines.some(v => v.name === name)).length
      const done = vaccineRecords.filter(r => r.vaccines.some(v => v.name === name && v.status === 'Fait')).length
      return { vaccine: name, rate: total > 0 ? Math.round((done / total) * 100) : 0 }
    })
  }, [vaccineRecords])

  const handleNewChild = () => {
    if (!newChildName || !newChildId || !newDob) return
    addVaccineRecord({
      id: `VAC-${Date.now()}`,
      childName: newChildName,
      childId: newChildId,
      dateOfBirth: newDob,
      vaccines: scheduleTemplate.map(s => ({
        name: s.name,
        scheduledDate: new Date(new Date(newDob).getTime() + s.ageMonths * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        administeredDate: null,
        status: 'Planifié' as const,
      })),
    })
    toast({ title: 'Enfant enregistré', description: `${newChildName} a été ajouté au calendrier vaccinal.` })
    setShowNewDialog(false)
    setNewChildName('')
    setNewChildId('')
    setNewDob('')
  }

  const handleAdminister = (recordId: string, vaccineName: string) => {
    administerVaccine(recordId, vaccineName)
    toast({ title: 'Vaccin administré', description: `${vaccineName} a été marqué comme administré.` })
    if (selectedRecord) {
      setSelectedRecord(useDataStore.getState().vaccineRecords.find(r => r.id === recordId) || null)
    }
  }

  return (
    <motion.div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto" variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/20"><Syringe className="size-5 text-white" /></div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Vaccination</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Calendrier vaccinal et couverture</p>
          </div>
        </div>
        <Button onClick={() => setShowNewDialog(true)} className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-lg shadow-teal-500/20">
          <Plus className="size-4 mr-2" /> Nouvel enfant
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Enfants suivis', value: vaccineRecords.length, color: 'from-teal-500 to-emerald-600' },
          { label: 'Vaccins dus', value: dueVaccinations.length, color: 'from-amber-500 to-orange-600' },
          { label: 'Couverture BCG', value: coverageData.find(c => c.vaccine === 'BCG') ? `${coverageData.find(c => c.vaccine === 'BCG')!.rate}%` : '—', color: 'from-emerald-500 to-green-600' },
          { label: 'Couverture DTC', value: coverageData.find(c => c.vaccine.includes('DTC')) ? `${coverageData.find(c => c.vaccine.includes('DTC'))!.rate}%` : '—', color: 'from-cyan-500 to-teal-600' },
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
        {/* Vaccination Schedule per Child */}
        <motion.div variants={itemVariants}>
          <Card className="border-slate-200/60 dark:border-slate-800/60 h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">Calendrier par enfant</CardTitle>
                  <CardDescription className="text-xs">{filtered.length} enfants</CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                  <Input placeholder="Rechercher..." className="pl-8 h-8 text-xs w-[140px]" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                {filtered.map((record, index) => {
                  const done = record.vaccines.filter(v => v.status === 'Fait').length
                  const total = record.vaccines.length
                  const pct = total > 0 ? Math.round((done / total) * 100) : 0
                  const ageMonths = getAgeMonths(record.dateOfBirth)
                  return (
                    <motion.div key={record.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
                      className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedRecord(record)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{record.childName}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{ageMonths} mois • ID: {record.childId}</p>
                        </div>
                        <span className="text-xs font-bold text-teal-600 dark:text-teal-400">{pct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mb-2">
                        <motion.div className="h-full rounded-full bg-teal-500" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }} />
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {record.vaccines.map(v => (
                          <span key={v.name} className={`inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[9px] font-medium ${v.status === 'Fait' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : v.status === 'En retard' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                            {v.status === 'Fait' ? <CheckCircle2 className="size-2.5" /> : <Clock className="size-2.5" />}
                            {v.name}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Coverage Chart */}
        <motion.div variants={itemVariants}>
          <Card className="border-slate-200/60 dark:border-slate-800/60 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">Couverture vaccinale</CardTitle>
              <CardDescription className="text-xs">Taux de couverture par vaccin — Hôpital Donka</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={coverageData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="vaccGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" />
                        <stop offset="95%" stopColor="#0d9488" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                    <XAxis dataKey="vaccine" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="rate" fill="url(#vaccGrad)" radius={[6, 6, 0, 0]} maxBarSize={48} name="Couverture" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Due Vaccinations */}
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <AlertCircle className="size-3.5 text-amber-500" /> Vaccinations dues ({dueVaccinations.length})
                </p>
                <div className="space-y-1.5 max-h-[150px] overflow-y-auto custom-scrollbar">
                  {dueVaccinations.map((v, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-xs">
                      <span className="font-medium text-slate-900 dark:text-white">{v.child}</span>
                      <span className="text-amber-700 dark:text-amber-300">{v.vaccine}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
        <DialogContent className="sm:max-w-[480px]">
          {selectedRecord && (() => {
            const ageMonths = getAgeMonths(selectedRecord.dateOfBirth)
            return (
              <>
                <DialogHeader><DialogTitle className="flex items-center gap-2"><Baby className="size-5 text-teal-600" /> {selectedRecord.childName}</DialogTitle></DialogHeader>
                <div className="space-y-4 py-2">
                  <p className="text-xs text-slate-500">{ageMonths} mois • ID: {selectedRecord.childId} • Né(e) le {selectedRecord.dateOfBirth}</p>
                  <div>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">Calendrier vaccinal</p>
                    <div className="space-y-1.5">
                      {selectedRecord.vaccines.map(v => (
                        <div key={v.name} className={`flex items-center justify-between p-2 rounded-lg ${v.status === 'Fait' ? 'bg-emerald-50 dark:bg-emerald-950/30' : v.status === 'En retard' ? 'bg-amber-50 dark:bg-amber-950/20' : 'bg-slate-50 dark:bg-slate-800'}`}>
                          <div className="flex items-center gap-2">
                            {v.status === 'Fait' ? <CheckCircle2 className="size-4 text-emerald-500" /> : v.status === 'En retard' ? <AlertCircle className="size-4 text-amber-500" /> : <Clock className="size-4 text-slate-400" />}
                            <span className={`text-sm ${v.status === 'Fait' ? 'font-medium text-emerald-700 dark:text-emerald-300' : v.status === 'En retard' ? 'text-amber-700 dark:text-amber-300' : 'text-slate-600 dark:text-slate-400'}`}>{v.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">{v.scheduledDate}</span>
                            {v.status !== 'Fait' && (
                              <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-6"
                                onClick={(e) => { e.stopPropagation(); handleAdminister(selectedRecord.id, v.name) }}
                              >
                                Administrer
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter><Button variant="outline" onClick={() => setSelectedRecord(null)}>Fermer</Button></DialogFooter>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>

      {/* New Child Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Syringe className="size-5 text-teal-600" /> Nouvel enfant</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Nom de l&apos;enfant *</Label><Input placeholder="Nom complet" value={newChildName} onChange={e => setNewChildName(e.target.value)} /></div>
            <div className="space-y-2"><Label>Identifiant *</Label><Input placeholder="C-XXX" value={newChildId} onChange={e => setNewChildId(e.target.value)} /></div>
            <div className="space-y-2"><Label>Date de naissance *</Label><Input type="date" value={newDob} onChange={e => setNewDob(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Annuler</Button>
            <Button className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white" onClick={handleNewChild}>Enregistrer</Button>
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
