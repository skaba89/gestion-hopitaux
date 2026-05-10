import { NextRequest, NextResponse } from 'next/server'
import {
  getCapabilityStatement,
  patientToFHIR,
  buildPatientBundle,
  validateFHIRResource,
  demoFHIRPatients,
  demoFHIROrganizations,
  demoFHIRPractitioners,
  type FHIRBundle,
  type FHIROperationOutcome,
  type FHIRResource,
} from '@/lib/fhir'
import { useDataStore } from '@/lib/data-store'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const path = url.pathname.replace('/api/fhir', '').replace(/^\//, '').split('/')
  const resourceType = path[0] || ''
  const resourceId = path[1] || ''

  const fhirHeaders = {
    'Content-Type': 'application/fhir+json',
    'X-Powered-By': 'HealthFlow Africa FHIR Server R4',
  }

  // Capability Statement
  if (!resourceType || resourceType === 'metadata') {
    return NextResponse.json(getCapabilityStatement(), { headers: fhirHeaders })
  }

  const searchParams = url.searchParams

  // Single resource read
  if (resourceId) {
    return handleRead(resourceType, resourceId, fhirHeaders)
  }

  // Search
  return handleSearch(resourceType, searchParams, fhirHeaders)
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url)
  const path = url.pathname.replace('/api/fhir', '').replace(/^\//, '').split('/')
  const resourceType = path[0] || ''
  const fhirHeaders = { 'Content-Type': 'application/fhir+json' }

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

    const newId = `${resourceType.toLowerCase()}-${Date.now()}`
    const created = {
      ...body,
      id: newId,
      meta: { ...body.meta, versionId: '1', lastUpdated: new Date().toISOString() },
    }

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

function handleRead(resourceType: string, resourceId: string, headers: Record<string, string>): NextResponse {
  switch (resourceType) {
    case 'Patient': {
      const patient = demoFHIRPatients.find((p) => p.id === resourceId)
      if (patient) return NextResponse.json(patient, { headers })
      const store = useDataStore.getState()
      const internal = store.patients.find((p) => `hf-patient-${p.id}` === resourceId)
      if (internal) return NextResponse.json(patientToFHIR(internal), { headers })
      return NextResponse.json(notFound('Patient', resourceId), { status: 404, headers })
    }
    case 'Organization': {
      const org = demoFHIROrganizations.find((o) => o.id === resourceId)
      if (org) return NextResponse.json(org, { headers })
      return NextResponse.json(notFound('Organization', resourceId), { status: 404, headers })
    }
    case 'Practitioner': {
      const pract = demoFHIRPractitioners.find((p) => p.id === resourceId)
      if (pract) return NextResponse.json(pract, { headers })
      return NextResponse.json(notFound('Practitioner', resourceId), { status: 404, headers })
    }
    default:
      return NextResponse.json(notFound(resourceType, resourceId), { status: 404, headers })
  }
}

function handleSearch(resourceType: string, params: URLSearchParams, headers: Record<string, string>): NextResponse {
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
      return NextResponse.json(bundle, { headers })
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
      return NextResponse.json(bundle, { headers })
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
      return NextResponse.json(bundle, { headers })
    }
    default: {
      const outcome: FHIROperationOutcome = {
        resourceType: 'OperationOutcome',
        id: `error-${Date.now()}`,
        issue: [{ severity: 'error', code: 'not-supported', details: { text: `Resource type '${resourceType}' is not supported` } }],
      }
      return NextResponse.json(outcome, { status: 400, headers })
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
