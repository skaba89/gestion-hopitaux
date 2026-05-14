import { NextRequest, NextResponse } from 'next/server'
import { mobileMoneyService, isValidGuineaPhone, detectProvider } from '@/lib/mobile-money'
import { z } from 'zod'

// Validation schema for payment initiation
const initiatePaymentSchema = z.object({
  phoneNumber: z.string().min(8, 'Numéro de téléphone requis'),
  amount: z.number().positive('Montant doit être positif'),
  currency: z.enum(['GNF', 'USD']).default('GNF'),
  reason: z.string().min(1, 'Raison du paiement requise').max(200),
  invoiceId: z.string().optional(),
  patientName: z.string().min(2, 'Nom du patient requis'),
  patientId: z.string().min(1, 'ID patient requis'),
  provider: z.enum(['Orange Money', 'MTN MoMo']).optional(),
})

/**
 * POST /api/payments/mobile-money
 * Initiate a Mobile Money payment via Orange Money or MTN MoMo
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = initiatePaymentSchema.parse(body)

    if (!isValidGuineaPhone(validated.phoneNumber)) {
      return NextResponse.json(
        { success: false, message: 'Numéro de téléphone invalide. Format: +224 XXX XX XX XX' },
        { status: 400 }
      )
    }

    const detectedProvider = validated.provider || detectProvider(validated.phoneNumber)
    if (!detectedProvider) {
      return NextResponse.json(
        { success: false, message: 'Impossible de détecter le fournisseur. Orange (6XX) ou MTN (5XX) requis.' },
        { status: 400 }
      )
    }

    // Delegate to the real Mobile Money service (with sandbox fallback)
    const result = await mobileMoneyService.initiatePayment({
      phoneNumber: validated.phoneNumber,
      amount: validated.amount,
      currency: validated.currency,
      reason: validated.reason,
      invoiceId: validated.invoiceId || null,
      patientName: validated.patientName,
      patientId: validated.patientId,
      provider: detectedProvider,
    })

    return NextResponse.json({
      success: result.success,
      transaction: {
        id: result.transactionId,
        reference: result.reference,
        provider: result.provider,
        phoneNumber: validated.phoneNumber,
        amount: validated.amount,
        currency: validated.currency,
        reason: validated.reason,
        invoiceId: validated.invoiceId || null,
        patientName: validated.patientName,
        patientId: validated.patientId,
        status: result.status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: null,
        providerTransactionId: null,
        paymentLink: result.paymentLink,
      },
      message: result.message,
    }, { status: result.success ? 200 : 422 })

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, message: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }
    console.error('[Mobile Money] Payment initiation error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur', error: String(error) },
      { status: 500 }
    )
  }
}

/**
 * GET /api/payments/mobile-money?transactionId=xxx&provider=xxx
 * Check Mobile Money transaction status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const transactionId = searchParams.get('transactionId')
    const provider = searchParams.get('provider') as 'Orange Money' | 'MTN MoMo' | null

    if (!transactionId || !provider) {
      return NextResponse.json(
        { success: false, message: 'Paramètres requis: transactionId, provider' },
        { status: 400 }
      )
    }

    if (!['Orange Money', 'MTN MoMo'].includes(provider)) {
      return NextResponse.json(
        { success: false, message: 'Fournisseur invalide. Utilisez: Orange Money ou MTN MoMo' },
        { status: 400 }
      )
    }

    // Delegate to the real service
    const result = await mobileMoneyService.checkTransactionStatus(transactionId, provider)

    return NextResponse.json({
      success: true,
      ...result,
    })

  } catch (error) {
    console.error('[Mobile Money] Status check error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur', error: String(error) },
      { status: 500 }
    )
  }
}
