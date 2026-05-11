// HealthFlow Africa - Master Patient Index (MPI)
// Enterprise patient matching, deduplication, and golden record management

import type { FHIRPatient } from './fhir'
import { GUINEA_FHIR_SYSTEMS } from './fhir'

/* ─────────── MPI Types ─────────── */

export type MatchAlgorithm = 'exact' | 'deterministic' | 'probabilistic' | 'identifier'
export type MatchStatus = 'auto-merged' | 'manual-review' | 'confirmed' | 'rejected' | 'potential'
export type RecordSource = 'local' | 'dhis2' | 'santep' | 'hie' | 'registry' | 'asc'

export interface MPIMatchRule {
  id: string
  field: string
  algorithm: MatchAlgorithm
  weight: number
  threshold: number
  description: string
}

export interface MPIMatchResult {
  patientId: string
  goldenRecordId: string
  matchScore: number
  matchAlgorithm: MatchAlgorithm
  matchStatus: MatchStatus
  matchedFields: string[]
  unmatchedFields: string[]
  confidence: 'high' | 'medium' | 'low'
  reviewedBy: string | null
  reviewedAt: string | null
  matchedAt: string
}

export interface GoldenRecord {
  id: string
  primaryPatientId: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: 'M' | 'F'
  phone: string
  nationalId: string
  address: string
  sourceRecords: {
    patientId: string
    source: RecordSource
    sourceFacility: string
    sourceSystem: string
    localId: string
    lastUpdated: string
    confidence: number
    isPrimary: boolean
  }[]
  matchHistory: MPIMatchResult[]
  createdAt: string
  lastMatchedAt: string
  totalVisits: number
  activeProblems: string[]
  allergies: string[]
  bloodType: string
  insuranceStatus: 'insured' | 'uninsured' | 'unknown'
  vaccinationStatus: 'complete' | 'partial' | 'unknown'
  dataQuality: 'excellent' | 'good' | 'fair' | 'poor'
}

export interface MPIMetrics {
  totalGoldenRecords: number
  totalSourceRecords: number
  pendingReviews: number
  autoMergedRecords: number
  duplicateRate: number
  matchAccuracy: number
  averageMatchScore: number
  recordsBySource: Record<RecordSource, number>
  recentMatches: number
  dataQualityDistribution: Record<string, number>
}

/* ─────────── MPI Match Rules ─────────── */

export const MPI_MATCH_RULES: MPIMatchRule[] = [
  { id: 'R001', field: 'nationalId', algorithm: 'identifier', weight: 0.40, threshold: 1.0, description: 'Identifiant national exact — prépondérant' },
  { id: 'R002', field: 'firstName+lastName+dateOfBirth', algorithm: 'deterministic', weight: 0.25, threshold: 0.9, description: 'Nom complet + date de naissance' },
  { id: 'R003', field: 'phone', algorithm: 'exact', weight: 0.15, threshold: 1.0, description: 'Numéro de téléphone exact (+224)' },
  { id: 'R004', field: 'firstName+lastName', algorithm: 'probabilistic', weight: 0.10, threshold: 0.8, description: 'Nom probabiliste (erreurs de saisie, translittération)' },
  { id: 'R005', field: 'address', algorithm: 'probabilistic', weight: 0.05, threshold: 0.7, description: 'Adresse approximative (quartier, commune)' },
  { id: 'R006', field: 'santepCard', algorithm: 'identifier', weight: 0.05, threshold: 1.0, description: 'Numéro de carte SANTEP' },
]

/* ─────────── MPI Service ─────────── */

class MPIService {
  private goldenRecords: GoldenRecord[] = []
  private matchResults: MPIMatchResult[] = []

  constructor() {
    this.initializeDemoData()
  }

  private initializeDemoData() {
    this.goldenRecords = [
      {
        id: 'GR-001',
        primaryPatientId: 'P-2024-001',
        firstName: 'Aminata',
        lastName: 'Diallo',
        dateOfBirth: '1998-03-15',
        gender: 'F',
        phone: '+224 622 11 22 33',
        nationalId: 'GN-1998-0315-FD',
        address: 'Conakry, Kaloum',
        sourceRecords: [
          { patientId: 'P-2024-001', source: 'local', sourceFacility: 'Hôpital National Donka', sourceSystem: 'HealthFlow', localId: 'P-2024-001', lastUpdated: '2026-05-10', confidence: 1.0, isPrimary: true },
          { patientId: 'CS-DIX-456', source: 'local', sourceFacility: 'Centre de santé Dixinn', sourceSystem: 'HealthFlow', localId: 'CS-DIX-456', lastUpdated: '2026-01-15', confidence: 0.95, isPrimary: false },
          { patientId: 'REG-AD-001', source: 'registry', sourceFacility: 'Registre National', sourceSystem: 'Registre National', localId: 'GN-1998-0315-FD', lastUpdated: '2026-05-01', confidence: 0.90, isPrimary: false },
          { patientId: 'STP-AD-001', source: 'santep', sourceFacility: 'SANTEP', sourceSystem: 'SANTEP Card', localId: 'SANTEP-2024-0001', lastUpdated: '2026-05-10', confidence: 0.85, isPrimary: false },
        ],
        matchHistory: [
          { patientId: 'CS-DIX-456', goldenRecordId: 'GR-001', matchScore: 98, matchAlgorithm: 'deterministic', matchStatus: 'auto-merged', matchedFields: ['firstName', 'lastName', 'dateOfBirth', 'nationalId'], unmatchedFields: ['phone'], confidence: 'high', reviewedBy: null, reviewedAt: null, matchedAt: '2026-01-15T10:00:00Z' },
          { patientId: 'REG-AD-001', goldenRecordId: 'GR-001', matchScore: 100, matchAlgorithm: 'identifier', matchStatus: 'auto-merged', matchedFields: ['nationalId'], unmatchedFields: [], confidence: 'high', reviewedBy: null, reviewedAt: null, matchedAt: '2026-05-01T08:00:00Z' },
        ],
        createdAt: '2024-01-15',
        lastMatchedAt: '2026-05-10',
        totalVisits: 12,
        activeProblems: ['Paludisme sévère', 'Anémie ferriprive'],
        allergies: ['Pénicilline', 'Sulfamides'],
        bloodType: 'O+',
        insuranceStatus: 'insured',
        vaccinationStatus: 'complete',
        dataQuality: 'excellent',
      },
      {
        id: 'GR-002',
        primaryPatientId: 'P-2024-002',
        firstName: 'Mamadou',
        lastName: 'Condé',
        dateOfBirth: '1980-07-22',
        gender: 'M',
        phone: '+224 623 44 55 66',
        nationalId: 'GN-1980-0722-MC',
        address: 'Conakry, Dixinn',
        sourceRecords: [
          { patientId: 'P-2024-002', source: 'local', sourceFacility: 'Hôpital National Donka', sourceSystem: 'HealthFlow', localId: 'P-2024-002', lastUpdated: '2026-05-10', confidence: 1.0, isPrimary: true },
          { patientId: 'ID-789', source: 'hie', sourceFacility: 'Hôpital Ignace Deen', sourceSystem: 'HealthFlow', localId: 'ID-789', lastUpdated: '2025-11-20', confidence: 0.92, isPrimary: false },
        ],
        matchHistory: [
          { patientId: 'ID-789', goldenRecordId: 'GR-002', matchScore: 92, matchAlgorithm: 'probabilistic', matchStatus: 'confirmed', matchedFields: ['firstName', 'lastName', 'dateOfBirth', 'phone'], unmatchedFields: ['address'], confidence: 'high', reviewedBy: 'Dr. Diallo', reviewedAt: '2025-11-21T09:00:00Z', matchedAt: '2025-11-20T16:00:00Z' },
        ],
        createdAt: '2024-02-20',
        lastMatchedAt: '2026-05-10',
        totalVisits: 8,
        activeProblems: ['Hypertension artérielle', 'Hypercholestérolémie'],
        allergies: ['Aspirine'],
        bloodType: 'A+',
        insuranceStatus: 'insured',
        vaccinationStatus: 'complete',
        dataQuality: 'good',
      },
      {
        id: 'GR-003',
        primaryPatientId: 'P-2024-010',
        firstName: 'Ousmane',
        lastName: 'Camara',
        dateOfBirth: '1972-08-05',
        gender: 'M',
        phone: '+224 621 55 66 77',
        nationalId: 'GN-1972-0805-OC',
        address: "N'Zérékoré",
        sourceRecords: [
          { patientId: 'P-2024-010', source: 'local', sourceFacility: 'Hôpital National Donka', sourceSystem: 'HealthFlow', localId: 'P-2024-010', lastUpdated: '2026-05-10', confidence: 1.0, isPrimary: true },
          { patientId: 'NZR-OC-042', source: 'local', sourceFacility: "Hôpital régional de N'Zérékoré", sourceSystem: 'HealthFlow', localId: 'NZR-OC-042', lastUpdated: '2026-02-15', confidence: 0.88, isPrimary: false },
          { patientId: 'REG-OC-010', source: 'registry', sourceFacility: 'Registre National', sourceSystem: 'Registre National', localId: 'GN-1972-0805-OC', lastUpdated: '2026-05-01', confidence: 0.90, isPrimary: false },
        ],
        matchHistory: [
          { patientId: 'NZR-OC-042', goldenRecordId: 'GR-003', matchScore: 85, matchAlgorithm: 'probabilistic', matchStatus: 'confirmed', matchedFields: ['firstName', 'lastName', 'dateOfBirth', 'gender'], unmatchedFields: ['phone', 'address'], confidence: 'medium', reviewedBy: 'Dr. Keita', reviewedAt: '2026-02-16T10:00:00Z', matchedAt: '2026-02-15T14:00:00Z' },
        ],
        createdAt: '2026-02-20',
        lastMatchedAt: '2026-05-10',
        totalVisits: 5,
        activeProblems: ['AVC ischémique', 'Hypertension', 'Diabète type 2'],
        allergies: ['Aspirine'],
        bloodType: 'AB+',
        insuranceStatus: 'insured',
        vaccinationStatus: 'unknown',
        dataQuality: 'fair',
      },
      {
        id: 'GR-004',
        primaryPatientId: 'P-KIN-2026-034',
        firstName: 'Sekou',
        lastName: 'Soumah',
        dateOfBirth: '2000-03-20',
        gender: 'M',
        phone: '+224 624 11 22 33',
        nationalId: 'GN-2000-0320-KS',
        address: 'Kindia',
        sourceRecords: [
          { patientId: 'P-KIN-2026-034', source: 'local', sourceFacility: 'Hôpital régional de Kindia', sourceSystem: 'HealthFlow', localId: 'P-KIN-2026-034', lastUpdated: '2026-05-11', confidence: 1.0, isPrimary: true },
          { patientId: 'DONKA-POT-001', source: 'local', sourceFacility: 'Hôpital National Donka', sourceSystem: 'HealthFlow', localId: 'DONKA-POT-001', lastUpdated: '2026-05-11', confidence: 0.65, isPrimary: false },
        ],
        matchHistory: [
          { patientId: 'DONKA-POT-001', goldenRecordId: 'GR-004', matchScore: 65, matchAlgorithm: 'probabilistic', matchStatus: 'manual-review', matchedFields: ['firstName', 'lastName', 'dateOfBirth'], unmatchedFields: ['phone', 'nationalId', 'address'], confidence: 'low', reviewedBy: null, reviewedAt: null, matchedAt: '2026-05-11T06:30:00Z' },
        ],
        createdAt: '2026-05-11',
        lastMatchedAt: '2026-05-11',
        totalVisits: 1,
        activeProblems: ['Traumatisme thoracique'],
        allergies: [],
        bloodType: 'O-',
        insuranceStatus: 'uninsured',
        vaccinationStatus: 'unknown',
        dataQuality: 'poor',
      },
    ]

    this.matchResults = this.goldenRecords.flatMap((gr) => gr.matchHistory)
  }

  getGoldenRecords(): GoldenRecord[] {
    return this.goldenRecords
  }

  getGoldenRecord(id: string): GoldenRecord | undefined {
    return this.goldenRecords.find((gr) => gr.id === id)
  }

  searchGoldenRecords(query: string): GoldenRecord[] {
    const q = query.toLowerCase()
    return this.goldenRecords.filter(
      (gr) =>
        gr.firstName.toLowerCase().includes(q) ||
        gr.lastName.toLowerCase().includes(q) ||
        gr.nationalId.toLowerCase().includes(q) ||
        gr.phone.includes(q) ||
        gr.id.toLowerCase().includes(q)
    )
  }

  getPendingReviews(): MPIMatchResult[] {
    return this.matchResults.filter((mr) => mr.matchStatus === 'manual-review')
  }

  reviewMatch(goldenRecordId: string, patientId: string, action: 'confirmed' | 'rejected', reviewer: string): MPIMatchResult | null {
    const gr = this.goldenRecords.find((g) => g.id === goldenRecordId)
    if (!gr) return null

    const match = gr.matchHistory.find((m) => m.patientId === patientId)
    if (!match) return null

    match.matchStatus = action
    match.reviewedBy = reviewer
    match.reviewedAt = new Date().toISOString()

    return match
  }

  getMetrics(): MPIMetrics {
    const totalGoldenRecords = this.goldenRecords.length
    const totalSourceRecords = this.goldenRecords.reduce((sum, gr) => sum + gr.sourceRecords.length, 0)
    const pendingReviews = this.matchResults.filter((mr) => mr.matchStatus === 'manual-review').length
    const autoMergedRecords = this.matchResults.filter((mr) => mr.matchStatus === 'auto-merged').length
    const totalMatches = this.matchResults.length
    const duplicateRate = totalGoldenRecords > 0 ? Math.round(((totalSourceRecords - totalGoldenRecords) / totalSourceRecords) * 100) : 0
    const matchAccuracy = totalMatches > 0 ? Math.round(((autoMergedRecords + this.matchResults.filter((mr) => mr.matchStatus === 'confirmed').length) / totalMatches) * 100) : 0
    const averageMatchScore = totalMatches > 0 ? Math.round(this.matchResults.reduce((sum, mr) => sum + mr.matchScore, 0) / totalMatches) : 0

    const recordsBySource: Record<RecordSource, number> = { local: 0, dhis2: 0, santep: 0, hie: 0, registry: 0, asc: 0 }
    this.goldenRecords.forEach((gr) => {
      gr.sourceRecords.forEach((sr) => {
        recordsBySource[sr.source] = (recordsBySource[sr.source] || 0) + 1
      })
    })

    const dataQualityDistribution: Record<string, number> = { excellent: 0, good: 0, fair: 0, poor: 0 }
    this.goldenRecords.forEach((gr) => {
      dataQualityDistribution[gr.dataQuality] = (dataQualityDistribution[gr.dataQuality] || 0) + 1
    })

    return {
      totalGoldenRecords,
      totalSourceRecords,
      pendingReviews,
      autoMergedRecords,
      duplicateRate,
      matchAccuracy,
      averageMatchScore,
      recordsBySource,
      recentMatches: this.matchResults.filter((mr) => new Date(mr.matchedAt) > new Date(Date.now() - 7 * 86400000)).length,
      dataQualityDistribution,
    }
  }
}

export const mpiService = new MPIService()
