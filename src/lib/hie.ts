// HealthFlow Africa - Health Information Exchange (HIE)
// Inter-hospital data exchange, patient consent, cross-facility lookup

import type { FHIRPatient, FHIRBundle, FHIRReference, FHIRIdentifier } from './fhir'
import { GUINEA_FHIR_SYSTEMS, GUINEA_ESTABLISHMENTS, patientToFHIR, buildPatientBundle } from './fhir'
import type { Patient, Consultation, LabRequest } from './data-store'
import { useDataStore } from './data-store'

/* ─────────── HIE Types ─────────── */

export type ConsentStatus = 'active' | 'rejected' | 'inactive' | 'draft'
export type ExchangeDirection = 'sent' | 'received'
export type ExchangeStatus = 'pending' | 'delivered' | 'acknowledged' | 'failed' | 'expired'
export type ReferralStatus = 'pending' | 'accepted' | 'rejected' | 'in-progress' | 'completed' | 'cancelled'

export interface PatientConsent {
  id: string
  patientId: string
  patientName: string
  purpose: 'treatment' | 'payment' | 'research' | 'public-health' | 'health-operations'
  scope: 'general' | 'specific'
  dataTypes: ('demographics' | 'clinical' | 'laboratory' | 'pharmacy' | 'insurance' | 'billing')[]
  authorizedOrganizations: string[]
  consentStatus: ConsentStatus
  grantedAt: string
  expiresAt: string | null
  revokedAt: string | null
  conditions: string[]
}

export interface HIEExchange {
  id: string
  direction: ExchangeDirection
  senderOrganization: string
  senderSystem: string
  receiverOrganization: string
  receiverSystem: string
  resourceType: string
  resourceId: string
  patientId: string
  patientName: string
  bundleId: string | null
  status: ExchangeStatus
  consentId: string | null
  sentAt: string
  acknowledgedAt: string | null
  expiresAt: string
  errorMessage: string | null
  retryCount: number
  metadata: Record<string, string>
}

export interface CrossFacilityPatient {
  localId: string
  fhirId: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: 'M' | 'F'
  phone: string
  nationalId: string
  sourceOrganizations: {
    organizationId: string
    organizationName: string
    localPatientId: string
    lastVisit: string
    recordCount: number
    activeProblems: number
  }[]
  matchConfidence: number
  matchMethod: 'exact' | 'fuzzy' | 'identifier'
}

export interface InterFacilityReferral {
  id: string
  patientId: string
  patientName: string
  referringOrganizationId: string
  referringOrganizationName: string
  referringDoctor: string
  receivingOrganizationId: string
  receivingOrganizationName: string
  receivingDoctor: string | null
  specialty: string
  reason: string
  clinicalSummary: string
  attachedDocuments: string[]
  urgency: 'routine' | 'urgent' | 'emergency'
  status: ReferralStatus
  consentId: string
  createdAt: string
  acceptedAt: string | null
  completedAt: string | null
  notes: string[]
  transportNeeded: boolean
  estimatedArrival: string | null
}

export interface HIEConnection {
  organizationId: string
  organizationName: string
  endpoint: string
  authMethod: 'oauth2' | 'mutual-tls' | 'api-key'
  status: 'connected' | 'degraded' | 'disconnected' | 'maintenance'
  lastPing: string
  lastSync: string | null
  latencyMs: number
  uptime: number // percentage
  supportedResources: string[]
  fhirVersion: string
  totalExchanges: number
  failedExchanges: number
}

/* ─────────── HIE Service ─────────── */

class HIEService {
  private exchanges: HIEExchange[] = []
  private consents: PatientConsent[] = []
  private referrals: InterFacilityReferral[] = []
  private connections: HIEConnection[] = []
  private patientRegistry: CrossFacilityPatient[] = []

  constructor() {
    this.initializeDemoData()
  }

  private initializeDemoData() {
    // Connections to other facilities
    this.connections = [
      {
        organizationId: 'hf-org-ignace-deen',
        organizationName: 'Hôpital National Ignace Deen',
        endpoint: 'https://ignace-deen.healthflow-gn.com/fhir',
        authMethod: 'oauth2',
        status: 'connected',
        lastPing: new Date().toISOString(),
        lastSync: new Date(Date.now() - 300000).toISOString(),
        latencyMs: 45,
        uptime: 99.8,
        supportedResources: ['Patient', 'Observation', 'DiagnosticReport', 'Encounter', 'MedicationRequest'],
        fhirVersion: '4.0.1',
        totalExchanges: 342,
        failedExchanges: 3,
      },
      {
        organizationId: 'hf-org-kankan-regional',
        organizationName: 'Hôpital régional de Kankan',
        endpoint: 'https://kankan.healthflow-gn.com/fhir',
        authMethod: 'mutual-tls',
        status: 'connected',
        lastPing: new Date().toISOString(),
        lastSync: new Date(Date.now() - 600000).toISOString(),
        latencyMs: 120,
        uptime: 97.5,
        supportedResources: ['Patient', 'Encounter', 'Observation'],
        fhirVersion: '4.0.1',
        totalExchanges: 156,
        failedExchanges: 8,
      },
      {
        organizationId: 'hf-org-kindia-regional',
        organizationName: 'Hôpital régional de Kindia',
        endpoint: 'https://kindia.healthflow-gn.com/fhir',
        authMethod: 'oauth2',
        status: 'degraded',
        lastPing: new Date(Date.now() - 600000).toISOString(),
        lastSync: new Date(Date.now() - 3600000).toISOString(),
        latencyMs: 350,
        uptime: 89.2,
        supportedResources: ['Patient', 'Encounter'],
        fhirVersion: '4.0.1',
        totalExchanges: 89,
        failedExchanges: 12,
      },
      {
        organizationId: 'hf-org-nzerekore-regional',
        organizationName: "Hôpital régional de N'Zérékoré",
        endpoint: 'https://nzerekore.healthflow-gn.com/fhir',
        authMethod: 'api-key',
        status: 'disconnected',
        lastPing: new Date(Date.now() - 86400000).toISOString(),
        lastSync: new Date(Date.now() - 172800000).toISOString(),
        latencyMs: 0,
        uptime: 72.1,
        supportedResources: ['Patient'],
        fhirVersion: '4.0.1',
        totalExchanges: 34,
        failedExchanges: 5,
      },
      {
        organizationId: 'hf-org-cs-dixinn',
        organizationName: 'Centre de santé Dixinn',
        endpoint: 'https://dixinn.healthflow-gn.com/fhir',
        authMethod: 'oauth2',
        status: 'connected',
        lastPing: new Date().toISOString(),
        lastSync: new Date(Date.now() - 180000).toISOString(),
        latencyMs: 25,
        uptime: 99.9,
        supportedResources: ['Patient', 'Encounter', 'Observation', 'MedicationRequest'],
        fhirVersion: '4.0.1',
        totalExchanges: 567,
        failedExchanges: 1,
      },
    ]

    // Consents
    this.consents = [
      {
        id: 'CONSENT-001',
        patientId: 'P-2024-001',
        patientName: 'Aminata Diallo',
        purpose: 'treatment',
        scope: 'general',
        dataTypes: ['demographics', 'clinical', 'laboratory', 'pharmacy'],
        authorizedOrganizations: ['hf-org-ignace-deen', 'hf-org-cs-dixinn'],
        consentStatus: 'active',
        grantedAt: '2024-01-15T10:00:00Z',
        expiresAt: '2027-01-15T10:00:00Z',
        revokedAt: null,
        conditions: ['Partage limité aux urgences et continuité des soins'],
      },
      {
        id: 'CONSENT-002',
        patientId: 'P-2024-002',
        patientName: 'Mamadou Condé',
        purpose: 'treatment',
        scope: 'specific',
        dataTypes: ['demographics', 'clinical', 'laboratory'],
        authorizedOrganizations: ['hf-org-ignace-deen'],
        consentStatus: 'active',
        grantedAt: '2024-02-20T14:00:00Z',
        expiresAt: '2026-08-20T14:00:00Z',
        revokedAt: null,
        conditions: ['Données cardiologiques uniquement'],
      },
      {
        id: 'CONSENT-003',
        patientId: 'P-2024-003',
        patientName: 'Fatoumata Camara',
        purpose: 'payment',
        scope: 'general',
        dataTypes: ['demographics', 'insurance', 'billing'],
        authorizedOrganizations: ['hf-org-cs-dixinn'],
        consentStatus: 'active',
        grantedAt: '2024-03-10T09:00:00Z',
        expiresAt: '2027-03-10T09:00:00Z',
        revokedAt: null,
        conditions: [],
      },
      {
        id: 'CONSENT-004',
        patientId: 'P-2024-010',
        patientName: 'Ousmane Camara',
        purpose: 'treatment',
        scope: 'general',
        dataTypes: ['demographics', 'clinical', 'laboratory', 'pharmacy', 'insurance', 'billing'],
        authorizedOrganizations: ['hf-org-ignace-deen', 'hf-org-kankan-regional', 'hf-org-nzerekore-regional'],
        consentStatus: 'active',
        grantedAt: '2026-02-20T08:00:00Z',
        expiresAt: null,
        revokedAt: null,
        conditions: ['Consentement urgent suite AVC'],
      },
    ]

    // Exchanges
    this.exchanges = [
      {
        id: 'EXCH-001',
        direction: 'sent',
        senderOrganization: 'Hôpital National Donka',
        senderSystem: 'HealthFlow',
        receiverOrganization: 'Hôpital National Ignace Deen',
        receiverSystem: 'HealthFlow',
        resourceType: 'Patient',
        resourceId: 'hf-patient-P-2024-001',
        patientId: 'P-2024-001',
        patientName: 'Aminata Diallo',
        bundleId: 'hf-bundle-P-2024-001-001',
        status: 'acknowledged',
        consentId: 'CONSENT-001',
        sentAt: '2026-05-09T14:00:00Z',
        acknowledgedAt: '2026-05-09T14:00:02Z',
        expiresAt: '2026-05-10T14:00:00Z',
        errorMessage: null,
        retryCount: 0,
        metadata: { reason: 'Referral for cardiology consult' },
      },
      {
        id: 'EXCH-002',
        direction: 'received',
        senderOrganization: 'Centre de santé Dixinn',
        senderSystem: 'HealthFlow',
        receiverOrganization: 'Hôpital National Donka',
        receiverSystem: 'HealthFlow',
        resourceType: 'DiagnosticReport',
        resourceId: 'hf-report-LAB-001',
        patientId: 'P-2024-001',
        patientName: 'Aminata Diallo',
        bundleId: null,
        status: 'delivered',
        consentId: 'CONSENT-001',
        sentAt: '2026-05-10T09:30:00Z',
        acknowledgedAt: null,
        expiresAt: '2026-05-11T09:30:00Z',
        errorMessage: null,
        retryCount: 0,
        metadata: { labType: 'Hémogramme' },
      },
      {
        id: 'EXCH-003',
        direction: 'sent',
        senderOrganization: 'Hôpital National Donka',
        senderSystem: 'HealthFlow',
        receiverOrganization: "Hôpital régional de N'Zérékoré",
        receiverSystem: 'HealthFlow',
        resourceType: 'Patient',
        resourceId: 'hf-patient-P-2024-010',
        patientId: 'P-2024-010',
        patientName: 'Ousmane Camara',
        bundleId: null,
        status: 'failed',
        consentId: 'CONSENT-004',
        sentAt: '2026-05-08T11:00:00Z',
        acknowledgedAt: null,
        expiresAt: '2026-05-09T11:00:00Z',
        errorMessage: 'Connection timeout — hôpital déconnecté',
        retryCount: 3,
        metadata: { reason: 'AVC emergency transfer' },
      },
      {
        id: 'EXCH-004',
        direction: 'received',
        senderOrganization: 'Hôpital régional de Kankan',
        senderSystem: 'HealthFlow',
        receiverOrganization: 'Hôpital National Donka',
        receiverSystem: 'HealthFlow',
        resourceType: 'Patient',
        resourceId: 'hf-patient-P-2024-008',
        patientId: 'P-2024-008',
        patientName: 'Youssouf Touré',
        bundleId: 'hf-bundle-P-2024-008-001',
        status: 'acknowledged',
        consentId: null,
        sentAt: '2026-05-07T16:00:00Z',
        acknowledgedAt: '2026-05-07T16:00:05Z',
        expiresAt: '2026-05-08T16:00:00Z',
        errorMessage: null,
        retryCount: 0,
        metadata: { reason: 'Patient transferred from Kankan for hepatology' },
      },
      {
        id: 'EXCH-005',
        direction: 'sent',
        senderOrganization: 'Hôpital National Donka',
        senderSystem: 'HealthFlow',
        receiverOrganization: 'Hôpital régional de Kindia',
        receiverSystem: 'HealthFlow',
        resourceType: 'Encounter',
        resourceId: 'hf-encounter-CONS-002',
        patientId: 'P-2024-002',
        patientName: 'Mamadou Condé',
        bundleId: null,
        status: 'pending',
        consentId: 'CONSENT-002',
        sentAt: new Date().toISOString(),
        acknowledgedAt: null,
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        errorMessage: null,
        retryCount: 0,
        metadata: { reason: 'Cardiology follow-up' },
      },
    ]

    // Referrals
    this.referrals = [
      {
        id: 'REF-001',
        patientId: 'P-2024-001',
        patientName: 'Aminata Diallo',
        referringOrganizationId: 'hf-org-donka',
        referringOrganizationName: 'Hôpital National Donka',
        referringDoctor: 'Dr. Diallo',
        receivingOrganizationId: 'hf-org-ignace-deen',
        receivingOrganizationName: 'Hôpital National Ignace Deen',
        receivingDoctor: 'Dr. Touré',
        specialty: 'Cardiologie',
        reason: 'Paludisme sévère avec suspicion de myocardite',
        clinicalSummary: 'Patient admise pour paludisme simple. Apparition de douleurs thoraciques et tachycardie. ECG montre des anomalies du segment ST. Nécessite évaluation cardiologique spécialisée.',
        attachedDocuments: ['ECG rapport', 'Hémogramme', 'Bilan cardiaque'],
        urgency: 'urgent',
        status: 'accepted',
        consentId: 'CONSENT-001',
        createdAt: '2026-05-09T14:00:00Z',
        acceptedAt: '2026-05-09T15:00:00Z',
        completedAt: null,
        notes: ['Dossier transféré via HIE — diagnostic FHIR envoyé'],
        transportNeeded: false,
        estimatedArrival: null,
      },
      {
        id: 'REF-002',
        patientId: 'P-2024-010',
        patientName: 'Ousmane Camara',
        referringOrganizationId: 'hf-org-donka',
        referringOrganizationName: 'Hôpital National Donka',
        referringDoctor: 'Dr. Keita',
        receivingOrganizationId: 'hf-org-ignace-deen',
        receivingOrganizationName: 'Hôpital National Ignace Deen',
        receivingDoctor: null,
        specialty: 'Neurologie / Rééducation',
        reason: 'AVC ischémique — nécessite rééducation spécialisée',
        clinicalSummary: 'Patient admis aux urgences pour AVC ischémique. Thrombolyse effectuée. État neurologique stabilisé mais séquelles motrices. Nécessite prise en charge en rééducation neurologique.',
        attachedDocuments: ['IRM cérébrale', 'Scanner', 'Bilan sanguin'],
        urgency: 'routine',
        status: 'pending',
        consentId: 'CONSENT-004',
        createdAt: '2026-05-10T10:00:00Z',
        acceptedAt: null,
        completedAt: null,
        notes: ['En attente de confirmation du service de neuro-rééducation'],
        transportNeeded: true,
        estimatedArrival: '2026-05-12T09:00:00Z',
      },
      {
        id: 'REF-003',
        patientId: 'P-2024-008',
        patientName: 'Youssouf Touré',
        referringOrganizationId: 'hf-org-kankan-regional',
        referringOrganizationName: 'Hôpital régional de Kankan',
        referringDoctor: 'Dr. Bangoura',
        receivingOrganizationId: 'hf-org-donka',
        receivingOrganizationName: 'Hôpital National Donka',
        receivingDoctor: 'Dr. Diallo',
        specialty: 'Hépatologie',
        reason: 'Hépatite B chronique avec cirrhose — nécessite avis spécialisé',
        clinicalSummary: 'Patient suivi pour hépatite B chronique. Apparition de signes de cirrhose débutante (ascite modérée, ictère). Bilan à compléter avec fibroscan et hépatologie spécialisée.',
        attachedDocuments: ['Sérologie hépatite', 'Échographie abdominale'],
        urgency: 'routine',
        status: 'in-progress',
        consentId: 'CONSENT-001',
        createdAt: '2026-05-07T16:00:00Z',
        acceptedAt: '2026-05-07T17:00:00Z',
        completedAt: null,
        notes: ['Première consultation prévue le 12/05/2026'],
        transportNeeded: true,
        estimatedArrival: '2026-05-11T14:00:00Z',
      },
    ]

    // Patient Registry (cross-facility lookup)
    this.patientRegistry = [
      {
        localId: 'P-2024-001',
        fhirId: 'hf-patient-P-2024-001',
        firstName: 'Aminata',
        lastName: 'Diallo',
        dateOfBirth: '1998-03-15',
        gender: 'F',
        phone: '+224 622 11 22 33',
        nationalId: 'GN-1998-0315-FD',
        sourceOrganizations: [
          { organizationId: 'hf-org-donka', organizationName: 'Hôpital National Donka', localPatientId: 'P-2024-001', lastVisit: '2026-03-01', recordCount: 12, activeProblems: 2 },
          { organizationId: 'hf-org-cs-dixinn', organizationName: 'Centre de santé Dixinn', localPatientId: 'CS-DIX-456', lastVisit: '2026-01-15', recordCount: 4, activeProblems: 1 },
        ],
        matchConfidence: 100,
        matchMethod: 'identifier',
      },
      {
        localId: 'P-2024-002',
        fhirId: 'hf-patient-P-2024-002',
        firstName: 'Mamadou',
        lastName: 'Condé',
        dateOfBirth: '1980-07-22',
        gender: 'M',
        phone: '+224 623 44 55 66',
        nationalId: 'GN-1980-0722-MC',
        sourceOrganizations: [
          { organizationId: 'hf-org-donka', organizationName: 'Hôpital National Donka', localPatientId: 'P-2024-002', lastVisit: '2026-03-03', recordCount: 8, activeProblems: 2 },
          { organizationId: 'hf-org-ignace-deen', organizationName: 'Hôpital National Ignace Deen', localPatientId: 'ID-789', lastVisit: '2025-11-20', recordCount: 3, activeProblems: 1 },
        ],
        matchConfidence: 100,
        matchMethod: 'identifier',
      },
      {
        localId: 'P-2024-008',
        fhirId: 'hf-patient-P-2024-008',
        firstName: 'Youssouf',
        lastName: 'Touré',
        dateOfBirth: '1985-05-20',
        gender: 'M',
        phone: '+224 629 11 22 33',
        nationalId: 'GN-1985-0520-YT',
        sourceOrganizations: [
          { organizationId: 'hf-org-donka', organizationName: 'Hôpital National Donka', localPatientId: 'P-2024-008', lastVisit: '2026-02-10', recordCount: 5, activeProblems: 2 },
          { organizationId: 'hf-org-kankan-regional', organizationName: 'Hôpital régional de Kankan', localPatientId: 'KAN-234', lastVisit: '2026-01-05', recordCount: 7, activeProblems: 1 },
        ],
        matchConfidence: 95,
        matchMethod: 'fuzzy',
      },
    ]
  }

  // ─── Consent Management ───

  getConsents(patientId?: string): PatientConsent[] {
    if (patientId) return this.consents.filter((c) => c.patientId === patientId)
    return this.consents
  }

  grantConsent(consent: Omit<PatientConsent, 'id' | 'grantedAt'>): PatientConsent {
    const newConsent: PatientConsent = {
      ...consent,
      id: `CONSENT-${String(this.consents.length + 1).padStart(3, '0')}`,
      grantedAt: new Date().toISOString(),
    }
    this.consents.push(newConsent)
    return newConsent
  }

  revokeConsent(consentId: string): PatientConsent | null {
    const consent = this.consents.find((c) => c.id === consentId)
    if (!consent) return null
    consent.consentStatus = 'inactive'
    consent.revokedAt = new Date().toISOString()
    return consent
  }

  checkConsent(patientId: string, targetOrgId: string, dataType: PatientConsent['dataTypes'][0]): boolean {
    return this.consents.some(
      (c) =>
        c.patientId === patientId &&
        c.consentStatus === 'active' &&
        c.authorizedOrganizations.includes(targetOrgId) &&
        c.dataTypes.includes(dataType)
    )
  }

  // ─── Exchange Management ───

  getExchanges(filters?: { direction?: ExchangeDirection; status?: ExchangeStatus; patientId?: string }): HIEExchange[] {
    let results = this.exchanges
    if (filters?.direction) results = results.filter((e) => e.direction === filters.direction)
    if (filters?.status) results = results.filter((e) => e.status === filters.status)
    if (filters?.patientId) results = results.filter((e) => e.patientId === filters.patientId)
    return results
  }

  async sendExchange(
    patientId: string,
    targetOrgId: string,
    resourceType: string,
    resourceId: string,
    consentId: string | null,
    metadata?: Record<string, string>
  ): Promise<HIEExchange> {
    const targetOrg = this.connections.find((c) => c.organizationId === targetOrgId)
    const store = useDataStore.getState()
    const patient = store.patients.find((p) => p.id === patientId)

    const exchange: HIEExchange = {
      id: `EXCH-${String(this.exchanges.length + 1).padStart(3, '0')}`,
      direction: 'sent',
      senderOrganization: 'Hôpital National Donka',
      senderSystem: 'HealthFlow',
      receiverOrganization: targetOrg?.organizationName || targetOrgId,
      receiverSystem: 'HealthFlow',
      resourceType,
      resourceId,
      patientId,
      patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Inconnu',
      bundleId: null,
      status: targetOrg?.status === 'connected' ? 'delivered' : 'failed',
      consentId,
      sentAt: new Date().toISOString(),
      acknowledgedAt: null,
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      errorMessage: targetOrg?.status !== 'connected' ? 'Hôpital non connecté' : null,
      retryCount: 0,
      metadata: metadata || {},
    }

    this.exchanges.push(exchange)
    return exchange
  }

  // ─── Connection Management ───

  getConnections(): HIEConnection[] {
    return this.connections
  }

  getConnection(orgId: string): HIEConnection | undefined {
    return this.connections.find((c) => c.organizationId === orgId)
  }

  async pingConnection(orgId: string): Promise<{ success: boolean; latencyMs: number }> {
    const conn = this.connections.find((c) => c.organizationId === orgId)
    if (!conn) return { success: false, latencyMs: 0 }

    // Simulate ping
    const latency = Math.floor(Math.random() * 200) + 20
    const success = conn.status === 'connected' || (conn.status === 'degraded' && Math.random() > 0.3)

    if (success) {
      conn.lastPing = new Date().toISOString()
      conn.latencyMs = latency
    }

    return { success, latencyMs: latency }
  }

  // ─── Patient Registry ───

  searchPatientRegistry(query: string): CrossFacilityPatient[] {
    const q = query.toLowerCase()
    return this.patientRegistry.filter(
      (p) =>
        p.firstName.toLowerCase().includes(q) ||
        p.lastName.toLowerCase().includes(q) ||
        p.nationalId.toLowerCase().includes(q) ||
        p.phone.includes(q)
    )
  }

  getPatientRecords(patientId: string): CrossFacilityPatient | undefined {
    return this.patientRegistry.find((p) => p.localId === patientId)
  }

  // ─── Referral Management ───

  getReferrals(filters?: { status?: ReferralStatus; organizationId?: string }): InterFacilityReferral[] {
    let results = this.referrals
    if (filters?.status) results = results.filter((r) => r.status === filters.status)
    if (filters?.organizationId) {
      results = results.filter(
        (r) => r.referringOrganizationId === filters.organizationId || r.receivingOrganizationId === filters.organizationId
      )
    }
    return results
  }

  createReferral(referral: Omit<InterFacilityReferral, 'id' | 'createdAt' | 'acceptedAt' | 'completedAt' | 'notes'>): InterFacilityReferral {
    const newReferral: InterFacilityReferral = {
      ...referral,
      id: `REF-${String(this.referrals.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      acceptedAt: null,
      completedAt: null,
      notes: [],
    }
    this.referrals.push(newReferral)
    return newReferral
  }

  acceptReferral(referralId: string, acceptingDoctor: string): InterFacilityReferral | null {
    const referral = this.referrals.find((r) => r.id === referralId)
    if (!referral) return null
    referral.status = 'accepted'
    referral.receivingDoctor = acceptingDoctor
    referral.acceptedAt = new Date().toISOString()
    referral.notes.push(`Accepté par ${acceptingDoctor} le ${new Date().toLocaleDateString('fr-FR')}`)
    return referral
  }

  // ─── Statistics ───

  getHIEMetrics() {
    const totalExchanges = this.exchanges.length
    const successfulExchanges = this.exchanges.filter((e) => e.status === 'acknowledged' || e.status === 'delivered').length
    const failedExchanges = this.exchanges.filter((e) => e.status === 'failed').length
    const pendingExchanges = this.exchanges.filter((e) => e.status === 'pending').length
    const activeConnections = this.connections.filter((c) => c.status === 'connected').length
    const totalConnections = this.connections.length
    const activeConsents = this.consents.filter((c) => c.consentStatus === 'active').length
    const pendingReferrals = this.referrals.filter((r) => r.status === 'pending').length
    const activeReferrals = this.referrals.filter((r) => r.status === 'in-progress' || r.status === 'accepted').length

    return {
      totalExchanges,
      successfulExchanges,
      failedExchanges,
      pendingExchanges,
      successRate: totalExchanges > 0 ? Math.round((successfulExchanges / totalExchanges) * 100) : 0,
      activeConnections,
      totalConnections,
      connectionUptime: Math.round(
        this.connections.reduce((acc, c) => acc + c.uptime, 0) / this.connections.length
      ),
      activeConsents,
      totalConsents: this.consents.length,
      pendingReferrals,
      activeReferrals,
      totalReferrals: this.referrals.length,
      averageLatency: Math.round(
        this.connections.filter((c) => c.latencyMs > 0).reduce((acc, c) => acc + c.latencyMs, 0) /
        this.connections.filter((c) => c.latencyMs > 0).length
      ),
    }
  }
}

// Singleton instance
export const hieService = new HIEService()
