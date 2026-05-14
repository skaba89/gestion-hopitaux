// HealthFlow Guinea - Transfers API Route
// GET: List transfers with filters
// POST: Create a new transfer request
// PUT: Update transfer status (accept, reject, complete, cancel)

import { NextRequest } from 'next/server'
import { successResponse, errorResponse, corsHeaders } from '@/lib/api-utils'
import { toHFRole } from '@/lib/rbac'

// In-memory transfer store (persists for the session)
// In production, this would use Prisma/db
interface TransferRecord {
  id: string
  hospitalId: string
  fromServiceId: string
  fromServiceName: string
  toServiceId: string
  toServiceName: string
  patientId: string
  patientName: string
  reason: string
  priority: 'Normal' | 'Urgent' | 'Stat'
  status: 'En attente' | 'Accepté' | 'Refusé' | 'Annulé' | 'Terminé'
  requestedAt: string
  acceptedAt?: string
  completedAt?: string
  notes?: string
}

const transfersStore: TransferRecord[] = []

function extractUserContext(request: NextRequest) {
  const isDemoMode = process.env.DEMO_MODE === 'true' || process.env.NODE_ENV === 'development'
  const userId = isDemoMode ? (request.headers.get('x-user-id') || 'USR-001') : 'anonymous'
  const userRole = isDemoMode ? toHFRole(request.headers.get('x-user-role') || 'Médecin') : 'Patient'
  const userName = isDemoMode ? (request.headers.get('x-user-name') || 'Utilisateur') : 'Anonymous'
  const establishmentId = isDemoMode ? (request.headers.get('x-establishment-id') || undefined) : undefined
  return { userId, userRole, userName, establishmentId }
}

// GET /api/transfers - List transfers with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fromServiceId = searchParams.get('fromServiceId') || ''
    const toServiceId = searchParams.get('toServiceId') || ''
    const fromHospitalId = searchParams.get('fromHospitalId') || ''
    const toHospitalId = searchParams.get('toHospitalId') || ''
    const status = searchParams.get('status') || ''
    const patientId = searchParams.get('patientId') || ''

    const ctx = extractUserContext(request)

    let filtered = [...transfersStore]

    // Apply RLS: non-admin users only see transfers in their establishment
    if (ctx.userRole !== 'Administrateur' && ctx.establishmentId) {
      filtered = filtered.filter(t => t.hospitalId === ctx.establishmentId)
    }

    // Apply filters
    if (fromServiceId) filtered = filtered.filter(t => t.fromServiceId === fromServiceId)
    if (toServiceId) filtered = filtered.filter(t => t.toServiceId === toServiceId)
    if (fromHospitalId || toHospitalId) {
      filtered = filtered.filter(t => t.hospitalId === fromHospitalId || t.hospitalId === toHospitalId)
    }
    if (status) filtered = filtered.filter(t => t.status === status)
    if (patientId) filtered = filtered.filter(t => t.patientId === patientId)

    // Sort by priority and date
    const priorityOrder: Record<string, number> = { 'Stat': 0, 'Urgent': 1, 'Normal': 2 }
    filtered.sort((a, b) => {
      const pDiff = (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2)
      if (pDiff !== 0) return pDiff
      return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
    })

    return successResponse({
      transfers: filtered,
      total: filtered.length,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Échec du chargement des transferts'
    return errorResponse(message, 500)
  }
}

// POST /api/transfers - Create a new transfer request
export async function POST(request: NextRequest) {
  try {
    const ctx = extractUserContext(request)

    // Only medical staff can create transfers
    const allowedRoles = ['Administrateur', 'Médecin', 'Infirmier']
    if (!allowedRoles.includes(ctx.userRole)) {
      return errorResponse('Accès refusé: permissions insuffisantes pour créer un transfert', 403)
    }

    const body = await request.json()
    const {
      hospitalId,
      fromServiceId,
      fromServiceName,
      toServiceId,
      toServiceName,
      patientId,
      patientName,
      reason,
      priority,
      notes,
    } = body

    // Validation
    if (!hospitalId || !fromServiceId || !toServiceId || !patientId || !patientName || !reason) {
      return errorResponse('Champs requis manquants: hospitalId, fromServiceId, toServiceId, patientId, patientName, reason', 400)
    }

    if (fromServiceId === toServiceId) {
      return errorResponse('Le service source et le service de destination doivent être différents', 400)
    }

    const validPriorities: TransferRecord['priority'][] = ['Normal', 'Urgent', 'Stat']
    const transferPriority: TransferRecord['priority'] = validPriorities.includes(priority) ? priority : 'Normal'

    const transfer: TransferRecord = {
      id: `TRF-${Date.now()}`,
      hospitalId,
      fromServiceId,
      fromServiceName: fromServiceName || fromServiceId,
      toServiceId,
      toServiceName: toServiceName || toServiceId,
      patientId,
      patientName,
      reason,
      priority: transferPriority,
      status: 'En attente',
      requestedAt: new Date().toISOString(),
      notes,
    }

    transfersStore.push(transfer)

    return successResponse(transfer, 'Demande de transfert créée avec succès', 201)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Échec de la création du transfert'
    return errorResponse(message, 500)
  }
}

// PUT /api/transfers - Update transfer status
export async function PUT(request: NextRequest) {
  try {
    const ctx = extractUserContext(request)

    const body = await request.json()
    const { id, action, notes } = body

    if (!id || !action) {
      return errorResponse('ID et action requis', 400)
    }

    const transfer = transfersStore.find(t => t.id === id)
    if (!transfer) {
      return errorResponse('Transfert non trouvé', 404)
    }

    // RLS: can only modify transfers in your establishment (unless admin)
    if (ctx.userRole !== 'Administrateur' && ctx.establishmentId && transfer.hospitalId !== ctx.establishmentId) {
      return errorResponse('Accès refusé: ce transfert n\'appartient pas à votre établissement', 403)
    }

    const now = new Date().toISOString()

    switch (action) {
      case 'accept':
        if (transfer.status !== 'En attente') {
          return errorResponse('Seuls les transferts en attente peuvent être acceptés', 400)
        }
        transfer.status = 'Accepté'
        transfer.acceptedAt = now
        break

      case 'reject':
        if (transfer.status !== 'En attente') {
          return errorResponse('Seuls les transferts en attente peuvent être refusés', 400)
        }
        transfer.status = 'Refusé'
        break

      case 'complete':
        if (transfer.status !== 'Accepté') {
          return errorResponse('Seuls les transferts acceptés peuvent être terminés', 400)
        }
        transfer.status = 'Terminé'
        transfer.completedAt = now
        break

      case 'cancel':
        if (transfer.status !== 'En attente' && transfer.status !== 'Accepté') {
          return errorResponse('Seuls les transferts en attente ou acceptés peuvent être annulés', 400)
        }
        transfer.status = 'Annulé'
        break

      default:
        return errorResponse(`Action invalide: ${action}. Actions valides: accept, reject, complete, cancel`, 400)
    }

    if (notes) {
      transfer.notes = notes
    }

    return successResponse(transfer, `Transfert ${action === 'accept' ? 'accepté' : action === 'reject' ? 'refusé' : action === 'complete' ? 'terminé' : 'annulé'}`)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Échec de la mise à jour du transfert'
    return errorResponse(message, 500)
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() })
}
