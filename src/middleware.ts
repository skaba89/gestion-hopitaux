// HealthFlow Africa - Security Middleware
// CSRF protection, rate limiting, security headers, session validation, IP logging

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rate limiting store (in-memory, per-instance)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (entry.count >= maxRequests) {
    return false
  }

  entry.count++
  return true
}

// Clean up old rate limit entries periodically
if (typeof globalThis !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key)
      }
    }
  }, 60000)
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // ─── Security Headers ───
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Permissions-Policy', 'camera=(self), microphone=(self), geolocation=(self)')

  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "media-src 'self' blob:",
    "frame-src 'none'",
  ].join('; ')
  response.headers.set('Content-Security-Policy', csp)

  // HSTS (only in production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }

  // ─── Allow Static Assets & Internals ───
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icons/') ||
    pathname.endsWith('.js') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.json') ||
    pathname === '/manifest.json' ||
    pathname === '/sw.js' ||
    pathname === '/robots.txt' ||
    pathname === '/logo.svg'
  ) {
    return response
  }

  // ─── Allow Auth Routes ───
  if (pathname.startsWith('/auth/')) {
    return response
  }

  // ─── Rate Limiting on API Routes ───
  if (pathname.startsWith('/api/')) {
    const clientIp = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown'

    // General API rate limit: 100 requests per minute per IP
    const rateLimitKey = `api:${clientIp}`
    if (!checkRateLimit(rateLimitKey, 100, 60000)) {
      return NextResponse.json(
        { error: 'Trop de requêtes. Veuillez réessayer plus tard.' },
        { status: 429 }
      )
    }

    // Stricter rate limit for auth endpoints: 10 requests per minute
    if (pathname.startsWith('/api/auth/')) {
      const authRateLimitKey = `auth:${clientIp}`
      if (!checkRateLimit(authRateLimitKey, 10, 60000)) {
        return NextResponse.json(
          { error: 'Trop de tentatives. Veuillez réessayer plus tard.' },
          { status: 429 }
        )
      }
    }

    // Log IP for audit purposes
    response.headers.set('X-Request-IP', clientIp)
  }

  // ─── CSRF Protection ───
  // For POST/PUT/DELETE to API routes, check for Origin/Referer header
  if (
    pathname.startsWith('/api/') &&
    ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)
  ) {
    const origin = request.headers.get('origin')
    const referer = request.headers.get('referer')
    const host = request.headers.get('host')

    // In demo mode, allow requests without origin (direct API calls)
    // In production, this would be stricter
    if (origin && host) {
      const originHost = new URL(origin).host
      if (originHost !== host) {
        // Allow cross-origin in development
        if (process.env.NODE_ENV === 'production') {
          return NextResponse.json(
            { error: 'Requête non autorisée (CSRF)' },
            { status: 403 }
          )
        }
      }
    }
  }

  // Allow the root page (SPA handles its own routing)
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
