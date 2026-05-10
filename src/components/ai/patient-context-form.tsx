'use client'

import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PatientContext } from '@/lib/data-store'

/* ─────────── Props ─────────── */

interface PatientContextFormProps {
  value: PatientContext
  onChange: (ctx: PatientContext) => void
}

/* ─────────── Preset Conditions ─────────── */

const commonConditions = ['Diabète', 'Hypertension', 'VIH', 'Drépanocytose', 'Asthme', 'Tuberculose', 'Hépatite B', 'Insuffisance rénale', 'Épilepsie', 'Cardiopathie']
const commonAllergies = ['Pénicilline', 'Sulfamides', 'Aspirine', 'Ibuprofène', 'Contraste iodé', 'Latex']

/* ─────────── Component ─────────── */

export function PatientContextForm({ value, onChange }: PatientContextFormProps) {
  const [customCondition, setCustomCondition] = React.useState('')
  const [customAllergy, setCustomAllergy] = React.useState('')
  const [customMedication, setCustomMedication] = React.useState('')

  const update = (updates: Partial<PatientContext>) => {
    onChange({ ...value, ...updates })
  }

  const addCondition = (condition: string) => {
    if (!value.conditions.includes(condition)) {
      update({ conditions: [...value.conditions, condition] })
    }
  }

  const removeCondition = (condition: string) => {
    update({ conditions: value.conditions.filter(c => c !== condition) })
  }

  const addAllergy = (allergy: string) => {
    if (!value.allergies.includes(allergy)) {
      update({ allergies: [...value.allergies, allergy] })
    }
  }

  const removeAllergy = (allergy: string) => {
    update({ allergies: value.allergies.filter(a => a !== allergy) })
  }

  const addMedication = (medication: string) => {
    if (!value.medications.includes(medication)) {
      update({ medications: [...value.medications, medication] })
    }
  }

  const removeMedication = (medication: string) => {
    update({ medications: value.medications.filter(m => m !== medication) })
  }

  return (
    <div className="space-y-4">
      {/* Basic info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Âge *</Label>
          <Input
            type="number"
            placeholder="Âge"
            value={value.age || ''}
            onChange={e => update({ age: Number(e.target.value) || 0 })}
            className="h-9"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Sexe *</Label>
          <Select value={value.gender} onValueChange={(v) => update({ gender: v as 'M' | 'F' })}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="M">Masculin</SelectItem>
              <SelectItem value="F">Féminin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Poids (kg)</Label>
          <Input
            type="number"
            placeholder="Poids"
            value={value.weight || ''}
            onChange={e => update({ weight: Number(e.target.value) || undefined })}
            className="h-9"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Taille (cm)</Label>
          <Input
            type="number"
            placeholder="Taille"
            value={value.height || ''}
            onChange={e => update({ height: Number(e.target.value) || undefined })}
            className="h-9"
          />
        </div>
      </div>

      {/* Pregnancy */}
      {value.gender === 'F' && (
        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-pink-50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-800">
          <Switch
            checked={value.isPregnant}
            onCheckedChange={(checked) => update({ isPregnant: checked })}
          />
          <Label className="text-xs text-pink-700 dark:text-pink-300">Enceinte</Label>
        </div>
      )}

      {/* Pre-existing conditions */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">Antécédents / Pathologies</Label>
        <div className="flex flex-wrap gap-1.5 mb-1.5">
          {commonConditions.map(c => (
            <button
              key={c}
              onClick={() => value.conditions.includes(c) ? removeCondition(c) : addCondition(c)}
              className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${
                value.conditions.includes(c)
                  ? 'bg-teal-500 text-white border-teal-500'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-600'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        {value.conditions.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {value.conditions.map(c => (
              <Badge key={c} variant="secondary" className="text-[10px] gap-1 pr-1">
                {c}
                <button onClick={() => removeCondition(c)}><X className="size-2.5" /></button>
              </Badge>
            ))}
          </div>
        )}
        <div className="flex gap-1.5">
          <Input placeholder="Autre pathologie..." value={customCondition} onChange={e => setCustomCondition(e.target.value)} onKeyDown={e => e.key === 'Enter' && customCondition && (addCondition(customCondition), setCustomCondition(''))} className="h-8 text-xs" />
          <Button variant="ghost" size="icon" className="size-8" onClick={() => { if (customCondition) { addCondition(customCondition); setCustomCondition('') } }}><Plus className="size-3" /></Button>
        </div>
      </div>

      {/* Current medications */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">Médicaments actuels</Label>
        {value.medications.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {value.medications.map(m => (
              <Badge key={m} variant="secondary" className="text-[10px] gap-1 pr-1 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                {m}
                <button onClick={() => removeMedication(m)}><X className="size-2.5" /></button>
              </Badge>
            ))}
          </div>
        )}
        <div className="flex gap-1.5">
          <Input placeholder="Ajouter un médicament..." value={customMedication} onChange={e => setCustomMedication(e.target.value)} onKeyDown={e => e.key === 'Enter' && customMedication && (addMedication(customMedication), setCustomMedication(''))} className="h-8 text-xs" />
          <Button variant="ghost" size="icon" className="size-8" onClick={() => { if (customMedication) { addMedication(customMedication); setCustomMedication('') } }}><Plus className="size-3" /></Button>
        </div>
      </div>

      {/* Allergies */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">Allergies connues</Label>
        <div className="flex flex-wrap gap-1.5 mb-1.5">
          {commonAllergies.map(a => (
            <button
              key={a}
              onClick={() => value.allergies.includes(a) ? removeAllergy(a) : addAllergy(a)}
              className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${
                value.allergies.includes(a)
                  ? 'bg-red-500 text-white border-red-500'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-600'
              }`}
            >
              {a}
            </button>
          ))}
        </div>
        {value.allergies.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {value.allergies.map(a => (
              <Badge key={a} variant="secondary" className="text-[10px] gap-1 pr-1 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800">
                {a}
                <button onClick={() => removeAllergy(a)}><X className="size-2.5" /></button>
              </Badge>
            ))}
          </div>
        )}
        <div className="flex gap-1.5">
          <Input placeholder="Autre allergie..." value={customAllergy} onChange={e => setCustomAllergy(e.target.value)} onKeyDown={e => e.key === 'Enter' && customAllergy && (addAllergy(customAllergy), setCustomAllergy(''))} className="h-8 text-xs" />
          <Button variant="ghost" size="icon" className="size-8" onClick={() => { if (customAllergy) { addAllergy(customAllergy); setCustomAllergy('') } }}><Plus className="size-3" /></Button>
        </div>
      </div>

      {/* Travel & Vaccination */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Voyages récents</Label>
          <Input
            placeholder="Ex: Zone forestière, N'Zérékoré..."
            value={value.recentTravel}
            onChange={e => update({ recentTravel: e.target.value })}
            className="h-9"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Statut vaccinal</Label>
          <Select value={value.vaccinationStatus} onValueChange={(v) => update({ vaccinationStatus: v })}>
            <SelectTrigger className="h-9"><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="À jour">À jour</SelectItem>
              <SelectItem value="Partiel">Partiel</SelectItem>
              <SelectItem value="Non vacciné">Non vacciné</SelectItem>
              <SelectItem value="Inconnu">Inconnu</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
