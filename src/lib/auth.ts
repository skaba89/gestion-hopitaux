// HealthFlow Guinea - NextAuth Configuration (Hardened)
// Phone + OTP authentication for hospital staff
// SEC-07 FIX: NEXTAUTH_SECRET is mandatory (no fallback)
// SEC-11 FIX: Default role is 'Patient' (least privilege)

import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

// SEC-07 FIX: Fail fast if NEXTAUTH_SECRET is not set
if (!process.env.NEXTAUTH_SECRET && process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE !== 'phase-production-build') {
  throw new Error(
    '[SECURITY] NEXTAUTH_SECRET environment variable is required in production. ' +
    'Generate one with: openssl rand -base64 32'
  )
}

interface ExtendedUser {
  id?: string
  name?: string | null
  email?: string | null
  image?: string | null
  phone?: string
  role?: string
  establishmentId?: string
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'phone-otp',
      name: 'Phone OTP',
      credentials: {
        phone: {
          label: 'Numéro de téléphone',
          type: 'tel',
          placeholder: '+224 6XX XX XX XX',
        },
        otp: {
          label: 'Code OTP',
          type: 'text',
          placeholder: '000000',
        },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.otp) {
          return null
        }

        try {
          // Verify OTP via our API
          const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
          const response = await fetch(`${baseUrl}/api/auth/otp/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone: credentials.phone,
              otp: credentials.otp,
            }),
          })

          if (!response.ok) {
            return null
          }

          const result = await response.json()

          if (!result.success || !result.data) {
            return null
          }

          const user: ExtendedUser = result.data

          return {
            id: user.id ?? '',
            name: user.name ?? null,
            email: user.email || `${user.phone}@healthflow-gn.com`,
            phone: user.phone,
            role: user.role,
            establishmentId: user.establishmentId,
          }
        } catch {
          return null
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const extUser = user as unknown as ExtendedUser
        token.id = user.id
        // SEC-11 FIX: Default to 'Patient' (least privilege) instead of 'Médecin'
        token.role = extUser.role || 'Patient'
        token.phone = extUser.phone || ''
        token.establishmentId = extUser.establishmentId || ''
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        const extUser = session.user as Record<string, unknown>
        extUser.id = token.id
        extUser.role = token.role
        extUser.phone = token.phone
        extUser.establishmentId = token.establishmentId
      }
      return session
    },
  },
  // SEC-07 FIX: In development, use a warning fallback. In production, MUST be set via env.
  secret: process.env.NEXTAUTH_SECRET || (
    process.env.NODE_ENV === 'development' 
      ? 'healthflow-dev-only-secret-DO-NOT-USE-IN-PRODUCTION' 
      : undefined
  ),
  debug: process.env.NODE_ENV === 'development',
}
