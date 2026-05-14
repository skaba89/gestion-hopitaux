// HealthFlow Guinea - Audit Logger (v3)
// Centralized audit logging for security events, access control, and compliance
// Persists to PostgreSQL via Prisma + Redis buffer for batch writes
// CLIENT-SAFE: This module can be imported from both client and server.
// Actual persistence only happens on the server side.

export type AuditEventType =
  | 'ACCESS_GRANTED'
  | 'ACCESS_DENIED'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'PASSWORD_CHANGE'
  | 'ROLE_CHANGE'
  | 'DATA_EXPORT'
  | 'DATA_MODIFICATION'
  | 'CSRF_VIOLATION'
  | 'RATE_LIMIT_HIT'
  | 'SESSION_CREATED'
  | 'SESSION_DESTROYED'
  | 'ENCRYPTION_FAILURE'
  | 'SUSPICIOUS_ACTIVITY'

export type AuditAction =
  | 'CREATE' | 'READ' | 'UPDATE' | 'DELETE'
  | 'LOGIN' | 'LOGOUT' | 'ACCESS_DENIED'
  | 'EXPORT' | 'PRINT'
  | 'MFA_CHALLENGE' | 'MFA_SUCCESS' | 'MFA_FAILURE'
  | 'SESSION_EXPIRED' | 'PASSWORD_CHANGE' | 'ROLE_CHANGE' | 'PERMISSION_CHANGE'

export type AuditSeverity = 'INFO' | 'WARNING' | 'CRITICAL'

export interface AuditEntry {
  id: string
  timestamp: string
  createdAt: string
  eventType: AuditEventType
  action: AuditAction | string
  severity: AuditSeverity
  userId: string
  userName: string
  userRole: string
  resource: string
  module: string
  entityId?: string
  description: string
  details: string
  ip: string
  ipAddress: string
  success: boolean
}

// In-memory cache for recent entries (for real-time UI)
const recentEntries: AuditEntry[] = []
const MAX_RECENT_ENTRIES = 500

// Flag to track if we're on the server
const isServer = typeof window === 'undefined'

function generateAuditId(): string {
  // SECURITY FIX: Use crypto instead of Math.random for audit IDs
  try {
    const crypto = require('crypto')
    const randomPart = crypto.randomBytes(4).toString('hex')
    return `AUD-${Date.now()}-${randomPart}`
  } catch {
    // Fallback only if crypto is unavailable (should not happen on server)
    return `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  }
}

function determineSeverity(eventType: AuditEventType, success: boolean): AuditSeverity {
  if (['CSRF_VIOLATION', 'SUSPICIOUS_ACTIVITY', 'ENCRYPTION_FAILURE'].includes(eventType)) return 'CRITICAL'
  if (['ACCESS_DENIED', 'LOGIN_FAILED', 'RATE_LIMIT_HIT'].includes(eventType)) return 'WARNING'
  return 'INFO'
}

function determineAction(eventType: AuditEventType): AuditAction | string {
  const mapping: Record<string, AuditAction | string> = {
    'ACCESS_GRANTED': 'READ',
    'ACCESS_DENIED': 'ACCESS_DENIED',
    'LOGIN_SUCCESS': 'LOGIN',
    'LOGIN_FAILED': 'LOGIN',
    'LOGOUT': 'LOGOUT',
    'PASSWORD_CHANGE': 'PASSWORD_CHANGE',
    'ROLE_CHANGE': 'ROLE_CHANGE',
    'DATA_EXPORT': 'EXPORT',
    'DATA_MODIFICATION': 'UPDATE',
    'CSRF_VIOLATION': 'ACCESS_DENIED',
    'RATE_LIMIT_HIT': 'ACCESS_DENIED',
    'SESSION_CREATED': 'LOGIN',
    'SESSION_DESTROYED': 'LOGOUT',
    'ENCRYPTION_FAILURE': 'ACCESS_DENIED',
    'SUSPICIOUS_ACTIVITY': 'ACCESS_DENIED',
  }
  return mapping[eventType] || eventType
}

/**
 * Write audit entry to PostgreSQL and Redis buffer (server-side only)
 */
async function persistAuditEntry(entry: AuditEntry): Promise<void> {
  // Add to recent entries cache
  recentEntries.unshift(entry)
  if (recentEntries.length > MAX_RECENT_ENTRIES) {
    recentEntries.length = MAX_RECENT_ENTRIES
  }

  // Only persist on server side
  if (!isServer) return

  try {
    // Use dynamic require to prevent webpack from following the import
    const { db } = require('@/lib/db') as typeof import('@/lib/db')

    await db.auditLog.create({
      data: {
        userId: entry.userId !== 'unknown' && entry.userId !== 'system' ? entry.userId : null,
        action: entry.action as string,
        module: entry.module,
        entity: entry.resource,
        entityId: entry.entityId,
        ipAddress: entry.ip,
        description: entry.description,
        severity: entry.severity,
        newValue: entry.details,
      },
    })
  } catch (error) {
    // If DB write fails, try Redis buffer
    try {
      const { RedisAuditBuffer } = require('@/lib/redis') as typeof import('@/lib/redis')
      const buffer = new RedisAuditBuffer()
      await buffer.push(JSON.stringify(entry))
    } catch {
      console.warn('[AuditLogger] Failed to persist entry:', (error as Error).message)
    }
  }
}

/**
 * Flush buffered audit entries from Redis to PostgreSQL
 */
export async function flushAuditBuffer(): Promise<number> {
  if (!isServer) return 0

  try {
    const { db } = require('@/lib/db') as typeof import('@/lib/db')
    const { RedisAuditBuffer } = require('@/lib/redis') as typeof import('@/lib/redis')
    const buffer = new RedisAuditBuffer()
    const entries = await buffer.flush(50)
    if (entries.length === 0) return 0

    const dbEntries = entries.map(e => {
      const entry = JSON.parse(e) as AuditEntry
      return {
        userId: entry.userId !== 'unknown' && entry.userId !== 'system' ? entry.userId : null,
        action: entry.action as string,
        module: entry.module,
        entity: entry.resource,
        entityId: entry.entityId,
        ipAddress: entry.ip,
        description: entry.description,
        severity: entry.severity,
        newValue: entry.details,
      }
    })

    await db.auditLog.createMany({ data: dbEntries })
    return dbEntries.length
  } catch (error) {
    console.error('[AuditLogger] Flush failed:', (error as Error).message)
    return 0
  }
}

// Flush interval
let flushInterval: ReturnType<typeof setInterval> | null = null

export function startAuditFlush(): void {
  if (flushInterval || !isServer) return
  flushInterval = setInterval(flushAuditBuffer, 10000)
}

export function stopAuditFlush(): void {
  if (flushInterval) {
    clearInterval(flushInterval)
    flushInterval = null
  }
}

interface AuditEntryInput {
  eventType: AuditEventType
  userId: string
  userName: string
  userRole: string
  resource: string
  action?: AuditAction | string
  details: string
  ip: string
  success: boolean
  entityId?: string
}

interface SimpleAuditEntry {
  action: string
  module: string
  entity: string
  entityId?: string
  description: string
  severity?: AuditSeverity
  userId?: string
  userName?: string
  ip?: string
}

function addAuditEntry(entry: AuditEntryInput): void {
  const eventType = entry.eventType
  const severity = determineSeverity(eventType, entry.success)
  const action = determineAction(eventType)
  const timestamp = new Date().toISOString()

  const fullEntry: AuditEntry = {
    id: generateAuditId(),
    timestamp,
    createdAt: timestamp,
    eventType: entry.eventType,
    action,
    severity,
    userId: entry.userId,
    userName: entry.userName,
    userRole: entry.userRole,
    resource: entry.resource,
    module: entry.resource,
    entityId: entry.entityId,
    description: entry.details,
    details: entry.details,
    ip: entry.ip,
    ipAddress: entry.ip,
    success: entry.success,
  }

  // Persist to DB (async, non-blocking)
  persistAuditEntry(fullEntry).catch(() => {})
}

function addSimpleAuditEntry(entry: SimpleAuditEntry): void {
  const timestamp = new Date().toISOString()
  const severity = entry.severity || 'INFO'

  const fullEntry: AuditEntry = {
    id: generateAuditId(),
    timestamp,
    createdAt: timestamp,
    eventType: 'DATA_MODIFICATION',
    action: entry.action,
    severity,
    userId: entry.userId || 'system',
    userName: entry.userName || 'System',
    userRole: '',
    resource: entry.module,
    module: entry.module,
    entityId: entry.entityId,
    description: entry.description,
    details: entry.description,
    ip: entry.ip || '127.0.0.1',
    ipAddress: entry.ip || '127.0.0.1',
    success: true,
  }

  persistAuditEntry(fullEntry).catch(() => {})
}

export { addAuditEntry, addSimpleAuditEntry }

export function logAccess(
  userId: string,
  userName: string,
  userRole: string,
  resource: string,
  action: string,
  details: string,
  ip: string = '127.0.0.1'
): void {
  addAuditEntry({
    eventType: 'ACCESS_GRANTED',
    userId,
    userName,
    userRole,
    resource,
    action: action as AuditAction,
    details,
    ip,
    success: true,
  })
}

export function logPermissionDenial(
  userId: string,
  userName: string,
  userRole: string,
  resource: string,
  action: string,
  reason: string,
  ip: string = '127.0.0.1'
): void {
  addAuditEntry({
    eventType: 'ACCESS_DENIED',
    userId,
    userName,
    userRole,
    resource,
    action: action as AuditAction,
    details: reason,
    ip,
    success: false,
  })

  console.warn(
    `[AUDIT] PERMISSION DENIED: User ${userName} (${userRole}) attempted ${action} on ${resource}. Reason: ${reason}`
  )
}

export function logAuthEvent(
  eventType: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'LOGOUT',
  userId: string,
  userName: string,
  details: string = '',
  ip: string = '127.0.0.1'
): void {
  addAuditEntry({
    eventType,
    userId,
    userName,
    userRole: '',
    resource: 'auth',
    action: eventType.toLowerCase() as AuditAction,
    details,
    ip,
    success: eventType !== 'LOGIN_FAILED',
  })
}

export function logCSRFViolation(ip: string, origin: string, target: string): void {
  addAuditEntry({
    eventType: 'CSRF_VIOLATION',
    userId: 'unknown',
    userName: 'unknown',
    userRole: '',
    resource: target,
    action: 'ACCESS_DENIED',
    details: `Origin: ${origin}`,
    ip,
    success: false,
  })

  console.error(
    `[AUDIT] CSRF VIOLATION: IP ${ip} with origin ${origin} attempted request to ${target}`
  )
}

export function logRateLimitHit(userId: string, ip: string, endpoint: string): void {
  addAuditEntry({
    eventType: 'RATE_LIMIT_HIT',
    userId,
    userName: '',
    userRole: '',
    resource: endpoint,
    action: 'ACCESS_DENIED',
    details: 'Rate limit exceeded',
    ip,
    success: false,
  })
}

export function logDataModification(
  userId: string,
  userName: string,
  userRole: string,
  resource: string,
  action: string,
  details: string,
  ip: string = '127.0.0.1'
): void {
  addAuditEntry({
    eventType: 'DATA_MODIFICATION',
    userId,
    userName,
    userRole,
    resource,
    action: action as AuditAction,
    details,
    ip,
    success: true,
  })
}

// ─────────── Query Functions (server-side only) ───────────

export async function getAuditLogs(filters?: {
  action?: AuditAction | string
  userId?: string
  module?: string
  entityId?: string
  severity?: AuditSeverity
  startDate?: string
  endDate?: string
  limit?: number
}): Promise<AuditEntry[]> {
  if (!isServer) return []

  try {
    const { db } = require('@/lib/db') as typeof import('@/lib/db')
    const where: Record<string, unknown> = {}

    if (filters?.action) where.action = filters.action
    if (filters?.userId) where.userId = filters.userId
    if (filters?.module) where.module = filters.module
    if (filters?.entityId) where.entityId = filters.entityId
    if (filters?.severity) where.severity = filters.severity
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {
        ...(filters?.startDate && { gte: new Date(filters.startDate) }),
        ...(filters?.endDate && { lte: new Date(filters.endDate) }),
      }
    }

    const dbEntries = await db.auditLog.findMany({
      where,
      take: filters?.limit ?? 100,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true } },
      },
    })

    return dbEntries.map(entry => ({
      id: entry.id,
      timestamp: entry.createdAt.toISOString(),
      createdAt: entry.createdAt.toISOString(),
      eventType: 'DATA_MODIFICATION' as AuditEventType,
      action: entry.action as AuditAction,
      severity: entry.severity as AuditSeverity,
      userId: entry.userId || 'system',
      userName: entry.user ? `${entry.user.firstName} ${entry.user.lastName}` : 'System',
      userRole: '',
      resource: entry.entity,
      module: entry.module,
      entityId: entry.entityId || undefined,
      description: entry.description || '',
      details: entry.newValue || '',
      ip: entry.ipAddress || '127.0.0.1',
      ipAddress: entry.ipAddress || '127.0.0.1',
      success: true,
    }))
  } catch (error) {
    console.warn('[AuditLogger] DB query failed, returning in-memory entries:', (error as Error).message)
    let entries = [...recentEntries]
    if (filters?.action) entries = entries.filter(e => e.action === filters.action)
    if (filters?.userId) entries = entries.filter(e => e.userId === filters.userId)
    if (filters?.module) entries = entries.filter(e => e.module === filters.module)
    if (filters?.severity) entries = entries.filter(e => e.severity === filters.severity)
    return entries.slice(0, filters?.limit ?? 100)
  }
}

export async function getAuditEntries(filters?: {
  eventType?: AuditEventType
  userId?: string
  resource?: string
  success?: boolean
  limit?: number
}): Promise<AuditEntry[]> {
  return getAuditLogs({
    userId: filters?.userId,
    module: filters?.resource,
    limit: filters?.limit,
  })
}

export async function getAuditStats(): Promise<{
  totalEntries: number
  deniedCount: number
  criticalCount: number
  csrfViolations: number
  rateLimitHits: number
  loginFailures: number
  recentDenials: AuditEntry[]
}> {
  if (!isServer) {
    return { totalEntries: 0, deniedCount: 0, criticalCount: 0, csrfViolations: 0, rateLimitHits: 0, loginFailures: 0, recentDenials: [] }
  }

  try {
    const { db } = require('@/lib/db') as typeof import('@/lib/db')
    const [total, denied, criticals, csrf, rateLimit, loginFail] = await Promise.all([
      db.auditLog.count(),
      db.auditLog.count({ where: { action: 'ACCESS_DENIED' } }),
      db.auditLog.count({ where: { severity: 'CRITICAL' } }),
      db.auditLog.count({ where: { action: 'ACCESS_DENIED', module: 'csrf' } }),
      db.auditLog.count({ where: { action: 'ACCESS_DENIED', description: { contains: 'Rate limit' } } }),
      db.auditLog.count({ where: { action: 'LOGIN', severity: 'WARNING' } }),
    ])

    const recentDenials = await getAuditLogs({ action: 'ACCESS_DENIED', limit: 10 })

    return {
      totalEntries: total,
      deniedCount: denied,
      criticalCount: criticals,
      csrfViolations: csrf,
      rateLimitHits: rateLimit,
      loginFailures: loginFail,
      recentDenials,
    }
  } catch {
    const denials = recentEntries.filter(e => e.eventType === 'ACCESS_DENIED')
    return {
      totalEntries: recentEntries.length,
      deniedCount: denials.length,
      criticalCount: recentEntries.filter(e => e.severity === 'CRITICAL').length,
      csrfViolations: recentEntries.filter(e => e.eventType === 'CSRF_VIOLATION').length,
      rateLimitHits: recentEntries.filter(e => e.eventType === 'RATE_LIMIT_HIT').length,
      loginFailures: recentEntries.filter(e => e.eventType === 'LOGIN_FAILED').length,
      recentDenials: denials.slice(0, 10),
    }
  }
}
