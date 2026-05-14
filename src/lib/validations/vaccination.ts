import { z } from 'zod'
import { idRefSchema, dateTransform, optionalDateTransform } from './common'

// ============================================================================
// HealthFlow Guinea - Vaccination Validation Schemas
// Vaccination Schedules, Vaccination Records
// ============================================================================

// ---- Vaccination Schedule ----

/**
 * Schema for creating a vaccination schedule entry.
 * Defines the recommended vaccination program for Guinea (PEV - Programme Élargi de Vaccination).
 */
export const vaccinationScheduleCreateSchema = z.object({
  name: z.string().min(2, 'Nom du vaccin requis (min 2 caractères)').max(200, 'Nom trop long'),
  vaccineName: z.string().min(2, 'Nom du vaccin requis (min 2 caractères)').max(200, 'Nom du vaccin trop long'),
  code: z.string().min(1, 'Code requis').max(50, 'Code trop long'),
  recommendedAgeMinDays: z.number().int().min(0, 'Âge minimum ≥ 0 jours').describe('Âge minimum recommandé en jours'),
  recommendedAgeMaxDays: z.number().int().min(0, 'Âge maximum ≥ 0 jours').describe('Âge maximum recommandé en jours'),
  numberOfDoses: z.number().int().min(1, 'Nombre de doses ≥ 1').max(20, 'Nombre de doses max 20').default(1),
  intervalDays: z.number().int().min(0, 'Intervalle ≥ 0 jours').optional(),
  route: z.enum(['IM', 'SC', 'ORAL', 'ID', 'INTRANASAL']).optional(),
  targetDisease: z.string().max(300, 'Maladie cible trop longue').optional(),
  isMandatory: z.boolean().default(false),
  country: z.string().max(100, 'Pays trop long').default('Guinea'),
  description: z.string().max(2000, 'Description trop longue').optional(),
  sideEffects: z.string().max(2000, 'Effets secondaires trop longs').optional(),
  isActive: z.boolean().default(true),
})

/**
 * Schema for updating a vaccination schedule.
 */
export const vaccinationScheduleUpdateSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  vaccineName: z.string().min(2).max(200).optional(),
  recommendedAgeMinDays: z.number().int().min(0).optional(),
  recommendedAgeMaxDays: z.number().int().min(0).optional(),
  numberOfDoses: z.number().int().min(1).max(20).optional(),
  intervalDays: z.number().int().min(0).optional(),
  route: z.enum(['IM', 'SC', 'ORAL', 'ID', 'INTRANASAL']).optional(),
  targetDisease: z.string().max(300).optional(),
  isMandatory: z.boolean().optional(),
  description: z.string().max(2000).optional(),
  sideEffects: z.string().max(2000).optional(),
  isActive: z.boolean().optional(),
})

// ---- Vaccination ----

/**
 * Schema for recording a vaccination administered to a child.
 */
export const vaccinationCreateSchema = z.object({
  childId: idRefSchema.describe('Identifiant de l\'enfant'),
  scheduleId: idRefSchema.describe('Identifiant du calendrier de vaccination'),
  doseNumber: z.number().int().min(1, 'Numéro de dose ≥ 1').max(20, 'Numéro de dose max 20').default(1),
  vaccinationDate: dateTransform.optional(),
  administeredById: z.string().optional(),
  establishmentId: z.string().optional(),
  batchNumber: z.string().max(100, 'Numéro de lot trop long').optional(),
  lotNumber: z.string().max(100, 'Numéro de lot trop long').optional(),
  site: z.enum(['LEFT_ARM', 'RIGHT_ARM', 'LEFT_THIGH', 'RIGHT_THIGH', 'ORAL']).optional(),
  reaction: z.string().max(2000, 'Réaction trop longue').optional(),
  notes: z.string().max(1000, 'Notes trop longues').optional(),
  nextDoseDate: optionalDateTransform,
  status: z.enum(['SCHEDULED', 'COMPLETED', 'MISSED', 'CANCELLED']).default('COMPLETED'),
  certificateUrl: z.string().max(500, 'URL du certificat trop longue').optional(),
})

/**
 * Schema for updating a vaccination record.
 */
export const vaccinationUpdateSchema = z.object({
  doseNumber: z.number().int().min(1).max(20).optional(),
  vaccinationDate: dateTransform.optional(),
  administeredById: z.string().optional(),
  batchNumber: z.string().max(100).optional(),
  lotNumber: z.string().max(100).optional(),
  site: z.enum(['LEFT_ARM', 'RIGHT_ARM', 'LEFT_THIGH', 'RIGHT_THIGH', 'ORAL']).optional(),
  reaction: z.string().max(2000).optional(),
  notes: z.string().max(1000).optional(),
  nextDoseDate: optionalDateTransform,
  status: z.enum(['SCHEDULED', 'COMPLETED', 'MISSED', 'CANCELLED']).optional(),
  certificateUrl: z.string().max(500).optional(),
})
