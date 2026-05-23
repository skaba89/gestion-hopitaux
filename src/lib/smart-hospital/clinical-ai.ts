export type ClinicalRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface ClinicalSignal {
  code: string
  label: string
  value?: string | number | boolean
  weight: number
  risk: ClinicalRiskLevel
}

export interface TriageInput {
  age?: number
  temperatureC?: number
  systolicBloodPressure?: number
  diastolicBloodPressure?: number
  heartRate?: number
  respiratoryRate?: number
  oxygenSaturation?: number
  symptoms?: string[]
  pregnancyWeeks?: number
}

export interface TriageResult {
  riskLevel: ClinicalRiskLevel
  score: number
  recommendedAction: string
  signals: ClinicalSignal[]
  disclaimer: string
}

const CRITICAL_SYMPTOMS = new Set([
  'chest_pain',
  'severe_bleeding',
  'loss_of_consciousness',
  'seizure',
  'severe_respiratory_distress',
  'stroke_signs',
])

const HIGH_RISK_SYMPTOMS = new Set([
  'persistent_fever',
  'dehydration',
  'severe_abdominal_pain',
  'pregnancy_bleeding',
  'confusion',
])

function levelFromScore(score: number): ClinicalRiskLevel {
  if (score >= 90) return 'CRITICAL'
  if (score >= 65) return 'HIGH'
  if (score >= 35) return 'MEDIUM'
  return 'LOW'
}

function actionFromLevel(level: ClinicalRiskLevel): string {
  switch (level) {
    case 'CRITICAL':
      return 'Orientation immédiate vers les urgences avec alerte équipe médicale.'
    case 'HIGH':
      return 'Priorité élevée. Consultation médicale rapide recommandée.'
    case 'MEDIUM':
      return 'Évaluation clinique standard avec surveillance rapprochée.'
    default:
      return 'Suivi standard. Réévaluer si aggravation des symptômes.'
  }
}

function addSignal(signals: ClinicalSignal[], signal: ClinicalSignal): number {
  signals.push(signal)
  return signal.weight
}

export function evaluateTriage(input: TriageInput): TriageResult {
  const signals: ClinicalSignal[] = []
  let score = 0

  if (input.oxygenSaturation !== undefined && input.oxygenSaturation < 90) {
    score += addSignal(signals, {
      code: 'spo2_critical',
      label: 'Saturation en oxygène très basse',
      value: input.oxygenSaturation,
      weight: 45,
      risk: 'CRITICAL',
    })
  } else if (input.oxygenSaturation !== undefined && input.oxygenSaturation < 94) {
    score += addSignal(signals, {
      code: 'spo2_low',
      label: 'Saturation en oxygène basse',
      value: input.oxygenSaturation,
      weight: 25,
      risk: 'HIGH',
    })
  }

  if (input.temperatureC !== undefined && input.temperatureC >= 39.5) {
    score += addSignal(signals, {
      code: 'high_fever',
      label: 'Fièvre élevée',
      value: input.temperatureC,
      weight: 20,
      risk: 'HIGH',
    })
  }

  if (input.systolicBloodPressure !== undefined && input.systolicBloodPressure < 90) {
    score += addSignal(signals, {
      code: 'hypotension',
      label: 'Hypotension',
      value: input.systolicBloodPressure,
      weight: 30,
      risk: 'HIGH',
    })
  }

  if (input.heartRate !== undefined && (input.heartRate > 130 || input.heartRate < 45)) {
    score += addSignal(signals, {
      code: 'abnormal_heart_rate',
      label: 'Fréquence cardiaque anormale',
      value: input.heartRate,
      weight: 25,
      risk: 'HIGH',
    })
  }

  if (input.respiratoryRate !== undefined && input.respiratoryRate > 30) {
    score += addSignal(signals, {
      code: 'tachypnea',
      label: 'Détresse respiratoire possible',
      value: input.respiratoryRate,
      weight: 30,
      risk: 'HIGH',
    })
  }

  for (const symptom of input.symptoms ?? []) {
    if (CRITICAL_SYMPTOMS.has(symptom)) {
      score += addSignal(signals, {
        code: `symptom_${symptom}`,
        label: `Symptôme critique détecté: ${symptom}`,
        value: true,
        weight: 50,
        risk: 'CRITICAL',
      })
    } else if (HIGH_RISK_SYMPTOMS.has(symptom)) {
      score += addSignal(signals, {
        code: `symptom_${symptom}`,
        label: `Symptôme à risque détecté: ${symptom}`,
        value: true,
        weight: 25,
        risk: 'HIGH',
      })
    }
  }

  if (input.pregnancyWeeks !== undefined && input.pregnancyWeeks >= 20 && input.systolicBloodPressure !== undefined && input.systolicBloodPressure >= 140) {
    score += addSignal(signals, {
      code: 'pregnancy_hypertension',
      label: 'Grossesse avec tension élevée',
      value: input.systolicBloodPressure,
      weight: 35,
      risk: 'HIGH',
    })
  }

  const riskLevel = levelFromScore(score)

  return {
    riskLevel,
    score,
    recommendedAction: actionFromLevel(riskLevel),
    signals,
    disclaimer: 'Aide à la décision uniquement. Ne remplace pas le jugement clinique d’un professionnel de santé.',
  }
}
