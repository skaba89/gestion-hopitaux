export function getRequiredEnv(name: string): string {
  const value = process.env[name]

  if (!value || value.trim().length === 0) {
    throw new Error(`${name} is required`)
  }

  return value
}

export function getJwtSecret(): Uint8Array {
  const secret = getRequiredEnv('JWT_SECRET')

  if (process.env.NODE_ENV === 'production' && secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production')
  }

  return new TextEncoder().encode(secret)
}

export function getNextAuthSecret(): string {
  const secret = getRequiredEnv('NEXTAUTH_SECRET')

  if (process.env.NODE_ENV === 'production' && secret.length < 32) {
    throw new Error('NEXTAUTH_SECRET must be at least 32 characters in production')
  }

  return secret
}

export const AUTH_ISSUER = 'healthflow-guinea'
export const STAFF_AUDIENCE = 'staff-portal'
export const SESSION_MAX_AGE_SECONDS = 12 * 60 * 60
