'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Save, WifiOff, Plus, X, Camera } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

interface VisitFormProps {
  onClose?: () => void
}

const commonSymptoms = ['Fièvre', 'Céphalées', 'Toux', 'Diarrhée', 'Vomissements', 'Douleurs', 'Fatigue', 'Éruption cutanée']

export function VisitForm({ onClose }: VisitFormProps) {
  const [patientName, setPatientName] = useState('')
  const [patientAge, setPatientAge] = useState('')
  const [patientGender, setPatientGender] = useState<'M' | 'F'>('M')
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [customSymptom, setCustomSymptom] = useState('')
  const [temperature, setTemperature] = useState('')
  const [heartRate, setHeartRate] = useState('')
  const [bloodPressure, setBloodPressure] = useState('')
  const [weight, setWeight] = useState('')
  const [muac, setMuac] = useState('')
  const [actions, setActions] = useState<string[]>([])
  const [actionInput, setActionInput] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [needsReferral, setNeedsReferral] = useState(false)
  const [referralReason, setReferralReason] = useState('')
  const [referralDestination, setReferralDestination] = useState('')
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isCapturingGps, setIsCapturingGps] = useState(false)

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
    )
  }

  const addCustomSymptom = () => {
    if (customSymptom.trim() && !selectedSymptoms.includes(customSymptom.trim())) {
      setSelectedSymptoms(prev => [...prev, customSymptom.trim()])
      setCustomSymptom('')
    }
  }

  const addAction = () => {
    if (actionInput.trim() && !actions.includes(actionInput.trim())) {
      setActions(prev => [...prev, actionInput.trim()])
      setActionInput('')
    }
  }

  const captureGps = async () => {
    setIsCapturingGps(true)
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setGpsLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
            setIsCapturingGps(false)
          },
          () => {
            // Demo fallback
            setGpsLocation({ lat: 9.5092, lng: -13.7122 })
            setIsCapturingGps(false)
          }
        )
      } else {
        setGpsLocation({ lat: 9.5092, lng: -13.7122 })
        setIsCapturingGps(false)
      }
    } catch {
      setGpsLocation({ lat: 9.5092, lng: -13.7122 })
      setIsCapturingGps(false)
    }
  }

  const handleSubmit = () => {
    // In real app: save to store and API
    onClose?.()
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Nouvelle visite</h2>
        {onClose && (
          <Button variant="ghost" size="icon" className="size-8" onClick={onClose}>
            <X className="size-4" />
          </Button>
        )}
      </div>

      {/* Patient Info */}
      <Card className="border-slate-200/60 dark:border-slate-800/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Patient</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Nom du patient" value={patientName} onChange={e => setPatientName(e.target.value)} className="text-sm h-9" />
            <Input placeholder="Âge" type="number" value={patientAge} onChange={e => setPatientAge(e.target.value)} className="text-sm h-9" />
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant={patientGender === 'M' ? 'default' : 'outline'} className={`text-xs h-8 ${patientGender === 'M' ? 'bg-teal-600' : ''}`} onClick={() => setPatientGender('M')}>Masculin</Button>
            <Button size="sm" variant={patientGender === 'F' ? 'default' : 'outline'} className={`text-xs h-8 ${patientGender === 'F' ? 'bg-teal-600' : ''}`} onClick={() => setPatientGender('F')}>Féminin</Button>
          </div>
        </CardContent>
      </Card>

      {/* GPS Location */}
      <Card className="border-slate-200/60 dark:border-slate-800/60">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-teal-600" />
              <span className="text-sm font-medium text-slate-900 dark:text-white">Localisation GPS</span>
            </div>
            <Button size="sm" variant="outline" className="text-xs h-7" onClick={captureGps} disabled={isCapturingGps}>
              {isCapturingGps ? 'Capture...' : gpsLocation ? 'Recapturer' : 'Capturer'}
            </Button>
          </div>
          {gpsLocation && (
            <p className="text-xs text-slate-500 mt-2 ml-6">{gpsLocation.lat.toFixed(4)}, {gpsLocation.lng.toFixed(4)}</p>
          )}
        </CardContent>
      </Card>

      {/* Symptoms */}
      <Card className="border-slate-200/60 dark:border-slate-800/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Symptômes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {commonSymptoms.map(s => (
              <button
                key={s}
                onClick={() => toggleSymptom(s)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedSymptoms.includes(s)
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input placeholder="Autre symptôme..." value={customSymptom} onChange={e => setCustomSymptom(e.target.value)} className="text-sm h-8" onKeyDown={e => { if (e.key === 'Enter') addCustomSymptom() }} />
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={addCustomSymptom}><Plus className="size-3" /></Button>
          </div>
        </CardContent>
      </Card>

      {/* Vital Signs */}
      <Card className="border-slate-200/60 dark:border-slate-800/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Constantes vitales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[10px] text-slate-500">Température (°C)</label><Input type="number" placeholder="37.0" value={temperature} onChange={e => setTemperature(e.target.value)} className="text-sm h-8" /></div>
            <div><label className="text-[10px] text-slate-500">Fréq. cardiaque</label><Input type="number" placeholder="80" value={heartRate} onChange={e => setHeartRate(e.target.value)} className="text-sm h-8" /></div>
            <div><label className="text-[10px] text-slate-500">Tension artérielle</label><Input placeholder="12/8" value={bloodPressure} onChange={e => setBloodPressure(e.target.value)} className="text-sm h-8" /></div>
            <div><label className="text-[10px] text-slate-500">Poids (kg)</label><Input type="number" placeholder="60" value={weight} onChange={e => setWeight(e.target.value)} className="text-sm h-8" /></div>
            <div><label className="text-[10px] text-slate-500">MUAC (mm)</label><Input type="number" placeholder="130" value={muac} onChange={e => setMuac(e.target.value)} className="text-sm h-8" /></div>
          </div>
        </CardContent>
      </Card>

      {/* Actions & Diagnosis */}
      <Card className="border-slate-200/60 dark:border-slate-800/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Actions & Diagnostic</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-[10px] text-slate-500">Diagnostic</label>
            <Input placeholder="Diagnostic..." value={diagnosis} onChange={e => setDiagnosis(e.target.value)} className="text-sm h-8" />
          </div>
          <div>
            <label className="text-[10px] text-slate-500">Actions effectuées</label>
            <div className="flex gap-2 mb-2">
              <Input placeholder="Action..." value={actionInput} onChange={e => setActionInput(e.target.value)} className="text-sm h-8" onKeyDown={e => { if (e.key === 'Enter') addAction() }} />
              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={addAction}><Plus className="size-3" /></Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {actions.map(a => (
                <Badge key={a} variant="secondary" className="text-[10px]">{a}</Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" checked={needsReferral} onChange={e => setNeedsReferral(e.target.checked)} className="accent-teal-600" />
            <label className="text-xs text-slate-700 dark:text-slate-300">Référence nécessaire</label>
          </div>

          {needsReferral && (
            <div className="space-y-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
              <Input placeholder="Motif de référence" value={referralReason} onChange={e => setReferralReason(e.target.value)} className="text-sm h-8" />
              <Input placeholder="Destination" value={referralDestination} onChange={e => setReferralDestination(e.target.value)} className="text-sm h-8" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex gap-3">
        <Button className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-600 text-white" onClick={handleSubmit}>
          <Save className="size-4 mr-2" /> Enregistrer
        </Button>
        <Button variant="outline" className="flex-1">
          <WifiOff className="size-4 mr-2" /> Sauvegarder hors ligne
        </Button>
      </div>
    </motion.div>
  )
}
