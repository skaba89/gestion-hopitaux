// HealthFlow Guinea - API Middleware Factory (Hardened v3)
// SEC-05: verified JWT/demo-token context instead of trusting client identity headers
// SEC-06: CSRF protection with double-submit cookie pattern

import { NextRequest, NextResponse } from 'next/server'
import { type HFRole, type Resource, type PermissionAction, canPerformAction, toHFRole } from './rbac'
import { rateLimiter as _rateLimiter, validateCSRFToken, generateCSRFToken } from './security'
import { logAccess, logPermissionDenial, logCSRFViolation, logRateLimitHit } from './audit-logger'
import { verifyStaffJwt } from '@/lib/auth/jwt'
import { demoUsers } from '@/lib/demo-users'

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

function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1'
}

function extractBearerToken(request: NextRequest): string | null {
  const authorization = request.headers.get('authorization')
  if (!authorization?.startsWith('Bearer ')) return null
  return authorization.slice('Bearer '.length).trim()
}

function decodeDemoToken(token: string): ApiHandlerContext | null {
  if (process.env.DEMO_MODE !== 'true' || !token.startsWith('demo.')) {
    return null
  }

  try {
    const encodedPayload = token.slice('demo.'.length)
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64').toString('utf8')) as {
      sub?: string
      role?: string
      exp?: number
      demo?: boolean
    }

    if (!payload.demo || !payload.sub || !payload.role || !payload.exp || payload.exp < Date.now()) {
      return null
    }

    const demoUser = demoUsers.find(user => user.id === payload.sub)
    if (!demoUser) return null

    return {
      userId: demoUser.id,
      userName: `${demoUser.firstName} ${demoUser.lastName}`,
      userRole: toHFRole(demoUser.role),
      establishmentId: demoUser.establishmentId,
    }
  } catch {
    return null
  }
}

async function verifyAuthorizationHeader(request: NextRequest): Promise<ApiHandlerContext | null> {
  const token = extractBearerToken(request)
  if (!token) return null

  const demoContext = decodeDemoToken(token)
  if (demoContext) return demoContext

  try {
    const { payload } = await verifyStaffJwt(token)
    const userId = String(payload.userId || payload.sub || '')
    if (!userId) return null

    return {
      userId,
      userName: String(payload.name || payload.email || 'Utilisateur'),
      userRole: toHFRole(String(payload.role || 'Patient')),
      establishmentId: payload.establishmentId ? String(payload.establishmentId) : undefined,
    }
  } catch {
    return null
  }
}

async function verifyNextAuthCookie(request: NextRequest): Promise<ApiHandlerContext | null> {
  const sessionToken =
    request.cookies.get('next-auth.session-token')?.value ||
    request.cookies.get('__Secure-next-auth.session-token')?.value

  if (!sessionToken) return null

  try {
    const parts = sessionToken.split('.')
    if (parts.length !== 3) return null

    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as {
      id?: string
      name?: string
      role?: string
      establishmentId?: string
      exp?: number
    }

    if (!payload.id || (payload.exp && payload.exp * 1000 <= Date.now())) {
      return null
    }

    return {
      userId: payload.id,
      userName: payload.name || 'Utilisateur',
      userRole: toHFRole(payload.role || 'Patient'),
      establishmentId: payload.establishmentId,
    }
  } catch {
    return null
  }
}

async function extractContext(request: NextRequest): Promise<ApiHandlerContext> {
  const ip = getClientIp(request)

  const authHeaderContext = await verifyAuthorizationHeader(request)
  if (authHeaderContext) {
    return { ...authHeaderContext, ip }
  }

  const cookieContext = await verifyNextAuthCookie(request)
  if (cookieContext) {
    return { ...cookieContext, ip }
  }

  return {
    userId: 'anonymous',
    userName: 'Anonymous',
    userRole: 'Patient',
    ip,
  }
}

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
        reason || 'Accès refusé',
      )
      return NextResponse.json(
        { error: 'Accès refusé', reason: reason || 'Permissions insuffisantes' },
        { status: 403 },
      )
    }

    return handler(request, context)
  }
}

export function withAudit(handler: ApiHandler, resource: string, action: string) {
  return async (request: NextRequest, context: ApiHandlerContext) => {
    const result = await handler(request, context)

    logAccess(
      context.userId,
      context.userName,
      context.userRole,
      resource,
      action,
      `${request.method} ${request.nextUrl.pathname}`,
      context.ip,
    )

    return result
  }
}

export function withRateLimit(handler: ApiHandler, maxRequests: number, windowMs: number) {
  return async (request: NextRequest, context: ApiHandlerContext) => {
    const key = `${context.userId}:${request.nextUrl.pathname}`
    const { allowed, remaining } = await _rateLimiter(key, maxRequests, windowMs)

    if (!allowed) {
      logRateLimitHit(context.userId, context.ip || '127.0.0.1', request.nextUrl.pathname)
      return NextResponse.json(
        { error: 'Trop de requêtes', message: 'Veuillez réessayer plus tard' },
        { status: 429, headers: { 'X-RateLimit-Remaining': '0' } },
      )
    }

    const response = await handler(request, context)
    response.headers.set('X-RateLimit-Remaining', String(remaining))
    return response
  }
}

export function withValidation(handler: ApiHandler, schema?: Record<string, string>) {
  return async (request: NextRequest, context: ApiHandlerContext) => {
    if (request.method === 'POST' || request.method === 'PUT') {
      try {
        const body = await request.json()

        if (schema) {
          for (const field of Object.keys(schema)) {
            if (!(field in body)) {
              return NextResponse.json(
                { error: 'Validation échouée', message: `Champ requis manquant: ${field}` },
                { status: 400 },
              )
            }
          }
        }
      } catch {
        return NextResponse.json(
          { error: 'Corps de requête invalide' },
          { status: 400 },
        )
      }
    }

    return handler(request, context)
  }
}

export function withCSRF(handler: ApiHandler) {
  return async (request: NextRequest, context: ApiHandlerContext) => {
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
      const csrfToken = request.headers.get('x-csrf-token')
      const csrfCookie = request.cookies.get('csrf-token')?.value

      if (!csrfToken || !csrfCookie) {
        logCSRFViolation(
          context.ip || '127.0.0.1',
          request.headers.get('origin') || 'unknown',
          request.nextUrl.pathname,
        )
        return NextResponse.json(
          { error: 'Token CSRF requis' },
          { status: 403 },
        )
      }

      if (!validateCSRFToken(csrfToken, csrfCookie)) {
        logCSRFViolation(
          context.ip || '127.0.0.1',
          request.headers.get('origin') || 'unknown',
          request.nextUrl.pathname,
        )
        return NextResponse.json(
          { error: 'Token CSRF invalide' },
          { status: 403 },
        )
      }
    }

    return handler(request, context)
  }
}

export function secureApiHandler(handler: ApiHandler, config: SecureApiConfig = {}) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const context = await extractContext(request)

    if (config.rateLimit) {
      const key = `${context.userId}:${request.nextUrl.pathname}`
      const { allowed, remaining } = await _rateLimiter(key, config.rateLimit.maxRequests, config.rateLimit.windowMs)
      if (!allowed) {
        logRateLimitHit(context.userId, context.ip || '127.0.0.1', request.nextUrl.pathname)
        return NextResponse.json(
          { error: 'Trop de requêtes' },
          { status: 429, headers: { 'X-RateLimit-Remaining': '0' } },
        )
      }
      void remaining
    }

    if (config.csrf && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
      const csrfToken = request.headers.get('x-csrf-token')
      const csrfCookie = request.cookies.get('csrf-token')?.value

      if (process.env.NODE_ENV === 'production') {
        if (!csrfToken || !csrfCookie || !validateCSRFToken(csrfToken, csrfCookie)) {
          logCSRFViolation(
            context.ip || '127.0.0.1',
            request.headers.get('origin') || 'unknown',
            request.nextUrl.pathname,
          )
          return NextResponse.json({ error: 'Token CSRF invalide' }, { status: 403 })
        }
      }
    }

    if (config.requireAuth && context.userId === 'anonymous') {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 },
      )
    }

    if (config.permission) {
      const { allowed, reason } = canPerformAction(
        context.userRole,
        config.permission.resource,
        config.permission.action,
      )
      if (!allowed) {
        logPermissionDenial(
          context.userId, context.userName, context.userRole,
          config.permission.resource, config.permission.action,
          reason || 'Accès refusé',
        )
        return NextResponse.json(
          { error: 'Accès refusé', reason: reason || 'Permissions insuffisantes' },
          { status: 403 },
        )
      }
    }

    if (config.audit) {
      logAccess(
        context.userId, context.userName, context.userRole,
        config.audit.resource, config.audit.action,
        `${request.method} ${request.nextUrl.pathname}`,
        context.ip,
      )
    }

    try {
      return await handler(request, context)
    } catch (error) {
      console.error('API Error:', error)
      return NextResponse.json(
        { error: 'Erreur interne du serveur' },
        { status: 500 },
      )
    }
  }
}

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
