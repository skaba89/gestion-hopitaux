// HealthFlow Guinea - Audit Logger (v2)
// Centralized audit logging for security events, access control, and compliance
// Stores audit entries in-memory (use database/external service in production)

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

// In-memory audit log (replace with database in production)
const auditLog: AuditEntry[] = []
const MAX_AUDIT_ENTRIES = 10000

function generateAuditId(): string {
  return `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
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

function addAuditEntry(entry: AuditEntryInput): void {
  const eventType = entry.eventType
  const severity = determineSeverity(eventType, entry.success)
  const action = determineAction(eventType)
  const timestamp = new Date().toISOString()
  const description = entry.details
  
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
    description,
    details: entry.details,
    ip: entry.ip,
    ipAddress: entry.ip,
    success: entry.success,
  }
  
  auditLog.unshift(fullEntry)
  
  // Trim old entries
  if (auditLog.length > MAX_AUDIT_ENTRIES) {
    auditLog.length = MAX_AUDIT_ENTRIES
  }
}

/**
 * Log a successful access event
 */
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

/**
 * Log a permission denial
 */
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

/**
 * Log authentication events
 */
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

/**
 * Log CSRF violation
 */
export function logCSRFViolation(
  ip: string,
  origin: string,
  target: string
): void {
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

/**
 * Log rate limit hit
 */
export function logRateLimitHit(
  userId: string,
  ip: string,
  endpoint: string
): void {
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

/**
 * Log data modification
 */
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

// ─────────── Query Functions ───────────

/**
 * Get audit logs with optional filters (alias for backward compatibility)
 */
export function getAuditLogs(filters?: {
  action?: AuditAction | string
  userId?: string
  module?: string
  entityId?: string
  severity?: AuditSeverity
  startDate?: string
  endDate?: string
  limit?: number
}): AuditEntry[] {
  let entries = [...auditLog]
  
  if (filters?.action) {
    entries = entries.filter(e => e.action === filters.action)
  }
  if (filters?.userId) {
    entries = entries.filter(e => e.userId === filters.userId)
  }
  if (filters?.module) {
    entries = entries.filter(e => e.module === filters.module || e.resource === filters.module)
  }
  if (filters?.entityId) {
    entries = entries.filter(e => e.entityId === filters.entityId)
  }
  if (filters?.severity) {
    entries = entries.filter(e => e.severity === filters.severity)
  }
  if (filters?.startDate) {
    entries = entries.filter(e => e.timestamp >= filters.startDate!)
  }
  if (filters?.endDate) {
    entries = entries.filter(e => e.timestamp <= filters.endDate!)
  }
  
  return entries.slice(0, filters?.limit ?? 100)
}

/**
 * Get audit entries (alternative alias)
 */
export function getAuditEntries(filters?: {
  eventType?: AuditEventType
  userId?: string
  resource?: string
  success?: boolean
  limit?: number
}): AuditEntry[] {
  let entries = [...auditLog]
  
  if (filters?.eventType) {
    entries = entries.filter(e => e.eventType === filters.eventType)
  }
  if (filters?.userId) {
    entries = entries.filter(e => e.userId === filters.userId)
  }
  if (filters?.resource) {
    entries = entries.filter(e => e.resource === filters.resource)
  }
  if (filters?.success !== undefined) {
    entries = entries.filter(e => e.success === filters.success)
  }
  
  return entries.slice(0, filters?.limit ?? 100)
}

/**
 * Get audit statistics
 */
export function getAuditStats(): {
  totalEntries: number
  deniedCount: number
  criticalCount: number
  csrfViolations: number
  rateLimitHits: number
  loginFailures: number
  recentDenials: AuditEntry[]
} {
  const denials = auditLog.filter(e => e.eventType === 'ACCESS_DENIED')
  const criticals = auditLog.filter(e => e.severity === 'CRITICAL')
  
  return {
    totalEntries: auditLog.length,
    deniedCount: denials.length,
    criticalCount: criticals.length,
    csrfViolations: auditLog.filter(e => e.eventType === 'CSRF_VIOLATION').length,
    rateLimitHits: auditLog.filter(e => e.eventType === 'RATE_LIMIT_HIT').length,
    loginFailures: auditLog.filter(e => e.eventType === 'LOGIN_FAILED').length,
    recentDenials: denials.slice(0, 10),
  }
}
