import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { appointmentUpdateSchema } from '@/lib/validations/appointment'
import { addSimpleAuditEntry } from '@/lib/audit-logger'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const appointment = await db.appointment.findUnique({
      where: { id },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, phone: true, qrCode: true } },
        doctor: { select: { id: true, firstName: true, lastName: true, specialization: true } },
      }
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Rendez-vous non trouvé' }, { status: 404 })
    }

    return NextResponse.json(appointment)
  } catch (error) {
    console.error('Get appointment error:', error)
    return NextResponse.json({ error: 'Erreur de récupération' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const validated = appointmentUpdateSchema.parse(body)

    const existing = await db.appointment.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Rendez-vous non trouvé' }, { status: 404 })
    }

    // Check conflict if rescheduling
    if (validated.appointmentDate || validated.startTime) {
      const newDate = validated.appointmentDate || existing.appointmentDate
      const newStart = validated.startTime || existing.startTime

      const conflict = await db.appointment.findFirst({
        where: {
          id: { not: id },
          doctorId: existing.doctorId,
          appointmentDate: newDate,
          startTime: newStart,
          status: { in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] },
        }
      })

      if (conflict) {
        return NextResponse.json(
          { error: 'Conflit: le médecin a déjà un rendez-vous à ce créneau' },
          { status: 409 }
        )
      }
    }

    const appointment = await db.appointment.update({
      where: { id },
      data: validated,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        doctor: { select: { id: true, firstName: true, lastName: true, specialization: true } },
      }
    })

    addSimpleAuditEntry({
      action: 'APPOINTMENT_UPDATE',
      module: 'appointments',
      entity: 'Appointment',
      entityId: id,
      description: `Appointment ${id} updated`,
      severity: 'INFO',
    })

    return NextResponse.json(appointment)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Données invalides', details: error.errors }, { status: 400 })
    }
    console.error('Update appointment error:', error)
    return NextResponse.json({ error: 'Erreur de mise à jour' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const existing = await db.appointment.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Rendez-vous non trouvé' }, { status: 404 })
    }

    await db.appointment.update({
      where: { id },
      data: { status: 'CANCELLED' }
    })

    addSimpleAuditEntry({
      action: 'APPOINTMENT_CANCEL',
      module: 'appointments',
      entity: 'Appointment',
      entityId: id,
      description: `Appointment ${id} cancelled`,
      severity: 'WARNING',
    })

    return NextResponse.json({ success: true, message: 'Rendez-vous annulé' })
  } catch (error) {
    console.error('Cancel appointment error:', error)
    return NextResponse.json({ error: 'Erreur d\'annulation' }, { status: 500 })
  }
}
