// HealthFlow Africa - Role-Based Access Control (RBAC)
// Granular permissions matrix for all user roles

export type HFRole = 'Administrateur' | 'Médecin' | 'Infirmier' | 'Laborantin' | 'Pharmacien' | 'Secrétaire' | 'ASC' | 'Patient'

export type PermissionAction = 'read' | 'write' | 'delete' | 'export' | 'download' | 'send' | 'diagnostic' | 'interactions' | 'surveillance' | 'payments'

export type Resource =
  | 'patients'
  | 'consultations'
  | 'laboratory'
  | 'pharmacy'
  | 'hospitalization'
  | 'emergencies'
  | 'maternity'
  | 'vaccinations'
  | 'billing'
  | 'insurance'
  | 'ai'
  | 'telemedicine'
  | 'messaging'
  | 'admin'
  | 'asc'
  | 'fhir'
  | 'integrations'

export interface Permission {
  resource: Resource
  action: PermissionAction
  allowed: boolean
  withAuthorization?: boolean // requires admin authorization
  ownDataOnly?: boolean // can only access own data
  withAdminAuth?: boolean // requires admin approval for download
}

// ─────────── Permissions Matrix ───────────

export const PERMISSIONS_MATRIX: Record<HFRole, Permission[]> = {
  'Administrateur': [
    { resource: 'patients', action: 'read', allowed: true },
    { resource: 'patients', action: 'write', allowed: true },
    { resource: 'patients', action: 'delete', allowed: true },
    { resource: 'patients', action: 'export', allowed: true },
    { resource: 'patients', action: 'download', allowed: true },
    { resource: 'consultations', action: 'read', allowed: true },
    { resource: 'consultations', action: 'write', allowed: true },
    { resource: 'laboratory', action: 'read', allowed: true },
    { resource: 'laboratory', action: 'write', allowed: true },
    { resource: 'pharmacy', action: 'read', allowed: true },
    { resource: 'pharmacy', action: 'write', allowed: true },
    { resource: 'hospitalization', action: 'read', allowed: true },
    { resource: 'emergencies', action: 'read', allowed: true },
    { resource: 'emergencies', action: 'write', allowed: true },
    { resource: 'maternity', action: 'read', allowed: true },
    { resource: 'vaccinations', action: 'read', allowed: true },
    { resource: 'billing', action: 'read', allowed: true },
    { resource: 'billing', action: 'write', allowed: true },
    { resource: 'billing', action: 'payments', allowed: true },
    { resource: 'insurance', action: 'read', allowed: true },
    { resource: 'insurance', action: 'write', allowed: true },
    { resource: 'ai', action: 'diagnostic', allowed: true },
    { resource: 'ai', action: 'interactions', allowed: true },
    { resource: 'ai', action: 'surveillance', allowed: true },
    { resource: 'telemedicine', action: 'read', allowed: true },
    { resource: 'telemedicine', action: 'write', allowed: true },
    { resource: 'messaging', action: 'send', allowed: true },
    { resource: 'admin', action: 'read', allowed: true },
    { resource: 'admin', action: 'write', allowed: true },
    { resource: 'asc', action: 'read', allowed: true },
    { resource: 'fhir', action: 'read', allowed: true },
    { resource: 'fhir', action: 'write', allowed: true },
    { resource: 'fhir', action: 'export', allowed: true },
    { resource: 'integrations', action: 'read', allowed: true },
    { resource: 'integrations', action: 'write', allowed: true },
  ],
  'Médecin': [
    { resource: 'patients', action: 'read', allowed: true },
    { resource: 'patients', action: 'write', allowed: true },
    { resource: 'patients', action: 'delete', allowed: false },
    { resource: 'patients', action: 'export', allowed: true },
    { resource: 'patients', action: 'download', allowed: true, withAdminAuth: true },
    { resource: 'consultations', action: 'read', allowed: true },
    { resource: 'consultations', action: 'write', allowed: true },
    { resource: 'laboratory', action: 'read', allowed: true },
    { resource: 'laboratory', action: 'write', allowed: true },
    { resource: 'pharmacy', action: 'read', allowed: true },
    { resource: 'pharmacy', action: 'write', allowed: false },
    { resource: 'hospitalization', action: 'read', allowed: true },
    { resource: 'emergencies', action: 'read', allowed: true },
    { resource: 'emergencies', action: 'write', allowed: true },
    { resource: 'maternity', action: 'read', allowed: true },
    { resource: 'vaccinations', action: 'read', allowed: true },
    { resource: 'billing', action: 'read', allowed: true, withAuthorization: true },
    { resource: 'insurance', action: 'read', allowed: true, withAuthorization: true },
    { resource: 'ai', action: 'diagnostic', allowed: true },
    { resource: 'ai', action: 'interactions', allowed: true },
    { resource: 'ai', action: 'surveillance', allowed: true },
    { resource: 'telemedicine', action: 'read', allowed: true },
    { resource: 'telemedicine', action: 'write', allowed: true },
    { resource: 'messaging', action: 'send', allowed: true },
    { resource: 'fhir', action: 'read', allowed: true },
    { resource: 'fhir', action: 'export', allowed: true },
    { resource: 'integrations', action: 'read', allowed: true },
  ],
  'Infirmier': [
    { resource: 'patients', action: 'read', allowed: true },
    { resource: 'patients', action: 'write', allowed: true, withAuthorization: true },
    { resource: 'patients', action: 'delete', allowed: false },
    { resource: 'consultations', action: 'read', allowed: true },
    { resource: 'consultations', action: 'write', allowed: true, withAuthorization: true },
    { resource: 'laboratory', action: 'read', allowed: true },
    { resource: 'pharmacy', action: 'read', allowed: true },
    { resource: 'hospitalization', action: 'read', allowed: true },
    { resource: 'emergencies', action: 'read', allowed: true },
    { resource: 'emergencies', action: 'write', allowed: true, withAuthorization: true },
    { resource: 'maternity', action: 'read', allowed: true },
    { resource: 'vaccinations', action: 'read', allowed: true },
    { resource: 'ai', action: 'diagnostic', allowed: true },
    { resource: 'ai', action: 'interactions', allowed: true },
    { resource: 'telemedicine', action: 'read', allowed: true },
    { resource: 'telemedicine', action: 'write', allowed: true, withAuthorization: true },
    { resource: 'messaging', action: 'send', allowed: true },
  ],
  'Laborantin': [
    { resource: 'patients', action: 'read', allowed: false },
    { resource: 'laboratory', action: 'read', allowed: true },
    { resource: 'laboratory', action: 'write', allowed: true },
  ],
  'Pharmacien': [
    { resource: 'pharmacy', action: 'read', allowed: true },
    { resource: 'pharmacy', action: 'write', allowed: true },
    { resource: 'patients', action: 'read', allowed: false },
    { resource: 'ai', action: 'interactions', allowed: true },
  ],
  'Secrétaire': [
    { resource: 'patients', action: 'read', allowed: true, withAuthorization: true },
    { resource: 'patients', action: 'write', allowed: true, withAuthorization: true },
    { resource: 'consultations', action: 'read', allowed: true, withAuthorization: true },
    { resource: 'laboratory', action: 'read', allowed: true, withAuthorization: true },
    { resource: 'hospitalization', action: 'read', allowed: true, withAuthorization: true },
    { resource: 'maternity', action: 'read', allowed: true, withAuthorization: true },
    { resource: 'vaccinations', action: 'read', allowed: true, withAuthorization: true },
    { resource: 'billing', action: 'read', allowed: true },
    { resource: 'billing', action: 'write', allowed: true },
    { resource: 'billing', action: 'payments', allowed: true },
    { resource: 'insurance', action: 'read', allowed: true },
    { resource: 'insurance', action: 'write', allowed: true },
    { resource: 'messaging', action: 'send', allowed: true },
  ],
  'ASC': [
    { resource: 'patients', action: 'read', allowed: true, withAuthorization: true },
    { resource: 'patients', action: 'write', allowed: true, withAuthorization: true },
    { resource: 'emergencies', action: 'read', allowed: true, withAuthorization: true },
    { resource: 'emergencies', action: 'write', allowed: true, withAuthorization: true },
    { resource: 'maternity', action: 'read', allowed: true, withAuthorization: true },
    { resource: 'vaccinations', action: 'read', allowed: true, withAuthorization: true },
    { resource: 'ai', action: 'diagnostic', allowed: true },
    { resource: 'ai', action: 'interactions', allowed: true },
    { resource: 'asc', action: 'read', allowed: true },
    { resource: 'messaging', action: 'send', allowed: true },
  ],
  'Patient': [
    { resource: 'patients', action: 'read', allowed: true, ownDataOnly: true },
    { resource: 'consultations', action: 'read', allowed: true, ownDataOnly: true },
    { resource: 'laboratory', action: 'read', allowed: true, ownDataOnly: true },
    { resource: 'hospitalization', action: 'read', allowed: true, ownDataOnly: true },
    { resource: 'maternity', action: 'read', allowed: true, ownDataOnly: true },
    { resource: 'vaccinations', action: 'read', allowed: true, ownDataOnly: true },
    { resource: 'billing', action: 'read', allowed: true, ownDataOnly: true },
    { resource: 'billing', action: 'payments', allowed: true, ownDataOnly: true },
    { resource: 'insurance', action: 'read', allowed: true, ownDataOnly: true },
    { resource: 'telemedicine', action: 'read', allowed: true, ownDataOnly: true },
  ],
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: HFRole, resource: Resource, action: PermissionAction): boolean {
  const permissions = PERMISSIONS_MATRIX[role]
  if (!permissions) return false
  const perm = permissions.find(p => p.resource === resource && p.action === action)
  return perm?.allowed ?? false
}

/**
 * Get the full permission object for a role/resource/action
 */
export function getPermission(role: HFRole, resource: Resource, action: PermissionAction): Permission | null {
  const permissions = PERMISSIONS_MATRIX[role]
  if (!permissions) return null
  return permissions.find(p => p.resource === resource && p.action === action) ?? null
}

/**
 * Full permission check including authorization and ownership
 */
export function canPerformAction(
  role: HFRole,
  resource: Resource,
  action: PermissionAction,
  options?: { isOwnData?: boolean; hasAuthorization?: boolean; hasAdminAuth?: boolean }
): { allowed: boolean; reason?: string } {
  const perm = getPermission(role, resource, action)

  if (!perm) {
    return { allowed: false, reason: 'Permission non définie pour ce rôle' }
  }

  if (!perm.allowed) {
    return { allowed: false, reason: 'Accès refusé pour ce rôle' }
  }

  if (perm.ownDataOnly && !options?.isOwnData) {
    return { allowed: false, reason: 'Accès limité à vos propres données' }
  }

  if (perm.withAuthorization && !options?.hasAuthorization) {
    return { allowed: false, reason: 'Autorisation requise pour cette action' }
  }

  if (perm.withAdminAuth && !options?.hasAdminAuth) {
    return { allowed: false, reason: 'Autorisation administrateur requise' }
  }

  return { allowed: true }
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: HFRole): Permission[] {
  return PERMISSIONS_MATRIX[role] ?? []
}

/**
 * Get list of views the role can access
 */
export function getAccessibleViews(role: HFRole): string[] {
  const views: string[] = []

  if (hasPermission(role, 'patients', 'read')) views.push('patients')
  if (hasPermission(role, 'consultations', 'read')) views.push('consultations')
  if (hasPermission(role, 'laboratory', 'read')) views.push('laboratory')
  if (hasPermission(role, 'pharmacy', 'read')) views.push('pharmacy')
  if (hasPermission(role, 'hospitalization', 'read')) views.push('hospitalization')
  if (hasPermission(role, 'emergencies', 'read')) views.push('emergencies')
  if (hasPermission(role, 'maternity', 'read')) views.push('maternity')
  if (hasPermission(role, 'vaccinations', 'read')) views.push('vaccination')
  if (hasPermission(role, 'billing', 'read')) views.push('billing')
  if (hasPermission(role, 'insurance', 'read')) views.push('insurance')
  if (hasPermission(role, 'telemedicine', 'read')) views.push('teleconsultation')
  if (hasPermission(role, 'ai', 'diagnostic')) views.push('ai-diagnostic')
  if (hasPermission(role, 'ai', 'interactions')) views.push('ai-interactions')
  if (hasPermission(role, 'ai', 'surveillance')) views.push('ai-surveillance')
  if (hasPermission(role, 'messaging', 'send')) views.push('messaging')
  if (hasPermission(role, 'admin', 'read')) views.push('administration')
  if (hasPermission(role, 'asc', 'read')) views.push('asc-dashboard')
  if (hasPermission(role, 'fhir', 'read')) views.push('fhir-explorer')
  if (hasPermission(role, 'integrations', 'read')) views.push('integration-dashboard')

  // Always accessible
  views.push('dashboard', 'appointments', 'analytics', 'settings')

  return [...new Set(views)]
}

/**
 * Filter response data by role (RLS on API level)
 */
export function filterDataByRole<T extends Record<string, unknown>>(
  role: HFRole,
  data: T,
  resource: Resource
): T {
  if (role === 'Administrateur') return data

  const filtered = { ...data }

  // Mask sensitive fields based on role and resource
  if (resource === 'patients') {
    if (role === 'Laborantin') {
      // Lab techs only see demographics + lab orders
      delete filtered['allergies']
      delete filtered['medicalHistory']
      delete filtered['surgicalHistory']
      delete filtered['familyHistory']
      delete filtered['documents']
      delete filtered['nationalId']
      delete filtered['emergencyContact']
      delete filtered['emergencyPhone']
    } else if (role === 'Pharmacien') {
      // Pharmacists only see demographics + prescriptions + allergies
      delete filtered['medicalHistory']
      delete filtered['surgicalHistory']
      delete filtered['familyHistory']
      delete filtered['documents']
      delete filtered['nationalId']
    } else if (role === 'Secrétaire') {
      // Secretaries only see demographics + appointments
      delete filtered['allergies']
      delete filtered['medicalHistory']
      delete filtered['surgicalHistory']
      delete filtered['familyHistory']
      delete filtered['documents']
    }
  }

  return filtered
}

/**
 * Convert role string to HFRole type
 */
export function toHFRole(role: string): HFRole {
  const validRoles: HFRole[] = ['Administrateur', 'Médecin', 'Infirmier', 'Laborantin', 'Pharmacien', 'Secrétaire', 'ASC', 'Patient']
  if (validRoles.includes(role as HFRole)) return role as HFRole
  return 'Patient' // Default to most restrictive
}
