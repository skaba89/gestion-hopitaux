// HealthFlow Guinea - NextAuth Configuration (Production-Ready)
// Supports: Email+Password (staff), Phone+OTP (staff & patients)
// SEC-07: NEXTAUTH_SECRET mandatory in production
// SEC-11: Default role is 'Patient' (least privilege)

import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import { verifyOtp } from '@/lib/otp-service'
import { normalizeGuineaPhone } from '@/lib/sms-provider'

// SEC-07 FIX: Fail fast if NEXTAUTH_SECRET is not set in production
if (!process.env.NEXTAUTH_SECRET && process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE !== 'phase-production-build') {
  throw new Error(
    '[SECURITY] NEXTAUTH_SECRET environment variable is required in production. ' +
    'Generate one with: openssl rand -base64 32'
  )
}

export const authOptions: NextAuthOptions = {
  providers: [
    // ========================================
    // Provider 1: Email + Password (Staff Login)
    // Uses bcryptjs for password verification
    // ========================================
    CredentialsProvider({
      id: 'email-password',
      name: 'Email Password',
      credentials: {
        email: {
          label: 'Adresse email',
          type: 'email',
          placeholder: 'utilisateur@chu-donka.gn',
        },
        password: {
          label: 'Mot de passe',
          type: 'password',
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email et mot de passe requis')
        }

        try {
          // Look up user by email
          const user = await db.user.findUnique({
            where: { email: credentials.email },
            include: {
              establishments: {
                where: { isDefault: true },
                take: 1,
              },
              roles: {
                include: { role: { include: { permissions: { include: { permission: true } } } } },
                take: 5,
              },
            },
          })

          if (!user) {
            throw new Error('Identifiants invalides')
          }

          if (!user.isActive) {
            throw new Error('Compte désactivé. Contactez l\'administration.')
          }

          // Check account lockout
          if (user.lockedUntil && new Date() < new Date(user.lockedUntil)) {
            const remainingMinutes = Math.ceil(
              (new Date(user.lockedUntil).getTime() - Date.now()) / 60000
            )
            throw new Error(`Compte bloqué. Réessayez dans ${remainingMinutes} minute(s).`)
          }

          // Verify password using bcryptjs
          const bcryptjs = await import('bcryptjs')
          const isValidPassword = await bcryptjs.compare(credentials.password, user.passwordHash)

          if (!isValidPassword) {
            const failedAttempts = user.failedLoginAttempts + 1

            if (failedAttempts >= 5) {
              await db.user.update({
                where: { id: user.id },
                data: {
                  failedLoginAttempts: failedAttempts,
                  lockedUntil: new Date(Date.now() + 15 * 60 * 1000),
                }
              })
              throw new Error('Compte bloqué pour 15 minutes suite à trop de tentatives.')
            }

            await db.user.update({
              where: { id: user.id },
              data: { failedLoginAttempts: failedAttempts }
            })

            throw new Error('Identifiants invalides')
          }

          // Successful login — update last login and reset counters
          await db.user.update({
            where: { id: user.id },
            data: {
              lastLoginAt: new Date(),
              failedLoginAttempts: 0,
              lockedUntil: null,
            }
          })

          const permissions = user.roles.flatMap(ur =>
            ur.role.permissions.map(rp => rp.permission.name)
          )

          return {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            phone: user.phone || '',
            role: user.roles[0]?.role?.name || 'Patient',
            establishmentId: user.establishments[0]?.establishmentId || '',
            permissions: [...new Set(permissions)],
            mfaEnabled: user.mfaEnabled,
          }

        } catch (error) {
          if (error instanceof Error) {
            throw new Error(error.message)
          }
          throw new Error('Erreur d\'authentification')
        }
      },
    }),

    // ========================================
    // Provider 2: Phone + OTP (Staff & Patients)
    // Uses Redis-backed OTP service + SMS provider
    // ========================================
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
          throw new Error('Numéro de téléphone et code OTP requis')
        }

        try {
          // Verify OTP via secure OTP service (Redis)
          const otpResult = await verifyOtp(credentials.phone, credentials.otp, {
            purpose: 'login',
          })

          if (!otpResult.valid) {
            throw new Error(otpResult.error || 'Code OTP invalide')
          }

          // Look up user by phone
          const phone = normalizeGuineaPhone(credentials.phone)
          const phoneSuffix = phone.replace('+224', '')

          const user = await db.user.findFirst({
            where: {
              OR: [
                { phone: { contains: phoneSuffix } },
                { phone: phone },
              ],
              isActive: true,
            },
            include: {
              establishments: {
                where: { isDefault: true },
                take: 1,
              },
              roles: {
                include: { role: { include: { permissions: { include: { permission: true } } } } },
                take: 5,
              },
            },
          })

          if (user) {
            await db.user.update({
              where: { id: user.id },
              data: {
                lastLoginAt: new Date(),
                failedLoginAttempts: 0,
                lockedUntil: null,
              }
            })

            const permissions = user.roles.flatMap(ur =>
              ur.role.permissions.map(rp => rp.permission.name)
            )

            return {
              id: user.id,
              name: `${user.firstName} ${user.lastName}`,
              email: user.email,
              phone: user.phone || phone,
              role: user.roles[0]?.role?.name || 'Patient',
              establishmentId: user.establishments[0]?.establishmentId || '',
              permissions: [...new Set(permissions)],
              mfaEnabled: user.mfaEnabled,
            }
          }

          // SECURITY FIX: No user found in DB — do NOT create a fake guest user.
          // Guest users with non-cuid IDs break foreign key references and
          // pollute the session store. Instead, require registration first.
          throw new Error(
            'Aucun compte trouvé pour ce numéro. Veuillez vous inscrire d\'abord.'
          )

        } catch (error) {
          if (error instanceof Error) {
            throw new Error(error.message)
          }
          throw new Error('Erreur d\'authentification')
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 12 * 60 * 60, // 12 hours
    updateAge: 4 * 60 * 60, // Update JWT every 4 hours
  },

  jwt: {
    maxAge: 12 * 60 * 60,
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin',
    verifyRequest: '/auth/verify',
  },

  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        // @ts-ignore — Extended user properties from authorize()
        token.id = user.id
        // @ts-ignore
        token.role = user.role || 'Patient'
        // @ts-ignore
        token.phone = user.phone || ''
        // @ts-ignore
        token.establishmentId = user.establishmentId || ''
        // @ts-ignore
        token.permissions = user.permissions || []
        // @ts-ignore
        token.mfaEnabled = user.mfaEnabled || false
      }

      // Refresh token — re-verify user is still active
      if (trigger === 'update' && token.id) {
        try {
          const refreshedUser = await db.user.findUnique({
            where: { id: token.id as string },
            select: { isActive: true, roles: { include: { role: { include: { permissions: { include: { permission: true } } } } }, take: 5 } }
          })

          if (!refreshedUser || !refreshedUser.isActive) {
            return { ...token, error: 'USER_DEACTIVATED' }
          }

          const permissions = refreshedUser.roles.flatMap(ur =>
            ur.role.permissions.map(rp => rp.permission.name)
          )
          token.permissions = [...new Set(permissions)]
        } catch {
          // If DB lookup fails, keep existing token data
        }
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore — Extended session properties
        session.user.id = token.id
        // @ts-ignore
        session.user.role = token.role
        // @ts-ignore
        session.user.phone = token.phone
        // @ts-ignore
        session.user.establishmentId = token.establishmentId
        // @ts-ignore
        session.user.permissions = token.permissions
        // @ts-ignore
        session.user.mfaEnabled = token.mfaEnabled
      }

      // If user was deactivated, add error flag
      if (token.error === 'USER_DEACTIVATED') {
        // @ts-ignore
        session.error = 'USER_DEACTIVATED'
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

  events: {
    async signIn({ user }) {
      console.log(`[Auth] User signed in: ${user.email || user.name}`)
    },
    async signOut() {
      console.log('[Auth] User signed out')
    },
  },
}
