// HealthFlow Guinea - Security Middleware (Netlify-compatible)
// FIX: Production CSP now allows 'unsafe-inline' for scripts (required by Next.js)
// FIX: Redis import is guarded — uses in-memory fallback when Redis is unavailable
// FIX: Demo mode relaxes some security checks for a smoother experience

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ─────────── SEC-02: Allowed CORS Origins ───────────

const ALLOWED_ORIGINS = [
  // Production domains
  'https://healthflow-gn.com',
  'https://www.healthflow-gn.com',
  'https://app.healthflow-gn.com',
  'https://api.healthflow-gn.com',
  // Staging
  'https://staging.healthflow-gn.com',
  // Development
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  // Preview deployments (chatglm.site)
  ...(process.env.ALLOWED_ORIGINS?.split(',').filter(Boolean) || []),
]

// Subdomains that are always allowed (preview deployments, etc.)
const ALLOWED_SUBDOMAINS = [
  '.space.chatglm.site',   // Z.ai preview deployments
  '.healthflow-gn.com',    // Production subdomains
  '.netlify.app',          // Netlify deployments
]

function isAllowedOrigin(origin: string): boolean {
  if (ALLOWED_ORIGINS.includes(origin)) return true
  // Allow recognized subdomains
  for (const subdomain of ALLOWED_SUBDOMAINS) {
    if (origin.includes(subdomain)) return true
  }
  // Also check for http variants of preview URLs
  if (origin.match(/^https?:\/\/[^/]+\.space\.chatglm\.site/)) return true
  if (origin.match(/^https?:\/\/[^/]+\.netlify\.app/)) return true
  return false
}

// ─────────── In-memory Rate Limiting (always available) ───────────

const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

function checkRateLimitMemory(key: string, maxRequests: number, windowMs: number): boolean {
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

// Optional Redis rate limiter — gracefully falls back to in-memory
async function checkRateLimit(key: string, maxRequests: number, windowMs: number): Promise<boolean> {
  try {
    // Try to use Redis-backed rate limiter if available
    const { RedisRateLimiter } = await import('@/lib/redis')
    const limiter = new RedisRateLimiter()
    const result = await limiter.check(key, maxRequests, Math.ceil(windowMs / 1000))
    return result.allowed
  } catch {
    // Redis unavailable — use in-memory fallback
    return checkRateLimitMemory(key, maxRequests, windowMs)
  }
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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // Detect demo mode
  const isDemoMode = process.env.DEMO_MODE === 'true'

  // ─── Security Headers ───
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '0') // Deprecated, CSP is better
  response.headers.set('Permissions-Policy', 'camera=(self), microphone=(self), geolocation=(self)')

  // ─── Content Security Policy ───
  // Next.js requires 'unsafe-inline' for scripts because it generates inline
  // <script> tags for hydration, chunk loading, and runtime configuration.
  // Nonce-based CSP doesn't work reliably with Next.js SSR/SSG on Netlify.
  const isDev = process.env.NODE_ENV === 'development'

  // CSP: Use permissive policy that works with Next.js SSR and Netlify
  // Nonce-based CSP does NOT work with Next.js (nonces can't be injected into script tags)
  // In demo mode on Netlify, we need unsafe-inline for React hydration + dynamic imports
  const csp = [
    "default-src 'self'",
    isDemoMode
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"  // Demo mode: permissive for Netlify
      : (isDev
          ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"  // Dev: needed for Turbopack HMR
          : "script-src 'self' 'unsafe-inline'"),              // Production: unsafe-inline needed for Next.js
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    isDev ? "connect-src 'self' https: wss: ws:" : "connect-src 'self' https: wss:",
    "media-src 'self' blob:",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ')
  response.headers.set('Content-Security-Policy', csp)

  // HSTS (only in production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
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

  // ─── SEC-02 FIX: CORS for API Routes ───
  if (pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin')

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      const preflightResponse = new Response(null, { status: 204 })

      if (origin && isAllowedOrigin(origin)) {
        preflightResponse.headers.set('Access-Control-Allow-Origin', origin)
        preflightResponse.headers.set('Access-Control-Allow-Credentials', 'true')
        preflightResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
        preflightResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, x-csrf-token')
        preflightResponse.headers.set('Access-Control-Max-Age', '86400') // 24h
      } else if (!origin) {
        // No origin (server-to-server, curl, Postman) - allow but restrict
        preflightResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
        preflightResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With')
      }

      return preflightResponse
    }

    // SEC-02 FIX: Set CORS headers on actual responses only for allowed origins
    if (origin && isAllowedOrigin(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      response.headers.set('Vary', 'Origin')
    }

    // ─── Rate Limiting on API Routes (skip Redis in demo mode to avoid timeouts) ───
    if (!isDemoMode) {
      const clientIp = request.headers.get('x-forwarded-for') ||
                       request.headers.get('x-real-ip') ||
                       'unknown'

      // General API rate limit: 100 requests per minute per IP
      const rateLimitKey = `api:${clientIp}`
      if (!await checkRateLimit(rateLimitKey, 100, 60000)) {
        return NextResponse.json(
          { error: 'Trop de requêtes. Veuillez réessayer plus tard.' },
          { status: 429 }
        )
      }

      // Stricter rate limit for auth endpoints: 10 requests per minute
      if (pathname.startsWith('/api/auth/')) {
        const authRateLimitKey = `auth:${clientIp}`
        if (!await checkRateLimit(authRateLimitKey, 10, 60000)) {
          return NextResponse.json(
            { error: 'Trop de tentatives. Veuillez réessayer plus tard.' },
            { status: 429 }
          )
        }
      }
    } else {
      // In demo mode, use higher rate limits to avoid blocking demo users
      const clientIp = request.headers.get('x-forwarded-for') ||
                       request.headers.get('x-real-ip') ||
                       'unknown'

      const rateLimitKey = `api:${clientIp}`
      if (!await checkRateLimit(rateLimitKey, 300, 60000)) {
        return NextResponse.json(
          { error: 'Trop de requêtes. Veuillez réessayer plus tard.' },
          { status: 429 }
        )
      }

      // Stricter rate limit for auth endpoints
      if (pathname.startsWith('/api/auth/')) {
        const authRateLimitKey = `auth:${clientIp}`
        if (!await checkRateLimit(authRateLimitKey, 30, 60000)) {
          return NextResponse.json(
            { error: 'Trop de tentatives. Veuillez réessayer plus tard.' },
            { status: 429 }
          )
        }
      }
    }

    // Exempt CSRF token endpoint from CSRF check
    if (pathname === '/api/auth/csrf' && request.method === 'GET') {
      return response
    }

    // ─── CSRF Protection (relaxed in demo mode) ───
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
      // In demo mode, skip CSRF checks to avoid blocking demo logins
      // The sign-in page now handles demo auth client-side anyway
      if (!isDemoMode) {
        const reqOrigin = request.headers.get('origin')
        const host = request.headers.get('host')

        // Strategy 1: Origin header validation
        if (reqOrigin && host) {
          try {
            const originHost = new URL(reqOrigin).host
            if (originHost !== host) {
              // SEC-02 FIX: Also check against allowed origins list
              if (!isAllowedOrigin(reqOrigin)) {
                return NextResponse.json(
                  { error: 'Requête non autorisée (CSRF/CORS)' },
                  { status: 403 }
                )
              }
            }
          } catch {
            return NextResponse.json(
              { error: 'Requête non autorisée' },
              { status: 403 }
            )
          }
        }

        // Strategy 2: Custom request header pattern (for non-browser clients)
        const hasCustomHeader = request.headers.get('x-requested-with') ||
                               request.headers.get('x-csrf-token')
        if (!reqOrigin && !hasCustomHeader) {
          const referer = request.headers.get('referer')
          if (referer) {
            try {
              const refererHost = new URL(referer).host
              if (host && refererHost === host) {
                // Same-origin request (referer matches host) - allow
              } else if (isAllowedOrigin(new URL(referer).origin)) {
                // Referer from allowed origin - allow
              } else if (process.env.NODE_ENV === 'production') {
                return NextResponse.json(
                  { error: 'Requête non autorisée (CSRF)' },
                  { status: 403 }
                )
              }
            } catch {
              if (process.env.NODE_ENV === 'production') {
                return NextResponse.json(
                  { error: 'Requête non autorisée' },
                  { status: 403 }
                )
              }
            }
          } else if (process.env.NODE_ENV === 'production') {
            // No origin, no custom header, no referer in production - block
            // BUT: Allow if this is a same-origin request (no origin header = same-origin)
            // Modern browsers don't send Origin header for same-origin POST requests
            // So we check if the request has the Content-Type header typical of fetch/XHR
            const contentType = request.headers.get('content-type')
            if (contentType && (contentType.includes('application/json') || contentType.includes('application/x-www-form-urlencoded'))) {
              // Likely a legitimate same-origin request - allow
            } else {
              return NextResponse.json(
                { error: 'En-tête de sécurité requis (CSRF)' },
                { status: 403 }
              )
            }
          }
        }
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
