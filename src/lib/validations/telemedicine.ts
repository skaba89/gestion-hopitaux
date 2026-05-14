import { z } from 'zod'
import { idRefSchema, dateTransform, optionalDateTransform, guineaPhone } from './common'

// ============================================================================
// HealthFlow Guinea - Telemedicine Validation Schemas
// Teleconsultations, Secure Messages, Shared Documents
// ============================================================================

// ---- Teleconsultation ----

/**
 * Schema for creating a new teleconsultation (video/audio/chat).
 */
export const teleconsultationCreateSchema = z.object({
  patientId: idRefSchema.describe('Identifiant du patient'),
  doctorId: idRefSchema.describe('Identifiant du médecin'),
  establishmentId: z.string().optional(),
  scheduledAt: dateTransform.describe('Date et heure planifiées'),
  type: z.enum(['VIDEO', 'AUDIO', 'CHAT']).default('VIDEO'),
  status: z.enum(['SCHEDULED', 'WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).default('SCHEDULED'),
  meetingUrl: z.string().max(500, 'URL de réunion trop longue').optional(),
  meetingId: z.string().max(100, 'ID de réunion trop long').optional(),
  meetingPassword: z.string().max(100, 'Mot de passe trop long').optional(),
  chiefComplaint: z.string().max(2000, 'Motif trop long').optional(),
  notes: z.string().max(3000, 'Notes trop longues').optional(),
})

/**
 * Schema for updating a teleconsultation.
 */
export const teleconsultationUpdateSchema = z.object({
  scheduledAt: dateTransform.optional(),
  startedAt: optionalDateTransform,
  endedAt: optionalDateTransform,
  duration: z.number().int().min(0, 'Durée ≥ 0').max(600, 'Durée max 600 minutes').optional(),
  type: z.enum(['VIDEO', 'AUDIO', 'CHAT']).optional(),
  status: z.enum(['SCHEDULED', 'WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  meetingUrl: z.string().max(500).optional(),
  recordingUrl: z.string().max(500, 'URL d\'enregistrement trop longue').optional(),
  chiefComplaint: z.string().max(2000).optional(),
  diagnosis: z.string().max(2000, 'Diagnostic trop long').optional(),
  prescription: z.string().max(5000, 'Ordonnance trop longue').optional(),
  followUpNeeded: z.boolean().optional(),
  followUpDate: optionalDateTransform,
  technicalIssues: z.string().max(2000, 'Problèmes techniques trop longs').optional(),
  patientRating: z.number().int().min(1, 'Note min 1').max(5, 'Note max 5').optional(),
  patientFeedback: z.string().max(2000, 'Commentaire patient trop long').optional(),
  notes: z.string().max(3000).optional(),
})

// ---- Secure Message ----

/**
 * Schema for creating a secure message between users.
 * Messages are encrypted by default in the HealthFlow system.
 */
export const secureMessageCreateSchema = z.object({
  recipientId: idRefSchema.describe('Identifiant du destinataire'),
  patientId: z.string().optional().describe('Patient concerné (contexte)'),
  teleconsultationId: z.string().optional().describe('Téléconsultation liée (contexte)'),
  subject: z.string().max(300, 'Objet trop long').optional(),
  content: z.string().min(1, 'Contenu du message requis').max(10000, 'Contenu trop long'),
  messageType: z.enum(['TEXT', 'FILE', 'IMAGE', 'SYSTEM']).default('TEXT'),
  attachmentUrl: z.string().max(500, 'URL de pièce jointe trop longue').optional(),
  attachmentName: z.string().max(200, 'Nom de pièce jointe trop long').optional(),
  attachmentSize: z.number().int().min(0, 'Taille ≥ 0').max(52428800, 'Taille max 50 Mo').optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  parentMessageId: z.string().optional().describe('ID du message parent (pour le fil de discussion)'),
})

// ---- Shared Document ----

/**
 * Schema for creating a shared document in a teleconsultation context.
 */
export const sharedDocumentCreateSchema = z.object({
  teleconsultationId: z.string().optional(),
  patientId: z.string().optional(),
  fileName: z.string().min(1, 'Nom du fichier requis').max(300, 'Nom de fichier trop long'),
  fileUrl: z.string().min(1, 'URL du fichier requise').max(500, 'URL trop longue'),
  fileSize: z.number().int().min(0, 'Taille ≥ 0').optional(),
  mimeType: z.string().max(100, 'Type MIME trop long').optional(),
  description: z.string().max(1000, 'Description trop longue').optional(),
  isEncrypted: z.boolean().default(false),
  accessLevel: z.enum(['PARTICIPANTS', 'DOCTOR_ONLY', 'PATIENT_ONLY']).default('PARTICIPANTS'),
  expiresAt: optionalDateTransform,
})
