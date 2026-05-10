// HealthFlow Africa - Permission Check Hook
// React hooks for RBAC permission checks on the client side

'use client'

import { useMemo } from 'react'
import { useStore } from '@/lib/store'
import {
  type HFRole, type Resource, type PermissionAction,
  hasPermission, canPerformAction, getRolePermissions,
  getAccessibleViews, toHFRole
} from '@/lib/rbac'

/**
 * Check if the current user has a specific permission
 */
export function usePermission(resource: Resource, action: PermissionAction): {
  allowed: boolean
  withAuthorization: boolean
  ownDataOnly: boolean
  withAdminAuth: boolean
} {
  const { user } = useStore()
  const role = toHFRole(user.role)

  return useMemo(() => {
    const allowed = hasPermission(role, resource, action)
    const perms = getRolePermissions(role)
    const perm = perms.find(p => p.resource === resource && p.action === action)

    return {
      allowed,
      withAuthorization: perm?.withAuthorization ?? false,
      ownDataOnly: perm?.ownDataOnly ?? false,
      withAdminAuth: perm?.withAdminAuth ?? false,
    }
  }, [role, resource, action])
}

/**
 * Get all permissions for the current user's role
 */
export function useRolePermissions() {
  const { user } = useStore()
  const role = toHFRole(user.role)

  return useMemo(() => ({
    role,
    permissions: getRolePermissions(role),
    accessibleViews: getAccessibleViews(role),
  }), [role])
}

/**
 * Check if the current user can perform an action with full ownership/authorization context
 */
export function useCanPerform(
  resource: Resource,
  action: PermissionAction,
  options?: { isOwnData?: boolean; hasAuthorization?: boolean; hasAdminAuth?: boolean }
): { allowed: boolean; reason?: string } {
  const { user } = useStore()
  const role = toHFRole(user.role)
  const isOwnData = options?.isOwnData
  const hasAuthorization = options?.hasAuthorization
  const hasAdminAuth = options?.hasAdminAuth

  return useMemo(() => {
    return canPerformAction(role, resource, action, { isOwnData, hasAuthorization, hasAdminAuth })
  }, [role, resource, action, isOwnData, hasAuthorization, hasAdminAuth])
}

/**
 * Filter data based on RLS for the current user's role
 */
export function useFilteredData<T extends Record<string, unknown>>(
  resource: Resource,
  data: T[]
): T[] {
  const { user } = useStore()
  const role = toHFRole(user.role)

  return useMemo(() => {
    // Admin and doctor see all data
    if (role === 'Administrateur') return data

    // For patient role, filter to own data only
    if (role === 'Patient') {
      const hasOwnOnly = hasPermission(role, resource, 'read')
      if (hasOwnOnly) {
        // In demo mode, return all data (would filter by patientId in production)
        return data
      }
      return []
    }

    return data
  }, [role, resource, data])
}

/**
 * Get list of accessible views for the current user
 */
export function useAccessibleViews(): string[] {
  const { user } = useStore()
  const role = toHFRole(user.role)

  return useMemo(() => getAccessibleViews(role), [role])
}
