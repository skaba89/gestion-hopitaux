// HealthFlow Guinea - Delegations API Route
// GET: List delegations with filters
// POST: Create a new delegation
// PUT: Update delegation status (approve, revoke, expire)

import { NextRequest } from 'next/server'
import { successResponse, errorResponse, corsHeaders } from '@/lib/api-utils'
import { toHFRole } from '@/lib/rbac'

// In-memory delegation store (persists for the session)
// In production, this would use Prisma/db
interface DelegationRecord {
  id: string
  hospitalId: string
  serviceId: string
  delegatedToUserId: string
  delegatedToUserName: string
  delegatedByUserId: string
  delegatedByUserName: string
  reason: string
  startDate: string
  endDate?: string
  expiresAt?: string
  status: 'Active' | 'En attente' | 'Approuvée' | 'Expirée' | 'Révoquée'
  isEmergency?: boolean
  approvedByUserId?: string
  approvedByUserName?: string
  approvedAt?: string
  createdAt: string
}

const delegationsStore: DelegationRecord[] = []

function extractUserContext(request: NextRequest) {
  const isDemoMode = process.env.DEMO_MODE === 'true' || process.env.NODE_ENV === 'development'
  const userId = isDemoMode ? (request.headers.get('x-user-id') || 'USR-001') : 'anonymous'
  const userRole = isDemoMode ? toHFRole(request.headers.get('x-user-role') || 'Médecin') : 'Patient'
  const userName = isDemoMode ? (request.headers.get('x-user-name') || 'Utilisateur') : 'Anonymous'
  const establishmentId = isDemoMode ? (request.headers.get('x-establishment-id') || undefined) : undefined
  return { userId, userRole, userName, establishmentId }
}

// Authorization: only hospital directors and above can manage delegations
function canManageDelegations(role: string): boolean {
  const managingRoles = ['Administrateur', 'Médecin']
  return managingRoles.includes(role)
}

// GET /api/delegations - List delegations with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hospitalId = searchParams.get('hospitalId') || ''
    const serviceId = searchParams.get('serviceId') || ''
    const status = searchParams.get('status') || ''
    const isActive = searchParams.get('isActive')

    const ctx = extractUserContext(request)

    // Auto-expire expired delegations
    const now = Date.now()
    for (const d of delegationsStore) {
      if ((d.status === 'Active' || d.status === 'Approuvée' || d.status === 'En attente') && d.expiresAt && new Date(d.expiresAt).getTime() < now) {
        d.status = 'Expirée'
      }
    }

    let filtered = [...delegationsStore]

    // Apply RLS: non-admin users only see delegations in their establishment
    if (ctx.userRole !== 'Administrateur' && ctx.establishmentId) {
      filtered = filtered.filter(d => d.hospitalId === ctx.establishmentId)
    }

    // Apply filters
    if (hospitalId) filtered = filtered.filter(d => d.hospitalId === hospitalId)
    if (serviceId) filtered = filtered.filter(d => d.serviceId === serviceId)
    if (status) filtered = filtered.filter(d => d.status === status)

    if (isActive === 'true') {
      filtered = filtered.filter(d => ['Active', 'Approuvée', 'En attente'].includes(d.status))
    } else if (isActive === 'false') {
      filtered = filtered.filter(d => ['Expirée', 'Révoquée'].includes(d.status))
    }

    return successResponse({
      delegations: filtered,
      total: filtered.length,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Échec du chargement des délégations'
    return errorResponse(message, 500)
  }
}

// POST /api/delegations - Create a new delegation
export async function POST(request: NextRequest) {
  try {
    const ctx = extractUserContext(request)
    if (!canManageDelegations(ctx.userRole)) {
      return errorResponse('Accès refusé: permissions insuffisantes pour créer une délégation', 403)
    }

    const body = await request.json()
    const {
      hospitalId,
      serviceId,
      delegatedToUserId,
      delegatedToUserName,
      reason,
      startDate,
      endDate,
      expiresAt,
      duration, // '1h', '4h', '1j', '1s'
    } = body

    // Validation
    if (!hospitalId || !serviceId || !delegatedToUserId || !delegatedToUserName || !reason) {
      return errorResponse('Champs requis manquants: hospitalId, serviceId, delegatedToUserId, delegatedToUserName, reason', 400)
    }

    // Cannot delegate to self
    if (delegatedToUserId === ctx.userId) {
      return errorResponse('Impossible de déléguer à soi-même', 400)
    }

    // Calculate expiry from duration if provided
    const now = new Date()
    const durationMs: Record<string, number> = {
      '1h': 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000,
      '1j': 24 * 60 * 60 * 1000,
      '1s': 7 * 24 * 60 * 60 * 1000,
    }
    const calculatedExpiresAt = duration && durationMs[duration]
      ? new Date(now.getTime() + durationMs[duration]).toISOString()
      : expiresAt || new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()

    const calculatedStartDate = startDate || now.toISOString()
    const calculatedEndDate = endDate || calculatedExpiresAt

    const delegation: DelegationRecord = {
      id: `DEL-${Date.now()}`,
      hospitalId,
      serviceId,
      delegatedToUserId,
      delegatedToUserName,
      delegatedByUserId: ctx.userId,
      delegatedByUserName: ctx.userName,
      reason,
      startDate: calculatedStartDate,
      endDate: calculatedEndDate,
      expiresAt: calculatedExpiresAt,
      status: 'En attente',
      isEmergency: false,
      createdAt: now.toISOString(),
    }

    delegationsStore.push(delegation)

    return successResponse(delegation, 'Délégation créée avec succès', 201)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Échec de la création de la délégation'
    return errorResponse(message, 500)
  }
}

// PUT /api/delegations - Update delegation status
export async function PUT(request: NextRequest) {
  try {
    const ctx = extractUserContext(request)
    if (!canManageDelegations(ctx.userRole)) {
      return errorResponse('Accès refusé: permissions insuffisantes pour modifier une délégation', 403)
    }

    const body = await request.json()
    const { id, action, reason } = body

    if (!id || !action) {
      return errorResponse('ID et action requis', 400)
    }

    const delegation = delegationsStore.find(d => d.id === id)
    if (!delegation) {
      return errorResponse('Délégation non trouvée', 404)
    }

    // RLS: can only modify delegations in your establishment (unless admin)
    if (ctx.userRole !== 'Administrateur' && ctx.establishmentId && delegation.hospitalId !== ctx.establishmentId) {
      return errorResponse('Accès refusé: cette délégation n\'appartient pas à votre établissement', 403)
    }

    switch (action) {
      case 'approve':
        if (delegation.status !== 'En attente') {
          return errorResponse('Seules les délégations en attente peuvent être approuvées', 400)
        }
        delegation.status = 'Approuvée'
        delegation.approvedByUserId = ctx.userId
        delegation.approvedByUserName = ctx.userName
        delegation.approvedAt = new Date().toISOString()
        break

      case 'activate':
        if (delegation.status !== 'Approuvée' && delegation.status !== 'En attente') {
          return errorResponse('La délégation ne peut pas être activée depuis son statut actuel', 400)
        }
        delegation.status = 'Active'
        break

      case 'revoke':
        if (delegation.status === 'Révoquée') {
          return errorResponse('La délégation est déjà révoquée', 400)
        }
        delegation.status = 'Révoquée'
        break

      case 'expire':
        delegation.status = 'Expirée'
        break

      default:
        return errorResponse(`Action invalide: ${action}. Actions valides: approve, activate, revoke, expire`, 400)
    }

    return successResponse(delegation, `Délégation ${action === 'approve' ? 'approuvée' : action === 'activate' ? 'activée' : action === 'revoke' ? 'révoquée' : 'expirée'}`)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Échec de la mise à jour de la délégation'
    return errorResponse(message, 500)
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() })
}
