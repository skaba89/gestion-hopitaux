// HealthFlow Africa - Guinea National Health System Integrations
// DHIS2, SNIS, mTrac, National Patient Registry, SANTEP Card

/* ─────────── DHIS2 Integration ─────────── */

export interface DHIS2Config {
  baseUrl: string
  username: string
  password: string
  organisationUnit: string
  datasetId: string
}

export interface DHIS2DataValue {
  dataElement: string
  categoryOptionCombo: string
  value: string
}

export interface DHIS2DataValueSet {
  dataSet: string
  period: string
  orgUnit: string
  completeDate: string
  dataValues: DHIS2DataValue[]
  attributeOptionCombo?: string
}

export interface DHIS2Report {
  id: string
  period: string
  orgUnitName: string
  orgUnitCode: string
  status: 'draft' | 'submitted' | 'accepted' | 'rejected'
  submittedAt: string | null
  acceptedAt: string | null
  dataValues: DHIS2DataValue[]
  generatedAt: string
}

// DHIS2 Data Elements for Guinea health reporting
export const DHIS2_DATA_ELEMENTS = {
  // Consultations
  totalConsultations: { id: 'DE-CONS-001', name: 'Total consultations' },
  newConsultations: { id: 'DE-CONS-002', name: 'Nouvelles consultations' },
  followUpConsultations: { id: 'DE-CONS-003', name: 'Consultations de suivi' },
  // Pathologies
  malariaCases: { id: 'DE-PATH-001', name: 'Cas de paludisme' },
  malariaSevere: { id: 'DE-PATH-002', name: 'Paludisme sévère' },
  malariaSimple: { id: 'DE-PATH-003', name: 'Paludisme simple' },
  diarrheaCases: { id: 'DE-PATH-004', name: 'Cas de diarrhée' },
  respiratoryInfections: { id: 'DE-PATH-005', name: 'Infections respiratoires aiguës' },
  hypertensionCases: { id: 'DE-PATH-006', name: 'Cas d\'hypertension' },
  diabetesCases: { id: 'DE-PATH-007', name: 'Cas de diabète' },
  hepatitisBCases: { id: 'DE-PATH-008', name: 'Cas d\'hépatite B' },
  strokeCases: { id: 'DE-PATH-009', name: 'Cas d\'AVC' },
  // Maternal health
  antenatalVisits: { id: 'DE-MAT-001', name: 'Visites prénatales' },
  deliveries: { id: 'DE-MAT-002', name: 'Accouchements' },
  cSections: { id: 'DE-MAT-003', name: 'Césariennes' },
  maternalDeaths: { id: 'DE-MAT-004', name: 'Décès maternels' },
  // Child health
  vaccinatedChildren: { id: 'DE-CHILD-001', name: 'Enfants vaccinés' },
  bCGVaccinations: { id: 'DE-CHILD-002', name: 'Vaccinations BCG' },
  dtpVaccinations: { id: 'DE-CHILD-003', name: 'Vaccinations DTC' },
  malnutritionCases: { id: 'DE-CHILD-004', name: 'Cas de malnutrition' },
  // Laboratory
  labTestsPerformed: { id: 'DE-LAB-001', name: 'Examens de laboratoire réalisés' },
  labTestsPositive: { id: 'DE-LAB-002', name: 'Examens positifs' },
  // Pharmacy
  prescriptionsDispensed: { id: 'DE-PHARM-001', name: 'Ordonnances dispensées' },
  stockoutsReported: { id: 'DE-PHARM-002', name: 'Ruptures de stock signalées' },
  // Emergency
  emergencyCases: { id: 'DE-EMER-001', name: 'Cas d\'urgence' },
  emergencyDeaths: { id: 'DE-EMER-002', name: 'Décès aux urgences' },
  // Financial
  totalRevenue: { id: 'DE-FIN-001', name: 'Revenus totaux (GNF)' },
  mobileMoneyPayments: { id: 'DE-FIN-002', name: 'Paiements Mobile Money' },
  insuranceClaims: { id: 'DE-FIN-003', name: 'Réclamations assurance' },
} as const

// Period format helpers
export function toDHIS2Period(date: Date, type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')

  switch (type) {
    case 'daily': return `${y}${m}${d}`
    case 'weekly': {
      const start = new Date(y, 0, 1)
      const diff = date.getTime() - start.getTime()
      const weekNum = Math.ceil((diff / 86400000 + start.getDay() + 1) / 7)
      return `${y}W${String(weekNum).padStart(2, '0')}`
    }
    case 'monthly': return `${y}${m}`
    case 'quarterly': {
      const q = Math.ceil((date.getMonth() + 1) / 3)
      return `${y}Q${q}`
    }
    case 'yearly': return `${y}`
  }
}

// Generate DHIS2 report from HealthFlow data
export function generateDHIS2Report(
  period: string,
  orgUnit: string,
  data: {
    consultations: number
    newPatients: number
    followUps: number
    malariaCases: number
    malariaSevere: number
    diarrheaCases: number
    respiratoryInfections: number
    hypertensionCases: number
    diabetesCases: number
    antenatalVisits: number
    deliveries: number
    emergencyCases: number
    labTests: number
    revenue: number
    mobileMoneyPayments: number
  }
): DHIS2DataValueSet {
  return {
    dataSet: 'DS-HF-REPORT',
    period,
    orgUnit,
    completeDate: new Date().toISOString().split('T')[0],
    dataValues: [
      { dataElement: DHIS2_DATA_ELEMENTS.totalConsultations.id, categoryOptionCombo: 'COC-DEFAULT', value: String(data.consultations) },
      { dataElement: DHIS2_DATA_ELEMENTS.newConsultations.id, categoryOptionCombo: 'COC-DEFAULT', value: String(data.newPatients) },
      { dataElement: DHIS2_DATA_ELEMENTS.followUpConsultations.id, categoryOptionCombo: 'COC-DEFAULT', value: String(data.followUps) },
      { dataElement: DHIS2_DATA_ELEMENTS.malariaCases.id, categoryOptionCombo: 'COC-DEFAULT', value: String(data.malariaCases) },
      { dataElement: DHIS2_DATA_ELEMENTS.malariaSevere.id, categoryOptionCombo: 'COC-DEFAULT', value: String(data.malariaSevere) },
      { dataElement: DHIS2_DATA_ELEMENTS.diarrheaCases.id, categoryOptionCombo: 'COC-DEFAULT', value: String(data.diarrheaCases) },
      { dataElement: DHIS2_DATA_ELEMENTS.respiratoryInfections.id, categoryOptionCombo: 'COC-DEFAULT', value: String(data.respiratoryInfections) },
      { dataElement: DHIS2_DATA_ELEMENTS.hypertensionCases.id, categoryOptionCombo: 'COC-DEFAULT', value: String(data.hypertensionCases) },
      { dataElement: DHIS2_DATA_ELEMENTS.diabetesCases.id, categoryOptionCombo: 'COC-DEFAULT', value: String(data.diabetesCases) },
      { dataElement: DHIS2_DATA_ELEMENTS.antenatalVisits.id, categoryOptionCombo: 'COC-DEFAULT', value: String(data.antenatalVisits) },
      { dataElement: DHIS2_DATA_ELEMENTS.deliveries.id, categoryOptionCombo: 'COC-DEFAULT', value: String(data.deliveries) },
      { dataElement: DHIS2_DATA_ELEMENTS.emergencyCases.id, categoryOptionCombo: 'COC-DEFAULT', value: String(data.emergencyCases) },
      { dataElement: DHIS2_DATA_ELEMENTS.labTestsPerformed.id, categoryOptionCombo: 'COC-DEFAULT', value: String(data.labTests) },
      { dataElement: DHIS2_DATA_ELEMENTS.totalRevenue.id, categoryOptionCombo: 'COC-DEFAULT', value: String(data.revenue) },
      { dataElement: DHIS2_DATA_ELEMENTS.mobileMoneyPayments.id, categoryOptionCombo: 'COC-DEFAULT', value: String(data.mobileMoneyPayments) },
    ],
  }
}

/* ─────────── SNIS (Système National d'Information Sanitaire) ─────────── */

export interface SNISReport {
  id: string
  period: string
  facilityName: string
  facilityCode: string
  healthZone: string
  reportType: 'monthly' | 'quarterly' | 'annual'
  indicators: SNISIndicator[]
  status: 'brouillon' | 'soumis' | 'validé' | 'rejeté'
  submittedBy: string
  submittedAt: string | null
  validatedBy: string | null
  validatedAt: string | null
  comments: string[]
}

export interface SNISIndicator {
  code: string
  name: string
  category: string
  value: number
  target: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  previousValue: number
}

export const SNIS_INDICATORS = {
  consultationRate: { code: 'SNIS-001', name: 'Taux de consultation', category: 'Activité', unit: '%', target: 85 },
  malariaIncidence: { code: 'SNIS-002', name: 'Incidence paludisme', category: 'Morbidité', unit: '‰', target: 50 },
  maternalMortality: { code: 'SNIS-003', name: 'Mortalité maternelle', category: 'Mortalité', unit: '‰', target: 2 },
  infantMortality: { code: 'SNIS-004', name: 'Mortalité infantile', category: 'Mortalité', unit: '‰', target: 10 },
  vaccinationCoverage: { code: 'SNIS-005', name: 'Couverture vaccinale DTC3', category: 'Prévention', unit: '%', target: 90 },
  hivTestingRate: { code: 'SNIS-006', name: 'Taux de dépistage VIH', category: 'Prévention', unit: '%', target: 75 },
  bedOccupancyRate: { code: 'SNIS-007', name: 'Taux d\'occupation des lits', category: 'Infrastructure', unit: '%', target: 80 },
  labUtilization: { code: 'SNIS-008', name: 'Taux d\'utilisation laboratoire', category: 'Activité', unit: '%', target: 60 },
  stockoutRate: { code: 'SNIS-009', name: 'Taux de rupture de stock', category: 'Pharmacie', unit: '%', target: 5 },
  revenuePerPatient: { code: 'SNIS-010', name: 'Revenu par patient', category: 'Finances', unit: 'GNF', target: 25000 },
} as const

/* ─────────── mTrac Integration (Mobile Surveillance) ─────────── */

export interface MTracAlert {
  id: string
  disease: string
  location: string
  healthZone: string
  caseCount: number
  deathCount: number
  alertLevel: 'info' | 'warning' | 'critical'
  reportedBy: string
  reportedAt: string
  verifiedAt: string | null
  verifiedBy: string | null
  responseStatus: 'pending' | 'investigating' | 'responding' | 'resolved'
  responseActions: string[]
}

export interface MTracWeeklyReport {
  id: string
  week: string
  orgUnit: string
  diseases: {
    name: string
    casesUnder5: number
    casesOver5: number
    deathsUnder5: number
    deathsOver5: number
  }[]
  submittedAt: string
  status: 'pending' | 'submitted'
}

export const MTRAC_DISEASES = [
  'Paludisme', 'Diarrhée', 'IRA', 'Fièvre typhoïde', 'Choléra',
  'Méningite', 'Rougeole', 'Fièvre jaune', 'Tuberculose', 'VIH/SIDA',
  'Hépatite B', 'Malnutrition sévère', 'Tétanos', 'Rage',
] as const

/* ─────────── SANTEP Card (Carte Santé Électronique) ─────────── */

export interface SANTEPCard {
  id: string
  cardNumber: string
  patientId: string
  patientName: string
  dateOfBirth: string
  gender: 'M' | 'F'
  bloodType: string
  allergies: string[]
  vitalConditions: string[]
  emergencyContact: string
  emergencyPhone: string
  insuranceProvider: string | null
  insurancePolicyNumber: string | null
  issuedAt: string
  expiresAt: string
  qrCodeData: string
  nfcEnabled: boolean
  isActive: boolean
  lastUpdated: string
}

/* ─────────── National Patient Registry ─────────── */

export interface NationalPatientRecord {
  nationalId: string
  healthId: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: 'M' | 'F'
  birthPlace: string
  phone: string
  address: string
  healthZone: string
  registeredAt: string
  registeredFacility: string
  lastFacility: string
  totalVisits: number
  activeProblems: string[]
  vaccinationStatus: 'complete' | 'partial' | 'unknown'
  insuranceStatus: 'insured' | 'uninsured' | 'unknown'
  santeCard: string | null
}

/* ─────────── Integration Service ─────────── */

export interface IntegrationStatus {
  id: string
  name: string
  type: 'dhis2' | 'snis' | 'mtrac' | 'santep' | 'registry' | 'hie'
  status: 'connected' | 'syncing' | 'error' | 'disconnected'
  lastSync: string | null
  nextSync: string | null
  syncInterval: string
  recordsSynced: number
  recordsPending: number
  lastError: string | null
  version: string
  icon: string
}

export const INTEGRATION_STATUSES: IntegrationStatus[] = [
  {
    id: 'dhis2',
    name: 'DHIS2 Guinea',
    type: 'dhis2',
    status: 'connected',
    lastSync: new Date(Date.now() - 1800000).toISOString(),
    nextSync: new Date(Date.now() + 1800000).toISOString(),
    syncInterval: '30 min',
    recordsSynced: 2456,
    recordsPending: 12,
    lastError: null,
    version: '2.40.2',
    icon: '📊',
  },
  {
    id: 'snis',
    name: 'SNIS National',
    type: 'snis',
    status: 'connected',
    lastSync: new Date(Date.now() - 3600000).toISOString(),
    nextSync: new Date(Date.now() + 82800000).toISOString(),
    syncInterval: 'Journalier',
    recordsSynced: 365,
    recordsPending: 0,
    lastError: null,
    version: '3.1',
    icon: '📋',
  },
  {
    id: 'mtrac',
    name: 'mTrac Surveillance',
    type: 'mtrac',
    status: 'connected',
    lastSync: new Date(Date.now() - 600000).toISOString(),
    nextSync: new Date(Date.now() + 600000).toISOString(),
    syncInterval: '10 min',
    recordsSynced: 8923,
    recordsPending: 3,
    lastError: null,
    version: '4.2',
    icon: '🔔',
  },
  {
    id: 'santep',
    name: 'SANTEP Card',
    type: 'santep',
    status: 'connected',
    lastSync: new Date(Date.now() - 7200000).toISOString(),
    nextSync: new Date(Date.now() + 7200000).toISOString(),
    syncInterval: '2 heures',
    recordsSynced: 1567,
    recordsPending: 5,
    lastError: null,
    version: '1.5',
    icon: '💳',
  },
  {
    id: 'registry',
    name: 'Registre National des Patients',
    type: 'registry',
    status: 'syncing',
    lastSync: new Date(Date.now() - 300000).toISOString(),
    nextSync: new Date(Date.now() + 300000).toISOString(),
    syncInterval: '5 min',
    recordsSynced: 4521,
    recordsPending: 89,
    lastError: null,
    version: '2.0',
    icon: '🗄️',
  },
  {
    id: 'hie',
    name: 'Health Information Exchange',
    type: 'hie',
    status: 'connected',
    lastSync: new Date(Date.now() - 120000).toISOString(),
    nextSync: new Date(Date.now() + 120000).toISOString(),
    syncInterval: '2 min',
    recordsSynced: 7834,
    recordsPending: 2,
    lastError: null,
    version: '1.0',
    icon: '🔄',
  },
]

/* ─────────── Demo Data ─────────── */

export const demoSNISReports: SNISReport[] = [
  {
    id: 'SNIS-2026-04',
    period: '2026-04',
    facilityName: 'Hôpital National Donka',
    facilityCode: 'DONKA',
    healthZone: 'Conakry',
    reportType: 'monthly',
    indicators: [
      { code: 'SNIS-001', name: 'Taux de consultation', category: 'Activité', value: 78, target: 85, unit: '%', trend: 'up', previousValue: 72 },
      { code: 'SNIS-002', name: 'Incidence paludisme', category: 'Morbidité', value: 45, target: 50, unit: '‰', trend: 'down', previousValue: 52 },
      { code: 'SNIS-003', name: 'Mortalité maternelle', category: 'Mortalité', value: 3.2, target: 2, unit: '‰', trend: 'up', previousValue: 2.8 },
      { code: 'SNIS-004', name: 'Mortalité infantile', category: 'Mortalité', value: 12, target: 10, unit: '‰', trend: 'stable', previousValue: 12 },
      { code: 'SNIS-005', name: 'Couverture vaccinale DTC3', category: 'Prévention', value: 82, target: 90, unit: '%', trend: 'up', previousValue: 76 },
      { code: 'SNIS-006', name: 'Taux de dépistage VIH', category: 'Prévention', value: 68, target: 75, unit: '%', trend: 'up', previousValue: 61 },
      { code: 'SNIS-007', name: "Taux d'occupation des lits", category: 'Infrastructure', value: 85, target: 80, unit: '%', trend: 'up', previousValue: 79 },
      { code: 'SNIS-008', name: "Taux d'utilisation laboratoire", category: 'Activité', value: 55, target: 60, unit: '%', trend: 'up', previousValue: 48 },
      { code: 'SNIS-009', name: 'Taux de rupture de stock', category: 'Pharmacie', value: 8, target: 5, unit: '%', trend: 'down', previousValue: 6 },
      { code: 'SNIS-010', name: 'Revenu par patient', category: 'Finances', value: 22000, target: 25000, unit: 'GNF', trend: 'up', previousValue: 19000 },
    ],
    status: 'soumis',
    submittedBy: 'Dr. Mamadou Diallo',
    submittedAt: '2026-05-02T10:00:00Z',
    validatedBy: null,
    validatedAt: null,
    comments: ['Rapport mensuel avril 2026 — en attente de validation nationale'],
  },
]

export const demoMTracAlerts: MTracAlert[] = [
  {
    id: 'MTRAC-001',
    disease: 'Choléra',
    location: 'Conakry, Matam',
    healthZone: 'Conakry',
    caseCount: 5,
    deathCount: 0,
    alertLevel: 'warning',
    reportedBy: 'ASC Moussa Condé',
    reportedAt: '2026-05-09T08:00:00Z',
    verifiedAt: '2026-05-09T10:00:00Z',
    verifiedBy: 'Dr. Keita',
    responseStatus: 'investigating',
    responseActions: ['Équipe de réponse déployée', 'Échantillons envoyés au labo', 'Sensibilisation communautaire'],
  },
  {
    id: 'MTRAC-002',
    disease: 'Rougeole',
    location: 'Kindia',
    healthZone: 'Kindia',
    caseCount: 12,
    deathCount: 1,
    alertLevel: 'critical',
    reportedBy: 'ASC Fatoumata Bah',
    reportedAt: '2026-05-07T14:00:00Z',
    verifiedAt: '2026-05-07T16:00:00Z',
    verifiedBy: 'Dr. Touré',
    responseStatus: 'responding',
    responseActions: ['Campagne de vaccination d\'urgence', 'Isolation des cas', 'Investigation épidémiologique'],
  },
  {
    id: 'MTRAC-003',
    disease: 'Méningite',
    location: "N'Zérékoré",
    healthZone: "N'Zérékoré",
    caseCount: 3,
    deathCount: 1,
    alertLevel: 'warning',
    reportedBy: 'Dr. Bangoura',
    reportedAt: '2026-05-08T09:00:00Z',
    verifiedAt: null,
    verifiedBy: null,
    responseStatus: 'pending',
    responseActions: [],
  },
  {
    id: 'MTRAC-004',
    disease: 'Paludisme',
    location: 'Kankan',
    healthZone: 'Kankan',
    caseCount: 45,
    deathCount: 2,
    alertLevel: 'info',
    reportedBy: 'Centre de santé Kankan',
    reportedAt: '2026-05-06T07:00:00Z',
    verifiedAt: '2026-05-06T08:00:00Z',
    verifiedBy: 'Dr. Camara',
    responseStatus: 'resolved',
    responseActions: ['Distribution moustiquaires', 'Traitement ACT', 'Suivi mensuel'],
  },
]

export const demoSANTEPCards: SANTEPCard[] = [
  {
    id: 'STP-001',
    cardNumber: 'SANTEP-2024-0001',
    patientId: 'P-2024-001',
    patientName: 'Aminata Diallo',
    dateOfBirth: '1998-03-15',
    gender: 'F',
    bloodType: 'O+',
    allergies: ['Pénicilline (Critique)', 'Sulfamides (Majeur)'],
    vitalConditions: ['Paludisme sévère', 'Anémie ferriprive'],
    emergencyContact: 'Mamadou Diallo',
    emergencyPhone: '+224 622 99 88 77',
    insuranceProvider: 'SONAR Assurance',
    insurancePolicyNumber: 'SON-2024-001234',
    issuedAt: '2024-01-15',
    expiresAt: '2029-01-15',
    qrCodeData: 'SANTEP://GN/P-2024-001/QR-AD-281998',
    nfcEnabled: true,
    isActive: true,
    lastUpdated: '2026-05-10',
  },
  {
    id: 'STP-002',
    cardNumber: 'SANTEP-2024-0002',
    patientId: 'P-2024-002',
    patientName: 'Mamadou Condé',
    dateOfBirth: '1980-07-22',
    gender: 'M',
    bloodType: 'A+',
    allergies: ['Aspirine (Mineur)'],
    vitalConditions: ['Hypertension artérielle', 'Hypercholestérolémie'],
    emergencyContact: 'Fatoumata Condé',
    emergencyPhone: '+224 623 55 66 77',
    insuranceProvider: 'CGM Guinée',
    insurancePolicyNumber: 'CGM-2023-005678',
    issuedAt: '2024-02-20',
    expiresAt: '2029-02-20',
    qrCodeData: 'SANTEP://GN/P-2024-002/QR-MC-121980',
    nfcEnabled: true,
    isActive: true,
    lastUpdated: '2026-05-10',
  },
]

export const demoNationalRegistry: NationalPatientRecord[] = [
  {
    nationalId: 'GN-1998-0315-FD',
    healthId: 'HF-GN-001',
    firstName: 'Aminata',
    lastName: 'Diallo',
    dateOfBirth: '1998-03-15',
    gender: 'F',
    birthPlace: 'Conakry',
    phone: '+224 622 11 22 33',
    address: 'Conakry, Kaloum',
    healthZone: 'conakry',
    registeredAt: '2024-01-15',
    registeredFacility: 'Hôpital National Donka',
    lastFacility: 'Hôpital National Donka',
    totalVisits: 12,
    activeProblems: ['Paludisme sévère', 'Anémie ferriprive'],
    vaccinationStatus: 'complete',
    insuranceStatus: 'insured',
    santeCard: 'SANTEP-2024-0001',
  },
  {
    nationalId: 'GN-1980-0722-MC',
    healthId: 'HF-GN-002',
    firstName: 'Mamadou',
    lastName: 'Condé',
    dateOfBirth: '1980-07-22',
    gender: 'M',
    birthPlace: 'Conakry',
    phone: '+224 623 44 55 66',
    address: 'Conakry, Dixinn',
    healthZone: 'conakry',
    registeredAt: '2024-02-20',
    registeredFacility: 'Hôpital National Donka',
    lastFacility: 'Hôpital National Donka',
    totalVisits: 8,
    activeProblems: ['Hypertension artérielle', 'Hypercholestérolémie'],
    vaccinationStatus: 'complete',
    insuranceStatus: 'insured',
    santeCard: 'SANTEP-2024-0002',
  },
  {
    nationalId: 'GN-1972-0805-OC',
    healthId: 'HF-GN-010',
    firstName: 'Ousmane',
    lastName: 'Camara',
    dateOfBirth: '1972-08-05',
    gender: 'M',
    birthPlace: "N'Zérékoré",
    phone: '+224 621 55 66 77',
    address: "N'Zérékoré",
    healthZone: 'nzerekore',
    registeredAt: '2026-02-20',
    registeredFacility: "Hôpital régional de N'Zérékoré",
    lastFacility: 'Hôpital National Donka',
    totalVisits: 5,
    activeProblems: ['AVC ischémique', 'Hypertension', 'Diabète type 2'],
    vaccinationStatus: 'unknown',
    insuranceStatus: 'insured',
    santeCard: null,
  },
]

/* ─────────── Sync Manager for National Systems ─────────── */

export interface SyncOperation {
  id: string
  integrationId: string
  type: 'push' | 'pull'
  resourceType: string
  recordCount: number
  status: 'queued' | 'in-progress' | 'completed' | 'failed'
  startedAt: string | null
  completedAt: string | null
  errorMessage: string | null
  details: string
}

export const demoSyncOperations: SyncOperation[] = [
  {
    id: 'SYNC-001',
    integrationId: 'dhis2',
    type: 'push',
    resourceType: 'DataValueSet',
    recordCount: 15,
    status: 'completed',
    startedAt: new Date(Date.now() - 1800000).toISOString(),
    completedAt: new Date(Date.now() - 1795000).toISOString(),
    errorMessage: null,
    details: 'Rapport mensuel avril 2026 — 15 indicateurs synchronisés',
  },
  {
    id: 'SYNC-002',
    integrationId: 'registry',
    type: 'push',
    resourceType: 'Patient',
    recordCount: 3,
    status: 'in-progress',
    startedAt: new Date(Date.now() - 60000).toISOString(),
    completedAt: null,
    errorMessage: null,
    details: 'Synchronisation 3 nouveaux patients vers registre national',
  },
  {
    id: 'SYNC-003',
    integrationId: 'mtrac',
    type: 'pull',
    resourceType: 'Alert',
    recordCount: 2,
    status: 'completed',
    startedAt: new Date(Date.now() - 600000).toISOString(),
    completedAt: new Date(Date.now() - 598000).toISOString(),
    errorMessage: null,
    details: '2 alertes mTrac récupérées — Choléra Conakry, Rougeole Kindia',
  },
  {
    id: 'SYNC-004',
    integrationId: 'santep',
    type: 'push',
    resourceType: 'SANTEPCard',
    recordCount: 5,
    status: 'failed',
    startedAt: new Date(Date.now() - 7200000).toISOString(),
    completedAt: new Date(Date.now() - 7190000).toISOString(),
    errorMessage: 'Timeout — serveur SANTEP indisponible',
    details: 'Mise à jour 5 cartes SANTEP — échec de connexion',
  },
  {
    id: 'SYNC-005',
    integrationId: 'snis',
    type: 'push',
    resourceType: 'SNISReport',
    recordCount: 1,
    status: 'completed',
    startedAt: new Date(Date.now() - 3600000).toISOString(),
    completedAt: new Date(Date.now() - 3595000).toISOString(),
    errorMessage: null,
    details: 'Rapport SNIS avril 2026 soumis avec succès',
  },
  {
    id: 'SYNC-006',
    integrationId: 'hie',
    type: 'push',
    resourceType: 'Bundle',
    recordCount: 2,
    status: 'completed',
    startedAt: new Date(Date.now() - 120000).toISOString(),
    completedAt: new Date(Date.now() - 118000).toISOString(),
    errorMessage: null,
    details: '2 dossiers patients envoyés via HIE vers Ignace Deen',
  },
]
