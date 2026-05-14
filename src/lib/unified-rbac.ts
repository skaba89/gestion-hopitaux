// HealthFlow Guinea - Unified RBAC System
// Merges clinical roles (rbac.ts) and management hierarchy (hospital-model.ts)
// into a single, scope-aware permission system.

import {
  type HFRole,
  type Resource,
  type PermissionAction,
  type Permission,
  PERMISSIONS_MATRIX,
  hasPermission as baseHasPermission,
  getPermission as baseGetPermission,
  canPerformAction as baseCanPerformAction,
} from './rbac'
import { type GuineaRegion, type ServiceDelegation } from './hospital-model'

// ─────────── Clinical Role (what the user does) ───────────

export type ClinicalRole =
  | 'medecin'
  | 'infirmier'
  | 'laborantin'
  | 'pharmacien'
  | 'secretaire'
  | 'asc'
  | 'patient'

// ─────────── Management Scope (what the user manages) ───────────

export type ManagementScope =
  | 'none'              // Regular staff, no management
  | 'chef_service'      // Head of a department/service
  | 'directeur_hopital' // Hospital director
  | 'directeur_regional' // Regional health director
  | 'directeur_general'  // National director

// ─────────── Unified Role ───────────

export type UnifiedRole = ClinicalRole | 'admin'

// ─────────── User Scope ───────────

export interface UserScope {
  clinicalRole: ClinicalRole
  managementScope: ManagementScope
  scopeEntityId?: string   // serviceId, hospitalId, or regionCode
  hospitalId?: string      // Which hospital the user belongs to
  serviceId?: string       // Which service the user belongs to (if applicable)
  regionCode?: string      // Which region (for regional directors)
}

// ─────────── Hierarchy Levels ───────────

export const SCOPE_LEVEL: Record<ManagementScope, number> = {
  'none': 0,
  'chef_service': 3,
  'directeur_hopital': 5,
  'directeur_regional': 7,
  'directeur_general': 10,
}

// ─────────── Mapping Helpers ───────────

/** Map a legacy HFRole to a ClinicalRole */
export function hfRoleToClinicalRole(role: HFRole): ClinicalRole {
  const map: Record<HFRole, ClinicalRole> = {
    'Administrateur': 'medecin', // admins map to medecin as clinical base
    'Médecin': 'medecin',
    'Infirmier': 'infirmier',
    'Laborantin': 'laborantin',
    'Pharmacien': 'pharmacien',
    'Secrétaire': 'secretaire',
    'ASC': 'asc',
    'Patient': 'patient',
  }
  return map[role] ?? 'patient'
}

/** Map a ClinicalRole back to the legacy HFRole for permission lookups */
export function clinicalRoleToHFRole(role: ClinicalRole): HFRole {
  const map: Record<ClinicalRole, HFRole> = {
    'medecin': 'Médecin',
    'infirmier': 'Infirmier',
    'laborantin': 'Laborantin',
    'pharmacien': 'Pharmacien',
    'secretaire': 'Secrétaire',
    'asc': 'ASC',
    'patient': 'Patient',
  }
  return map[role] ?? 'Patient'
}

/** Map a UnifiedRole to the legacy HFRole for permission lookups */
export function unifiedRoleToHFRole(role: UnifiedRole): HFRole {
  if (role === 'admin') return 'Administrateur'
  return clinicalRoleToHFRole(role)
}

// ─────────── Labels ───────────

export const CLINICAL_ROLE_LABELS: Record<ClinicalRole, string> = {
  'medecin': 'Médecin',
  'infirmier': 'Infirmier(e)',
  'laborantin': 'Laborantin(e)',
  'pharmacien': 'Pharmacien(ne)',
  'secretaire': 'Secrétaire',
  'asc': 'Agent Santé Communautaire',
  'patient': 'Patient(e)',
}

export const MANAGEMENT_SCOPE_LABELS: Record<ManagementScope, string> = {
  'none': 'Personnel',
  'chef_service': 'Chef de Service',
  'directeur_hopital': "Directeur d'Hôpital",
  'directeur_regional': 'Directeur Régional',
  'directeur_general': 'Directeur Général',
}

export const SCOPE_LEVEL_LABELS: Record<ScopeLevel, string> = {
  'service': 'Service',
  'hospital': 'Hôpital',
  'region': 'Région',
  'national': 'National',
}

export type ScopeLevel = 'service' | 'hospital' | 'region' | 'national'

// ─────────── Scope-Aware Permission Checks ───────────

/**
 * Check if a user can manage a specific service.
 * - Chef de Service: can manage their own service
 * - Directeur Hôpital: can manage any service in their hospital
 * - Directeur Régional: can manage any service in hospitals in their region
 * - Directeur Général: can manage any service
 */
export function canManageService(
  userScope: UserScope,
  serviceId: string,
  serviceHospitalId: string,
): boolean {
  const level = SCOPE_LEVEL[userScope.managementScope]

  // Directeur Général can manage any service
  if (level >= SCOPE_LEVEL['directeur_general']) return true

  // Directeur Régional can manage services in their region's hospitals
  if (level >= SCOPE_LEVEL['directeur_regional']) {
    // In a real implementation, we'd check if serviceHospitalId is in userScope.regionCode
    // For now, we rely on regionCode matching
    return true // Simplified: regional directors can manage any service (region check would be done at query time)
  }

  // Directeur Hôpital can manage services in their hospital
  if (level >= SCOPE_LEVEL['directeur_hopital']) {
    return userScope.hospitalId === serviceHospitalId
  }

  // Chef de Service can manage their own service
  if (level >= SCOPE_LEVEL['chef_service']) {
    return userScope.scopeEntityId === serviceId
  }

  return false
}

/**
 * Check if a user can manage a specific hospital.
 * - Directeur Hôpital: can manage their own hospital
 * - Directeur Régional: can manage hospitals in their region
 * - Directeur Général: can manage any hospital
 */
export function canManageHospital(
  userScope: UserScope,
  hospitalId: string,
  hospitalRegion?: GuineaRegion,
): boolean {
  const level = SCOPE_LEVEL[userScope.managementScope]

  // Directeur Général can manage any hospital
  if (level >= SCOPE_LEVEL['directeur_general']) return true

  // Directeur Régional can manage hospitals in their region
  if (level >= SCOPE_LEVEL['directeur_regional']) {
    if (hospitalRegion && userScope.regionCode) {
      return hospitalRegion === userScope.regionCode
    }
    return false
  }

  // Directeur Hôpital can manage their own hospital
  if (level >= SCOPE_LEVEL['directeur_hopital']) {
    return userScope.hospitalId === hospitalId
  }

  return false
}

/**
 * Check if a user can manage a region.
 * - Directeur Régional: can manage their own region
 * - Directeur Général: can manage any region
 */
export function canManageRegion(
  userScope: UserScope,
  regionCode: GuineaRegion,
): boolean {
  const level = SCOPE_LEVEL[userScope.managementScope]

  // Directeur Général can manage any region
  if (level >= SCOPE_LEVEL['directeur_general']) return true

  // Directeur Régional can manage their own region
  if (level >= SCOPE_LEVEL['directeur_regional']) {
    return userScope.regionCode === regionCode
  }

  return false
}

/**
 * Check if a manager can override a service head's decisions.
 * Only directors at hospital level or above can override a service head.
 */
export function canOverrideService(
  userScope: UserScope,
  serviceHeadId: string,
): boolean {
  const level = SCOPE_LEVEL[userScope.managementScope]

  // Must be at least Directeur Hôpital to override a service head
  if (level < SCOPE_LEVEL['directeur_hopital']) return false

  // Can't override yourself
  if (userScope.scopeEntityId === serviceHeadId) return false

  return true
}

/**
 * Get the effective scope considering active delegations.
 * If the user has an active delegation with a higher scope, return that.
 */
export function getDelegatedScope(
  userScope: UserScope,
  activeDelegations: ServiceDelegation[],
): UserScope {
  if (!activeDelegations || activeDelegations.length === 0) {
    return userScope
  }

  // Find the highest-level active delegation
  let effectiveScope = userScope

  for (const delegation of activeDelegations) {
    if (delegation.status !== 'Active') continue

    // Check if delegation is expired
    if (delegation.endDate && new Date(delegation.endDate) < new Date()) continue

    // If delegation grants chef_service scope and current scope is none, upgrade
    if (
      userScope.managementScope === 'none' &&
      effectiveScope.managementScope === 'none'
    ) {
      effectiveScope = {
        ...userScope,
        managementScope: 'chef_service',
        scopeEntityId: delegation.serviceId,
        hospitalId: delegation.hospitalId,
      }
    }
  }

  return effectiveScope
}

/**
 * Determine what data scope the user can see.
 * Returns the level of data visibility.
 */
export function getAccessibleDataScope(userScope: UserScope): ScopeLevel {
  const level = SCOPE_LEVEL[userScope.managementScope]

  if (level >= SCOPE_LEVEL['directeur_general']) return 'national'
  if (level >= SCOPE_LEVEL['directeur_regional']) return 'region'
  if (level >= SCOPE_LEVEL['directeur_hopital']) return 'hospital'
  if (level >= SCOPE_LEVEL['chef_service']) return 'service'

  return 'service' // Regular staff see their service data
}

/**
 * Scope-aware permission check.
 * Combines the clinical role permission from rbac.ts with management scope.
 * Management roles inherit broader access based on their scope level.
 */
export function hasPermission(
  userScope: UserScope,
  resource: Resource,
  action: PermissionAction,
): boolean {
  // Admin always has permission
  if (userScope.managementScope === 'directeur_general') return true

  // Map to legacy HFRole for base permission check
  const hfRole = unifiedRoleToHFRole(
    userScope.managementScope !== 'none' && userScope.managementScope !== 'chef_service'
      ? 'admin' // Hospital directors and above get admin-level clinical permissions
      : userScope.clinicalRole === 'patient'
        ? 'patient'
        : userScope.clinicalRole,
  )

  // Base clinical permission
  if (baseHasPermission(hfRole, resource, action)) return true

  // Chef de Service gets read access to resources in their service
  if (
    userScope.managementScope === 'chef_service' &&
    action === 'read' &&
    ['patients', 'consultations', 'laboratory', 'pharmacy', 'hospitalization', 'emergencies', 'maternity', 'vaccinations', 'billing', 'insurance'].includes(resource)
  ) {
    return true
  }

  return false
}

/**
 * Full scope-aware permission check with detailed result.
 */
export function canPerformAction(
  userScope: UserScope,
  resource: Resource,
  action: PermissionAction,
  options?: {
    isOwnData?: boolean
    hasAuthorization?: boolean
    hasAdminAuth?: boolean
    targetHospitalId?: string
    targetServiceId?: string
    targetRegionCode?: string
  },
): { allowed: boolean; reason?: string } {
  // Directeur Général always allowed
  if (userScope.managementScope === 'directeur_general') {
    return { allowed: true }
  }

  // Check scope-based access first
  if (options?.targetHospitalId) {
    if (!canManageHospital(userScope, options.targetHospitalId, options.targetRegionCode as GuineaRegion | undefined)) {
      const dataScope = getAccessibleDataScope(userScope)
      if (dataScope === 'service' || dataScope === 'hospital') {
        if (userScope.hospitalId !== options.targetHospitalId) {
          return { allowed: false, reason: 'Accès limité à votre établissement' }
        }
      }
    }
  }

  // Map to legacy role for detailed permission check
  const hfRole = unifiedRoleToHFRole(
    userScope.managementScope !== 'none' && userScope.managementScope !== 'chef_service'
      ? 'admin'
      : userScope.clinicalRole === 'patient'
        ? 'patient'
        : userScope.clinicalRole,
  )

  return baseCanPerformAction(hfRole, resource, action, options)
}

/**
 * Get the full permission object for a user scope/resource/action.
 */
export function getPermission(
  userScope: UserScope,
  resource: Resource,
  action: PermissionAction,
): Permission | null {
  const hfRole = unifiedRoleToHFRole(
    userScope.managementScope !== 'none' && userScope.managementScope !== 'chef_service'
      ? 'admin'
      : userScope.clinicalRole === 'patient'
        ? 'patient'
        : userScope.clinicalRole,
  )
  return baseGetPermission(hfRole, resource, action)
}

/**
 * Get all permissions for a user scope.
 */
export function getRolePermissions(userScope: UserScope): Permission[] {
  const hfRole = unifiedRoleToHFRole(
    userScope.managementScope !== 'none' && userScope.managementScope !== 'chef_service'
      ? 'admin'
      : userScope.clinicalRole === 'patient'
        ? 'patient'
        : userScope.clinicalRole,
  )
  return PERMISSIONS_MATRIX[hfRole] ?? []
}

/**
 * Get list of views the user scope can access.
 */
export function getAccessibleViews(userScope: UserScope): string[] {
  const hfRole = unifiedRoleToHFRole(
    userScope.managementScope !== 'none' && userScope.managementScope !== 'chef_service'
      ? 'admin'
      : userScope.clinicalRole === 'patient'
        ? 'patient'
        : userScope.clinicalRole,
  )

  const views: string[] = []

  if (baseHasPermission(hfRole, 'patients', 'read')) views.push('patients')
  if (baseHasPermission(hfRole, 'consultations', 'read')) views.push('consultations')
  if (baseHasPermission(hfRole, 'laboratory', 'read')) views.push('laboratory')
  if (baseHasPermission(hfRole, 'pharmacy', 'read')) views.push('pharmacy')
  if (baseHasPermission(hfRole, 'hospitalization', 'read')) views.push('hospitalization')
  if (baseHasPermission(hfRole, 'emergencies', 'read')) views.push('emergencies')
  if (baseHasPermission(hfRole, 'maternity', 'read')) views.push('maternity')
  if (baseHasPermission(hfRole, 'vaccinations', 'read')) views.push('vaccination')
  if (baseHasPermission(hfRole, 'billing', 'read')) views.push('billing')
  if (baseHasPermission(hfRole, 'insurance', 'read')) views.push('insurance')
  if (baseHasPermission(hfRole, 'telemedicine', 'read')) views.push('teleconsultation')
  if (baseHasPermission(hfRole, 'ai', 'diagnostic')) views.push('ai-diagnostic')
  if (baseHasPermission(hfRole, 'ai', 'interactions')) views.push('ai-interactions')
  if (baseHasPermission(hfRole, 'ai', 'surveillance')) views.push('ai-surveillance')
  if (baseHasPermission(hfRole, 'messaging', 'send')) views.push('messaging')
  if (baseHasPermission(hfRole, 'admin', 'read')) views.push('administration')
  if (baseHasPermission(hfRole, 'asc', 'read')) views.push('asc-dashboard')
  if (baseHasPermission(hfRole, 'fhir', 'read')) views.push('fhir-explorer')
  if (baseHasPermission(hfRole, 'integrations', 'read')) views.push('integration-dashboard')

  // Management views: accessible to those with management scope
  if (SCOPE_LEVEL[userScope.managementScope] >= SCOPE_LEVEL['chef_service']) {
    views.push('multi-hospital')
  }
  if (SCOPE_LEVEL[userScope.managementScope] >= SCOPE_LEVEL['directeur_hopital']) {
    views.push('national-supervision')
    views.push('facilities-management')
    views.push('national-statistics')
  }

  // Always accessible
  views.push('dashboard', 'appointments', 'analytics', 'settings')

  return [...new Set(views)]
}

/**
 * Filter response data by user scope (RLS on API level, scope-aware).
 */
export function filterDataByScope<T extends Record<string, unknown>>(
  userScope: UserScope,
  data: T,
  resource: Resource,
): T {
  // Directors at hospital level and above see everything
  if (SCOPE_LEVEL[userScope.managementScope] >= SCOPE_LEVEL['directeur_hopital']) {
    return data
  }

  // Map to legacy role for field-level filtering
  const hfRole = unifiedRoleToHFRole(
    userScope.managementScope === 'chef_service'
      ? 'medecin' // Chef de Service gets doctor-level field access
      : userScope.clinicalRole === 'patient'
        ? 'patient'
        : userScope.clinicalRole,
  )

  const filtered = { ...data }

  // Mask sensitive fields based on role and resource
  if (resource === 'patients') {
    if (hfRole === 'Laborantin') {
      delete filtered['allergies']
      delete filtered['medicalHistory']
      delete filtered['surgicalHistory']
      delete filtered['familyHistory']
      delete filtered['documents']
      delete filtered['nationalId']
      delete filtered['emergencyContact']
      delete filtered['emergencyPhone']
    } else if (hfRole === 'Pharmacien') {
      delete filtered['medicalHistory']
      delete filtered['surgicalHistory']
      delete filtered['familyHistory']
      delete filtered['documents']
      delete filtered['nationalId']
    } else if (hfRole === 'Secrétaire') {
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
 * Build a UserScope from store user data.
 */
export function buildUserScope(params: {
  clinicalRole: ClinicalRole
  managementScope: ManagementScope
  scopeEntityId?: string
  hospitalId?: string
  serviceId?: string
  regionCode?: string
}): UserScope {
  return {
    clinicalRole: params.clinicalRole,
    managementScope: params.managementScope,
    scopeEntityId: params.scopeEntityId,
    hospitalId: params.hospitalId,
    serviceId: params.serviceId,
    regionCode: params.regionCode,
  }
}

/**
 * Get the display label for a user's full role description.
 */
export function getRoleDisplayLabel(userScope: UserScope): string {
  if (userScope.managementScope === 'directeur_general') return 'Directeur Général'
  if (userScope.managementScope === 'directeur_regional') return 'Directeur Régional'
  if (userScope.managementScope === 'directeur_hopital') return "Directeur d'Hôpital"
  if (userScope.managementScope === 'chef_service') return 'Chef de Service'

  return CLINICAL_ROLE_LABELS[userScope.clinicalRole]
}
