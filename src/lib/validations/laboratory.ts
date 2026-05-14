import { z } from 'zod'
import { idRefSchema, dateTransform, optionalDateTransform } from './common'

// ============================================================================
// HealthFlow Guinea - Laboratory Validation Schemas
// Lab Requests, Lab Results, Biologist Validation
// ============================================================================

// ---- Lab Request ----

/**
 * Schema for creating a new lab request.
 * A doctor orders one or more tests for a patient.
 */
export const labRequestCreateSchema = z.object({
  patientId: idRefSchema.describe('Identifiant du patient'),
  requestingDoctorId: idRefSchema.describe('Identifiant du médecin demandeur'),
  consultationId: z.string().optional(),
  establishmentId: z.string().optional(),
  priority: z.enum(['STAT', 'URGENT', 'ROUTINE']).default('ROUTINE'),
  clinicalInfo: z.string().max(2000, 'Informations cliniques trop longues').optional(),
  notes: z.string().max(1000, 'Notes trop longues').optional(),
  requestedAt: dateTransform.optional(),
  /** Array of test catalog IDs to request */
  testCatalogIds: z.array(idRefSchema).min(1, 'Au moins un examen est requis'),
})

/**
 * Schema for updating a lab request.
 */
export const labRequestUpdateSchema = z.object({
  priority: z.enum(['STAT', 'URGENT', 'ROUTINE']).optional(),
  status: z.enum(['REQUESTED', 'SAMPLE_COLLECTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  clinicalInfo: z.string().max(2000).optional(),
  notes: z.string().max(1000).optional(),
  sampleCollectedAt: optionalDateTransform,
  completedAt: optionalDateTransform,
})

// ---- Lab Request Item ----

/**
 * Schema for a single lab request item (individual test within a request).
 */
export const labRequestItemSchema = z.object({
  testCatalogId: idRefSchema.describe('Identifiant du catalogue d\'examen'),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).default('PENDING'),
  notes: z.string().max(500).optional(),
})

// ---- Lab Result ----

/**
 * Schema for creating a lab result entry.
 */
export const labResultCreateSchema = z.object({
  labRequestId: idRefSchema.describe('Identifiant de la demande de laboratoire'),
  testCatalogId: idRefSchema.describe('Identifiant du catalogue d\'examen'),
  resultValue: z.string().max(500, 'Valeur du résultat trop longue').optional(),
  numericValue: z.number().optional(),
  unit: z.string().max(50, 'Unité trop longue').optional(),
  isAbnormal: z.boolean().default(false),
  abnormalFlag: z.enum(['LOW', 'HIGH', 'CRITICAL_LOW', 'CRITICAL_HIGH']).optional(),
  referenceRange: z.string().max(200, 'Plage de référence trop longue').optional(),
  status: z.enum(['PENDING', 'PRELIMINARY', 'FINAL', 'AMENDED', 'CANCELLED']).default('PENDING'),
  comments: z.string().max(2000, 'Commentaires trop longs').optional(),
})

/**
 * Schema for updating a lab result.
 */
export const labResultUpdateSchema = z.object({
  resultValue: z.string().max(500).optional(),
  numericValue: z.number().optional(),
  unit: z.string().max(50).optional(),
  isAbnormal: z.boolean().optional(),
  abnormalFlag: z.enum(['LOW', 'HIGH', 'CRITICAL_LOW', 'CRITICAL_HIGH']).optional(),
  referenceRange: z.string().max(200).optional(),
  status: z.enum(['PENDING', 'PRELIMINARY', 'FINAL', 'AMENDED', 'CANCELLED']).optional(),
  comments: z.string().max(2000).optional(),
})

/**
 * Schema for biologist validation of a lab result.
 * Records who validated and when, with sign-off.
 */
export const labResultValidateSchema = z.object({
  id: idRefSchema.describe('Identifiant du résultat de laboratoire'),
  validatedById: idRefSchema.describe('Identifiant du biologiste validateur'),
  isSignedOff: z.boolean().default(true),
  comments: z.string().max(2000, 'Commentaires trop longs').optional(),
  /** Reason for amendment if amending a previous result */
  amendmentReason: z.string().max(1000, 'Raison d\'amendement trop longue').optional(),
})

// ---- Lab Test Catalog ----

/**
 * Schema for creating a lab test catalog entry.
 */
export const labTestCatalogCreateSchema = z.object({
  name: z.string().min(2, 'Nom de l\'examen requis (min 2 caractères)').max(200),
  code: z.string().min(1, 'Code requis').max(50, 'Code trop long'),
  category: z.enum(['HEMATOLOGY', 'BIOCHEMISTRY', 'MICROBIOLOGY', 'IMMUNOLOGY', 'URINALYSIS', 'HORMONAL', 'OTHER']),
  specimenType: z.enum(['BLOOD', 'URINE', 'STOOL', 'CSF', 'SPUTUM', 'OTHER']),
  normalRangeMin: z.number().optional(),
  normalRangeMax: z.number().optional(),
  unit: z.string().max(50).optional(),
  turnaroundHours: z.number().int().min(0).optional(),
  price: z.number().min(0, 'Le prix doit être ≥ 0').optional(),
  isActive: z.boolean().default(true),
  description: z.string().max(2000).optional(),
})

/**
 * Schema for updating a lab test catalog entry.
 */
export const labTestCatalogUpdateSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  category: z.enum(['HEMATOLOGY', 'BIOCHEMISTRY', 'MICROBIOLOGY', 'IMMUNOLOGY', 'URINALYSIS', 'HORMONAL', 'OTHER']).optional(),
  specimenType: z.enum(['BLOOD', 'URINE', 'STOOL', 'CSF', 'SPUTUM', 'OTHER']).optional(),
  normalRangeMin: z.number().optional(),
  normalRangeMax: z.number().optional(),
  unit: z.string().max(50).optional(),
  turnaroundHours: z.number().int().min(0).optional(),
  price: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
  description: z.string().max(2000).optional(),
})
