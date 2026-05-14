import { z } from 'zod'
import { idRefSchema, optionalGuineaPhone, optionalEmailSchema, dateTransform } from './common'

// ============================================================================
// HealthFlow Guinea - Establishment Validation Schemas
// Establishments, Departments, Rooms, Beds
// ============================================================================

// ---- Establishment ----

/**
 * Schema for creating a new establishment (hospital, clinic, health center, dispensary).
 */
export const establishmentCreateSchema = z.object({
  name: z.string().min(2, 'Nom de l\'établissement requis (min 2 caractères)').max(300, 'Nom trop long'),
  type: z.enum(['HOSPITAL', 'CLINIC', 'HEALTH_CENTER', 'DISPENSARY']),
  code: z.string().min(1, 'Code requis').max(20, 'Code trop long'),
  address: z.string().max(500, 'Adresse trop longue').optional(),
  city: z.string().max(100, 'Ville trop longue').optional(),
  region: z.string().max(100, 'Région trop longue').optional(),
  country: z.string().max(100, 'Pays trop long').default('Guinea'),
  phone: optionalGuineaPhone,
  email: optionalEmailSchema,
  logoUrl: z.string().max(500, 'URL du logo trop longue').optional(),
  isActive: z.boolean().default(true),
  parentId: z.string().optional().describe('Établissement parent (pour la hiérarchie)'),
})

/**
 * Schema for updating an establishment.
 */
export const establishmentUpdateSchema = z.object({
  name: z.string().min(2).max(300).optional(),
  type: z.enum(['HOSPITAL', 'CLINIC', 'HEALTH_CENTER', 'DISPENSARY']).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  region: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  phone: optionalGuineaPhone,
  email: optionalEmailSchema,
  logoUrl: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
  parentId: z.string().optional(),
})

// ---- Department ----

/**
 * Schema for creating a department within an establishment.
 */
export const departmentCreateSchema = z.object({
  name: z.string().min(2, 'Nom du département requis (min 2 caractères)').max(200, 'Nom trop long'),
  code: z.string().min(1, 'Code requis').max(20, 'Code trop long'),
  type: z.enum([
    'MEDICAL', 'SURGICAL', 'PEDIATRICS', 'MATERNITY', 'EMERGENCY',
    'LAB', 'PHARMACY', 'ADMIN', 'RADIOLOGY', 'ANESTHESIOLOGY',
    'CARDIOLOGY', 'NEUROLOGY', 'ONCOLOGY', 'OPHTHALMOLOGY',
    'ENT', 'DERMATOLOGY', 'PSYCHIATRY', 'REHABILITATION', 'OTHER',
  ]),
  establishmentId: idRefSchema.describe('Identifiant de l\'établissement'),
  headDoctorId: z.string().optional(),
  floor: z.string().max(20, 'Étage trop long').optional(),
  description: z.string().max(1000, 'Description trop longue').optional(),
  isActive: z.boolean().default(true),
})

// ---- Room ----

/**
 * Schema for creating a room within a department.
 */
export const roomCreateSchema = z.object({
  number: z.string().min(1, 'Numéro de chambre requis').max(20, 'Numéro trop long'),
  name: z.string().max(200, 'Nom trop long').optional(),
  type: z.enum([
    'GENERAL', 'PRIVATE', 'ICU', 'OPERATING', 'CONSULTATION',
    'LAB', 'EMERGENCY', 'MATERNITY', 'PEDIATRIC', 'RADIOLOGY',
    'STORAGE', 'OTHER',
  ]),
  floor: z.string().max(20, 'Étage trop long').optional(),
  establishmentId: idRefSchema.describe('Identifiant de l\'établissement'),
  departmentId: idRefSchema.describe('Identifiant du département'),
  isActive: z.boolean().default(true),
})

// ---- Bed ----

/**
 * Schema for creating a bed within a room.
 */
export const bedCreateSchema = z.object({
  number: z.string().min(1, 'Numéro de lit requis').max(20, 'Numéro trop long'),
  type: z.enum(['STANDARD', 'ELECTRIC', 'ICU', 'STRETCHER', 'PEDIATRIC', 'BARIATRIC', 'OTHER']),
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED']).default('AVAILABLE'),
  establishmentId: idRefSchema.describe('Identifiant de l\'établissement'),
  roomId: idRefSchema.describe('Identifiant de la chambre'),
  currentAdmissionId: z.string().optional(),
  lastSanitizedAt: dateTransform.optional(),
  notes: z.string().max(500, 'Notes trop longues').optional(),
})

/**
 * Schema for updating a bed.
 */
export const bedUpdateSchema = z.object({
  type: z.enum(['STANDARD', 'ELECTRIC', 'ICU', 'STRETCHER', 'PEDIATRIC', 'BARIATRIC', 'OTHER']).optional(),
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED']).optional(),
  currentAdmissionId: z.string().optional(),
  lastSanitizedAt: dateTransform.optional(),
  notes: z.string().max(500).optional(),
})
