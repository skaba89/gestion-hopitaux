import { NextRequest, NextResponse } from 'next/server'
import { evaluateTriage, type TriageInput } from '@/lib/smart-hospital/clinical-ai'
import { auditEvent, getRequestAuditContext } from '@/lib/audit'

export const dynamic = 'force-dynamic'

function isTriageInput(value: unknown): value is TriageInput {
  return typeof value === 'object' && value !== null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!isTriageInput(body)) {
      return NextResponse.json(
        { error: 'Payload de triage invalide.' },
        { status: 400 },
      )
    }

    const result = evaluateTriage(body)

    await auditEvent({
      ...getRequestAuditContext(request),
      action: 'AI_TRIAGE',
      module: 'smart-hospital',
      entity: 'ClinicalTriage',
      description: `Triage IA exécuté avec niveau ${result.riskLevel}`,
      severity: result.riskLevel === 'CRITICAL' ? 'CRITICAL' : result.riskLevel === 'HIGH' ? 'WARNING' : 'INFO',
      newValue: {
        riskLevel: result.riskLevel,
        score: result.score,
        signalCount: result.signals.length,
      },
    })

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Erreur pendant le triage intelligent.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
