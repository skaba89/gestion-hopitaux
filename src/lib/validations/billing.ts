import { z } from 'zod'
import { idRefSchema, dateTransform, optionalDateTransform, gnfPriceSchema, optionalGnfPriceSchema, guineaPhone, optionalGuineaPhone, optionalEmailSchema } from './common'

// ============================================================================
// HealthFlow Guinea - Billing Validation Schemas
// Invoices, Invoice Items, Payments, Insurance Companies, Patient Insurance
// ============================================================================

// ---- Insurance Company ----

/**
 * Schema for creating an insurance company.
 */
export const insuranceCompanyCreateSchema = z.object({
  name: z.string().min(2, 'Nom de la compagnie requis (min 2 caractères)').max(200, 'Nom trop long'),
  code: z.string().min(1, 'Code requis').max(50, 'Code trop long'),
  address: z.string().max(500, 'Adresse trop longue').optional(),
  phone: optionalGuineaPhone,
  email: optionalEmailSchema,
  establishmentId: z.string().optional(),
  coveragePercentage: z.number().min(0, 'Couverture ≥ 0%').max(100, 'Couverture ≤ 100%').optional(),
  contactPerson: z.string().max(200, 'Personne de contact trop longue').optional(),
  isActive: z.boolean().default(true),
  notes: z.string().max(2000, 'Notes trop longues').optional(),
})

/**
 * Schema for updating an insurance company.
 */
export const insuranceCompanyUpdateSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  address: z.string().max(500).optional(),
  phone: optionalGuineaPhone,
  email: optionalEmailSchema,
  coveragePercentage: z.number().min(0).max(100).optional(),
  contactPerson: z.string().max(200).optional(),
  isActive: z.boolean().optional(),
  notes: z.string().max(2000).optional(),
})

// ---- Patient Insurance ----

/**
 * Schema for creating a patient insurance policy.
 */
export const patientInsuranceCreateSchema = z.object({
  patientId: idRefSchema.describe('Identifiant du patient'),
  companyId: idRefSchema.describe('Identifiant de la compagnie d\'assurance'),
  policyNumber: z.string().min(1, 'Numéro de police requis').max(100, 'Numéro de police trop long'),
  coveragePercentage: z.number().min(0, 'Couverture ≥ 0%').max(100, 'Couverture ≤ 100%').optional(),
  validFrom: dateTransform.describe('Date de début de validité'),
  validUntil: optionalDateTransform,
  isPrimary: z.boolean().default(true),
  isActive: z.boolean().default(true),
  notes: z.string().max(1000, 'Notes trop longues').optional(),
})

/**
 * Schema for updating a patient insurance policy.
 */
export const patientInsuranceUpdateSchema = z.object({
  coveragePercentage: z.number().min(0).max(100).optional(),
  validUntil: optionalDateTransform,
  isPrimary: z.boolean().optional(),
  isActive: z.boolean().optional(),
  notes: z.string().max(1000).optional(),
})

// ---- Invoice ----

/**
 * Schema for creating a new invoice.
 */
export const invoiceCreateSchema = z.object({
  patientId: idRefSchema.describe('Identifiant du patient'),
  establishmentId: idRefSchema.describe('Identifiant de l\'établissement'),
  admissionId: z.string().optional(),
  consultationId: z.string().optional(),
  invoiceDate: dateTransform.optional(),
  dueDate: optionalDateTransform,
  subtotal: gnfPriceSchema.default(0),
  taxAmount: gnfPriceSchema.default(0),
  discountAmount: gnfPriceSchema.default(0),
  totalAmount: gnfPriceSchema.default(0),
  insuranceCoverageAmount: gnfPriceSchema.default(0),
  patientResponsibility: gnfPriceSchema.default(0),
  status: z.enum(['DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED', 'REFUNDED']).default('DRAFT'),
  insuranceId: z.string().optional(),
  notes: z.string().max(2000, 'Notes trop longues').optional(),
  issuedById: z.string().optional(),
  items: z.array(z.object({
    description: z.string().min(1, 'Description requise').max(500, 'Description trop longue'),
    category: z.enum(['CONSULTATION', 'LAB_TEST', 'MEDICATION', 'ROOM', 'PROCEDURE', 'OTHER']),
    quantity: z.number().int().min(1, 'Quantité ≥ 1').default(1),
    unitPrice: gnfPriceSchema,
    totalPrice: gnfPriceSchema,
    discountPercent: z.number().min(0, 'Remise ≥ 0%').max(100, 'Remise ≤ 100%').default(0),
    notes: z.string().max(500).optional(),
    relatedEntityId: z.string().optional(),
    relatedEntityType: z.string().max(100).optional(),
  })).min(1, 'Au moins un article est requis'),
})

/**
 * Schema for updating an invoice.
 */
export const invoiceUpdateSchema = z.object({
  dueDate: optionalDateTransform,
  subtotal: gnfPriceSchema.optional(),
  taxAmount: gnfPriceSchema.optional(),
  discountAmount: gnfPriceSchema.optional(),
  totalAmount: gnfPriceSchema.optional(),
  insuranceCoverageAmount: gnfPriceSchema.optional(),
  patientResponsibility: gnfPriceSchema.optional(),
  status: z.enum(['DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED', 'REFUNDED']).optional(),
  insuranceId: z.string().optional(),
  notes: z.string().max(2000).optional(),
  issuedById: z.string().optional(),
  issuedAt: optionalDateTransform,
})

// ---- Invoice Item ----

/**
 * Schema for adding an item to an existing invoice.
 */
export const invoiceItemCreateSchema = z.object({
  invoiceId: idRefSchema.describe('Identifiant de la facture'),
  description: z.string().min(1, 'Description requise').max(500, 'Description trop longue'),
  category: z.enum(['CONSULTATION', 'LAB_TEST', 'MEDICATION', 'ROOM', 'PROCEDURE', 'OTHER']),
  quantity: z.number().int().min(1, 'Quantité ≥ 1').default(1),
  unitPrice: gnfPriceSchema,
  totalPrice: gnfPriceSchema,
  discountPercent: z.number().min(0, 'Remise ≥ 0%').max(100, 'Remise ≤ 100%').default(0),
  notes: z.string().max(500, 'Notes trop longues').optional(),
  relatedEntityId: z.string().optional(),
  relatedEntityType: z.string().max(100, 'Type d\'entité trop long').optional(),
})

// ---- Payment ----

/**
 * Schema for recording a payment against an invoice.
 * Supports cash, mobile money (Orange, MTN, Celcom), bank transfer, etc.
 */
export const paymentCreateSchema = z.object({
  invoiceId: idRefSchema.describe('Identifiant de la facture'),
  patientId: idRefSchema.describe('Identifiant du patient'),
  establishmentId: idRefSchema.describe('Identifiant de l\'établissement'),
  amount: gnfPriceSchema.describe('Montant en GNF'),
  paymentMethod: z.enum(['CASH', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CHECK', 'INSURANCE', 'OTHER']),
  mobileMoneyProvider: z.enum(['ORANGE', 'MTN', 'CELLCOM']).optional(),
  mobileMoneyTransactionId: z.string().max(100, 'ID transaction trop long').optional(),
  currency: z.string().max(10, 'Devise trop longue').default('GNF'),
  referenceNumber: z.string().max(100, 'Numéro de référence trop long').optional(),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED']).default('PENDING'),
  processedById: z.string().optional(),
  notes: z.string().max(1000, 'Notes trop longues').optional(),
})

/**
 * Schema for updating a payment record.
 */
export const paymentUpdateSchema = z.object({
  amount: gnfPriceSchema.optional(),
  paymentMethod: z.enum(['CASH', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CHECK', 'INSURANCE', 'OTHER']).optional(),
  mobileMoneyProvider: z.enum(['ORANGE', 'MTN', 'CELLCOM']).optional(),
  mobileMoneyTransactionId: z.string().max(100).optional(),
  referenceNumber: z.string().max(100).optional(),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED']).optional(),
  processedById: z.string().optional(),
  processedAt: optionalDateTransform,
  notes: z.string().max(1000).optional(),
})
