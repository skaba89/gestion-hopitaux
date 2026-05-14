'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Pill, AlertTriangle, Search, Plus, X, ShieldAlert, ShieldCheck, ShieldQuestion, ShieldX, FileText, Info
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useDataStore, type DrugInteractionAlert, type InteractionCheckResult } from '@/lib/data-store'

/* ─────────── Animation ─────────── */

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } }

/* ─────────── Severity Helpers ─────────── */

function getSeverityConfig(severity: DrugInteractionAlert['severity']) {
  switch (severity) {
    case 'CRITIQUE': return { color: 'bg-red-500', textColor: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-50 dark:bg-red-950/20', borderColor: 'border-red-200 dark:border-red-800', icon: ShieldX, label: 'Critique' }
    case 'MAJEUR': return { color: 'bg-amber-500', textColor: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-950/20', borderColor: 'border-amber-200 dark:border-amber-800', icon: ShieldAlert, label: 'Majeur' }
    case 'MODÉRÉ': return { color: 'bg-yellow-500', textColor: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-50 dark:bg-yellow-950/20', borderColor: 'border-yellow-200 dark:border-yellow-800', icon: ShieldQuestion, label: 'Modéré' }
    case 'MINEUR': return { color: 'bg-emerald-500', textColor: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-50 dark:bg-emerald-950/20', borderColor: 'border-emerald-200 dark:border-emerald-800', icon: ShieldCheck, label: 'Mineur' }
  }
}

/* ─────────── Medication Database ─────────── */

const medicationDatabase = [
  // Antipaludéens
  'Artéméther/Luméfantrine', 'Quinine', 'Primaquine',
  // Antibiotiques
  'Amoxicilline', 'Ciprofloxacine', 'Métronidazole', 'Cotrimoxazole', 'Céfétriaxone', 'Rifampicine', 'Isoniazide', 'Pyrazinamide',
  // Antirétroviraux
  'Efavirenz', 'Ténofovir', 'Lamivudine', 'Dolutégravir',
  // Antihypertenseurs
  'Amlodipine', 'Losartan', 'Hydrochlorothiazide',
  // Antidiabétiques
  'Metformine', 'Glibenclamide', 'Insuline',
  // Antalgiques
  'Paracétamol', 'Ibuprofène', 'Tramadol', 'Aspirine',
  // Anti-inflammatoires
  'Diclofénac', 'Prednisone',
  // Antituberculeux
  'Rifampicine', 'Isoniazide', 'Pyrazinamide',
]

/* ─────────── Main Component ─────────── */

export function InteractionChecker() {
  const { medications: pharmacyStock } = useDataStore()
  const [selectedMeds, setSelectedMeds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [customMed, setCustomMed] = useState('')
  const [result, setResult] = useState<InteractionCheckResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [patientAge, setPatientAge] = useState('')
  const [patientWeight, setPatientWeight] = useState('')

  const availableMeds = [...new Set([...medicationDatabase, ...pharmacyStock.map(m => m.name)])].sort()

  const filteredMeds = searchQuery.trim()
    ? availableMeds.filter(m => m.toLowerCase().includes(searchQuery.toLowerCase()))
    : availableMeds

  const addMedication = (name: string) => {
    if (!selectedMeds.includes(name)) {
      setSelectedMeds([...selectedMeds, name])
    }
    setSearchQuery('')
  }

  const removeMedication = (name: string) => {
    setSelectedMeds(selectedMeds.filter(m => m !== name))
  }

  const checkInteractions = useCallback(async () => {
    if (selectedMeds.length < 2) return
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify({
          medications: selectedMeds,
          patientContext: {
            age: Number(patientAge) || 30,
            gender: 'M' as const,
            weight: Number(patientWeight) || undefined,
            conditions: [],
            medications: [],
            allergies: [],
            isPregnant: false,
            recentTravel: '',
            vaccinationStatus: 'Inconnu',
          },
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setResult(data)
        setIsLoading(false)
        return
      }
    } catch {
      // Fall through
    }

    // Fallback offline
    try {
      const { checkInteractionsOffline } = await import('@/lib/drug-interactions')
      const offlineResult = checkInteractionsOffline(selectedMeds)
      setResult(offlineResult)
    } catch {
      setResult({
        interactions: [],
        contraindications: ['Service indisponible'],
        dosageAdjustments: [],
        isOffline: true,
      })
    }
    setIsLoading(false)
  }, [selectedMeds, patientAge, patientWeight])

  const printReport = () => {
    if (!result) return
    window.print()
  }

  const severityCounts = result ? {
    CRITIQUE: result.interactions.filter(i => i.severity === 'CRITIQUE').length,
    MAJEUR: result.interactions.filter(i => i.severity === 'MAJEUR').length,
    MODÉRÉ: result.interactions.filter(i => i.severity === 'MODÉRÉ').length,
    MINEUR: result.interactions.filter(i => i.severity === 'MINEUR').length,
  } : null

  return (
    <motion.div className="p-4 lg:p-6 space-y-6 max-w-[1200px] mx-auto" variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 shadow-lg shadow-rose-500/20">
            <Pill className="size-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Interactions médicamenteuses</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Vérification des interactions entre médicaments</p>
          </div>
        </div>
        {result?.isOffline && (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 text-xs">
            Mode hors ligne
          </Badge>
        )}
      </motion.div>

      {/* Medication selection */}
      <motion.div variants={itemVariants}>
        <Card className="border-slate-200/60 dark:border-slate-800/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Médicaments à vérifier</CardTitle>
            <CardDescription className="text-xs">Ajoutez au moins 2 médicaments pour vérifier les interactions</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                placeholder="Rechercher un médicament..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              {searchQuery && (
                <div className="absolute top-full mt-1 left-0 right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                  {filteredMeds.slice(0, 10).map(med => (
                    <button
                      key={med}
                      onClick={() => addMedication(med)}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs flex items-center justify-between"
                    >
                      <span className="text-slate-900 dark:text-white">{med}</span>
                      <Plus className="size-3 text-slate-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Custom med */}
            <div className="flex gap-2">
              <Input placeholder="Médicament personnalisé..." value={customMed} onChange={e => setCustomMed(e.target.value)} onKeyDown={e => e.key === 'Enter' && customMed && (addMedication(customMed), setCustomMed(''))} className="flex-1 h-9 text-sm" />
              <Button variant="outline" size="sm" onClick={() => { if (customMed) { addMedication(customMed); setCustomMed('') } }}>
                <Plus className="size-4" />
              </Button>
            </div>

            {/* Selected medications */}
            {selectedMeds.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {selectedMeds.map(med => (
                    <motion.div key={med} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                      <Badge className="pl-2.5 pr-1 py-1.5 gap-1.5 text-xs bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                        <Pill className="size-3" />
                        {med}
                        <button onClick={() => removeMedication(med)} className="ml-0.5 rounded-full hover:bg-black/10 p-0.5">
                          <X className="size-3" />
                        </button>
                      </Badge>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Patient info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Âge patient</Label>
                <Input type="number" placeholder="Âge" value={patientAge} onChange={e => setPatientAge(e.target.value)} className="h-9" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Poids (kg)</Label>
                <Input type="number" placeholder="Poids" value={patientWeight} onChange={e => setPatientWeight(e.target.value)} className="h-9" />
              </div>
            </div>

            {/* Check button */}
            <Button
              onClick={checkInteractions}
              disabled={selectedMeds.length < 2 || isLoading}
              className="w-full bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white"
            >
              {isLoading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <AlertTriangle className="size-4 mr-2" />
                </motion.div>
              ) : (
                <Pill className="size-4 mr-2" />
              )}
              {isLoading ? 'Vérification en cours...' : `Vérifier les interactions (${selectedMeds.length} médicaments)`}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Severity legend */}
            {severityCounts && (
              <div className="flex flex-wrap gap-3">
                {(['CRITIQUE', 'MAJEUR', 'MODÉRÉ', 'MINEUR'] as const).map(sev => {
                  const config = getSeverityConfig(sev)
                  const count = severityCounts[sev]
                  return (
                    <div key={sev} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${config.bgColor} border ${config.borderColor}`}>
                      <div className={`size-2.5 rounded-full ${config.color}`} />
                      <span className={`text-xs font-medium ${config.textColor}`}>{config.label}</span>
                      <Badge variant="secondary" className="text-[9px] h-4 px-1.5">{count}</Badge>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Contraindications */}
            {result.contraindications.length > 0 && (
              <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
                <CardContent className="py-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldX className="size-5 text-red-500" />
                    <span className="font-semibold text-red-700 dark:text-red-300">Contre-indications</span>
                  </div>
                  {result.contraindications.map((c, i) => (
                    <p key={i} className="text-sm text-red-600 dark:text-red-400 ml-7 mb-1">• {c}</p>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Interaction cards */}
            {result.interactions.length > 0 ? (
              <div className="space-y-3">
                {result.interactions.sort((a, b) => {
                  const order = { CRITIQUE: 0, MAJEUR: 1, MODÉRÉ: 2, MINEUR: 3 }
                  return order[a.severity] - order[b.severity]
                }).map((interaction, i) => {
                  const config = getSeverityConfig(interaction.severity)
                  const Icon = config.icon
                  return (
                    <motion.div
                      key={interaction.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                    >
                      <Card className={`border ${config.borderColor} overflow-hidden`}>
                        <div className={`h-1 ${config.color}`} />
                        <CardContent className="pt-4 pb-4">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${config.bgColor}`}>
                              <Icon className={`size-5 ${config.textColor}`} />
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{interaction.drug1}</span>
                                  <span className="text-slate-400">+</span>
                                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{interaction.drug2}</span>
                                </div>
                                <Badge variant="outline" className={`text-[9px] ${config.bgColor} ${config.textColor} ${config.borderColor}`}>
                                  {config.label}
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-400">{interaction.description}</p>
                              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                  <span className="text-teal-600 dark:text-teal-400">💡 Recommandation :</span> {interaction.recommendation}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
                <CardContent className="py-6 flex flex-col items-center gap-2">
                  <ShieldCheck className="size-8 text-emerald-500" />
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Aucune interaction détectée</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">Aucune interaction connue entre les médicaments sélectionnés</p>
                </CardContent>
              </Card>
            )}

            {/* Dosage adjustments */}
            {result.dosageAdjustments.length > 0 && (
              <Card className="border-slate-200/60 dark:border-slate-800/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Info className="size-4 text-amber-500" />
                    Ajustements posologiques
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {result.dosageAdjustments.map((adj, i) => (
                    <div key={i} className="p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{adj.medication}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Posologie standard : {adj.standardDosage}</p>
                      <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">Posologie ajustée : {adj.adjustedDosage}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Raison : {adj.reason}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { setResult(null); setSelectedMeds([]) }} className="flex-1">
                Nouvelle vérification
              </Button>
              <Button onClick={printReport} className="flex-1 bg-gradient-to-r from-rose-500 to-red-600 text-white">
                <FileText className="size-4 mr-2" /> Imprimer le rapport
              </Button>
            </div>

            {/* Disclaimer */}
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
              <p className="text-[10px] text-amber-700 dark:text-amber-300 text-center leading-relaxed">
                ⚠️ Cet outil est une aide à la prescription. Il ne remplace pas le jugement pharmaceutique professionnel. Consultez toujours un pharmacien ou un médecin qualifié.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
