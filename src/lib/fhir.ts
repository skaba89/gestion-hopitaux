// HealthFlow Africa - HL7 FHIR R4 Implementation
// Complete FHIR server with resource mapping, validation, and exchange capabilities

/* ─────────── FHIR R4 Base Types ─────────── */

export interface FHIRResource {
  resourceType: string
  id: string
  meta?: {
    versionId?: string
    lastUpdated?: string
    profile?: string[]
    security?: FHIRCoding[]
    tag?: FHIRCoding[]
  }
  language?: string
}

export interface FHIRCoding {
  system?: string
  version?: string
  code?: string
  display?: string
  userSelected?: boolean
}

export interface FHIRCodeableConcept {
  coding?: FHIRCoding[]
  text?: string
}

export interface FHIRReference {
  reference?: string
  type?: string
  identifier?: FHIRIdentifier
  display?: string
}

export interface FHIRIdentifier {
  use?: 'usual' | 'official' | 'temp' | 'secondary' | 'old'
  type?: FHIRCodeableConcept
  system?: string
  value?: string
  period?: { start?: string; end?: string }
  assigner?: FHIRReference
}

export interface FHIRHumanName {
  use?: 'usual' | 'official' | 'temp' | 'nickname' | 'anonymous' | 'old' | 'maiden'
  text?: string
  family?: string
  given?: string[]
  prefix?: string[]
  suffix?: string[]
}

export interface FHIRAddress {
  use?: 'home' | 'work' | 'temp' | 'old' | 'billing'
  type?: 'postal' | 'physical' | 'both'
  text?: string
  line?: string[]
  city?: string
  district?: string
  state?: string
  postalCode?: string
  country?: string
}

export interface FHIRContactPoint {
  system?: 'phone' | 'fax' | 'email' | 'pager' | 'url' | 'sms' | 'other'
  value?: string
  use?: 'home' | 'work' | 'temp' | 'old' | 'mobile'
  rank?: number
}

export interface FHIRPeriod {
  start?: string
  end?: string
}

export interface FHIRQuantity {
  value?: number
  comparator?: '<' | '<=' | '>=' | '>'
  unit?: string
  system?: string
  code?: string
}

export interface FHIRObservationReferenceRange {
  low?: FHIRQuantity
  high?: FHIRQuantity
  type?: FHIRCodeableConcept
  appliesTo?: FHIRCodeableConcept[]
  age?: FHIRPeriod
  text?: string
}

/* ─────────── FHIR R4 Patient Resource ─────────── */

export interface FHIRPatient extends FHIRResource {
  resourceType: 'Patient'
  identifier?: FHIRIdentifier[]
  active?: boolean
  name?: FHIRHumanName[]
  telecom?: FHIRContactPoint[]
  gender?: 'male' | 'female' | 'other' | 'unknown'
  birthDate?: string
  deceasedBoolean?: boolean
  deceasedDateTime?: string
  address?: FHIRAddress[]
  maritalStatus?: FHIRCodeableConcept
  multipleBirthBoolean?: boolean
  multipleBirthInteger?: number
  contact?: {
    relationship?: FHIRCodeableConcept[]
    name?: FHIRHumanName
    telecom?: FHIRContactPoint[]
    address?: FHIRAddress
    gender?: 'male' | 'female' | 'other' | 'unknown'
    organization?: FHIRReference
    period?: FHIRPeriod
  }[]
  communication?: {
    language: FHIRCodeableConcept
    preferred?: boolean
  }[]
  generalPractitioner?: FHIRReference[]
  managingOrganization?: FHIRReference
  link?: {
    other: FHIRReference
    type: 'replaced-by' | 'replaces' | 'refer' | 'seealso'
  }[]
}

/* ─────────── FHIR R4 Observation Resource ─────────── */

export interface FHIRObservation extends FHIRResource {
  resourceType: 'Observation'
  identifier?: FHIRIdentifier[]
  basedOn?: FHIRReference[]
  partOf?: FHIRReference[]
  status: 'registered' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'cancelled' | 'entered-in-error' | 'unknown'
  category?: FHIRCodeableConcept[]
  code: FHIRCodeableConcept
  subject?: FHIRReference
  focus?: FHIRReference[]
  encounter?: FHIRReference
  effectiveDateTime?: string
  effectivePeriod?: FHIRPeriod
  issued?: string
  performer?: FHIRReference[]
  valueQuantity?: FHIRQuantity
  valueCodeableConcept?: FHIRCodeableConcept
  valueString?: string
  valueBoolean?: boolean
  valueInteger?: number
  valueRange?: { low: FHIRQuantity; high: FHIRQuantity }
  valueRatio?: { numerator: FHIRQuantity; denominator: FHIRQuantity }
  dataAbsentReason?: FHIRCodeableConcept
  interpretation?: FHIRCodeableConcept[]
  note?: { authorReference?: FHIRReference; authorString?: string; time?: string; text: string }[]
  bodySite?: FHIRCodeableConcept
  method?: FHIRCodeableConcept
  specimen?: FHIRReference
  device?: FHIRReference
  referenceRange?: FHIRObservationReferenceRange[]
  hasMember?: FHIRReference[]
  derivedFrom?: FHIRReference[]
  component?: {
    code: FHIRCodeableConcept
    valueQuantity?: FHIRQuantity
    valueCodeableConcept?: FHIRCodeableConcept
    valueString?: string
    dataAbsentReason?: FHIRCodeableConcept
    interpretation?: FHIRCodeableConcept[]
    referenceRange?: FHIRObservationReferenceRange[]
  }[]
}

/* ─────────── FHIR R4 DiagnosticReport ─────────── */

export interface FHIRDiagnosticReport extends FHIRResource {
  resourceType: 'DiagnosticReport'
  identifier?: FHIRIdentifier[]
  basedOn?: FHIRReference[]
  status: 'registered' | 'partial' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'appended' | 'cancelled' | 'entered-in-error' | 'unknown'
  category?: FHIRCodeableConcept[]
  code: FHIRCodeableConcept
  subject?: FHIRReference
  encounter?: FHIRReference
  effectiveDateTime?: string
  effectivePeriod?: FHIRPeriod
  issued?: string
  performer?: FHIRReference[]
  resultsInterpreter?: FHIRReference[]
  specimen?: FHIRReference[]
  result?: FHIRReference[]
  imagingStudy?: FHIRReference[]
  media?: { comment?: string; link: FHIRReference }[]
  conclusion?: string
  conclusionCode?: FHIRCodeableConcept[]
  presentedForm?: { contentType?: string; language?: string; data?: string; url?: string; size?: number; hash?: string; title?: string; creation?: string }[]
}

/* ─────────── FHIR R4 MedicationRequest ─────────── */

export interface FHIRMedicationRequest extends FHIRResource {
  resourceType: 'MedicationRequest'
  identifier?: FHIRIdentifier[]
  status: 'active' | 'on-hold' | 'cancelled' | 'completed' | 'entered-in-error' | 'stopped' | 'draft' | 'unknown'
  statusReason?: FHIRCodeableConcept
  intent: 'proposal' | 'plan' | 'order' | 'original-order' | 'reflex-order' | 'filler-order' | 'instance-order' | 'option'
  category?: FHIRCodeableConcept[]
  priority?: 'routine' | 'urgent' | 'asap' | 'stat'
  doNotPerform?: boolean
  reportedBoolean?: boolean
  reportedReference?: FHIRReference
  medicationCodeableConcept?: FHIRCodeableConcept
  medicationReference?: FHIRReference
  subject: FHIRReference
  encounter?: FHIRReference
  supportingInformation?: FHIRReference[]
  authoredOn?: string
  requester?: FHIRReference
  performer?: FHIRReference
  performerType?: FHIRCodeableConcept
  recorder?: FHIRReference
  reasonCode?: FHIRCodeableConcept[]
  reasonReference?: FHIRReference[]
  instantiatesCanonical?: string[]
  instantiatesUri?: string[]
  basedOn?: FHIRReference[]
  priorPrescription?: FHIRReference
  groupIdentifier?: FHIRIdentifier
  courseOfTherapyType?: FHIRCodeableConcept
  insurance?: FHIRReference[]
  note?: { authorReference?: FHIRReference; authorString?: string; time?: string; text: string }[]
  dosageInstruction?: FHIRDosage[]
  dispenseRequest?: {
    description?: string
    initialFill?: { quantity?: FHIRQuantity; duration?: FHIRQuantity }
    dispenseInterval?: FHIRQuantity
    validityPeriod?: FHIRPeriod
    numberOfRepeatsAllowed?: number
    quantity?: FHIRQuantity
    expectedSupplyDuration?: FHIRQuantity
    performer?: FHIRReference
  }
  substitution?: { allowedBoolean?: boolean; allowedCodeableConcept?: FHIRCodeableConcept; reason?: FHIRCodeableConcept }
  priorPrescriptionRef?: FHIRReference
  detectedIssue?: FHIRReference[]
  eventHistory?: FHIRReference[]
}

export interface FHIRDosage {
  sequence?: number
  text?: string
  additionalInstruction?: FHIRCodeableConcept[]
  patientInstruction?: string
  timing?: {
    event?: string[]
    repeat?: {
      boundsPeriod?: FHIRPeriod
      count?: number
      countMax?: number
      duration?: number
      durationMax?: number
      durationUnit?: 's' | 'min' | 'h' | 'd' | 'wk' | 'mo' | 'a'
      frequency?: number
      frequencyMax?: number
      period?: number
      periodMax?: number
      periodUnit?: 's' | 'min' | 'h' | 'd' | 'wk' | 'mo' | 'a'
      dayOfWeek?: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[]
      timeOfDay?: string[]
      when?: string[]
      offset?: number
    }
    code?: FHIRCodeableConcept
  }
  asNeededBoolean?: boolean
  asNeededCodeableConcept?: FHIRCodeableConcept
  site?: FHIRCodeableConcept
  route?: FHIRCodeableConcept
  method?: FHIRCodeableConcept
  doseAndRate?: {
    type?: FHIRCodeableConcept
    doseQuantity?: FHIRQuantity
    doseRange?: { low: FHIRQuantity; high: FHIRQuantity }
    rateQuantity?: FHIRQuantity
    rateRatio?: { numerator: FHIRQuantity; denominator: FHIRQuantity }
  }[]
  maxDosePerPeriod?: { numerator: FHIRQuantity; denominator: FHIRQuantity }
  maxDosePerAdministration?: FHIRQuantity
  maxDosePerLifetime?: FHIRQuantity
}

/* ─────────── FHIR R4 Encounter ─────────── */

export interface FHIREncounter extends FHIRResource {
  resourceType: 'Encounter'
  identifier?: FHIRIdentifier[]
  status: 'planned' | 'arrived' | 'triaged' | 'in-progress' | 'onleave' | 'finished' | 'cancelled' | 'entered-in-error' | 'unknown'
  statusHistory?: { status: FHIREncounter['status']; period: FHIRPeriod }[]
  class: FHIRCoding
  classHistory?: { class: FHIRCoding; period: FHIRPeriod }[]
  type?: FHIRCodeableConcept[]
  serviceType?: FHIRCodeableConcept
  priority?: FHIRCodeableConcept
  subject?: FHIRReference
  episodeOfCare?: FHIRReference[]
  basedOn?: FHIRReference[]
  participant?: {
    type?: FHIRCodeableConcept[]
    period?: FHIRPeriod
    individual?: FHIRReference
  }[]
  appointment?: FHIRReference[]
  period?: FHIRPeriod
  length?: FHIRQuantity
  reasonCode?: FHIRCodeableConcept[]
  reasonReference?: FHIRReference[]
  diagnosis?: {
    condition: FHIRReference
    use?: FHIRCodeableConcept
    rank?: number
  }[]
  account?: FHIRReference[]
  hospitalization?: {
    preAdmissionIdentifier?: FHIRIdentifier
    origin?: FHIRReference
    admitSource?: FHIRCodeableConcept
    reAdmission?: FHIRCodeableConcept
    dietPreference?: FHIRCodeableConcept[]
    specialCourtesy?: FHIRCodeableConcept[]
    specialArrangement?: FHIRCodeableConcept[]
    destination?: FHIRReference
    dischargeDisposition?: FHIRCodeableConcept
  }
  location?: {
    location: FHIRReference
    status?: 'planned' | 'active' | 'reserved' | 'completed'
    physicalType?: FHIRCodeableConcept
    period?: FHIRPeriod
  }[]
  serviceProvider?: FHIRReference
  partOf?: FHIRReference
}

/* ─────────── FHIR R4 Practitioner ─────────── */

export interface FHIRPractitioner extends FHIRResource {
  resourceType: 'Practitioner'
  identifier?: FHIRIdentifier[]
  active?: boolean
  name?: FHIRHumanName[]
  telecom?: FHIRContactPoint[]
  address?: FHIRAddress[]
  gender?: 'male' | 'female' | 'other' | 'unknown'
  birthDate?: string
  photo?: { contentType?: string; language?: string; data?: string; url?: string; size?: number; hash?: string; title?: string; creation?: string }[]
  qualification?: {
    identifier?: FHIRIdentifier[]
    code: FHIRCodeableConcept
    period?: FHIRPeriod
    issuer?: FHIRReference
  }[]
  communication?: FHIRCodeableConcept[]
}

/* ─────────── FHIR R4 Organization ─────────── */

export interface FHIROrganization extends FHIRResource {
  resourceType: 'Organization'
  identifier?: FHIRIdentifier[]
  active?: boolean
  type?: FHIRCodeableConcept[]
  name?: string
  alias?: string[]
  telecom?: FHIRContactPoint[]
  address?: FHIRAddress[]
  partOf?: FHIRReference
  contact?: {
    purpose?: FHIRCodeableConcept
    name?: FHIRHumanName
    telecom?: FHIRContactPoint[]
    address?: FHIRAddress
  }[]
  endpoint?: FHIRReference[]
}

/* ─────────── FHIR Bundle ─────────── */

export interface FHIRBundle extends FHIRResource {
  resourceType: 'Bundle'
  type: 'document' | 'message' | 'transaction' | 'transaction-response' | 'batch' | 'batch-response' | 'history' | 'searchset' | 'collection'
  total?: number
  link?: { relation: string; url: string }[]
  entry?: {
    link?: { relation: string; url: string }[]
    fullUrl?: string
    resource?: FHIRResource
    search?: { mode?: 'match' | 'include' | 'outcome'; score?: number }
    request?: { method: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'; url: string; ifNoneMatch?: string; ifModifiedSince?: string; ifMatch?: string; ifNoneExist?: string }
    response?: { status: string; location?: string; etag?: string; lastModified?: string; outcome?: FHIRResource }
  }[]
  signature?: {
    type: FHIRCoding[]
    when: string
    who: FHIRReference
    onBehalfOf?: FHIRReference
    targetFormat?: string
    sigFormat?: string
    data?: string
  }
}

/* ─────────── FHIR OperationOutcome ─────────── */

export interface FHIROperationOutcome extends FHIRResource {
  resourceType: 'OperationOutcome'
  issue: {
    severity: 'fatal' | 'error' | 'warning' | 'information'
    code: 'invalid' | 'structure' | 'required' | 'value' | 'invariant' | 'security' | 'login' | 'unknown' | 'expired' | 'forbidden' | 'suppressed' | 'processing' | 'not-supported' | 'duplicate' | 'multiple-matches' | 'not-found' | 'deleted' | 'too-long' | 'code-invalid' | 'extension' | 'too-costly' | 'business-rule' | 'conflict' | 'transient' | 'lock-error' | 'no-store' | 'exception' | 'timeout' | 'incomplete' | 'throttled' | 'informational'
    details?: FHIRCodeableConcept
    diagnostics?: string
    location?: string[]
    expression?: string[]
  }[]
}

/* ─────────── FHIR CapabilityStatement ─────────── */

export interface FHIRCapabilityStatement extends FHIRResource {
  resourceType: 'CapabilityStatement'
  status: 'draft' | 'active' | 'retired' | 'unknown'
  date: string
  kind: 'instance' | 'capability' | 'requirements'
  fhirVersion: string
  format: string[]
  implementation?: {
    description: string
    url?: string
  }
  rest?: {
    mode: 'client' | 'server'
    documentation?: string
    security?: {
      cors?: boolean
      service?: FHIRCodeableConcept[]
      description?: string
    }
    resource?: {
      type: string
      profile?: string
      supportedProfile?: string[]
      documentation?: string
      interaction: { code: string; documentation?: string }[]
      searchParam?: { name: string; definition?: string; type: string; documentation?: string }[]
      operation?: { name: string; definition: string; documentation?: string }[]
    }[]
    interaction?: { code: string; documentation?: string }[]
    operation?: { name: string; definition: string; documentation?: string }[]
    compartment?: string[]
  }[]
}

/* ─────────── Guinea Health System Codes ─────────── */

export const GUINEA_FHIR_SYSTEMS = {
  // National patient identifier
  nationalId: 'https://healthflow-gn.com/fhir/identifier/national-id',
  // HealthFlow internal ID
  healthflowId: 'https://healthflow-gn.com/fhir/identifier/healthflow-id',
  // Guinea health zones
  healthZone: 'https://healthflow-gn.com/fhir/code-system/health-zone',
  // Guinea establishment codes
  establishment: 'https://healthflow-gn.com/fhir/code-system/establishment',
  // Guinea LOINC extensions
  loincGuinea: 'https://healthflow-gn.com/fhir/code-system/loinc-extension',
  // Guinea drug formulary
  drugFormulary: 'https://healthflow-gn.com/fhir/code-system/drug-formulary',
  // Insurance providers
  insuranceProvider: 'https://healthflow-gn.com/fhir/code-system/insurance-provider',
  // Mobile Money payment
  mobileMoney: 'https://healthflow-gn.com/fhir/code-system/mobile-money',
  // DHIS2 organization unit
  dhis2OrgUnit: 'https://dhis2.healthflow-gn.com/fhir/code-system/org-unit',
  // SANTEP card
  santepCard: 'https://santep.healthflow-gn.com/fhir/identifier/santep-card',
} as const

export const GUINEA_HEALTH_ZONES = [
  { code: 'conakry', display: 'Conakry', dhis2Code: 'OU-Conakry' },
  { code: 'kindia', display: 'Kindia', dhis2Code: 'OU-Kindia' },
  { code: 'boke', display: 'Boké', dhis2Code: 'OU-Boke' },
  { code: 'labé', display: 'Labé', dhis2Code: 'OU-Labe' },
  { code: 'mali', display: 'Mali', dhis2Code: 'OU-Mali' },
  { code: 'kankan', display: 'Kankan', dhis2Code: 'OU-Kankan' },
  { code: 'nzerekore', display: "N'Zérékoré", dhis2Code: 'OU-Nzerekore' },
  { code: 'faranah', display: 'Faranah', dhis2Code: 'OU-Faranah' },
] as const

export const GUINEA_ESTABLISHMENTS = [
  { code: 'donka', display: 'Hôpital National Donka', type: 'CHU', zone: 'conakry' },
  { code: 'ignace-deen', display: 'Hôpital National Ignace Deen', type: 'CHU', zone: 'conakry' },
  { code: 'conakry-centre', display: 'Hôpital régional de Conakry', type: 'Régional', zone: 'conakry' },
  { code: 'kindia-regional', display: 'Hôpital régional de Kindia', type: 'Régional', zone: 'kindia' },
  { code: 'kankan-regional', display: 'Hôpital régional de Kankan', type: 'Régional', zone: 'kankan' },
  { code: 'nzerekore-regional', display: "Hôpital régional de N'Zérékoré", type: 'Régional', zone: 'nzerekore' },
  { code: 'labe-regional', display: 'Hôpital régional de Labé', type: 'Régional', zone: 'labé' },
  { code: 'cs-kaloum', display: 'Centre de santé Kaloum', type: 'CS', zone: 'conakry' },
  { code: 'cs-dixinn', display: 'Centre de santé Dixinn', type: 'CS', zone: 'conakry' },
  { code: 'cs-matam', display: 'Centre de santé Matam', type: 'CS', zone: 'conakry' },
  { code: 'cs-ratoma', display: 'Centre de santé Ratoma', type: 'CS', zone: 'conakry' },
  { code: 'cs-matoto', display: 'Centre de santé Matoto', type: 'CS', zone: 'conakry' },
] as const

/* ─────────── FHIR Mapper: Internal → FHIR ─────────── */

import type { Patient, Consultation, LabRequest, Medication, Invoice } from './data-store'

export function patientToFHIR(p: Patient): FHIRPatient {
  return {
    resourceType: 'Patient',
    id: `hf-patient-${p.id}`,
    meta: {
      versionId: '1',
      lastUpdated: new Date().toISOString(),
      profile: ['http://hl7.org/fhir/StructureDefinition/Patient'],
      tag: [{ system: GUINEA_FHIR_SYSTEMS.healthZone, code: 'conakry', display: 'Conakry' }],
    },
    identifier: [
      {
        use: 'official',
        system: GUINEA_FHIR_SYSTEMS.healthflowId,
        value: p.id,
      },
      {
        use: 'official',
        system: GUINEA_FHIR_SYSTEMS.nationalId,
        value: p.nationalId,
      },
      {
        use: 'secondary',
        system: GUINEA_FHIR_SYSTEMS.santepCard,
        value: p.qrCode,
      },
    ],
    active: p.status === 'Actif',
    name: [
      {
        use: 'official',
        family: p.lastName,
        given: [p.firstName],
      },
    ],
    telecom: [
      {
        system: 'phone',
        value: p.phone,
        use: 'mobile',
        rank: 1,
      },
    ],
    gender: p.gender === 'M' ? 'male' : 'female',
    birthDate: p.dateOfBirth,
    address: [
      {
        use: 'home',
        type: 'physical',
        text: p.address,
        country: 'GN',
      },
    ],
    contact: p.emergencyContact
      ? [
          {
            relationship: [
              {
                coding: [
                  {
                    system: 'http://terminology.hl7.org/CodeSystem/v2-0131',
                    code: 'C',
                    display: 'Emergency Contact',
                  },
                ],
              },
            ],
            name: { text: p.emergencyContact },
            telecom: [{ system: 'phone', value: p.emergencyPhone, use: 'mobile' }],
          },
        ]
      : undefined,
  }
}

export function fhirToPatient(fhir: FHIRPatient): Partial<Patient> {
  const officialName = fhir.name?.find((n) => n.use === 'official') || fhir.name?.[0]
  const healthflowId = fhir.identifier?.find((i) => i.system === GUINEA_FHIR_SYSTEMS.healthflowId)
  const nationalId = fhir.identifier?.find((i) => i.system === GUINEA_FHIR_SYSTEMS.nationalId)
  const qrCode = fhir.identifier?.find((i) => i.system === GUINEA_FHIR_SYSTEMS.santepCard)
  const phone = fhir.telecom?.find((t) => t.system === 'phone')
  const emergencyContact = fhir.contact?.[0]

  return {
    id: healthflowId?.value?.replace('hf-patient-', '') || fhir.id?.replace('hf-patient-', '') || '',
    qrCode: qrCode?.value || '',
    firstName: officialName?.given?.[0] || '',
    lastName: officialName?.family || '',
    dateOfBirth: fhir.birthDate || '',
    gender: fhir.gender === 'male' ? 'M' : 'F',
    phone: phone?.value || '',
    address: fhir.address?.[0]?.text || '',
    nationalId: nationalId?.value || '',
    status: fhir.active ? 'Actif' : 'Inactif',
    emergencyContact: emergencyContact?.name?.text || '',
    emergencyPhone: emergencyContact?.telecom?.[0]?.value || '',
  }
}

export function consultationToEncounter(c: Consultation): FHIREncounter {
  const statusMap: Record<string, FHIREncounter['status']> = {
    'En attente': 'planned',
    'En cours': 'in-progress',
    'Terminée': 'finished',
  }

  return {
    resourceType: 'Encounter',
    id: `hf-encounter-${c.id}`,
    meta: {
      versionId: '1',
      lastUpdated: new Date().toISOString(),
      profile: ['http://hl7.org/fhir/StructureDefinition/Encounter'],
    },
    identifier: [
      {
        use: 'official',
        system: GUINEA_FHIR_SYSTEMS.healthflowId,
        value: c.id,
      },
    ],
    status: statusMap[c.status] || 'unknown',
    class: {
      system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
      code: 'AMB',
      display: 'ambulatory',
    },
    type: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
            code: 'AMB',
            display: 'Consultation ambulatoire',
          },
        ],
        text: c.reason,
      },
    ],
    subject: {
      reference: `Patient/hf-patient-${c.patientId}`,
      display: c.patientName,
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
        individual: { display: c.doctor },
      },
    ],
    period: {
      start: `${c.date}T${c.time}:00+00:00`,
    },
    diagnosis: c.diagnosis
      ? [
          {
            condition: { display: c.diagnosis },
            use: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/diagnosis-role',
                  code: 'AD',
                  display: 'Admission diagnosis',
                },
              ],
            },
          },
        ]
      : undefined,
  }
}

export function labRequestToDiagnosticReport(lab: LabRequest): FHIRDiagnosticReport {
  const statusMap: Record<string, FHIRDiagnosticReport['status']> = {
    'En attente': 'registered',
    'En cours': 'preliminary',
    'Terminé': 'final',
    'Validé': 'final',
  }

  return {
    resourceType: 'DiagnosticReport',
    id: `hf-report-${lab.id}`,
    meta: {
      versionId: '1',
      lastUpdated: new Date().toISOString(),
      profile: ['http://hl7.org/fhir/StructureDefinition/DiagnosticReport'],
    },
    identifier: [
      {
        use: 'official',
        system: GUINEA_FHIR_SYSTEMS.healthflowId,
        value: lab.id,
      },
    ],
    status: statusMap[lab.status] || 'unknown',
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0074',
            code: 'LAB',
            display: 'Laboratory',
          },
        ],
      },
    ],
    code: {
      coding: [
        {
          system: 'http://loinc.org',
          code: '11502-2',
          display: 'Laboratory report',
        },
      ],
      text: lab.type,
    },
    subject: {
      reference: `Patient/hf-patient-${lab.patientId}`,
      display: lab.patientName,
    },
    effectiveDateTime: `${lab.date}T00:00:00+00:00`,
    issued: `${lab.date}T00:00:00.000Z`,
    performer: [
      {
        display: lab.doctor,
      },
    ],
    result: lab.results.map((r) => ({
      reference: `Observation/hf-obs-${lab.id}-${r.name.replace(/\s+/g, '-')}`,
    })),
    conclusion: lab.results.some((r) => r.abnormal)
      ? 'Résultats anormaux détectés — voir détails'
      : undefined,
  }
}

export function labResultToObservation(
  labId: string,
  result: LabRequest['results'][0],
  date: string,
  patientId: string,
  patientName: string,
  doctor: string
): FHIRObservation {
  const valueParts = result.value.match(/^([\d.]+)\s*(.*)$/)
  const numericValue = valueParts ? parseFloat(valueParts[1]) : undefined
  const valueUnit = valueParts?.[2] || result.unit

  return {
    resourceType: 'Observation',
    id: `hf-obs-${labId}-${result.name.replace(/\s+/g, '-')}`,
    meta: {
      versionId: '1',
      lastUpdated: new Date().toISOString(),
      profile: ['http://hl7.org/fhir/StructureDefinition/Observation'],
    },
    status: 'final',
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'laboratory',
            display: 'Laboratory',
          },
        ],
      },
    ],
    code: {
      coding: [
        {
          system: 'http://loinc.org',
          display: result.name,
        },
      ],
      text: result.name,
    },
    subject: {
      reference: `Patient/hf-patient-${patientId}`,
      display: patientName,
    },
    effectiveDateTime: `${date}T00:00:00+00:00`,
    performer: [{ display: doctor }],
    valueQuantity: numericValue
      ? {
          value: numericValue,
          unit: valueUnit,
          system: 'http://unitsofmeasure.org',
          code: result.unit,
        }
      : undefined,
    valueString: !numericValue ? result.value : undefined,
    interpretation: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
            code: result.abnormal ? 'H' : 'N',
            display: result.abnormal ? 'High' : 'Normal',
          },
        ],
      },
    ],
    referenceRange: result.normalRange
      ? [
          {
            text: result.normalRange,
          },
        ]
      : undefined,
  }
}

export function prescriptionToMedicationRequest(
  consultationId: string,
  prescription: Consultation['prescriptions'][0],
  patientId: string,
  patientName: string,
  doctor: string,
  date: string
): FHIRMedicationRequest {
  return {
    resourceType: 'MedicationRequest',
    id: `hf-medreq-${consultationId}-${prescription.medication.replace(/\s+/g, '-')}`,
    meta: {
      versionId: '1',
      lastUpdated: new Date().toISOString(),
      profile: ['http://hl7.org/fhir/StructureDefinition/MedicationRequest'],
    },
    status: 'active',
    intent: 'order',
    medicationCodeableConcept: {
      coding: [
        {
          system: GUINEA_FHIR_SYSTEMS.drugFormulary,
          display: prescription.medication,
        },
      ],
      text: prescription.medication,
    },
    subject: {
      reference: `Patient/hf-patient-${patientId}`,
      display: patientName,
    },
    authoredOn: `${date}T00:00:00+00:00`,
    requester: { display: doctor },
    dosageInstruction: [
      {
        text: `${prescription.dosage} — ${prescription.duration} — ${prescription.instructions}`,
        patientInstruction: prescription.instructions,
        timing: {
          repeat: {
            duration: parseInt(prescription.duration) || 1,
            durationUnit: 'd',
          },
        },
      },
    ],
    dispenseRequest: {
      validityPeriod: {
        start: `${date}T00:00:00+00:00`,
      },
    },
  }
}

/* ─────────── FHIR Bundle Builder ─────────── */

export function buildPatientBundle(patient: Patient, consultation?: Consultation, labRequest?: LabRequest): FHIRBundle {
  const entries: FHIRBundle['entry'] = []

  // Patient resource
  const fhirPatient = patientToFHIR(patient)
  entries.push({
    fullUrl: `urn:uuid:${fhirPatient.id}`,
    resource: fhirPatient,
  })

  // Encounter
  if (consultation) {
    const encounter = consultationToEncounter(consultation)
    entries.push({
      fullUrl: `urn:uuid:${encounter.id}`,
      resource: encounter,
    })

    // MedicationRequests
    for (const rx of consultation.prescriptions) {
      const medReq = prescriptionToMedicationRequest(
        consultation.id,
        rx,
        patient.id,
        patient.lastName,
        consultation.doctor,
        consultation.date
      )
      entries.push({
        fullUrl: `urn:uuid:${medReq.id}`,
        resource: medReq,
      })
    }
  }

  // DiagnosticReport + Observations
  if (labRequest) {
    const report = labRequestToDiagnosticReport(labRequest)
    entries.push({
      fullUrl: `urn:uuid:${report.id}`,
      resource: report,
    })

    for (const result of labRequest.results) {
      const obs = labResultToObservation(
        labRequest.id,
        result,
        labRequest.date,
        labRequest.patientId,
        labRequest.patientName,
        labRequest.doctor
      )
      entries.push({
        fullUrl: `urn:uuid:${obs.id}`,
        resource: obs,
      })
    }
  }

  return {
    resourceType: 'Bundle',
    id: `hf-bundle-${patient.id}-${Date.now()}`,
    type: 'document',
    total: entries.length,
    link: [
      { relation: 'self', url: `https://healthflow-gn.com/fhir/Bundle/${patient.id}` },
    ],
    entry: entries,
    signature: {
      type: [
        {
          system: 'urn:iso-astm:E1762-95:2013',
          code: '1.2.840.10065.1.12.1.1',
          display: 'Author\'s Signature',
        },
      ],
      when: new Date().toISOString(),
      who: { display: 'HealthFlow Africa FHIR Server' },
      targetFormat: 'application/fhir+json',
      sigFormat: 'application/jose',
    },
  }
}

/* ─────────── FHIR Capability Statement ─────────── */

export function getCapabilityStatement(): FHIRCapabilityStatement {
  return {
    resourceType: 'CapabilityStatement',
    id: 'healthflow-fhir-capability',
    status: 'active',
    date: new Date().toISOString().split('T')[0],
    kind: 'instance',
    fhirVersion: '4.0.1',
    format: ['application/fhir+json', 'application/fhir+xml'],
    implementation: {
      description: 'HealthFlow Africa FHIR Server — Guinea Hospital Information System',
      url: 'https://healthflow-gn.com/fhir',
    },
    rest: [
      {
        mode: 'server',
        documentation: 'HealthFlow Africa FHIR R4 Server supporting Guinea national health data exchange',
        security: {
          cors: true,
          service: [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/restful-security-service',
                  code: 'SMART-on-FHIR',
                },
              ],
              text: 'SMART on FHIR with RBAC + RLS',
            },
          ],
          description: 'OAuth2 + RBAC + RLS security with Guinea national health authority integration',
        },
        resource: [
          {
            type: 'Patient',
            profile: 'http://hl7.org/fhir/StructureDefinition/Patient',
            interaction: [
              { code: 'read' },
              { code: 'search-type' },
              { code: 'create' },
              { code: 'update' },
              { code: 'delete' },
            ],
            searchParam: [
              { name: 'identifier', type: 'token' },
              { name: 'name', type: 'string' },
              { name: 'birthdate', type: 'date' },
              { name: 'gender', type: 'token' },
              { name: 'phone', type: 'token' },
              { name: 'address', type: 'string' },
            ],
          },
          {
            type: 'Observation',
            profile: 'http://hl7.org/fhir/StructureDefinition/Observation',
            interaction: [
              { code: 'read' },
              { code: 'search-type' },
              { code: 'create' },
            ],
            searchParam: [
              { name: 'patient', type: 'reference' },
              { name: 'category', type: 'token' },
              { name: 'code', type: 'token' },
              { name: 'date', type: 'date' },
            ],
          },
          {
            type: 'DiagnosticReport',
            profile: 'http://hl7.org/fhir/StructureDefinition/DiagnosticReport',
            interaction: [
              { code: 'read' },
              { code: 'search-type' },
              { code: 'create' },
            ],
            searchParam: [
              { name: 'patient', type: 'reference' },
              { name: 'category', type: 'token' },
              { name: 'code', type: 'token' },
              { name: 'date', type: 'date' },
              { name: 'status', type: 'token' },
            ],
          },
          {
            type: 'Encounter',
            profile: 'http://hl7.org/fhir/StructureDefinition/Encounter',
            interaction: [
              { code: 'read' },
              { code: 'search-type' },
              { code: 'create' },
              { code: 'update' },
            ],
            searchParam: [
              { name: 'patient', type: 'reference' },
              { name: 'date', type: 'date' },
              { name: 'status', type: 'token' },
              { name: 'practitioner', type: 'reference' },
            ],
          },
          {
            type: 'MedicationRequest',
            profile: 'http://hl7.org/fhir/StructureDefinition/MedicationRequest',
            interaction: [
              { code: 'read' },
              { code: 'search-type' },
              { code: 'create' },
              { code: 'update' },
            ],
            searchParam: [
              { name: 'patient', type: 'reference' },
              { name: 'status', type: 'token' },
              { name: 'intent', type: 'token' },
              { name: 'authoredon', type: 'date' },
            ],
          },
          {
            type: 'Practitioner',
            profile: 'http://hl7.org/fhir/StructureDefinition/Practitioner',
            interaction: [
              { code: 'read' },
              { code: 'search-type' },
            ],
            searchParam: [
              { name: 'identifier', type: 'token' },
              { name: 'name', type: 'string' },
            ],
          },
          {
            type: 'Organization',
            profile: 'http://hl7.org/fhir/StructureDefinition/Organization',
            interaction: [
              { code: 'read' },
              { code: 'search-type' },
            ],
            searchParam: [
              { name: 'identifier', type: 'token' },
              { name: 'name', type: 'string' },
              { name: 'type', type: 'token' },
            ],
          },
        ],
        operation: [
          {
            name: '$validate',
            definition: 'https://healthflow-gn.com/fhir/OperationDefinition/validate',
            documentation: 'Validate a FHIR resource against its profile',
          },
          {
            name: '$everything',
            definition: 'https://healthflow-gn.com/fhir/OperationDefinition/everything',
            documentation: 'Return all resources related to a Patient',
          },
          {
            name: '$export',
            definition: 'https://healthflow-gn.com/fhir/OperationDefinition/export',
            documentation: 'Bulk export data for national reporting',
          },
        ],
      },
    ],
  }
}

/* ─────────── FHIR Validation ─────────── */

export function validateFHIRResource(resource: FHIRResource): FHIROperationOutcome {
  const issues: FHIROperationOutcome['issue'] = []

  if (!resource.resourceType) {
    issues.push({
      severity: 'fatal',
      code: 'required',
      details: { text: 'resourceType is required' },
      location: ['resourceType'],
    })
  }

  if (!resource.id) {
    issues.push({
      severity: 'error',
      code: 'required',
      details: { text: 'id is required' },
      location: ['id'],
    })
  }

  // Patient-specific validation
  if (resource.resourceType === 'Patient') {
    const patient = resource as FHIRPatient
    if (!patient.name?.length) {
      issues.push({
        severity: 'error',
        code: 'required',
        details: { text: 'Patient must have at least one name' },
        location: ['name'],
      })
    }
    if (!patient.gender) {
      issues.push({
        severity: 'error',
        code: 'required',
        details: { text: 'Patient gender is required' },
        location: ['gender'],
      })
    }
  }

  // Observation-specific validation
  if (resource.resourceType === 'Observation') {
    const obs = resource as FHIRObservation
    if (!obs.code) {
      issues.push({
        severity: 'fatal',
        code: 'required',
        details: { text: 'Observation.code is required' },
        location: ['code'],
      })
    }
    if (!obs.status) {
      issues.push({
        severity: 'fatal',
        code: 'required',
        details: { text: 'Observation.status is required' },
        location: ['status'],
      })
    }
  }

  if (issues.length === 0) {
    issues.push({
      severity: 'information',
      code: 'informational',
      details: { text: 'Resource is valid' },
    })
  }

  return {
    resourceType: 'OperationOutcome',
    id: `validation-${Date.now()}`,
    issue: issues,
  }
}

/* ─────────── Demo FHIR Data ─────────── */

export const demoFHIRPatients: FHIRPatient[] = [
  {
    resourceType: 'Patient',
    id: 'hf-patient-P-2024-001',
    meta: {
      versionId: '1',
      lastUpdated: '2026-05-10T08:00:00Z',
      profile: ['http://hl7.org/fhir/StructureDefinition/Patient'],
    },
    identifier: [
      { use: 'official', system: GUINEA_FHIR_SYSTEMS.healthflowId, value: 'P-2024-001' },
      { use: 'official', system: GUINEA_FHIR_SYSTEMS.nationalId, value: 'GN-1998-0315-FD' },
      { use: 'secondary', system: GUINEA_FHIR_SYSTEMS.santepCard, value: 'QR-AD-281998' },
    ],
    active: true,
    name: [{ use: 'official', family: 'Diallo', given: ['Aminata'] }],
    telecom: [{ system: 'phone', value: '+224 622 11 22 33', use: 'mobile' }],
    gender: 'female',
    birthDate: '1998-03-15',
    address: [{ use: 'home', text: 'Conakry, Kaloum', country: 'GN' }],
    contact: [{
      relationship: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v2-0131', code: 'C', display: 'Emergency Contact' }] }],
      name: { text: 'Mamadou Diallo' },
      telecom: [{ system: 'phone', value: '+224 622 99 88 77', use: 'mobile' }],
    }],
  },
  {
    resourceType: 'Patient',
    id: 'hf-patient-P-2024-002',
    meta: {
      versionId: '1',
      lastUpdated: '2026-05-10T09:00:00Z',
    },
    identifier: [
      { use: 'official', system: GUINEA_FHIR_SYSTEMS.healthflowId, value: 'P-2024-002' },
      { use: 'official', system: GUINEA_FHIR_SYSTEMS.nationalId, value: 'GN-1980-0722-MC' },
    ],
    active: true,
    name: [{ use: 'official', family: 'Condé', given: ['Mamadou'] }],
    telecom: [{ system: 'phone', value: '+224 623 44 55 66', use: 'mobile' }],
    gender: 'male',
    birthDate: '1980-07-22',
    address: [{ use: 'home', text: 'Conakry, Dixinn', country: 'GN' }],
  },
]

export const demoFHIROrganizations: FHIROrganization[] = [
  {
    resourceType: 'Organization',
    id: 'hf-org-donka',
    identifier: [{ use: 'official', system: GUINEA_FHIR_SYSTEMS.establishment, value: 'donka' }],
    active: true,
    type: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/organization-type',
            code: 'prov',
            display: 'Healthcare Provider',
          },
        ],
        text: 'CHU',
      },
    ],
    name: 'Hôpital National Donka',
    telecom: [{ system: 'phone', value: '+224 630 00 00 01' }],
    address: [{ city: 'Conakry', district: 'Kaloum', country: 'GN' }],
  },
  {
    resourceType: 'Organization',
    id: 'hf-org-ignace-deen',
    identifier: [{ use: 'official', system: GUINEA_FHIR_SYSTEMS.establishment, value: 'ignace-deen' }],
    active: true,
    type: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/organization-type',
            code: 'prov',
            display: 'Healthcare Provider',
          },
        ],
        text: 'CHU',
      },
    ],
    name: 'Hôpital National Ignace Deen',
    telecom: [{ system: 'phone', value: '+224 630 00 00 02' }],
    address: [{ city: 'Conakry', district: 'Kaloum', country: 'GN' }],
  },
]

export const demoFHIRPractitioners: FHIRPractitioner[] = [
  {
    resourceType: 'Practitioner',
    id: 'hf-practitioner-diallo',
    identifier: [{ use: 'official', system: GUINEA_FHIR_SYSTEMS.healthflowId, value: 'DR-001' }],
    active: true,
    name: [{ use: 'official', family: 'Diallo', given: ['Mamadou'], prefix: ['Dr.'] }],
    telecom: [{ system: 'phone', value: '+224 622 00 00 00', use: 'work' }],
    gender: 'male',
    qualification: [{
      code: {
        coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v2-0360', code: 'MD', display: 'Doctor of Medicine' }],
        text: 'Médecin généraliste',
      },
    }],
  },
  {
    resourceType: 'Practitioner',
    id: 'hf-practitioner-toure',
    identifier: [{ use: 'official', system: GUINEA_FHIR_SYSTEMS.healthflowId, value: 'DR-002' }],
    active: true,
    name: [{ use: 'official', family: 'Touré', given: ['Ibrahima'], prefix: ['Dr.'] }],
    telecom: [{ system: 'phone', value: '+224 623 00 00 00', use: 'work' }],
    gender: 'male',
    qualification: [{
      code: {
        coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v2-0360', code: 'MD', display: 'Doctor of Medicine' }],
        text: 'Cardiologue',
      },
    }],
  },
]
