'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Loader2, CheckCircle2, Edit, AlertTriangle, Stethoscope } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface AISummary {
  summary: string
  keyFindings: string[]
  suggestedQuestions: string[]
  relevantHistory: string[]
  possibleDiagnoses: { name: string; confidence: number; urgency: string }[]
  redFlags: string[]
  recommendedExams: string[]
}

interface PreConsultationFormProps {
  onSubmit?: (data: { chiefComplaint: string; duration: string; symptoms: string[]; severity: number; medications: string[]; allergies: string[] }) => void
}

export function PreConsultationForm({ onSubmit }: PreConsultationFormProps) {
  const [chiefComplaint, setChiefComplaint] = useState('')
  const [duration, setDuration] = useState('')
  const [symptoms, setSymptoms] = useState('')
  const [severity, setSeverity] = useState(5)
  const [previousEpisodes, setPreviousEpisodes] = useState(false)
  const [medications, setMedications] = useState('')
  const [allergies, setAllergies] = useState('')
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    onSubmit?.({
      chiefComplaint,
      duration,
      symptoms: symptoms.split(',').map(s => s.trim()).filter(Boolean),
      severity,
      medications: medications.split(',').map(s => s.trim()).filter(Boolean),
      allergies: allergies.split(',').map(s => s.trim()).filter(Boolean),
    })
    setIsSubmitting(false)
  }

  return (
    <Card className="border-slate-200/60 dark:border-slate-800/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Brain className="size-4 text-teal-600" />
          Questionnaire pré-consultation IA
        </CardTitle>
        <CardDescription className="text-xs">
          L&apos;IA analysera vos réponses pour préparer un résumé pour le médecin
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Motif principal *</label>
          <textarea
            placeholder="Décrivez votre motif de consultation..."
            value={chiefComplaint}
            onChange={e => setChiefComplaint(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Durée</label>
            <input
              type="text"
              placeholder="ex: 3 jours"
              value={duration}
              onChange={e => setDuration(e.target.value)}
              className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Sévérité (1-10)</label>
            <div className="flex items-center gap-2">
              <input type="range" min="1" max="10" value={severity} onChange={e => setSeverity(parseInt(e.target.value))} className="flex-1 accent-teal-600" />
              <span className="text-sm font-medium w-6 text-center">{severity}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Symptômes associés (séparés par des virgules)</label>
          <input
            type="text"
            placeholder="fièvre, maux de tête, fatigue..."
            value={symptoms}
            onChange={e => setSymptoms(e.target.value)}
            className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={previousEpisodes}
            onChange={e => setPreviousEpisodes(e.target.checked)}
            className="accent-teal-600"
          />
          <label className="text-xs text-slate-700 dark:text-slate-300">J&apos;ai déjà eu des épisodes similaires</label>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Médicaments actuels</label>
          <input
            type="text"
            placeholder="Liste de vos médicaments..."
            value={medications}
            onChange={e => setMedications(e.target.value)}
            className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Allergies connues</label>
          <input
            type="text"
            placeholder="Liste de vos allergies..."
            value={allergies}
            onChange={e => setAllergies(e.target.value)}
            className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Notes supplémentaires</label>
          <textarea
            placeholder="Autres informations à communiquer..."
            value={additionalNotes}
            onChange={e => setAdditionalNotes(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
          />
        </div>

        <Button
          className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white"
          onClick={handleSubmit}
          disabled={!chiefComplaint || isSubmitting}
        >
          {isSubmitting ? (
            <><Loader2 className="size-4 mr-2 animate-spin" /> Analyse en cours...</>
          ) : (
            <><Brain className="size-4 mr-2" /> Soumettre pour analyse IA</>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

// ─── AI Consultation Summary (Doctor-facing) ───

interface AIConsultationSummaryProps {
  summary: AISummary
  patientName: string
  onAccept?: () => void
  onModify?: () => void
}

export function AIConsultationSummary({ summary, patientName, onAccept, onModify }: AIConsultationSummaryProps) {
  const [accepted, setAccepted] = useState(false)

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Card className="border-teal-200/60 dark:border-teal-800/40 bg-gradient-to-br from-teal-50/50 to-emerald-50/50 dark:from-teal-950/20 dark:to-emerald-950/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Brain className="size-4 text-teal-600" />
              Résumé IA — {patientName}
            </CardTitle>
            <Badge className="bg-teal-100 text-teal-700 text-[10px]">
              <Brain className="size-3 mr-1" /> Généré par IA
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-700 dark:text-slate-300">{summary.summary}</p>

          {summary.redFlags.length > 0 && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
              <h4 className="text-xs font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-1">
                <AlertTriangle className="size-3.5" /> Signes d&apos;alerte
              </h4>
              <ul className="space-y-1">
                {summary.redFlags.map((flag, i) => (
                  <li key={i} className="text-xs text-red-600 dark:text-red-300">• {flag}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Points clés</h4>
            <div className="space-y-1">
              {summary.keyFindings.map((finding, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="size-3.5 text-teal-500 mt-0.5" />
                  <span className="text-xs text-slate-600 dark:text-slate-400">{finding}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Questions suggérées</h4>
            <div className="space-y-1">
              {summary.suggestedQuestions.map((q, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-teal-600 dark:text-teal-400 text-xs mt-0.5">?</span>
                  <span className="text-xs text-slate-600 dark:text-slate-400">{q}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Diagnostics à considérer</h4>
            <div className="flex flex-wrap gap-2">
              {summary.possibleDiagnoses.map((d, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {d.name} ({d.confidence}%)
                </Badge>
              ))}
            </div>
          </div>

          {summary.recommendedExams.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Examens recommandés</h4>
              <div className="flex flex-wrap gap-2">
                {summary.recommendedExams.map((exam, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">{exam}</Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              className={`flex-1 ${accepted ? 'bg-emerald-600' : 'bg-gradient-to-r from-teal-500 to-emerald-600'} text-white`}
              onClick={() => { setAccepted(true); onAccept?.() }}
            >
              {accepted ? <><CheckCircle2 className="size-4 mr-2" /> Accepté</> : 'Accepter le résumé'}
            </Button>
            <Button variant="outline" onClick={onModify} className="flex-1">
              <Edit className="size-4 mr-2" /> Modifier
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
