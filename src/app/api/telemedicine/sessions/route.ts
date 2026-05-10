// HealthFlow Africa - Telemedicine Sessions API
// POST: Create session, GET: List sessions, PUT: Update, DELETE: End session

import { NextRequest, NextResponse } from 'next/server'
import { demoVideoSessions, type VideoConsultationSession } from '@/lib/telemedicine'
import { secureApiHandler } from '@/lib/api-middleware'

// In-memory sessions store (demo mode)
const sessionsStore: VideoConsultationSession[] = [...demoVideoSessions]

const handlePost = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const session: VideoConsultationSession = {
      id: `VID-${Date.now()}`,
      patientId: body.patientId || '',
      patientName: body.patientName || '',
      doctorId: body.doctorId || 'USR-001',
      doctorName: body.doctorName || 'Dr. Diallo',
      type: body.type || 'Vidéo',
      status: 'en_attente',
      connectionQuality: 'bonne',
      videoQuality: body.type === 'Audio' ? 'audio_only' : 'HD',
      recordingConsent: body.recordingConsent || false,
      isRecording: false,
      notes: body.notes || '',
      chatMessages: [],
      sharedFiles: [],
    }

    sessionsStore.push(session)
    return NextResponse.json({ success: true, data: session }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Données de session invalides' }, { status: 400 })
  }
}

const handleGet = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const doctorId = searchParams.get('doctorId')
  const patientId = searchParams.get('patientId')

  let sessions = [...sessionsStore]

  if (status) sessions = sessions.filter(s => s.status === status)
  if (doctorId) sessions = sessions.filter(s => s.doctorId === doctorId)
  if (patientId) sessions = sessions.filter(s => s.patientId === patientId)

  return NextResponse.json({ data: sessions })
}

const handlePut = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    const index = sessionsStore.findIndex(s => s.id === id)
    if (index === -1) {
      return NextResponse.json({ error: 'Session non trouvée' }, { status: 404 })
    }

    sessionsStore[index] = { ...sessionsStore[index], ...updates }
    return NextResponse.json({ success: true, data: sessionsStore[index] })
  } catch {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
  }
}

const handleDelete = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID session requis' }, { status: 400 })
  }

  const index = sessionsStore.findIndex(s => s.id === id)
  if (index === -1) {
    return NextResponse.json({ error: 'Session non trouvée' }, { status: 404 })
  }

  sessionsStore[index].status = 'terminee'
  sessionsStore[index].endTime = new Date().toISOString()
  return NextResponse.json({ success: true })
}

export const POST = secureApiHandler(handlePost, {
  permission: { resource: 'telemedicine', action: 'write' },
  audit: { resource: 'telemedicine', action: 'create_session' },
  rateLimit: { maxRequests: 20, windowMs: 60000 },
})

export const GET = secureApiHandler(handleGet, {
  permission: { resource: 'telemedicine', action: 'read' },
  audit: { resource: 'telemedicine', action: 'list_sessions' },
})

export const PUT = secureApiHandler(handlePut, {
  permission: { resource: 'telemedicine', action: 'write' },
  audit: { resource: 'telemedicine', action: 'update_session' },
})

export const DELETE = secureApiHandler(handleDelete, {
  permission: { resource: 'telemedicine', action: 'write' },
  audit: { resource: 'telemedicine', action: 'end_session' },
})
