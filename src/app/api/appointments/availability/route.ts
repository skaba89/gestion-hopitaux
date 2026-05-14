import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { doctorSlotsQuerySchema } from '@/lib/validations/appointment'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const validated = doctorSlotsQuerySchema.parse({
      doctorId: searchParams.get('doctorId'),
      date: searchParams.get('date'),
      establishmentId: searchParams.get('establishmentId') || undefined,
    })

    const dayOfWeek = validated.date.getDay() // 0=Sunday

    // Get doctor's agenda for this day
    const agendas = await db.doctorAgenda.findMany({
      where: {
        doctorId: validated.doctorId,
        dayOfWeek,
        isAvailable: true,
        effectiveFrom: { lte: validated.date },
        effectiveUntil: { gte: validated.date },
      }
    })

    if (agendas.length === 0) {
      return NextResponse.json({ available: false, slots: [], message: 'Médecin non disponible ce jour' })
    }

    // Get existing appointments for this doctor on this date
    const startOfDay = new Date(validated.date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(validated.date)
    endOfDay.setHours(23, 59, 59, 999)

    const existingAppointments = await db.appointment.findMany({
      where: {
        doctorId: validated.doctorId,
        appointmentDate: { gte: startOfDay, lte: endOfDay },
        status: { in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] },
      },
      select: { startTime: true, endTime: true, duration: true }
    })

    // Generate available slots
    const slots: { time: string; available: boolean; reason?: string }[] = []

    for (const agenda of agendas) {
      const [startH, startM] = agenda.startTime.split(':').map(Number)
      const [endH, endM] = agenda.endTime.split(':').map(Number)
      const slotDuration = agenda.slotDuration || 30

      let currentMinutes = startH * 60 + startM
      const endMinutes = endH * 60 + endM

      while (currentMinutes + slotDuration <= endMinutes) {
        const hours = Math.floor(currentMinutes / 60)
        const minutes = currentMinutes % 60
        const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`

        const endSlotMinutes = currentMinutes + slotDuration
        const endHours = Math.floor(endSlotMinutes / 60)
        const endMinutes2 = endSlotMinutes % 60
        const endTimeStr = `${String(endHours).padStart(2, '0')}:${String(endMinutes2).padStart(2, '0')}`

        // Check if slot conflicts with existing appointment
        const hasConflict = existingAppointments.some(apt => {
          const aptStart = apt.startTime
          const aptEnd = apt.endTime || (() => {
            const [h, m] = apt.startTime.split(':').map(Number)
            const dur = apt.duration || 30
            const endMin = h * 60 + m + dur
            return `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`
          })()
          return timeStr < aptEnd && endTimeStr > aptStart
        })

        // Check if slot is in the past
        const now = new Date()
        const slotDate = new Date(validated.date)
        slotDate.setHours(hours, minutes, 0, 0)
        const isPast = slotDate <= now

        slots.push({
          time: timeStr,
          available: !hasConflict && !isPast,
          reason: isPast ? 'Passé' : hasConflict ? 'Réservé' : undefined,
        })

        currentMinutes += slotDuration
      }
    }

    return NextResponse.json({
      available: slots.some(s => s.available),
      slots,
      doctorId: validated.doctorId,
      date: validated.date.toISOString(),
    })

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Paramètres invalides', details: error.errors }, { status: 400 })
    }
    console.error('Availability check error:', error)
    return NextResponse.json({ error: 'Erreur de vérification' }, { status: 500 })
  }
}
