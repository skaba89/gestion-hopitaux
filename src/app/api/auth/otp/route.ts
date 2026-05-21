import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode, findDemoUserByPhone } from '@/lib/demo-users'

// In-memory OTP storage for demo mode
const demoOtpStore = new Map<string, { code: string; expires: number; attempts: number }>()

/**
 * POST /api/auth/otp - Generate and send OTP
 * DEMO MODE: Returns OTP in response (auto-filled on frontend)
 * PRODUCTION: Sends via SMS, never returns OTP in response
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone } = body

    if (!phone) {
      return NextResponse.json(
        { error: 'Numéro de téléphone requis' },
        { status: 400 }
      )
    }

    // Normalize phone
    const normalizedPhone = phone.startsWith('+') ? phone : `+224${phone.replace(/\D/g, '').slice(-9)}`

    // ─── DEMO MODE ───
    if (isDemoMode()) {
      const demoCode = '123456'
      demoOtpStore.set(normalizedPhone, {
        code: demoCode,
        expires: Date.now() + 5 * 60 * 1000, // 5 minutes
        attempts: 0,
      })

      return NextResponse.json({
        success: true,
        message: 'Code OTP envoyé (mode démonstration)',
        data: {
          phoneLast4: normalizedPhone.slice(-4),
          expiresIn: 300,
          otp: demoCode, // In demo mode, return OTP for auto-fill
        },
      })
    }

    // ─── PRODUCTION MODE ───
    const { sendOtpToPhone } = await import('@/lib/otp-service')

    const result = await sendOtpToPhone(normalizedPhone, { purpose: 'login' })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Erreur lors de l'envoi du code OTP" },
        { status: 429 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Code OTP envoyé par SMS',
      data: {
        phoneLast4: result.phoneLast4,
        expiresIn: result.expiresIn,
      },
    })
  } catch (err: any) {
    console.error('OTP send error:', err)
    return NextResponse.json(
      { error: "Erreur lors de l'envoi du code OTP" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/auth/otp - Verify OTP and return user data
 * DEMO MODE: Verifies against in-memory store, matches demo users
 * PRODUCTION: Verifies via Redis, looks up user in PostgreSQL
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, otp, otpCode } = body
    const code = otp || otpCode

    if (!phone || !code) {
      return NextResponse.json(
        { error: 'Numéro de téléphone et code OTP requis' },
        { status: 400 }
      )
    }

    const normalizedPhone = phone.startsWith('+') ? phone : `+224${phone.replace(/\D/g, '').slice(-9)}`

    // ─── DEMO MODE ───
    if (isDemoMode()) {
      const stored = demoOtpStore.get(normalizedPhone)

      if (!stored) {
        return NextResponse.json(
          { error: 'Aucun code OTP trouvé. Veuillez demander un nouveau code.' },
          { status: 401 }
        )
      }

      if (Date.now() > stored.expires) {
        demoOtpStore.delete(normalizedPhone)
        return NextResponse.json(
          { error: 'Code OTP expiré. Veuillez demander un nouveau code.' },
          { status: 401 }
        )
      }

      stored.attempts++

      if (stored.attempts > 3) {
        demoOtpStore.delete(normalizedPhone)
        return NextResponse.json(
          { error: 'Trop de tentatives. Veuillez demander un nouveau code.' },
          { status: 429 }
        )
      }

      if (code !== stored.code) {
        return NextResponse.json(
          { error: 'Code OTP invalide' },
          { status: 401 }
        )
      }

      // OTP verified — find demo user
      demoOtpStore.delete(normalizedPhone)
      const demoUser = findDemoUserByPhone(normalizedPhone)

      if (!demoUser) {
        return NextResponse.json(
          { error: 'Numéro non enregistré en mode démonstration. Utilisez un des comptes démo.' },
          { status: 401 }
        )
      }

      return NextResponse.json({
        success: true,
        data: {
          id: demoUser.id,
          name: `${demoUser.firstName} ${demoUser.lastName}`,
          email: demoUser.email,
          phone: demoUser.phone,
          role: demoUser.role,
          establishmentId: demoUser.establishmentId,
          establishmentName: demoUser.establishmentName,
        },
      })
    }

    // ─── PRODUCTION MODE ───
    const { verifyOtp } = await import('@/lib/otp-service')
    const { normalizeGuineaPhone } = await import('@/lib/sms-provider')
    const { db } = await import('@/lib/db')

    const normalizedProd = normalizeGuineaPhone(phone)

    const otpResult = await verifyOtp(phone, code, { purpose: 'login' })

    if (!otpResult.valid) {
      const status = otpResult.attempts >= 3 ? 429 : 401
      return NextResponse.json(
        { error: otpResult.error || 'Code OTP invalide' },
        { status }
      )
    }

    let user = null
    const phoneSuffix = normalizedProd.replace('+224', '')

    try {
      const dbUser = await db.user.findFirst({
        where: {
          OR: [
            { phone: { contains: phoneSuffix } },
            { phone: normalizedProd },
            { phone },
          ],
          isActive: true,
        },
        include: {
          establishments: { where: { isDefault: true }, take: 1 },
          roles: {
            include: { role: { include: { permissions: { include: { permission: true } } } } },
            take: 5,
          },
        },
      })

      if (dbUser) {
        await db.user.update({
          where: { id: dbUser.id },
          data: { lastLoginAt: new Date() },
        })

        const permissions = dbUser.roles.flatMap(ur =>
          ur.role.permissions.map(rp => rp.permission.name)
        )

        user = {
          id: dbUser.id,
          name: `${dbUser.firstName} ${dbUser.lastName}`,
          email: dbUser.email,
          phone: dbUser.phone || normalizedProd,
          role: dbUser.roles[0]?.role?.name || 'Patient',
          establishmentId: dbUser.establishments[0]?.establishmentId || '',
          establishmentName: 'Hôpital Donka',
        }
      }
    } catch (dbError) {
      console.warn('[Auth] Database lookup failed:', dbError)
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Numéro non enregistré. Veuillez contacter l\'administration.' },
        { status: 401 }
      )
    }

    return NextResponse.json({ success: true, data: user })
  } catch (err: any) {
    console.error('OTP verify error:', err)
    return NextResponse.json(
      { error: 'Erreur lors de la vérification' },
      { status: 500 }
    )
  }
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return new Response(null, { status: 204 })
}
