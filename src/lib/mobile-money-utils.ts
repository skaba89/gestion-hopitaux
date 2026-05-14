/**
 * HealthFlow Guinea - Mobile Money Utilities (Client-Safe)
 * Pure utility functions with NO server-side dependencies (ioredis, prisma, redis)
 * Safe to import from client components
 */

import { randomBytes } from 'crypto'

export type MobileMoneyProvider = 'Orange Money' | 'MTN MoMo'

/* ─────────── Phone Number Validation ─────────── */

export function detectProvider(phone: string): MobileMoneyProvider | null {
  const cleaned = phone.replace(/\s/g, '')
  if (cleaned.startsWith('+2246') || cleaned.startsWith('2246') || cleaned.startsWith('6')) return 'Orange Money'
  if (cleaned.startsWith('+2245') || cleaned.startsWith('2245') || cleaned.startsWith('5')) return 'MTN MoMo'
  return null
}

export function isValidGuineaPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s/g, '')
  return /^(\+224|224)[56]\d{7}$/.test(cleaned)
}

export function formatPhoneGuinea(phone: string): string {
  const cleaned = phone.replace(/\s/g, '').replace(/^\+224/, '224').replace(/^224/, '')
  if (cleaned.length !== 9) return phone
  return `+224 ${cleaned.slice(0, 1)}${cleaned.slice(1, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7, 9)}`
}

/* ─────────── Reference Generation ─────────── */

export function generateReference(provider: MobileMoneyProvider): string {
  const prefix = provider === 'Orange Money' ? 'OM' : 'MTN'
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  // Use Math.random for client-safe reference generation
  // Server-side uses crypto.randomBytes for more secure references
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')
  return `${prefix}-${date}-${seq}`
}

export function generateTransactionId(): string {
  return `MM-${Date.now()}-${String(Math.floor(Math.random() * 99)).padStart(2, '0')}`
}
