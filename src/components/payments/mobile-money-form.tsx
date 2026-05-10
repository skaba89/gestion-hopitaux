'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Smartphone, CheckCircle2, XCircle, Loader2, CreditCard, Receipt, ExternalLink, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDataStore, type MobileMoneyProvider, type PaymentReason } from '@/lib/data-store'
import { detectProvider, isValidGuineaPhone, formatPhoneGuinea, generateReference, generateTransactionId } from '@/lib/mobile-money'
import { useToast } from '@/hooks/use-toast'

interface MobileMoneyFormProps {
  invoiceId?: string
  invoiceAmount?: number
  patientName?: string
  patientId?: string
  onSuccess?: (transactionId: string) => void
  onCancel?: () => void
}

export function MobileMoneyForm({ invoiceId, invoiceAmount, patientName, patientId, onSuccess, onCancel }: MobileMoneyFormProps) {
  const { toast } = useToast()
  const { addMobileMoneyTransaction, payInvoice, patients } = useDataStore()
  
  const [phoneNumber, setPhoneNumber] = useState('')
  const [amount, setAmount] = useState(invoiceAmount ? String(invoiceAmount) : '')
  const [currency, setCurrency] = useState<'GNF' | 'USD'>('GNF')
  const [reason, setReason] = useState<PaymentReason>('Facture')
  const [provider, setProvider] = useState<MobileMoneyProvider | 'auto'>('auto')
  const [isProcessing, setIsProcessing] = useState(false)
  const [step, setStep] = useState<'form' | 'processing' | 'success' | 'failure'>('form')
  const [transactionRef, setTransactionRef] = useState('')
  const [detectedProvider, setDetectedProvider] = useState<MobileMoneyProvider | null>(null)

  // Auto-detect provider when phone number changes
  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneGuinea(value)
    setPhoneNumber(formatted)
    const detected = detectProvider(formatted)
    setDetectedProvider(detected)
    if (provider === 'auto' && detected) {
      // Don't override manual selection, just show detection
    }
  }

  const activeProvider = provider === 'auto' ? detectedProvider : (provider as MobileMoneyProvider)

  const handleSubmit = async () => {
    // Validate
    if (!phoneNumber || !amount || Number(amount) <= 0) {
      toast({ title: 'Champs obligatoires', description: 'Veuillez remplir le numéro et le montant.', variant: 'destructive' })
      return
    }

    if (!isValidGuineaPhone(phoneNumber)) {
      toast({ title: 'Numéro invalide', description: 'Format attendu: +224 XXX XX XX XX', variant: 'destructive' })
      return
    }

    if (!activeProvider) {
      toast({ title: 'Fournisseur non détecté', description: 'Sélectionnez Orange Money ou MTN MoMo manuellement.', variant: 'destructive' })
      return
    }

    setIsProcessing(true)
    setStep('processing')

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1500))

    const success = Math.random() > 0.15
    const reference = generateReference(activeProvider)
    const txnId = generateTransactionId()

    const now = new Date().toISOString()

    if (success) {
      const txn = {
        id: txnId,
        reference,
        provider: activeProvider,
        phoneNumber,
        amount: Number(amount),
        currency,
        reason,
        invoiceId: invoiceId || null,
        patientName: patientName || '',
        patientId: patientId || '',
        status: 'En cours' as const,
        createdAt: now,
        updatedAt: now,
        completedAt: null,
        providerTransactionId: `${activeProvider === 'Orange Money' ? 'OM' : 'MTN'}-TXN-${Math.floor(Math.random() * 99999)}`,
        paymentLink: `https://pay.${activeProvider === 'Orange Money' ? 'orange' : 'mtn'}.gf/${reference}`,
      }

      addMobileMoneyTransaction(txn)

      // Simulate completion after a short delay
      setTimeout(() => {
        const completedTxn = { ...txn, status: 'Réussi' as const, completedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        const { updateMobileMoneyTransaction } = useDataStore.getState()
        updateMobileMoneyTransaction(txnId, { status: 'Réussi', completedAt: new Date().toISOString(), updatedAt: new Date().toISOString() })

        // If linked to invoice, pay it
        if (invoiceId) {
          payInvoice(invoiceId, `Mobile Money (${activeProvider})`, Number(amount))
        }
      }, 3000)

      setTransactionRef(reference)
      setStep('success')

      toast({
        title: 'Paiement initié',
        description: `${activeProvider}: ${Number(amount).toLocaleString()} GNF. Réf: ${reference}`,
      })

      if (onSuccess) onSuccess(txnId)
    } else {
      setStep('failure')
      toast({
        title: 'Échec du paiement',
        description: 'Le paiement n\'a pas pu être initié. Réessayez.',
        variant: 'destructive',
      })
    }

    setIsProcessing(false)
  }

  return (
    <Card className="border-slate-200/60 dark:border-slate-800/60">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex items-center justify-center size-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 shadow-md">
            <Smartphone className="size-4 text-white" />
          </div>
          Paiement Mobile Money
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              {/* Provider Selection */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Fournisseur</Label>
                <Select value={provider} onValueChange={(v) => setProvider(v as MobileMoneyProvider | 'auto')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto-détection (selon numéro)</SelectItem>
                    <SelectItem value="Orange Money">🍊 Orange Money</SelectItem>
                    <SelectItem value="MTN MoMo">📱 MTN MoMo</SelectItem>
                  </SelectContent>
                </Select>
                {detectedProvider && provider === 'auto' && (
                  <p className="text-xs text-teal-600 dark:text-teal-400">
                    Détecté: {detectedProvider === 'Orange Money' ? '🍊' : '📱'} {detectedProvider}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Numéro de téléphone</Label>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 text-sm text-slate-500">
                    +224
                  </div>
                  <Input
                    placeholder="6XX XX XX XX"
                    value={phoneNumber.replace('+224 ', '')}
                    onChange={(e) => handlePhoneChange('+224 ' + e.target.value)}
                    className="flex-1"
                  />
                </div>
                {phoneNumber && !isValidGuineaPhone(phoneNumber) && (
                  <p className="text-xs text-red-500">Numéro invalide</p>
                )}
              </div>

              {/* Amount & Currency */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Montant</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Devise</Label>
                  <Select value={currency} onValueChange={(v) => setCurrency(v as 'GNF' | 'USD')}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GNF">GNF (Franc guinéen)</SelectItem>
                      <SelectItem value="USD">USD (Dollar)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Motif</Label>
                <Select value={reason} onValueChange={(v) => setReason(v as PaymentReason)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Facture">Facture</SelectItem>
                    <SelectItem value="Consultation">Consultation</SelectItem>
                    <SelectItem value="Pharmacie">Pharmacie</SelectItem>
                    <SelectItem value="Laboratoire">Laboratoire</SelectItem>
                    <SelectItem value="Hospitalisation">Hospitalisation</SelectItem>
                    <SelectItem value="Autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Invoice link */}
              {invoiceId && (
                <div className="flex items-center gap-2 p-2 bg-teal-50 dark:bg-teal-950/30 rounded-lg text-xs">
                  <Receipt className="size-3.5 text-teal-600" />
                  <span className="text-teal-700 dark:text-teal-300">Facture liée: {invoiceId}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {onCancel && (
                  <Button variant="outline" onClick={onCancel} className="flex-1">Annuler</Button>
                )}
                <Button
                  onClick={handleSubmit}
                  disabled={!phoneNumber || !amount || !activeProvider || !isValidGuineaPhone(phoneNumber)}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white"
                >
                  <Smartphone className="size-4 mr-2" />
                  Payer {amount ? `${Number(amount).toLocaleString()} ${currency}` : ''}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div key="processing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center py-8 gap-4">
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="size-16 rounded-full border-4 border-orange-200 dark:border-orange-800 border-t-orange-500"
                />
                <Smartphone className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-6 text-orange-500" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-slate-900 dark:text-white">Traitement en cours...</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {activeProvider}: Le client recevra une notification USSD
                </p>
              </div>
              <p className="text-xs text-slate-400 animate-pulse">Veuillez patienter, ne fermez pas cette page</p>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center py-6 gap-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}>
                <div className="flex items-center justify-center size-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                  <CheckCircle2 className="size-8 text-emerald-500" />
                </div>
              </motion.div>
              <div className="text-center">
                <p className="font-semibold text-emerald-700 dark:text-emerald-300">Paiement initié avec succès !</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {activeProvider} • {Number(amount).toLocaleString()} {currency}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-mono">
                  Réf: {transactionRef}
                </p>
              </div>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" className="text-xs">
                  <Download className="size-3.5 mr-1" /> Reçu
                </Button>
                <Button variant="outline" size="sm" className="text-xs" onClick={() => { setStep('form'); setPhoneNumber(''); setAmount(''); setTransactionRef('') }}>
                  Nouveau paiement
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'failure' && (
            <motion.div key="failure" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center py-6 gap-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}>
                <div className="flex items-center justify-center size-16 rounded-full bg-red-100 dark:bg-red-900/40">
                  <XCircle className="size-8 text-red-500" />
                </div>
              </motion.div>
              <div className="text-center">
                <p className="font-semibold text-red-700 dark:text-red-300">Échec du paiement</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Le paiement n&apos;a pas pu être initié. Veuillez réessayer.
                </p>
              </div>
              <Button onClick={() => setStep('form')} variant="outline" size="sm">
                Réessayer
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
