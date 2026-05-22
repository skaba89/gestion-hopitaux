// HealthFlow Guinea — Demo Users for DEMO_MODE
// These accounts work without any database connection.

export interface DemoUser {
  id: string
  email: string
  password: string
  phone: string
  firstName: string
  lastName: string
  role: string
  establishmentId: string
  establishmentName: string
  avatarUrl?: string
}

export const demoUsers: DemoUser[] = [
  {
    id: 'demo-admin-001',
    email: 'admin@healthflow-gn.com',
    password: 'Admin123!',
    phone: '+224622000001',
    firstName: 'Mamadou',
    lastName: 'Bah',
    role: 'ADMIN',
    establishmentId: 'est-donka',
    establishmentName: 'Hôpital National Donka',
  },
  {
    id: 'demo-doctor-001',
    email: 'dr.bah@healthflow-gn.com',
    password: 'Doctor123!',
    phone: '+224622000002',
    firstName: 'Abdoulaye',
    lastName: 'Bah',
    role: 'DOCTOR',
    establishmentId: 'est-donka',
    establishmentName: 'Hôpital National Donka',
  },
  {
    id: 'demo-nurse-001',
    email: 'inf.sow@healthflow-gn.com',
    password: 'Nurse123!',
    phone: '+224622000003',
    firstName: 'Mariama',
    lastName: 'Sow',
    role: 'NURSE',
    establishmentId: 'est-donka',
    establishmentName: 'Hôpital National Donka',
  },
  {
    id: 'demo-pharmacist-001',
    email: 'pharma.toure@healthflow-gn.com',
    password: 'Pharma123!',
    phone: '+224622000004',
    firstName: 'Ibrahima',
    lastName: 'Touré',
    role: 'PHARMACIST',
    establishmentId: 'est-donka',
    establishmentName: 'Hôpital National Donka',
  },
  {
    id: 'demo-lab-001',
    email: 'lab.camara@healthflow-gn.com',
    password: 'Lab123!',
    phone: '+224622000005',
    firstName: 'Fatoumata',
    lastName: 'Camara',
    role: 'LAB_TECH',
    establishmentId: 'est-donka',
    establishmentName: 'Hôpital National Donka',
  },
  {
    id: 'demo-secretary-001',
    email: 'reception.cisse@healthflow-gn.com',
    password: 'Reception123!',
    phone: '+224622000006',
    firstName: 'Aissatou',
    lastName: 'Cissé',
    role: 'SECRETARY',
    establishmentId: 'est-donka',
    establishmentName: 'Hôpital National Donka',
  },
  {
    id: 'demo-accountant-001',
    email: 'compta.keita@healthflow-gn.com',
    password: 'Compta123!',
    phone: '+224622000007',
    firstName: 'Ousmane',
    lastName: 'Keita',
    role: 'ACCOUNTANT',
    establishmentId: 'est-donka',
    establishmentName: 'Hôpital National Donka',
  },
  {
    id: 'demo-biologist-001',
    email: 'bio.diallo@healthflow-gn.com',
    password: 'Bio123!',
    phone: '+224622000008',
    firstName: 'Thierno',
    lastName: 'Diallo',
    role: 'BIOLOGIST',
    establishmentId: 'est-donka',
    establishmentName: 'Hôpital National Donka',
  },
]

// Map role to display name in French
export const roleDisplayNames: Record<string, string> = {
  ADMIN: 'Administrateur',
  DOCTOR: 'Médecin',
  NURSE: 'Infirmier(e)',
  PHARMACIST: 'Pharmacien(ne)',
  LAB_TECH: 'Technicien Labo',
  SECRETARY: 'Secrétaire',
  ACCOUNTANT: 'Comptable',
  BIOLOGIST: 'Biologiste',
}

// Map role to icon color for UI
export const roleColors: Record<string, string> = {
  ADMIN: 'from-purple-500 to-indigo-600',
  DOCTOR: 'from-teal-500 to-emerald-600',
  NURSE: 'from-sky-500 to-blue-600',
  PHARMACIST: 'from-amber-500 to-orange-600',
  LAB_TECH: 'from-rose-500 to-pink-600',
  SECRETARY: 'from-cyan-500 to-teal-600',
  ACCOUNTANT: 'from-emerald-500 to-green-600',
  BIOLOGIST: 'from-violet-500 to-purple-600',
}

/**
 * Find a demo user by email and password
 */
export function findDemoUser(email: string, password: string): DemoUser | null {
  return demoUsers.find(u => u.email === email && u.password === password) || null
}

/**
 * Find a demo user by phone number
 */
export function findDemoUserByPhone(phone: string): DemoUser | null {
  const normalized = phone.replace(/\D/g, '')
  return demoUsers.find(u => {
    const userPhone = u.phone.replace(/\D/g, '')
    return userPhone === normalized || userPhone.endsWith(normalized.slice(-9))
  }) || null
}

/**
 * Check if we're running in demo mode
 * Also detects demo mode when DATABASE_URL is missing (Netlify runtime may not have DEMO_MODE set)
 */
export function isDemoMode(): boolean {
  if (process.env.DEMO_MODE === 'true') return true
  // Fallback: if no PostgreSQL URL is available, we're in demo mode
  const dbUrl = process.env.DATABASE_URL || ''
  const hasPostgres = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')
  if (!hasPostgres && process.env.NODE_ENV === 'production') return true
  return false
}

/**
 * Check if we're running in demo mode (client-side)
 * Uses NEXT_PUBLIC_DEMO_MODE which is exposed via next.config.ts env
 */
export function isDemoModeClient(): boolean {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
  }
  return isDemoMode()
}

/**
 * Generate a demo JWT-like token for client-side demo mode.
 * This is NOT a real JWT — it's a placeholder that lets the api-client
 * include an Authorization header so demo API routes don't reject the request.
 * In production, real JWTs are generated server-side via jose.
 */
export function generateDemoToken(userId: string, role: string): string {
  // Simple base64-encoded JSON — just enough for the server to identify demo requests
  const payload = {
    sub: userId,
    role,
    demo: true,
    iat: Date.now(),
    exp: Date.now() + 12 * 60 * 60 * 1000, // 12 hours
  }
  return `demo.${btoa(JSON.stringify(payload))}`
}
