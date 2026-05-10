// HealthFlow Africa - Telemedicine Signaling API
// POST: Send offer/answer/ICE candidate, GET: Poll for pending signals

import { NextRequest, NextResponse } from 'next/server'

interface SignalingMessage {
  id: string
  sessionId: string
  fromUserId: string
  toUserId: string
  type: 'offer' | 'answer' | 'ice-candidate' | 'screen-share' | 'screen-stop'
  payload: string
  timestamp: string
}

// In-memory signaling store (demo mode)
const signalingStore: SignalingMessage[] = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const message: SignalingMessage = {
      ...body,
      timestamp: new Date().toISOString(),
    }

    signalingStore.push(message)

    // Clean up old messages (older than 5 minutes)
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
    const index = signalingStore.findIndex(
      m => new Date(m.timestamp).getTime() < fiveMinutesAgo
    )
    if (index > 0) {
      signalingStore.splice(0, index)
    }

    return NextResponse.json({ success: true, id: message.id })
  } catch {
    return NextResponse.json({ error: 'Données de signalisation invalides' }, { status: 400 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('sessionId')
  const userId = searchParams.get('userId')

  if (!sessionId || !userId) {
    return NextResponse.json({ error: 'sessionId et userId requis' }, { status: 400 })
  }

  // Get pending messages for this user in this session
  const pendingMessages = signalingStore.filter(
    m => m.sessionId === sessionId && m.toUserId === userId
  )

  // Remove delivered messages
  for (const msg of pendingMessages) {
    const index = signalingStore.indexOf(msg)
    if (index > -1) signalingStore.splice(index, 1)
  }

  return NextResponse.json(pendingMessages)
}
