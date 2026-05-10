'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Plus, Thermometer, Brain, Wind, Utensils, Droplets, Hand, Bone, Baby } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

/* ─────────── Symptom Categories ─────────── */

interface SymptomItem {
  name: string
  category: string
}

const symptomCategories: { name: string; icon: React.ComponentType<{ className?: string }>; symptoms: string[] }[] = [
  { name: 'Généraux', icon: Thermometer, symptoms: ['Fièvre', 'Fatigue', 'Perte de poids', 'Sueurs nocturnes', 'Frissons', 'Malaise général'] },
  { name: 'Tête', icon: Brain, symptoms: ['Céphalées', 'Vertiges', 'Vision floue', 'Confusion', 'Photophobie', 'Raideur de nuque'] },
  { name: 'Respiratoire', icon: Wind, symptoms: ['Toux', 'Essoufflement', 'Douleur thoracique', 'Sibilants', 'Hémoptysie', 'Congestion nasale'] },
  { name: 'Digestif', icon: Utensils, symptoms: ['Nausées', 'Vomissements', 'Diarrhée', 'Douleur abdominale', 'Constipation', 'Selles sanglantes'] },
  { name: 'Urinaire', icon: Droplets, symptoms: ['Brûlures mictionnelles', 'Urine foncée', 'Mictions fréquentes', 'Lombalgie'] },
  { name: 'Cutané', icon: Hand, symptoms: ['Éruption cutanée', 'Démangeaisons', 'Jaunisse', 'Ulcères', 'Œdèmes'] },
  { name: 'Musculosquelettique', icon: Bone, symptoms: ['Douleurs articulaires', 'Faiblesse musculaire', 'Raideur matinale', 'Douleur osseuse'] },
  { name: 'Pédiatrique', icon: Baby, symptoms: ['Convulsions', 'Léthargie', 'Refus de téter', 'Pleurs continus', 'Fontaine bombée'] },
]

const allSymptoms: SymptomItem[] = symptomCategories.flatMap(cat =>
  cat.symptoms.map(name => ({ name, category: cat.name }))
)

/* ─────────── Duration Labels ─────────── */

type Duration = 'aigu' | 'subaigu' | 'chronique'

const durationLabels: Record<Duration, string> = {
  aigu: 'Aigu (< 7 jours)',
  subaigu: 'Subaigu (7-30 jours)',
  chronique: 'Chronique (> 30 jours)',
}

/* ─────────── Props ─────────── */

export interface SelectedSymptom {
  name: string
  duration: Duration
  severity: number
}

interface SymptomSelectorProps {
  selected: SelectedSymptom[]
  onChange: (symptoms: SelectedSymptom[]) => void
}

/* ─────────── Component ─────────── */

export function SymptomSelector({ selected, onChange }: SymptomSelectorProps) {
  const [search, setSearch] = useState('')
  const [customSymptom, setCustomSymptom] = useState('')
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [editingSymptom, setEditingSymptom] = useState<string | null>(null)

  const filteredSymptoms = useMemo(() => {
    if (!search.trim()) return allSymptoms
    const q = search.toLowerCase()
    return allSymptoms.filter(s => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q))
  }, [search])

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return symptomCategories
    const q = search.toLowerCase()
    return symptomCategories.filter(cat =>
      cat.name.toLowerCase().includes(q) || cat.symptoms.some(s => s.toLowerCase().includes(q))
    )
  }, [search])

  const addSymptom = (name: string) => {
    if (selected.some(s => s.name === name)) return
    onChange([...selected, { name, duration: 'aigu', severity: 5 }])
  }

  const removeSymptom = (name: string) => {
    onChange(selected.filter(s => s.name !== name))
  }

  const updateSymptom = (name: string, updates: Partial<SelectedSymptom>) => {
    onChange(selected.map(s => s.name === name ? { ...s, ...updates } : s))
  }

  const addCustomSymptom = () => {
    if (!customSymptom.trim()) return
    addSymptom(customSymptom.trim())
    setCustomSymptom('')
  }

  const toggleCategory = (name: string) => {
    setExpandedCategory(expandedCategory === name ? null : name)
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
        <Input
          placeholder="Rechercher un symptôme..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Custom symptom input */}
      <div className="flex gap-2">
        <Input
          placeholder="Symptôme personnalisé..."
          value={customSymptom}
          onChange={e => setCustomSymptom(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addCustomSymptom()}
          className="flex-1"
        />
        <Button variant="outline" size="icon" onClick={addCustomSymptom} disabled={!customSymptom.trim()}>
          <Plus className="size-4" />
        </Button>
      </div>

      {/* Selected symptoms */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {selected.map(symptom => (
              <motion.div
                key={symptom.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Badge
                  className={`cursor-pointer pr-1 pl-2.5 py-1.5 text-xs font-medium gap-1.5 ${
                    symptom.severity >= 8 ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800' :
                    symptom.severity >= 5 ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' :
                    'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800'
                  }`}
                >
                  <span onClick={() => setEditingSymptom(editingSymptom === symptom.name ? null : symptom.name)}>{symptom.name}</span>
                  <span className="text-[9px] opacity-60">({durationLabels[symptom.duration].split(' ')[0]})</span>
                  <button onClick={() => removeSymptom(symptom.name)} className="ml-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 p-0.5">
                    <X className="size-3" />
                  </button>
                </Badge>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Symptom categories */}
      <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
        {filteredCategories.map(category => {
          const CategoryIcon = category.icon
          const isExpanded = expandedCategory === category.name
          const categorySymptoms = search.trim()
            ? category.symptoms.filter(s => s.toLowerCase().includes(search.toLowerCase()))
            : category.symptoms

          return (
            <div key={category.name} className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              <button
                onClick={() => toggleCategory(category.name)}
                className="w-full flex items-center gap-2 p-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <CategoryIcon className="size-4 text-teal-600 dark:text-teal-400 shrink-0" />
                <span className="text-sm font-medium text-slate-900 dark:text-white flex-1">{category.name}</span>
                <Badge variant="secondary" className="text-[9px] h-5">{categorySymptoms.length}</Badge>
              </button>

              <AnimatePresence>
                {(isExpanded || search.trim()) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-wrap gap-1.5 p-2.5 pt-0">
                      {categorySymptoms.map(symptom => {
                        const isSelected = selected.some(s => s.name === symptom)
                        return (
                          <button
                            key={symptom}
                            onClick={() => isSelected ? removeSymptom(symptom) : addSymptom(symptom)}
                            className={`text-xs px-2.5 py-1.5 rounded-full border transition-all ${
                              isSelected
                                ? 'bg-teal-500 text-white border-teal-500 shadow-sm'
                                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-teal-300 dark:hover:border-teal-600'
                            }`}
                          >
                            {symptom}
                          </button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* Edit symptom details */}
      <AnimatePresence>
        {editingSymptom && (() => {
          const symptom = selected.find(s => s.name === editingSymptom)
          if (!symptom) return null
          return (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3"
            >
              <p className="text-sm font-medium text-slate-900 dark:text-white">{symptom.name}</p>
              <div className="space-y-2">
                <Label className="text-xs">Durée</Label>
                <div className="flex gap-2">
                  {(['aigu', 'subaigu', 'chronique'] as Duration[]).map(d => (
                    <button
                      key={d}
                      onClick={() => updateSymptom(symptom.name, { duration: d })}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        symptom.duration === d
                          ? 'bg-teal-500 text-white border-teal-500'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-600'
                      }`}
                    >
                      {durationLabels[d]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Sévérité : {symptom.severity}/10</Label>
                <Slider
                  value={[symptom.severity]}
                  onValueChange={([v]) => updateSymptom(symptom.name, { severity: v })}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-[9px] text-slate-400">
                  <span>Léger</span>
                  <span>Modéré</span>
                  <span>Sévère</span>
                </div>
              </div>
            </motion.div>
          )
        })()}
      </AnimatePresence>
    </div>
  )
}
