export type EmergencyPressureLevel = 'NORMAL' | 'TENSE' | 'SATURATED' | 'CRITICAL'

export interface EmergencyPressureInput {
  waitingPatients: number
  criticalPatients: number
  availableDoctors: number
  availableNurses: number
  averageWaitingMinutes: number
  availableEmergencyBeds: number
}

export interface EmergencyPressureResult {
  level: EmergencyPressureLevel
  score: number
  message: string
  recommendations: string[]
}

export function analyzeEmergencyPressure(input: EmergencyPressureInput): EmergencyPressureResult {
  let score = 0
  const recommendations: string[] = []

  if (input.criticalPatients >= 5) {
    score += 35
    recommendations.push('Mobiliser immédiatement une équipe médicale supplémentaire.')
  }

  if (input.waitingPatients >= 30) {
    score += 25
    recommendations.push('Ouvrir un circuit de triage rapide pour réduire la file d’attente.')
  }

  if (input.averageWaitingMinutes >= 120) {
    score += 25
    recommendations.push('Prioriser les patients à risque et réorganiser le flux d’admission.')
  }

  if (input.availableEmergencyBeds <= 2) {
    score += 25
    recommendations.push('Déclencher le plan de délestage vers les services disponibles.')
  }

  if (input.availableDoctors <= 1 || input.availableNurses <= 2) {
    score += 20
    recommendations.push('Renforcer le personnel aux urgences.')
  }

  const level: EmergencyPressureLevel =
    score >= 90 ? 'CRITICAL' :
    score >= 65 ? 'SATURATED' :
    score >= 35 ? 'TENSE' :
    'NORMAL'

  const message =
    level === 'CRITICAL' ? 'Pression critique aux urgences.' :
    level === 'SATURATED' ? 'Urgences saturées, action rapide requise.' :
    level === 'TENSE' ? 'Tension importante aux urgences.' :
    'Situation maîtrisée aux urgences.'

  if (recommendations.length === 0) {
    recommendations.push('Maintenir la surveillance standard.')
  }

  return {
    level,
    score,
    message,
    recommendations,
  }
}
