/* ─────────────────────────────────────────────────────────────
   HealthFlow Guinea — Blood Bank Management Module
   CHU Donka · Conakry, République de Guinée
   ───────────────────────────────────────────────────────────── */

/* ══════════════════════════════════════════════════════════════
   1. ENUMS & CONSTANTS
   ══════════════════════════════════════════════════════════════ */

export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] as const
export type BloodType = (typeof BLOOD_TYPES)[number]

export const PRODUCT_TYPES = [
  'Sang total',
  'Plasma',
  'Plaquettes',
  'Cryoprécipité',
  'CGR',
] as const
export type ProductType = (typeof PRODUCT_TYPES)[number]

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  'Sang total': 'Sang total',
  'Plasma': 'Plasma',
  'Plaquettes': 'Plaquettes',
  'Cryoprécipité': 'Cryoprécipité',
  'CGR': 'Concentré de Globules Rouges',
}

export const PRODUCT_DEFAULT_VOLUMES: Record<ProductType, number> = {
  'Sang total': 450,
  'Plasma': 250,
  'Plaquettes': 50,
  'Cryoprécipité': 15,
  'CGR': 300,
}

export const PRODUCT_SHELF_LIFE_DAYS: Record<ProductType, number> = {
  'Sang total': 35,
  'Plasma': 365,
  'Plaquettes': 5,
  'Cryoprécipité': 365,
  'CGR': 42,
}

export const PRODUCT_STORAGE_TEMPS: Record<ProductType, { min: number; max: number; unit: string }> = {
  'Sang total': { min: 2, max: 6, unit: '°C' },
  'Plasma': { min: -25, max: -30, unit: '°C' },
  'Plaquettes': { min: 20, max: 24, unit: '°C' },
  'Cryoprécipité': { min: -25, max: -30, unit: '°C' },
  'CGR': { min: 2, max: 6, unit: '°C' },
}

export type BloodProductStatus = 'available' | 'reserved' | 'transfused' | 'expired' | 'discarded'

export const STATUS_LABELS: Record<BloodProductStatus, string> = {
  available: 'Disponible',
  reserved: 'Réservé',
  transfused: 'Transfusé',
  expired: 'Expiré',
  discarded: 'Éliminé',
}

export type DonorCategory = 'Volontaire' | 'Familial' | 'Autologue'

export const DONOR_CATEGORY_LABELS: Record<DonorCategory, string> = {
  Volontaire: 'Donneur volontaire',
  Familial: 'Donneur familial',
  Autologue: 'Don autologue',
}

export type SerologyTest = 'VIH' | 'HVB' | 'HVC' | 'Syphilis' | 'Paludisme'
export const SEROLOGY_TESTS: SerologyTest[] = ['VIH', 'HVB', 'HVC', 'Syphilis', 'Paludisme']

export type SerologyResult = 'Positif' | 'Négatif' | 'Indéterminé' | 'En attente'

export type TransfusionReactionSeverity = 'Légère' | 'Modérée' | 'Sévère' | 'Fatale'
export type TransfusionReactionType =
  | 'Réaction fébrile non hémolytique'
  | 'Réaction allergique'
  | 'Hémolyse aiguë'
  | 'Hémolyse retardée'
  | 'Surcharge volémique'
  | 'TRALI'
  | 'Septicémie bactérienne'
  | 'Réaction anaphylactique'

export type CrossMatchResult = 'Compatible' | 'Incompatible' | 'Mineur incompatibilité' | 'En attente'

export type AlertSeverity = 'critique' | 'urgent' | 'attention' | 'info'
export type AlertType = 'stock_bas' | 'expiration_proche' | 'donneur_eligible' | 'incompatibilite' | 'reaction_transfusion'

/* ══════════════════════════════════════════════════════════════
   2. INTERFACES
   ══════════════════════════════════════════════════════════════ */

/* ─── Temperature Reading ─── */
export interface TemperatureReading {
  id: string
  productId: string
  timestamp: string
  temperature: number
  unit: string
  isWithinRange: boolean
  recordedBy: string
}

/* ─── Blood Product (Stock Unit) ─── */
export interface BloodProduct {
  id: string
  productCode: string
  bloodType: BloodType
  productType: ProductType
  volumeMl: number
  collectionDate: string
  expiryDate: string
  storageLocation: string
  temperatureReadings: TemperatureReading[]
  status: BloodProductStatus
  donorId: string
  reservedForPatientId?: string
  reservedForPatientName?: string
  transfusedDate?: string
  transfusedToPatientId?: string
  transfusedToPatientName?: string
  discardedReason?: string
  notes?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

/* ─── Serology Screen ─── */
export interface SerologyScreen {
  id: string
  donorId: string
  testDate: string
  results: Record<SerologyTest, SerologyResult>
  laboratory: string
  technician: string
  isEligible: boolean
  notes?: string
}

/* ─── Donation Record ─── */
export interface DonationRecord {
  id: string
  donorId: string
  donationDate: string
  productType: ProductType
  volumeMl: number
  productId: string
  serologyScreenId: string
  site: string
  staffName: string
  notes?: string
}

/* ─── Donor ─── */
export interface Donor {
  id: string
  donorCode: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: 'M' | 'F'
  bloodType: BloodType
  rhFactor: '+' | '-'
  phone: string
  address: string
  prefecture: string
  quartier?: string
  category: DonorCategory
  weightKg: number
  donationHistory: DonationRecord[]
  serologyHistory: SerologyScreen[]
  lastDonationDate?: string
  isEligible: boolean
  ineligibilityReason?: string
  totalDonations: number
  notes?: string
  registeredAt: string
  updatedAt: string
}

/* ─── Cross-Match Test ─── */
export interface CrossMatchTest {
  id: string
  patientId: string
  patientName: string
  patientBloodType: BloodType
  productId: string
  productBloodType: BloodType
  productType: ProductType
  testDate: string
  result: CrossMatchResult
  technique: 'Gel' | 'Tube' | 'Carte'
  performedBy: string
  validatedBy?: string
  notes?: string
}

/* ─── Transfusion Record ─── */
export interface TransfusionRecord {
  id: string
  patientId: string
  patientName: string
  patientBloodType: BloodType
  productId: string
  productCode: string
  productBloodType: BloodType
  productType: ProductType
  volumeMl: number
  crossMatchId: string
  startDate: string
  endDate?: string
  prescribedBy: string
  administeredBy: string
  service: string
  reactions: TransfusionReaction[]
  traceability: TransfusionTraceability
  status: 'En cours' | 'Terminée' | 'Interrompue'
  notes?: string
}

/* ─── Transfusion Reaction ─── */
export interface TransfusionReaction {
  id: string
  transfusionId: string
  reactionType: TransfusionReactionType
  severity: TransfusionReactionSeverity
  onsetMinutes: number
  symptoms: string[]
  management: string
  outcome: string
  reportedBy: string
  reportedAt: string
}

/* ─── Transfusion Traceability ─── */
export interface TransfusionTraceability {
  donorId: string
  donorCode: string
  productId: string
  productCode: string
  collectionDate: string
  serologyScreenId: string
  serologyClear: boolean
  crossMatchId: string
  crossMatchCompatible: boolean
  transfusionId: string
  patientId: string
  patientName: string
}

/* ─── Blood Bank Alert ─── */
export interface BloodBankAlert {
  id: string
  type: AlertType
  severity: AlertSeverity
  title: string
  message: string
  bloodType?: BloodType
  productType?: ProductType
  donorId?: string
  donorName?: string
  productId?: string
  createdAt: string
  isRead: boolean
  isResolved: boolean
  resolvedAt?: string
  resolvedBy?: string
}

/* ─── Stock Summary ─── */
export interface BloodStockSummary {
  bloodType: BloodType
  totalUnits: number
  availableUnits: number
  reservedUnits: number
  byProduct: Record<ProductType, { total: number; available: number }>
  criticalLevel: boolean
}

/* ─── Full Bank Overview ─── */
export interface BloodBankOverview {
  totalProducts: number
  availableProducts: number
  reservedProducts: number
  expiredProducts: number
  transfusedProducts: number
  discardedProducts: number
  totalDonors: number
  eligibleDonors: number
  stockByType: BloodStockSummary[]
  recentTransfusions: TransfusionRecord[]
  activeAlerts: BloodBankAlert[]
}

/* ══════════════════════════════════════════════════════════════
   3. COMPATIBILITY MATRIX
   ══════════════════════════════════════════════════════════════ */

/**
 * ABO/Rh compatibility for RED BLOOD CELL (CGR / Sang total) transfusions.
 * Recipient row → Donor column. true = compatible.
 * Rule: RBC must lack antigens that the recipient has antibodies against.
 */
export const RBC_COMPATIBILITY: Record<BloodType, Record<BloodType, boolean>> = {
  'O-':  { 'O-': true,  'O+': false, 'A-': false, 'A+': false, 'B-': false, 'B+': false, 'AB-': false, 'AB+': false },
  'O+':  { 'O-': true,  'O+': true,  'A-': false, 'A+': false, 'B-': false, 'B+': false, 'AB-': false, 'AB+': false },
  'A-':  { 'O-': true,  'O+': false, 'A-': true,  'A+': false, 'B-': false, 'B+': false, 'AB-': false, 'AB+': false },
  'A+':  { 'O-': true,  'O+': true,  'A-': true,  'A+': true,  'B-': false, 'B+': false, 'AB-': false, 'AB+': false },
  'B-':  { 'O-': true,  'O+': false, 'A-': false, 'A+': false, 'B-': true,  'B+': false, 'AB-': false, 'AB+': false },
  'B+':  { 'O-': true,  'O+': true,  'A-': false, 'A+': false, 'B-': true,  'B+': true,  'AB-': false, 'AB+': false },
  'AB-': { 'O-': true,  'O+': false, 'A-': true,  'A+': false, 'B-': true,  'B+': false, 'AB-': true,  'AB+': false },
  'AB+': { 'O-': true,  'O+': true,  'A-': true,  'A+': true,  'B-': true,  'B+': true,  'AB-': true,  'AB+': true },
}

/**
 * ABO/Rh compatibility for PLASMA transfusions.
 * Recipient row → Donor column. true = compatible.
 * Rule: Plasma must lack antibodies against recipient RBC antigens.
 * (Inverse of RBC — AB plasma is universal donor, O plasma is most restrictive.)
 */
export const PLASMA_COMPATIBILITY: Record<BloodType, Record<BloodType, boolean>> = {
  'O-':  { 'O-': true,  'O+': true,  'A-': true,  'A+': true,  'B-': true,  'B+': true,  'AB-': true,  'AB+': true },
  'O+':  { 'O-': true,  'O+': true,  'A-': true,  'A+': true,  'B-': true,  'B+': true,  'AB-': true,  'AB+': true },
  'A-':  { 'O-': true,  'O+': true,  'A-': true,  'A+': true,  'B-': false, 'B+': false, 'AB-': true,  'AB+': true },
  'A+':  { 'O-': true,  'O+': true,  'A-': true,  'A+': true,  'B-': false, 'B+': false, 'AB-': true,  'AB+': true },
  'B-':  { 'O-': true,  'O+': true,  'A-': false, 'A+': false, 'B-': true,  'B+': true,  'AB-': true,  'AB+': true },
  'B+':  { 'O-': true,  'O+': true,  'A-': false, 'A+': false, 'B-': true,  'B+': true,  'AB-': true,  'AB+': true },
  'AB-': { 'O-': true,  'O+': true,  'A-': false, 'A+': false, 'B-': false, 'B+': false, 'AB-': true,  'AB+': true },
  'AB+': { 'O-': true,  'O+': true,  'A-': false, 'A+': false, 'B-': false, 'B+': false, 'AB-': true,  'AB+': true },
}

/**
 * ABO/Rh compatibility for PLATELET (Plaquettes) transfusions.
 * Recipient row → Donor column. true = compatible.
 * Platelets carry some ABO antigens; Rh is less critical but still tracked.
 * Best practice: ABO-identical > ABO-compatible > ABO-minor incompatible.
 */
export const PLATELET_COMPATIBILITY: Record<BloodType, Record<BloodType, boolean>> = {
  'O-':  { 'O-': true,  'O+': true,  'A-': false, 'A+': false, 'B-': false, 'B+': false, 'AB-': false, 'AB+': false },
  'O+':  { 'O-': true,  'O+': true,  'A-': false, 'A+': false, 'B-': false, 'B+': false, 'AB-': false, 'AB+': false },
  'A-':  { 'O-': true,  'O+': true,  'A-': true,  'A+': true,  'B-': false, 'B+': false, 'AB-': false, 'AB+': false },
  'A+':  { 'O-': true,  'O+': true,  'A-': true,  'A+': true,  'B-': false, 'B+': false, 'AB-': false, 'AB+': false },
  'B-':  { 'O-': true,  'O+': true,  'A-': false, 'A+': false, 'B-': true,  'B+': true,  'AB-': false, 'AB+': false },
  'B+':  { 'O-': true,  'O+': true,  'A-': false, 'A+': false, 'B-': true,  'B+': true,  'AB-': false, 'AB+': false },
  'AB-': { 'O-': true,  'O+': true,  'A-': true,  'A+': true,  'B-': true,  'B+': true,  'AB-': true,  'AB+': true },
  'AB+': { 'O-': true,  'O+': true,  'A-': true,  'A+': true,  'B-': true,  'B+': true,  'AB-': true,  'AB+': true },
}

/**
 * Get the appropriate compatibility matrix for a product type.
 */
export function getCompatibilityMatrix(productType: ProductType): Record<BloodType, Record<BloodType, boolean>> {
  switch (productType) {
    case 'Plasma':
    case 'Cryoprécipité':
      return PLASMA_COMPATIBILITY
    case 'Plaquettes':
      return PLATELET_COMPATIBILITY
    case 'Sang total':
    case 'CGR':
    default:
      return RBC_COMPATIBILITY
  }
}

/**
 * Check if a specific donor-recipient pair is compatible for a product type.
 */
export function isCompatible(
  recipientBloodType: BloodType,
  donorBloodType: BloodType,
  productType: ProductType,
): boolean {
  const matrix = getCompatibilityMatrix(productType)
  return matrix[recipientBloodType]?.[donorBloodType] ?? false
}

/**
 * Get all compatible donor blood types for a given recipient and product type.
 */
export function getCompatibleDonors(
  recipientBloodType: BloodType,
  productType: ProductType,
): BloodType[] {
  const matrix = getCompatibilityMatrix(productType)
  return BLOOD_TYPES.filter(bt => matrix[recipientBloodType]?.[bt] === true)
}

/* ══════════════════════════════════════════════════════════════
   4. UTILITY FUNCTIONS
   ══════════════════════════════════════════════════════════════ */

const MIN_DONATION_INTERVAL_DAYS = 56 // 8 weeks

/**
 * Check donor eligibility based on last donation date and serology.
 */
export function checkDonorEligibility(donor: Donor): { eligible: boolean; reason?: string } {
  // Check minimum interval since last donation
  if (donor.lastDonationDate) {
    const lastDate = new Date(donor.lastDonationDate)
    const now = new Date()
    const daysSince = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
    if (daysSince < MIN_DONATION_INTERVAL_DAYS) {
      const remainingDays = MIN_DONATION_INTERVAL_DAYS - daysSince
      return {
        eligible: false,
        reason: `Délai minimum non respect : ${remainingDays} jour(s) restant(s) avant la prochaine donation (8 semaines entre chaque don)`,
      }
    }
  }

  // Check latest serology
  if (donor.serologyHistory.length > 0) {
    const latest = donor.serologyHistory[donor.serologyHistory.length - 1]
    if (!latest.isEligible) {
      const positiveTests = (Object.entries(latest.results) as [SerologyTest, SerologyResult][])
        .filter(([, result]) => result === 'Positif')
        .map(([test]) => test)
      return {
        eligible: false,
        reason: `Sérologie positive : ${positiveTests.join(', ')}`,
      }
    }
  }

  // Check age range (18-65)
  const age = Math.floor(
    (Date.now() - new Date(donor.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25),
  )
  if (age < 18) {
    return { eligible: false, reason: 'Âge minimum non atteint (18 ans)' }
  }
  if (age > 65) {
    return { eligible: false, reason: 'Âge maximum dépassé (65 ans)' }
  }

  // Check weight
  if (donor.weightKg < 50) {
    return { eligible: false, reason: `Poids insuffisant : ${donor.weightKg} kg (minimum 50 kg)` }
  }

  return { eligible: true }
}

/**
 * Calculate expiry date for a product based on collection date and product type.
 */
export function calculateExpiryDate(collectionDate: string, productType: ProductType): string {
  const collection = new Date(collectionDate)
  const shelfLife = PRODUCT_SHELF_LIFE_DAYS[productType]
  collection.setDate(collection.getDate() + shelfLife)
  return collection.toISOString().split('T')[0]
}

/**
 * Check if a product is approaching expiry (within threshold days).
 */
export function isApproachingExpiry(expiryDate: string, thresholdDays: number = 7): boolean {
  const expiry = new Date(expiryDate)
  const now = new Date()
  const daysUntilExpiry = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return daysUntilExpiry > 0 && daysUntilExpiry <= thresholdDays
}

/**
 * Check if a product is expired.
 */
export function isExpired(expiryDate: string): boolean {
  return new Date(expiryDate) < new Date()
}

/**
 * Get days until expiry.
 */
export function daysUntilExpiry(expiryDate: string): number {
  const expiry = new Date(expiryDate)
  const now = new Date()
  return Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

/* ─── Stock Alert Thresholds ─── */

export const LOW_STOCK_THRESHOLDS: Record<ProductType, Record<BloodType, number>> = {
  'Sang total': { 'A+': 5, 'A-': 2, 'B+': 4, 'B-': 2, 'O+': 8, 'O-': 4, 'AB+': 2, 'AB-': 1 },
  'CGR':        { 'A+': 6, 'A-': 3, 'B+': 5, 'B-': 2, 'O+': 10, 'O-': 5, 'AB+': 2, 'AB-': 1 },
  'Plasma':     { 'A+': 4, 'A-': 2, 'B+': 3, 'B-': 1, 'O+': 6, 'O-': 3, 'AB+': 2, 'AB-': 1 },
  'Plaquettes': { 'A+': 2, 'A-': 1, 'B+': 2, 'B-': 1, 'O+': 3, 'O-': 2, 'AB+': 1, 'AB-': 1 },
  'Cryoprécipité': { 'A+': 2, 'A-': 1, 'B+': 2, 'B-': 1, 'O+': 3, 'O-': 1, 'AB+': 1, 'AB-': 1 },
}

/**
 * Generate low-stock alerts for the blood bank inventory.
 */
export function generateLowStockAlerts(products: BloodProduct[]): BloodBankAlert[] {
  const alerts: BloodBankAlert[] = []

  for (const productType of PRODUCT_TYPES) {
    for (const bloodType of BLOOD_TYPES) {
      const available = products.filter(
        p => p.productType === productType && p.bloodType === bloodType && p.status === 'available',
      )
      const threshold = LOW_STOCK_THRESHOLDS[productType][bloodType]

      if (available.length <= threshold) {
        const severity: AlertSeverity = available.length === 0 ? 'critique' : available.length <= threshold / 2 ? 'urgent' : 'attention'
        alerts.push({
          id: `ALERT-STOCK-${productType}-${bloodType}-${Date.now()}`,
          type: 'stock_bas',
          severity,
          title: available.length === 0 ? `Stock épuisé : ${bloodType} ${productType}` : `Stock bas : ${bloodType} ${productType}`,
          message: available.length === 0
            ? `Aucune unité disponible de ${productType} (${bloodType}). Seuil critique atteint. Approvisionnement urgent nécessaire.`
            : `Seulement ${available.length} unité(s) disponible(s) de ${productType} (${bloodType}). Seuil minimum : ${threshold} unités.`,
          bloodType,
          productType,
          createdAt: new Date().toISOString(),
          isRead: false,
          isResolved: false,
        })
      }
    }
  }

  return alerts
}

/**
 * Generate expiry-approaching alerts.
 */
export function generateExpiryAlerts(products: BloodProduct[], daysThreshold: number = 7): BloodBankAlert[] {
  const alerts: BloodBankAlert[] = []

  for (const product of products) {
    if (product.status !== 'available') continue

    const daysLeft = daysUntilExpiry(product.expiryDate)
    if (daysLeft > 0 && daysLeft <= daysThreshold) {
      const severity: AlertSeverity = daysLeft <= 1 ? 'critique' : daysLeft <= 3 ? 'urgent' : 'attention'
      alerts.push({
        id: `ALERT-EXP-${product.id}`,
        type: 'expiration_proche',
        severity,
        title: `Expiration imminente : ${product.productCode}`,
        message: `Le produit ${product.productCode} (${product.productType} ${product.bloodType}, ${product.volumeMl} mL) expire dans ${daysLeft} jour(s). Date d'expiration : ${product.expiryDate}.`,
        bloodType: product.bloodType,
        productType: product.productType,
        productId: product.id,
        createdAt: new Date().toISOString(),
        isRead: false,
        isResolved: false,
      })
    }
  }

  return alerts
}

/**
 * Generate eligible donor recall alerts.
 */
export function generateDonorRecallAlerts(donors: Donor[], targetBloodType?: BloodType): BloodBankAlert[] {
  const alerts: BloodBankAlert[] = []

  const eligibleDonors = donors.filter(d => {
    if (!d.isEligible) return false
    if (targetBloodType && d.bloodType !== targetBloodType) return false
    return true
  })

  // Group eligible donors by blood type
  const byType: Partial<Record<BloodType, Donor[]>> = {}
  for (const donor of eligibleDonors) {
    if (!byType[donor.bloodType]) byType[donor.bloodType] = []
    byType[donor.bloodType]!.push(donor)
  }

  for (const [bt, typeDonors] of Object.entries(byType) as [BloodType, Donor[]][]) {
    if (typeDonors.length > 0) {
      alerts.push({
        id: `ALERT-DONOR-${bt}-${Date.now()}`,
        type: 'donneur_eligible',
        severity: 'info',
        title: `Donneurs éligibles : ${bt}`,
        message: `${typeDonors.length} donneur(s) éligible(s) pour le groupe ${bt} disponible(s) pour rappel : ${typeDonors.slice(0, 3).map(d => `${d.firstName} ${d.lastName}`).join(', ')}${typeDonors.length > 3 ? ` et ${typeDonors.length - 3} autre(s)` : ''}.`,
        bloodType: bt,
        createdAt: new Date().toISOString(),
        isRead: false,
        isResolved: false,
      })
    }
  }

  return alerts
}

/**
 * Generate all active alerts for the blood bank.
 */
export function generateAllAlerts(products: BloodProduct[], donors: Donor[]): BloodBankAlert[] {
  return [
    ...generateLowStockAlerts(products),
    ...generateExpiryAlerts(products),
    ...generateDonorRecallAlerts(donors),
  ].sort((a, b) => {
    const severityOrder: Record<AlertSeverity, number> = { critique: 0, urgent: 1, attention: 2, info: 3 }
    return severityOrder[a.severity] - severityOrder[b.severity]
  })
}

/**
 * Compute stock summary by blood type.
 */
export function computeStockSummary(products: BloodProduct[]): BloodStockSummary[] {
  return BLOOD_TYPES.map(bloodType => {
    const typeProducts = products.filter(p => p.bloodType === bloodType)
    const available = typeProducts.filter(p => p.status === 'available')
    const reserved = typeProducts.filter(p => p.status === 'reserved')

    const byProduct: Record<ProductType, { total: number; available: number }> = {} as Record<ProductType, { total: number; available: number }>
    for (const pt of PRODUCT_TYPES) {
      const ptProducts = typeProducts.filter(p => p.productType === pt)
      byProduct[pt] = {
        total: ptProducts.length,
        available: ptProducts.filter(p => p.status === 'available').length,
      }
    }

    // Critical if any product type for this blood type is at or below threshold
    let criticalLevel = false
    for (const pt of PRODUCT_TYPES) {
      if (byProduct[pt].available <= LOW_STOCK_THRESHOLDS[pt][bloodType]) {
        criticalLevel = true
        break
      }
    }

    return {
      bloodType,
      totalUnits: typeProducts.length,
      availableUnits: available.length,
      reservedUnits: reserved.length,
      byProduct,
      criticalLevel,
    }
  })
}

/**
 * Get full bank overview.
 */
export function getBloodBankOverview(products: BloodProduct[], donors: Donor[], transfusions: TransfusionRecord[]): BloodBankOverview {
  const stockByType = computeStockSummary(products)

  return {
    totalProducts: products.length,
    availableProducts: products.filter(p => p.status === 'available').length,
    reservedProducts: products.filter(p => p.status === 'reserved').length,
    expiredProducts: products.filter(p => p.status === 'expired').length,
    transfusedProducts: products.filter(p => p.status === 'transfused').length,
    discardedProducts: products.filter(p => p.status === 'discarded').length,
    totalDonors: donors.length,
    eligibleDonors: donors.filter(d => d.isEligible).length,
    stockByType,
    recentTransfusions: transfusions.slice(0, 10),
    activeAlerts: generateAllAlerts(products, donors),
  }
}

/* ══════════════════════════════════════════════════════════════
   5. DEMO DATA — CHU Donka, Conakry
   ══════════════════════════════════════════════════════════════ */

const DONKA_LOCATIONS = ['Réfrigérateur A1', 'Réfrigérateur A2', 'Réfrigérateur B1', 'Congélateur C1', 'Congélateur C2', 'Agitateur P1']
const GUINEAN_PREFECTURES = ['Conakry', 'Kindia', 'Boké', 'Labé', 'Kankan', 'Nzérékoré', 'Faranah', 'Mamou', 'Dubréka', 'Coyah']

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomDate(daysAgoMin: number, daysAgoMax: number): string {
  const daysAgo = daysAgoMin + Math.floor(Math.random() * (daysAgoMax - daysAgoMin))
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().split('T')[0]
}

function generateProductCode(productType: ProductType, bloodType: BloodType, index: number): string {
  const prefix: Record<ProductType, string> = {
    'Sang total': 'ST',
    'Plasma': 'PL',
    'Plaquettes': 'PQ',
    'Cryoprécipité': 'CP',
    'CGR': 'CGR',
  }
  const rhSuffix = bloodType.endsWith('+') ? 'P' : 'N'
  const aboCode = bloodType.replace('+', '').replace('-', '')
  return `DK-${prefix[productType]}-${aboCode}${rhSuffix}-${String(index).padStart(4, '0')}`
}

function generateDonorCode(index: number): string {
  return `DNK-DON-${String(index).padStart(4, '0')}`
}

/* ─── Demo Serology Screens ─── */

function createSerologyScreen(
  donorId: string,
  testDate: string,
  isEligibleOverride?: boolean,
): SerologyScreen {
  const eligible = isEligibleOverride ?? (Math.random() > 0.12) // ~88% eligible
  const results: Record<SerologyTest, SerologyResult> = {
    VIH: eligible ? 'Négatif' : (Math.random() > 0.5 ? 'Positif' : 'Indéterminé'),
    HVB: eligible ? 'Négatif' : (Math.random() > 0.6 ? 'Positif' : 'Négatif'),
    HVC: eligible ? 'Négatif' : (Math.random() > 0.7 ? 'Positif' : 'Négatif'),
    Syphilis: eligible ? 'Négatif' : (Math.random() > 0.65 ? 'Positif' : 'Négatif'),
    Paludisme: eligible ? 'Négatif' : (Math.random() > 0.5 ? 'Positif' : 'Négatif'),
  }

  // If eligible override is true, ensure all negative
  if (isEligibleOverride === true) {
    for (const key of SEROLOGY_TESTS) {
      results[key] = 'Négatif'
    }
  }

  return {
    id: `SER-${donorId}-${testDate}`,
    donorId,
    testDate,
    results,
    laboratory: 'Laboratoire CHU Donka',
    technician: eligible ? 'Mme Diallo' : 'M. Camara',
    isEligible: eligible,
    notes: eligible ? undefined : 'Sérologie positive — donneur inéligible',
  }
}

/* ─── Demo Donors ─── */

export const DEMO_DONORS: Donor[] = (() => {
  const donorData: Array<{
    firstName: string
    lastName: string
    dob: string
    gender: 'M' | 'F'
    bloodType: BloodType
    phone: string
    prefecture: string
    quartier: string
    category: DonorCategory
    weight: number
    donationCount: number
    lastDonationDaysAgo: number | null
    eligible: boolean
  }> = [
    { firstName: 'Amadou', lastName: 'Diallo', dob: '1990-03-15', gender: 'M', bloodType: 'O+', phone: '+224 621 12 34 56', prefecture: 'Conakry', quartier: 'Kaloum', category: 'Volontaire', weight: 72, donationCount: 8, lastDonationDaysAgo: 65, eligible: true },
    { firstName: 'Mariama', lastName: 'Bangoura', dob: '1985-07-22', gender: 'F', bloodType: 'A+', phone: '+224 622 23 45 67', prefecture: 'Conakry', quartier: 'Matam', category: 'Volontaire', weight: 58, donationCount: 5, lastDonationDaysAgo: 90, eligible: true },
    { firstName: 'Ibrahima', lastName: 'Camara', dob: '1988-11-03', gender: 'M', bloodType: 'B+', phone: '+224 623 34 56 78', prefecture: 'Kindia', quartier: 'Centre', category: 'Familial', weight: 68, donationCount: 3, lastDonationDaysAgo: 45, eligible: true },
    { firstName: 'Fatoumata', lastName: 'Touré', dob: '1992-01-18', gender: 'F', bloodType: 'O-', phone: '+224 624 45 67 89', prefecture: 'Conakry', quartier: 'Ratoma', category: 'Volontaire', weight: 55, donationCount: 6, lastDonationDaysAgo: 120, eligible: true },
    { firstName: 'Mamadou', lastName: 'Condé', dob: '1979-09-30', gender: 'M', bloodType: 'AB+', phone: '+224 625 56 78 90', prefecture: 'Kankan', quartier: 'Banco', category: 'Familial', weight: 80, donationCount: 2, lastDonationDaysAgo: 30, eligible: true },
    { firstName: 'Aminata', lastName: 'Sow', dob: '1995-04-12', gender: 'F', bloodType: 'A-', phone: '+224 626 67 89 01', prefecture: 'Conakry', quartier: 'Dixinn', category: 'Volontaire', weight: 52, donationCount: 4, lastDonationDaysAgo: 200, eligible: true },
    { firstName: 'Ousmane', lastName: 'Bah', dob: '1983-06-25', gender: 'M', bloodType: 'B-', phone: '+224 627 78 90 12', prefecture: 'Labé', quartier: 'Dalaba', category: 'Volontaire', weight: 74, donationCount: 7, lastDonationDaysAgo: 150, eligible: true },
    { firstName: 'Kadiatou', lastName: 'Sylla', dob: '1991-12-08', gender: 'F', bloodType: 'O+', phone: '+224 628 89 01 23', prefecture: 'Conakry', quartier: 'Matoto', category: 'Autologue', weight: 60, donationCount: 1, lastDonationDaysAgo: 14, eligible: false },
    { firstName: 'Lamine', lastName: 'Dioubaté', dob: '1987-02-14', gender: 'M', bloodType: 'A+', phone: '+224 629 90 12 34', prefecture: 'Nzérékoré', quartier: 'Gbakédou', category: 'Familial', weight: 70, donationCount: 3, lastDonationDaysAgo: 80, eligible: true },
    { firstName: 'Bintou', lastName: 'Kaba', dob: '1993-08-19', gender: 'F', bloodType: 'AB-', phone: '+224 620 01 23 45', prefecture: 'Conakry', quartier: 'Kaloum', category: 'Volontaire', weight: 56, donationCount: 2, lastDonationDaysAgo: 250, eligible: true },
    { firstName: 'Abdoulaye', lastName: 'Fofana', dob: '1980-05-07', gender: 'M', bloodType: 'O+', phone: '+224 621 11 22 33', prefecture: 'Mamou', quartier: 'Centre', category: 'Volontaire', weight: 76, donationCount: 10, lastDonationDaysAgo: 70, eligible: true },
    { firstName: 'Djenabou', lastName: 'Doubouya', dob: '1989-10-28', gender: 'F', bloodType: 'B+', phone: '+224 622 22 33 44', prefecture: 'Conakry', quartier: 'Ratoma', category: 'Familial', weight: 63, donationCount: 1, lastDonationDaysAgo: 40, eligible: true },
    { firstName: 'Moussa', lastName: 'Keita', dob: '1986-03-21', gender: 'M', bloodType: 'A+', phone: '+224 623 33 44 55', prefecture: 'Boké', quartier: 'Kamsar', category: 'Volontaire', weight: 82, donationCount: 5, lastDonationDaysAgo: 110, eligible: true },
    { firstName: 'Aïssatou', lastName: 'Balde', dob: '1994-07-05', gender: 'F', bloodType: 'O-', phone: '+224 624 44 55 66', prefecture: 'Conakry', quartier: 'Matam', category: 'Volontaire', weight: 54, donationCount: 3, lastDonationDaysAgo: 300, eligible: true },
    { firstName: 'Thierno', lastName: 'Diao', dob: '1977-11-16', gender: 'M', bloodType: 'AB+', phone: '+224 625 55 66 77', prefecture: 'Faranah', quartier: 'Dabola', category: 'Familial', weight: 65, donationCount: 2, lastDonationDaysAgo: 20, eligible: true },
    { firstName: 'Hawa', lastName: 'Sano', dob: '1996-09-09', gender: 'F', bloodType: 'B-', phone: '+224 626 66 77 88', prefecture: 'Conakry', quartier: 'Dixinn', category: 'Autologue', weight: 50, donationCount: 1, lastDonationDaysAgo: 5, eligible: false },
    { firstName: 'Seydou', lastName: 'Traoré', dob: '1982-01-30', gender: 'M', bloodType: 'A-', phone: '+224 627 77 88 99', prefecture: 'Kankan', quartier: 'Mandiana', category: 'Volontaire', weight: 71, donationCount: 4, lastDonationDaysAgo: 180, eligible: true },
  ]

  return donorData.map((data, index) => {
    const donorId = `DONOR-${String(index + 1).padStart(3, '0')}`
    const donorCode = generateDonorCode(index + 1)
    const registrationDate = randomDate(365, 30)
    const lastDonationDate = data.lastDonationDaysAgo
      ? new Date(Date.now() - data.lastDonationDaysAgo * 86400000).toISOString().split('T')[0]
      : undefined

    // Generate serology history
    const serologyHistory: SerologyScreen[] = []
    const serologyDate = lastDonationDate || registrationDate
    serologyHistory.push(createSerologyScreen(donorId, serologyDate, data.eligible))

    // Generate donation history
    const donationHistory: DonationRecord[] = []
    for (let i = 0; i < Math.min(data.donationCount, 4); i++) {
      const donationDate = new Date(Date.now() - (data.lastDonationDaysAgo ?? 90 + i * 60) * 86400000 - i * 56 * 86400000)
      const productType: ProductType = i === 0 ? 'Sang total' : randomItem(PRODUCT_TYPES)
      const vol = PRODUCT_DEFAULT_VOLUMES[productType]
      donationHistory.push({
        id: `DON-${donorId}-${i + 1}`,
        donorId,
        donationDate: donationDate.toISOString().split('T')[0],
        productType,
        volumeMl: vol,
        productId: `PROD-DON-${donorId}-${i + 1}`,
        serologyScreenId: serologyHistory[0].id,
        site: 'Centre de transfusion CHU Donka',
        staffName: randomItem(['Dr. Diallo', 'Infirmière Bangoura', 'Dr. Camara', 'Infirmier Sylla']),
      })
    }

    // Re-check eligibility
    const eligibilityCheck = data.eligible
      ? checkDonorEligibility({
          ...data,
          id: donorId,
          donorCode,
          rhFactor: data.bloodType.endsWith('+') ? '+' : '-',
          address: `${data.quartier}, ${data.prefecture}`,
          donationHistory,
          serologyHistory,
          lastDonationDate,
          isEligible: data.eligible,
          totalDonations: data.donationCount,
          registeredAt: registrationDate,
          updatedAt: new Date().toISOString(),
        })
      : { eligible: false, reason: 'Don récent — délai minimum non respecté' }

    return {
      id: donorId,
      donorCode,
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dob,
      gender: data.gender,
      bloodType: data.bloodType,
      rhFactor: data.bloodType.endsWith('+') ? '+' : '-',
      phone: data.phone,
      address: `${data.quartier}, ${data.prefecture}`,
      prefecture: data.prefecture,
      quartier: data.quartier,
      category: data.category,
      weightKg: data.weight,
      donationHistory,
      serologyHistory,
      lastDonationDate,
      isEligible: eligibilityCheck.eligible,
      ineligibilityReason: eligibilityCheck.reason,
      totalDonations: data.donationCount,
      registeredAt: registrationDate,
      updatedAt: new Date().toISOString(),
    }
  })
})()

/* ─── Demo Blood Products ─── */

export const DEMO_BLOOD_PRODUCTS: BloodProduct[] = (() => {
  const products: BloodProduct[] = []
  let productIndex = 1

  // Stock distribution per type — realistic for Guinea where O+ is ~45% and B+ ~20%
  const stockDistribution: Array<{ bloodType: BloodType; productType: ProductType; count: number; status: BloodProductStatus }> = [
    // O+ — most common in Guinea
    { bloodType: 'O+', productType: 'Sang total', count: 8, status: 'available' },
    { bloodType: 'O+', productType: 'CGR', count: 10, status: 'available' },
    { bloodType: 'O+', productType: 'Plasma', count: 5, status: 'available' },
    { bloodType: 'O+', productType: 'Plaquettes', count: 3, status: 'available' },
    { bloodType: 'O+', productType: 'CGR', count: 2, status: 'reserved' },
    { bloodType: 'O+', productType: 'Sang total', count: 1, status: 'expired' },

    // A+ — second most common
    { bloodType: 'A+', productType: 'Sang total', count: 6, status: 'available' },
    { bloodType: 'A+', productType: 'CGR', count: 7, status: 'available' },
    { bloodType: 'A+', productType: 'Plasma', count: 4, status: 'available' },
    { bloodType: 'A+', productType: 'Plaquettes', count: 2, status: 'available' },
    { bloodType: 'A+', productType: 'CGR', count: 1, status: 'reserved' },

    // B+
    { bloodType: 'B+', productType: 'Sang total', count: 5, status: 'available' },
    { bloodType: 'B+', productType: 'CGR', count: 6, status: 'available' },
    { bloodType: 'B+', productType: 'Plasma', count: 3, status: 'available' },
    { bloodType: 'B+', productType: 'Plaquettes', count: 2, status: 'available' },
    { bloodType: 'B+', productType: 'CGR', count: 1, status: 'transfused' },

    // O- — universal donor, always in demand
    { bloodType: 'O-', productType: 'Sang total', count: 3, status: 'available' },
    { bloodType: 'O-', productType: 'CGR', count: 4, status: 'available' },
    { bloodType: 'O-', productType: 'Plasma', count: 2, status: 'available' },
    { bloodType: 'O-', productType: 'Sang total', count: 1, status: 'reserved' },

    // AB+ — universal plasma donor
    { bloodType: 'AB+', productType: 'Plasma', count: 4, status: 'available' },
    { bloodType: 'AB+', productType: 'Sang total', count: 2, status: 'available' },
    { bloodType: 'AB+', productType: 'CGR', count: 2, status: 'available' },

    // A- — relatively rare
    { bloodType: 'A-', productType: 'Sang total', count: 2, status: 'available' },
    { bloodType: 'A-', productType: 'CGR', count: 3, status: 'available' },
    { bloodType: 'A-', productType: 'Plasma', count: 1, status: 'available' },

    // B- — rare
    { bloodType: 'B-', productType: 'Sang total', count: 2, status: 'available' },
    { bloodType: 'B-', productType: 'CGR', count: 2, status: 'available' },

    // AB- — very rare
    { bloodType: 'AB-', productType: 'Plasma', count: 2, status: 'available' },
    { bloodType: 'AB-', productType: 'CGR', count: 1, status: 'available' },

    // Cryoprécipité across types
    { bloodType: 'O+', productType: 'Cryoprécipité', count: 3, status: 'available' },
    { bloodType: 'A+', productType: 'Cryoprécipité', count: 2, status: 'available' },
    { bloodType: 'B+', productType: 'Cryoprécipité', count: 1, status: 'available' },

    // Some discarded
    { bloodType: 'B+', productType: 'Sang total', count: 1, status: 'discarded' },
    { bloodType: 'A-', productType: 'Plaquettes', count: 1, status: 'expired' },
  ]

  for (const entry of stockDistribution) {
    for (let i = 0; i < entry.count; i++) {
      const collectionDate = randomDate(1, PRODUCT_SHELF_LIFE_DAYS[entry.productType] - 1)
      const expiryDate = calculateExpiryDate(collectionDate, entry.productType)

      const donorIndex = Math.floor(Math.random() * DEMO_DONORS.length)
      const donor = DEMO_DONORS[donorIndex]

      const storageLocation = entry.productType === 'Plasma' || entry.productType === 'Cryoprécipité'
        ? randomItem(['Congélateur C1', 'Congélateur C2'])
        : entry.productType === 'Plaquettes'
          ? 'Agitateur P1'
          : randomItem(['Réfrigérateur A1', 'Réfrigérateur A2', 'Réfrigérateur B1'])

      const productId = `PROD-${String(productIndex).padStart(4, '0')}`
      const productCode = generateProductCode(entry.productType, entry.bloodType, productIndex)

      // Temperature readings
      const tempRange = PRODUCT_STORAGE_TEMPS[entry.productType]
      const tempReadings: TemperatureReading[] = []
      for (let t = 0; t < 3; t++) {
        const readingDate = new Date(collectionDate)
        readingDate.setDate(readingDate.getDate() + t)
        const temp = tempRange.min + Math.random() * (tempRange.max - tempRange.min)
        tempReadings.push({
          id: `TEMP-${productId}-${t}`,
          productId,
          timestamp: readingDate.toISOString(),
          temperature: Math.round(temp * 10) / 10,
          unit: tempRange.unit,
          isWithinRange: temp >= tempRange.min && temp <= tempRange.max,
          recordedBy: 'Technicien Bangoura',
        })
      }

      let reservedForPatientId: string | undefined
      let reservedForPatientName: string | undefined
      let transfusedDate: string | undefined
      let transfusedToPatientId: string | undefined
      let transfusedToPatientName: string | undefined
      let discardedReason: string | undefined

      if (entry.status === 'reserved') {
        reservedForPatientId = `PAT-${String(Math.floor(Math.random() * 900) + 100).padStart(4, '0')}`
        reservedForPatientName = randomItem(['Mme Camara', 'M. Touré', 'Enfant Sylla', 'Mme Diallo'])
      } else if (entry.status === 'transfused') {
        transfusedDate = randomDate(14, 1)
        transfusedToPatientId = `PAT-${String(Math.floor(Math.random() * 900) + 100).padStart(4, '0')}`
        transfusedToPatientName = randomItem(['M. Condé', 'Mme Bah', 'Enfant Fofana'])
      } else if (entry.status === 'discarded') {
        discardedReason = randomItem(['Hémolyse détectée', 'Rupture de chaîne du froid', 'Sérologie positive post-donation'])
      }

      products.push({
        id: productId,
        productCode,
        bloodType: entry.bloodType,
        productType: entry.productType,
        volumeMl: PRODUCT_DEFAULT_VOLUMES[entry.productType],
        collectionDate,
        expiryDate,
        storageLocation,
        temperatureReadings: tempReadings,
        status: entry.status,
        donorId: donor.id,
        reservedForPatientId,
        reservedForPatientName,
        transfusedDate,
        transfusedToPatientId,
        transfusedToPatientName,
        discardedReason,
        notes: entry.status === 'expired' ? 'Produit périmé — à éliminer selon protocole' : undefined,
        createdBy: 'Dr. Keita',
        createdAt: collectionDate,
        updatedAt: new Date().toISOString(),
      })

      productIndex++
    }
  }

  return products
})()

/* ─── Demo Cross-Match Tests ─── */

export const DEMO_CROSS_MATCH_TESTS: CrossMatchTest[] = [
  {
    id: 'XM-001',
    patientId: 'PAT-0234',
    patientName: 'Fatoumata Diallo',
    patientBloodType: 'O+',
    productId: 'PROD-0001',
    productBloodType: 'O+',
    productType: 'CGR',
    testDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    result: 'Compatible',
    technique: 'Gel',
    performedBy: 'Lab. Camara',
    validatedBy: 'Dr. Keita',
  },
  {
    id: 'XM-002',
    patientId: 'PAT-0312',
    patientName: 'Moussa Condé',
    patientBloodType: 'A+',
    productId: 'PROD-0015',
    productBloodType: 'A+',
    productType: 'Sang total',
    testDate: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
    result: 'Compatible',
    technique: 'Carte',
    performedBy: 'Lab. Bangoura',
    validatedBy: 'Dr. Sylla',
  },
  {
    id: 'XM-003',
    patientId: 'PAT-0178',
    patientName: 'Aminata Bah',
    patientBloodType: 'B-',
    productId: 'PROD-0040',
    productBloodType: 'O-',
    productType: 'CGR',
    testDate: new Date().toISOString().split('T')[0],
    result: 'Compatible',
    technique: 'Gel',
    performedBy: 'Lab. Camara',
    validatedBy: 'Dr. Keita',
  },
  {
    id: 'XM-004',
    patientId: 'PAT-0456',
    patientName: 'Ibrahima Touré',
    patientBloodType: 'AB+',
    productId: 'PROD-0025',
    productBloodType: 'A+',
    productType: 'Plasma',
    testDate: new Date().toISOString().split('T')[0],
    result: 'Compatible',
    technique: 'Tube',
    performedBy: 'Lab. Bangoura',
  },
  {
    id: 'XM-005',
    patientId: 'PAT-0523',
    patientName: 'Kadiatou Sylla',
    patientBloodType: 'O-',
    productId: 'PROD-0030',
    productBloodType: 'A-',
    productType: 'CGR',
    testDate: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    result: 'Incompatible',
    technique: 'Gel',
    performedBy: 'Lab. Camara',
    validatedBy: 'Dr. Keita',
    notes: 'Incompatibilité ABO majeure. Rechercher CGR O- compatible.',
  },
  {
    id: 'XM-006',
    patientId: 'PAT-0601',
    patientName: 'Lamine Dioubaté',
    patientBloodType: 'A+',
    productId: 'PROD-0012',
    productBloodType: 'A+',
    productType: 'Plaquettes',
    testDate: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    result: 'Mineur incompatibilité',
    technique: 'Carte',
    performedBy: 'Lab. Bangoura',
    validatedBy: 'Dr. Sylla',
    notes: 'Incompatibilité mineure Kell. Transfusion possible sous surveillance renforcée.',
  },
]

/* ─── Demo Transfusion Records ─── */

export const DEMO_TRANSFUSION_RECORDS: TransfusionRecord[] = [
  {
    id: 'TRANS-001',
    patientId: 'PAT-0234',
    patientName: 'Fatoumata Diallo',
    patientBloodType: 'O+',
    productId: 'PROD-0001',
    productCode: 'DK-CGR-O+P-0001',
    productBloodType: 'O+',
    productType: 'CGR',
    volumeMl: 300,
    crossMatchId: 'XM-001',
    startDate: new Date(Date.now() - 2 * 86400000).toISOString(),
    endDate: new Date(Date.now() - 2 * 86400000 + 3 * 3600000).toISOString(),
    prescribedBy: 'Dr. Camara',
    administeredBy: 'Infirmière Bangoura',
    service: 'Chirurgie',
    reactions: [],
    traceability: {
      donorId: 'DONOR-001',
      donorCode: 'DNK-DON-0001',
      productId: 'PROD-0001',
      productCode: 'DK-CGR-O+P-0001',
      collectionDate: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
      serologyScreenId: 'SER-DONOR-001',
      serologyClear: true,
      crossMatchId: 'XM-001',
      crossMatchCompatible: true,
      transfusionId: 'TRANS-001',
      patientId: 'PAT-0234',
      patientName: 'Fatoumata Diallo',
    },
    status: 'Terminée',
  },
  {
    id: 'TRANS-002',
    patientId: 'PAT-0312',
    patientName: 'Moussa Condé',
    patientBloodType: 'A+',
    productId: 'PROD-0015',
    productCode: 'DK-ST-A+P-0015',
    productBloodType: 'A+',
    productType: 'Sang total',
    volumeMl: 450,
    crossMatchId: 'XM-002',
    startDate: new Date(Date.now() - 1 * 86400000).toISOString(),
    endDate: new Date(Date.now() - 1 * 86400000 + 4 * 3600000).toISOString(),
    prescribedBy: 'Dr. Sylla',
    administeredBy: 'Infirmier Keita',
    service: 'Médecine interne',
    reactions: [
      {
        id: 'RXN-001',
        transfusionId: 'TRANS-002',
        reactionType: 'Réaction fébrile non hémolytique',
        severity: 'Légère',
        onsetMinutes: 45,
        symptoms: ['Fièvre 38.2°C', 'Frissons'],
        management: 'Ralentissement du débit, paracétamol 1g IV',
        outcome: 'Résolution complète en 30 minutes',
        reportedBy: 'Infirmier Keita',
        reportedAt: new Date(Date.now() - 1 * 86400000 + 2 * 3600000).toISOString(),
      },
    ],
    traceability: {
      donorId: 'DONOR-002',
      donorCode: 'DNK-DON-0002',
      productId: 'PROD-0015',
      productCode: 'DK-ST-A+P-0015',
      collectionDate: new Date(Date.now() - 15 * 86400000).toISOString().split('T')[0],
      serologyScreenId: 'SER-DONOR-002',
      serologyClear: true,
      crossMatchId: 'XM-002',
      crossMatchCompatible: true,
      transfusionId: 'TRANS-002',
      patientId: 'PAT-0312',
      patientName: 'Moussa Condé',
    },
    status: 'Terminée',
    notes: 'Transfusion réalisée suite à anémie sévère (Hb 5.8 g/dL). Réaction fébrile mineure, résolutive.',
  },
  {
    id: 'TRANS-003',
    patientId: 'PAT-0601',
    patientName: 'Lamine Dioubaté',
    patientBloodType: 'A+',
    productId: 'PROD-0012',
    productCode: 'DK-PQ-A+P-0012',
    productBloodType: 'A+',
    productType: 'Plaquettes',
    volumeMl: 50,
    crossMatchId: 'XM-006',
    startDate: new Date(Date.now() - 5 * 86400000).toISOString(),
    endDate: new Date(Date.now() - 5 * 86400000 + 1 * 3600000).toISOString(),
    prescribedBy: 'Dr. Diallo',
    administeredBy: 'Infirmière Camara',
    service: 'Oncologie',
    reactions: [],
    traceability: {
      donorId: 'DONOR-009',
      donorCode: 'DNK-DON-0009',
      productId: 'PROD-0012',
      productCode: 'DK-PQ-A+P-0012',
      collectionDate: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0],
      serologyScreenId: 'SER-DONOR-009',
      serologyClear: true,
      crossMatchId: 'XM-006',
      crossMatchCompatible: true,
      transfusionId: 'TRANS-003',
      patientId: 'PAT-0601',
      patientName: 'Lamine Dioubaté',
    },
    status: 'Terminée',
    notes: 'Concentré plaquettaire pour thrombopénie post-chimiothérapie. Incompatibilité Kell mineure — surveillance renforcée sans incident.',
  },
  {
    id: 'TRANS-004',
    patientId: 'PAT-0178',
    patientName: 'Aminata Bah',
    patientBloodType: 'B-',
    productId: 'PROD-0040',
    productCode: 'DK-CGR-O-N-0040',
    productBloodType: 'O-',
    productType: 'CGR',
    volumeMl: 300,
    crossMatchId: 'XM-003',
    startDate: new Date().toISOString(),
    prescribedBy: 'Dr. Keita',
    administeredBy: 'Infirmière Bangoura',
    service: 'Maternité',
    reactions: [],
    traceability: {
      donorId: 'DONOR-004',
      donorCode: 'DNK-DON-0004',
      productId: 'PROD-0040',
      productCode: 'DK-CGR-O-N-0040',
      collectionDate: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
      serologyScreenId: 'SER-DONOR-004',
      serologyClear: true,
      crossMatchId: 'XM-003',
      crossMatchCompatible: true,
      transfusionId: 'TRANS-004',
      patientId: 'PAT-0178',
      patientName: 'Aminata Bah',
    },
    status: 'En cours',
    notes: 'Hémorragie du post-partum. Transfusion urgente CGR O- (compatible universel).',
  },
]

/* ─── Pre-computed Alerts ─── */

export const DEMO_ALERTS: BloodBankAlert[] = generateAllAlerts(DEMO_BLOOD_PRODUCTS, DEMO_DONORS)

/* ─── Pre-computed Overview ─── */

export const DEMO_OVERVIEW: BloodBankOverview = getBloodBankOverview(
  DEMO_BLOOD_PRODUCTS,
  DEMO_DONORS,
  DEMO_TRANSFUSION_RECORDS,
)
