import { z } from 'zod'
import { idRefSchema, dateTransform, optionalDateTransform } from './common'

// ============================================================================
// HealthFlow Guinea - Public Health Validation Schemas
// Epidemiological Alerts, Health Anomalies, Health Reports, Disease Surveillance
// ============================================================================

// ---- Epidemiological Alert ----

/**
 * Schema for creating an epidemiological alert.
 * Used for outbreak tracking, notifiable diseases, and public health surveillance.
 */
export const epidemiologicalAlertCreateSchema = z.object({
  alertCode: z.string().min(1, 'Code d\'alerte requis').max(50, 'Code trop long'),
  diseaseName: z.string().min(2, 'Nom de la maladie requis (min 2 caractères)').max(300, 'Nom trop long'),
  diseaseCode: z.string().max(20, 'Code CIH trop long').optional().describe('Code ICD-10'),
  alertType: z.enum(['OUTBREAK', 'EPIDEMIC', 'ENDEMIC', 'SYNDROMIC', 'NOTIFIABLE_DISEASE']),
  severity: z.enum(['LOW', 'MODERATE', 'HIGH', 'CRITICAL']).default('MODERATE'),
  status: z.enum(['ACTIVE', 'MONITORING', 'RESOLVED', 'ESCALATED', 'CLOSED']).default('ACTIVE'),
  establishmentId: z.string().optional(),
  region: z.string().max(100, 'Région trop longue').optional(),
  affectedCount: z.number().int().min(0, 'Nombre de cas affectés ≥ 0').default(0),
  suspectedCount: z.number().int().min(0, 'Cas suspects ≥ 0').default(0),
  confirmedCount: z.number().int().min(0, 'Cas confirmés ≥ 0').default(0),
  deceasedCount: z.number().int().min(0, 'Décès ≥ 0').default(0),
  recoveredCount: z.number().int().min(0, 'Guérisons ≥ 0').default(0),
  startDate: dateTransform.describe('Date de début de l\'alerte'),
  endDate: optionalDateTransform,
  description: z.string().max(5000, 'Description trop longue').optional(),
  source: z.string().max(300, 'Source trop longue').optional(),
  geographicArea: z.string().max(500, 'Zone géographique trop longue').optional(),
  measuresTaken: z.string().max(5000, 'Mesures prises trop longues').optional(),
  reportedById: z.string().optional(),
  whoNotified: z.boolean().default(false),
  notes: z.string().max(3000, 'Notes trop longues').optional(),
})

/**
 * Schema for updating an epidemiological alert.
 */
export const epidemiologicalAlertUpdateSchema = z.object({
  diseaseName: z.string().min(2).max(300).optional(),
  diseaseCode: z.string().max(20).optional(),
  alertType: z.enum(['OUTBREAK', 'EPIDEMIC', 'ENDEMIC', 'SYNDROMIC', 'NOTIFIABLE_DISEASE']).optional(),
  severity: z.enum(['LOW', 'MODERATE', 'HIGH', 'CRITICAL']).optional(),
  status: z.enum(['ACTIVE', 'MONITORING', 'RESOLVED', 'ESCALATED', 'CLOSED']).optional(),
  region: z.string().max(100).optional(),
  affectedCount: z.number().int().min(0).optional(),
  suspectedCount: z.number().int().min(0).optional(),
  confirmedCount: z.number().int().min(0).optional(),
  deceasedCount: z.number().int().min(0).optional(),
  recoveredCount: z.number().int().min(0).optional(),
  endDate: optionalDateTransform,
  description: z.string().max(5000).optional(),
  source: z.string().max(300).optional(),
  geographicArea: z.string().max(500).optional(),
  measuresTaken: z.string().max(5000).optional(),
  verifiedById: z.string().optional(),
  verifiedAt: optionalDateTransform,
  escalatedAt: optionalDateTransform,
  resolvedAt: optionalDateTransform,
  whoNotified: z.boolean().optional(),
  whoNotifiedAt: optionalDateTransform,
  notes: z.string().max(3000).optional(),
})

// ---- Health Anomaly ----

/**
 * Schema for creating a health anomaly detection record.
 */
export const healthAnomalyCreateSchema = z.object({
  alertId: z.string().optional().describe('Alerte épidémiologique liée'),
  anomalyType: z.enum(['STATISTICAL', 'THRESHOLD', 'PATTERN', 'TREND', 'RARE_DISEASE']),
  description: z.string().min(3, 'Description requise (min 3 caractères)').max(5000, 'Description trop longue'),
  dataPoints: z.string().max(10000, 'Points de données trop longs').optional().describe('JSON des données ayant déclenché l\'anomalie'),
  threshold: z.number().optional(),
  observedValue: z.number().optional(),
  deviation: z.number().optional(),
  isConfirmed: z.boolean().default(false),
  confirmedById: z.string().optional(),
  establishmentId: z.string().optional(),
  region: z.string().max(100).optional(),
  status: z.enum(['DETECTED', 'INVESTIGATING', 'CONFIRMED', 'FALSE_POSITIVE', 'ESCALATED']).default('DETECTED'),
  resolutionNotes: z.string().max(3000, 'Notes de résolution trop longues').optional(),
})

// ---- Health Report ----

/**
 * Schema for creating a health report (weekly, monthly, quarterly, etc.).
 */
export const healthReportCreateSchema = z.object({
  reportNumber: z.string().min(1, 'Numéro de rapport requis').max(50, 'Numéro trop long'),
  title: z.string().min(3, 'Titre requis (min 3 caractères)').max(300, 'Titre trop long'),
  type: z.enum(['WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUAL', 'AD_HOC', 'NOTIFICATION']),
  establishmentId: z.string().optional(),
  region: z.string().max(100).optional(),
  periodStart: dateTransform.describe('Début de la période'),
  periodEnd: dateTransform.describe('Fin de la période'),
  status: z.enum(['DRAFT', 'REVIEWED', 'APPROVED', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  summary: z.string().max(10000, 'Résumé trop long').optional(),
  fileUrl: z.string().max(500, 'URL du fichier trop longue').optional(),
  isAutomatic: z.boolean().default(false),
  nextScheduledAt: optionalDateTransform,
  generatedById: z.string().optional(),
  items: z.array(z.object({
    section: z.string().min(1, 'Section requise').max(200, 'Section trop longue'),
    category: z.string().max(200).optional(),
    indicator: z.string().min(1, 'Indicateur requis').max(300, 'Indicateur trop long'),
    value: z.string().max(500).optional(),
    numericValue: z.number().optional(),
    unit: z.string().max(50).optional(),
    previousValue: z.string().max(500).optional(),
    targetValue: z.string().max(500).optional(),
    trend: z.enum(['UP', 'DOWN', 'STABLE']).optional(),
    commentary: z.string().max(3000).optional(),
    sortOrder: z.number().int().min(0).default(0),
  })).optional(),
})

/**
 * Schema for updating a health report.
 */
export const healthReportUpdateSchema = z.object({
  title: z.string().min(3).max(300).optional(),
  status: z.enum(['DRAFT', 'REVIEWED', 'APPROVED', 'PUBLISHED', 'ARCHIVED']).optional(),
  summary: z.string().max(10000).optional(),
  fileUrl: z.string().max(500).optional(),
  approvedById: z.string().optional(),
  approvedAt: optionalDateTransform,
  nextScheduledAt: optionalDateTransform,
})

// ---- Disease Surveillance ----

/**
 * Schema for creating a disease surveillance record.
 * Tracks notifiable diseases under Guinea public health law.
 */
export const diseaseSurveillanceCreateSchema = z.object({
  diseaseName: z.string().min(2, 'Nom de la maladie requis (min 2 caractères)').max(300, 'Nom trop long'),
  diseaseCode: z.string().max(20, 'Code CIH trop long').optional().describe('Code ICD-10'),
  isNotifiable: z.boolean().default(false).describe('Maladie à déclaration obligatoire en Guinée'),
  surveillanceType: z.enum(['PASSIVE', 'ACTIVE', 'SENTINEL', 'SYNDROMIC']),
  establishmentId: z.string().optional(),
  region: z.string().max(100, 'Région trop longue').optional(),
  reportDate: dateTransform.optional(),
  newCases: z.number().int().min(0, 'Nouveaux cas ≥ 0').default(0),
  totalCases: z.number().int().min(0, 'Total cas ≥ 0').default(0),
  deaths: z.number().int().min(0, 'Décès ≥ 0').default(0),
  recoveries: z.number().int().min(0, 'Guérisons ≥ 0').default(0),
  hospitalized: z.number().int().min(0, 'Hospitalisations ≥ 0').default(0),
  icuCases: z.number().int().min(0, 'Cas en réanimation ≥ 0').default(0),
  ageGroup: z.enum(['0-4', '5-14', '15-24', '25-64', '65+']).optional(),
  gender: z.enum(['MALE', 'FEMALE', 'ALL']).optional(),
  dataSources: z.string().max(5000, 'Sources de données trop longues').optional().describe('JSON des sources de données'),
  notes: z.string().max(3000, 'Notes trop longues').optional(),
  reportedById: z.string().optional(),
})
