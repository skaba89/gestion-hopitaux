import { NextRequest, NextResponse } from 'next/server'
import { checkCoverage, submitClaim, requestPreAuthorization } from '@/lib/insurance'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'check-coverage') {
      const patientId = searchParams.get('patientId') || ''
      const providerId = searchParams.get('providerId') || ''
      const amount = Number(searchParams.get('amount') || 0)

      // In a real app, fetch provider from DB
      // For demo, return simulated result
      const result = checkCoverage(patientId, {
        id: providerId,
        name: searchParams.get('providerName') || 'Assurance',
        code: searchParams.get('providerCode') || 'INS',
        coveragePercentage: Number(searchParams.get('coveragePercentage') || 75),
        contactPhone: '', email: '', address: '', isActive: true, logoColor: '#000',
      }, amount)

      return NextResponse.json({ success: true, coverage: result })
    }

    return NextResponse.json({ success: false, message: 'Action non reconnue' }, { status: 400 })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Erreur serveur', error: "Une erreur interne s'est produite" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'submit-claim') {
      const result = await submitClaim(body)
      return NextResponse.json(result)
    }

    if (action === 'pre-authorization') {
      const result = await requestPreAuthorization(body)
      return NextResponse.json(result)
    }

    return NextResponse.json({ success: false, message: 'Action non reconnue' }, { status: 400 })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Erreur serveur', error: "Une erreur interne s'est produite" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { claimId, status, notes } = body

    if (!claimId || !status) {
      return NextResponse.json(
        { success: false, message: 'Champs requis: claimId, status' },
        { status: 400 }
      )
    }

    // In a real app, update claim in database
    return NextResponse.json({
      success: true,
      claim: {
        id: claimId,
        status,
        notes,
        processedAt: new Date().toISOString(),
      },
      message: `Réclamation ${claimId} mise à jour: ${status}`,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Erreur serveur', error: "Une erreur interne s'est produite" },
      { status: 500 }
    )
  }
}
