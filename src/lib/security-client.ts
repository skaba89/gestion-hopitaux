// HealthFlow Guinea - Client-Safe Security Utilities
// This module contains ONLY functions that are safe to run in the browser.
// Server-only functions (encryption, password hashing, etc.) remain in security.ts
//
// IMPORTANT: Do NOT import from 'crypto', 'bcryptjs', or any Node.js built-in
// in this file. It is imported by client components.

// ─────────── Session Validation (Client-Safe) ───────────

const activeSessions = new Map<string, { userId: string; createdAt: number; expiresAt: number; ip?: string; userRole?: string }>()

/**
 * Validate session (client-safe, uses in-memory store)
 */
export function validateSession(sessionId: string): { valid: boolean; userId?: string; userRole?: string } {
  const session = activeSessions.get(sessionId)
  if (!session) return { valid: false }
  if (Date.now() > session.expiresAt) {
    activeSessions.delete(sessionId)
    return { valid: false }
  }
  return { valid: true, userId: session.userId, userRole: session.userRole }
}

/**
 * Create session (client-safe)
 */
export function createSession(userId: string, ttlMs: number = 86400000, ip?: string, userRole?: string): string {
  const sessionId = generateSecureToken(32)
  activeSessions.set(sessionId, {
    userId,
    createdAt: Date.now(),
    expiresAt: Date.now() + ttlMs,
    ip,
    userRole,
  })
  return sessionId
}

/**
 * Get active session count (client-safe)
 */
export function getActiveSessionCount(): number {
  for (const [key, session] of activeSessions) {
    if (Date.now() > session.expiresAt) {
      activeSessions.delete(key)
    }
  }
  return activeSessions.size
}

/**
 * Destroy all sessions for a user (client-safe)
 */
export function destroyUserSessions(userId: string): number {
  let count = 0
  for (const [key, session] of activeSessions) {
    if (session.userId === userId) {
      activeSessions.delete(key)
      count++
    }
  }
  return count
}

/**
 * Destroy all sessions (client-safe)
 */
export function destroyAllSessions(): number {
  const count = activeSessions.size
  activeSessions.clear()
  return count
}

// ─────────── Token Generation (Client-Safe) ───────────

/**
 * Generate cryptographically secure token using Web Crypto API
 * Client-safe: only uses crypto.getRandomValues (available in browser)
 */
export function generateSecureToken(length: number = 32): string {
  try {
    const array = new Uint8Array(length)
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(array)
    } else {
      throw new Error('[SECURITY] No secure random number generator available')
    }
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  } catch {
    throw new Error('[SECURITY] Failed to generate secure token - this is a critical error')
  }
}

/**
 * Constant-time string comparison to prevent timing attacks (client-safe)
 */
export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

// ─────────── Security Score (Client-Safe) ───────────

/**
 * Calculate security score (0-100)
 * Pure computation, no server dependencies
 */
export function calculateSecurityScore(stats: {
  mfaEnabled: boolean
  strongPassword: boolean
  recentAuditReview: boolean
  noFailedAttempts: boolean
  csrfEnabled: boolean
  encryptionEnabled: boolean
  rlsEnabled: boolean
  rateLimitEnabled: boolean
}): number {
  let score = 0
  if (stats.mfaEnabled) score += 15
  if (stats.strongPassword) score += 10
  if (stats.recentAuditReview) score += 15
  if (stats.noFailedAttempts) score += 10
  if (stats.csrfEnabled) score += 12
  if (stats.encryptionEnabled) score += 13
  if (stats.rlsEnabled) score += 15
  if (stats.rateLimitEnabled) score += 10
  return score
}

// ─────────── Input Sanitization (Client-Safe) ───────────

/**
 * Sanitize input against XSS (client-safe)
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return ''
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/\\/g, '&#x5C;')
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
}
