import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { corsHeaders, successResponse, errorResponse } from '@/lib/api-utils'

// In-memory OTP store (in production, use Redis or DB)
const otpStore = new Map<string, { otp: string; expiresAt: number; attempts: number }>()

// Rate limiting: max 3 OTP requests per phone per 15 minutes
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

function cleanExpiredOtps() {
  const now = Date.now()
  for (const [key, value] of otpStore.entries()) {
    if (value.expiresAt < now) {
      otpStore.delete(key)
    }
  }
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt < now) {
      rateLimitStore.delete(key)
    }
  }
}

// POST /api/auth/otp - Generate and send OTP
export async function POST(request: NextRequest) {
  try {
    cleanExpiredOtps()

    const body = await request.json()
    const { phone } = body

    if (!phone) {
      return errorResponse('Numéro de téléphone requis', 400)
    }

    // Normalize phone number
    const normalizedPhone = phone.replace(/\s/g, '').replace(/^\+224/, '224')

    // Rate limiting check
    const rateLimit = rateLimitStore.get(normalizedPhone)
    const now = Date.now()

    if (rateLimit && rateLimit.resetAt > now && rateLimit.count >= 3) {
      const remainingMs = rateLimit.resetAt - now
      const remainingMin = Math.ceil(remainingMs / 60000)
      return errorResponse(
        `Trop de tentatives. Veuillez réessayer dans ${remainingMin} minute(s).`,
        429
      )
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = now + 5 * 60 * 1000 // 5 minutes expiry

    // Store OTP
    otpStore.set(normalizedPhone, { otp, expiresAt, attempts: 0 })

    // Update rate limit
    if (rateLimit && rateLimit.resetAt > now) {
      rateLimit.count += 1
    } else {
      rateLimitStore.set(normalizedPhone, { count: 1, resetAt: now + 15 * 60 * 1000 })
    }

    // In production, send OTP via SMS (e.g., Twilio, Orange SMS API)
    // For demo, we return the OTP in the response
    console.log(`[OTP] Code for ${normalizedPhone}: ${otp}`)

    return NextResponse.json(
      {
        success: true,
        message: 'Code OTP envoyé',
        // In production, remove this:
        data: { otp, phone: normalizedPhone },
      },
      { status: 200, headers: corsHeaders() }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur lors de l'envoi du code OTP"
    return errorResponse(message, 500)
  }
}

// POST /api/auth/otp/verify - Verify OTP and return user data
export async function PUT(request: NextRequest) {
  try {
    cleanExpiredOtps()

    const body = await request.json()
    const { phone, otp } = body

    if (!phone || !otp) {
      return errorResponse('Numéro de téléphone et code OTP requis', 400)
    }

    const normalizedPhone = phone.replace(/\s/g, '').replace(/^\+224/, '224')
    const stored = otpStore.get(normalizedPhone)

    if (!stored) {
      return errorResponse('Aucun code OTP trouvé pour ce numéro. Veuillez demander un nouveau code.', 404)
    }

    // Check expiry
    if (Date.now() > stored.expiresAt) {
      otpStore.delete(normalizedPhone)
      return errorResponse('Code OTP expiré. Veuillez demander un nouveau code.', 410)
    }

    // Check attempts
    stored.attempts += 1
    if (stored.attempts > 3) {
      otpStore.delete(normalizedPhone)
      return errorResponse('Trop de tentatives incorrectes. Veuillez demander un nouveau code.', 429)
    }

    // Verify OTP
    if (stored.otp !== otp) {
      return errorResponse(`Code OTP invalide. ${3 - stored.attempts} tentative(s) restante(s).`, 401)
    }

    // OTP is valid - clean up
    otpStore.delete(normalizedPhone)

    // Look up user in database
    let user = null
    try {
      // Try to find user by phone
      const dbUser = await db.user.findFirst({
        where: { phone: normalizedPhone, isActive: true },
        include: {
          establishments: {
            where: { isDefault: true },
            take: 1,
          },
          roles: {
            include: { role: true },
            take: 1,
          },
        },
      })

      if (dbUser) {
        // Update last login
        await db.user.update({
          where: { id: dbUser.id },
          data: { lastLoginAt: new Date() },
        })

        user = {
          id: dbUser.id,
          name: `${dbUser.firstName} ${dbUser.lastName}`,
          email: dbUser.email,
          phone: dbUser.phone || normalizedPhone,
          role: dbUser.roles[0]?.role?.name || 'Médecin',
          establishmentId: dbUser.establishments[0]?.establishmentId || '',
        }
      }
    } catch (dbError) {
      console.warn('Database lookup failed, using demo user:', dbError)
    }

    // If no user found in DB, create a demo user for the session
    if (!user) {
      user = {
        id: `demo-${Date.now()}`,
        name: 'Dr. Mamadou Diallo',
        email: 'm.diallo@healthflow-gn.com',
        phone: normalizedPhone,
        role: 'Médecin',
        establishmentId: 'demo-establishment',
      }
    }

    return successResponse(user, 'Connexion réussie')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur lors de la vérification'
    return errorResponse(message, 500)
  }
}

// OPTIONS handler
export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() })
}
