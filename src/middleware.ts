// HealthFlow Guinea - Security Middleware (Hardened v2)
// SEC-02 FIX: CORS restricted to allowed origins (no wildcard)
// SEC-06 FIX: CSRF protection with origin checking + custom header pattern
// SEC-08 FIX: Tightened CSP (removed unsafe-inline/unsafe-eval)
// Rate limiting, security headers

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
]

// In development, also allow .space.chatglm.site subdomains
function isAllowedOrigin(origin: string): boolean {
  if (ALLOWED_ORIGINS.includes(origin)) return true
  // Allow recognized subdomains (always, not just in dev)
  for (const subdomain of ALLOWED_SUBDOMAINS) {
    if (origin.includes(subdomain)) return true
  }
  // Also check for http variants of preview URLs
  if (origin.match(/^https?:\/\/[^/]+\.space\.chatglm\.site/)) return true
  return false
}

// ─────────── Rate Limiting (Redis-backed with in-memory fallback) ───────────

import { getRedis, RedisRateLimiter } from '@/lib/redis'

let middlewareRateLimiter: RedisRateLimiter | null = null

async function checkRateLimit(key: string, maxRequests: number, windowMs: number): Promise<boolean> {
  try {
    if (!middlewareRateLimiter) {
      middlewareRateLimiter = new RedisRateLimiter()
    }
    const result = await middlewareRateLimiter.check(key, maxRequests, Math.ceil(windowMs / 1000))
    return result.allowed
  } catch {
    // Fallback to in-memory if Redis is unavailable
    return checkRateLimitMemory(key, maxRequests, windowMs)
  }
}

// In-memory fallback
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

// Clean up old rate limit entries periodically (memory fallback only)
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

  // ─── Security Headers ───
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '0') // Deprecated, CSP is better
  response.headers.set('Permissions-Policy', 'camera=(self), microphone=(self), geolocation=(self)')

  // SEC-08 FIX: Tightened Content Security Policy
  // In development: relax CSP for Turbopack HMR (inline scripts, eval, WebSocket)
  // In production: strict CSP with nonce-based script loading
  const isDev = process.env.NODE_ENV === 'development'
  
  if (isDev) {
    // Development CSP — relaxed for Turbopack HMR compatibility
    const devCsp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  // Turbopack HMR needs inline + eval
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https: wss: ws:",  // WebSocket for HMR
      "media-src 'self' blob:",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join('; ')
    response.headers.set('Content-Security-Policy', devCsp)
  } else {
    // Production CSP — strict with nonce
    const nonce = crypto.randomUUID ? Buffer.from(crypto.randomUUID()).toString('base64').slice(0, 24) : ''
    const prodCsp = [
      "default-src 'self'",
      `script-src 'self' 'nonce-${nonce}'`,
      `style-src 'self' 'unsafe-inline'`,     // Style unsafe-inline still needed for Tailwind/shadcn
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https: wss:",
      "media-src 'self' blob:",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join('; ')
    response.headers.set('Content-Security-Policy', prodCsp)
    // Set nonce for downstream use (production only)
    if (nonce) {
      response.headers.set('x-nonce', nonce)
    }
  }

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
      // If origin is present but not allowed: NO CORS headers = browser blocks it
      
      return preflightResponse
    }

    // SEC-02 FIX: Set CORS headers on actual responses only for allowed origins
    if (origin && isAllowedOrigin(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      response.headers.set('Vary', 'Origin')
    }
    // NO wildcard (*) - rejected origins get no CORS headers = blocked by browser

    // ─── Rate Limiting on API Routes ───
    const clientIp = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown'

    // General API rate limit: 100 requests per minute per IP (now Redis-backed)
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

    // Exempt CSRF token endpoint from CSRF check
    if (pathname === '/api/auth/csrf' && request.method === 'GET') {
      return response
    }

    // ─── CSRF Protection (SEC-06 FIX: Always active for mutating requests) ───
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
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
        // In development, allow without CSRF headers for convenience
        // In production, also allow same-host requests (browser sends no origin for same-origin)
        // But block cross-origin requests without origin/custom header
        const referer = request.headers.get('referer')
        if (referer) {
          // If there's a referer, check it's from an allowed origin
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
          return NextResponse.json(
            { error: 'En-tête de sécurité requis (CSRF)' },
            { status: 403 }
          )
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
