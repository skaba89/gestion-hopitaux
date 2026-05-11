'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, User, Stethoscope, ClipboardList, CheckCircle2, AlertCircle, Wifi, WifiOff } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { type VideoConsultationSession } from '@/lib/telemedicine'

interface VirtualWaitingRoomProps {
  session: VideoConsultationSession
  onStartCall: () => void
}

export function VirtualWaitingRoom({ session, onStartCall }: VirtualWaitingRoomProps) {
  const [isReady, setIsReady] = useState(false)
  const [questionnaireFilled, setQuestionnaireFilled] = useState(false)
  const [chiefComplaint, setChiefComplaint] = useState('')
  const [duration, setDuration] = useState('')
  const [severity, setSeverity] = useState(5)
  const [symptoms, setSymptoms] = useState('')
  const [medications, setMedications] = useState('')

  const queuePosition = 2
  const estimatedWait = 10 // minutes

  const handleReady = () => {
    setIsReady(true)
    // In real app: notify doctor via signaling
  }

  return (
    <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Waiting room header */}
      <Card className="border-teal-200/60 dark:border-teal-800/40 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="size-16 rounded-2xl bg-teal-600/20 flex items-center justify-center">
                <Clock className="size-8 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Salle d&apos;attente virtuelle</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {session.doctorName} vous recevra prochainement
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-teal-700 dark:text-teal-300">{queuePosition}</p>
                <p className="text-xs text-slate-500">Position</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">~{estimatedWait} min</p>
                <p className="text-xs text-slate-500">Attente estimée</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Doctor info */}
      <Card className="border-slate-200/60 dark:border-slate-800/60">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold">
              {session.doctorName.split(' ').filter(n => n.length > 2).map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-900 dark:text-white">{session.doctorName}</p>
                <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">
                  <span className="size-1.5 rounded-full bg-emerald-500 mr-1" /> En ligne
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Médecin généraliste • {session.type}</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Wifi className="size-3 text-emerald-500" /> Connecté
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pre-consultation questionnaire */}
      <Card className="border-slate-200/60 dark:border-slate-800/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <ClipboardList className="size-4 text-teal-600" />
            Questionnaire pré-consultation
          </CardTitle>
          <CardDescription className="text-xs">
            Remplissez ce questionnaire pour préparer la consultation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium">Motif principal de consultation *</Label>
            <Textarea
              placeholder="Décrivez brièvement votre motif de consultation..."
              value={chiefComplaint}
              onChange={e => setChiefComplaint(e.target.value)}
              rows={2}
              className="text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Depuis combien de temps ?</Label>
              <input
                type="text"
                placeholder="ex: 3 jours"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Sévérité (1-10)</Label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={severity}
                  onChange={e => setSeverity(parseInt(e.target.value))}
                  className="flex-1 accent-teal-600"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 w-6 text-center">{severity}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">Symptômes associés</Label>
            <Textarea
              placeholder="Autres symptômes que vous ressentez..."
              value={symptoms}
              onChange={e => setSymptoms(e.target.value)}
              rows={2}
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">Médicaments actuels</Label>
            <input
              type="text"
              placeholder="Liste de vos médicaments actuels"
              value={medications}
              onChange={e => setMedications(e.target.value)}
              className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <AlertCircle className="size-3.5" />
            <span>Le questionnaire sera analysé par l&apos;IA pour préparer un résumé pour le médecin</span>
          </div>
        </CardContent>
      </Card>

      {/* Preparation instructions */}
      <Card className="border-slate-200/60 dark:border-slate-800/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Instructions de préparation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            'Assurez-vous d\'être dans un endroit calme et bien éclairé',
            'Vérifiez que votre caméra et micro fonctionnent',
            'Préparez vos documents médicaux si nécessaire',
            'Ayez vos médicaments actuels sous la main',
            'Vérifiez votre connexion internet',
          ].map((instruction, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-teal-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-slate-600 dark:text-slate-400">{instruction}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Ready button */}
      <div className="flex justify-center">
        <Button
          size="lg"
          className={`px-8 ${isReady
            ? 'bg-emerald-600 hover:bg-emerald-700'
            : 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700'
          } text-white shadow-lg`}
          onClick={handleReady}
        >
          {isReady ? (
            <>
              <CheckCircle2 className="size-5 mr-2" /> Prêt — En attente du médecin
            </>
          ) : (
            <>
              <Stethoscope className="size-5 mr-2" /> Je suis prêt(e)
            </>
          )}
        </Button>
      </div>
    </motion.div>
  )
}
