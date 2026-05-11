// HealthFlow Africa - ADT (Admit/Discharge/Transfer) Message Handling
// HL7 v2.x ADT message parsing and FHIR conversion for Guinea hospitals

import type { FHIRPatient, FHIREncounter, FHIRBundle, FHIRReference } from './fhir'
import { GUINEA_FHIR_SYSTEMS, GUINEA_ESTABLISHMENTS } from './fhir'

/* ─────────── ADT Message Types ─────────── */

export type ADTEventType =
  | 'A01' // Admit
  | 'A02' // Transfer
  | 'A03' // Discharge
  | 'A04' // Registration
  | 'A05' // Pre-admit
  | 'A06' // Change from outpatient to inpatient
  | 'A07' // Change from inpatient to outpatient
  | 'A08' // Update information
  | 'A09' // Patient departing
  | 'A10' // Patient arriving
  | 'A11' // Cancel admit
  | 'A12' // Cancel transfer
  | 'A13' // Cancel discharge
  | 'A14' // Pending admit
  | 'A15' // Pending transfer
  | 'A16' // Pending discharge
  | 'A28' // Add person information
  | 'A31' // Update person information

export const ADT_EVENT_LABELS: Record<ADTEventType, string> = {
  A01: 'Admission',
  A02: 'Transfert',
  A03: 'Sortie',
  A04: 'Enregistrement',
  A05: 'Pré-admission',
  A06: 'Hospitalisation (depuis externe)',
  A07: 'Ambulatoire (depuis hospitalisation)',
  A08: 'Mise à jour',
  A09: 'Départ du patient',
  A10: 'Arrivée du patient',
  A11: 'Annulation admission',
  A12: 'Annulation transfert',
  A13: 'Annulation sortie',
  A14: 'Admission en attente',
  A15: 'Transfert en attente',
  A16: 'Sortie en attente',
  A28: 'Ajout personne',
  A31: 'Mise à jour personne',
}

export type ADTMessageStatus = 'pending' | 'processed' | 'error' | 'acknowledged' | 'rejected'

/* ─────────── ADT Message Structure ─────────── */

export interface ADTPatient {
  patientId: string
  nationalId: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: 'M' | 'F'
  phone: string
  address: string
  bloodType: string
  allergies: string[]
  emergencyContact: string
  emergencyPhone: string
}

export interface ADTVisit {
  visitNumber: string
  patientClass: 'inpatient' | 'outpatient' | 'emergency' | 'observation'
  admittingDoctor: string
  referringDoctor: string | null
  department: string
  ward: string
  bed: string | null
  admissionReason: string
  diagnosisCode: string | null
  diagnosisDescription: string | null
  admissionDate: string
  dischargeDate: string | null
  dischargeDisposition: string | null
  expectedLengthOfStay: number | null
  financialClass: string
  insuranceProvider: string | null
  insurancePolicyNumber: string | null
}

export interface ADTMessage {
  id: string
  messageType: ADTEventType
  sendingFacility: string
  sendingFacilityCode: string
  receivingFacility: string
  receivingFacilityCode: string
  messageControlId: string
  timestamp: string
  patient: ADTPatient
  visit: ADTVisit
  status: ADTMessageStatus
  processedAt: string | null
  error: string | null
  fhirBundleId: string | null
  relatedMessageId: string | null
}

/* ─────────── ADT to FHIR Conversion ─────────── */

export function adtToEncounter(msg: ADTMessage): FHIREncounter {
  const statusMap: Record<ADTEventType, FHIREncounter['status']> = {
    A01: 'in-progress',
    A02: 'in-progress',
    A03: 'finished',
    A04: 'arrived',
    A05: 'planned',
    A06: 'in-progress',
    A07: 'in-progress',
    A08: 'in-progress',
    A09: 'in-progress',
    A10: 'arrived',
    A11: 'cancelled',
    A12: 'in-progress',
    A13: 'finished',
    A14: 'planned',
    A15: 'planned',
    A16: 'planned',
    A28: 'planned',
    A31: 'in-progress',
  }

  const classMap: Record<string, { system: string; code: string; display: string }> = {
    inpatient: { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: 'IMP', display: 'inpatient encounter' },
    outpatient: { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: 'AMB', display: 'ambulatory' },
    emergency: { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: 'EMER', display: 'emergency' },
    observation: { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: 'OBSENC', display: 'observation encounter' },
  }

  const encounterClass = classMap[msg.visit.patientClass] || classMap.outpatient

  return {
    resourceType: 'Encounter',
    id: `hf-encounter-adt-${msg.id}`,
    meta: {
      versionId: '1',
      lastUpdated: msg.timestamp,
      profile: ['http://hl7.org/fhir/StructureDefinition/Encounter'],
      tag: [{ system: GUINEA_FHIR_SYSTEMS.healthZone, code: 'conakry', display: 'Conakry' }],
    },
    identifier: [
      {
        use: 'official',
        system: GUINEA_FHIR_SYSTEMS.healthflowId,
        value: msg.visit.visitNumber,
      },
    ],
    status: statusMap[msg.messageType] || 'unknown',
    class: encounterClass,
    type: msg.visit.admissionReason
      ? [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
                code: ADT_EVENT_LABELS[msg.messageType],
              },
            ],
            text: msg.visit.admissionReason,
          },
        ]
      : undefined,
    subject: {
      reference: `Patient/hf-patient-${msg.patient.patientId}`,
      display: `${msg.patient.firstName} ${msg.patient.lastName}`,
    },
    participant: [
      {
        type: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
                code: 'PPRF',
                display: 'primary performer',
              },
            ],
          },
        ],
        individual: { display: msg.visit.admittingDoctor },
      },
    ],
    period: {
      start: msg.visit.admissionDate,
      end: msg.visit.dischargeDate || undefined,
    },
    hospitalization: msg.visit.patientClass === 'inpatient'
      ? {
          admitSource: {
            coding: [{ system: 'http://terminology.hl7.org/CodeSystem/admit-source', code: 'hosp-trans', display: 'Transferred from other hospital' }],
          },
          dischargeDisposition: msg.visit.dischargeDisposition
            ? { text: msg.visit.dischargeDisposition }
            : undefined,
        }
      : undefined,
    location: msg.visit.ward
      ? [
          {
            location: { display: `${msg.visit.department} - ${msg.visit.ward}${msg.visit.bed ? ` Lit ${msg.visit.bed}` : ''}` },
            status: 'active',
          },
        ]
      : undefined,
    serviceProvider: {
      reference: `Organization/hf-org-${msg.sendingFacilityCode}`,
      display: msg.sendingFacility,
    },
  }
}

export function adtToPatient(msg: ADTMessage): FHIRPatient {
  return {
    resourceType: 'Patient',
    id: `hf-patient-${msg.patient.patientId}`,
    meta: {
      versionId: '1',
      lastUpdated: msg.timestamp,
      profile: ['http://hl7.org/fhir/StructureDefinition/Patient'],
    },
    identifier: [
      { use: 'official', system: GUINEA_FHIR_SYSTEMS.healthflowId, value: msg.patient.patientId },
      { use: 'official', system: GUINEA_FHIR_SYSTEMS.nationalId, value: msg.patient.nationalId },
    ],
    active: true,
    name: [{ use: 'official', family: msg.patient.lastName, given: [msg.patient.firstName] }],
    telecom: [{ system: 'phone', value: msg.patient.phone, use: 'mobile' }],
    gender: msg.patient.gender === 'M' ? 'male' : 'female',
    birthDate: msg.patient.dateOfBirth,
    address: [{ use: 'home', type: 'physical', text: msg.patient.address, country: 'GN' }],
  }
}

export function adtToFHIRBundle(msg: ADTMessage): FHIRBundle {
  const patient = adtToPatient(msg)
  const encounter = adtToEncounter(msg)

  return {
    resourceType: 'Bundle',
    id: `hf-adt-bundle-${msg.id}`,
    type: 'message',
    timestamp: msg.timestamp,
    total: 2,
    link: [{ relation: 'self', url: `https://healthflow-gn.com/fhir/Bundle/hf-adt-bundle-${msg.id}` }],
    entry: [
      { fullUrl: `urn:uuid:${patient.id}`, resource: patient },
      { fullUrl: `urn:uuid:${encounter.id}`, resource: encounter },
    ],
    signature: {
      type: [{ system: 'urn:iso-astm:E1762-95:2013', code: '1.2.840.10065.1.12.1.1', display: "Author's Signature" }],
      when: msg.timestamp,
      who: { display: msg.sendingFacility },
      targetFormat: 'application/fhir+json',
      sigFormat: 'application/jose',
    },
  }
}

/* ─────────── ADT Message Service ─────────── */

class ADTMessageService {
  private messages: ADTMessage[] = []

  constructor() {
    this.initializeDemoData()
  }

  private initializeDemoData() {
    this.messages = [
      {
        id: 'ADT-001',
        messageType: 'A01',
        sendingFacility: 'Hôpital National Donka',
        sendingFacilityCode: 'donka',
        receivingFacility: 'Hôpital National Ignace Deen',
        receivingFacilityCode: 'ignace-deen',
        messageControlId: 'MSG-20260510-001',
        timestamp: '2026-05-10T08:30:00Z',
        patient: {
          patientId: 'P-2024-001',
          nationalId: 'GN-1998-0315-FD',
          firstName: 'Aminata',
          lastName: 'Diallo',
          dateOfBirth: '1998-03-15',
          gender: 'F',
          phone: '+224 622 11 22 33',
          address: 'Conakry, Kaloum',
          bloodType: 'O+',
          allergies: ['Pénicilline'],
          emergencyContact: 'Mamadou Diallo',
          emergencyPhone: '+224 622 99 88 77',
        },
        visit: {
          visitNumber: 'VIS-2026-0451',
          patientClass: 'inpatient',
          admittingDoctor: 'Dr. Mamadou Diallo',
          referringDoctor: 'Dr. Touré (CS Dixinn)',
          department: 'Médecine Interne',
          ward: 'Chambre 204',
          bed: '204-A',
          admissionReason: 'Paludisme sévère avec suspicion de myocardite',
          diagnosisCode: 'B54',
          diagnosisDescription: 'Paludisme, non précisé',
          admissionDate: '2026-05-10T08:30:00Z',
          dischargeDate: null,
          dischargeDisposition: null,
          expectedLengthOfStay: 7,
          financialClass: 'Assurance SONAR',
          insuranceProvider: 'SONAR Assurance',
          insurancePolicyNumber: 'SON-2024-001234',
        },
        status: 'acknowledged',
        processedAt: '2026-05-10T08:30:02Z',
        error: null,
        fhirBundleId: 'hf-adt-bundle-ADT-001',
        relatedMessageId: null,
      },
      {
        id: 'ADT-002',
        messageType: 'A02',
        sendingFacility: 'Hôpital National Donka',
        sendingFacilityCode: 'donka',
        receivingFacility: 'Hôpital National Ignace Deen',
        receivingFacilityCode: 'ignace-deen',
        messageControlId: 'MSG-20260510-002',
        timestamp: '2026-05-10T14:00:00Z',
        patient: {
          patientId: 'P-2024-001',
          nationalId: 'GN-1998-0315-FD',
          firstName: 'Aminata',
          lastName: 'Diallo',
          dateOfBirth: '1998-03-15',
          gender: 'F',
          phone: '+224 622 11 22 33',
          address: 'Conakry, Kaloum',
          bloodType: 'O+',
          allergies: ['Pénicilline'],
          emergencyContact: 'Mamadou Diallo',
          emergencyPhone: '+224 622 99 88 77',
        },
        visit: {
          visitNumber: 'VIS-2026-0451',
          patientClass: 'inpatient',
          admittingDoctor: 'Dr. Mamadou Diallo',
          referringDoctor: null,
          department: 'Cardiologie',
          ward: 'Unité Soins Intensifs Cardio',
          bed: 'USI-02',
          admissionReason: 'Transfert vers cardiologie pour évaluation myocardite',
          diagnosisCode: 'I51.4',
          diagnosisDescription: 'Myocardite non précisée',
          admissionDate: '2026-05-10T14:00:00Z',
          dischargeDate: null,
          dischargeDisposition: null,
          expectedLengthOfStay: 5,
          financialClass: 'Assurance SONAR',
          insuranceProvider: 'SONAR Assurance',
          insurancePolicyNumber: 'SON-2024-001234',
        },
        status: 'processed',
        processedAt: '2026-05-10T14:00:03Z',
        error: null,
        fhirBundleId: 'hf-adt-bundle-ADT-002',
        relatedMessageId: 'ADT-001',
      },
      {
        id: 'ADT-003',
        messageType: 'A04',
        sendingFacility: 'Centre de santé Dixinn',
        sendingFacilityCode: 'cs-dixinn',
        receivingFacility: 'Hôpital National Donka',
        receivingFacilityCode: 'donka',
        messageControlId: 'MSG-20260511-001',
        timestamp: '2026-05-11T07:15:00Z',
        patient: {
          patientId: 'P-2024-005',
          nationalId: 'GN-1995-0610-FB',
          firstName: 'Fatoumata',
          lastName: 'Bah',
          dateOfBirth: '1995-06-10',
          gender: 'F',
          phone: '+224 625 33 44 55',
          address: 'Conakry, Dixinn',
          bloodType: 'A-',
          allergies: [],
          emergencyContact: 'Ibrahima Bah',
          emergencyPhone: '+224 625 66 77 88',
        },
        visit: {
          visitNumber: 'VIS-DIX-2026-089',
          patientClass: 'outpatient',
          admittingDoctor: 'Dr. Camara',
          referringDoctor: null,
          department: 'Consultation Externe',
          ward: 'Salle C',
          bed: null,
          admissionReason: 'Céphalées persistantes et vertiges — consultation externe',
          diagnosisCode: 'R51',
          diagnosisDescription: 'Céphalée',
          admissionDate: '2026-05-11T07:15:00Z',
          dischargeDate: null,
          dischargeDisposition: null,
          expectedLengthOfStay: 0,
          financialClass: 'Paiement direct',
          insuranceProvider: null,
          insurancePolicyNumber: null,
        },
        status: 'pending',
        processedAt: null,
        error: null,
        fhirBundleId: null,
        relatedMessageId: null,
      },
      {
        id: 'ADT-004',
        messageType: 'A03',
        sendingFacility: 'Hôpital National Donka',
        sendingFacilityCode: 'donka',
        receivingFacility: 'Hôpital régional de Kankan',
        receivingFacilityCode: 'kankan-regional',
        messageControlId: 'MSG-20260509-003',
        timestamp: '2026-05-09T16:00:00Z',
        patient: {
          patientId: 'P-2024-008',
          nationalId: 'GN-1985-0520-YT',
          firstName: 'Youssouf',
          lastName: 'Touré',
          dateOfBirth: '1985-05-20',
          gender: 'M',
          phone: '+224 629 11 22 33',
          address: 'Kankan',
          bloodType: 'B+',
          allergies: [],
          emergencyContact: 'Aissatou Touré',
          emergencyPhone: '+224 629 44 55 66',
        },
        visit: {
          visitNumber: 'VIS-2026-0387',
          patientClass: 'inpatient',
          admittingDoctor: 'Dr. Diallo',
          referringDoctor: 'Dr. Bangoura (Kankan)',
          department: 'Hépatologie',
          ward: 'Chambre 112',
          bed: '112-B',
          admissionReason: 'Hépatite B chronique avec cirrhose — sortie pour suivi à Kankan',
          diagnosisCode: 'B18.1',
          diagnosisDescription: 'Hépatite virale chronique B sans agent delta',
          admissionDate: '2026-05-07T16:00:00Z',
          dischargeDate: '2026-05-09T16:00:00Z',
          dischargeDisposition: 'Transfert vers hôpital régional pour suivi',
          expectedLengthOfStay: 2,
          financialClass: 'Assurance CGM',
          insuranceProvider: 'CGM Guinée',
          insurancePolicyNumber: 'CGM-2023-005678',
        },
        status: 'acknowledged',
        processedAt: '2026-05-09T16:00:05Z',
        error: null,
        fhirBundleId: 'hf-adt-bundle-ADT-004',
        relatedMessageId: null,
      },
      {
        id: 'ADT-005',
        messageType: 'A01',
        sendingFacility: 'Hôpital National Donka',
        sendingFacilityCode: 'donka',
        receivingFacility: 'Hôpital National Ignace Deen',
        receivingFacilityCode: 'ignace-deen',
        messageControlId: 'MSG-20260510-005',
        timestamp: '2026-05-10T22:30:00Z',
        patient: {
          patientId: 'P-2024-010',
          nationalId: 'GN-1972-0805-OC',
          firstName: 'Ousmane',
          lastName: 'Camara',
          dateOfBirth: '1972-08-05',
          gender: 'M',
          phone: '+224 621 55 66 77',
          address: "N'Zérékoré",
          bloodType: 'AB+',
          allergies: ['Aspirine'],
          emergencyContact: 'Mariama Camara',
          emergencyPhone: '+224 621 88 99 00',
        },
        visit: {
          visitNumber: 'VIS-2026-0512',
          patientClass: 'emergency',
          admittingDoctor: 'Dr. Keita',
          referringDoctor: null,
          department: 'Urgences / Neurologie',
          ward: 'Unité Neuro-Vasculaire',
          bed: 'UNV-01',
          admissionReason: 'AVC ischémique — admission en urgence',
          diagnosisCode: 'I63.9',
          diagnosisDescription: 'Accident vasculaire cérébral ischémique, non précisé',
          admissionDate: '2026-05-10T22:30:00Z',
          dischargeDate: null,
          dischargeDisposition: null,
          expectedLengthOfStay: 14,
          financialClass: 'Assurance Saham',
          insuranceProvider: 'Saham Assurance',
          insurancePolicyNumber: 'SAH-2025-001122',
        },
        status: 'processed',
        processedAt: '2026-05-10T22:30:04Z',
        error: null,
        fhirBundleId: 'hf-adt-bundle-ADT-005',
        relatedMessageId: null,
      },
      {
        id: 'ADT-006',
        messageType: 'A01',
        sendingFacility: 'Hôpital régional de Kindia',
        sendingFacilityCode: 'kindia-regional',
        receivingFacility: 'Hôpital National Donka',
        receivingFacilityCode: 'donka',
        messageControlId: 'MSG-20260511-002',
        timestamp: '2026-05-11T06:00:00Z',
        patient: {
          patientId: 'P-KIN-2026-034',
          nationalId: 'GN-2000-0320-KS',
          firstName: 'Sekou',
          lastName: 'Soumah',
          dateOfBirth: '2000-03-20',
          gender: 'M',
          phone: '+224 624 11 22 33',
          address: 'Kindia',
          bloodType: 'O-',
          allergies: [],
          emergencyContact: 'Kadiatou Soumah',
          emergencyPhone: '+224 624 44 55 66',
        },
        visit: {
          visitNumber: 'VIS-KIN-2026-034',
          patientClass: 'emergency',
          admittingDoctor: 'Dr. Bangoura',
          referringDoctor: null,
          department: 'Urgences',
          ward: 'Réanimation',
          bed: 'REA-03',
          admissionReason: 'Traumatisme thoracique sévère suite accident de la route',
          diagnosisCode: 'S22.2',
          diagnosisDescription: 'Fracture de côte multiple',
          admissionDate: '2026-05-11T06:00:00Z',
          dischargeDate: null,
          dischargeDisposition: null,
          expectedLengthOfStay: 10,
          financialClass: 'Non assuré — prise en charge état',
          insuranceProvider: null,
          insurancePolicyNumber: null,
        },
        status: 'error',
        processedAt: null,
        error: 'Connexion perdue avec Hôpital Donka — message en file d\'attente',
        fhirBundleId: null,
        relatedMessageId: null,
      },
    ]
  }

  getMessages(filters?: { type?: ADTEventType; status?: ADTMessageStatus; facility?: string }): ADTMessage[] {
    let results = this.messages
    if (filters?.type) results = results.filter((m) => m.messageType === filters.type)
    if (filters?.status) results = results.filter((m) => m.status === filters.status)
    if (filters?.facility) results = results.filter((m) => m.sendingFacilityCode === filters.facility || m.receivingFacilityCode === filters.facility)
    return results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  getMessage(id: string): ADTMessage | undefined {
    return this.messages.find((m) => m.id === id)
  }

  createMessage(msg: Omit<ADTMessage, 'id' | 'messageControlId' | 'status' | 'processedAt' | 'error' | 'fhirBundleId' | 'relatedMessageId'>): ADTMessage {
    const newMsg: ADTMessage = {
      ...msg,
      id: `ADT-${String(this.messages.length + 1).padStart(3, '0')}`,
      messageControlId: `MSG-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${String(this.messages.length + 1).padStart(3, '0')}`,
      status: 'pending',
      processedAt: null,
      error: null,
      fhirBundleId: null,
      relatedMessageId: null,
    }
    this.messages.unshift(newMsg)
    return newMsg
  }

  processMessage(id: string): ADTMessage | null {
    const msg = this.messages.find((m) => m.id === id)
    if (!msg) return null

    // Simulate processing
    const bundle = adtToFHIRBundle(msg)
    msg.status = 'processed'
    msg.processedAt = new Date().toISOString()
    msg.fhirBundleId = bundle.id
    return msg
  }

  acknowledgeMessage(id: string): ADTMessage | null {
    const msg = this.messages.find((m) => m.id === id)
    if (!msg) return null
    msg.status = 'acknowledged'
    msg.processedAt = new Date().toISOString()
    return msg
  }

  rejectMessage(id: string, reason: string): ADTMessage | null {
    const msg = this.messages.find((m) => m.id === id)
    if (!msg) return null
    msg.status = 'rejected'
    msg.error = reason
    msg.processedAt = new Date().toISOString()
    return msg
  }

  getMetrics() {
    const total = this.messages.length
    const byType = this.messages.reduce((acc, m) => {
      acc[m.messageType] = (acc[m.messageType] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    const byStatus = this.messages.reduce((acc, m) => {
      acc[m.status] = (acc[m.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    const pending = this.messages.filter((m) => m.status === 'pending').length
    const errors = this.messages.filter((m) => m.status === 'error').length
    const processed = this.messages.filter((m) => m.status === 'processed' || m.status === 'acknowledged').length

    return { total, byType, byStatus, pending, errors, processed, successRate: total > 0 ? Math.round((processed / total) * 100) : 0 }
  }
}

export const adtService = new ADTMessageService()
