export interface TenantContext {
  establishmentId?: string | null
}

export interface TenantEntity {
  establishmentId?: string | null
}

export function assertSameTenant(
  context: TenantContext,
  entity: TenantEntity,
): { allowed: boolean; reason?: string } {
  if (!context.establishmentId || !entity.establishmentId) {
    return {
      allowed: false,
      reason: 'Tenant context missing',
    }
  }

  if (context.establishmentId !== entity.establishmentId) {
    return {
      allowed: false,
      reason: 'Cross-establishment access denied',
    }
  }

  return { allowed: true }
}

export function buildTenantWhereClause(establishmentId?: string | null) {
  if (!establishmentId) {
    return {}
  }

  return {
    establishmentId,
  }
}
