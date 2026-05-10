// HealthFlow Africa - ASC Visits API
// POST: Log a community visit, GET: List visits, PUT: Update visit

import { NextRequest, NextResponse } from 'next/server'
import { demoVisits, type ASCVisit } from '@/lib/asc-tools'
import { secureApiHandler } from '@/lib/api-middleware'

const visitsStore: ASCVisit[] = [...demoVisits]

const handlePost = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const visit: ASCVisit = {
      id: `VIS-${Date.now()}`,
      ascId: body.ascId || 'ASC-001',
      ascName: body.ascName || 'Aminata Condé',
      patientId: body.patientId,
      patientName: body.patientName || '',
      patientAge: body.patientAge,
      patientGender: body.patientGender,
      visitDate: body.visitDate || new Date().toISOString().split('T')[0],
      location: body.location || { address: '' },
      symptoms: body.symptoms || [],
      vitalSigns: body.vitalSigns,
      diagnosis: body.diagnosis,
      actionsTaken: body.actionsTaken || [],
      referral: body.referral,
      photos: body.photos || [],
      isOffline: body.isOffline || false,
      createdAt: new Date().toISOString(),
    }

    visitsStore.push(visit)
    return NextResponse.json({ success: true, data: visit }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Données de visite invalides' }, { status: 400 })
  }
}

const handleGet = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)
  const ascId = searchParams.get('ascId')
  const date = searchParams.get('date')

  let visits = [...visitsStore]
  if (ascId) visits = visits.filter(v => v.ascId === ascId)
  if (date) visits = visits.filter(v => v.visitDate === date)

  return NextResponse.json({ data: visits })
}

const handlePut = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    const index = visitsStore.findIndex(v => v.id === id)
    if (index === -1) {
      return NextResponse.json({ error: 'Visite non trouvée' }, { status: 404 })
    }

    visitsStore[index] = { ...visitsStore[index], ...updates }
    return NextResponse.json({ success: true, data: visitsStore[index] })
  } catch {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
  }
}

export const POST = secureApiHandler(handlePost, {
  permission: { resource: 'asc', action: 'write' },
  audit: { resource: 'asc', action: 'create_visit' },
})

export const GET = secureApiHandler(handleGet, {
  permission: { resource: 'asc', action: 'read' },
})

export const PUT = secureApiHandler(handlePut, {
  permission: { resource: 'asc', action: 'write' },
})
