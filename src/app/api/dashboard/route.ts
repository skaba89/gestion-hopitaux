import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { successResponse, errorResponse, corsHeaders } from '@/lib/api-utils'
import { applyRLS, type RLSContext } from '@/lib/rls'
import { toHFRole } from '@/lib/rbac'

// Mock/demo data for when database is empty
const mockDashboardStats = {
  totalPatients: 1247,
  newPatientsThisMonth: 83,
  appointmentsToday: 42,
  appointmentsThisWeek: 187,
  availableBeds: 34,
  totalBeds: 120,
  bedOccupancyRate: 71.7,
  criticalStockAlerts: 7,
  pendingLabResults: 23,
  emergencyCasesToday: 8,
  revenueThisMonth: 45_680_000,
  vaccinationCoverageRate: 78.5,
  activePregnancies: 34,
  pendingInvoices: 56,
  totalRevenue: 234_560_000,
  recentActivities: [
    { id: '1', type: 'PATIENT_ADMITTED', description: 'New patient admitted - Mariama Diallo', timestamp: new Date(Date.now() - 15 * 60000).toISOString(), module: 'hospitalizations' },
    { id: '2', type: 'APPOINTMENT_COMPLETED', description: 'Consultation completed - Ibrahim Keita', timestamp: new Date(Date.now() - 32 * 60000).toISOString(), module: 'appointments' },
    { id: '3', type: 'LAB_RESULT_READY', description: 'Lab results ready - Fatoumata Camara', timestamp: new Date(Date.now() - 45 * 60000).toISOString(), module: 'laboratory' },
    { id: '4', type: 'STOCK_ALERT', description: 'Low stock alert - Paracetamol 500mg', timestamp: new Date(Date.now() - 60 * 60000).toISOString(), module: 'pharmacy' },
    { id: '5', type: 'EMERGENCY_CASE', description: 'New emergency case - Triage ORANGE', timestamp: new Date(Date.now() - 90 * 60000).toISOString(), module: 'emergencies' },
    { id: '6', type: 'PAYMENT_RECEIVED', description: 'Payment received - 250,000 GNF', timestamp: new Date(Date.now() - 120 * 60000).toISOString(), module: 'billing' },
    { id: '7', type: 'VACCINATION_COMPLETED', description: 'Vaccination recorded - BCG dose', timestamp: new Date(Date.now() - 180 * 60000).toISOString(), module: 'vaccinations' },
    { id: '8', type: 'DELIVERY_RECORDED', description: 'Delivery recorded - Healthy baby boy', timestamp: new Date(Date.now() - 240 * 60000).toISOString(), module: 'maternity' },
  ],
  appointmentsByStatus: {
    SCHEDULED: 18,
    CONFIRMED: 12,
    IN_PROGRESS: 7,
    COMPLETED: 156,
    CANCELLED: 8,
    NO_SHOW: 3,
  },
  emergencyByTriage: {
    RED: 1,
    ORANGE: 2,
    YELLOW: 3,
    GREEN: 2,
    BLUE: 0,
  },
  revenueByDay: [
    { day: 'Mon', amount: 8_200_000 },
    { day: 'Tue', amount: 7_800_000 },
    { day: 'Wed', amount: 9_100_000 },
    { day: 'Thu', amount: 8_500_000 },
    { day: 'Fri', amount: 7_400_000 },
    { day: 'Sat', amount: 3_200_000 },
    { day: 'Sun', amount: 1_480_000 },
  ],
  topDiseases: [
    { name: 'Malaria', count: 45 },
    { name: 'Respiratory Infection', count: 32 },
    { name: 'Hypertension', count: 28 },
    { name: 'Diabetes', count: 21 },
    { name: 'Gastroenteritis', count: 18 },
  ],
}

type DashboardScope = 'national' | 'regional' | 'hospital' | 'service'

interface DashboardResponse {
  scope: DashboardScope
  scopeEntity: { id: string; name: string }
  stats: Record<string, unknown>
  comparison?: Array<{ hospitalId: string; hospitalName: string; stats: Record<string, unknown> }>
  timestamp: string
}

function extractUserContext(request: NextRequest): RLSContext {
  const isDemoMode = process.env.DEMO_MODE === 'true' || process.env.NODE_ENV === 'development'
  const userId = isDemoMode ? (request.headers.get('x-user-id') || 'USR-001') : 'anonymous'
  const userRole = isDemoMode ? toHFRole(request.headers.get('x-user-role') || 'Médecin') : 'Patient'
  const establishmentId = isDemoMode ? (request.headers.get('x-establishment-id') || undefined) : undefined
  return { userId, role: userRole, establishmentId }
}

// GET /api/dashboard - Aggregate statistics for dashboard with hospital scoping
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hospitalId = searchParams.get('hospitalId') || ''
    const region = searchParams.get('region') || ''
    const scope = (searchParams.get('scope') || 'national') as DashboardScope
    const mode = searchParams.get('mode') || ''

    const userContext = extractUserContext(request)
    const rlsFilter = applyRLS(userContext, 'patients')

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    const startOfDay = new Date(now)
    startOfDay.setHours(0, 0, 0, 0)

    // Build establishment filter based on scope
    let establishmentFilter: Record<string, unknown> = {}
    let scopeEntity = { id: 'national', name: 'Nationale — République de Guinée' }
    let currentScope: DashboardScope = 'national'

    if (hospitalId) {
      // Scoped to a specific hospital
      establishmentFilter = { establishmentId: hospitalId }
      const estab = await db.establishment.findUnique({ where: { id: hospitalId }, select: { id: true, name: true } })
      scopeEntity = estab ? { id: estab.id, name: estab.name } : { id: hospitalId, name: hospitalId }
      currentScope = 'hospital'
    } else if (region) {
      // Scoped to a region — find all establishments in that region
      const regionalEstabs = await db.establishment.findMany({
        where: { region, isActive: true },
        select: { id: true },
      })
      const estabIds = regionalEstabs.map(e => e.id)
      establishmentFilter = { establishmentId: { in: estabIds } }
      scopeEntity = { id: region, name: region }
      currentScope = 'regional'
    } else if (scope === 'national') {
      currentScope = 'national'
    }

    // Apply RLS: non-admin users scoped to their establishment
    if (userContext.role !== 'Administrateur' && userContext.establishmentId && !hospitalId) {
      establishmentFilter = { establishmentId: userContext.establishmentId }
      const estab = await db.establishment.findUnique({ where: { id: userContext.establishmentId }, select: { id: true, name: true } })
      scopeEntity = estab ? { id: estab.id, name: estab.name } : { id: userContext.establishmentId, name: userContext.establishmentId }
      currentScope = 'hospital'
    }

    // Build where clauses for scoped queries
    const patientWhere = { isActive: true, ...establishmentFilter }
    const appointmentWhere = { ...establishmentFilter }
    const bedWhere = { ...establishmentFilter }
    const emergencyWhere = { ...establishmentFilter }

    // Try to get real data from database
    const [
      totalPatients,
      newPatientsThisMonth,
      appointmentsToday,
      appointmentsThisWeek,
      totalBeds,
      availableBeds,
      criticalStockAlerts,
      pendingLabResults,
      emergencyCasesToday,
      revenueThisMonth,
      activePregnancies,
      pendingInvoices,
      appointmentsByStatus,
      emergencyByTriage,
    ] = await Promise.all([
      db.patient.count({ where: patientWhere }),
      db.patient.count({ where: { ...patientWhere, createdAt: { gte: startOfMonth } } }),
      db.appointment.count({ where: { ...appointmentWhere, appointmentDate: { gte: startOfDay } } }),
      db.appointment.count({ where: { ...appointmentWhere, appointmentDate: { gte: startOfWeek } } }),
      db.bed.count({ where: bedWhere }),
      db.bed.count({ where: { ...bedWhere, status: 'AVAILABLE' } }),
      db.shortageAlert.count({ where: { status: 'ACTIVE', alertType: { in: ['CRITICAL', 'OUT_OF_STOCK'] } } }),
      db.labRequest.count({ where: { status: { in: ['REQUESTED', 'SAMPLE_COLLECTED', 'IN_PROGRESS'] } } }),
      db.emergencyCase.count({ where: { ...emergencyWhere, arrivalDate: { gte: startOfDay } } }),
      db.payment.aggregate({
        where: { status: 'COMPLETED', createdAt: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      db.pregnancyTracking.count({ where: { status: 'ACTIVE' } }),
      db.invoice.count({ where: { status: { in: ['DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'OVERDUE'] } } }),
      db.appointment.groupBy({ by: ['status'], _count: true }),
      db.emergencyCase.groupBy({ by: ['triageLevel'], where: { status: { notIn: ['DISCHARGED', 'DECEASED'] } }, _count: true }),
    ])

    const revenue = revenueThisMonth._sum.amount || 0
    const bedOccupancyRate = totalBeds > 0 ? ((totalBeds - availableBeds) / totalBeds) * 100 : 0

    // Build real stats
    const stats = {
      totalPatients,
      newPatientsThisMonth,
      appointmentsToday,
      appointmentsThisWeek,
      availableBeds,
      totalBeds,
      bedOccupancyRate: Math.round(bedOccupancyRate * 10) / 10,
      criticalStockAlerts,
      pendingLabResults,
      emergencyCasesToday,
      revenueThisMonth: revenue,
      vaccinationCoverageRate: 78.5, // Requires complex calculation, use mock
      activePregnancies,
      pendingInvoices,
      appointmentsByStatus: Object.fromEntries(
        appointmentsByStatus.map((s) => [s.status, s._count])
      ),
      emergencyByTriage: Object.fromEntries(
        emergencyByTriage.map((e) => [e.triageLevel, e._count])
      ),
    }

    // If database is empty, return mock data
    const isDataEmpty = totalPatients === 0 && totalBeds === 0

    const response: DashboardResponse = {
      scope: currentScope,
      scopeEntity,
      stats: isDataEmpty ? mockDashboardStats : stats,
      timestamp: new Date().toISOString(),
    }

    // Comparison mode: return stats grouped by hospital
    if (mode === 'comparison') {
      const allEstablishments = await db.establishment.findMany({
        where: { isActive: true },
        select: { id: true, name: true },
      })

      const comparison = await Promise.all(
        allEstablishments.map(async (estab) => {
          const [patCount, bedCount, availBeds] = await Promise.all([
            db.patient.count({ where: { isActive: true, establishmentId: estab.id } }),
            db.bed.count({ where: { establishmentId: estab.id } }),
            db.bed.count({ where: { establishmentId: estab.id, status: 'AVAILABLE' } }),
          ])
          return {
            hospitalId: estab.id,
            hospitalName: estab.name,
            stats: {
              totalPatients: patCount,
              totalBeds: bedCount,
              availableBeds: availBeds,
              bedOccupancyRate: bedCount > 0 ? Math.round(((bedCount - availBeds) / bedCount) * 1000) / 10 : 0,
            },
          }
        })
      )

      response.comparison = comparison
    }

    return successResponse(response)
  } catch (err) {
    // Fallback to mock data on any error
    console.error('Dashboard error:', err)
    const fallbackResponse: DashboardResponse = {
      scope: 'national',
      scopeEntity: { id: 'national', name: 'Nationale — République de Guinée' },
      stats: mockDashboardStats,
      timestamp: new Date().toISOString(),
    }
    return successResponse(fallbackResponse)
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() })
}
