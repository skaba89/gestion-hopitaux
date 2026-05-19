import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { paginatedResponse, errorResponse, getPaginationParams, corsHeaders } from '@/lib/api-utils'
import { secureApiHandler, ApiHandlerContext } from '@/lib/api-middleware'
import { vaccinationCreateSchema } from '@/lib/validations/vaccination'

// GET /api/vaccinations - List vaccination schedules and records
export async function GET(request: NextRequest) {
  return secureApiHandler(async (request: NextRequest, context: ApiHandlerContext) => {
    try {
      const { searchParams } = new URL(request.url)
      const { page, limit, skip, take } = getPaginationParams(searchParams)
      const childId = searchParams.get('childId') || ''
      const scheduleId = searchParams.get('scheduleId') || ''
      const status = searchParams.get('status') || ''
      const view = searchParams.get('view') || 'records' // records, schedules, reminders

      // View: vaccination schedules
      if (view === 'schedules') {
        const schedWhere: Record<string, unknown> = { isActive: true }
        const schedules = await db.vaccinationSchedule.findMany({
          where: schedWhere,
          orderBy: { recommendedAgeMinDays: 'asc' },
        })

        return paginatedResponse(schedules, schedules.length, 1, 100)
      }

      // View: reminders
      if (view === 'reminders') {
        const remWhere: Record<string, unknown> = {}
        if (childId) remWhere.childId = childId
        if (status) remWhere.status = status
        else remWhere.status = 'PENDING'

        const [reminders, total] = await Promise.all([
          db.vaccinationReminder.findMany({
            where: remWhere,
            skip,
            take,
            include: {
              schedule: { select: { name: true, vaccineName: true } },
            },
            orderBy: { reminderDate: 'asc' },
          }),
          db.vaccinationReminder.count({ where: remWhere }),
        ])

        return paginatedResponse(reminders, total, page, limit)
      }

      // Default view: vaccination records
      const where: Record<string, unknown> = {}
      if (childId) where.childId = childId
      if (scheduleId) where.scheduleId = scheduleId
      if (status) where.status = status

      const [vaccinations, total] = await Promise.all([
        db.vaccination.findMany({
          where,
          skip,
          take,
          include: {
            child: {
              select: { id: true, firstName: true, lastName: true, patient: { select: { firstName: true, lastName: true } } },
            },
            schedule: { select: { id: true, name: true, vaccineName: true, targetDisease: true, isMandatory: true } },
          },
          orderBy: { vaccinationDate: 'desc' },
        }),
        db.vaccination.count({ where }),
      ])

      return paginatedResponse(vaccinations, total, page, limit)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch vaccination data'
      return errorResponse(message, 500)
    }
  }, {
    requireAuth: true,
    audit: { resource: 'vaccinations', action: 'READ' },
  })(request)
}

// POST /api/vaccinations - Record a vaccination
export async function POST(request: NextRequest) {
  return secureApiHandler(async (request: NextRequest, context: ApiHandlerContext) => {
    try {
      const body = await request.json()

      // Zod validation — uses vaccinationCreateSchema from validations/vaccination.ts
      const validated = vaccinationCreateSchema.parse(body)

      const vaccination = await db.vaccination.create({
        data: {
          childId: validated.childId,
          scheduleId: validated.scheduleId,
          doseNumber: validated.doseNumber,
          vaccinationDate: validated.vaccinationDate,
          administeredById: validated.administeredById,
          establishmentId: validated.establishmentId,
          batchNumber: validated.batchNumber,
          lotNumber: validated.lotNumber,
          site: validated.site,
          reaction: validated.reaction,
          notes: validated.notes,
          nextDoseDate: validated.nextDoseDate,
          status: validated.status,
          certificateUrl: validated.certificateUrl,
        },
        include: {
          child: { select: { id: true, firstName: true, lastName: true } },
          schedule: { select: { name: true, vaccineName: true } },
        },
      })

      return paginatedResponse([vaccination], 1, 1, 1)
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return errorResponse('Données invalides: ' + err.errors.map((e: any) => e.message).join(', '), 400)
      }
      console.error('[Vaccinations] Create error:', err)
      return errorResponse('Erreur lors de l\'enregistrement de la vaccination', 500)
    }
  }, {
    requireAuth: true,
    permission: { resource: 'vaccinations' as any, action: 'create' as any },
    audit: { resource: 'vaccinations', action: 'CREATE' },
  })(request)
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() })
}
