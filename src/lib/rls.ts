// HealthFlow Africa - Row Level Security (RLS)
// Applies row-level filters to data queries based on user role and context

import { type HFRole, hasPermission } from './rbac'

export interface RLSContext {
  userId: string
  role: HFRole
  establishmentId?: string
  patientId?: string // For patient role - their own ID
}

/**
 * Apply row-level security filters to a data query
 * Returns a filter object to be applied to data queries
 */
export function applyRLS(context: RLSContext, resource: string): Record<string, unknown> {
  const { role, userId, establishmentId, patientId } = context
  const filter: Record<string, unknown> = {}

  switch (resource) {
    case 'patients':
      if (role === 'Patient') {
        filter['id'] = patientId // Patients see ONLY their own data
      } else if (role === 'Médecin') {
        // Doctors see their patients + unassigned
        filter['$or'] = [
          { assignedDoctorId: userId },
          { assignedDoctorId: null },
          { assignedDoctorId: { exists: false } },
        ]
      } else if (role === 'Infirmier') {
        // Nurses see assigned patients only
        filter['assignedNurseId'] = userId
      } else if (role === 'Secrétaire') {
        // Secretaries see basic info only (filtered at field level in filterPatientData)
        // No row-level restriction, field-level filtering applies
      } else if (role === 'ASC') {
        // ASC sees patients in their community zone
        filter['$or'] = [
          { ascId: userId },
          { communityZone: { exists: true } },
        ]
      }
      // Admin sees all, Lab/Pharmacist see restricted
      break

    case 'consultations':
      if (role === 'Patient') {
        filter['patientId'] = patientId
      } else if (role === 'Médecin') {
        filter['$or'] = [
          { doctorId: userId },
          { patientId: { $in: 'assignedPatients' } },
        ]
      } else if (role === 'Infirmier') {
        // Nurses see consultations for their assigned patients
        filter['nurseId'] = userId
      }
      break

    case 'billing':
      if (role === 'Patient') {
        filter['patientId'] = patientId
      } else if (role !== 'Administrateur') {
        // Non-admin staff see only their facility's invoices
        if (establishmentId) {
          filter['establishmentId'] = establishmentId
        }
      }
      break

    case 'laboratory':
      if (role === 'Patient') {
        filter['patientId'] = patientId
      } else if (role === 'Médecin') {
        // Doctors see their own orders
        filter['requestingDoctorId'] = userId
      } else if (role === 'Laborantin') {
        // Lab techs see assigned tests
        filter['assignedLabTechId'] = userId
      }
      break

    case 'prescriptions':
      if (role === 'Patient') {
        filter['patientId'] = patientId
      } else if (role === 'Médecin') {
        filter['doctorId'] = userId
      }
      // Pharmacists see all for dispensing (no row restriction)
      break

    case 'telemedicine':
      if (role === 'Patient') {
        filter['patientId'] = patientId
      } else if (role === 'Médecin') {
        filter['doctorId'] = userId
      }
      break
  }

  return filter
}

/**
 * Filter patient record fields by role
 * Returns a new object with only the fields the role is allowed to see
 */
export function filterPatientData<T extends Record<string, unknown>>(patient: T, role: HFRole): Partial<T> {
  if (role === 'Administrateur') return patient

  // Define which fields each role can see for patient records
  const fieldAccess: Record<HFRole, string[]> = {
    'Administrateur': Object.keys(patient), // full access
    'Médecin': ['id', 'qrCode', 'firstName', 'lastName', 'dateOfBirth', 'gender', 'phone', 'address', 'nationalId', 'bloodType', 'emergencyContact', 'emergencyPhone', 'allergies', 'medicalHistory', 'surgicalHistory', 'familyHistory', 'documents', 'status', 'reason', 'lastVisit', 'registrationDate'],
    'Infirmier': ['id', 'qrCode', 'firstName', 'lastName', 'dateOfBirth', 'gender', 'phone', 'bloodType', 'allergies', 'status', 'reason', 'lastVisit'],
    'Laborantin': ['id', 'qrCode', 'firstName', 'lastName', 'dateOfBirth', 'gender'],
    'Pharmacien': ['id', 'qrCode', 'firstName', 'lastName', 'dateOfBirth', 'gender', 'allergies', 'bloodType'],
    'Secrétaire': ['id', 'qrCode', 'firstName', 'lastName', 'dateOfBirth', 'gender', 'phone', 'address', 'status', 'lastVisit', 'registrationDate'],
    'ASC': ['id', 'qrCode', 'firstName', 'lastName', 'dateOfBirth', 'gender', 'phone', 'address', 'bloodType', 'allergies', 'status', 'reason'],
    'Patient': Object.keys(patient), // own full data
  }

  const allowedFields = fieldAccess[role] || []
  const filtered: Record<string, unknown> = {}

  for (const key of allowedFields) {
    if (key in patient) {
      filtered[key] = patient[key]
    }
  }

  return filtered as Partial<T>
}

/**
 * Mask sensitive fields in data
 * Masks: SSN/nationalId, HIV status, mental health info for unauthorized roles
 */
export function maskSensitiveFields<T extends Record<string, unknown>>(data: T, role: HFRole): T {
  if (role === 'Administrateur' || role === 'Médecin') return data

  const masked: Record<string, unknown> = { ...data }
  const sensitiveFields = ['nationalId', 'ssn', 'socialSecurityNumber']
  const medicalSensitiveFields = ['hivStatus', 'mentalHealthHistory', 'psychiatricHistory', 'substanceAbuseHistory']

  // Mask SSN/nationalId for all except Admin and Doctor
  if (role !== 'Patient') {
    for (const field of sensitiveFields) {
      if (field in masked && masked[field]) {
        const val = String(masked[field])
        masked[field] = val.length > 4 ? '****' + val.slice(-4) : '****'
      }
    }
  }

  // Mask HIV/mental health for non-medical staff
  if (role !== 'Infirmier') {
    for (const field of medicalSensitiveFields) {
      if (field in masked) {
        masked[field] = '[CONFIDENTIEL]'
      }
    }
  }

  return masked as T
}

/**
 * Check if a user can access a specific record
 */
export function canAccessRecord(
  context: RLSContext,
  resource: string,
  record: { patientId?: string; doctorId?: string; userId?: string; establishmentId?: string }
): boolean {
  const { role, userId, patientId, establishmentId } = context

  if (role === 'Administrateur') return true

  if (role === 'Patient') {
    return record.patientId === patientId
  }

  if (resource === 'patients') {
    if (hasPermission(role, 'patients', 'read')) return true
    return false
  }

  if (resource === 'consultations' || resource === 'telemedicine') {
    if (record.doctorId === userId) return true
    if (record.patientId === patientId) return true
    return hasPermission(role, resource as 'consultations' | 'telemedicine', 'read')
  }

  // Check establishment scope
  if (establishmentId && record.establishmentId && record.establishmentId !== establishmentId) {
    return false
  }

  return true
}
