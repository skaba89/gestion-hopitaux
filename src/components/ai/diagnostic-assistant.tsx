'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain, AlertTriangle, Activity, Building2, Stethoscope, FileText, Mic, MicOff,
  ChevronRight, ChevronLeft, Download, RefreshCw, WifiOff, Wifi, CheckCircle2, XCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { SymptomSelector, type SelectedSymptom } from '@/components/ai/symptom-selector'
import { PatientContextForm } from '@/components/ai/patient-context-form'
import type { PatientContext, PossibleDiagnosis, OrientationLevel, DiagnosticResponse } from '@/lib/data-store'

/* ─────────── Animation ─────────── */

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } }

/* ─────────── Confidence Color ─────────── */

function getConfidenceColor(confidence: number): string {
  if (confidence >= 80) return 'bg-red-500'
  if (confidence >= 50) return 'bg-amber-500'
  if (confidence >= 30) return 'bg-yellow-500'
  return 'bg-emerald-500'
}

function getConfidenceTextColor(confidence: number): string {
  if (confidence >= 80) return 'text-red-600 dark:text-red-400'
  if (confidence >= 50) return 'text-amber-600 dark:text-amber-400'
  if (confidence >= 30) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-emerald-600 dark:text-emerald-400'
}

function getUrgencyBadge(urgency: PossibleDiagnosis['urgency']): string {
  switch (urgency) {
    case 'Critique': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800'
    case 'Élevé': return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
    case 'Modéré': return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-800'
    case 'Faible': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
  }
}

function getOrientationIcon(orientation: OrientationLevel) {
  switch (orientation) {
    case 'Urgences': return <AlertTriangle className="size-5 text-red-500" />
    case 'Hôpital national': return <Building2 className="size-5 text-amber-500" />
    case 'Hôpital de district': return <Building2 className="size-5 text-teal-500" />
    case 'Centre de santé': return <Stethoscope className="size-5 text-emerald-500" />
  }
}

/* ─────────── Main Component ─────────── */

export function DiagnosticAssistant() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [selectedSymptoms, setSelectedSymptoms] = useState<SelectedSymptom[]>([])
  const [patientContext, setPatientContext] = useState<PatientContext>({
    age: 0,
    gender: 'M',
    conditions: [],
    medications: [],
    allergies: [],
    isPregnant: false,
    recentTravel: '',
    vaccinationStatus: 'Inconnu',
  })
  const [result, setResult] = useState<DiagnosticResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [voiceText, setVoiceText] = useState('')

  const canProceedToStep2 = selectedSymptoms.length > 0
  const canProceedToStep3 = patientContext.age > 0

  const runAnalysis = async () => {
    setIsLoading(true)
    setStep(3)

    try {
      const response = await fetch('/api/ai/diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms: selectedSymptoms.map(s => `${s.name} (${s.duration}, sévérité ${s.severity}/10)`),
          patientContext,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setResult(data)
        setStep(4)
        return
      }
    } catch {
      // Fall through to offline
    }

    // Fallback offline analysis
    try {
      const { getOfflineDiagnostic } = await import('@/lib/ai-diagnostic')
      const offlineResult = getOfflineDiagnostic(selectedSymptoms.map(s => s.name))
      setResult(offlineResult)
    } catch {
      setResult({
        possibleDiagnoses: [{ name: 'Analyse indisponible', confidence: 0, urgency: 'Modéré', description: 'Le service d\'analyse est temporairement indisponible. Veuillez consulter un professionnel de santé.' }],
        recommendedExams: ['Consultation médicale'],
        orientation: 'Centre de santé',
        redFlags: [],
        questions: [],
        isOffline: true,
      })
    }
    setStep(4)
    setIsLoading(false)
  }

  const exportReport = () => {
    if (!result) return
    const report = `
══════════════════════════════════════════════════
  RAPPORT D'ANALYSE DIAGNOSTIQUE IA — HealthFlow
══════════════════════════════════════════════════

Date : ${new Date().toLocaleString('fr-FR')}

SYMPTÔMES :
${selectedSymptoms.map(s => `• ${s.name} (${s.duration}, sévérité ${s.severity}/10)`).join('\n')}

CONTEXTE PATIENT :
- Âge : ${patientContext.age} ans
- Sexe : ${patientContext.gender === 'M' ? 'Masculin' : 'Féminin'}
${patientContext.conditions.length > 0 ? `- Antécédents : ${patientContext.conditions.join(', ')}` : ''}
${patientContext.medications.length > 0 ? `- Médicaments : ${patientContext.medications.join(', ')}` : ''}
${patientContext.allergies.length > 0 ? `- Allergies : ${patientContext.allergies.join(', ')}` : ''}
${patientContext.isPregnant ? '- ENCEINTE' : ''}

DIAGNOSTICS POSSIBLES :
${result.possibleDiagnoses.map(d => `• ${d.name} (confiance: ${d.confidence}%, urgence: ${d.urgency})\n  ${d.description}`).join('\n\n')}

EXAMENS RECOMMANDÉS :
${result.recommendedExams.map(e => `• ${e}`).join('\n')}

ORIENTATION : ${result.orientation}

${result.redFlags.length > 0 ? `⚠️ SIGNES D'ALERTE :\n${result.redFlags.map(r => `• ${r}`).join('\n')}` : ''}

${result.isOffline ? '⚠️ Mode hors ligne — Résultats basés sur l\'arbre décisionnel local' : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Cet outil est une aide au diagnostic. Il ne remplace pas le jugement médical professionnel. Consultez toujours un professionnel de santé qualifié.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rapport-diagnostic-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      return
    }

    if (isListening) {
      setIsListening(false)
      return
    }

    const SpeechRecognition = (window as Record<string, unknown>).SpeechRecognition || (window as Record<string, unknown>).webkitSpeechRecognition
    const recognition = new (SpeechRecognition as new () => SpeechRecognition)()
    recognition.lang = 'fr-FR'
    recognition.continuous = false

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript
      setVoiceText(transcript)
      // Auto-add recognized symptoms
      const words = transcript.toLowerCase().split(/[\s,]+/)
      for (const word of words) {
        if (word.length > 3 && !selectedSymptoms.some(s => s.name.toLowerCase() === word)) {
          setSelectedSymptoms(prev => [...prev, { name: word.charAt(0).toUpperCase() + word.slice(1), duration: 'aigu', severity: 5 }])
        }
      }
      setIsListening(false)
    }

    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)
    recognition.start()
    setIsListening(true)
  }

  return (
    <motion.div className="p-4 lg:p-6 space-y-6 max-w-[1200px] mx-auto" variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg shadow-purple-500/20">
            <Brain className="size-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Diagnostic IA</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Assistant diagnostique intelligent</p>
          </div>
        </div>
        {result?.isOffline && (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 text-xs">
            <WifiOff className="size-3 mr-1.5" /> Mode hors ligne
          </Badge>
        )}
        {!result?.isOffline && result && (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 text-xs">
            <Wifi className="size-3 mr-1.5" /> IA connectée
          </Badge>
        )}
      </motion.div>

      {/* Step indicator */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          {[
            { num: 1, label: 'Symptômes' },
            { num: 2, label: 'Contexte' },
            { num: 3, label: 'Analyse' },
            { num: 4, label: 'Résultats' },
          ].map((s, i) => (
            <div key={s.num} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
              step === s.num ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-sm' :
              step > s.num ? 'text-emerald-600 dark:text-emerald-400' :
              'text-slate-400 dark:text-slate-500'
            }`}>
              {step > s.num ? <CheckCircle2 className="size-3.5" /> : <span className="size-5 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-[10px]">{s.num}</span>}
              <span className="hidden sm:inline">{s.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Step 1: Symptom Selection */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Card className="border-slate-200/60 dark:border-slate-800/60">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Sélection des symptômes</CardTitle>
                    <CardDescription className="text-xs">Choisissez les symptômes du patient</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleVoice}
                    className={isListening ? 'bg-red-50 text-red-600 border-red-200' : ''}
                  >
                    {isListening ? <MicOff className="size-4 mr-1.5" /> : <Mic className="size-4 mr-1.5" />}
                    {isListening ? 'Arrêter' : 'Voix'}
                  </Button>
                </div>
                {voiceText && <p className="text-xs text-slate-500 mt-1">🎤 &quot;{voiceText}&quot;</p>}
              </CardHeader>
              <CardContent>
                <SymptomSelector selected={selectedSymptoms} onChange={setSelectedSymptoms} />
              </CardContent>
            </Card>
            <div className="flex justify-end mt-4">
              <Button
                onClick={() => setStep(2)}
                disabled={!canProceedToStep2}
                className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white"
              >
                Suivant <ChevronRight className="size-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Patient Context */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Card className="border-slate-200/60 dark:border-slate-800/60">
              <CardHeader>
                <CardTitle className="text-base">Contexte patient</CardTitle>
                <CardDescription className="text-xs">Informations pour affiner l&apos;analyse</CardDescription>
              </CardHeader>
              <CardContent>
                <PatientContextForm value={patientContext} onChange={setPatientContext} />
              </CardContent>
            </Card>
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ChevronLeft className="size-4 mr-1" /> Précédent
              </Button>
              <Button
                onClick={runAnalysis}
                disabled={!canProceedToStep3}
                className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white"
              >
                Analyser <Brain className="size-4 ml-1.5" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Analysis in progress */}
        {step === 3 && isLoading && (
          <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card className="border-slate-200/60 dark:border-slate-800/60">
              <CardContent className="py-16 flex flex-col items-center justify-center gap-4">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Brain className="size-16 text-purple-500" />
                </motion.div>
                <div className="text-center space-y-2">
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">Analyse en cours...</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">L&apos;IA analyse les symptômes et le contexte patient</p>
                </div>
                <div className="w-64">
                  <Progress value={66} className="h-2" />
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Activity className="size-3" /> Analyse des corrélations</span>
                  <span className="flex items-center gap-1"><AlertTriangle className="size-3" /> Détection des alertes</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 4: Results */}
        {step === 4 && result && (
          <motion.div key="step4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Red flags */}
            {result.redFlags.length > 0 && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-2 mb-2">
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                        <AlertTriangle className="size-5 text-red-500" />
                      </motion.div>
                      <span className="font-semibold text-red-700 dark:text-red-300">Signes d&apos;alerte</span>
                    </div>
                    <div className="space-y-1.5">
                      {result.redFlags.map((flag, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                          <XCircle className="size-4 shrink-0" />
                          {flag}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Orientation */}
            <Card className="border-slate-200/60 dark:border-slate-800/60">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  {getOrientationIcon(result.orientation)}
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Orientation recommandée</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{result.orientation}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Possible diagnoses */}
            <Card className="border-slate-200/60 dark:border-slate-800/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Diagnostics possibles</CardTitle>
                <CardDescription className="text-xs">Hypothèses diagnostiques classées par confiance</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {result.possibleDiagnoses.sort((a, b) => b.confidence - a.confidence).map((diagnosis, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/50"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="size-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">{i + 1}</span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{diagnosis.name}</span>
                      </div>
                      <Badge variant="outline" className={`text-[9px] shrink-0 ${getUrgencyBadge(diagnosis.urgency)}`}>
                        {diagnosis.urgency}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 ml-8">{diagnosis.description}</p>
                    <div className="ml-8 flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${getConfidenceColor(diagnosis.confidence)}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${diagnosis.confidence}%` }}
                          transition={{ duration: 0.8, delay: i * 0.15 }}
                        />
                      </div>
                      <span className={`text-xs font-bold ${getConfidenceTextColor(diagnosis.confidence)}`}>
                        {diagnosis.confidence}%
                      </span>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Recommended exams */}
            <Card className="border-slate-200/60 dark:border-slate-800/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="size-4 text-teal-600 dark:text-teal-400" />
                  Examens recommandés
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2">
                  {result.recommendedExams.map((exam, i) => (
                    <Badge key={i} variant="outline" className="text-xs bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800">
                      {exam}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Follow-up questions */}
            {result.questions.length > 0 && (
              <Card className="border-slate-200/60 dark:border-slate-800/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Brain className="size-4 text-purple-600 dark:text-purple-400" />
                    Questions complémentaires
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {result.questions.map((q, i) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-purple-50/50 dark:bg-purple-950/20">
                      <span className="size-5 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-[10px] font-bold text-purple-600 dark:text-purple-300 shrink-0">{i + 1}</span>
                      <p className="text-xs text-slate-700 dark:text-slate-300">{q}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" onClick={() => { setStep(1); setResult(null); setSelectedSymptoms([]) }} className="flex-1">
                <RefreshCw className="size-4 mr-2" /> Nouvelle analyse
              </Button>
              <Button onClick={exportReport} className="flex-1 bg-gradient-to-r from-purple-500 to-violet-600 text-white">
                <Download className="size-4 mr-2" /> Exporter le rapport
              </Button>
            </div>

            {/* Medical disclaimer */}
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
              <p className="text-[10px] text-amber-700 dark:text-amber-300 text-center leading-relaxed">
                ⚠️ Cet outil est une aide au diagnostic. Il ne remplace pas le jugement médical professionnel. Consultez toujours un professionnel de santé qualifié.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
