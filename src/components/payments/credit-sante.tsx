'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Calculator, Calendar, CheckCircle2, AlertTriangle, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDataStore, type PaymentPlan } from '@/lib/data-store'
import { useToast } from '@/hooks/use-toast'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const itemVariants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } }

export function CreditSante() {
  const { toast } = useToast()
  const { paymentPlans, addPaymentPlan, invoices, payInstallment } = useDataStore()
  
  const [showCreate, setShowCreate] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState('')
  const [downPayment, setDownPayment] = useState('')
  const [installmentCount, setInstallmentCount] = useState('3')

  // Unpaid invoices
  const unpaidInvoices = invoices.filter(i => i.status === 'En attente' || i.status === 'Partielle')

  const selectedInv = unpaidInvoices.find(i => i.id === selectedInvoice)
  const remainingAmount = selectedInv ? selectedInv.total - selectedInv.paidAmount : 0
  const downPay = Number(downPayment) || 0
  const installments = Number(installmentCount) || 3
  const installAmount = remainingAmount > 0 && remainingAmount > downPay ? Math.ceil((remainingAmount - downPay) / installments) : 0

  const handleCreate = () => {
    if (!selectedInv || !downPayment || downPay <= 0 || installAmount <= 0) {
      toast({ title: 'Données manquantes', description: 'Sélectionnez une facture et remplissez les champs.', variant: 'destructive' })
      return
    }

    const now = new Date()
    const planInstallments: { id: string; dueDate: string; amount: number; paidDate: string | null; status: 'En attente' | 'Payé' | 'En retard' }[] = []
    for (let i = 0; i < installments; i++) {
      const dueDate = new Date(now)
      dueDate.setMonth(dueDate.getMonth() + i + 1)
      planInstallments.push({
        id: `PP-${Date.now()}-${i + 1}`,
        dueDate: dueDate.toISOString().split('T')[0],
        amount: i === 0 ? downPay : installAmount,
        paidDate: null,
        status: 'En attente' as const,
      })
    }

    const plan: PaymentPlan = {
      id: `PP-${Date.now()}`,
      invoiceId: selectedInv.id,
      patientId: selectedInv.patientId,
      patientName: selectedInv.patientName,
      totalAmount: remainingAmount,
      downPayment: downPay,
      installmentCount: installments,
      installmentAmount: installAmount,
      startDate: now.toISOString().split('T')[0],
      status: 'Actif',
      installments: planInstallments,
    }

    addPaymentPlan(plan)
    setShowCreate(false)
    setSelectedInvoice('')
    setDownPayment('')
    toast({ title: 'Crédit Santé créé', description: `Plan de ${installments} mensualités pour ${selectedInv.patientName}.` })
  }

  const handlePayInstallment = (planId: string, installmentId: string) => {
    payInstallment(planId, installmentId)
    toast({ title: 'Mensualité payée', description: 'Le paiement a été enregistré.' })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Payé': return <CheckCircle2 className="size-4 text-emerald-500" />
      case 'En retard': return <AlertTriangle className="size-4 text-red-500" />
      default: return <Clock className="size-4 text-amber-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Payé': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
      case 'En retard': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800'
      default: return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
    }
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center size-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-md">
            <CreditCard className="size-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Crédit Santé</h3>
            <p className="text-xs text-slate-500">Plans de paiement échelonné</p>
          </div>
        </div>
        <Button size="sm" onClick={() => setShowCreate(!showCreate)} className="bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs">
          <CreditCard className="size-3.5 mr-1" /> Nouveau plan
        </Button>
      </motion.div>

      {/* Create Form */}
      {showCreate && (
        <motion.div variants={itemVariants}>
          <Card className="border-violet-200 dark:border-violet-800/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Créer un plan de paiement</CardTitle>
              <CardDescription className="text-xs">Pour les factures élevées, proposez un échelonnement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Facture</Label>
                <Select value={selectedInvoice} onValueChange={setSelectedInvoice}>
                  <SelectTrigger className="text-xs"><SelectValue placeholder="Sélectionner une facture impayée" /></SelectTrigger>
                  <SelectContent>
                    {unpaidInvoices.map(inv => (
                      <SelectItem key={inv.id} value={inv.id}>
                        {inv.id} — {inv.patientName} — {inv.total.toLocaleString()} GNF
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedInv && (
                <>
                  <div className="p-3 bg-violet-50 dark:bg-violet-950/30 rounded-lg text-xs space-y-1">
                    <p className="text-violet-700 dark:text-violet-300 font-medium">Résumé de la facture</p>
                    <p>Total: <strong>{selectedInv.total.toLocaleString()} GNF</strong></p>
                    <p>Payé: <strong>{selectedInv.paidAmount.toLocaleString()} GNF</strong></p>
                    <p>Reste: <strong className="text-violet-600">{remainingAmount.toLocaleString()} GNF</strong></p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Acompte (GNF)</Label>
                      <Input type="number" placeholder="0" value={downPayment} onChange={e => setDownPayment(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Nombre de mensualités</Label>
                      <Select value={installmentCount} onValueChange={setInstallmentCount}>
                        <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 mois</SelectItem>
                          <SelectItem value="6">6 mois</SelectItem>
                          <SelectItem value="12">12 mois</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {installAmount > 0 && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg text-xs space-y-1">
                      <p className="text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-1"><Calculator className="size-3.5" /> Calcul</p>
                      <p>Acompte: <strong>{downPay.toLocaleString()} GNF</strong></p>
                      <p>Mensualité: <strong>{installAmount.toLocaleString()} GNF / mois</strong></p>
                      <p>Total: <strong>{(downPay + installAmount * (installments - 1)).toLocaleString()} GNF</strong></p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowCreate(false)} className="flex-1 text-xs">Annuler</Button>
                    <Button onClick={handleCreate} className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs">Créer le plan</Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Active Plans */}
      {paymentPlans.map(plan => {
        const paidCount = plan.installments.filter(i => i.status === 'Payé').length
        const progress = (paidCount / plan.installments.length) * 100

        return (
          <motion.div key={plan.id} variants={itemVariants}>
            <Card className="border-slate-200/60 dark:border-slate-800/60">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm">{plan.patientName}</CardTitle>
                    <CardDescription className="text-xs">
                      Facture {plan.invoiceId} • {plan.totalAmount.toLocaleString()} GNF
                    </CardDescription>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${getStatusColor(plan.status)}`}>
                    {plan.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-500">Progression</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{paidCount}/{plan.installments.length} échéances</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full"
                    />
                  </div>
                </div>

                {/* Installments */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {plan.installments.map(inst => (
                    <div key={inst.id} className="flex items-center gap-2 p-2 rounded-lg border border-slate-100 dark:border-slate-800 text-xs">
                      {getStatusIcon(inst.status)}
                      <div className="flex-1">
                        <span className="text-slate-600 dark:text-slate-400">
                          Échéance du {new Date(inst.dueDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <span className="font-medium text-slate-900 dark:text-white">{inst.amount.toLocaleString()} GNF</span>
                      {inst.status === 'En attente' && (
                        <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => handlePayInstallment(plan.id, inst.id)}>
                          Payer
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}

      {paymentPlans.length === 0 && !showCreate && (
        <div className="text-center py-8 text-sm text-slate-400">
          Aucun plan de crédit santé. Créez-en un pour une facture impayée.
        </div>
      )}
    </motion.div>
  )
}
