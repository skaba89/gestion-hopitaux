import type { EpidemiologicalAlert, SurveillanceDataPoint, OutbreakPrediction, SurveillanceAlertLevel } from '@/lib/data-store'

/* ─────────── Types ─────────── */

export interface TrendAnalysis {
  disease: string
  trend: 'hausse' | 'stable' | 'baisse'
  percentChange: number
  dataPoints: SurveillanceDataPoint[]
}

export interface Anomaly {
  id: string
  disease: string
  location: string
  date: string
  expectedCount: number
  actualCount: number
  deviation: number
  alertLevel: SurveillanceAlertLevel
}

/* ─────────── Build Prompts ─────────── */

export function buildSurveillancePrompt(data: SurveillanceDataPoint[], dateRange: string): { system: string; user: string } {
  const system = `Tu es un épidémiologiste IA spécialisé dans la surveillance des maladies en Afrique de l'Ouest, particulièrement en Guinée. Tu analyses les données de surveillance pour détecter des tendances, des anomalies et prédire des épidémies.

Contexte guinéen :
- Saisons : saison sèche (novembre-mai), saison des pluies (juin-octobre)
- Paludisme : pic pendant et après la saison des pluies
- Choléra : associé aux inondations en saison des pluies
- Méningite : pic en saison sèche (harmattan)
- Fièvre de Lassa : zone forestière de Guinée
- Rougeole : épidémies dans les zones à faible couverture vaccinale

Tu réponds en JSON avec la structure suivante :
{
  "trends": [{ "disease": "string", "trend": "hausse|stable|baisse", "percentChange": number }],
  "anomalies": [{ "disease": "string", "location": "string", "description": "string", "severity": "VEILLE|ALERTE|ÉPIDÉMIE" }],
  "predictions": [{ "disease": "string", "riskScore": number, "probability": number, "predictedPeakDate": "string", "confidence": number, "preventiveActions": ["string"] }]
}`

  const user = `Analyse les données de surveillance épidémiologique suivantes pour la période ${dateRange} :

${data.map(d => `${d.date} | ${d.disease} | ${d.location} | ${d.caseCount} cas | ${d.deathCount} décès | ${d.alertLevel}`).join('\n')}

Identifie les tendances, anomalies et fais des prédictions pour les 4 prochaines semaines.`

  return { system, user }
}

/* ─────────── Analyze Trends ─────────── */

export function analyzeTrends(data: SurveillanceDataPoint[], _dateRange?: string): TrendAnalysis[] {
  const diseases = [...new Set(data.map(d => d.disease))]
  const trends: TrendAnalysis[] = []

  for (const disease of diseases) {
    const diseaseData = data.filter(d => d.disease === disease).sort((a, b) => a.date.localeCompare(b.date))
    if (diseaseData.length < 2) continue

    const firstHalf = diseaseData.slice(0, Math.ceil(diseaseData.length / 2))
    const secondHalf = diseaseData.slice(Math.ceil(diseaseData.length / 2))

    const avgFirst = firstHalf.reduce((sum, d) => sum + d.caseCount, 0) / firstHalf.length
    const avgSecond = secondHalf.reduce((sum, d) => sum + d.caseCount, 0) / secondHalf.length

    const percentChange = avgFirst > 0 ? Math.round(((avgSecond - avgFirst) / avgFirst) * 100) : 0

    let trend: TrendAnalysis['trend'] = 'stable'
    if (percentChange > 15) trend = 'hausse'
    else if (percentChange < -15) trend = 'baisse'

    trends.push({
      disease,
      trend,
      percentChange,
      dataPoints: diseaseData,
    })
  }

  return trends
}

/* ─────────── Detect Anomalies ─────────── */

export function detectAnomalies(data: SurveillanceDataPoint[]): Anomaly[] {
  const diseases = [...new Set(data.map(d => d.disease))]
  const anomalies: Anomaly[] = []

  for (const disease of diseases) {
    const diseaseData = data.filter(d => d.disease === disease)
    if (diseaseData.length < 3) continue

    const avgCases = diseaseData.reduce((sum, d) => sum + d.caseCount, 0) / diseaseData.length
    const stdDev = Math.sqrt(diseaseData.reduce((sum, d) => sum + Math.pow(d.caseCount - avgCases, 2), 0) / diseaseData.length)

    for (const point of diseaseData) {
      const deviation = stdDev > 0 ? (point.caseCount - avgCases) / stdDev : 0
      if (deviation > 1.5) {
        let alertLevel: SurveillanceAlertLevel = 'VEILLE'
        if (deviation > 3) alertLevel = 'ÉPIDÉMIE'
        else if (deviation > 2) alertLevel = 'ALERTE'

        anomalies.push({
          id: `ANO-${disease}-${point.date}`,
          disease,
          location: point.location,
          date: point.date,
          expectedCount: Math.round(avgCases),
          actualCount: point.caseCount,
          deviation: Math.round(deviation * 100) / 100,
          alertLevel,
        })
      }
    }
  }

  return anomalies.sort((a, b) => b.deviation - a.deviation)
}

/* ─────────── Generate Alert ─────────── */

export function generateAlert(anomaly: Anomaly): Partial<EpidemiologicalAlert> {
  const diseaseActions: Record<string, string[]> = {
    'Paludisme': ['Distribution moustiquaires', 'Stock TDR/ACT', 'Sensibilisation'],
    'Choléra': ['Centre traitement choléra', 'Purification eau', 'Vaccination orale', 'Signalement OMS'],
    'Méningite': ['Vaccination méningococcique', 'Surveillance renforcée', 'Chimioprophylaxie contacts'],
    'Rougeole': ['Vaccination riposte', 'Recherche active cas', 'Isolation'],
    'Fièvre de Lassa': ['Confirmation laboratoire', 'Traçage contacts', 'Protection personnel'],
  }

  return {
    disease: anomaly.disease,
    location: anomaly.location,
    alertLevel: anomaly.alertLevel,
    caseCount: anomaly.actualCount,
    recommendedActions: diseaseActions[anomaly.disease] || ['Surveillance renforcée', 'Signalement aux autorités'],
    status: 'Actif',
  }
}

/* ─────────── Predict Outbreak ─────────── */

export function predictOutbreak(historicalData: SurveillanceDataPoint[]): OutbreakPrediction[] {
  const diseases = [...new Set(historicalData.map(d => d.disease))]
  const predictions: OutbreakPrediction[] = []

  const currentMonth = new Date().getMonth() + 1 // 1-12
  const isRainySeason = currentMonth >= 6 && currentMonth <= 10

  for (const disease of diseases) {
    const diseaseData = historicalData.filter(d => d.disease === disease)
    const latestData = diseaseData[diseaseData.length - 1]
    if (!latestData) continue

    let riskScore = 30
    let probability = 0.2
    const preventiveActions: string[] = []

    switch (disease) {
      case 'Paludisme':
        riskScore = isRainySeason ? 85 : 45
        probability = isRainySeason ? 0.78 : 0.35
        preventiveActions.push('Distribution moustiquaires imprégnées', 'Pulvérisation intra-domiciliaire')
        if (isRainySeason) preventiveActions.push('Prophylaxie saisonnière enfants')
        break
      case 'Choléra':
        riskScore = isRainySeason ? 92 : 35
        probability = isRainySeason ? 0.88 : 0.25
        preventiveActions.push('Chloration points d\'eau', 'Sensibilisation hygiène')
        if (isRainySeason) preventiveActions.push('Vaccination orale de masse')
        break
      case 'Méningite':
        riskScore = !isRainySeason ? 65 : 25
        probability = !isRainySeason ? 0.5 : 0.15
        preventiveActions.push('Vaccination méningococcique', 'Surveillance renforcée')
        break
      case 'Fièvre de Lassa':
        riskScore = 55
        probability = 0.42
        preventiveActions.push('Lutte anti-rongeurs', 'Hygiène alimentaire')
        break
      case 'Rougeole':
        riskScore = 70
        probability = 0.65
        preventiveActions.push('Campagne vaccination rattrapage', 'Recherche active cas')
        break
      default:
        riskScore = 30
        probability = 0.25
        preventiveActions.push('Surveillance standard')
    }

    // Adjust based on trend
    const trendData = diseaseData.slice(-3)
    if (trendData.length >= 2) {
      const increasing = trendData[trendData.length - 1].caseCount > trendData[0].caseCount
      if (increasing) {
        riskScore = Math.min(99, riskScore + 10)
        probability = Math.min(0.99, probability + 0.1)
      }
    }

    const peakMonth = disease === 'Paludisme' ? 9 : disease === 'Choléra' ? 8 : disease === 'Méningite' ? 3 : 7
    const peakYear = peakMonth > currentMonth ? new Date().getFullYear() : new Date().getFullYear() + 1

    predictions.push({
      disease,
      riskScore,
      probability,
      predictedPeakDate: `${peakYear}-${String(peakMonth).padStart(2, '0')}-15`,
      confidence: 0.55 + (diseaseData.length / 20) * 0.2,
      preventiveActions,
    })
  }

  return predictions.sort((a, b) => b.riskScore - a.riskScore)
}
