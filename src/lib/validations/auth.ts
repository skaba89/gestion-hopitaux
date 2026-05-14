import { z } from 'zod'
import { guineaPhone, emailSchema } from './common'

// ============================================================================
// HealthFlow Guinea - Authentication Validation Schemas
// OTP, CSRF, Login, Account Management
// ============================================================================

// ---- OTP ----

/**
 * Schema for sending an OTP code to a phone number.
 */
export const otpSendSchema = z.object({
  phone: guineaPhone.describe('Numéro de téléphone guinéen'),
})

/**
 * Schema for verifying an OTP code.
 */
export const otpVerifySchema = z.object({
  phone: guineaPhone.describe('Numéro de téléphone guinéen'),
  otpCode: z.string().length(6, 'Code OTP à 6 chiffres'),
})

// ---- CSRF ----

/**
 * Schema for CSRF token validation.
 */
export const csrfTokenSchema = z.object({
  csrfToken: z.string().min(1, 'Jeton CSRF requis'),
})

// ---- Login ----

/**
 * Schema for staff/admin login with email and password.
 */
export const loginSchema = z.object({
  email: emailSchema.describe('Adresse email professionnelle'),
  password: z.string().min(8, 'Mot de passe requis (min 8 caractères)').max(128, 'Mot de passe trop long'),
})

/**
 * Schema for patient account login with phone and OTP.
 */
export const patientLoginSchema = z.object({
  phone: guineaPhone.describe('Numéro de téléphone guinéen'),
  otpCode: z.string().length(6, 'Code OTP à 6 chiffres'),
})

// ---- MFA ----

/**
 * Schema for MFA setup (TOTP).
 */
export const mfaSetupSchema = z.object({
  method: z.enum(['TOTP', 'SMS', 'EMAIL']),
  phoneNumber: guineaPhone.optional(),
})

/**
 * Schema for MFA verification during login.
 */
export const mfaVerifySchema = z.object({
  code: z.string().length(6, 'Code MFA à 6 chiffres'),
  method: z.enum(['TOTP', 'SMS', 'EMAIL']),
})

/**
 * Schema for MFA backup code usage.
 */
export const mfaBackupCodeSchema = z.object({
  backupCode: z.string().min(8, 'Code de secours invalide').max(16, 'Code de secours invalide'),
})

// ---- Password Reset ----

/**
 * Schema for requesting a password reset.
 */
export const passwordResetRequestSchema = z.object({
  email: emailSchema.describe('Adresse email'),
})

/**
 * Schema for resetting a password with a token.
 */
export const passwordResetSchema = z.object({
  token: z.string().min(1, 'Jeton de réinitialisation requis'),
  newPassword: z.string()
    .min(8, 'Mot de passe requis (min 8 caractères)')
    .max(128, 'Mot de passe trop long')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  confirmPassword: z.string().min(1, 'Confirmation du mot de passe requise'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})

// ---- Session ----

/**
 * Schema for creating a user account (admin-initiated).
 */
export const authUserCreateSchema = z.object({
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
  roleId: z.string().min(1, 'Rôle requis'),
  establishmentId: z.string().min(1, 'Établissement requis'),
})

/**
 * Schema for updating a user account.
 */
export const authUserUpdateSchema = z.object({
  email: emailSchema.optional(),
  firstName: z.string().min(2).max(100).optional(),
  lastName: z.string().min(2).max(100).optional(),
  phone: guineaPhone.optional().or(z.literal('')),
  isActive: z.boolean().optional(),
})
