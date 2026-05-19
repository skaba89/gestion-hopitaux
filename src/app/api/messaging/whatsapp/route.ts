import { NextRequest, NextResponse } from 'next/server'
import { messagingService } from '@/lib/messaging'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, templateId, params, recipientName } = body

    if (!to || !templateId) {
      return NextResponse.json(
        { success: false, message: 'Champs requis: to, templateId' },
        { status: 400 }
      )
    }

    const result = await messagingService.sendWhatsApp({
      to,
      templateId,
      params: params || {},
      recipientName,
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Erreur serveur', error: "Une erreur interne s'est produite" },
      { status: 500 }
    )
  }
}

// WhatsApp webhook verification
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  // In demo mode, accept any verification
  if (mode === 'subscribe' && challenge) {
    return new NextResponse(challenge, { status: 200 })
  }

  return NextResponse.json({ success: false, message: 'Vérification échouée' }, { status: 403 })
}
