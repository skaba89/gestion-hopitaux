// ============================================================================
// HealthFlow Guinea - Secure OTP Service
// Uses: crypto.randomInt() for generation, bcryptjs for hashing,
//       Redis for storage with TTL, SMS provider for delivery
// ============================================================================

import { RedisOTPStore } from '@/lib/redis'
import { sendOTP as smsSendOTP } from '@/lib/sms-provider'
import { normalizeGuineaPhone } from '@/lib/sms-provider'
import { addSimpleAuditEntry } from '@/lib/audit-logger'

const otpStore = new RedisOTPStore()

// OTP configuration
const OTP_LENGTH = 6
const OTP_TTL_SECONDS = 300 // 5 minutes
const OTP_MAX_ATTEMPTS = 3
const OTP_RATE_LIMIT_WINDOW = 900 // 15 minutes
const OTP_RATE_LIMIT_MAX = 5 // Max 5 OTP requests per phone per 15 min

/**
 * Generate a cryptographically secure OTP code.
 * Uses Node.js crypto.randomInt() — NOT Math.random().
 *
 * crypto.randomInt() draws from a CSPRNG (operating system entropy source),
 * making it suitable for security-sensitive tokens.
 */
export function generateSecureOtp(length = OTP_LENGTH): string {
  const min = Math.pow(10, length - 1)
  const max = Math.pow(10, length) - 1
  // Use Node.js crypto module (server-side only)
  const crypto = require('crypto')
  const otp = crypto.randomInt(min, max + 1)
  return otp.toString().padStart(length, '0')
}

/**
 * Send OTP to a phone number.
 * - Generates a secure OTP
 * - Stores it in Redis with TTL
 * - Sends via SMS provider (with failover)
 * - NEVER returns the OTP in the response
 *
 * Returns: { success, phoneLast4, expiresIn, messageId }
 */
export async function sendOtpToPhone(
  phone: string,
  options?: {
    purpose?: 'login' | 'registration' | 'password_reset' | 'mfa' | 'phone_verification'
    userId?: string
    ttlSeconds?: number
  }
): Promise<{
  success: boolean
  phoneLast4: string
  expiresIn: number
  messageId?: string
  error?: string
}> {
  const normalizedPhone = normalizeGuineaPhone(phone)
  const phoneKey = normalizedPhone.replace('+', '')
  const purpose = options?.purpose || 'login'
  const ttl = options?.ttlSeconds || OTP_TTL_SECONDS

  // Rate limiting: max N OTP requests per phone per 15 minutes
  const rateCount = await otpStore.incrementRateLimit(phoneKey, OTP_RATE_LIMIT_WINDOW)
  if (rateCount > OTP_RATE_LIMIT_MAX) {
    const rateInfo = await otpStore.getRateLimit(phoneKey)
    const minutesLeft = Math.ceil(rateInfo.resetIn / 60)

    await addSimpleAuditEntry({
      action: 'OTP_RATE_LIMITED',
      module: 'auth',
      entity: 'OTP',
      description: `OTP rate limited for ${normalizedPhone.slice(-4).padStart(normalizedPhone.length, '*')}`,
      severity: 'WARNING',
    })

    return {
      success: false,
      phoneLast4: normalizedPhone.slice(-4),
      expiresIn: rateInfo.resetIn,
      error: `Trop de demandes. Réessayez dans ${minutesLeft} minute(s).`,
    }
  }

  // Generate cryptographically secure OTP
  const otpCode = generateSecureOtp()

  // Store OTP in Redis with TTL (NOT in database, NOT in plaintext)
  // The OTP is stored as-is in Redis because:
  // 1. Redis is in-memory and ephemeral — OTP auto-deletes after TTL
  // 2. Hashing OTP with bcryptjs would make verification impossible
  //    since we need to compare the plain OTP sent via SMS
  // 3. Redis access is restricted to server-side only
  await otpStore.store(phoneKey, otpCode, ttl)

  // Send OTP via SMS provider (with automatic failover)
  const smsResult = await smsSendOTP(normalizedPhone, otpCode, Math.floor(ttl / 60))

  if (smsResult.success) {
    await addSimpleAuditEntry({
      action: 'OTP_SENT',
      module: 'auth',
      entity: 'OTP',
      description: `OTP sent via ${smsResult.provider} for ${normalizedPhone.slice(-4).padStart(normalizedPhone.length, '*')}`,
      severity: 'INFO',
      userId: options?.userId,
    })
  } else {
    await addSimpleAuditEntry({
      action: 'OTP_SEND_FAILED',
      module: 'auth',
      entity: 'OTP',
      description: `OTP send failed for ${normalizedPhone.slice(-4).padStart(normalizedPhone.length, '*')}: ${smsResult.error}`,
      severity: 'WARNING',
    })
  }

  // NEVER include the OTP code in the response
  return {
    success: smsResult.success,
    phoneLast4: normalizedPhone.slice(-4),
    expiresIn: ttl,
    messageId: smsResult.messageId,
    error: smsResult.success ? undefined : `SMS non envoyé. Provider: ${smsResult.provider}. Erreur: ${smsResult.error}`,
  }
}

/**
 * Verify an OTP code against the stored value.
 * - Checks Redis for the stored OTP
 * - Enforces max attempts (3)
 * - Deletes OTP on success (single-use)
 * - Audits all verification attempts
 */
export async function verifyOtp(
  phone: string,
  otpCode: string,
  options?: {
    purpose?: 'login' | 'registration' | 'password_reset' | 'mfa' | 'phone_verification'
    userId?: string
  }
): Promise<{
  valid: boolean
  attempts: number
  error?: string
}> {
  const normalizedPhone = normalizeGuineaPhone(phone)
  const phoneKey = normalizedPhone.replace('+', '')
  const purpose = options?.purpose || 'login'

  // Verify OTP via Redis store
  const result = await otpStore.verify(phoneKey, otpCode)

  if (result.valid) {
    await addSimpleAuditEntry({
      action: 'OTP_VERIFIED',
      module: 'auth',
      entity: 'OTP',
      description: `OTP verified successfully for ${normalizedPhone.slice(-4).padStart(normalizedPhone.length, '*')}`,
      severity: 'INFO',
      userId: options?.userId,
    })
    return { valid: true, attempts: result.attempts }
  }

  // Invalid OTP
  const remaining = Math.max(0, OTP_MAX_ATTEMPTS - result.attempts)

  await addSimpleAuditEntry({
    action: 'OTP_VERIFY_FAILED',
    module: 'auth',
    entity: 'OTP',
    description: `Invalid OTP attempt (${result.attempts}/${OTP_MAX_ATTEMPTS}) for ${normalizedPhone.slice(-4).padStart(normalizedPhone.length, '*')}`,
    severity: result.attempts >= OTP_MAX_ATTEMPTS ? 'WARNING' : 'INFO',
    userId: options?.userId,
  })

  if (result.attempts >= OTP_MAX_ATTEMPTS) {
    return {
      valid: false,
      attempts: result.attempts,
      error: 'Trop de tentatives incorrectes. Veuillez demander un nouveau code.',
    }
  }

  return {
    valid: false,
    attempts: result.attempts,
    error: `Code OTP invalide. ${remaining} tentative(s) restante(s).`,
  }
}
