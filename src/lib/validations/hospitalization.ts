import { z } from 'zod'
import { idRefSchema, dateTransform, optionalDateTransform } from './common'

// ============================================================================
// HealthFlow Guinea - Hospitalization Validation Schemas
// Admissions, Hospitalization Tracking, Emergency Cases, Triage Assessments
// ============================================================================

// ---- Admission ----

/**
 * Schema for creating a new hospital admission.
 */
export const admissionCreateSchema = z.object({
  patientId: idRefSchema.describe('Identifiant du patient'),
  establishmentId: z.string().optional(),
  bedId: z.string().optional(),
  departmentId: z.string().optional(),
  attendingDoctorId: z.string().optional(),
  admittingDoctorId: z.string().optional(),
  admissionDate: dateTransform.optional(),
  expectedDischargeDate: optionalDateTransform,
  admissionType: z.enum(['PLANNED', 'EMERGENCY', 'TRANSFER', 'DAY_CASE']).default('PLANNED'),
  admissionReason: z.string().min(3, 'Motif d\'admission requis (min 3 caractères)').max(2000, 'Motif trop long'),
  diagnosisAtAdmission: z.string().max(2000, 'Diagnostic trop long').optional(),
  notes: z.string().max(3000, 'Notes trop longues').optional(),
})

/**
 * Schema for updating an existing admission (discharge, transfer, etc.).
 */
export const admissionUpdateSchema = z.object({
  bedId: z.string().optional(),
  attendingDoctorId: z.string().optional(),
  expectedDischargeDate: optionalDateTransform,
  actualDischargeDate: optionalDateTransform,
  diagnosisAtDischarge: z.string().max(2000, 'Diagnostic de sortie trop long').optional(),
  status: z.enum(['ADMITTED', 'IN_TREATMENT', 'DISCHARGED', 'TRANSFERRED', 'DECEASED']).optional(),
  dischargeSummary: z.string().max(5000, 'Résumé de sortie trop long').optional(),
  dischargeInstructions: z.string().max(3000, 'Instructions de sortie trop longues').optional(),
  dischargeCondition: z.enum(['IMPROVED', 'STABLE', 'WORSENED', 'DECEASED']).optional(),
  notes: z.string().max(3000).optional(),
})

// ---- Hospitalization Tracking ----

/**
 * Schema for creating a hospitalization tracking record.
 * Records vital signs, medications, procedures, notes, etc. during hospitalization.
 */
export const hospitalizationTrackingCreateSchema = z.object({
  admissionId: idRefSchema.describe('Identifiant de l\'admission'),
  trackingDate: dateTransform.optional(),
  type: z.enum([
    'VITAL_SIGNS', 'MEDICATION', 'PROCEDURE', 'NOTE',
    'BED_CHANGE', 'DOCTOR_VISIT', 'CONDITION_CHANGE',
  ]),
  content: z.string().min(1, 'Contenu requis').max(5000, 'Contenu trop long'),
  recordedById: z.string().optional(),
  vitals: z.string().max(2000, 'Constantes vitales trop longues').optional(),
  notes: z.string().max(2000, 'Notes trop longues').optional(),
})

// ---- Emergency Case ----

/**
 * Schema for creating a new emergency case.
 */
export const emergencyCaseCreateSchema = z.object({
  patientId: idRefSchema.describe('Identifiant du patient'),
  establishmentId: z.string().optional(),
  attendingDoctorId: z.string().optional(),
  arrivalDate: dateTransform.optional(),
  arrivalMode: z.enum(['AMBULANCE', 'WALK_IN', 'POLICE', 'TRANSFER']).optional(),
  chiefComplaint: z.string().min(3, 'Motif de consultation urgente requis (min 3 caractères)').max(2000),
  triageLevel: z.enum(['RED', 'ORANGE', 'YELLOW', 'GREEN', 'BLUE']),
  triageScore: z.number().int().min(0).max(100).optional(),
  vitalSigns: z.string().max(2000, 'Constantes vitales trop longues').optional(),
  status: z.enum([
    'TRIAGE', 'WAITING', 'IN_TREATMENT', 'OBSERVATION',
    'DISCHARGED', 'ADMITTED', 'TRANSFERRED', 'DECEASED',
  ]).default('TRIAGE'),
  diagnosis: z.string().max(2000).optional(),
  treatmentProvided: z.string().max(5000, 'Traitement trop long').optional(),
  disposition: z.enum(['DISCHARGED', 'ADMITTED', 'TRANSFERRED', 'LEFT_AGAINST_ADVICE', 'DECEASED']).optional(),
  bedAssignedId: z.string().optional(),
  admissionId: z.string().optional(),
  notes: z.string().max(3000, 'Notes trop longues').optional(),
})

/**
 * Schema for updating an emergency case.
 */
export const emergencyCaseUpdateSchema = z.object({
  attendingDoctorId: z.string().optional(),
  triageLevel: z.enum(['RED', 'ORANGE', 'YELLOW', 'GREEN', 'BLUE']).optional(),
  triageScore: z.number().int().min(0).max(100).optional(),
  vitalSigns: z.string().max(2000).optional(),
  status: z.enum([
    'TRIAGE', 'WAITING', 'IN_TREATMENT', 'OBSERVATION',
    'DISCHARGED', 'ADMITTED', 'TRANSFERRED', 'DECEASED',
  ]).optional(),
  diagnosis: z.string().max(2000).optional(),
  treatmentProvided: z.string().max(5000).optional(),
  disposition: z.enum(['DISCHARGED', 'ADMITTED', 'TRANSFERRED', 'LEFT_AGAINST_ADVICE', 'DECEASED']).optional(),
  dischargeDate: optionalDateTransform,
  bedAssignedId: z.string().optional(),
  admissionId: z.string().optional(),
  notes: z.string().max(3000).optional(),
})

// ---- Triage Assessment ----

/**
 * Schema for creating a triage assessment for an emergency case.
 * Uses the French triage color system (RED/ORANGE/YELLOW/GREEN/BLUE).
 */
export const triageAssessmentCreateSchema = z.object({
  emergencyCaseId: idRefSchema.describe('Identifiant du cas d\'urgence'),
  assessedById: idRefSchema.describe('Identifiant de l\'évaluateur'),
  assessmentDate: dateTransform.optional(),
  chiefComplaint: z.string().min(3, 'Motif de consultation requis (min 3 caractères)').max(2000),
  painLevel: z.number().int().min(0, 'Douleur min 0').max(10, 'Douleur max 10').optional(),
  consciousness: z.enum(['ALERT', 'VERBAL', 'PAIN', 'UNRESPONSIVE']).optional(),
  temperature: z.number().min(20, 'Température min 20°C').max(45, 'Température max 45°C').optional(),
  bloodPressureSystolic: z.number().int().min(40, 'PAS min 40').max(300, 'PAS max 300').optional(),
  bloodPressureDiastolic: z.number().int().min(20, 'PAD min 20').max(200, 'PAD max 200').optional(),
  heartRate: z.number().int().min(0, 'FC min 0').max(300, 'FC max 300').optional(),
  respiratoryRate: z.number().int().min(0, 'FR min 0').max(100, 'FR max 100').optional(),
  oxygenSaturation: z.number().min(0, 'SpO2 min 0%').max(100, 'SpO2 max 100%').optional(),
  weight: z.number().min(0, 'Poids ≥ 0').max(500, 'Poids max 500kg').optional(),
  triageLevel: z.enum(['RED', 'ORANGE', 'YELLOW', 'GREEN', 'BLUE']),
  triageNotes: z.string().max(2000, 'Notes de triage trop longues').optional(),
  allergiesNoted: z.string().max(1000, 'Allergies notées trop longues').optional(),
  medicationsNoted: z.string().max(1000, 'Médicaments notés trop longs').optional(),
})
