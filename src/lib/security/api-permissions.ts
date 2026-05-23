import { NextResponse } from 'next/server'
import { canPerformAction, type HFRole, type PermissionAction, type Resource } from '@/lib/rbac'

export interface PermissionCheckOptions {
  role: HFRole
  resource: Resource
  action: PermissionAction
  isOwnData?: boolean
  hasAuthorization?: boolean
  hasAdminAuth?: boolean
}

export function requirePermission(options: PermissionCheckOptions): NextResponse | null {
  const access = canPerformAction(options.role, options.resource, options.action, {
    isOwnData: options.isOwnData,
    hasAuthorization: options.hasAuthorization,
    hasAdminAuth: options.hasAdminAuth,
  })

  if (!access.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: access.reason || 'Access denied',
      },
      { status: 403 },
    )
  }

  return null
}

export function requireAdmin(role: HFRole): NextResponse | null {
  if (role !== 'Administrateur') {
    return NextResponse.json(
      {
        success: false,
        error: 'Administrator access required',
      },
      { status: 403 },
    )
  }

  return null
}
