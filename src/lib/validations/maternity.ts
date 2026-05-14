import { z } from 'zod'
import { idRefSchema, dateTransform, optionalDateTransform } from './common'

// ============================================================================
// HealthFlow Guinea - Maternity Validation Schemas
// Pregnancy Tracking, Pregnancy Visits, Deliveries
// ============================================================================

// ---- Pregnancy Tracking ----

/**
 * Schema for creating a new pregnancy tracking record.
 */
export const pregnancyTrackingCreateSchema = z.object({
  patientId: idRefSchema.describe('Identifiant du patient (mère)'),
  establishmentId: z.string().optional(),
  startDate: dateTransform.describe('Date de dernières règles ou date estimée de conception'),
  expectedDueDate: dateTransform.describe('Date prévue d\'accouchement'),
  actualDueDate: optionalDateTransform,
  gravida: z.number().int().min(0, 'Gravidité ≥ 0').max(30, 'Gravidité max 30').default(1),
  para: z.number().int().min(0, 'Parité ≥ 0').max(30, 'Parité max 30').default(0),
  miscarriages: z.number().int().min(0, 'Fausses couches ≥ 0').max(30).default(0),
  livingChildren: z.number().int().min(0, 'Enfants vivants ≥ 0').max(30).default(0),
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  rhFactor: z.enum(['POSITIVE', 'NEGATIVE']).optional(),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH']).default('LOW'),
  riskFactors: z.string().max(3000, 'Facteurs de risque trop longs').optional(),
  attendingDoctorId: z.string().optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'MISCARRIAGE', 'TERMINATED']).default('ACTIVE'),
  notes: z.string().max(3000, 'Notes trop longues').optional(),
})

/**
 * Schema for updating a pregnancy tracking record.
 */
export const pregnancyTrackingUpdateSchema = z.object({
  expectedDueDate: dateTransform.optional(),
  actualDueDate: optionalDateTransform,
  gravida: z.number().int().min(0).max(30).optional(),
  para: z.number().int().min(0).max(30).optional(),
  miscarriages: z.number().int().min(0).max(30).optional(),
  livingChildren: z.number().int().min(0).max(30).optional(),
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  rhFactor: z.enum(['POSITIVE', 'NEGATIVE']).optional(),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH']).optional(),
  riskFactors: z.string().max(3000).optional(),
  attendingDoctorId: z.string().optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'MISCARRIAGE', 'TERMINATED']).optional(),
  notes: z.string().max(3000).optional(),
})

// ---- Pregnancy Visit ----

/**
 * Schema for creating a pregnancy visit record (prenatal consultation).
 */
export const pregnancyVisitCreateSchema = z.object({
  pregnancyId: idRefSchema.describe('Identifiant du suivi de grossesse'),
  visitDate: dateTransform.optional(),
  visitType: z.enum(['ROUTINE', 'EMERGENCY', 'ULTRASOUND', 'LAB', 'FOLLOW_UP']).default('ROUTINE'),
  gestationalAge: z.number().int().min(0, 'Âge gestationnel ≥ 0').max(45, 'Âge gestationnel max 45').optional(),
  weight: z.number().min(0, 'Poids ≥ 0').max(300, 'Poids max 300kg').optional(),
  bloodPressureSystolic: z.number().int().min(40).max(300).optional(),
  bloodPressureDiastolic: z.number().int().min(20).max(200).optional(),
  fundalHeight: z.number().min(0, 'Hauteur utérine ≥ 0').max(50, 'Hauteur utérine max 50cm').optional(),
  fetalHeartRate: z.number().int().min(0, 'FC fœtale ≥ 0').max(250, 'FC fœtale max 250').optional(),
  fetalMovement: z.enum(['PRESENT', 'ABSENT', 'DECREASED']).optional(),
  edema: z.enum(['NONE', 'MILD', 'MODERATE', 'SEVERE']).optional(),
  urineProtein: z.enum(['NEGATIVE', 'TRACE', '+1', '+2', '+3', '+4']).optional(),
  urineGlucose: z.enum(['NEGATIVE', 'TRACE', '+1', '+2', '+3', '+4']).optional(),
  hemoglobinLevel: z.number().min(0).max(25, 'Hémoglobine max 25 g/dL').optional(),
  bloodGlucose: z.number().min(0).max(50, 'Glycémie max 50 mmol/L').optional(),
  ultrasoundFindings: z.string().max(3000, 'Résultats échographiques trop longs').optional(),
  notes: z.string().max(3000, 'Notes trop longues').optional(),
  nextVisitDate: optionalDateTransform,
  performedById: z.string().optional(),
})

// ---- Delivery ----

/**
 * Schema for creating a delivery record.
 */
export const deliveryCreateSchema = z.object({
  pregnancyId: idRefSchema.describe('Identifiant du suivi de grossesse'),
  deliveryDate: dateTransform.describe('Date d\'accouchement'),
  deliveryType: z.enum(['VAGINAL', 'CESAREAN', 'VACUUM', 'FORCEPS']),
  deliveryPlace: z.string().max(300, 'Lieu d\'accouchement trop long').optional(),
  complications: z.string().max(5000, 'Complications trop longues').optional(),
  anesthesiaType: z.enum(['EPIDURAL', 'SPINAL', 'GENERAL', 'LOCAL', 'NONE']).optional(),
  attendedById: z.string().optional(),
  establishmentId: z.string().optional(),
  notes: z.string().max(3000, 'Notes trop longues').optional(),
  /** Newborn information — at least one child record is required */
  children: z.array(z.object({
    firstName: z.string().max(100, 'Prénom trop long').optional(),
    lastName: z.string().max(100, 'Nom trop long').optional(),
    gender: z.enum(['MALE', 'FEMALE']).optional(),
    birthWeight: z.number().min(0, 'Poids de naissance ≥ 0').max(10000, 'Poids max 10kg').optional(),
    birthLength: z.number().min(0, 'Taille ≥ 0').max(80, 'Taille max 80cm').optional(),
    headCircumference: z.number().min(0, 'Périmètre crânien ≥ 0').max(60, 'Périmètre max 60cm').optional(),
    apgarScore1min: z.number().int().min(0, 'APGAR 1min ≥ 0').max(10, 'APGAR 1min max 10').optional(),
    apgarScore5min: z.number().int().min(0, 'APGAR 5min ≥ 0').max(10, 'APGAR 5min max 10').optional(),
    apgarScore10min: z.number().int().min(0, 'APGAR 10min ≥ 0').max(10, 'APGAR 10min max 10').optional(),
    bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
    rhFactor: z.enum(['POSITIVE', 'NEGATIVE']).optional(),
    congenitalAnomalies: z.string().max(2000, 'Anomalies congénitales trop longues').optional(),
    birthComplications: z.string().max(2000, 'Complications de naissance trop longues').optional(),
    isBreastfeeding: z.boolean().default(true),
    status: z.enum(['ALIVE', 'DECEASED', 'STILLBORN']).default('ALIVE'),
  })).min(1, 'Au moins un nouveau-né est requis'),
})
