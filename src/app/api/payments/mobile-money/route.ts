import { NextRequest, NextResponse } from 'next/server'
import { mobileMoneyService, generateTransactionId, generateReference, detectProvider, isValidGuineaPhone } from '@/lib/mobile-money'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phoneNumber, amount, currency, reason, invoiceId, patientName, patientId, provider } = body

    // Validate
    if (!phoneNumber || !amount || !patientName) {
      return NextResponse.json(
        { success: false, message: 'Champs obligatoires manquants: phoneNumber, amount, patientName' },
        { status: 400 }
      )
    }

    if (!isValidGuineaPhone(phoneNumber)) {
      return NextResponse.json(
        { success: false, message: 'Numéro de téléphone invalide. Format: +224 XXX XX XX XX' },
        { status: 400 }
      )
    }

    const detectedProvider = provider || detectProvider(phoneNumber)
    if (!detectedProvider) {
      return NextResponse.json(
        { success: false, message: 'Impossible de détecter le fournisseur. Orange (6XX) ou MTN (5XX) requis.' },
        { status: 400 }
      )
    }

    // In demo mode, simulate the transaction creation
    const reference = generateReference(detectedProvider)
    const transactionId = generateTransactionId()

    // Simulate async processing
    const success = Math.random() > 0.1
    const txn = {
      id: transactionId,
      reference,
      provider: detectedProvider,
      phoneNumber,
      amount: Number(amount),
      currency: currency || 'GNF',
      reason: reason || 'Facture',
      invoiceId: invoiceId || null,
      patientName,
      patientId: patientId || '',
      status: success ? 'En cours' as const : 'Échoué' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
      providerTransactionId: success ? `${detectedProvider === 'Orange Money' ? 'OM' : 'MTN'}-TXN-${Math.floor(Math.random() * 99999)}` : null,
      paymentLink: success ? `https://pay.${detectedProvider === 'Orange Money' ? 'orange' : 'mtn'}.gf/${reference}` : null,
    }

    return NextResponse.json({
      success,
      transaction: txn,
      message: success
        ? `Paiement ${detectedProvider} initié. Référence: ${reference}`
        : 'Échec de l\'initiation du paiement.',
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Erreur serveur', error: String(error) },
      { status: 500 }
    )
  }
}

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

    // In demo mode, return a simulated status
    const rand = Math.random()
    let status: 'En attente' | 'En cours' | 'Réussi' | 'Échoué' | 'Remboursé'
    if (rand < 0.5) status = 'Réussi'
    else if (rand < 0.7) status = 'En cours'
    else if (rand < 0.85) status = 'En attente'
    else status = 'Échoué'

    return NextResponse.json({
      success: true,
      transactionId,
      status,
      providerTransactionId: `${provider === 'Orange Money' ? 'OM' : 'MTN'}-TXN-${Math.floor(Math.random() * 99999)}`,
      completedAt: status === 'Réussi' ? new Date().toISOString() : null,
      message: status === 'Réussi' ? 'Transaction complétée' : `Statut: ${status}`,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Erreur serveur', error: String(error) },
      { status: 500 }
    )
  }
}
