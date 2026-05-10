'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Plus, Search, FileText, CheckCircle2, XCircle, Clock, AlertTriangle, Building2, Send } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useDataStore, type InsuranceProvider, type InsuranceClaim } from '@/lib/data-store'
import { checkCoverage, submitClaim, formatClaimStatus } from '@/lib/insurance'
import { useToast } from '@/hooks/use-toast'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } }

export function InsurancePanel() {
  const { toast } = useToast()
  const { insuranceProviders, insuranceClaims, addInsuranceClaim, invoices, patients } = useDataStore()

  const [showAddProvider, setShowAddProvider] = useState(false)
  const [showCheckCoverage, setShowCheckCoverage] = useState(false)
  const [showSubmitClaim, setShowSubmitClaim] = useState(false)
  const [showPreAuth, setShowPreAuth] = useState(false)

  // Check coverage state
  const [coveragePatientId, setCoveragePatientId] = useState('')
  const [coverageProviderId, setCoverageProviderId] = useState('')
  const [coverageAmount, setCoverageAmount] = useState('')
  const [coverageResult, setCoverageResult] = useState<ReturnType<typeof checkCoverage> | null>(null)

  // Claim submission state
  const [claimInvoiceId, setClaimInvoiceId] = useState('')
  const [claimProviderId, setClaimProviderId] = useState('')
  const [claimNotes, setClaimNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Pre-auth state
  const [preAuthPatientId, setPreAuthPatientId] = useState('')
  const [preAuthProviderId, setPreAuthProviderId] = useState('')
  const [preAuthProcedure, setPreAuthProcedure] = useState('')
  const [preAuthCost, setPreAuthCost] = useState('')
  const [isPreAuthing, setIsPreAuthing] = useState(false)

  const activeProviders = insuranceProviders.filter(p => p.isActive)

  // Check coverage
  const handleCheckCoverage = () => {
    const provider = insuranceProviders.find(p => p.id === coverageProviderId)
    if (!provider || !coverageAmount) return

    const result = checkCoverage(coveragePatientId, provider, Number(coverageAmount))
    setCoverageResult(result)
  }

  // Submit claim
  const handleSubmitClaim = async () => {
    if (!claimInvoiceId || !claimProviderId) return
    const invoice = invoices.find(i => i.id === claimInvoiceId)
    const provider = insuranceProviders.find(p => p.id === claimProviderId)
    if (!invoice || !provider) return

    setIsSubmitting(true)
    const coverage = checkCoverage(invoice.patientId, provider, invoice.total)

    const result = await submitClaim({
      providerId: provider.id,
      providerName: provider.name,
      patientId: invoice.patientId,
      patientName: invoice.patientName,
      invoiceId: invoice.id,
      amount: invoice.total,
      coveredAmount: coverage.coveredAmount,
      patientAmount: coverage.patientAmount,
      policyNumber: coverage.policyNumber || 'N/A',
      notes: claimNotes,
    })

    if (result.success) {
      addInsuranceClaim({
        id: result.claimId,
        providerId: provider.id,
        providerName: provider.name,
        patientId: invoice.patientId,
        patientName: invoice.patientName,
        invoiceId: invoice.id,
        amount: invoice.total,
        coveredAmount: coverage.coveredAmount,
        patientAmount: coverage.patientAmount,
        policyNumber: coverage.policyNumber || 'N/A',
        status: result.status,
        submittedAt: new Date().toISOString(),
        processedAt: null,
        notes: claimNotes,
      })
      toast({ title: 'Réclamation soumise', description: `${result.claimId} — ${provider.name}` })
    }

    setIsSubmitting(false)
    setShowSubmitClaim(false)
    setClaimInvoiceId('')
    setClaimProviderId('')
    setClaimNotes('')
  }

  // Submit pre-authorization
  const handlePreAuth = async () => {
    if (!preAuthPatientId || !preAuthProviderId || !preAuthProcedure) return
    const provider = insuranceProviders.find(p => p.id === preAuthProviderId)
    const patient = patients.find(p => p.id === preAuthPatientId)
    if (!provider || !patient) return

    setIsPreAuthing(true)
    const result = await submitClaim({
      providerId: provider.id,
      providerName: provider.name,
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      invoiceId: 'PREAUTH',
      amount: Number(preAuthCost) || 0,
      coveredAmount: 0,
      patientAmount: 0,
      policyNumber: 'N/A',
      notes: `Pré-autorisation: ${preAuthProcedure}`,
    })

    toast({
      title: result.success ? 'Pré-autorisation demandée' : 'Échec',
      description: result.message,
    })
    setIsPreAuthing(false)
    setShowPreAuth(false)
  }

  const unpaidInvoices = invoices.filter(i => i.status === 'En attente' || i.status === 'Partielle')

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20">
            <ShieldCheck className="size-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Assurance Santé</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Gestion des assurances et réclamations</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowCheckCoverage(true)}>
            <Search className="size-3.5 mr-1" /> Vérifier couverture
          </Button>
          <Button size="sm" className="text-xs bg-gradient-to-r from-violet-500 to-purple-600 text-white" onClick={() => setShowSubmitClaim(true)}>
            <FileText className="size-3.5 mr-1" /> Soumettre réclamation
          </Button>
        </div>
      </motion.div>

      {/* Providers */}
      <motion.div variants={itemVariants}>
        <Card className="border-slate-200/60 dark:border-slate-800/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Assureurs partenaires</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {insuranceProviders.map(provider => (
                <div key={provider.id} className="p-4 rounded-lg border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center size-10 rounded-lg" style={{ backgroundColor: `${provider.logoColor}15` }}>
                      <Building2 className="size-5" style={{ color: provider.logoColor }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{provider.name}</p>
                      <p className="text-xs text-slate-500">{provider.code}</p>
                    </div>
                    {!provider.isActive && (
                      <span className="ml-auto text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">Inactif</span>
                    )}
                  </div>
                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                    <p>Couverture: <strong className="text-slate-900 dark:text-white">{provider.coveragePercentage}%</strong></p>
                    <p>Tél: {provider.contactPhone}</p>
                    <p>{provider.address}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Claims */}
      <motion.div variants={itemVariants}>
        <Card className="border-slate-200/60 dark:border-slate-800/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Réclamations</CardTitle>
              <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowPreAuth(true)}>
                <Send className="size-3.5 mr-1" /> Pré-autorisation
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {insuranceClaims.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">Aucune réclamation</div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                {insuranceClaims.map(claim => {
                  const statusInfo = formatClaimStatus(claim.status)
                  return (
                    <div key={claim.id} className="p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-mono text-slate-500">{claim.id}</span>
                        <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                        <span className="text-xs text-slate-400 ml-auto">
                          {new Date(claim.submittedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-500">Patient:</span>
                          <span className="ml-1 font-medium text-slate-900 dark:text-white">{claim.patientName}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Assureur:</span>
                          <span className="ml-1 font-medium text-slate-900 dark:text-white">{claim.providerName}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Montant:</span>
                          <span className="ml-1 font-bold text-slate-900 dark:text-white">{claim.amount.toLocaleString()} GNF</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Couvert:</span>
                          <span className="ml-1 font-medium text-emerald-600">{claim.coveredAmount.toLocaleString()} GNF ({claim.providerName === 'SONAR Assurance' ? '80' : claim.providerName === 'CGM Guinée' ? '70' : '75'}%)</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Patient paie:</span>
                          <span className="ml-1 font-medium text-amber-600">{claim.patientAmount.toLocaleString()} GNF</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Police:</span>
                          <span className="ml-1 font-mono text-slate-700 dark:text-slate-300">{claim.policyNumber}</span>
                        </div>
                      </div>
                      {claim.notes && <p className="text-[10px] text-slate-400 mt-2 italic">{claim.notes}</p>}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Check Coverage Dialog */}
      <Dialog open={showCheckCoverage} onOpenChange={setShowCheckCoverage}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader><DialogTitle>Vérifier la couverture</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs">Patient</Label>
              <Select value={coveragePatientId} onValueChange={setCoveragePatientId}>
                <SelectTrigger className="text-xs"><SelectValue placeholder="Sélectionner un patient" /></SelectTrigger>
                <SelectContent>
                  {patients.filter(p => p.status === 'Actif').map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.firstName} {p.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Assureur</Label>
              <Select value={coverageProviderId} onValueChange={setCoverageProviderId}>
                <SelectTrigger className="text-xs"><SelectValue placeholder="Sélectionner un assureur" /></SelectTrigger>
                <SelectContent>
                  {activeProviders.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name} ({p.coveragePercentage}%)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Montant à vérifier (GNF)</Label>
              <Input type="number" placeholder="0" value={coverageAmount} onChange={e => setCoverageAmount(e.target.value)} />
            </div>

            {coverageResult && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                {coverageResult.isCovered ? (
                  <>
                    <div className="flex items-center gap-2 text-emerald-600 font-medium"><CheckCircle2 className="size-4" /> Couvert</div>
                    <p>Police: <strong>{coverageResult.policyNumber}</strong></p>
                    <p>Couverture: <strong>{coverageResult.coveragePercentage}%</strong></p>
                    <p>Montant couvert: <strong className="text-emerald-600">{coverageResult.coveredAmount.toLocaleString()} GNF</strong></p>
                    <p>Reste à charge: <strong className="text-amber-600">{coverageResult.patientAmount.toLocaleString()} GNF</strong></p>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-red-600 font-medium"><XCircle className="size-4" /> Non couvert</div>
                )}
                <p className="text-slate-500">{coverageResult.message}</p>
              </motion.div>
            )}

            <Button onClick={handleCheckCoverage} disabled={!coverageProviderId || !coverageAmount} className="w-full bg-violet-600 text-white text-sm">
              <Search className="size-4 mr-2" /> Vérifier
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Submit Claim Dialog */}
      <Dialog open={showSubmitClaim} onOpenChange={setShowSubmitClaim}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader><DialogTitle>Soumettre une réclamation</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs">Facture</Label>
              <Select value={claimInvoiceId} onValueChange={setClaimInvoiceId}>
                <SelectTrigger className="text-xs"><SelectValue placeholder="Sélectionner une facture" /></SelectTrigger>
                <SelectContent>
                  {unpaidInvoices.map(inv => (
                    <SelectItem key={inv.id} value={inv.id}>{inv.id} — {inv.patientName} — {inv.total.toLocaleString()} GNF</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Assureur</Label>
              <Select value={claimProviderId} onValueChange={setClaimProviderId}>
                <SelectTrigger className="text-xs"><SelectValue placeholder="Sélectionner un assureur" /></SelectTrigger>
                <SelectContent>
                  {activeProviders.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name} ({p.coveragePercentage}%)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Notes</Label>
              <Textarea placeholder="Détails de la réclamation..." value={claimNotes} onChange={e => setClaimNotes(e.target.value)} rows={3} className="text-xs" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitClaim(false)} className="text-xs">Annuler</Button>
            <Button onClick={handleSubmitClaim} disabled={isSubmitting || !claimInvoiceId || !claimProviderId} className="bg-violet-600 text-white text-xs">
              {isSubmitting ? 'Envoi en cours...' : 'Soumettre'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pre-authorization Dialog */}
      <Dialog open={showPreAuth} onOpenChange={setShowPreAuth}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader><DialogTitle>Demande de pré-autorisation</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs">Patient</Label>
              <Select value={preAuthPatientId} onValueChange={setPreAuthPatientId}>
                <SelectTrigger className="text-xs"><SelectValue placeholder="Sélectionner un patient" /></SelectTrigger>
                <SelectContent>
                  {patients.filter(p => p.status === 'Actif').map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.firstName} {p.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Assureur</Label>
              <Select value={preAuthProviderId} onValueChange={setPreAuthProviderId}>
                <SelectTrigger className="text-xs"><SelectValue placeholder="Sélectionner un assureur" /></SelectTrigger>
                <SelectContent>
                  {activeProviders.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Acte / Procédure</Label>
              <Input placeholder="Description de l'acte" value={preAuthProcedure} onChange={e => setPreAuthProcedure(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Coût estimé (GNF)</Label>
              <Input type="number" placeholder="0" value={preAuthCost} onChange={e => setPreAuthCost(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreAuth(false)} className="text-xs">Annuler</Button>
            <Button onClick={handlePreAuth} disabled={isPreAuthing} className="bg-violet-600 text-white text-xs">
              {isPreAuthing ? 'Envoi...' : 'Demander'}
            </Button>
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
