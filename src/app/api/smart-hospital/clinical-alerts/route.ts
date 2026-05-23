import { NextRequest, NextResponse } from 'next/server'
import { analyzeClinicalAlerts } from '@/lib/smart-hospital/clinical-alerts'
import { auditEvent, getRequestAuditContext } from '@/lib/audit'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const alerts = analyzeClinicalAlerts(body)

    await auditEvent({
      ...getRequestAuditContext(request),
      action: 'SMART_ALERT_ANALYSIS',
      module: 'smart-hospital',
      entity: 'ClinicalAlerts',
      severity: alerts.some(a => a.severity === 'CRITICAL') ? 'CRITICAL' : alerts.some(a => a.severity === 'HIGH') ? 'WARNING' : 'INFO',
      description: 'Analyse automatique des constantes vitales.',
      newValue: {
        alertsCount: alerts.length,
        severities: alerts.map(a => a.severity),
      },
    })

    return NextResponse.json({
      success: true,
      data: alerts,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Clinical alerts analysis failed.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
