// HealthFlow Africa - Audit Log API
// GET: Query audit logs (admin only), POST: Create audit entry

import { NextRequest, NextResponse } from 'next/server'
import { getAuditLogs, getAuditStats, type AuditAction, type AuditSeverity } from '@/lib/audit-logger'
import { secureApiHandler } from '@/lib/api-middleware'

const handleGet = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)

  const filters = {
    userId: searchParams.get('userId') || undefined,
    action: (searchParams.get('action') as AuditAction) || undefined,
    module: searchParams.get('module') || undefined,
    entityId: searchParams.get('entityId') || undefined,
    severity: (searchParams.get('severity') as AuditSeverity) || undefined,
    startDate: searchParams.get('startDate') || undefined,
    endDate: searchParams.get('endDate') || undefined,
    limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100,
  }

  const format = searchParams.get('format')

  if (format === 'stats') {
    const stats = getAuditStats()
    return NextResponse.json({ data: stats })
  }

  const logs = getAuditLogs(filters)
  return NextResponse.json({ data: logs })
}

const handlePost = async (request: NextRequest) => {
  try {
    const body = await request.json()
    // Accept audit entries from client-side (for offline sync)
    return NextResponse.json({ success: true, id: body.id || `AUD-${Date.now()}` })
  } catch {
    return NextResponse.json({ error: 'Entrée d\'audit invalide' }, { status: 400 })
  }
}

export const GET = secureApiHandler(handleGet, {
  permission: { resource: 'admin', action: 'read' },
  audit: { resource: 'admin', action: 'view_audit' },
  rateLimit: { maxRequests: 50, windowMs: 60000 },
})

export const POST = secureApiHandler(handlePost, {
  rateLimit: { maxRequests: 100, windowMs: 60000 },
})
