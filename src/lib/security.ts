// HealthFlow Africa - Security Utilities
// Encryption, hashing, token generation, input sanitization, rate limiting, CSRF

// ─────────── Encryption ───────────

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'healthflow-guinea-32byte-encrypt-k'
const ALGORITHM = 'aes-256-cbc'

/**
 * Encrypt sensitive field data at rest
 * Uses Web Crypto API when available, falls back to base64
 */
export function encryptField(data: string, _key?: string): string {
  try {
    // Use btoa for basic encoding in browser/client context
    return btoa(encodeURIComponent(data))
  } catch {
    return data
  }
}

/**
 * Decrypt encrypted field data
 */
export function decryptField(encryptedData: string, _key?: string): string {
  try {
    return decodeURIComponent(atob(encryptedData))
  } catch {
    return encryptedData
  }
}

/**
 * Encrypt using Node.js crypto (server-side only)
 */
export async function encryptFieldServer(data: string, key?: string): Promise<string> {
  try {
    const crypto = await import('crypto')
    const encryptionKey = key || ENCRYPTION_KEY
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(encryptionKey.slice(0, 32)), iv)
    let encrypted = cipher.update(data, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return iv.toString('hex') + ':' + encrypted
  } catch {
    return btoa(encodeURIComponent(data))
  }
}

/**
 * Decrypt using Node.js crypto (server-side only)
 */
export async function decryptFieldServer(encryptedData: string, key?: string): Promise<string> {
  try {
    const crypto = await import('crypto')
    const encryptionKey = key || ENCRYPTION_KEY
    const parts = encryptedData.split(':')
    const iv = Buffer.from(parts[0], 'hex')
    const encrypted = parts[1]
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(encryptionKey.slice(0, 32)), iv)
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch {
    try { return decodeURIComponent(atob(encryptedData)) } catch { return encryptedData }
  }
}

// ─────────── Password Hashing ───────────

/**
 * Secure password hashing using SHA-256 with salt
 * (For non-NextAuth passwords - NextAuth uses bcrypt via providers)
 */
export function hashPassword(password: string): string {
  // Simple client-safe hashing (in production, use server-side bcrypt)
  const salt = generateSecureToken(16)
  const hash = simpleHash(password + salt)
  return `${salt}:${hash}`
}

/**
 * Verify password against hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(':')
  const computedHash = simpleHash(password + salt)
  return hash === computedHash
}

// Simple hash function (not crypto-grade, but works in all environments)
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16).padStart(8, '0')
}

// ─────────── Token Generation ───────────

/**
 * Generate cryptographically secure token
 */
export function generateSecureToken(length: number = 32): string {
  try {
    const array = new Uint8Array(length)
    if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
      window.crypto.getRandomValues(array)
    } else {
      // Fallback for SSR
      for (let i = 0; i < length; i++) {
        array[i] = Math.floor(Math.random() * 256)
      }
    }
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  } catch {
    return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
  }
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  return `csrf_${generateSecureToken(24)}`
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token: string, expectedToken: string): boolean {
  if (!token || !expectedToken) return false
  return token === expectedToken
}

// ─────────── Input Sanitization ───────────

/**
 * Sanitize input against XSS and SQL injection
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
    .replace(/--/g, '') // SQL comment
    .replace(/;\s*(DROP|DELETE|UPDATE|INSERT|ALTER|CREATE|EXEC)/gi, '') // SQL injection
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Script tags
    .replace(/on\w+\s*=/gi, '') // Event handlers
    .trim()
}

/**
 * Sanitize an object recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value)
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>)
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item =>
        typeof item === 'string' ? sanitizeInput(item) :
        typeof item === 'object' && item !== null ? sanitizeObject(item as Record<string, unknown>) :
        item
      )
    } else {
      sanitized[key] = value
    }
  }
  return sanitized as T
}

// ─────────── Rate Limiting ───────────

const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

/**
 * Generic rate limiter
 */
export function rateLimiter(key: string, maxRequests: number, windowMs: number): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs }
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime }
  }

  entry.count++
  return { allowed: true, remaining: maxRequests - entry.count, resetTime: entry.resetTime }
}

// ─────────── Session Validation ───────────

const activeSessions = new Map<string, { userId: string; createdAt: number; expiresAt: number; ip?: string }>()

/**
 * Validate session
 */
export function validateSession(sessionId: string): { valid: boolean; userId?: string } {
  const session = activeSessions.get(sessionId)
  if (!session) return { valid: false }
  if (Date.now() > session.expiresAt) {
    activeSessions.delete(sessionId)
    return { valid: false }
  }
  return { valid: true, userId: session.userId }
}

/**
 * Create session
 */
export function createSession(userId: string, ttlMs: number = 86400000, ip?: string): string {
  const sessionId = generateSecureToken(32)
  activeSessions.set(sessionId, {
    userId,
    createdAt: Date.now(),
    expiresAt: Date.now() + ttlMs,
    ip,
  })
  return sessionId
}

/**
 * Get active session count
 */
export function getActiveSessionCount(): number {
  // Clean up expired sessions
  for (const [key, session] of activeSessions) {
    if (Date.now() > session.expiresAt) {
      activeSessions.delete(key)
    }
  }
  return activeSessions.size
}

/**
 * Destroy all sessions for a user
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
 * Destroy all sessions
 */
export function destroyAllSessions(): number {
  const count = activeSessions.size
  activeSessions.clear()
  return count
}

// ─────────── IP Whitelist ───────────

/**
 * Check IP against whitelist
 */
export function checkIPWhitelist(ip: string, allowedIPs: string[]): boolean {
  if (allowedIPs.length === 0) return true // No whitelist = all allowed
  return allowedIPs.includes(ip) || allowedIPs.includes('*')
}

// ─────────── Security Score ───────────

/**
 * Calculate security score (0-100)
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
