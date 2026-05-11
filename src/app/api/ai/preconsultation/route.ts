// HealthFlow Africa - AI Pre-Consultation API
// POST: Submit patient questionnaire, get AI-prepared consultation summary

import { NextRequest, NextResponse } from 'next/server'
import { secureApiHandler } from '@/lib/api-middleware'

interface PreConsultationQuestionnaire {
  patientId: string
  patientName: string
  patientAge: number
  patientGender: string
  chiefComplaint: string
  duration: string
  associatedSymptoms: string[]
  severityScale: number // 1-10
  previousSimilarEpisodes: boolean
  currentMedications: string[]
  allergies: string[]
  additionalNotes?: string
}

const handlePost = async (request: NextRequest) => {
  try {
    const questionnaire: PreConsultationQuestionnaire = await request.json()

    // Try to use AI for analysis
    let aiSummary: Record<string, unknown> | null = null

    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default
      const zai = await ZAI.create()

      const prompt = `Tu es un assistant médical pour un système hospitalier en Guinée. Analyse le questionnaire de pré-consultation suivant et prépare un résumé structuré pour le médecin.

Patient: ${questionnaire.patientName}, ${questionnaire.patientAge} ans, ${questionnaire.patientGender}
Motif principal: ${questionnaire.chiefComplaint}
Durée: ${questionnaire.duration}
Symptômes associés: ${questionnaire.associatedSymptoms.join(', ')}
Sévérité (1-10): ${questionnaire.severityScale}
Épisodes antérieurs similaires: ${questionnaire.previousSimilarEpisodes ? 'Oui' : 'Non'}
Médicaments actuels: ${questionnaire.currentMedications.join(', ') || 'Aucun'}
Allergies: ${questionnaire.allergies.join(', ') || 'Aucune'}
Notes: ${questionnaire.additionalNotes || 'Aucune'}

Génère un résumé JSON avec:
- summary: résumé concis du motif de consultation
- keyFindings: points clés à noter (array)
- suggestedQuestions: questions suggérées pour le médecin (array)
- relevantHistory: éléments d'antécédents pertinents (array)
- possibleDiagnoses: diagnostics à considérer avec niveau de confiance (array of {name, confidence, urgency})
- redFlags: signes d'alerte éventuels (array)
- recommendedExams: examens recommandés (array)`

      const completion = await zai.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1000,
      })

      const content = completion.choices?.[0]?.message?.content || ''
      // Try to parse JSON from response
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          aiSummary = JSON.parse(jsonMatch[0])
        }
      } catch {
        aiSummary = { rawContent: content }
      }
    } catch {
      // AI not available, generate a basic summary
    }

    // Generate fallback summary if AI failed
    const summary = aiSummary || {
      summary: `${questionnaire.patientName} (${questionnaire.patientAge} ans, ${questionnaire.patientGender}) consulte pour: ${questionnaire.chiefComplaint} depuis ${questionnaire.duration}. Sévérité: ${questionnaire.severityScale}/10.`,
      keyFindings: [
        `Motif principal: ${questionnaire.chiefComplaint}`,
        `Durée: ${questionnaire.duration}`,
        `Sévérité: ${questionnaire.severityScale}/10`,
        ...questionnaire.associatedSymptoms.map(s => `Symptôme associé: ${s}`),
      ],
      suggestedQuestions: [
        'Décrivez le début des symptômes',
        'Y a-t-il des facteurs déclenchants ?',
        'Avez-vous voyagé récemment ?',
        'Y a-t-il des cas similaires dans votre entourage ?',
      ],
      relevantHistory: [
        ...(questionnaire.previousSimilarEpisodes ? ['Épisodes antérieurs similaires rapportés'] : []),
        ...(questionnaire.currentMedications.length > 0 ? [`Médicaments actuels: ${questionnaire.currentMedications.join(', ')}`] : []),
        ...(questionnaire.allergies.length > 0 ? [`Allergies: ${questionnaire.allergies.join(', ')}`] : []),
      ],
      possibleDiagnoses: [
        { name: 'À déterminer par le médecin', confidence: 0, urgency: questionnaire.severityScale >= 7 ? 'Élevé' : 'Modéré' },
      ],
      redFlags: questionnaire.severityScale >= 8 ? ['Sévérité élevée — évaluation urgente recommandée'] : [],
      recommendedExams: ['Examen clinique complet', 'Constantes vitales'],
    }

    return NextResponse.json({
      success: true,
      data: {
        id: `PRECONS-${Date.now()}`,
        patientId: questionnaire.patientId,
        questionnaire,
        summary,
        generatedAt: new Date().toISOString(),
        isAIGenerated: !!aiSummary,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Erreur lors de l\'analyse' }, { status: 500 })
  }
}

export const POST = secureApiHandler(handlePost, {
  permission: { resource: 'ai', action: 'diagnostic' },
  audit: { resource: 'ai', action: 'preconsultation' },
  rateLimit: { maxRequests: 10, windowMs: 60000 },
})
