export interface OCRMedicationLine {
  medicationName: string
  dosage?: string
  frequency?: string
  duration?: string
  confidence: number
}

export interface OCRPrescriptionResult {
  rawText: string
  medications: OCRMedicationLine[]
  warnings: string[]
}

const DOSAGE_PATTERN = /(\d+\s?(mg|g|ml|cp|comprimés|capsules))/i
const FREQUENCY_PATTERN = /(1x\/jour|2x\/jour|3x\/jour|matin|soir|toutes les \d+ heures)/i
const DURATION_PATTERN = /(\d+\s?(jours|semaines|mois))/i

export function extractPrescriptionData(rawText: string): OCRPrescriptionResult {
  const warnings: string[] = []
  const medications: OCRMedicationLine[] = []

  const lines = rawText
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)

  for (const line of lines) {
    const dosage = line.match(DOSAGE_PATTERN)?.[0]
    const frequency = line.match(FREQUENCY_PATTERN)?.[0]
    const duration = line.match(DURATION_PATTERN)?.[0]

    const medicationName = line
      .replace(DOSAGE_PATTERN, '')
      .replace(FREQUENCY_PATTERN, '')
      .replace(DURATION_PATTERN, '')
      .replace(/[-–:]/g, ' ')
      .trim()

    if (!medicationName || medicationName.length < 3) {
      continue
    }

    medications.push({
      medicationName,
      dosage,
      frequency,
      duration,
      confidence: dosage ? 0.92 : 0.71,
    })
  }

  if (medications.length === 0) {
    warnings.push('Aucun médicament détecté automatiquement.')
  }

  if (rawText.length < 20) {
    warnings.push('Qualité OCR faible ou document incomplet.')
  }

  return {
    rawText,
    medications,
    warnings,
  }
}
