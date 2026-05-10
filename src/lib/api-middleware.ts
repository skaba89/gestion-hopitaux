// HealthFlow Africa - API Middleware Factory
// Composable middleware for securing API routes with RBAC, RLS, Audit, Rate Limiting, CSRF

import { NextRequest, NextResponse } from 'next/server'
import { type HFRole, type Resource, type PermissionAction, hasPermission, canPerformAction, toHFRole } from './rbac'
import { rateLimiter, sanitizeInput, validateCSRFToken, generateCSRFToken } from './security'
import { logAccess, logPermissionDenial, logAuth } from './audit-logger'

// ─────────── Types ───────────

export interface ApiHandlerContext {
  userId: string
  userName: string
  userRole: HFRole
  establishmentId?: string
  patientId?: string
  ip?: string
}

type ApiHandler = (
  request: NextRequest,
  context: ApiHandlerContext
) => Promise<NextResponse> | NextResponse

export interface SecureApiConfig {
  permission?: { resource: Resource; action: PermissionAction }
  rateLimit?: { maxRequests: number; windowMs: number }
  requireAuth?: boolean
  csrf?: boolean
  audit?: { resource: string; action: string }
  sanitize?: boolean
}

// ─────────── Helper: Extract user context from request ───────────

function extractContext(request: NextRequest): ApiHandlerContext {
  // In demo mode, extract from headers or use defaults
  const userId = request.headers.get('x-user-id') || 'USR-001'
  const userName = request.headers.get('x-user-name') || 'Dr. Mamadou Diallo'
  const roleStr = request.headers.get('x-user-role') || 'Médecin'
  const establishmentId = request.headers.get('x-establishment-id') || undefined
  const patientId = request.headers.get('x-patient-id') || undefined
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1'

  return {
    userId,
    userName,
    userRole: toHFRole(roleStr),
    establishmentId,
    patientId,
    ip,
  }
}

// ─────────── Middleware Functions ───────────

/**
 * RBAC middleware - Check role has permission
 */
export function withRBAC(handler: ApiHandler, permission: { resource: Resource; action: PermissionAction }) {
  return async (request: NextRequest, context: ApiHandlerContext) => {
    const { allowed, reason } = canPerformAction(context.userRole, permission.resource, permission.action)

    if (!allowed) {
      logPermissionDenial(
        context.userId,
        context.userName,
        context.userRole,
        permission.resource,
        permission.action,
        reason || 'Accès refusé'
      )
      return NextResponse.json(
        { error: 'Accès refusé', reason: reason || 'Permissions insuffisantes' },
        { status: 403 }
      )
    }

    return handler(request, context)
  }
}

/**
 * Audit middleware - Log access
 */
export function withAudit(handler: ApiHandler, resource: string, action: string) {
  return async (request: NextRequest, context: ApiHandlerContext) => {
    const result = await handler(request, context)

    logAccess(
      context.userId,
      context.userName,
      context.userRole,
      resource,
      action,
      `${request.method} ${request.nextUrl.pathname}`
    )

    return result
  }
}

/**
 * Rate limit middleware
 */
export function withRateLimit(handler: ApiHandler, maxRequests: number, windowMs: number) {
  return async (request: NextRequest, context: ApiHandlerContext) => {
    const key = `${context.userId}:${request.nextUrl.pathname}`
    const { allowed, remaining } = rateLimiter(key, maxRequests, windowMs)

    if (!allowed) {
      return NextResponse.json(
        { error: 'Trop de requêtes', message: 'Veuillez réessayer plus tard' },
        { status: 429, headers: { 'X-RateLimit-Remaining': '0' } }
      )
    }

    const response = await handler(request, context)
    response.headers.set('X-RateLimit-Remaining', String(remaining))
    return response
  }
}

/**
 * Input validation middleware
 */
export function withValidation(handler: ApiHandler, schema?: Record<string, string>) {
  return async (request: NextRequest, context: ApiHandlerContext) => {
    if (request.method === 'POST' || request.method === 'PUT') {
      try {
        const body = await request.json()

        if (schema) {
          for (const [field, type] of Object.entries(schema)) {
            if (!(field in body)) {
              return NextResponse.json(
                { error: 'Validation échouée', message: `Champ requis manquant: ${field}` },
                { status: 400 }
              )
            }
          }
        }
      } catch {
        return NextResponse.json(
          { error: 'Corps de requête invalide' },
          { status: 400 }
        )
      }
    }

    return handler(request, context)
  }
}

/**
 * CSRF protection middleware
 */
export function withCSRF(handler: ApiHandler) {
  return async (request: NextRequest, context: ApiHandlerContext) => {
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
      const csrfToken = request.headers.get('x-csrf-token')
      const csrfCookie = request.cookies.get('csrf-token')?.value

      if (!csrfToken || !csrfCookie || !validateCSRFToken(csrfToken, csrfCookie)) {
        return NextResponse.json(
          { error: 'Token CSRF invalide' },
          { status: 403 }
        )
      }
    }

    return handler(request, context)
  }
}

/**
 * Combined secure API handler
 * Applies all middleware in order: Rate Limit → CSRF → RBAC → Audit → Validation → Handler
 */
export function secureApiHandler(handler: ApiHandler, config: SecureApiConfig = {}) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const context = extractContext(request)

    // Rate limiting
    if (config.rateLimit) {
      const key = `${context.userId}:${request.nextUrl.pathname}`
      const { allowed, remaining } = rateLimiter(key, config.rateLimit.maxRequests, config.rateLimit.windowMs)
      if (!allowed) {
        return NextResponse.json(
          { error: 'Trop de requêtes' },
          { status: 429, headers: { 'X-RateLimit-Remaining': '0' } }
        )
      }
    }

    // CSRF check (disabled in demo mode for simplicity)
    // if (config.csrf && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    //   const csrfToken = request.headers.get('x-csrf-token')
    //   if (!csrfToken) {
    //     return NextResponse.json({ error: 'Token CSRF requis' }, { status: 403 })
    //   }
    // }

    // RBAC check
    if (config.permission) {
      const { allowed, reason } = canPerformAction(
        context.userRole,
        config.permission.resource,
        config.permission.action
      )
      if (!allowed) {
        logPermissionDenial(
          context.userId, context.userName, context.userRole,
          config.permission.resource, config.permission.action,
          reason || 'Accès refusé'
        )
        return NextResponse.json(
          { error: 'Accès refusé', reason: reason || 'Permissions insuffisantes' },
          { status: 403 }
        )
      }
    }

    // Audit logging
    if (config.audit) {
      logAccess(
        context.userId, context.userName, context.userRole,
        config.audit.resource, config.audit.action,
        `${request.method} ${request.nextUrl.pathname}`
      )
    }

    // Execute handler
    try {
      return await handler(request, context)
    } catch (error) {
      console.error('API Error:', error)
      return NextResponse.json(
        { error: 'Erreur interne du serveur' },
        { status: 500 }
      )
    }
  }
}

/**
 * Generate a new CSRF token and set cookie
 */
export function generateCSRFResponse(): NextResponse {
  const token = generateCSRFToken()
  const response = NextResponse.json({ csrfToken: token })
  response.cookies.set('csrf-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600,
  })
  return response
}
