'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Receipt, Plus, Search, TrendingUp, Clock, AlertTriangle, CheckCircle2, XCircle, CreditCard, Banknote, Smartphone,
  QrCode, ShieldCheck, BarChart3, MessageSquare,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { useDataStore, type Invoice } from '@/lib/data-store'
import { useToast } from '@/hooks/use-toast'
import { MobileMoneyForm } from '@/components/payments/mobile-money-form'
import { QRPayment } from '@/components/payments/qr-payment'
import { FinancialDashboard } from '@/components/payments/financial-dashboard'
import { CreditSante } from '@/components/payments/credit-sante'
import { InsurancePanel } from '@/components/insurance/insurance-panel'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } }

type InvoiceStatus = Invoice['status']

const statusColors: Record<InvoiceStatus, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  'Payée': { icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' },
  'En attente': { icon: Clock, color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' },
  'Partielle': { icon: AlertTriangle, color: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800' },
  'Annulée': { icon: XCircle, color: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' },
}

const methodIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Espèces': Banknote,
  'Mobile Money': Smartphone,
  'Virement': CreditCard,
  'Cash': Banknote,
}

export function BillingPage() {
  const { toast } = useToast()
  const { invoices, addInvoice, payInvoice } = useDataStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showMobileMoneyDialog, setShowMobileMoneyDialog] = useState(false)
  const [showQRDialog, setShowQRDialog] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  // Payment form state
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Espèces')

  // New invoice form state
  const [newPatientName, setNewPatientName] = useState('')
  const [newPatientId, setNewPatientId] = useState('')
  const [newItemDesc, setNewItemDesc] = useState('')
  const [newItemQty, setNewItemQty] = useState('1')
  const [newItemPrice, setNewItemPrice] = useState('')

  const filtered = invoices.filter(i => {
    const matchSearch = i.patientName.toLowerCase().includes(search.toLowerCase()) || i.id.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || i.status === statusFilter
    return matchSearch && matchStatus
  })

  const todayStr = new Date().toISOString().split('T')[0]
  const todayRevenue = invoices.filter(i => (i.status === 'Payée' || i.status === 'Partielle') && i.date === todayStr).reduce((s, i) => s + i.paidAmount, 0)
  const monthRevenue = invoices.filter(i => i.status === 'Payée').reduce((s, i) => s + i.total, 0)
  const pendingAmount = invoices.filter(i => i.status === 'En attente' || i.status === 'Partielle').reduce((s, i) => s + i.total - i.paidAmount, 0)
  const overdueCount = invoices.filter(i => i.status === 'Partielle').length

  const handlePay = () => {
    if (!selectedInvoice || !paymentAmount || Number(paymentAmount) <= 0) return
    payInvoice(selectedInvoice.id, paymentMethod, Number(paymentAmount))
    setShowPaymentDialog(false)
    setPaymentAmount('')
    setPaymentMethod('Espèces')
    toast({ title: 'Paiement enregistré', description: `${Number(paymentAmount).toLocaleString()} GNF payé pour ${selectedInvoice.id}.` })
  }

  const handleAddInvoice = () => {
    if (!newPatientName || !newItemDesc || !newItemPrice) return
    const qty = Number(newItemQty) || 1
    const unitPrice = Number(newItemPrice)
    const total = qty * unitPrice
    addInvoice({
      id: `FAC-${Date.now()}`,
      patientName: newPatientName,
      patientId: newPatientId,
      date: todayStr,
      items: [{ description: newItemDesc, quantity: qty, unitPrice, total }],
      total,
      status: 'En attente',
      paymentMethod: null,
      paidAmount: 0,
    })
    setShowNewDialog(false)
    setNewPatientName('')
    setNewPatientId('')
    setNewItemDesc('')
    setNewItemQty('1')
    setNewItemPrice('')
    toast({ title: 'Facture créée', description: 'La nouvelle facture a été enregistrée.' })
  }

  const openPaymentDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setPaymentAmount(String(invoice.total - invoice.paidAmount))
    setShowPaymentDialog(true)
  }

  const openMobileMoneyDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setShowMobileMoneyDialog(true)
  }

  const openQRDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setShowQRDialog(true)
  }

  return (
    <motion.div className="p-4 lg:p-6 max-w-[1600px] mx-auto" variants={containerVariants} initial="hidden" animate="visible">
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

      <Tabs defaultValue="invoices" className="mt-6">
        <TabsList className="bg-slate-100 dark:bg-slate-900 p-1 flex-wrap h-auto gap-1">
          <TabsTrigger value="invoices" className="text-xs gap-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
            <Receipt className="size-3.5" /> Factures
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="text-xs gap-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
            <BarChart3 className="size-3.5" /> Dashboard financier
          </TabsTrigger>
          <TabsTrigger value="credit" className="text-xs gap-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
            <CreditCard className="size-3.5" /> Crédit Santé
          </TabsTrigger>
          <TabsTrigger value="insurance" className="text-xs gap-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
            <ShieldCheck className="size-3.5" /> Assurance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-6 mt-4">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Revenu aujourd'hui", value: `${(todayRevenue / 1000).toFixed(0)}K`, sub: 'GNF', color: 'from-teal-500 to-emerald-600' },
              { label: 'Ce mois', value: `${(monthRevenue / 1000).toFixed(0)}K`, sub: 'GNF', color: 'from-cyan-500 to-teal-600' },
              { label: 'En attente', value: `${(pendingAmount / 1000).toFixed(0)}K`, sub: 'GNF', color: 'from-amber-500 to-orange-600' },
              { label: 'Paiements partiels', value: overdueCount, sub: 'factures', color: 'from-rose-500 to-red-600' },
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
                      <SelectItem value="Partielle">Partielle</SelectItem>
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
                        const MethodIcon = inv.paymentMethod ? (methodIcons[inv.paymentMethod] ?? CreditCard) : null
                        return (
                          <motion.tr key={inv.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.03 }}
                            className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                            onClick={() => setSelectedInvoice(inv)}
                          >
                            <td className="py-3 px-2 font-mono text-xs font-medium text-teal-700 dark:text-teal-400">{inv.id}</td>
                            <td className="py-3 px-2 font-medium text-slate-900 dark:text-white">{inv.patientName}</td>
                            <td className="py-3 px-2 text-slate-500 dark:text-slate-400">{inv.date}</td>
                            <td className="py-3 px-2 text-right font-bold text-slate-900 dark:text-white">{inv.total.toLocaleString()} <span className="text-xs font-normal text-slate-400">GNF</span></td>
                            <td className="py-3 px-2 text-center">
                              <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${cfg.color}`}><StatusIcon className="size-3" />{inv.status}</span>
                            </td>
                            <td className="py-3 px-2 text-center">
                              {inv.paymentMethod && inv.paidAmount > 0 ? (
                                <span className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                                  {MethodIcon && <MethodIcon className="size-3" />}
                                  {inv.paidAmount.toLocaleString()} GNF
                                </span>
                              ) : <span className="text-xs text-slate-300 dark:text-slate-600">—</span>}
                            </td>
                            <td className="py-3 px-2 text-right">
                              {(inv.status === 'En attente' || inv.status === 'Partielle') && (
                                <div className="flex gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
                                  <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => openPaymentDialog(inv)}>Payer</Button>
                                  <Button size="sm" variant="outline" className="text-xs h-7 text-orange-600 border-orange-200 hover:bg-orange-50 dark:border-orange-800" onClick={() => openMobileMoneyDialog(inv)}>
                                    <Smartphone className="size-3 mr-1" /> Mobile Money
                                  </Button>
                                  <Button size="sm" variant="outline" className="text-xs h-7 text-teal-600 border-teal-200 hover:bg-teal-50 dark:border-teal-800" onClick={() => openQRDialog(inv)}>
                                    <QrCode className="size-3 mr-1" /> QR
                                  </Button>
                                </div>
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
        </TabsContent>

        <TabsContent value="dashboard" className="mt-4">
          <FinancialDashboard />
        </TabsContent>

        <TabsContent value="credit" className="mt-4">
          <div className="max-w-2xl mx-auto">
            <CreditSante />
          </div>
        </TabsContent>

        <TabsContent value="insurance" className="mt-4">
          <InsurancePanel />
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={!!selectedInvoice && !showPaymentDialog && !showMobileMoneyDialog && !showQRDialog} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedInvoice && (
            <>
              <DialogHeader><DialogTitle className="flex items-center gap-2"><Receipt className="size-5 text-teal-600" /> {selectedInvoice.id}</DialogTitle></DialogHeader>
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-xs text-slate-500">Patient</span><p className="font-medium">{selectedInvoice.patientName}</p></div>
                  <div><span className="text-xs text-slate-500">Date</span><p className="font-medium">{selectedInvoice.date}</p></div>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">Détail</p>
                  {selectedInvoice.items.map((item, i) => (
                    <div key={i} className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <span className="text-xs text-slate-600 dark:text-slate-400">{item.description} {item.quantity > 1 ? `×${item.quantity}` : ''}</span>
                      <span className="text-xs font-medium text-slate-900 dark:text-white">{item.total.toLocaleString()} GNF</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 mt-1 border-t-2 border-slate-200 dark:border-slate-700">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Total</span>
                    <span className="text-sm font-bold text-teal-600 dark:text-teal-400">{selectedInvoice.total.toLocaleString()} GNF</span>
                  </div>
                  {selectedInvoice.paidAmount > 0 && (
                    <div className="flex justify-between pt-1">
                      <span className="text-xs text-slate-500">Payé</span>
                      <span className="text-xs font-medium text-emerald-600">{selectedInvoice.paidAmount.toLocaleString()} GNF</span>
                    </div>
                  )}
                  {selectedInvoice.total - selectedInvoice.paidAmount > 0 && (
                    <div className="flex justify-between pt-1">
                      <span className="text-xs text-slate-500">Reste</span>
                      <span className="text-xs font-medium text-amber-600">{(selectedInvoice.total - selectedInvoice.paidAmount).toLocaleString()} GNF</span>
                    </div>
                  )}
                </div>
                {selectedInvoice.paymentMethod && selectedInvoice.paidAmount > 0 && (
                  <div>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">Paiement</p>
                    <div className="flex items-center justify-between py-1.5">
                      <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                        {React.createElement(methodIcons[selectedInvoice.paymentMethod] ?? CreditCard, { className: 'size-3.5' })}
                        {selectedInvoice.paymentMethod}
                      </span>
                      <span className="text-xs font-medium text-emerald-600">{selectedInvoice.paidAmount.toLocaleString()} GNF</span>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter className="flex gap-2 flex-wrap">
                {(selectedInvoice.status === 'En attente' || selectedInvoice.status === 'Partielle') && (
                  <>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => { openPaymentDialog(selectedInvoice) }}>Payer</Button>
                    <Button variant="outline" className="text-orange-600 border-orange-200" onClick={() => { openMobileMoneyDialog(selectedInvoice) }}>
                      <Smartphone className="size-3.5 mr-1" /> Mobile Money
                    </Button>
                    <Button variant="outline" className="text-teal-600 border-teal-200" onClick={() => { openQRDialog(selectedInvoice) }}>
                      <QrCode className="size-3.5 mr-1" /> QR Code
                    </Button>
                  </>
                )}
                <Button variant="outline" onClick={() => setSelectedInvoice(null)}>Fermer</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* New Invoice Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader><DialogTitle>Nouvelle facture</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Patient *</Label><Input placeholder="Nom du patient" value={newPatientName} onChange={e => setNewPatientName(e.target.value)} /></div>
              <div className="space-y-2"><Label>ID Patient</Label><Input placeholder="P-XXXX-XXX" value={newPatientId} onChange={e => setNewPatientId(e.target.value)} /></div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Ligne</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1 col-span-1"><Label className="text-xs">Description *</Label><Input placeholder="Acte..." value={newItemDesc} onChange={e => setNewItemDesc(e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">Qté</Label><Input type="number" placeholder="1" value={newItemQty} onChange={e => setNewItemQty(e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">Prix unit. (GNF) *</Label><Input type="number" placeholder="0" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} /></div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Annuler</Button>
            <Button className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white" onClick={handleAddInvoice}>Créer facture</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>Enregistrer paiement</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Montant (GNF) *</Label><Input type="number" placeholder="0" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} /></div>
            <div className="space-y-2"><Label>Mode de paiement *</Label><Select value={paymentMethod} onValueChange={setPaymentMethod}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Espèces">Espèces</SelectItem><SelectItem value="Mobile Money">Mobile Money</SelectItem><SelectItem value="Virement">Virement bancaire</SelectItem><SelectItem value="Assurance">Assurance</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>Annuler</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handlePay}>Confirmer paiement</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mobile Money Dialog */}
      <Dialog open={showMobileMoneyDialog} onOpenChange={setShowMobileMoneyDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>Paiement Mobile Money</DialogTitle></DialogHeader>
          {selectedInvoice && (
            <MobileMoneyForm
              invoiceId={selectedInvoice.id}
              invoiceAmount={selectedInvoice.total - selectedInvoice.paidAmount}
              patientName={selectedInvoice.patientName}
              patientId={selectedInvoice.patientId}
              onSuccess={() => {
                setShowMobileMoneyDialog(false)
                setSelectedInvoice(null)
              }}
              onCancel={() => {
                setShowMobileMoneyDialog(false)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* QR Payment Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader><DialogTitle>Paiement par QR Code</DialogTitle></DialogHeader>
          {selectedInvoice && (
            <QRPayment
              invoiceId={selectedInvoice.id}
              amount={selectedInvoice.total - selectedInvoice.paidAmount}
              patientName={selectedInvoice.patientName}
            />
          )}
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
