// HealthFlow Africa - ASC Referrals API
// POST: Create referral, GET: Track status, PUT: Accept/complete

import { NextRequest, NextResponse } from 'next/server'
import { demoReferrals, type ASCReferral } from '@/lib/asc-tools'
import { secureApiHandler } from '@/lib/api-middleware'

const referralsStore: ASCReferral[] = [...demoReferrals]

const handlePost = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const referral: ASCReferral = {
      id: `REF-${Date.now()}`,
      visitId: body.visitId || '',
      patientId: body.patientId,
      patientName: body.patientName || '',
      ascId: body.ascId || 'ASC-001',
      ascName: body.ascName || 'Aminata Condé',
      reason: body.reason || '',
      severity: body.severity || 'jaune',
      destination: body.destination || '',
      status: 'En attente',
      notes: body.notes || '',
      createdAt: new Date().toISOString(),
    }

    referralsStore.push(referral)
    return NextResponse.json({ success: true, data: referral }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Données de référence invalides' }, { status: 400 })
  }
}

const handleGet = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const ascId = searchParams.get('ascId')

  let referrals = [...referralsStore]
  if (status) referrals = referrals.filter(r => r.status === status)
  if (ascId) referrals = referrals.filter(r => r.ascId === ascId)

  return NextResponse.json({ data: referrals })
}

const handlePut = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    const index = referralsStore.findIndex(r => r.id === id)
    if (index === -1) {
      return NextResponse.json({ error: 'Référence non trouvée' }, { status: 404 })
    }

    referralsStore[index] = { ...referralsStore[index], ...updates }

    if (updates.status === 'Accepté') {
      referralsStore[index].acceptedAt = new Date().toISOString()
    } else if (updates.status === 'Terminé') {
      referralsStore[index].completedAt = new Date().toISOString()
    }

    return NextResponse.json({ success: true, data: referralsStore[index] })
  } catch {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
  }
}

export const POST = secureApiHandler(handlePost, {
  permission: { resource: 'asc', action: 'write' },
  audit: { resource: 'asc', action: 'create_referral' },
})

export const GET = secureApiHandler(handleGet, {
  permission: { resource: 'asc', action: 'read' },
})

export const PUT = secureApiHandler(handlePut, {
  permission: { resource: 'asc', action: 'write' },
  audit: { resource: 'asc', action: 'update_referral' },
})
