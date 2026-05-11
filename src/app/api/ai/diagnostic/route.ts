import { NextResponse } from 'next/server'
import { buildMedicalPrompt, parseDiagnosticResponse, getOfflineDiagnostic } from '@/lib/ai-diagnostic'
import type { PatientContext } from '@/lib/data-store'

// Rate limiting: simple in-memory store
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 20 // requests per hour
const RATE_WINDOW = 60 * 60 * 1000 // 1 hour in ms

function checkRateLimit(clientId: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(clientId)

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(clientId, { count: 1, resetTime: now + RATE_WINDOW })
    return true
  }

  if (entry.count >= RATE_LIMIT) {
    return false
  }

  entry.count++
  return true
}

export async function POST(request: Request) {
  try {
    // Rate limiting
    const clientId = request.headers.get('x-forwarded-for') || 'anonymous'
    if (!checkRateLimit(clientId)) {
      return NextResponse.json(
        { error: 'Limite de requêtes atteinte. Réessayez dans une heure.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { symptoms, patientContext } = body as {
      symptoms: string[]
      patientContext: PatientContext
    }

    if (!symptoms || symptoms.length === 0) {
      return NextResponse.json(
        { error: 'Au moins un symptôme est requis.' },
        { status: 400 }
      )
    }

    // Try AI analysis
    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default
      const zai = await ZAI.create()
      const { system, user } = buildMedicalPrompt(symptoms, patientContext)

      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      })

      const response = completion.choices[0]?.message?.content
      if (response) {
        const result = parseDiagnosticResponse(response)
        return NextResponse.json(result)
      }
    } catch {
      // AI unavailable, fall through to offline mode
    }

    // Fallback: offline diagnostic
    const result = getOfflineDiagnostic(symptoms)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { error: 'Erreur interne du serveur.' },
      { status: 500 }
    )
  }
}
