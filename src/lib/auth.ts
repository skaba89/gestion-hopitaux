// HealthFlow Africa - NextAuth Configuration
// Phone + OTP authentication for hospital staff

import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

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
            id: user.id,
            name: user.name,
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
        token.role = extUser.role || 'Médecin'
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
  secret: process.env.NEXTAUTH_SECRET || 'healthflow-guinea-secret-key-2024',
  debug: process.env.NODE_ENV === 'development',
}
