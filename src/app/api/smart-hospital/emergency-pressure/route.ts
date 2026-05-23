import { NextRequest, NextResponse } from 'next/server'
import { analyzeEmergencyPressure } from '@/lib/smart-hospital/emergency-pressure'
import { auditEvent, getRequestAuditContext } from '@/lib/audit'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const result = analyzeEmergencyPressure(body)

    await auditEvent({
      ...getRequestAuditContext(request),
      action: 'EMERGENCY_PRESSURE_ANALYSIS',
      module: 'smart-hospital',
      entity: 'EmergencyPressure',
      severity:
        result.level === 'CRITICAL'
          ? 'CRITICAL'
          : result.level === 'SATURATED'
            ? 'WARNING'
            : 'INFO',
      description: `Analyse pression urgences - niveau ${result.level}`,
      newValue: {
        level: result.level,
        score: result.score,
      },
    })

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Emergency pressure analysis failed.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
