import { SignJWT, jwtVerify } from 'jose'
import { AUTH_ISSUER, getJwtSecret, SESSION_MAX_AGE_SECONDS, STAFF_AUDIENCE } from '@/lib/auth/auth-config'

export interface StaffJwtPayload {
  userId: string
  email: string
  role: string
  establishmentId: string
  permissions?: string[]
}

export async function signStaffJwt(payload: StaffJwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .setIssuedAt()
    .setIssuer(AUTH_ISSUER)
    .setAudience(STAFF_AUDIENCE)
    .sign(getJwtSecret())
}

export async function verifyStaffJwt(token: string) {
  return jwtVerify(token, getJwtSecret(), {
    issuer: AUTH_ISSUER,
    audience: STAFF_AUDIENCE,
  })
}
