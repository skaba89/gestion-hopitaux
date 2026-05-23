import { db } from '@/lib/db'

export type AuditSeverity = 'INFO' | 'WARNING' | 'CRITICAL'

export interface AuditEventInput {
  userId?: string | null
  action: string
  module: string
  entity: string
  entityId?: string | null
  establishmentId?: string | null
  ipAddress?: string | null
  userAgent?: string | null
  oldValue?: unknown
  newValue?: unknown
  description?: string | null
  severity?: AuditSeverity
}

function safeJson(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined
  try {
    return JSON.stringify(value)
  } catch {
    return JSON.stringify({ serializationError: true })
  }
}

export async function auditEvent(input: AuditEventInput): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        userId: input.userId ?? undefined,
        action: input.action,
        module: input.module,
        entity: input.entity,
        entityId: input.entityId ?? undefined,
        establishmentId: input.establishmentId ?? undefined,
        ipAddress: input.ipAddress ?? undefined,
        userAgent: input.userAgent ?? undefined,
        oldValue: safeJson(input.oldValue),
        newValue: safeJson(input.newValue),
        description: input.description ?? undefined,
        severity: input.severity ?? 'INFO',
      },
    })
  } catch (error) {
    // Never block a medical workflow because audit logging failed.
    console.error('[audit] failed to write audit event', error)
  }
}

export function getRequestAuditContext(request: Request): Pick<AuditEventInput, 'ipAddress' | 'userAgent'> {
  return {
    ipAddress:
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      null,
    userAgent: request.headers.get('user-agent'),
  }
}

export function auditReadPatient(params: {
  userId?: string | null
  patientId: string
  establishmentId?: string | null
  request?: Request
}): Promise<void> {
  return auditEvent({
    ...(params.request ? getRequestAuditContext(params.request) : {}),
    userId: params.userId,
    action: 'READ',
    module: 'patients',
    entity: 'Patient',
    entityId: params.patientId,
    establishmentId: params.establishmentId,
    description: 'Consultation du dossier patient',
    severity: 'INFO',
  })
}

export function auditExportMedicalData(params: {
  userId?: string | null
  entity: string
  entityId?: string | null
  establishmentId?: string | null
  request?: Request
}): Promise<void> {
  return auditEvent({
    ...(params.request ? getRequestAuditContext(params.request) : {}),
    userId: params.userId,
    action: 'EXPORT',
    module: 'medical-records',
    entity: params.entity,
    entityId: params.entityId,
    establishmentId: params.establishmentId,
    description: 'Export de données médicales sensibles',
    severity: 'WARNING',
  })
}
