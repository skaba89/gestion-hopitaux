import { z } from 'zod'

// Guinea phone validation: +224 followed by 8 digits
const guineaPhone = z.string()
  .regex(/^\+224[0-9]{8}$/, 'Format: +224XXXXXXXX')
  .or(z.string().regex(/^[0-9]{8}$/, 'Format: XXXXXXXX')).transform(v => 
    v.startsWith('+224') ? v : `+224${v}`
  )

export { guineaPhone }

export const patientRegistrationSchema = z.object({
  firstName: z.string().min(2, 'Prénom requis (min 2 caractères)'),
  lastName: z.string().min(2, 'Nom requis (min 2 caractères)'),
  dateOfBirth: z.string().transform(v => new Date(v)),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  phone: guineaPhone,
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  nationalId: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: guineaPhone.optional().or(z.literal('')),
  primaryLanguage: z.enum(['fr', 'en', 'msk', 'sus', 'ff']).default('fr'),
  establishmentId: z.string().min(1, 'Établissement requis'),
})

export const patientAccountRegistrationSchema = z.object({
  phone: guineaPhone,
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  dateOfBirth: z.string().transform(v => new Date(v)),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  preferredLanguage: z.enum(['fr', 'en', 'msk', 'sus', 'ff']).default('fr'),
  establishmentId: z.string().min(1, 'Établissement requis'),
})

export const patientAccountLoginSchema = z.object({
  phone: guineaPhone,
  otpCode: z.string().length(6, 'Code OTP à 6 chiffres'),
})

export const patientAccountVerifySchema = z.object({
  phone: guineaPhone,
  otpCode: z.string().length(6, 'Code OTP à 6 chiffres'),
})

export const patientUpdateSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  primaryLanguage: z.enum(['fr', 'en', 'msk', 'sus', 'ff']).optional(),
})

export const notificationPrefsSchema = z.object({
  sms: z.boolean().default(true),
  whatsapp: z.boolean().default(false),
  email: z.boolean().default(false),
  appointmentReminder: z.boolean().default(true),
  labResults: z.boolean().default(true),
  vaccination: z.boolean().default(true),
})
