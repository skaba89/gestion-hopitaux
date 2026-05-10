import { NextResponse } from 'next/server'
import { buildInteractionPrompt, parseInteractionResponse, checkInteractionsOffline } from '@/lib/drug-interactions'
import type { PatientContext } from '@/lib/data-store'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { medications, patientContext } = body as {
      medications: string[]
      patientContext: PatientContext
    }

    if (!medications || medications.length < 2) {
      return NextResponse.json(
        { error: 'Au moins deux médicaments sont requis pour vérifier les interactions.' },
        { status: 400 }
      )
    }

    // Try AI analysis
    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default
      const zai = await ZAI.create()
      const { system, user } = buildInteractionPrompt(medications, patientContext)

      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      })

      const response = completion.choices[0]?.message?.content
      if (response) {
        const result = parseInteractionResponse(response)
        return NextResponse.json(result)
      }
    } catch {
      // AI unavailable, fall through to offline
    }

    // Fallback: offline interaction check
    const result = checkInteractionsOffline(medications)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { error: 'Erreur interne du serveur.' },
      { status: 500 }
    )
  }
}
