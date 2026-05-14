import { z } from 'zod'

const guineaPhone = z.string()
  .regex(/^\+224[0-9]{8}$/, 'Format: +224XXXXXXXX')
  .or(z.string().regex(/^[0-9]{8}$/, 'Format: XXXXXXXX')).transform(v => 
    v.startsWith('+224') ? v : `+224${v}`
  )

export const appointmentCreateSchema = z.object({
  patientId: z.string().min(1, 'Patient requis'),
  doctorId: z.string().min(1, 'Médecin requis'),
  establishmentId: z.string().optional(),
  appointmentDate: z.string().transform(v => new Date(v)),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format HH:mm'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format HH:mm').optional(),
  duration: z.number().min(5).max(480).optional(),
  type: z.enum(['CONSULTATION', 'FOLLOW_UP', 'EMERGENCY', 'TELECONSULTATION', 'CHECKUP']).default('CONSULTATION'),
  reason: z.string().min(3, 'Motif requis (min 3 caractères)').max(500),
  notes: z.string().max(1000).optional(),
  reminderType: z.enum(['SMS', 'EMAIL', 'BOTH']).optional(),
})

export const appointmentUpdateSchema = z.object({
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED']).optional(),
  appointmentDate: z.string().transform(v => new Date(v)).optional(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  duration: z.number().min(5).max(480).optional(),
  type: z.enum(['CONSULTATION', 'FOLLOW_UP', 'EMERGENCY', 'TELECONSULTATION', 'CHECKUP']).optional(),
  reason: z.string().min(3).max(500).optional(),
  cancellationReason: z.string().min(3).max(500).optional(),
  notes: z.string().max(1000).optional(),
})

export const doctorSlotsQuerySchema = z.object({
  doctorId: z.string().min(1),
  date: z.string().transform(v => new Date(v)),
  establishmentId: z.string().optional(),
})
