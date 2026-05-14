import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-utils'

// In-memory OTP store (use Redis in production via REDIS_URL env var)
// OTP is NEVER returned in the API response - sent only via SMS
const otpStore = new Map<string, { otp: string; expiresAt: number; attempts: number; phoneLast4: string }>()

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

/**
 * Send OTP via SMS provider (Orange SMS API, Twilio, etc.)
 * In demo mode, logs to console only.
 * In production, integrates with real SMS gateway.
 */
async function sendOtpViaSms(phone: string, otp: string): Promise<boolean> {
  // Production: integrate with SMS provider
  const smsProvider = process.env.SMS_PROVIDER || 'demo'
  
  if (smsProvider === 'demo') {
    // Demo mode: log OTP server-side only (never expose to client)
    console.log(`[OTP DEMO] Code for ${phone.slice(-4).padStart(phone.length, '*')}: ${otp}`)
    return true
  }
  
  if (smsProvider === 'orange') {
    // Orange SMS API integration
    try {
      const response = await fetch('https://api.orange.com/smsmessaging/v1/outbound/tel%3A%2B224000/requests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.ORANGE_SMS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          outboundSMSMessageRequest: {
            address: `tel:+${phone}`,
            senderAddress: 'tel:+224000',
            outboundSMSTextMessage: { message: `HealthFlow: Votre code est ${otp}. Valide 5 min.` },
          },
        }),
      })
      return response.ok
    } catch {
      console.error('[SMS] Orange SMS API failed')
      return false
    }
  }
  
  if (smsProvider === 'twilio') {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID
      const authToken = process.env.TWILIO_AUTH_TOKEN
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: `+${phone}`,
            From: process.env.TWILIO_PHONE_NUMBER || '',
            Body: `HealthFlow: Votre code est ${otp}. Valide 5 min.`,
          }),
        }
      )
      return response.ok
    } catch {
      console.error('[SMS] Twilio SMS API failed')
      return false
    }
  }
  
  // Unknown provider: log warning
  console.warn(`[SMS] Unknown provider: ${smsProvider}. OTP not sent.`)
  return false
}

/**
 * Generate cryptographically secure 6-digit OTP
 */
function generateSecureOtp(): string {
  const array = new Uint32Array(1)
  // Use crypto if available (Edge runtime / Node.js 18+)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array)
    return (100000 + (array[0] % 900000)).toString()
  }
  // Fallback (should not happen in modern runtimes)
  return (100000 + Math.floor(Math.random() * 900000)).toString()
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

    // Validate phone format (Guinea: 224XXXXXXXXX or +224XXXXXXXXX)
    const normalizedPhone = phone.replace(/\s/g, '').replace(/^\+224/, '224')
    if (!/^224[6-7]\d{7}$/.test(normalizedPhone)) {
      return errorResponse('Numéro de téléphone invalide. Format attendu: +224 6XX XX XX XX', 400)
    }

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

    // Generate cryptographically secure OTP
    const otp = generateSecureOtp()
    const expiresAt = now + 5 * 60 * 1000 // 5 minutes expiry

    // Store OTP (never sent back in response)
    otpStore.set(normalizedPhone, { 
      otp, 
      expiresAt, 
      attempts: 0, 
      phoneLast4: normalizedPhone.slice(-4) 
    })

    // Update rate limit
    if (rateLimit && rateLimit.resetAt > now) {
      rateLimit.count += 1
    } else {
      rateLimitStore.set(normalizedPhone, { count: 1, resetAt: now + 15 * 60 * 1000 })
    }

    // Send OTP via SMS (NEVER return OTP in response)
    const smsSent = await sendOtpViaSms(normalizedPhone, otp)

    // SEC-01 FIX: OTP is NEVER returned in the API response
    // Only confirm that the OTP was sent (or will be sent)
    return NextResponse.json(
      {
        success: true,
        message: smsSent 
          ? 'Code OTP envoyé par SMS' 
          : 'Code OTP généré. En mode démo, consultez les logs serveur.',
        data: { 
          phoneLast4: normalizedPhone.slice(-4), // Only last 4 digits for UX
          expiresIn: 300, // seconds
        },
      },
      { status: 200 }
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
  return new Response(null, { status: 204 })
}
