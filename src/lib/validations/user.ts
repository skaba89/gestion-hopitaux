import { z } from 'zod'
import { idRefSchema, guineaPhone, emailSchema } from './common'

// ============================================================================
// HealthFlow Guinea - User Management Validation Schemas
// User CRUD, Password Change, Role Assignment
// ============================================================================

// ---- User Create ----

/**
 * Schema for creating a new system user (staff member).
 */
export const userCreateSchema = z.object({
  email: emailSchema.describe('Adresse email professionnelle'),
  password: z.string()
    .min(8, 'Mot de passe requis (min 8 caractères)')
    .max(128, 'Mot de passe trop long')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  firstName: z.string().min(2, 'Prénom requis (min 2 caractères)').max(100, 'Prénom trop long'),
  lastName: z.string().min(2, 'Nom requis (min 2 caractères)').max(100, 'Nom trop long'),
  phone: guineaPhone.optional().or(z.literal('')),
  avatarUrl: z.string().max(500, 'URL avatar trop longue').optional(),
  professionalId: z.string().max(100, 'Identifiant professionnel trop long').optional(),
  specialization: z.string().max(200, 'Spécialisation trop longue').optional(),
  isActive: z.boolean().default(true),
  /** Role assignments to create with the user */
  roles: z.array(z.object({
    roleId: idRefSchema.describe('Identifiant du rôle'),
    establishmentId: z.string().optional(),
  })).optional(),
  /** Establishments to assign the user to */
  establishments: z.array(z.object({
    establishmentId: idRefSchema.describe('Identifiant de l\'établissement'),
    isDefault: z.boolean().default(false),
  })).optional(),
})

// ---- User Update ----

/**
 * Schema for updating an existing user.
 */
export const userUpdateSchema = z.object({
  email: emailSchema.optional(),
  firstName: z.string().min(2, 'Prénom min 2 caractères').max(100).optional(),
  lastName: z.string().min(2, 'Nom min 2 caractères').max(100).optional(),
  phone: guineaPhone.optional().or(z.literal('')),
  avatarUrl: z.string().max(500).optional(),
  professionalId: z.string().max(100).optional(),
  specialization: z.string().max(200).optional(),
  isActive: z.boolean().optional(),
})

// ---- Password Change ----

/**
 * Schema for changing a user's password.
 * Requires the current password for security.
 */
export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
  newPassword: z.string()
    .min(8, 'Nouveau mot de passe requis (min 8 caractères)')
    .max(128, 'Mot de passe trop long')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  confirmPassword: z.string().min(1, 'Confirmation du mot de passe requise'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
}).refine(data => data.currentPassword !== data.newPassword, {
  message: 'Le nouveau mot de passe doit être différent de l\'ancien',
  path: ['newPassword'],
})

// ---- Role Assignment ----

/**
 * Schema for assigning a role to a user.
 */
export const roleAssignmentSchema = z.object({
  userId: idRefSchema.describe('Identifiant de l\'utilisateur'),
  roleId: idRefSchema.describe('Identifiant du rôle'),
  establishmentId: z.string().optional().describe('Établissement auquel le rôle est limité'),
  expiresAt: z.string().transform(v => new Date(v)).optional().describe('Date d\'expiration optionnelle du rôle'),
})

/**
 * Schema for removing a role from a user.
 */
export const roleRemovalSchema = z.object({
  userId: idRefSchema.describe('Identifiant de l\'utilisateur'),
  roleId: idRefSchema.describe('Identifiant du rôle'),
  establishmentId: z.string().optional(),
})

// ---- User Profile ----

/**
 * Schema for updating a user's own profile (self-service).
 * More restricted than admin user update.
 */
export const userProfileUpdateSchema = z.object({
  firstName: z.string().min(2, 'Prénom min 2 caractères').max(100).optional(),
  lastName: z.string().min(2, 'Nom min 2 caractères').max(100).optional(),
  phone: guineaPhone.optional().or(z.literal('')),
  avatarUrl: z.string().max(500).optional(),
  specialization: z.string().max(200).optional(),
})
