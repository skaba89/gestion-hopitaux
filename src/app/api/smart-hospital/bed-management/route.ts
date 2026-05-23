import { NextRequest, NextResponse } from 'next/server'
import { analyzeBedOccupancy } from '@/lib/smart-hospital/bed-management'
import { auditEvent, getRequestAuditContext } from '@/lib/audit'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const snapshots = Array.isArray(body?.snapshots) ? body.snapshots : []

    const insights = analyzeBedOccupancy(snapshots)

    await auditEvent({
      ...getRequestAuditContext(request),
      action: 'SMART_BED_ANALYSIS',
      module: 'smart-hospital',
      entity: 'BedManagement',
      severity: insights.some(i => i.severity === 'CRITICAL')
        ? 'CRITICAL'
        : insights.some(i => i.severity === 'WARNING')
          ? 'WARNING'
          : 'INFO',
      description: 'Analyse intelligente de la saturation des lits hospitaliers.',
      newValue: {
        services: insights.length,
        criticalServices: insights.filter(i => i.severity === 'CRITICAL').length,
      },
    })

    return NextResponse.json({
      success: true,
      data: insights,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Bed management analysis failed.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
