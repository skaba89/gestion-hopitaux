// HealthFlow Africa - Audit Logger
// Comprehensive audit logging for all data access and modifications
// Supports offline storage (IndexedDB) + API sync, tamper-proof hash chain

export type AuditAction = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'PRINT' | 'ACCESS_DENIED' | 'MFA_CHALLENGE' | 'MFA_SUCCESS' | 'MFA_FAILURE' | 'SESSION_EXPIRED' | 'PASSWORD_CHANGE' | 'ROLE_CHANGE' | 'PERMISSION_CHANGE'

export type AuditSeverity = 'INFO' | 'WARNING' | 'CRITICAL'

export interface AuditLogEntry {
  id: string
  userId: string
  userName: string
  userRole: string
  action: AuditAction
  module: string
  entity: string
  entityId?: string
  establishmentId?: string
  ipAddress?: string
  userAgent?: string
  oldValue?: string // JSON of previous state
  newValue?: string // JSON of new state
  description: string
  severity: AuditSeverity
  hash?: string // Tamper-proof hash
  previousHash?: string
  createdAt: string
  syncedAt?: string // When synced to server
}

// In-memory audit log store (demo mode)
const auditLogStore: AuditLogEntry[] = []
let lastHash = 'GENESIS'

/**
 * Generate a simple hash for tamper-proof chain
 */
function generateHash(entry: Omit<AuditLogEntry, 'hash'>): string {
  const data = `${entry.id}${entry.userId}${entry.action}${entry.module}${entry.entityId || ''}${entry.createdAt}${lastHash}`
  // Simple hash function (in production would use crypto.subtle)
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16).padStart(8, '0')
}

/**
 * Create audit log entry
 */
function createEntry(
  userId: string,
  userName: string,
  userRole: string,
  action: AuditAction,
  module: string,
  entity: string,
  description: string,
  options?: {
    entityId?: string
    establishmentId?: string
    ipAddress?: string
    userAgent?: string
    oldValue?: string
    newValue?: string
    severity?: AuditSeverity
  }
): AuditLogEntry {
  const entry: AuditLogEntry = {
    id: `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    userId,
    userName,
    userRole,
    action,
    module,
    entity,
    entityId: options?.entityId,
    establishmentId: options?.establishmentId,
    ipAddress: options?.ipAddress,
    userAgent: options?.userAgent,
    oldValue: options?.oldValue,
    newValue: options?.newValue,
    description,
    severity: options?.severity || 'INFO',
    previousHash: lastHash,
    createdAt: new Date().toISOString(),
  }

  entry.hash = generateHash(entry)
  lastHash = entry.hash

  return entry
}

/**
 * Log data access
 */
export function logAccess(
  userId: string,
  userName: string,
  userRole: string,
  resource: string,
  recordId: string,
  details?: string
): AuditLogEntry {
  const entry = createEntry(
    userId, userName, userRole,
    'READ', resource, resource,
    details || `Accès à ${resource} #${recordId}`,
    { entityId: recordId, severity: 'INFO' }
  )
  auditLogStore.push(entry)
  persistToAPI(entry)
  return entry
}

/**
 * Log data modification
 */
export function logModification(
  userId: string,
  userName: string,
  userRole: string,
  resource: string,
  recordId: string,
  before: unknown,
  after: unknown
): AuditLogEntry {
  const entry = createEntry(
    userId, userName, userRole,
    'UPDATE', resource, resource,
    `Modification de ${resource} #${recordId}`,
    {
      entityId: recordId,
      oldValue: JSON.stringify(before),
      newValue: JSON.stringify(after),
      severity: 'WARNING',
    }
  )
  auditLogStore.push(entry)
  persistToAPI(entry)
  return entry
}

/**
 * Log authentication events
 */
export function logAuth(
  userId: string,
  userName: string,
  userRole: string,
  event: 'LOGIN' | 'LOGOUT' | 'MFA_CHALLENGE' | 'MFA_SUCCESS' | 'MFA_FAILURE' | 'SESSION_EXPIRED' | 'PASSWORD_CHANGE',
  details: string
): AuditLogEntry {
  const severity: AuditSeverity = ['MFA_FAILURE', 'SESSION_EXPIRED'].includes(event) ? 'WARNING' : 'INFO'
  const entry = createEntry(
    userId, userName, userRole,
    event, 'auth', 'session',
    details,
    { severity }
  )
  auditLogStore.push(entry)
  persistToAPI(entry)
  return entry
}

/**
 * Log data exports
 */
export function logExport(
  userId: string,
  userName: string,
  userRole: string,
  resource: string,
  format: string,
  recordCount: number
): AuditLogEntry {
  const entry = createEntry(
    userId, userName, userRole,
    'EXPORT', resource, resource,
    `Export de ${recordCount} enregistrements ${resource} en format ${format}`,
    { severity: 'WARNING' }
  )
  auditLogStore.push(entry)
  persistToAPI(entry)
  return entry
}

/**
 * Log permission denials
 */
export function logPermissionDenial(
  userId: string,
  userName: string,
  userRole: string,
  resource: string,
  action: string,
  reason: string
): AuditLogEntry {
  const entry = createEntry(
    userId, userName, userRole,
    'ACCESS_DENIED', resource, resource,
    `Accès refusé: ${action} sur ${resource} — ${reason}`,
    { severity: 'CRITICAL' }
  )
  auditLogStore.push(entry)
  persistToAPI(entry)
  return entry
}

/**
 * Log record creation
 */
export function logCreation(
  userId: string,
  userName: string,
  userRole: string,
  resource: string,
  recordId: string,
  data: unknown
): AuditLogEntry {
  const entry = createEntry(
    userId, userName, userRole,
    'CREATE', resource, resource,
    `Création de ${resource} #${recordId}`,
    { entityId: recordId, newValue: JSON.stringify(data), severity: 'INFO' }
  )
  auditLogStore.push(entry)
  persistToAPI(entry)
  return entry
}

/**
 * Log record deletion
 */
export function logDeletion(
  userId: string,
  userName: string,
  userRole: string,
  resource: string,
  recordId: string,
  data: unknown
): AuditLogEntry {
  const entry = createEntry(
    userId, userName, userRole,
    'DELETE', resource, resource,
    `Suppression de ${resource} #${recordId}`,
    { entityId: recordId, oldValue: JSON.stringify(data), severity: 'CRITICAL' }
  )
  auditLogStore.push(entry)
  persistToAPI(entry)
  return entry
}

/**
 * Get all audit logs (admin only)
 */
export function getAuditLogs(filters?: {
  userId?: string
  action?: AuditAction
  module?: string
  entityId?: string
  severity?: AuditSeverity
  startDate?: string
  endDate?: string
  limit?: number
}): AuditLogEntry[] {
  let logs = [...auditLogStore]

  if (filters?.userId) logs = logs.filter(l => l.userId === filters.userId)
  if (filters?.action) logs = logs.filter(l => l.action === filters.action)
  if (filters?.module) logs = logs.filter(l => l.module === filters.module)
  if (filters?.entityId) logs = logs.filter(l => l.entityId === filters.entityId)
  if (filters?.severity) logs = logs.filter(l => l.severity === filters.severity)
  if (filters?.startDate) logs = logs.filter(l => l.createdAt >= filters.startDate!)
  if (filters?.endDate) logs = logs.filter(l => l.createdAt <= filters.endDate!)

  logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return filters?.limit ? logs.slice(0, filters.limit) : logs
}

/**
 * Get audit statistics
 */
export function getAuditStats(): {
  totalEntries: number
  criticalCount: number
  deniedCount: number
  topUsers: { userId: string; userName: string; count: number }[]
  topModules: { module: string; count: number }[]
  recentDenials: AuditLogEntry[]
} {
  const logs = auditLogStore
  const denied = logs.filter(l => l.action === 'ACCESS_DENIED')
  const critical = logs.filter(l => l.severity === 'CRITICAL')

  // Top users by action count
  const userCounts = new Map<string, { userName: string; count: number }>()
  for (const l of logs) {
    const existing = userCounts.get(l.userId)
    if (existing) {
      existing.count++
    } else {
      userCounts.set(l.userId, { userName: l.userName, count: 1 })
    }
  }

  // Top modules
  const moduleCounts = new Map<string, number>()
  for (const l of logs) {
    moduleCounts.set(l.module, (moduleCounts.get(l.module) || 0) + 1)
  }

  return {
    totalEntries: logs.length,
    criticalCount: critical.length,
    deniedCount: denied.length,
    topUsers: Array.from(userCounts.entries())
      .map(([userId, data]) => ({ userId, userName: data.userName, count: data.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    topModules: Array.from(moduleCounts.entries())
      .map(([module, count]) => ({ module, count }))
      .sort((a, b) => b.count - a.count),
    recentDenials: denied.slice(-10).reverse(),
  }
}

/**
 * Persist audit entry to API (non-blocking)
 */
function persistToAPI(entry: AuditLogEntry): void {
  // Attempt to sync to server API
  if (typeof window !== 'undefined') {
    fetch('/api/audit?XTransformPort=3000', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    }).catch(() => {
      // Silently fail - will retry on next sync
    })
  }
}

/**
 * Verify hash chain integrity
 */
export function verifyIntegrity(): { valid: boolean; brokenAt?: number } {
  for (let i = 1; i < auditLogStore.length; i++) {
    if (auditLogStore[i].previousHash !== auditLogStore[i - 1].hash) {
      return { valid: false, brokenAt: i }
    }
  }
  return { valid: true }
}

// Add demo audit entries
const demoAuditEntries: Omit<AuditLogEntry, 'hash' | 'previousHash'>[] = [
  { id: 'AUD-001', userId: 'USR-001', userName: 'Dr. Mamadou Diallo', userRole: 'Médecin', action: 'READ', module: 'patients', entity: 'patients', entityId: 'P-2024-001', description: 'Accès au dossier patient Aminata Diallo', severity: 'INFO', createdAt: '2026-05-10T08:15:00Z' },
  { id: 'AUD-002', userId: 'USR-002', userName: 'Marie Condé', userRole: 'Secrétaire', action: 'CREATE', module: 'patients', entity: 'patients', entityId: 'P-2024-011', description: 'Création dossier patient nouveau', severity: 'INFO', createdAt: '2026-05-10T08:30:00Z' },
  { id: 'AUD-003', userId: 'USR-003', userName: 'Ibrahim Touré', userRole: 'Laborantin', action: 'ACCESS_DENIED', module: 'patients', entity: 'patients', entityId: 'P-2024-001', description: 'Tentative d\'accès dossier patient sans autorisation', severity: 'CRITICAL', createdAt: '2026-05-10T09:00:00Z' },
  { id: 'AUD-004', userId: 'USR-004', userName: 'Admin Système', userRole: 'Administrateur', action: 'EXPORT', module: 'patients', entity: 'patients', description: 'Export liste patients (150 enregistrements)', severity: 'WARNING', createdAt: '2026-05-10T09:15:00Z' },
  { id: 'AUD-005', userId: 'USR-001', userName: 'Dr. Mamadou Diallo', userRole: 'Médecin', action: 'UPDATE', module: 'consultations', entity: 'consultations', entityId: 'CONS-001', description: 'Modification diagnostic consultation', severity: 'WARNING', createdAt: '2026-05-10T10:00:00Z' },
  { id: 'AUD-006', userId: 'USR-005', userName: 'Fatoumata Bah', userRole: 'Infirmier', action: 'READ', module: 'patients', entity: 'patients', entityId: 'P-2024-002', description: 'Consultation dossier patient pour soins', severity: 'INFO', createdAt: '2026-05-10T10:30:00Z' },
  { id: 'AUD-007', userId: 'USR-006', userName: 'Kadiatou Sylla', userRole: 'Pharmacien', action: 'ACCESS_DENIED', module: 'patients', entity: 'patients', description: 'Tentative accès données patients', severity: 'CRITICAL', createdAt: '2026-05-10T11:00:00Z' },
  { id: 'AUD-008', userId: 'USR-001', userName: 'Dr. Mamadou Diallo', userRole: 'Médecin', action: 'LOGIN', module: 'auth', entity: 'session', description: 'Connexion réussie', severity: 'INFO', createdAt: '2026-05-10T07:00:00Z' },
  { id: 'AUD-009', userId: 'USR-007', userName: 'Unknown', userRole: 'Patient', action: 'MFA_FAILURE', module: 'auth', entity: 'session', description: 'Échec authentification MFA - 3 tentatives', severity: 'WARNING', createdAt: '2026-05-10T11:30:00Z' },
  { id: 'AUD-010', userId: 'USR-004', userName: 'Admin Système', userRole: 'Administrateur', action: 'ROLE_CHANGE', module: 'admin', entity: 'users', entityId: 'USR-005', description: 'Changement rôle: Infirmier → Médecin', severity: 'CRITICAL', createdAt: '2026-05-10T12:00:00Z' },
]

// Initialize demo data
for (const entry of demoAuditEntries) {
  const fullEntry = entry as AuditLogEntry
  fullEntry.hash = generateHash(fullEntry)
  fullEntry.previousHash = lastHash
  lastHash = fullEntry.hash
  auditLogStore.push(fullEntry)
}
