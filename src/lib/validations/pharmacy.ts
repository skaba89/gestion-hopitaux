import { z } from 'zod'
import { idRefSchema, dateTransform, optionalDateTransform, gnfPriceSchema, optionalGnfPriceSchema } from './common'

// ============================================================================
// HealthFlow Guinea - Pharmacy Validation Schemas
// Medications, Stock Entries, Stock Exits
// ============================================================================

// ---- Medication ----

/**
 * Schema for creating a new medication in the catalog.
 */
export const medicationCreateSchema = z.object({
  name: z.string().min(2, 'Nom du médicament requis (min 2 caractères)').max(300, 'Nom trop long'),
  genericName: z.string().max(200, 'DCI trop longue').optional(),
  code: z.string().min(1, 'Code requis').max(50, 'Code trop long'),
  barcode: z.string().max(100, 'Code-barres trop long').optional(),
  category: z.enum([
    'ANTIBIOTIC', 'ANALGESIC', 'ANTIHYPERTENSIVE', 'ANTIDIABETIC',
    'VACCINE', 'ANTIMALARIAL', 'ANTIVIRAL', 'ANTIFUNGAL',
    'ANTIINFLAMMATORY', 'ANTIHISTAMINE', 'BRONCHODILATOR',
    'CARDIOVASCULAR', 'DERMATOLOGICAL', 'GASTROINTESTINAL',
    'HORMONAL', 'MUSCLE_RELAXANT', 'OPHTHALMIC', 'RESPIRATORY',
    'SEDATIVE', 'VITAMIN', 'OTHER',
  ]),
  form: z.enum([
    'TABLET', 'CAPSULE', 'SYRUP', 'INJECTION', 'CREAM', 'OINTMENT',
    'DROPS', 'INHALER', 'SUPPOSITORY', 'POWDER', 'SOLUTION', 'SUSPENSION',
    'PATCH', 'GEL', 'OTHER',
  ]),
  strength: z.string().max(100, 'Dosage trop long').optional(),
  manufacturer: z.string().max(200, 'Fabricant trop long').optional(),
  requiresPrescription: z.boolean().default(true),
  controlledSubstance: z.boolean().default(false),
  minimumStockLevel: z.number().int().min(0, 'Stock minimum ≥ 0').optional(),
  unitPrice: optionalGnfPriceSchema,
  sellingPrice: optionalGnfPriceSchema,
  storageConditions: z.string().max(500, 'Conditions de stockage trop longues').optional(),
  sideEffects: z.string().max(2000, 'Effets secondaires trop longs').optional(),
  contraindications: z.string().max(2000, 'Contre-indications trop longues').optional(),
  isActive: z.boolean().default(true),
})

/**
 * Schema for updating an existing medication.
 */
export const medicationUpdateSchema = z.object({
  name: z.string().min(2).max(300).optional(),
  genericName: z.string().max(200).optional(),
  barcode: z.string().max(100).optional(),
  category: z.enum([
    'ANTIBIOTIC', 'ANALGESIC', 'ANTIHYPERTENSIVE', 'ANTIDIABETIC',
    'VACCINE', 'ANTIMALARIAL', 'ANTIVIRAL', 'ANTIFUNGAL',
    'ANTIINFLAMMATORY', 'ANTIHISTAMINE', 'BRONCHODILATOR',
    'CARDIOVASCULAR', 'DERMATOLOGICAL', 'GASTROINTESTINAL',
    'HORMONAL', 'MUSCLE_RELAXANT', 'OPHTHALMIC', 'RESPIRATORY',
    'SEDATIVE', 'VITAMIN', 'OTHER',
  ]).optional(),
  form: z.enum([
    'TABLET', 'CAPSULE', 'SYRUP', 'INJECTION', 'CREAM', 'OINTMENT',
    'DROPS', 'INHALER', 'SUPPOSITORY', 'POWDER', 'SOLUTION', 'SUSPENSION',
    'PATCH', 'GEL', 'OTHER',
  ]).optional(),
  strength: z.string().max(100).optional(),
  manufacturer: z.string().max(200).optional(),
  requiresPrescription: z.boolean().optional(),
  controlledSubstance: z.boolean().optional(),
  minimumStockLevel: z.number().int().min(0).optional(),
  unitPrice: optionalGnfPriceSchema,
  sellingPrice: optionalGnfPriceSchema,
  storageConditions: z.string().max(500).optional(),
  sideEffects: z.string().max(2000).optional(),
  contraindications: z.string().max(2000).optional(),
  isActive: z.boolean().optional(),
})

// ---- Stock Entry ----

/**
 * Schema for a single stock entry item (line in a stock entry).
 */
export const stockEntryItemSchema = z.object({
  medicationId: idRefSchema.describe('Identifiant du médicament'),
  batchNumber: z.string().min(1, 'Numéro de lot requis').max(100, 'Numéro de lot trop long'),
  quantity: z.number().int().min(1, 'Quantité ≥ 1'),
  unitPrice: optionalGnfPriceSchema,
  expiryDate: optionalDateTransform,
  manufacturingDate: optionalDateTransform,
  notes: z.string().max(500, 'Notes trop longues').optional(),
})

/**
 * Schema for creating a new stock entry (incoming inventory).
 */
export const stockEntryCreateSchema = z.object({
  establishmentId: idRefSchema.describe('Identifiant de l\'établissement'),
  supplier: z.string().max(200, 'Nom du fournisseur trop long').optional(),
  invoiceNumber: z.string().max(100, 'Numéro de facture trop long').optional(),
  entryDate: dateTransform.optional(),
  totalAmount: gnfPriceSchema.optional(),
  receivedById: z.string().optional(),
  notes: z.string().max(1000, 'Notes trop longues').optional(),
  status: z.enum(['PENDING', 'VERIFIED', 'APPROVED']).default('PENDING'),
  items: z.array(stockEntryItemSchema).min(1, 'Au moins un article est requis'),
})

// ---- Stock Exit ----

/**
 * Schema for a single stock exit item (line in a stock exit).
 */
export const stockExitItemSchema = z.object({
  medicationId: idRefSchema.describe('Identifiant du médicament'),
  batchNumber: z.string().max(100, 'Numéro de lot trop long').optional(),
  quantity: z.number().int().min(1, 'Quantité ≥ 1'),
  unitPrice: optionalGnfPriceSchema,
  notes: z.string().max(500, 'Notes trop longues').optional(),
})

/**
 * Schema for creating a new stock exit (outgoing inventory).
 */
export const stockExitCreateSchema = z.object({
  establishmentId: idRefSchema.describe('Identifiant de l\'établissement'),
  exitDate: dateTransform.optional(),
  reason: z.enum(['DISPENSING', 'TRANSFER', 'DISPOSAL', 'EXPIRED', 'DAMAGED', 'OTHER']),
  recipientType: z.enum(['PATIENT', 'DEPARTMENT', 'OTHER_ESTABLISHMENT']).optional(),
  recipientId: z.string().optional(),
  recipientName: z.string().max(200, 'Nom du destinataire trop long').optional(),
  authorizedById: z.string().optional(),
  notes: z.string().max(1000, 'Notes trop longues').optional(),
  items: z.array(stockExitItemSchema).min(1, 'Au moins un article est requis'),
})

// ---- Medication Stock (Stock level tracking) ----

/**
 * Schema for updating a medication stock record.
 */
export const medicationStockUpdateSchema = z.object({
  currentQuantity: z.number().int().min(0, 'Quantité actuelle ≥ 0').optional(),
  reservedQuantity: z.number().int().min(0, 'Quantité réservée ≥ 0').optional(),
  unit: z.enum(['BOX', 'BOTTLE', 'UNIT', 'AMPULLE', 'TUBE', 'SACHET']).optional(),
  location: z.string().max(200, 'Emplacement trop long').optional(),
  notes: z.string().max(500).optional(),
})
