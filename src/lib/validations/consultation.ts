import { z } from 'zod'
import { idRefSchema, dateTransform, optionalDateTransform } from './common'

// ============================================================================
// HealthFlow Guinea - Consultation Validation Schemas
// Consultations, Prescriptions, Consultation Reports
// ============================================================================

// ---- Consultation ----

/**
 * Schema for creating a new consultation.
 * Links a patient and doctor, captures chief complaint, examination, and diagnosis.
 */
export const consultationCreateSchema = z.object({
  appointmentId: z.string().optional(),
  patientId: idRefSchema.describe('Identifiant du patient'),
  doctorId: idRefSchema.describe('Identifiant du médecin'),
  establishmentId: z.string().optional(),
  consultationDate: dateTransform.optional(),
  chiefComplaint: z.string().min(3, 'Motif de consultation requis (min 3 caractères)').max(1000, 'Motif trop long (max 1000 caractères)'),
  historyOfPresentIllness: z.string().max(5000, 'Histoire de la maladie trop longue').optional(),
  physicalExamination: z.string().max(5000, 'Examen physique trop long').optional(),
  diagnosis: z.string().max(2000, 'Diagnostic trop long').optional(),
  differentialDiagnosis: z.string().max(2000, 'Diagnostics différentiels trop longs').optional(),
  treatmentPlan: z.string().max(5000, 'Plan de traitement trop long').optional(),
  followUpInstructions: z.string().max(3000, 'Instructions de suivi trop longues').optional(),
  notes: z.string().max(3000, 'Notes trop longues').optional(),
  vitals: z.string().max(2000, 'Données vitales trop longues').optional(),
  status: z.enum(['IN_PROGRESS', 'COMPLETED', 'CANCELLED']).default('IN_PROGRESS'),
})

/**
 * Schema for updating an existing consultation.
 * All fields are optional; only provided fields will be updated.
 */
export const consultationUpdateSchema = z.object({
  chiefComplaint: z.string().min(3).max(1000).optional(),
  historyOfPresentIllness: z.string().max(5000).optional(),
  physicalExamination: z.string().max(5000).optional(),
  diagnosis: z.string().max(2000).optional(),
  differentialDiagnosis: z.string().max(2000).optional(),
  treatmentPlan: z.string().max(5000).optional(),
  followUpInstructions: z.string().max(3000).optional(),
  notes: z.string().max(3000).optional(),
  vitals: z.string().max(2000).optional(),
  status: z.enum(['IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  completedAt: optionalDateTransform,
})

// ---- Prescription ----

/**
 * Schema for creating a new prescription within a consultation.
 */
export const prescriptionCreateSchema = z.object({
  consultationId: idRefSchema.describe('Identifiant de la consultation'),
  patientId: idRefSchema.describe('Identifiant du patient'),
  doctorId: idRefSchema.describe('Identifiant du médecin prescripteur'),
  prescriptionDate: dateTransform.optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED']).default('ACTIVE'),
  notes: z.string().max(1000, 'Notes trop longues').optional(),
  validUntil: optionalDateTransform,
})

/**
 * Schema for updating an existing prescription.
 */
export const prescriptionUpdateSchema = z.object({
  status: z.enum(['ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED']).optional(),
  notes: z.string().max(1000).optional(),
  validUntil: optionalDateTransform,
})

// ---- Prescription Item ----

/**
 * Schema for a single prescription item (medication line).
 */
export const prescriptionItemSchema = z.object({
  medicationName: z.string().min(2, 'Nom du médicament requis (min 2 caractères)').max(200),
  medicationId: z.string().optional(),
  dosage: z.string().min(1, 'Posologie requise').max(100, 'Posologie trop longue'),
  frequency: z.string().min(1, 'Fréquence requise').max(100, 'Fréquence trop longue'),
  duration: z.string().min(1, 'Durée requise').max(100, 'Durée trop longue'),
  route: z.enum(['ORAL', 'IV', 'IM', 'SC', 'TOPICAL', 'INHALATION', 'RECTAL', 'SUBLINGUAL', 'OPHTHALMIC', 'OTIC', 'NASAL']).optional(),
  quantity: z.number().int().min(0).optional(),
  instructions: z.string().max(500, 'Instructions trop longues').optional(),
  refills: z.number().int().min(0, 'Nombre de renouvellements ≥ 0').default(0),
})

/**
 * Schema for creating a prescription with embedded items.
 */
export const prescriptionWithItemsCreateSchema = prescriptionCreateSchema.extend({
  items: z.array(prescriptionItemSchema).min(1, 'Au moins un médicament est requis'),
})

// ---- Consultation Report ----

/**
 * Schema for creating a consultation report (certificate, referral, etc.).
 */
export const consultationReportCreateSchema = z.object({
  consultationId: idRefSchema.describe('Identifiant de la consultation'),
  title: z.string().min(3, 'Titre requis (min 3 caractères)').max(300, 'Titre trop long'),
  type: z.enum(['MEDICAL_CERTIFICATE', 'REFERRAL', 'DISCHARGE_SUMMARY', 'REPORT', 'SECOND_OPINION']),
  content: z.string().min(10, 'Contenu requis (min 10 caractères)').max(50000, 'Contenu trop long'),
  fileUrl: z.string().max(500).optional(),
  isSigned: z.boolean().default(false),
  signedById: z.string().optional(),
})

/**
 * Schema for updating a consultation report.
 */
export const consultationReportUpdateSchema = z.object({
  title: z.string().min(3).max(300).optional(),
  content: z.string().min(10).max(50000).optional(),
  fileUrl: z.string().max(500).optional(),
  isSigned: z.boolean().optional(),
  signedById: z.string().optional(),
})
