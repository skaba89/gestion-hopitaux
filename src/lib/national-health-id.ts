// HealthFlow Africa - National Health ID (INS - Identité Nationale de Santé)
// Guinea national health identifier system with verification, card management

/* ─────────── INS Types ─────────── */

export type INSStatus = 'active' | 'suspended' | 'expired' | 'revoked' | 'pending'
export type INSVerificationMethod = 'biometric' | 'document' | 'phone-otp' | 'in-person' | 'asc-vouch'
export type INSVerificationStatus = 'verified' | 'pending' | 'failed' | 'expired'

export interface NationalHealthID {
  id: string
  healthId: string // Format: GN-YYYY-MMDD-XX (XX = initials)
  nationalId: string // Numéro d'identité nationale
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: 'M' | 'F'
  birthPlace: string
  phone: string
  address: string
  healthZone: string
  photoUrl: string | null
  biometricHash: string | null
  status: INSStatus
  issuedAt: string
  issuedBy: string
  expiresAt: string
  lastVerifiedAt: string
  verificationMethod: INSVerificationMethod
  verificationStatus: INSVerificationStatus
  verificationAttempts: number
  linkedSANTEPCard: string | null
  linkedFacilities: {
    facilityId: string
    facilityName: string
    localPatientId: string
    linkedAt: string
  }[]
  auditTrail: {
    action: string
    performedBy: string
    performedAt: string
    details: string
  }[]
}

export interface INSVerificationRequest {
  id: string
  healthId: string
  method: INSVerificationMethod
  requestedBy: string
  requestedAt: string
  status: INSVerificationStatus
  result: {
    matched: boolean
    confidence: number
    matchedFields: string[]
    mismatches: string[]
  } | null
  completedAt: string | null
}

export interface INSStatistics {
  totalIssued: number
  activeIDs: number
  pendingVerifications: number
  verificationSuccessRate: number
  byHealthZone: Record<string, number>
  byVerificationMethod: Record<INSVerificationMethod, number>
  recentIssuances: number
  averageLinkageTime: string
}

/* ─────────── INS ID Generator ─────────── */

export function generateHealthId(dateOfBirth: string, firstName: string, lastName: string): string {
  const year = dateOfBirth.split('-')[0]
  const mmdd = dateOfBirth.split('-').slice(1).join('')
  const initials = `${firstName[0]}${lastName[0]}`.toUpperCase()
  return `GN-${year}-${mmdd}-${initials}`
}

export function validateHealthIdFormat(healthId: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  const pattern = /^GN-\d{4}-\d{4}-[A-Z]{2}$/

  if (!pattern.test(healthId)) {
    errors.push('Format invalide. Attendu: GN-YYYY-MMDD-XX')
  }

  if (healthId.length !== 15) {
    errors.push(`Longueur incorrecte: ${healthId.length}/15 caractères`)
  }

  return { valid: errors.length === 0, errors }
}

/* ─────────── INS Service ─────────── */

class INSService {
  private records: NationalHealthID[] = []
  private verificationRequests: INSVerificationRequest[] = []

  constructor() {
    this.initializeDemoData()
  }

  private initializeDemoData() {
    this.records = [
      {
        id: 'INS-001',
        healthId: 'GN-1998-0315-FD',
        nationalId: 'GN-1998-0315-FD',
        firstName: 'Aminata',
        lastName: 'Diallo',
        dateOfBirth: '1998-03-15',
        gender: 'F',
        birthPlace: 'Conakry',
        phone: '+224 622 11 22 33',
        address: 'Conakry, Kaloum',
        healthZone: 'conakry',
        photoUrl: null,
        biometricHash: 'SHA256:a1b2c3d4e5f6...',
        status: 'active',
        issuedAt: '2024-01-15',
        issuedBy: 'Direction Nationale de la Santé',
        expiresAt: '2034-01-15',
        lastVerifiedAt: '2026-05-10',
        verificationMethod: 'biometric',
        verificationStatus: 'verified',
        verificationAttempts: 1,
        linkedSANTEPCard: 'SANTEP-2024-0001',
        linkedFacilities: [
          { facilityId: 'donka', facilityName: 'Hôpital National Donka', localPatientId: 'P-2024-001', linkedAt: '2024-01-15' },
          { facilityId: 'cs-dixinn', facilityName: 'Centre de santé Dixinn', localPatientId: 'CS-DIX-456', linkedAt: '2026-01-15' },
        ],
        auditTrail: [
          { action: 'INS_ISSUED', performedBy: 'DNS Guinea', performedAt: '2024-01-15T10:00:00Z', details: 'Identité Nationale de Santé émise via vérification biométrique' },
          { action: 'INS_VERIFIED', performedBy: 'Dr. Diallo', performedAt: '2026-05-10T08:00:00Z', details: 'Vérification lors admission Donka' },
        ],
      },
      {
        id: 'INS-002',
        healthId: 'GN-1980-0722-MC',
        nationalId: 'GN-1980-0722-MC',
        firstName: 'Mamadou',
        lastName: 'Condé',
        dateOfBirth: '1980-07-22',
        gender: 'M',
        birthPlace: 'Conakry',
        phone: '+224 623 44 55 66',
        address: 'Conakry, Dixinn',
        healthZone: 'conakry',
        photoUrl: null,
        biometricHash: null,
        status: 'active',
        issuedAt: '2024-02-20',
        issuedBy: 'Direction Nationale de la Santé',
        expiresAt: '2034-02-20',
        lastVerifiedAt: '2026-05-10',
        verificationMethod: 'document',
        verificationStatus: 'verified',
        verificationAttempts: 2,
        linkedSANTEPCard: 'SANTEP-2024-0002',
        linkedFacilities: [
          { facilityId: 'donka', facilityName: 'Hôpital National Donka', localPatientId: 'P-2024-002', linkedAt: '2024-02-20' },
        ],
        auditTrail: [
          { action: 'INS_ISSUED', performedBy: 'DNS Guinea', performedAt: '2024-02-20T14:00:00Z', details: 'INS émise sur présentation document d\'identité' },
          { action: 'INS_VERIFIED', performedBy: 'Dr. Diallo', performedAt: '2026-05-10T09:00:00Z', details: 'Vérification documentaire réussie' },
        ],
      },
      {
        id: 'INS-003',
        healthId: 'GN-1972-0805-OC',
        nationalId: 'GN-1972-0805-OC',
        firstName: 'Ousmane',
        lastName: 'Camara',
        dateOfBirth: '1972-08-05',
        gender: 'M',
        birthPlace: "N'Zérékoré",
        phone: '+224 621 55 66 77',
        address: "N'Zérékoré",
        healthZone: 'nzerekore',
        photoUrl: null,
        biometricHash: null,
        status: 'active',
        issuedAt: '2026-02-20',
        issuedBy: 'DNS Guinea — Antenne N\'Zérékoré',
        expiresAt: '2036-02-20',
        lastVerifiedAt: '2026-05-10',
        verificationMethod: 'phone-otp',
        verificationStatus: 'verified',
        verificationAttempts: 1,
        linkedSANTEPCard: null,
        linkedFacilities: [
          { facilityId: 'nzerekore-regional', facilityName: "Hôpital régional de N'Zérékoré", localPatientId: 'NZR-OC-042', linkedAt: '2026-02-20' },
          { facilityId: 'donka', facilityName: 'Hôpital National Donka', localPatientId: 'P-2024-010', linkedAt: '2026-05-10' },
        ],
        auditTrail: [
          { action: 'INS_ISSUED', performedBy: 'DNS Nzerekore', performedAt: '2026-02-20T10:00:00Z', details: 'INS émise suite AVC — vérification OTP' },
          { action: 'FACILITY_LINKED', performedBy: 'System', performedAt: '2026-05-10T22:30:00Z', details: 'Liaison automatique avec Donka suite admission urgence' },
        ],
      },
      {
        id: 'INS-004',
        healthId: 'GN-2000-0320-KS',
        nationalId: 'GN-2000-0320-KS',
        firstName: 'Sekou',
        lastName: 'Soumah',
        dateOfBirth: '2000-03-20',
        gender: 'M',
        birthPlace: 'Kindia',
        phone: '+224 624 11 22 33',
        address: 'Kindia',
        healthZone: 'kindia',
        photoUrl: null,
        biometricHash: null,
        status: 'pending',
        issuedAt: '2026-05-11',
        issuedBy: 'DNS Guinea — Antenne Kindia',
        expiresAt: '2036-05-11',
        lastVerifiedAt: '2026-05-11',
        verificationMethod: 'asc-vouch',
        verificationStatus: 'pending',
        verificationAttempts: 0,
        linkedSANTEPCard: null,
        linkedFacilities: [
          { facilityId: 'kindia-regional', facilityName: 'Hôpital régional de Kindia', localPatientId: 'P-KIN-2026-034', linkedAt: '2026-05-11' },
        ],
        auditTrail: [
          { action: 'INS_PENDING', performedBy: 'ASC Moussa', performedAt: '2026-05-11T06:00:00Z', details: 'INS en attente de vérification — garante ASC suite urgence' },
        ],
      },
    ]

    this.verificationRequests = [
      {
        id: 'VERIFY-001',
        healthId: 'GN-1998-0315-FD',
        method: 'biometric',
        requestedBy: 'Dr. Diallo — Hôpital Donka',
        requestedAt: '2026-05-10T08:00:00Z',
        status: 'verified',
        result: { matched: true, confidence: 99.5, matchedFields: ['firstName', 'lastName', 'dateOfBirth', 'nationalId', 'biometric'], mismatches: [] },
        completedAt: '2026-05-10T08:00:01Z',
      },
      {
        id: 'VERIFY-002',
        healthId: 'GN-1972-0805-OC',
        method: 'phone-otp',
        requestedBy: 'Dr. Keita — Urgences Donka',
        requestedAt: '2026-05-10T22:30:00Z',
        status: 'verified',
        result: { matched: true, confidence: 85, matchedFields: ['firstName', 'lastName', 'dateOfBirth', 'phone'], mismatches: ['address'] },
        completedAt: '2026-05-10T22:30:05Z',
      },
      {
        id: 'VERIFY-003',
        healthId: 'GN-2000-0320-KS',
        method: 'asc-vouch',
        requestedBy: 'ASC Moussa — Kindia',
        requestedAt: '2026-05-11T06:00:00Z',
        status: 'pending',
        result: null,
        completedAt: null,
      },
    ]
  }

  getRecords(): NationalHealthID[] {
    return this.records
  }

  getRecord(healthId: string): NationalHealthID | undefined {
    return this.records.find((r) => r.healthId === healthId || r.nationalId === healthId)
  }

  searchRecords(query: string): NationalHealthID[] {
    const q = query.toLowerCase()
    return this.records.filter(
      (r) =>
        r.healthId.toLowerCase().includes(q) ||
        r.firstName.toLowerCase().includes(q) ||
        r.lastName.toLowerCase().includes(q) ||
        r.nationalId.toLowerCase().includes(q) ||
        r.phone.includes(q)
    )
  }

  verifyIdentity(healthId: string, method: INSVerificationMethod, requestedBy: string): INSVerificationRequest {
    const record = this.records.find((r) => r.healthId === healthId)
    const request: INSVerificationRequest = {
      id: `VERIFY-${String(this.verificationRequests.length + 1).padStart(3, '0')}`,
      healthId,
      method,
      requestedBy,
      requestedAt: new Date().toISOString(),
      status: record ? 'verified' : 'failed',
      result: record
        ? { matched: true, confidence: method === 'biometric' ? 99.5 : method === 'phone-otp' ? 85 : 75, matchedFields: ['healthId'], mismatches: [] }
        : null,
      completedAt: record ? new Date().toISOString() : null,
    }

    if (record) {
      record.lastVerifiedAt = new Date().toISOString().split('T')[0]
      record.verificationMethod = method
      record.verificationStatus = 'verified'
      record.auditTrail.push({
        action: 'INS_VERIFIED',
        performedBy: requestedBy,
        performedAt: new Date().toISOString(),
        details: `Vérification via ${method} — confiance ${request.result?.confidence}%`,
      })
    }

    this.verificationRequests.unshift(request)
    return request
  }

  getVerificationRequests(): INSVerificationRequest[] {
    return this.verificationRequests
  }

  getStatistics(): INSStatistics {
    const totalIssued = this.records.length
    const activeIDs = this.records.filter((r) => r.status === 'active').length
    const pendingVerifications = this.verificationRequests.filter((r) => r.status === 'pending').length
    const verified = this.verificationRequests.filter((r) => r.status === 'verified').length
    const total = this.verificationRequests.length
    const byHealthZone: Record<string, number> = {}
    this.records.forEach((r) => { byHealthZone[r.healthZone] = (byHealthZone[r.healthZone] || 0) + 1 })
    const byVerificationMethod: Record<INSVerificationMethod, number> = { biometric: 0, document: 0, 'phone-otp': 0, 'in-person': 0, 'asc-vouch': 0 }
    this.records.forEach((r) => { byVerificationMethod[r.verificationMethod]++ })

    return {
      totalIssued,
      activeIDs,
      pendingVerifications,
      verificationSuccessRate: total > 0 ? Math.round((verified / total) * 100) : 0,
      byHealthZone,
      byVerificationMethod,
      recentIssuances: this.records.filter((r) => new Date(r.issuedAt) > new Date(Date.now() - 30 * 86400000)).length,
      averageLinkageTime: '2.3 min',
    }
  }
}

export const insService = new INSService()
