import { z } from 'zod'

// ============================================================================
// HealthFlow Guinea - Common Validation Schemas
// Shared utilities used across all validation modules
// ============================================================================

/**
 * Guinea phone number validator.
 * Accepts either +224 followed by 8 digits, or just 8 digits.
 * Transforms 8-digit input to full +224XXXXXXXX format.
 */
export const guineaPhone = z.string()
  .regex(/^\+224[0-9]{8}$/, 'Format: +224XXXXXXXX')
  .or(z.string().regex(/^[0-9]{8}$/, 'Format: XXXXXXXX'))
  .transform(v => v.startsWith('+224') ? v : `+224${v}`)

/**
 * Optional Guinea phone — allows empty string or undefined.
 */
export const optionalGuineaPhone = guineaPhone.optional().or(z.literal(''))

/**
 * Pagination schema for list endpoints.
 * Provides page, pageSize, and computed offset.
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1, 'La page doit être ≥ 1').default(1),
  pageSize: z.coerce.number().int().min(1, 'Taille de page ≥ 1').max(100, 'Taille de page ≤ 100').default(20),
})

/**
 * Pagination with computed offset helper.
 */
export const paginationWithOffsetSchema = paginationSchema.transform(data => ({
  ...data,
  offset: (data.page - 1) * data.pageSize,
}))

/**
 * ID parameter schema — validates route params like :id.
 */
export const idParamSchema = z.object({
  id: z.string().min(1, 'Identifiant requis'),
})

/**
 * Date range filter schema for querying by date range.
 */
export const dateRangeSchema = z.object({
  startDate: z.string().transform(v => new Date(v)).optional(),
  endDate: z.string().transform(v => new Date(v)).optional(),
})

/**
 * Sort schema — allows specifying a field and direction.
 */
export const sortSchema = z.object({
  sortBy: z.string().min(1, 'Champ de tri requis').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

/**
 * Search filter schema — full-text search query.
 */
export const searchSchema = z.object({
  search: z.string().max(200, 'Recherche trop longue').optional(),
})

/**
 * Establishment scope filter — filter by establishment.
 */
export const establishmentFilterSchema = z.object({
  establishmentId: z.string().min(1, 'Établissement requis').optional(),
})

/**
 * Audit log severity levels.
 */
export const severitySchema = z.enum(['INFO', 'WARNING', 'CRITICAL'])

/**
 * Audit log action types.
 */
export const actionSchema = z.enum([
  'CREATE',
  'READ',
  'UPDATE',
  'DELETE',
  'LOGIN',
  'LOGOUT',
  'PRINT',
  'EXPORT',
])

/**
 * Generic status schema for filter endpoints.
 */
export const statusSchema = z.string().min(1, 'Statut requis')

/**
 * Time string in HH:mm format.
 */
export const timeStringSchema = z.string().regex(
  /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  'Format HH:mm requis'
)

/**
 * Price in Guinean Francs (GNF) — non-negative number.
 */
export const gnfPriceSchema = z.number().min(0, 'Le prix doit être ≥ 0 GNF')

/**
 * Optional price in GNF.
 */
export const optionalGnfPriceSchema = z.number().min(0, 'Le prix doit être ≥ 0 GNF').optional()

/**
 * Positive integer schema — for quantities, counts, etc.
 */
export const positiveIntSchema = z.number().int().min(0, 'La valeur doit être ≥ 0')

/**
 * Non-empty string ID reference.
 */
export const idRefSchema = z.string().min(1, 'Identifiant de référence requis')

/**
 * Combined list query schema — pagination + sort + search + date range.
 */
export const listQuerySchema = paginationSchema
  .merge(sortSchema)
  .merge(searchSchema)
  .merge(dateRangeSchema)

/**
 * Date transform helper — converts ISO string to Date.
 */
export const dateTransform = z.string().transform(v => new Date(v))

/**
 * Optional date transform.
 */
export const optionalDateTransform = z.string().transform(v => new Date(v)).optional()

/**
 * Email schema with French error message.
 */
export const emailSchema = z.string().email('Adresse email invalide')

/**
 * Optional email — allows empty string or undefined.
 */
export const optionalEmailSchema = z.string().email('Adresse email invalide').optional().or(z.literal(''))
