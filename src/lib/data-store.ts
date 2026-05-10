import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/* ─────────── Types ─────────── */

export interface Allergy { name: string; severity: 'Mineur' | 'Majeur' | 'Critique' }
export interface MedicalDocument {
  name: string
  date: string
  type: string
  size?: string
  category?: 'Résultat' | 'Ordonnance' | 'Imagerie' | 'Certificat' | 'Autre'
  confidential?: boolean
  uploadedBy?: string
}

/* ─────────── Document Access Control ─────────── */

export type UserRole = 'Administrateur' | 'Médecin' | 'Infirmier' | 'Laborantin' | 'Pharmacien' | 'Secrétaire'

export const ROLE_PERMISSIONS: Record<UserRole, { canDownload: boolean; canView: boolean; canUpload: boolean; canDelete: boolean; needsAuthorization: boolean }> = {
  'Administrateur': { canDownload: true, canView: true, canUpload: true, canDelete: true, needsAuthorization: false },
  'Médecin': { canDownload: false, canView: true, canUpload: true, canDelete: false, needsAuthorization: true },
  'Infirmier': { canDownload: false, canView: true, canUpload: false, canDelete: false, needsAuthorization: true },
  'Laborantin': { canDownload: false, canView: false, canUpload: true, canDelete: false, needsAuthorization: true },
  'Pharmacien': { canDownload: false, canView: false, canUpload: false, canDelete: false, needsAuthorization: true },
  'Secrétaire': { canDownload: false, canView: true, canUpload: true, canDelete: false, needsAuthorization: true },
}

export interface DocumentAuthorization {
  id: string
  documentName: string
  patientId: string
  patientName: string
  requestedBy: string
  requestedByRole: UserRole
  reason: string
  status: 'En attente' | 'Approuvée' | 'Refusée'
  requestedAt: string
  reviewedBy?: string
  reviewedAt?: string
  reviewNote?: string
}

export interface Patient {
  id: string
  qrCode: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: 'M' | 'F'
  phone: string
  address: string
  nationalId: string
  bloodType: string
  emergencyContact: string
  emergencyPhone: string
  lastVisit: string
  status: 'Actif' | 'Inactif' | 'Archivé'
  reason: string
  allergies: Allergy[]
  medicalHistory: string[]
  surgicalHistory: string[]
  familyHistory: string[]
  documents: MedicalDocument[]
  registrationDate: string
}

export interface Appointment {
  id: string
  patientName: string
  patientId: string
  doctor: string
  date: string
  time: string
  duration: number
  type: string
  status: 'Planifié' | 'Confirmé' | 'En cours' | 'Terminé' | 'Annulé' | 'Non honoré'
  reason: string
  notes: string
}

export interface Consultation {
  id: string
  patientName: string
  patientId: string
  doctor: string
  date: string
  time: string
  reason: string
  diagnosis: string
  status: 'En attente' | 'En cours' | 'Terminée'
  vitals: { ta: string; fc: string; temp: string; spo2: string; poids: string }
  prescriptions: { medication: string; dosage: string; duration: string; instructions: string }[]
}

export interface LabRequest {
  id: string
  patientName: string
  patientId: string
  doctor: string
  date: string
  type: string
  status: 'En attente' | 'En cours' | 'Terminé' | 'Validé'
  priority: 'Normal' | 'Urgent' | 'Stat'
  results: { name: string; value: string; unit: string; normalRange: string; abnormal: boolean }[]
}

export interface Medication {
  id: string
  name: string
  category: string
  dosage: string
  stock: number
  maxStock: number
  unit: string
  price: number
  expiryDate: string
  supplier: string
}

export interface BedUnit {
  id: string
  number: string
  service: string
  status: 'Libre' | 'Occupé' | 'Réservé' | 'En nettoyage'
  patient: string | null
  patientId: string | null
  admissionDate: string | null
}

export interface EmergencyCase {
  id: string
  patientName: string
  patientId: string
  arrivalTime: string
  triageLevel: 'Rouge' | 'Orange' | 'Jaune' | 'Vert' | 'Bleu'
  reason: string
  status: 'En attente' | 'Pris en charge' | 'En cours' | 'Terminé' | 'Transféré'
  doctor: string | null
}

export interface Pregnancy {
  id: string
  motherName: string
  motherId: string
  term: number
  dueDate: string
  riskLevel: 'Faible' | 'Moyen' | 'Élevé'
  lastVisit: string
  status: 'En cours' | 'Terminée' | 'Suivi post-partum'
  visits: { date: string; term: number; weight: string; bp: string; notes: string }[]
}

export interface VaccineRecord {
  id: string
  childName: string
  childId: string
  dateOfBirth: string
  vaccines: { name: string; scheduledDate: string; administeredDate: string | null; status: 'Planifié' | 'Fait' | 'En retard' }[]
}

export interface Invoice {
  id: string
  patientName: string
  patientId: string
  date: string
  items: { description: string; quantity: number; unitPrice: number; total: number }[]
  total: number
  status: 'En attente' | 'Payée' | 'Partielle' | 'Annulée'
  paymentMethod: string | null
  paidAmount: number
}

export interface TeleconsultSession {
  id: string
  patientName: string
  patientId: string
  doctor: string
  date: string
  time: string
  type: 'Vidéo' | 'Audio' | 'Chat'
  status: 'Planifiée' | 'En cours' | 'Terminée' | 'Annulée'
  notes: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error'
  time: string
  read: boolean
}

export interface FamilyAccount {
  id: string
  primaryPhone: string
  primaryName: string
  members: FamilyMember[]
  createdAt: string
  verificationCode: string // for demo: last 4 digits of phone
}

export interface FamilyMember {
  patientId: string
  relationship: 'Moi' | 'Conjoint' | 'Enfant' | 'Parent' | 'Frère/Sœur' | 'Autre'
  isPrimary: boolean
}

/* ─────────── Demo Data ─────────── */

const demoPatients: Patient[] = [
  {
    id: 'P-2024-001', qrCode: 'QR-AD-281998', firstName: 'Aminata', lastName: 'Diallo',
    dateOfBirth: '1998-03-15', gender: 'F', phone: '+224 622 11 22 33', address: 'Conakry, Kaloum',
    nationalId: 'GN-1998-0315-FD', bloodType: 'O+', emergencyContact: 'Mamadou Diallo',
    emergencyPhone: '+224 622 99 88 77', lastVisit: '2026-03-01', status: 'Actif', reason: 'Paludisme',
    allergies: [{ name: 'Pénicilline', severity: 'Critique' }, { name: 'Sulfamides', severity: 'Majeur' }],
    medicalHistory: ['Paludisme sévère (2024)', 'Anémie ferriprive'], surgicalHistory: [],
    familyHistory: ['Hypertension (mère)'],
    documents: [{ name: 'Résultats laboratoire', date: '2026-03-01', type: 'PDF' }, { name: 'Ordonnance', date: '2026-03-01', type: 'PDF' }],
    registrationDate: '2024-01-15',
  },
  {
    id: 'P-2024-002', qrCode: 'QR-MC-121980', firstName: 'Mamadou', lastName: 'Condé',
    dateOfBirth: '1980-07-22', gender: 'M', phone: '+224 623 44 55 66', address: 'Conakry, Dixinn',
    nationalId: 'GN-1980-0722-MC', bloodType: 'A+', emergencyContact: 'Fatoumata Condé',
    emergencyPhone: '+224 623 55 66 77', lastVisit: '2026-03-03', status: 'Actif', reason: 'Hypertension',
    allergies: [{ name: 'Aspirine', severity: 'Mineur' }],
    medicalHistory: ['Hypertension artérielle', 'Hypercholestérolémie'],
    surgicalHistory: ['Appendicectomie (2015)'], familyHistory: ['Diabète type 2 (père)', 'Hypertension (mère)'],
    documents: [{ name: 'ECG rapport', date: '2026-03-03', type: 'PDF' }, { name: 'Bilan lipidique', date: '2026-02-15', type: 'PDF' }],
    registrationDate: '2024-02-20',
  },
  {
    id: 'P-2024-003', qrCode: 'QR-FC-091993', firstName: 'Fatoumata', lastName: 'Camara',
    dateOfBirth: '1993-09-10', gender: 'F', phone: '+224 624 77 88 99', address: 'Conakry, Matam',
    nationalId: 'GN-1993-0910-FC', bloodType: 'B+', emergencyContact: 'Ibrahima Camara',
    emergencyPhone: '+224 624 88 99 00', lastVisit: '2026-02-28', status: 'Actif', reason: 'Diabète',
    allergies: [], medicalHistory: ['Diabète type 1', 'Rétinopathie diabétique'],
    surgicalHistory: [], familyHistory: ['Diabète (père et frère)'],
    documents: [{ name: 'Glycémie rapport', date: '2026-02-28', type: 'PDF' }],
    registrationDate: '2024-03-10',
  },
  {
    id: 'P-2024-004', qrCode: 'IB-20052005', firstName: 'Ibrahima', lastName: 'Bah',
    dateOfBirth: '2005-01-08', gender: 'M', phone: '+224 625 33 44 55', address: 'Conakry, Ratoma',
    nationalId: 'GN-2005-0108-IB', bloodType: 'AB+', emergencyContact: 'Mariama Bah',
    emergencyPhone: '+224 625 44 55 66', lastVisit: '2026-03-04', status: 'Actif', reason: 'Traumatisme',
    allergies: [], medicalHistory: ['Fracture tibia droit (2025)'],
    surgicalHistory: ['Ostéosynthèse tibia (2025)'], familyHistory: [],
    documents: [{ name: 'Radiographie', date: '2026-03-04', type: 'PDF' }],
    registrationDate: '2025-06-15',
  },
  {
    id: 'P-2024-005', qrCode: 'MS-012000', firstName: 'Mariama', lastName: 'Sow',
    dateOfBirth: '2000-12-25', gender: 'F', phone: '+224 626 55 66 77', address: 'Conakry, Matoto',
    nationalId: 'GN-2000-1225-MS', bloodType: 'O-', emergencyContact: 'Abdoulaye Sow',
    emergencyPhone: '+224 626 66 77 88', lastVisit: '2026-03-05', status: 'Actif', reason: 'Grossesse',
    allergies: [{ name: 'Ibuprofène', severity: 'Majeur' }], medicalHistory: ['Grossesse en cours (7 mois)'],
    surgicalHistory: [], familyHistory: [],
    documents: [{ name: 'Échographie', date: '2026-03-05', type: 'PDF' }],
    registrationDate: '2025-09-20',
  },
  {
    id: 'P-2024-006', qrCode: 'AS-061975', firstName: 'Abdoulaye', lastName: 'Sylla',
    dateOfBirth: '1975-06-14', gender: 'M', phone: '+224 627 77 88 99', address: 'Kindia',
    nationalId: 'GN-1975-0614-AS', bloodType: 'A-', emergencyContact: 'Kadiatou Sylla',
    emergencyPhone: '+224 627 88 99 00', lastVisit: '2026-02-20', status: 'Actif', reason: 'Insuffisance rénale',
    allergies: [{ name: 'Contraste iodé', severity: 'Critique' }],
    medicalHistory: ['Insuffisance rénale chronique', 'Hypertension'],
    surgicalHistory: [], familyHistory: ['Insuffisance rénale (mère)'],
    documents: [{ name: 'Bilan rénal', date: '2026-02-20', type: 'PDF' }],
    registrationDate: '2024-05-01',
  },
  {
    id: 'P-2024-007', qrCode: 'KD-111990', firstName: 'Kadiatou', lastName: 'Doubé',
    dateOfBirth: '1990-11-30', gender: 'F', phone: '+224 628 99 00 11', address: 'Conakry, Kaloum',
    nationalId: 'GN-1990-1130-KD', bloodType: 'B-', emergencyContact: 'Mamadou Doubé',
    emergencyPhone: '+224 628 00 11 22', lastVisit: '2026-01-15', status: 'Inactif', reason: 'Contrôle annuel',
    allergies: [], medicalHistory: ['Aucun antécédent notable'],
    surgicalHistory: [], familyHistory: [],
    documents: [], registrationDate: '2024-07-10',
  },
  {
    id: 'P-2024-008', qrCode: 'YT-051985', firstName: 'Youssouf', lastName: 'Touré',
    dateOfBirth: '1985-05-20', gender: 'M', phone: '+224 629 11 22 33', address: 'Kankan',
    nationalId: 'GN-1985-0520-YT', bloodType: 'O+', emergencyContact: 'Aissatou Touré',
    emergencyPhone: '+224 629 22 33 44', lastVisit: '2026-02-10', status: 'Actif', reason: 'Hépatite B',
    allergies: [], medicalHistory: ['Hépatite B chronique', 'Cirrhose débutante'],
    surgicalHistory: [], familyHistory: [],
    documents: [{ name: 'Sérologie hépatite', date: '2026-02-10', type: 'PDF' }],
    registrationDate: '2024-08-05',
  },
  {
    id: 'P-2024-009', qrCode: 'AB-032010', firstName: 'Aïssatou', lastName: 'Balde',
    dateOfBirth: '2010-03-12', gender: 'F', phone: '+224 620 33 44 55', address: 'Conakry, Dixinn',
    nationalId: 'GN-2010-0312-AB', bloodType: 'AB-', emergencyContact: 'Ousmane Baldé',
    emergencyPhone: '+224 620 44 55 66', lastVisit: '2026-03-02', status: 'Actif', reason: 'Asthme',
    allergies: [{ name: 'Acariens', severity: 'Majeur' }, { name: 'Pollen', severity: 'Mineur' }],
    medicalHistory: ['Asthme persistant', 'Rhinite allergique'],
    surgicalHistory: [], familyHistory: ['Asthme (mère)'],
    documents: [{ name: 'EFR', date: '2026-03-02', type: 'PDF' }],
    registrationDate: '2025-01-15',
  },
  {
    id: 'P-2024-010', qrCode: 'OC-081972', firstName: 'Ousmane', lastName: 'Camara',
    dateOfBirth: '1972-08-05', gender: 'M', phone: '+224 621 55 66 77', address: 'N\'Zérékoré',
    nationalId: 'GN-1972-0805-OC', bloodType: 'A+', emergencyContact: 'Fanta Camara',
    emergencyPhone: '+224 621 66 77 88', lastVisit: '2026-02-25', status: 'Actif', reason: 'AVC',
    allergies: [], medicalHistory: ['AVC ischémique (2026)', 'Hypertension', 'Diabète type 2'],
    surgicalHistory: [], familyHistory: ['AVC (père)', 'Hypertension (mère)'],
    documents: [{ name: 'IRM cérébrale', date: '2026-02-25', type: 'PDF' }, { name: 'Scanner', date: '2026-02-20', type: 'PDF' }],
    registrationDate: '2026-02-20',
  },
]

const demoAppointments: Appointment[] = [
  { id: 'RDV-001', patientName: 'Aminata Diallo', patientId: 'P-2024-001', doctor: 'Dr. Diallo', date: '2026-05-10', time: '08:00', duration: 30, type: 'Consultation', status: 'Planifié', reason: 'Suivi paludisme', notes: '' },
  { id: 'RDV-002', patientName: 'Mamadou Condé', patientId: 'P-2024-002', doctor: 'Dr. Touré', date: '2026-05-10', time: '09:00', duration: 45, type: 'Contrôle', status: 'Confirmé', reason: 'Contrôle tension', notes: 'Apporter derniers résultats' },
  { id: 'RDV-003', patientName: 'Fatoumata Camara', patientId: 'P-2024-003', doctor: 'Dr. Diallo', date: '2026-05-10', time: '10:30', duration: 30, type: 'Consultation', status: 'Planifié', reason: 'Suivi diabète', notes: '' },
  { id: 'RDV-004', patientName: 'Mariama Sow', patientId: 'P-2024-005', doctor: 'Dr. Bah', date: '2026-05-11', time: '08:30', duration: 45, type: 'Prénatal', status: 'Planifié', reason: 'Consultation prénatale', notes: '' },
  { id: 'RDV-005', patientName: 'Ibrahima Bah', patientId: 'P-2024-004', doctor: 'Dr. Keita', date: '2026-05-11', time: '11:00', duration: 30, type: 'Suivi', status: 'Confirmé', reason: 'Contrôle fracture', notes: 'Radiographie de contrôle' },
  { id: 'RDV-006', patientName: 'Abdoulaye Sylla', patientId: 'P-2024-006', doctor: 'Dr. Touré', date: '2026-05-11', time: '14:00', duration: 30, type: 'Consultation', status: 'Planifié', reason: 'Suivi rénal', notes: '' },
  { id: 'RDV-007', patientName: 'Youssouf Touré', patientId: 'P-2024-008', doctor: 'Dr. Diallo', date: '2026-05-12', time: '09:00', duration: 30, type: 'Consultation', status: 'Planifié', reason: 'Suivi hépatite', notes: '' },
  { id: 'RDV-008', patientName: 'Aïssatou Baldé', patientId: 'P-2024-009', doctor: 'Dr. Bah', date: '2026-05-12', time: '10:00', duration: 30, type: 'Consultation', status: 'Confirmé', reason: 'Crise d\'asthme', notes: '' },
]

const demoConsultations: Consultation[] = [
  { id: 'CONS-001', patientName: 'Aminata Diallo', patientId: 'P-2024-001', doctor: 'Dr. Diallo', date: '2026-05-10', time: '08:00', reason: 'Suivi paludisme', diagnosis: 'Paludisme simple en cours de traitement', status: 'Terminée', vitals: { ta: '12/8', fc: '78', temp: '37.2', spo2: '98', poids: '58' }, prescriptions: [{ medication: 'Artéméther/Luméfantrine', dosage: '20/120mg', duration: '3 jours', instructions: '2 comprimés matin et soir avec du lait' }] },
  { id: 'CONS-002', patientName: 'Mamadou Condé', patientId: 'P-2024-002', doctor: 'Dr. Touré', date: '2026-05-10', time: '09:00', reason: 'Contrôle tension', diagnosis: 'Hypertension contrôlée sous traitement', status: 'En cours', vitals: { ta: '14/9', fc: '72', temp: '36.8', spo2: '97', poids: '82' }, prescriptions: [{ medication: 'Amlodipine 5mg', dosage: '1cp/jour', duration: '30 jours', instructions: 'Prendre le matin à jeun' }] },
  { id: 'CONS-003', patientName: 'Fatoumata Camara', patientId: 'P-2024-003', doctor: 'Dr. Diallo', date: '2026-05-10', time: '10:30', reason: 'Suivi diabète', diagnosis: 'Diabète type 1 déséquilibré', status: 'En attente', vitals: { ta: '13/8', fc: '80', temp: '36.9', spo2: '99', poids: '55' }, prescriptions: [] },
]

const demoLabRequests: LabRequest[] = [
  { id: 'LAB-001', patientName: 'Aminata Diallo', patientId: 'P-2024-001', doctor: 'Dr. Diallo', date: '2026-05-10', type: 'Hémogramme', status: 'Validé', priority: 'Normal', results: [{ name: 'Globules blancs', value: '6.5', unit: 'G/L', normalRange: '4-10', abnormal: false }, { name: 'Hémoglobine', value: '10.2', unit: 'g/dL', normalRange: '12-16', abnormal: true }, { name: 'Plaquettes', value: '250', unit: 'G/L', normalRange: '150-400', abnormal: false }] },
  { id: 'LAB-002', patientName: 'Mamadou Condé', patientId: 'P-2024-002', doctor: 'Dr. Touré', date: '2026-05-10', type: 'Bilan lipidique', status: 'En cours', priority: 'Normal', results: [{ name: 'Cholestérol total', value: '2.4', unit: 'g/L', normalRange: '<2.0', abnormal: true }] },
  { id: 'LAB-003', patientName: 'Fatoumata Camara', patientId: 'P-2024-003', doctor: 'Dr. Diallo', date: '2026-05-10', type: 'HbA1c', status: 'En attente', priority: 'Urgent', results: [] },
  { id: 'LAB-004', patientName: 'Abdoulaye Sylla', patientId: 'P-2024-006', doctor: 'Dr. Touré', date: '2026-05-09', type: 'Bilan rénal', status: 'Terminé', priority: 'Stat', results: [{ name: 'Créatinine', value: '350', unit: 'μmol/L', normalRange: '44-106', abnormal: true }, { name: 'Urée', value: '18', unit: 'mmol/L', normalRange: '2.5-7.1', abnormal: true }] },
]

const demoMedications: Medication[] = [
  { id: 'MED-001', name: 'Paracétamol 500mg', category: 'Antalgique', dosage: '500mg', stock: 2500, maxStock: 5000, unit: 'comprimés', price: 500, expiryDate: '2027-06-01', supplier: 'PharmaGuinée' },
  { id: 'MED-002', name: 'Amoxicilline 500mg', category: 'Antibiotique', dosage: '500mg', stock: 800, maxStock: 2000, unit: 'gélules', price: 1500, expiryDate: '2027-03-15', supplier: 'LabGuinée' },
  { id: 'MED-003', name: 'Artéméther/Luméfantrine', category: 'Antipaludéen', dosage: '20/120mg', stock: 1200, maxStock: 3000, unit: 'comprimés', price: 3000, expiryDate: '2027-12-01', supplier: 'WHO Supply' },
  { id: 'MED-004', name: 'Amlodipine 5mg', category: 'Antihypertenseur', dosage: '5mg', stock: 150, maxStock: 1000, unit: 'comprimés', price: 2000, expiryDate: '2027-09-01', supplier: 'PharmaGuinée' },
  { id: 'MED-005', name: 'Metformine 500mg', category: 'Antidiabétique', dosage: '500mg', stock: 600, maxStock: 2000, unit: 'comprimés', price: 1000, expiryDate: '2027-08-15', supplier: 'LabGuinée' },
  { id: 'MED-006', name: 'Insuline NPH', category: 'Antidiabétique', dosage: '100UI/mL', stock: 50, maxStock: 200, unit: 'flacons', price: 15000, expiryDate: '2026-12-01', supplier: 'Novo Nordisk' },
  { id: 'MED-007', name: 'Ondansétron 4mg', category: 'Antiémétique', dosage: '4mg', stock: 300, maxStock: 800, unit: 'ampoules', price: 2500, expiryDate: '2027-05-01', supplier: 'PharmaGuinée' },
  { id: 'MED-008', name: 'Céfétriaxone 1g', category: 'Antibiotique', dosage: '1g', stock: 25, maxStock: 200, unit: 'flacons', price: 8000, expiryDate: '2027-04-01', supplier: 'LabGuinée' },
  { id: 'MED-009', name: 'Salbutamol inhalé', category: 'Bronchodilatateur', dosage: '100μg', stock: 120, maxStock: 300, unit: 'inhalateurs', price: 5000, expiryDate: '2027-10-01', supplier: 'GSK' },
  { id: 'MED-010', name: 'Fer/Folate', category: 'Supplément', dosage: '200/0.4mg', stock: 1800, maxStock: 3000, unit: 'comprimés', price: 300, expiryDate: '2028-01-01', supplier: 'UNICEF' },
]

const demoBeds: BedUnit[] = [
  { id: 'BED-001', number: '101-A', service: 'Médecine interne', status: 'Occupé', patient: 'Mamadou Condé', patientId: 'P-2024-002', admissionDate: '2026-03-03' },
  { id: 'BED-002', number: '101-B', service: 'Médecine interne', status: 'Libre', patient: null, patientId: null, admissionDate: null },
  { id: 'BED-003', number: '102-A', service: 'Médecine interne', status: 'Occupé', patient: 'Abdoulaye Sylla', patientId: 'P-2024-006', admissionDate: '2026-02-20' },
  { id: 'BED-004', number: '102-B', service: 'Médecine interne', status: 'En nettoyage', patient: null, patientId: null, admissionDate: null },
  { id: 'BED-005', number: '201-A', service: 'Chirurgie', status: 'Occupé', patient: 'Ibrahima Bah', patientId: 'P-2024-004', admissionDate: '2026-03-04' },
  { id: 'BED-006', number: '201-B', service: 'Chirurgie', status: 'Libre', patient: null, patientId: null, admissionDate: null },
  { id: 'BED-007', number: '202-A', service: 'Chirurgie', status: 'Réservé', patient: null, patientId: null, admissionDate: null },
  { id: 'BED-008', number: '202-B', service: 'Chirurgie', status: 'Occupé', patient: 'Ousmane Camara', patientId: 'P-2024-010', admissionDate: '2026-02-25' },
  { id: 'BED-009', number: '301-A', service: 'Maternité', status: 'Occupé', patient: 'Mariama Sow', patientId: 'P-2024-005', admissionDate: '2026-03-05' },
  { id: 'BED-010', number: '301-B', service: 'Maternité', status: 'Libre', patient: null, patientId: null, admissionDate: null },
  { id: 'BED-011', number: '302-A', service: 'Maternité', status: 'Libre', patient: null, patientId: null, admissionDate: null },
  { id: 'BED-012', number: '302-B', service: 'Maternité', status: 'Occupé', patient: 'Kadiatou Doubé', patientId: 'P-2024-007', admissionDate: '2026-01-10' },
]

const demoEmergencies: EmergencyCase[] = [
  { id: 'URG-001', patientName: 'Ousmane Camara', patientId: 'P-2024-010', arrivalTime: '07:30', triageLevel: 'Rouge', reason: 'AVC ischémique', status: 'En cours', doctor: 'Dr. Keita' },
  { id: 'URG-002', patientName: 'Enfant non identifié', patientId: '', arrivalTime: '08:15', triageLevel: 'Orange', reason: 'Crise convulsive', status: 'Pris en charge', doctor: 'Dr. Bah' },
  { id: 'URG-003', patientName: 'Aminata Diallo', patientId: 'P-2024-001', arrivalTime: '09:00', triageLevel: 'Jaune', reason: 'Fièvre élevée', status: 'En attente', doctor: null },
  { id: 'URG-004', patientName: 'Youssouf Touré', patientId: 'P-2024-008', arrivalTime: '09:45', triageLevel: 'Vert', reason: 'Douleur abdominale modérée', status: 'En attente', doctor: null },
  { id: 'URG-005', patientName: 'Fatoumata Camara', patientId: 'P-2024-003', arrivalTime: '10:30', triageLevel: 'Bleu', reason: 'Renouvellement ordonnance', status: 'En attente', doctor: null },
]

const demoPregnancies: Pregnancy[] = [
  { id: 'MAT-001', motherName: 'Mariama Sow', motherId: 'P-2024-005', term: 32, dueDate: '2026-06-15', riskLevel: 'Faible', lastVisit: '2026-03-05', status: 'En cours', visits: [{ date: '2026-03-05', term: 28, weight: '72', bp: '12/8', notes: 'Normal' }, { date: '2026-02-05', term: 24, weight: '70', bp: '11/7', notes: 'Normal' }] },
  { id: 'MAT-002', motherName: 'Kadiatou Doubé', motherId: 'P-2024-007', term: 36, dueDate: '2026-05-20', riskLevel: 'Élevé', lastVisit: '2026-01-10', status: 'En cours', visits: [{ date: '2026-01-10', term: 28, weight: '80', bp: '15/9', notes: 'Hypertension gravidique' }] },
]

const demoVaccines: VaccineRecord[] = [
  { id: 'VAC-001', childName: 'Enfant de M. Sow', childId: 'C-001', dateOfBirth: '2025-06-15', vaccines: [{ name: 'BCG', scheduledDate: '2025-06-15', administeredDate: '2025-06-15', status: 'Fait' }, { name: 'DTC-HepB-Hib 1', scheduledDate: '2025-08-15', administeredDate: '2025-08-20', status: 'Fait' }, { name: 'DTC-HepB-Hib 2', scheduledDate: '2025-10-15', administeredDate: '2025-10-18', status: 'Fait' }, { name: 'DTC-HepB-Hib 3', scheduledDate: '2025-12-15', administeredDate: null, status: 'En retard' }] },
  { id: 'VAC-002', childName: 'Enfant de A. Diallo', childId: 'C-002', dateOfBirth: '2025-09-01', vaccines: [{ name: 'BCG', scheduledDate: '2025-09-01', administeredDate: '2025-09-01', status: 'Fait' }, { name: 'DTC-HepB-Hib 1', scheduledDate: '2025-11-01', administeredDate: '2025-11-05', status: 'Fait' }, { name: 'DTC-HepB-Hib 2', scheduledDate: '2026-01-01', administeredDate: '2026-01-03', status: 'Fait' }] },
]

const demoInvoices: Invoice[] = [
  { id: 'FAC-001', patientName: 'Aminata Diallo', patientId: 'P-2024-001', date: '2026-05-10', items: [{ description: 'Consultation', quantity: 1, unitPrice: 25000, total: 25000 }, { description: 'Hémogramme', quantity: 1, unitPrice: 15000, total: 15000 }], total: 40000, status: 'En attente', paymentMethod: null, paidAmount: 0 },
  { id: 'FAC-002', patientName: 'Mamadou Condé', patientId: 'P-2024-002', date: '2026-05-10', items: [{ description: 'Consultation', quantity: 1, unitPrice: 25000, total: 25000 }, { description: 'ECG', quantity: 1, unitPrice: 35000, total: 35000 }], total: 60000, status: 'Payée', paymentMethod: 'Mobile Money', paidAmount: 60000 },
  { id: 'FAC-003', patientName: 'Fatoumata Camara', patientId: 'P-2024-003', date: '2026-05-09', items: [{ description: 'Consultation', quantity: 1, unitPrice: 25000, total: 25000 }, { description: 'HbA1c', quantity: 1, unitPrice: 20000, total: 20000 }], total: 45000, status: 'Partielle', paymentMethod: 'Espèces', paidAmount: 20000 },
  { id: 'FAC-004', patientName: 'Ousmane Camara', patientId: 'P-2024-010', date: '2026-05-08', items: [{ description: 'Urgence', quantity: 1, unitPrice: 50000, total: 50000 }, { description: 'Scanner cérébral', quantity: 1, unitPrice: 150000, total: 150000 }, { description: 'IRM', quantity: 1, unitPrice: 250000, total: 250000 }], total: 450000, status: 'En attente', paymentMethod: null, paidAmount: 0 },
]

const demoTeleconsults: TeleconsultSession[] = [
  { id: 'TEL-001', patientName: 'Fatoumata Camara', patientId: 'P-2024-003', doctor: 'Dr. Diallo', date: '2026-05-10', time: '14:00', type: 'Vidéo', status: 'Planifiée', notes: 'Suivi diabète' },
  { id: 'TEL-002', patientName: 'Youssouf Touré', patientId: 'P-2024-008', doctor: 'Dr. Touré', date: '2026-05-10', time: '15:30', type: 'Audio', status: 'Planifiée', notes: 'Suivi hépatite' },
  { id: 'TEL-003', patientName: 'Kadiatou Doubé', patientId: 'P-2024-007', doctor: 'Dr. Bah', date: '2026-05-09', time: '10:00', type: 'Chat', status: 'Terminée', notes: 'Résultats normal' },
]

const demoNotifications: Notification[] = [
  { id: 'NOTIF-001', title: 'Rappel', message: 'Rendez-vous avec Aminata Diallo à 08:00', type: 'info', time: '07:45', read: false },
  { id: 'NOTIF-002', title: 'Alerte stock', message: 'Céfétriaxone 1g : stock critique (25 unités)', type: 'warning', time: '08:00', read: false },
  { id: 'NOTIF-003', title: 'Urgence', message: 'Nouveau patient en triage Rouge - AVC', type: 'error', time: '07:30', read: false },
  { id: 'NOTIF-004', title: 'Résultat labo', message: 'Résultats hémogramme disponibles pour Aminata Diallo', type: 'success', time: '09:15', read: true },
]

const demoFamilyAccounts: FamilyAccount[] = [
  {
    id: 'FAM-001',
    primaryPhone: '+224 622 11 22 33',
    primaryName: 'Aminata Diallo',
    members: [
      { patientId: 'P-2024-001', relationship: 'Moi', isPrimary: true },
      { patientId: 'P-2024-009', relationship: 'Enfant', isPrimary: false },
    ],
    createdAt: '2024-01-15',
    verificationCode: '2233',
  },
  {
    id: 'FAM-002',
    primaryPhone: '+224 623 44 55 66',
    primaryName: 'Mamadou Condé',
    members: [
      { patientId: 'P-2024-002', relationship: 'Moi', isPrimary: true },
    ],
    createdAt: '2024-02-20',
    verificationCode: '5566',
  },
  {
    id: 'FAM-003',
    primaryPhone: '+224 624 77 88 99',
    primaryName: 'Fatoumata Camara',
    members: [
      { patientId: 'P-2024-003', relationship: 'Moi', isPrimary: true },
    ],
    createdAt: '2024-03-10',
    verificationCode: '8899',
  },
]

/* ─────────── Data Store ─────────── */

interface DataState {
  patients: Patient[]
  appointments: Appointment[]
  consultations: Consultation[]
  labRequests: LabRequest[]
  medications: Medication[]
  beds: BedUnit[]
  emergencies: EmergencyCase[]
  pregnancies: Pregnancy[]
  vaccineRecords: VaccineRecord[]
  invoices: Invoice[]
  teleconsults: TeleconsultSession[]
  notifications: Notification[]
  documentAuthorizations: DocumentAuthorization[]
  familyAccounts: FamilyAccount[]

  // Actions
  addPatient: (patient: Patient) => void
  updatePatient: (id: string, data: Partial<Patient>) => void
  archivePatient: (id: string) => void

  addAppointment: (appointment: Appointment) => void
  updateAppointment: (id: string, data: Partial<Appointment>) => void
  confirmAppointment: (id: string) => void
  cancelAppointment: (id: string) => void

  addConsultation: (consultation: Consultation) => void
  updateConsultation: (id: string, data: Partial<Consultation>) => void

  addLabRequest: (request: LabRequest) => void
  updateLabRequest: (id: string, data: Partial<LabRequest>) => void
  validateLabResult: (id: string) => void

  addMedication: (medication: Medication) => void
  updateMedication: (id: string, data: Partial<Medication>) => void
  stockEntry: (id: string, quantity: number) => void
  stockExit: (id: string, quantity: number) => void

  updateBed: (id: string, data: Partial<BedUnit>) => void
  admitPatient: (bedId: string, patientName: string, patientId: string) => void
  dischargeBed: (bedId: string) => void

  addEmergency: (emergency: EmergencyCase) => void
  updateEmergency: (id: string, data: Partial<EmergencyCase>) => void
  takeCharge: (id: string, doctor: string) => void

  addPregnancy: (pregnancy: Pregnancy) => void
  addPregnancyVisit: (id: string, visit: Pregnancy['visits'][0]) => void

  addVaccineRecord: (record: VaccineRecord) => void
  administerVaccine: (recordId: string, vaccineName: string) => void

  addInvoice: (invoice: Invoice) => void
  updateInvoice: (id: string, data: Partial<Invoice>) => void
  payInvoice: (id: string, method: string, amount: number) => void

  addTeleconsult: (session: TeleconsultSession) => void
  updateTeleconsult: (id: string, data: Partial<TeleconsultSession>) => void

  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  addNotification: (notification: Notification) => void

  // Document authorization actions
  requestDocumentAccess: (auth: Omit<DocumentAuthorization, 'id' | 'status' | 'requestedAt'>) => void
  approveDocumentAccess: (id: string, reviewedBy: string, note?: string) => void
  refuseDocumentAccess: (id: string, reviewedBy: string, note?: string) => void
  addPatientDocument: (patientId: string, doc: MedicalDocument) => void
  removePatientDocument: (patientId: string, docName: string) => void

  // Family account actions
  addFamilyAccount: (account: FamilyAccount) => void
  addFamilyMember: (accountId: string, member: FamilyMember) => void
  removeFamilyMember: (accountId: string, patientId: string) => void

  resetToDemo: () => void
}

const initialState = {
  patients: demoPatients,
  appointments: demoAppointments,
  consultations: demoConsultations,
  labRequests: demoLabRequests,
  medications: demoMedications,
  beds: demoBeds,
  emergencies: demoEmergencies,
  pregnancies: demoPregnancies,
  vaccineRecords: demoVaccines,
  invoices: demoInvoices,
  teleconsults: demoTeleconsults,
  notifications: demoNotifications,
  documentAuthorizations: [] as DocumentAuthorization[],
  familyAccounts: demoFamilyAccounts,
}

export const useDataStore = create<DataState>()(
  persist(
    (set) => ({
      ...initialState,

      // Patient actions
      addPatient: (patient) => set((s) => ({ patients: [...s.patients, patient] })),
      updatePatient: (id, data) => set((s) => ({
        patients: s.patients.map((p) => p.id === id ? { ...p, ...data } : p),
      })),
      archivePatient: (id) => set((s) => ({
        patients: s.patients.map((p) => p.id === id ? { ...p, status: 'Archivé' as const } : p),
      })),

      // Appointment actions
      addAppointment: (appointment) => set((s) => ({ appointments: [...s.appointments, appointment] })),
      updateAppointment: (id, data) => set((s) => ({
        appointments: s.appointments.map((a) => a.id === id ? { ...a, ...data } : a),
      })),
      confirmAppointment: (id) => set((s) => ({
        appointments: s.appointments.map((a) => a.id === id ? { ...a, status: 'Confirmé' as const } : a),
      })),
      cancelAppointment: (id) => set((s) => ({
        appointments: s.appointments.map((a) => a.id === id ? { ...a, status: 'Annulé' as const } : a),
      })),

      // Consultation actions
      addConsultation: (consultation) => set((s) => ({ consultations: [...s.consultations, consultation] })),
      updateConsultation: (id, data) => set((s) => ({
        consultations: s.consultations.map((c) => c.id === id ? { ...c, ...data } : c),
      })),

      // Lab actions
      addLabRequest: (request) => set((s) => ({ labRequests: [...s.labRequests, request] })),
      updateLabRequest: (id, data) => set((s) => ({
        labRequests: s.labRequests.map((l) => l.id === id ? { ...l, ...data } : l),
      })),
      validateLabResult: (id) => set((s) => ({
        labRequests: s.labRequests.map((l) => l.id === id ? { ...l, status: 'Validé' as const } : l),
      })),

      // Medication/Pharmacy actions
      addMedication: (medication) => set((s) => ({ medications: [...s.medications, medication] })),
      updateMedication: (id, data) => set((s) => ({
        medications: s.medications.map((m) => m.id === id ? { ...m, ...data } : m),
      })),
      stockEntry: (id, quantity) => set((s) => ({
        medications: s.medications.map((m) => m.id === id ? { ...m, stock: Math.min(m.stock + quantity, m.maxStock) } : m),
      })),
      stockExit: (id, quantity) => set((s) => ({
        medications: s.medications.map((m) => m.id === id ? { ...m, stock: Math.max(m.stock - quantity, 0) } : m),
      })),

      // Bed/Hospitalization actions
      updateBed: (id, data) => set((s) => ({
        beds: s.beds.map((b) => b.id === id ? { ...b, ...data } : b),
      })),
      admitPatient: (bedId, patientName, patientId) => set((s) => ({
        beds: s.beds.map((b) => b.id === bedId ? { ...b, status: 'Occupé' as const, patient: patientName, patientId, admissionDate: new Date().toISOString().split('T')[0] } : b),
      })),
      dischargeBed: (bedId) => set((s) => ({
        beds: s.beds.map((b) => b.id === bedId ? { ...b, status: 'En nettoyage' as const, patient: null, patientId: null, admissionDate: null } : b),
      })),

      // Emergency actions
      addEmergency: (emergency) => set((s) => ({ emergencies: [...s.emergencies, emergency] })),
      updateEmergency: (id, data) => set((s) => ({
        emergencies: s.emergencies.map((e) => e.id === id ? { ...e, ...data } : e),
      })),
      takeCharge: (id, doctor) => set((s) => ({
        emergencies: s.emergencies.map((e) => e.id === id ? { ...e, status: 'Pris en charge' as const, doctor } : e),
      })),

      // Maternity actions
      addPregnancy: (pregnancy) => set((s) => ({ pregnancies: [...s.pregnancies, pregnancy] })),
      addPregnancyVisit: (id, visit) => set((s) => ({
        pregnancies: s.pregnancies.map((p) => p.id === id ? { ...p, visits: [...p.visits, visit] } : p),
      })),

      // Vaccination actions
      addVaccineRecord: (record) => set((s) => ({ vaccineRecords: [...s.vaccineRecords, record] })),
      administerVaccine: (recordId, vaccineName) => set((s) => ({
        vaccineRecords: s.vaccineRecords.map((r) => r.id === recordId ? {
          ...r,
          vaccines: r.vaccines.map((v) => v.name === vaccineName ? { ...v, status: 'Fait' as const, administeredDate: new Date().toISOString().split('T')[0] } : v),
        } : r),
      })),

      // Billing actions
      addInvoice: (invoice) => set((s) => ({ invoices: [...s.invoices, invoice] })),
      updateInvoice: (id, data) => set((s) => ({
        invoices: s.invoices.map((i) => i.id === id ? { ...i, ...data } : i),
      })),
      payInvoice: (id, method, amount) => set((s) => ({
        invoices: s.invoices.map((i) => {
          if (i.id !== id) return i
          const newPaid = i.paidAmount + amount
          const newStatus = newPaid >= i.total ? 'Payée' : 'Partielle'
          return { ...i, paidAmount: newPaid, paymentMethod: method, status: newStatus as Invoice['status'] }
        }),
      })),

      // Teleconsultation actions
      addTeleconsult: (session) => set((s) => ({ teleconsults: [...s.teleconsults, session] })),
      updateTeleconsult: (id, data) => set((s) => ({
        teleconsults: s.teleconsults.map((t) => t.id === id ? { ...t, ...data } : t),
      })),

      // Notification actions
      markNotificationRead: (id) => set((s) => ({
        notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n),
      })),
      markAllNotificationsRead: () => set((s) => ({
        notifications: s.notifications.map((n) => ({ ...n, read: true })),
      })),
      addNotification: (notification) => set((s) => ({ notifications: [notification, ...s.notifications] })),

      // Document authorization actions
      requestDocumentAccess: (auth) => set((s) => ({
        documentAuthorizations: [...s.documentAuthorizations, {
          ...auth,
          id: `AUTH-${Date.now()}`,
          status: 'En attente' as const,
          requestedAt: new Date().toISOString(),
        }],
      })),
      approveDocumentAccess: (id, reviewedBy, note) => set((s) => ({
        documentAuthorizations: s.documentAuthorizations.map((a) =>
          a.id === id ? { ...a, status: 'Approuvée' as const, reviewedBy, reviewedAt: new Date().toISOString(), reviewNote: note } : a
        ),
      })),
      refuseDocumentAccess: (id, reviewedBy, note) => set((s) => ({
        documentAuthorizations: s.documentAuthorizations.map((a) =>
          a.id === id ? { ...a, status: 'Refusée' as const, reviewedBy, reviewedAt: new Date().toISOString(), reviewNote: note } : a
        ),
      })),
      addPatientDocument: (patientId, doc) => set((s) => ({
        patients: s.patients.map((p) =>
          p.id === patientId ? { ...p, documents: [...p.documents, doc] } : p
        ),
      })),
      removePatientDocument: (patientId, docName) => set((s) => ({
        patients: s.patients.map((p) =>
          p.id === patientId ? { ...p, documents: p.documents.filter((d) => d.name !== docName) } : p
        ),
      })),

      // Family account actions
      addFamilyAccount: (account) => set((s) => ({ familyAccounts: [...s.familyAccounts, account] })),
      addFamilyMember: (accountId, member) => set((s) => ({
        familyAccounts: s.familyAccounts.map((a) =>
          a.id === accountId ? { ...a, members: [...a.members, member] } : a
        ),
      })),
      removeFamilyMember: (accountId, patientId) => set((s) => ({
        familyAccounts: s.familyAccounts.map((a) =>
          a.id === accountId ? { ...a, members: a.members.filter((m) => m.patientId !== patientId) } : a
        ),
      })),

      // Reset
      resetToDemo: () => set(initialState),
    }),
    {
      name: 'healthflow-data-store',
    }
  )
)
