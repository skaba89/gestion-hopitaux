// HealthFlow Africa - Cross-Border Health Data Exchange
// ECOWAS regional health data exchange for West Africa

/* ─────────── Cross-Border Types ─────────── */

export type ExchangeProtocol = 'FHIR-R4' | 'HL7v2' | 'IHE-XDS' | 'WHO-IDSR'
export type BorderStatus = 'open' | 'restricted' | 'closed'
export type CrossBorderDirection = 'outbound' | 'inbound'
export type CrossBorderStatus = 'pending' | 'authorized' | 'in-transit' | 'delivered' | 'acknowledged' | 'rejected' | 'failed'
export type DataCategory = 'demographic' | 'clinical' | 'laboratory' | 'pharmacy' | 'vaccination' | 'epidemiological' | 'insurance'

export interface ECOWASCountry {
  code: string
  name: string
  nameFr: string
  healthMinistry: string
  fhirEndpoint: string
  borderStatus: BorderStatus
  lastExchange: string | null
  totalExchanges: number
  agreementStatus: 'active' | 'pending' | 'none'
  supportedProtocols: ExchangeProtocol[]
  languages: string[]
  healthAlertCount: number
}

export interface CrossBorderExchange {
  id: string
  direction: CrossBorderDirection
  sourceCountry: string
  sourceCountryCode: string
  sourceFacility: string
  targetCountry: string
  targetCountryCode: string
  targetFacility: string
  patientId: string
  patientName: string
  patientNationalId: string
  dataCategories: DataCategory[]
  protocol: ExchangeProtocol
  fhirBundleId: string | null
  status: CrossBorderStatus
  consentId: string
  consentDate: string
  authorizedBy: string
  authorizedAt: string
  sentAt: string | null
  receivedAt: string | null
  acknowledgedAt: string | null
  errorMessage: string | null
  dataEncryption: 'AES-256' | 'TLS-1.3'
  retentionDays: number
  expiresAt: string
  purpose: 'treatment' | 'public-health' | 'referral' | 'repatriation'
  clinicalSummary: string
  relatedAlertId: string | null
}

export interface ECOWASHealthAlert {
  id: string
  disease: string
  diseaseCode: string
  sourceCountry: string
  sourceCountryCode: string
  affectedRegions: string[]
  caseCount: number
  deathCount: number
  alertLevel: 'information' | 'warning' | 'emergency'
  issuedAt: string
  expiresAt: string
  whoNotified: boolean
  responseMeasures: string[]
  guineaRiskLevel: 'low' | 'moderate' | 'high' | 'critical'
}

export interface CrossBorderMetrics {
  totalExchanges: number
  successfulExchanges: number
  pendingExchanges: number
  failedExchanges: number
  activeAgreements: number
  totalCountries: number
  healthAlertsActive: number
  averageProcessingTime: string
  exchangesByCountry: Record<string, number>
  exchangesByCategory: Record<DataCategory, number>
}

/* ─────────── ECOWAS Countries ─────────── */

export const ECOWAS_COUNTRIES: ECOWASCountry[] = [
  {
    code: 'SN', name: 'Senegal', nameFr: 'Sénégal',
    healthMinistry: 'Ministère de la Santé et de l\'Action Sociale',
    fhirEndpoint: 'https://fhir.sante.gouv.sn/fhir',
    borderStatus: 'open',
    lastExchange: new Date(Date.now() - 86400000).toISOString(),
    totalExchanges: 89,
    agreementStatus: 'active',
    supportedProtocols: ['FHIR-R4', 'WHO-IDSR'],
    languages: ['fr', 'wo'],
    healthAlertCount: 1,
  },
  {
    code: 'ML', name: 'Mali', nameFr: 'Mali',
    healthMinistry: 'Ministère de la Santé et de l\'Hygiène Publique',
    fhirEndpoint: 'https://fhir.sante.gov.ml/fhir',
    borderStatus: 'open',
    lastExchange: new Date(Date.now() - 172800000).toISOString(),
    totalExchanges: 156,
    agreementStatus: 'active',
    supportedProtocols: ['FHIR-R4', 'HL7v2'],
    languages: ['fr', 'bm'],
    healthAlertCount: 2,
  },
  {
    code: 'CI', name: 'Ivory Coast', nameFr: 'Côte d\'Ivoire',
    healthMinistry: 'Ministère de la Santé et de l\'Hygiène Publique',
    fhirEndpoint: 'https://fhir.sante.ci/fhir',
    borderStatus: 'open',
    lastExchange: new Date(Date.now() - 259200000).toISOString(),
    totalExchanges: 67,
    agreementStatus: 'active',
    supportedProtocols: ['FHIR-R4'],
    languages: ['fr'],
    healthAlertCount: 0,
  },
  {
    code: 'SL', name: 'Sierra Leone', nameFr: 'Sierra Leone',
    healthMinistry: 'Ministry of Health and Sanitation',
    fhirEndpoint: 'https://fhir.health.gov.sl/fhir',
    borderStatus: 'restricted',
    lastExchange: new Date(Date.now() - 604800000).toISOString(),
    totalExchanges: 34,
    agreementStatus: 'active',
    supportedProtocols: ['FHIR-R4', 'WHO-IDSR'],
    languages: ['en'],
    healthAlertCount: 1,
  },
  {
    code: 'LR', name: 'Liberia', nameFr: 'Libéria',
    healthMinistry: 'Ministry of Health',
    fhirEndpoint: 'https://fhir.moh.gov.lr/fhir',
    borderStatus: 'open',
    lastExchange: new Date(Date.now() - 432000000).toISOString(),
    totalExchanges: 23,
    agreementStatus: 'active',
    supportedProtocols: ['FHIR-R4'],
    languages: ['en'],
    healthAlertCount: 0,
  },
  {
    code: 'GN-B', name: 'Guinea-Bissau', nameFr: 'Guinée-Bissau',
    healthMinistry: 'Ministério da Saúde Pública',
    fhirEndpoint: 'https://fhir.saude.gov.gw/fhir',
    borderStatus: 'restricted',
    lastExchange: new Date(Date.now() - 864000000).toISOString(),
    totalExchanges: 12,
    agreementStatus: 'pending',
    supportedProtocols: ['WHO-IDSR'],
    languages: ['pt'],
    healthAlertCount: 0,
  },
]

/* ─────────── Cross-Border Service ─────────── */

class CrossBorderService {
  private exchanges: CrossBorderExchange[] = []
  private alerts: ECOWASHealthAlert[] = []

  constructor() {
    this.initializeDemoData()
  }

  private initializeDemoData() {
    this.exchanges = [
      {
        id: 'CB-001',
        direction: 'outbound',
        sourceCountry: 'Guinée',
        sourceCountryCode: 'GN',
        sourceFacility: 'Hôpital National Donka',
        targetCountry: 'Sénégal',
        targetCountryCode: 'SN',
        targetFacility: 'Hôpital Principal de Dakar',
        patientId: 'P-2024-003',
        patientName: 'Fatoumata Camara',
        patientNationalId: 'GN-1990-1122-FC',
        dataCategories: ['demographic', 'clinical', 'vaccination'],
        protocol: 'FHIR-R4',
        fhirBundleId: 'hf-cb-bundle-001',
        status: 'acknowledged',
        consentId: 'CB-CONSENT-001',
        consentDate: '2026-05-08',
        authorizedBy: 'Dr. Mamadou Diallo',
        authorizedAt: '2026-05-08T10:00:00Z',
        sentAt: '2026-05-08T10:01:00Z',
        receivedAt: '2026-05-08T10:01:05Z',
        acknowledgedAt: '2026-05-08T10:01:10Z',
        errorMessage: null,
        dataEncryption: 'AES-256',
        retentionDays: 90,
        expiresAt: '2026-08-08T10:01:00Z',
        purpose: 'referral',
        clinicalSummary: 'Patient avec antécédents de paludisme sévère. Référé pour évaluation neurologique spécialisée non disponible en Guinée.',
        relatedAlertId: null,
      },
      {
        id: 'CB-002',
        direction: 'inbound',
        sourceCountry: 'Mali',
        sourceCountryCode: 'ML',
        sourceFacility: 'Hôpital Gabriel Touré, Bamako',
        targetCountry: 'Guinée',
        targetCountryCode: 'GN',
        targetFacility: 'Hôpital régional de Kankan',
        patientId: 'ML-PAT-789',
        patientName: 'Ibrahim Keita',
        patientNationalId: 'ML-1985-0605-IK',
        dataCategories: ['demographic', 'clinical', 'laboratory', 'vaccination'],
        protocol: 'FHIR-R4',
        fhirBundleId: 'hf-cb-bundle-002',
        status: 'delivered',
        consentId: 'CB-CONSENT-002',
        consentDate: '2026-05-10',
        authorizedBy: 'Dr. Traoré (Mali)',
        authorizedAt: '2026-05-10T14:00:00Z',
        sentAt: '2026-05-10T14:01:00Z',
        receivedAt: '2026-05-10T14:01:15Z',
        acknowledgedAt: null,
        errorMessage: null,
        dataEncryption: 'TLS-1.3',
        retentionDays: 90,
        expiresAt: '2026-08-10T14:01:00Z',
        purpose: 'treatment',
        clinicalSummary: 'Citoyen malien en transit à Kankan. Consultation pour fièvre prolongée. Bilan malien: paludisme négatif, sérologie VIH positive.',
        relatedAlertId: null,
      },
      {
        id: 'CB-003',
        direction: 'outbound',
        sourceCountry: 'Guinée',
        sourceCountryCode: 'GN',
        sourceFacility: 'DNS Guinea — Direction Nationale de la Santé',
        targetCountry: 'Mali',
        targetCountryCode: 'ML',
        targetFacility: 'Direction Nationale de la Santé du Mali',
        patientId: 'N/A',
        patientName: 'Alerte épidémiologique',
        patientNationalId: 'N/A',
        dataCategories: ['epidemiological'],
        protocol: 'WHO-IDSR',
        fhirBundleId: null,
        status: 'delivered',
        consentId: 'CB-CONSENT-EPI',
        consentDate: '2026-05-09',
        authorizedBy: 'DNS Guinea',
        authorizedAt: '2026-05-09T12:00:00Z',
        sentAt: '2026-05-09T12:01:00Z',
        receivedAt: '2026-05-09T12:01:03Z',
        acknowledgedAt: null,
        errorMessage: null,
        dataEncryption: 'TLS-1.3',
        retentionDays: 365,
        expiresAt: '2027-05-09T12:01:00Z',
        purpose: 'public-health',
        clinicalSummary: 'Signalement épidémiologique: Cluster de choléra à Conakry, 5 cas confirmés. Mesures de contrôle en cours. Demande de vigilance renforcée aux postes frontières.',
        relatedAlertId: 'ALERT-CB-001',
      },
    ]

    this.alerts = [
      {
        id: 'ALERT-CB-001',
        disease: 'Choléra',
        diseaseCode: 'A00',
        sourceCountry: 'Guinée',
        sourceCountryCode: 'GN',
        affectedRegions: ['Conakry', 'Kindia'],
        caseCount: 5,
        deathCount: 0,
        alertLevel: 'warning',
        issuedAt: '2026-05-09T12:00:00Z',
        expiresAt: '2026-06-09T12:00:00Z',
        whoNotified: true,
        responseMeasures: ['Vaccination orale', 'Chloration eau', 'Sensibilisation communautaire', 'Surveillance renforcée frontières'],
        guineaRiskLevel: 'high',
      },
      {
        id: 'ALERT-CB-002',
        disease: 'Fièvre de Lassa',
        diseaseCode: 'A96.2',
        sourceCountry: 'Mali',
        sourceCountryCode: 'ML',
        affectedRegions: ['Bamako', 'Koulikoro'],
        caseCount: 3,
        deathCount: 1,
        alertLevel: 'emergency',
        issuedAt: '2026-05-07T08:00:00Z',
        expiresAt: '2026-06-07T08:00:00Z',
        whoNotified: true,
        responseMeasures: ['Isolement des cas', 'Protection du personnel', 'Dératisation', 'Surveillance des contacts'],
        guineaRiskLevel: 'moderate',
      },
      {
        id: 'ALERT-CB-003',
        disease: 'Rougeole',
        diseaseCode: 'B05',
        sourceCountry: 'Sierra Leone',
        sourceCountryCode: 'SL',
        affectedRegions: ['Freetown', 'Bo'],
        caseCount: 28,
        deathCount: 2,
        alertLevel: 'warning',
        issuedAt: '2026-05-05T14:00:00Z',
        expiresAt: '2026-06-05T14:00:00Z',
        whoNotified: false,
        responseMeasures: ['Campagne vaccination d\'urgence', 'Surveillance transfrontalière'],
        guineaRiskLevel: 'moderate',
      },
    ]
  }

  getExchanges(filters?: { direction?: CrossBorderDirection; status?: CrossBorderStatus; country?: string }): CrossBorderExchange[] {
    let results = this.exchanges
    if (filters?.direction) results = results.filter((e) => e.direction === filters.direction)
    if (filters?.status) results = results.filter((e) => e.status === filters.status)
    if (filters?.country) results = results.filter((e) => e.sourceCountryCode === filters.country || e.targetCountryCode === filters.country)
    return results
  }

  getAlerts(): ECOWASHealthAlert[] {
    return this.alerts
  }

  getCountries(): ECOWASCountry[] {
    return ECOWAS_COUNTRIES
  }

  getMetrics(): CrossBorderMetrics {
    const total = this.exchanges.length
    const successful = this.exchanges.filter((e) => ['delivered', 'acknowledged'].includes(e.status)).length
    const pending = this.exchanges.filter((e) => e.status === 'pending' || e.status === 'authorized').length
    const failed = this.exchanges.filter((e) => e.status === 'failed' || e.status === 'rejected').length

    const exchangesByCountry: Record<string, number> = {}
    const exchangesByCategory: Record<DataCategory, number> = {
      demographic: 0, clinical: 0, laboratory: 0, pharmacy: 0, vaccination: 0, epidemiological: 0, insurance: 0,
    }

    this.exchanges.forEach((e) => {
      const key = e.direction === 'outbound' ? e.targetCountry : e.sourceCountry
      exchangesByCountry[key] = (exchangesByCountry[key] || 0) + 1
      e.dataCategories.forEach((c) => { exchangesByCategory[c]++ })
    })

    return {
      totalExchanges: total,
      successfulExchanges: successful,
      pendingExchanges: pending,
      failedExchanges: failed,
      activeAgreements: ECOWAS_COUNTRIES.filter((c) => c.agreementStatus === 'active').length,
      totalCountries: ECOWAS_COUNTRIES.length,
      healthAlertsActive: this.alerts.filter((a) => new Date(a.expiresAt) > new Date()).length,
      averageProcessingTime: '3.5 min',
      exchangesByCountry,
      exchangesByCategory,
    }
  }
}

export const crossBorderService = new CrossBorderService()
