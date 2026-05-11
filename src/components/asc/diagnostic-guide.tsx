'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, AlertTriangle, CheckCircle2, ArrowRight, Crosshair } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { type DiagnosticGuide as DiagnosticGuideType, type DiagnosticSeverity, type ReferralDecision } from '@/lib/asc-tools'

const severityStyles: Record<DiagnosticSeverity, { bg: string; border: string; text: string; label: string }> = {
  vert: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800', text: 'text-emerald-700 dark:text-emerald-300', label: 'Stable — Traiter sur place' },
  jaune: { bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-700 dark:text-amber-300', label: 'Attention — Surveillance' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-200 dark:border-orange-800', text: 'text-orange-700 dark:text-orange-300', label: 'Modéré — Référer au centre de santé' },
  rouge: { bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-200 dark:border-red-800', text: 'text-red-700 dark:text-red-300', label: 'Urgent — Référer aux urgences' },
}

interface DiagnosticGuideProps {
  guide: DiagnosticGuideType
}

export function DiagnosticGuide({ guide }: DiagnosticGuideProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<{ severity: DiagnosticSeverity; decision: ReferralDecision } | null>(null)

  const currentStep = guide.steps[currentStepIndex]

  const handleAnswer = (stepId: string, value: string, nextStep?: string, severity?: DiagnosticSeverity) => {
    const newAnswers = { ...answers, [stepId]: value }
    setAnswers(newAnswers)

    if (severity) {
      // Terminal answer reached
      const decision: ReferralDecision = severity === 'vert' ? 'Traiter sur place' :
        severity === 'jaune' ? 'Référer au centre de santé' :
        severity === 'orange' ? 'Référer à l\'hôpital de district' :
        'Référer aux urgences'
      setResult({ severity, decision })
    } else if (nextStep) {
      const nextIndex = guide.steps.findIndex(s => s.id === nextStep)
      if (nextIndex > -1) setCurrentStepIndex(nextIndex)
    }
  }

  const reset = () => {
    setCurrentStepIndex(0)
    setAnswers({})
    setResult(null)
  }

  return (
    <Card className="border-slate-200/60 dark:border-slate-800/60">
      <CardContent className="p-0">
        {/* Guide header */}
        <button
          onClick={() => { setIsOpen(!isOpen); if (!isOpen) reset() }}
          className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{guide.icon}</span>
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{guide.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{guide.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {result && (
              <Badge className={`${severityStyles[result.severity].bg} ${severityStyles[result.severity].text} ${severityStyles[result.severity].border} border text-[10px]`}>
                {result.severity === 'vert' ? 'Stable' : result.severity === 'rouge' ? 'Urgent' : result.severity === 'orange' ? 'Modéré' : 'Attention'}
              </Badge>
            )}
            {isOpen ? <ChevronDown className="size-4 text-slate-400" /> : <ChevronRight className="size-4 text-slate-400" />}
          </div>
        </button>

        {/* Guide content */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                {/* Decision tree */}
                {!result ? (
                  <div className="space-y-3">
                    {currentStep && (
                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        <p className="text-sm font-medium text-slate-900 dark:text-white mb-2">
                          Étape {currentStepIndex + 1}: {currentStep.question}
                        </p>
                        {currentStep.info && (
                          <p className="text-xs text-slate-500 mb-3 italic">{currentStep.info}</p>
                        )}
                        <div className="space-y-2">
                          {currentStep.options.map(opt => (
                            <Button
                              key={opt.value}
                              variant={answers[currentStep.id] === opt.value ? 'default' : 'outline'}
                              size="sm"
                              className={`w-full justify-start text-xs h-9 ${answers[currentStep.id] === opt.value ? 'bg-teal-600 text-white' : ''}`}
                              onClick={() => handleAnswer(currentStep.id, opt.value, opt.nextStep, opt.severity)}
                            >
                              {opt.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                    {Object.keys(answers).length > 0 && (
                      <Button variant="ghost" size="sm" className="text-xs" onClick={reset}>
                        Recommencer
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Result */}
                    <div className={`p-4 rounded-lg border ${severityStyles[result.severity].bg} ${severityStyles[result.severity].border}`}>
                      <div className="flex items-center gap-2 mb-2">
                        {result.severity === 'vert' ? (
                          <CheckCircle2 className={`size-5 ${severityStyles[result.severity].text}`} />
                        ) : (
                          <AlertTriangle className={`size-5 ${severityStyles[result.severity].text}`} />
                        )}
                        <p className={`font-semibold text-sm ${severityStyles[result.severity].text}`}>
                          {severityStyles[result.severity].label}
                        </p>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        Décision: <strong>{result.decision}</strong>
                      </p>
                    </div>

                    {/* Red flags */}
                    {guide.redFlags.length > 0 && result.severity !== 'vert' && (
                      <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                        <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">Signes d&apos;alerte:</p>
                        {guide.redFlags.map((flag, i) => (
                          <p key={i} className="text-xs text-red-600 dark:text-red-300">• {flag}</p>
                        ))}
                      </div>
                    )}

                    {/* Treatment instructions */}
                    {result.severity === 'vert' || result.severity === 'jaune' ? (
                      <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">Traitement sur place:</p>
                        {guide.treatOnPlace.map((t, i) => (
                          <p key={i} className="text-xs text-emerald-600 dark:text-emerald-300">• {t}</p>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">Critères de référence:</p>
                        {guide.referralRequired.map((r, i) => (
                          <p key={i} className="text-xs text-amber-600 dark:text-amber-300">• {r}</p>
                        ))}
                      </div>
                    )}

                    {/* Medications */}
                    {guide.medications && guide.medications.length > 0 && (result.severity === 'vert' || result.severity === 'jaune') && (
                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Médicaments:</p>
                        {guide.medications.map((med, i) => (
                          <div key={i} className="mb-1.5 last:mb-0">
                            <p className="text-xs font-medium text-slate-900 dark:text-white">{med.name}</p>
                            <p className="text-[10px] text-slate-500">{med.dosage} — {med.duration} — {med.notes}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <Button variant="outline" size="sm" className="w-full text-xs" onClick={reset}>
                      Recommencer l&apos;évaluation
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
