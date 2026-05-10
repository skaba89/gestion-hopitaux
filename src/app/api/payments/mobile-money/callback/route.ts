import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { provider, transactionId, status, providerTransactionId, signature } = body

    // Verify signature (in demo mode, always valid)
    // In production: mobileMoneyService.verifyCallback(provider, JSON.stringify(body), signature)

    if (!provider || !transactionId || !status) {
      return NextResponse.json(
        { success: false, message: 'Données de callback invalides' },
        { status: 400 }
      )
    }

    // In a real app, this would update the database
    // For demo, we return success
    console.log(`[Mobile Money Callback] Provider: ${provider}, TXN: ${transactionId}, Status: ${status}`)

    return NextResponse.json({
      success: true,
      message: `Callback traité. Transaction ${transactionId} mise à jour: ${status}`,
      updatedTransaction: {
        id: transactionId,
        status,
        providerTransactionId,
        completedAt: status === 'Réussi' ? new Date().toISOString() : null,
        updatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Erreur de traitement du callback', error: String(error) },
      { status: 500 }
    )
  }
}
