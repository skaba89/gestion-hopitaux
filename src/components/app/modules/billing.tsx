'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Receipt, Plus, Search, TrendingUp, Clock, AlertTriangle, CheckCircle2, XCircle, CreditCard, Banknote, Smartphone,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } }

type InvoiceStatus = 'Payée' | 'En attente' | 'En retard' | 'Annulée'
type PaymentMethod = 'Cash' | 'Mobile Money' | 'Virement'

interface Invoice {
  id: number; number: string; patient: string; date: string; amount: number; status: InvoiceStatus
  items: { description: string; amount: number }[]; payments: { method: PaymentMethod; amount: number; date: string }[]
}

const demoInvoices: Invoice[] = [
  { id: 1, number: 'FAC-2026-0401', patient: 'Aminata Diallo', date: '05/03/2026', amount: 75000, status: 'Payée', items: [{ description: 'Consultation', amount: 15000 }, { description: 'NFS + CRP', amount: 35000 }, { description: 'Médicaments', amount: 25000 }], payments: [{ method: 'Mobile Money', amount: 75000, date: '05/03/2026' }] },
  { id: 2, number: 'FAC-2026-0402', patient: 'Ibrahim Touré', date: '05/03/2026', amount: 150000, status: 'En attente', items: [{ description: 'Consultation spécialiste', amount: 25000 }, { description: 'ECG + Échographie', amount: 75000 }, { description: 'Bilan lipidique', amount: 50000 }], payments: [] },
  { id: 3, number: 'FAC-2026-0403', patient: 'Fatoumata Camara', date: '04/03/2026', amount: 350000, status: 'En attente', items: [{ description: 'Accouchement (césarienne)', amount: 250000 }, { description: 'Hospitalisation 3 jours', amount: 75000 }, { description: 'Médicaments + consommables', amount: 25000 }], payments: [{ method: 'Cash', amount: 100000, date: '04/03/2026' }] },
  { id: 4, number: 'FAC-2026-0404', patient: 'Moussa Condé', date: '03/03/2026', amount: 45000, status: 'Payée', items: [{ description: 'Consultation urgence', amount: 20000 }, { description: 'Traitement paludisme', amount: 25000 }], payments: [{ method: 'Cash', amount: 45000, date: '03/03/2026' }] },
  { id: 5, number: 'FAC-2026-0405', patient: 'Mariama Bah', date: '01/03/2026', amount: 60000, status: 'En retard', items: [{ description: 'Consultation prénatale', amount: 15000 }, { description: 'Échographie obstétricale', amount: 45000 }], payments: [] },
  { id: 6, number: 'FAC-2026-0406', patient: 'Abdoulaye Keita', date: '28/02/2026', amount: 120000, status: 'Payée', items: [{ description: 'Consultation + radiographie', amount: 40000 }, { description: 'Plâtre + immobilisation', amount: 35000 }, { description: 'Médicaments', amount: 45000 }], payments: [{ method: 'Virement', amount: 120000, date: '01/03/2026' }] },
  { id: 7, number: 'FAC-2026-0407', patient: 'Kadiatou Sylla', date: '25/02/2026', amount: 30000, status: 'Annulée', items: [{ description: 'Consultation', amount: 15000 }, { description: 'TSH + T4', amount: 15000 }], payments: [] },
  { id: 8, number: 'FAC-2026-0408', patient: 'Lamine Kaba', date: '05/03/2026', amount: 20000, status: 'En attente', items: [{ description: 'Vaccination DTC', amount: 10000 }, { description: 'Vaccination VPO', amount: 10000 }], payments: [] },
]

const statusColors: Record<InvoiceStatus, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  'Payée': { icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' },
  'En attente': { icon: Clock, color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' },
  'En retard': { icon: AlertTriangle, color: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800' },
  'Annulée': { icon: XCircle, color: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' },
}

const methodIcons: Record<PaymentMethod, React.ComponentType<{ className?: string }>> = {
  'Cash': Banknote,
  'Mobile Money': Smartphone,
  'Virement': CreditCard,
}

export function BillingPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  const filtered = demoInvoices.filter(i => {
    const matchSearch = i.patient.toLowerCase().includes(search.toLowerCase()) || i.number.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || i.status === statusFilter
    return matchSearch && matchStatus
  })

  const todayRevenue = demoInvoices.filter(i => i.status === 'Payée' && i.date === '05/03/2026').reduce((s, i) => s + i.amount, 0)
  const monthRevenue = demoInvoices.filter(i => i.status === 'Payée').reduce((s, i) => s + i.amount, 0)
  const pendingAmount = demoInvoices.filter(i => i.status === 'En attente' || i.status === 'En retard').reduce((s, i) => s + i.amount - i.payments.reduce((ps, p) => ps + p.amount, 0), 0)
  const overdueCount = demoInvoices.filter(i => i.status === 'En retard').length

  return (
    <motion.div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto" variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/20"><Receipt className="size-5 text-white" /></div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Facturation</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Gestion des factures et paiements</p>
          </div>
        </div>
        <Button onClick={() => setShowNewDialog(true)} className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-lg shadow-teal-500/20">
          <Plus className="size-4 mr-2" /> Nouvelle facture
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Revenu aujourd'hui", value: `${(todayRevenue / 1000).toFixed(0)}K`, sub: 'GNF', color: 'from-teal-500 to-emerald-600' },
          { label: 'Ce mois', value: `${(monthRevenue / 1000).toFixed(0)}K`, sub: 'GNF', color: 'from-cyan-500 to-teal-600' },
          { label: 'En attente', value: `${(pendingAmount / 1000).toFixed(0)}K`, sub: 'GNF', color: 'from-amber-500 to-orange-600' },
          { label: 'En retard', value: overdueCount, sub: 'factures', color: 'from-rose-500 to-red-600' },
        ].map(stat => (
          <motion.div key={stat.label} variants={itemVariants}>
            <Card className="relative overflow-hidden border-slate-200/60 dark:border-slate-800/60">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />
              <CardContent className="pt-5 pb-4">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value} <span className="text-xs font-normal text-slate-400">{stat.sub}</span></p>
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
                <Input placeholder="Rechercher facture, patient..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Statut" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="Payée">Payée</SelectItem>
                  <SelectItem value="En attente">En attente</SelectItem>
                  <SelectItem value="En retard">En retard</SelectItem>
                  <SelectItem value="Annulée">Annulée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Invoices */}
      <motion.div variants={itemVariants}>
        <Card className="border-slate-200/60 dark:border-slate-800/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">Factures</CardTitle>
            <CardDescription className="text-xs">{filtered.length} factures</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-2 text-xs font-medium text-slate-500 uppercase">N° Facture</th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-slate-500 uppercase">Patient</th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-slate-500 uppercase">Date</th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-slate-500 uppercase">Montant</th>
                    <th className="text-center py-3 px-2 text-xs font-medium text-slate-500 uppercase">Statut</th>
                    <th className="text-center py-3 px-2 text-xs font-medium text-slate-500 uppercase">Paiement</th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inv, index) => {
                    const cfg = statusColors[inv.status]
                    const StatusIcon = cfg.icon
                    const paid = inv.payments.reduce((s, p) => s + p.amount, 0)
                    const lastPayment = inv.payments[inv.payments.length - 1]
                    return (
                      <motion.tr key={inv.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.03 }}
                        className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedInvoice(inv)}
                      >
                        <td className="py-3 px-2 font-mono text-xs font-medium text-teal-700 dark:text-teal-400">{inv.number}</td>
                        <td className="py-3 px-2 font-medium text-slate-900 dark:text-white">{inv.patient}</td>
                        <td className="py-3 px-2 text-slate-500 dark:text-slate-400">{inv.date}</td>
                        <td className="py-3 px-2 text-right font-bold text-slate-900 dark:text-white">{inv.amount.toLocaleString()} <span className="text-xs font-normal text-slate-400">GNF</span></td>
                        <td className="py-3 px-2 text-center">
                          <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${cfg.color}`}><StatusIcon className="size-3" />{inv.status}</span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          {lastPayment ? (
                            <span className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                              {React.createElement(methodIcons[lastPayment.method], { className: 'size-3' })}
                              {paid.toLocaleString()} GNF
                            </span>
                          ) : <span className="text-xs text-slate-300 dark:text-slate-600">—</span>}
                        </td>
                        <td className="py-3 px-2 text-right">
                          {(inv.status === 'En attente' || inv.status === 'En retard') && (
                            <Button size="sm" variant="outline" className="text-xs h-7" onClick={(e) => { e.stopPropagation(); setShowPaymentDialog(true) }}>Payer</Button>
                          )}
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedInvoice && (
            <>
              <DialogHeader><DialogTitle className="flex items-center gap-2"><Receipt className="size-5 text-teal-600" /> {selectedInvoice.number}</DialogTitle></DialogHeader>
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-xs text-slate-500">Patient</span><p className="font-medium">{selectedInvoice.patient}</p></div>
                  <div><span className="text-xs text-slate-500">Date</span><p className="font-medium">{selectedInvoice.date}</p></div>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">Détail</p>
                  {selectedInvoice.items.map((item, i) => (
                    <div key={i} className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <span className="text-xs text-slate-600 dark:text-slate-400">{item.description}</span>
                      <span className="text-xs font-medium text-slate-900 dark:text-white">{item.amount.toLocaleString()} GNF</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 mt-1 border-t-2 border-slate-200 dark:border-slate-700">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Total</span>
                    <span className="text-sm font-bold text-teal-600 dark:text-teal-400">{selectedInvoice.amount.toLocaleString()} GNF</span>
                  </div>
                </div>
                {selectedInvoice.payments.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">Paiements</p>
                    {selectedInvoice.payments.map((p, i) => {
                      const Icon = methodIcons[p.method]
                      return (
                        <div key={i} className="flex items-center justify-between py-1.5">
                          <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400"><Icon className="size-3.5" />{p.method} — {p.date}</span>
                          <span className="text-xs font-medium text-emerald-600">{p.amount.toLocaleString()} GNF</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setSelectedInvoice(null)}>Fermer</Button></DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* New Invoice Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader><DialogTitle>Nouvelle facture</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Patient *</Label><Select><SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger><SelectContent><SelectItem value="1">Aminata Diallo</SelectItem><SelectItem value="2">Ibrahim Touré</SelectItem></SelectContent></Select></div>
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Lignes</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-xs">Description</Label><Input placeholder="Acte..." /></div>
                <div className="space-y-1"><Label className="text-xs">Montant (GNF)</Label><Input type="number" placeholder="0" /></div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Annuler</Button>
            <Button className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white" onClick={() => setShowNewDialog(false)}>Créer facture</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>Enregistrer paiement</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Montant (GNF) *</Label><Input type="number" placeholder="0" /></div>
            <div className="space-y-2"><Label>Mode de paiement *</Label><Select defaultValue="Cash"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Cash">Espèces</SelectItem><SelectItem value="Mobile Money">Mobile Money</SelectItem><SelectItem value="Virement">Virement bancaire</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>Annuler</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setShowPaymentDialog(false)}>Confirmer paiement</Button>
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
