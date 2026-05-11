import { NextRequest, NextResponse } from 'next/server'
import {
  getCapabilityStatement,
  patientToFHIR,
  buildPatientBundle,
  validateFHIRResource,
  consultationToEncounter,
  labRequestToDiagnosticReport,
  labResultToObservation,
  prescriptionToMedicationRequest,
  demoFHIRPatients,
  demoFHIROrganizations,
  demoFHIRPractitioners,
  type FHIRBundle,
  type FHIROperationOutcome,
  type FHIRResource,
  type FHIRPatient,
  type FHIREncounter,
  type FHIRObservation,
  type FHIRDiagnosticReport,
  type FHIRMedicationRequest,
} from '@/lib/fhir'
import { useDataStore } from '@/lib/data-store'

const fhirHeaders = {
  'Content-Type': 'application/fhir+json',
  'X-Powered-By': 'HealthFlow Africa FHIR Server R4',
}

// In-memory resource store for FHIR server
const fhirResourceStore = new Map<string, FHIRResource>()

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const path = url.pathname.replace('/api/fhir', '').replace(/^\//, '').split('/')
  const resourceType = path[0] || ''
  const resourceId = path[1] || ''
  const operation = path[2] || ''

  // Capability Statement
  if (!resourceType || resourceType === 'metadata') {
    return NextResponse.json(getCapabilityStatement(), { headers: fhirHeaders })
  }

  // FHIR Operations
  if (operation.startsWith('$')) {
    return handleOperation(resourceType, resourceId, operation, url.searchParams)
  }

  const searchParams = url.searchParams

  // Single resource read
  if (resourceId) {
    return handleRead(resourceType, resourceId)
  }

  // Search
  return handleSearch(resourceType, searchParams)
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url)
  const path = url.pathname.replace('/api/fhir', '').replace(/^\//, '').split('/')
  const resourceType = path[0] || ''
  const resourceId = path[1] || ''
  const operation = resourceId?.startsWith('$') ? resourceId : path[2] || ''

  // FHIR Operations via POST
  if (operation.startsWith('$')) {
    return handleOperationPost(resourceType, operation, request)
  }

  try {
    const body = (await request.json()) as FHIRResource

    if (body.resourceType !== resourceType) {
      const outcome: FHIROperationOutcome = {
        resourceType: 'OperationOutcome',
        id: `error-${Date.now()}`,
        issue: [{ severity: 'error', code: 'invalid', details: { text: `Resource type mismatch: expected ${resourceType}, got ${body.resourceType}` } }],
      }
      return NextResponse.json(outcome, { status: 400, headers: fhirHeaders })
    }

    const validation = validateFHIRResource(body)
    const hasErrors = validation.issue.some((i) => i.severity === 'fatal' || i.severity === 'error')
    if (hasErrors) {
      return NextResponse.json(validation, { status: 400, headers: fhirHeaders })
    }

    const newId = body.id || `${resourceType.toLowerCase()}-${Date.now()}`
    const created = {
      ...body,
      id: newId,
      meta: { ...body.meta, versionId: '1', lastUpdated: new Date().toISOString() },
    }

    fhirResourceStore.set(`${resourceType}/${newId}`, created)

    return NextResponse.json(created, {
      status: 201,
      headers: {
        'Content-Type': 'application/fhir+json',
        Location: `https://healthflow-gn.com/fhir/${resourceType}/${newId}`,
        ETag: 'W/"1"',
      },
    })
  } catch {
    const outcome: FHIROperationOutcome = {
      resourceType: 'OperationOutcome',
      id: `error-${Date.now()}`,
      issue: [{ severity: 'fatal', code: 'structure', details: { text: 'Invalid JSON body' } }],
    }
    return NextResponse.json(outcome, { status: 400, headers: fhirHeaders })
  }
}

export async function PUT(request: NextRequest) {
  const url = new URL(request.url)
  const path = url.pathname.replace('/api/fhir', '').replace(/^\//, '').split('/')
  const resourceType = path[0] || ''
  const resourceId = path[1] || ''

  if (!resourceId) {
    return NextResponse.json(errorOutcome('PUT requires a resource ID'), { status: 400, headers: fhirHeaders })
  }

  try {
    const body = (await request.json()) as FHIRResource

    if (body.resourceType !== resourceType) {
      return NextResponse.json(errorOutcome(`Resource type mismatch: expected ${resourceType}, got ${body.resourceType}`), { status: 400, headers: fhirHeaders })
    }

    const existing = findResource(resourceType, resourceId)
    const currentVersion = existing?.meta?.versionId ? parseInt(existing.meta.versionId) : 0

    const updated = {
      ...body,
      id: resourceId,
      meta: {
        ...body.meta,
        versionId: String(currentVersion + 1),
        lastUpdated: new Date().toISOString(),
      },
    }

    fhirResourceStore.set(`${resourceType}/${resourceId}`, updated)

    return NextResponse.json(updated, {
      headers: {
        'Content-Type': 'application/fhir+json',
        ETag: `W/"${currentVersion + 1}"`,
      },
    })
  } catch {
    return NextResponse.json(errorOutcome('Invalid JSON body'), { status: 400, headers: fhirHeaders })
  }
}

export async function DELETE(request: NextRequest) {
  const url = new URL(request.url)
  const path = url.pathname.replace('/api/fhir', '').replace(/^\//, '').split('/')
  const resourceType = path[0] || ''
  const resourceId = path[1] || ''

  if (!resourceId) {
    return NextResponse.json(errorOutcome('DELETE requires a resource ID'), { status: 400, headers: fhirHeaders })
  }

  const key = `${resourceType}/${resourceId}`
  if (fhirResourceStore.has(key)) {
    fhirResourceStore.delete(key)
    return NextResponse.json({
      resourceType: 'OperationOutcome',
      id: `delete-${Date.now()}`,
      issue: [{ severity: 'information', code: 'informational', details: { text: `${resourceType}/${resourceId} deleted successfully` } }],
    }, { headers: fhirHeaders })
  }

  return NextResponse.json(notFound(resourceType, resourceId), { status: 404, headers: fhirHeaders })
}

/* ─────────── FHIR Operations ─────────── */

function handleOperation(resourceType: string, resourceId: string, operation: string, params: URLSearchParams): NextResponse {
  switch (operation) {
    case '$validate': {
      const resource = findResource(resourceType, resourceId)
      if (!resource) {
        const validation = validateFHIRResource({ resourceType, id: resourceId } as FHIRResource)
        return NextResponse.json(validation, { headers: fhirHeaders })
      }
      const result = validateFHIRResource(resource)
      return NextResponse.json(result, { headers: fhirHeaders })
    }

    case '$everything': {
      if (resourceType !== 'Patient') {
        return NextResponse.json(errorOutcome('$everything is only supported for Patient resource'), { status: 400, headers: fhirHeaders })
      }
      return handlePatientEverything(resourceId)
    }

    case '$export': {
      return handleBulkExport(resourceType, params)
    }

    default:
      return NextResponse.json(errorOutcome(`Operation '${operation}' is not supported`), { status: 400, headers: fhirHeaders })
  }
}

function handleOperationPost(resourceType: string, operation: string, request: NextRequest): NextResponse {
  switch (operation) {
    case '$validate': {
      // Validate a resource provided in the request body
      // This is handled synchronously since we can't easily read body in a sync function
      return NextResponse.json({
        resourceType: 'OperationOutcome',
        id: `validate-${Date.now()}`,
        issue: [{ severity: 'information', code: 'informational', details: { text: 'Use POST /fhir/$validate with a resource body to validate' } }],
      }, { headers: fhirHeaders })
    }

    default:
      return NextResponse.json(errorOutcome(`Operation '${operation}' is not supported`), { status: 400, headers: fhirHeaders })
  }
}

function handlePatientEverything(patientId: string): NextResponse {
  const store = useDataStore.getState()
  const patient = store.patients.find((p) => p.id === patientId || `hf-patient-${p.id}` === patientId)

  if (!patient) {
    return NextResponse.json(notFound('Patient', patientId), { status: 404, headers: fhirHeaders })
  }

  const entries: FHIRBundle['entry'] = []

  // Patient
  const fhirPatient = patientToFHIR(patient)
  entries.push({ fullUrl: `https://healthflow-gn.com/fhir/Patient/${fhirPatient.id}`, resource: fhirPatient })

  // Encounters
  const consultations = store.consultations.filter((c) => c.patientId === patient.id)
  for (const consult of consultations) {
    const encounter = consultationToEncounter(consult)
    entries.push({ fullUrl: `https://healthflow-gn.com/fhir/Encounter/${encounter.id}`, resource: encounter })

    // MedicationRequests
    for (const rx of consult.prescriptions) {
      const medReq = prescriptionToMedicationRequest(consult.id, rx, patient.id, `${patient.firstName} ${patient.lastName}`, consult.doctor, consult.date)
      entries.push({ fullUrl: `https://healthflow-gn.com/fhir/MedicationRequest/${medReq.id}`, resource: medReq })
    }
  }

  // DiagnosticReports + Observations
  const labRequests = store.labRequests.filter((l) => l.patientId === patient.id)
  for (const lab of labRequests) {
    const report = labRequestToDiagnosticReport(lab)
    entries.push({ fullUrl: `https://healthflow-gn.com/fhir/DiagnosticReport/${report.id}`, resource: report })

    for (const result of lab.results) {
      const obs = labResultToObservation(lab.id, result, lab.date, patient.id, `${patient.firstName} ${patient.lastName}`, lab.doctor)
      entries.push({ fullUrl: `https://healthflow-gn.com/fhir/Observation/${obs.id}`, resource: obs })
    }
  }

  const bundle: FHIRBundle = {
    resourceType: 'Bundle',
    id: `everything-patient-${patient.id}-${Date.now()}`,
    type: 'searchset',
    total: entries.length,
    link: [
      { relation: 'self', url: `https://healthflow-gn.com/fhir/Patient/${patientId}/$everything` },
    ],
    entry: entries,
  }

  return NextResponse.json(bundle, { headers: fhirHeaders })
}

function handleBulkExport(resourceType: string, params: URLSearchParams): NextResponse {
  const store = useDataStore.getState()
  const entries: FHIRBundle['entry'] = []

  if (!resourceType || resourceType === 'Patient' || resourceType === '*') {
    const fhirPatients = store.patients.map(patientToFHIR)
    for (const p of fhirPatients) {
      entries.push({ fullUrl: `https://healthflow-gn.com/fhir/Patient/${p.id}`, resource: p })
    }
  }

  if (!resourceType || resourceType === 'Encounter' || resourceType === '*') {
    const encounters = store.consultations.map(consultationToEncounter)
    for (const e of encounters) {
      entries.push({ fullUrl: `https://healthflow-gn.com/fhir/Encounter/${e.id}`, resource: e })
    }
  }

  if (!resourceType || resourceType === 'Observation' || resourceType === '*') {
    for (const lab of store.labRequests) {
      for (const result of lab.results) {
        const obs = labResultToObservation(lab.id, result, lab.date, lab.patientId, lab.patientName, lab.doctor)
        entries.push({ fullUrl: `https://healthflow-gn.com/fhir/Observation/${obs.id}`, resource: obs })
      }
    }
  }

  const bundle: FHIRBundle = {
    resourceType: 'Bundle',
    id: `export-${Date.now()}`,
    type: 'collection',
    total: entries.length,
    link: [{ relation: 'self', url: `https://healthflow-gn.com/fhir/$export` }],
    entry: entries,
  }

  return NextResponse.json(bundle, { headers: fhirHeaders })
}

/* ─────────── Helpers ─────────── */

function findResource(resourceType: string, resourceId: string): FHIRResource | null {
  const key = `${resourceType}/${resourceId}`
  if (fhirResourceStore.has(key)) return fhirResourceStore.get(key)!

  // Search in demo data
  switch (resourceType) {
    case 'Patient':
      return demoFHIRPatients.find((p) => p.id === resourceId) || null
    case 'Organization':
      return demoFHIROrganizations.find((o) => o.id === resourceId) || null
    case 'Practitioner':
      return demoFHIRPractitioners.find((p) => p.id === resourceId) || null
    default:
      return null
  }
}

function handleRead(resourceType: string, resourceId: string): NextResponse {
  const resource = findResource(resourceType, resourceId)
  if (resource) {
    return NextResponse.json(resource, {
      headers: {
        ...fhirHeaders,
        ETag: `W/"${resource.meta?.versionId || '1'}"`,
      },
    })
  }

  // Try from data store
  if (resourceType === 'Patient') {
    const store = useDataStore.getState()
    const internal = store.patients.find((p) => `hf-patient-${p.id}` === resourceId || p.id === resourceId)
    if (internal) return NextResponse.json(patientToFHIR(internal), { headers: fhirHeaders })
  }

  return NextResponse.json(notFound(resourceType, resourceId), { status: 404, headers: fhirHeaders })
}

function handleSearch(resourceType: string, params: URLSearchParams): NextResponse {
  switch (resourceType) {
    case 'Patient': {
      const store = useDataStore.getState()
      let patients = store.patients
      const nameParam = params.get('name')
      if (nameParam) {
        const q = nameParam.toLowerCase()
        patients = patients.filter((p) => p.firstName.toLowerCase().includes(q) || p.lastName.toLowerCase().includes(q))
      }
      const identifier = params.get('identifier')
      if (identifier) {
        patients = patients.filter((p) => p.id === identifier || p.nationalId === identifier)
      }
      const gender = params.get('gender')
      if (gender) {
        patients = patients.filter((p) => (gender === 'male' ? p.gender === 'M' : p.gender === 'F'))
      }
      const birthdate = params.get('birthdate')
      if (birthdate) {
        patients = patients.filter((p) => p.dateOfBirth === birthdate)
      }
      const phone = params.get('phone')
      if (phone) {
        patients = patients.filter((p) => p.phone.includes(phone))
      }
      const fhirPatients = patients.map(patientToFHIR)
      const bundle: FHIRBundle = {
        resourceType: 'Bundle',
        id: `search-patient-${Date.now()}`,
        type: 'searchset',
        total: fhirPatients.length,
        link: [{ relation: 'self', url: `https://healthflow-gn.com/fhir/Patient?${params.toString()}` }],
        entry: fhirPatients.map((p) => ({
          fullUrl: `https://healthflow-gn.com/fhir/Patient/${p.id}`,
          resource: p,
          search: { mode: 'match' as const },
        })),
      }
      return NextResponse.json(bundle, { headers: fhirHeaders })
    }
    case 'Encounter': {
      const store = useDataStore.getState()
      let consultations = store.consultations
      const patientParam = params.get('patient')
      if (patientParam) {
        const pid = patientParam.replace('hf-patient-', '')
        consultations = consultations.filter((c) => c.patientId === pid)
      }
      const statusParam = params.get('status')
      if (statusParam) {
        const statusMap: Record<string, string> = { planned: 'En attente', 'in-progress': 'En cours', finished: 'Terminée' }
        consultations = consultations.filter((c) => c.status === statusMap[statusParam])
      }
      const encounters = consultations.map(consultationToEncounter)
      const bundle: FHIRBundle = {
        resourceType: 'Bundle',
        id: `search-encounter-${Date.now()}`,
        type: 'searchset',
        total: encounters.length,
        entry: encounters.map((e) => ({
          fullUrl: `https://healthflow-gn.com/fhir/Encounter/${e.id}`,
          resource: e,
          search: { mode: 'match' as const },
        })),
      }
      return NextResponse.json(bundle, { headers: fhirHeaders })
    }
    case 'Observation': {
      const store = useDataStore.getState()
      let labRequests = store.labRequests
      const patientParam = params.get('patient')
      if (patientParam) {
        const pid = patientParam.replace('hf-patient-', '')
        labRequests = labRequests.filter((l) => l.patientId === pid)
      }
      const observations: FHIRObservation[] = []
      for (const lab of labRequests) {
        for (const result of lab.results) {
          observations.push(labResultToObservation(lab.id, result, lab.date, lab.patientId, lab.patientName, lab.doctor))
        }
      }
      const bundle: FHIRBundle = {
        resourceType: 'Bundle',
        id: `search-observation-${Date.now()}`,
        type: 'searchset',
        total: observations.length,
        entry: observations.map((o) => ({
          fullUrl: `https://healthflow-gn.com/fhir/Observation/${o.id}`,
          resource: o,
          search: { mode: 'match' as const },
        })),
      }
      return NextResponse.json(bundle, { headers: fhirHeaders })
    }
    case 'DiagnosticReport': {
      const store = useDataStore.getState()
      let labRequests = store.labRequests
      const patientParam = params.get('patient')
      if (patientParam) {
        const pid = patientParam.replace('hf-patient-', '')
        labRequests = labRequests.filter((l) => l.patientId === pid)
      }
      const reports = labRequests.map(labRequestToDiagnosticReport)
      const bundle: FHIRBundle = {
        resourceType: 'Bundle',
        id: `search-report-${Date.now()}`,
        type: 'searchset',
        total: reports.length,
        entry: reports.map((r) => ({
          fullUrl: `https://healthflow-gn.com/fhir/DiagnosticReport/${r.id}`,
          resource: r,
          search: { mode: 'match' as const },
        })),
      }
      return NextResponse.json(bundle, { headers: fhirHeaders })
    }
    case 'MedicationRequest': {
      const store = useDataStore.getState()
      const medRequests: FHIRMedicationRequest[] = []
      for (const consult of store.consultations) {
        for (const rx of consult.prescriptions) {
          medRequests.push(prescriptionToMedicationRequest(consult.id, rx, consult.patientId, consult.patientName, consult.doctor, consult.date))
        }
      }
      const bundle: FHIRBundle = {
        resourceType: 'Bundle',
        id: `search-medreq-${Date.now()}`,
        type: 'searchset',
        total: medRequests.length,
        entry: medRequests.map((m) => ({
          fullUrl: `https://healthflow-gn.com/fhir/MedicationRequest/${m.id}`,
          resource: m,
          search: { mode: 'match' as const },
        })),
      }
      return NextResponse.json(bundle, { headers: fhirHeaders })
    }
    case 'Organization': {
      const bundle: FHIRBundle = {
        resourceType: 'Bundle',
        id: `search-org-${Date.now()}`,
        type: 'searchset',
        total: demoFHIROrganizations.length,
        entry: demoFHIROrganizations.map((o) => ({
          fullUrl: `https://healthflow-gn.com/fhir/Organization/${o.id}`,
          resource: o,
          search: { mode: 'match' as const },
        })),
      }
      return NextResponse.json(bundle, { headers: fhirHeaders })
    }
    case 'Practitioner': {
      const bundle: FHIRBundle = {
        resourceType: 'Bundle',
        id: `search-pract-${Date.now()}`,
        type: 'searchset',
        total: demoFHIRPractitioners.length,
        entry: demoFHIRPractitioners.map((p) => ({
          fullUrl: `https://healthflow-gn.com/fhir/Practitioner/${p.id}`,
          resource: p,
          search: { mode: 'match' as const },
        })),
      }
      return NextResponse.json(bundle, { headers: fhirHeaders })
    }
    default: {
      const outcome: FHIROperationOutcome = {
        resourceType: 'OperationOutcome',
        id: `error-${Date.now()}`,
        issue: [{ severity: 'error', code: 'not-supported', details: { text: `Resource type '${resourceType}' is not supported for search` } }],
      }
      return NextResponse.json(outcome, { status: 400, headers: fhirHeaders })
    }
  }
}

function notFound(resourceType: string, id: string): FHIROperationOutcome {
  return {
    resourceType: 'OperationOutcome',
    id: `notfound-${Date.now()}`,
    issue: [{ severity: 'error', code: 'not-found', details: { text: `${resourceType}/${id} not found` } }],
  }
}

function errorOutcome(message: string): FHIROperationOutcome {
  return {
    resourceType: 'OperationOutcome',
    id: `error-${Date.now()}`,
    issue: [{ severity: 'error', code: 'processing', details: { text: message } }],
  }
}
