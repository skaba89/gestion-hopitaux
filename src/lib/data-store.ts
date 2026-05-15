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
  mobileMoneyTransactions?: string[]
  insuranceCoverage?: InsuranceCoverage[]
}

/* ─────────── Mobile Money Types ─────────── */

export type MobileMoneyProvider = 'Orange Money' | 'MTN MoMo'
export type TransactionStatus = 'En attente' | 'En cours' | 'Réussi' | 'Échoué' | 'Remboursé'
export type PaymentReason = 'Facture' | 'Consultation' | 'Pharmacie' | 'Laboratoire' | 'Hospitalisation' | 'Autre'

export interface MobileMoneyTransaction {
  id: string
  reference: string
  provider: MobileMoneyProvider
  phoneNumber: string
  amount: number
  currency: 'GNF' | 'USD'
  reason: PaymentReason
  invoiceId: string | null
  patientName: string
  patientId: string
  status: TransactionStatus
  createdAt: string
  updatedAt: string
  completedAt: string | null
  providerTransactionId: string | null
  paymentLink: string | null
}

/* ─────────── Insurance Types ─────────── */

export interface InsuranceProvider {
  id: string
  name: string
  code: string
  coveragePercentage: number
  contactPhone: string
  email: string
  address: string
  isActive: boolean
  logoColor: string
}

export interface InsuranceCoverage {
  providerId: string
  providerName: string
  policyNumber: string
  coveragePercentage: number
  coveredAmount: number
}

export interface InsuranceClaim {
  id: string
  providerId: string
  providerName: string
  patientId: string
  patientName: string
  invoiceId: string
  amount: number
  coveredAmount: number
  patientAmount: number
  policyNumber: string
  status: 'Soumise' | 'En cours' | 'Approuvée' | 'Rejetée' | 'Remboursée'
  submittedAt: string
  processedAt: string | null
  notes: string
}

export interface PreAuthorization {
  id: string
  providerId: string
  providerName: string
  patientId: string
  patientName: string
  procedureDescription: string
  estimatedCost: number
  status: 'Demandée' | 'Approuvée' | 'Rejetée'
  requestedAt: string
  responseAt: string | null
  authorizationCode: string | null
}

/* ─────────── Messaging Types ─────────── */

export type MessageChannel = 'SMS' | 'WhatsApp'
export type MessageStatus = 'En attente' | 'Envoyé' | 'Délivré' | 'Échoué'

export interface MessageLog {
  id: string
  channel: MessageChannel
  recipient: string
  recipientName: string
  message: string
  templateId: string | null
  status: MessageStatus
  sentAt: string
  deliveredAt: string | null
  errorMessage: string | null
}

/* ─────────── Health Credit (Crédit Santé) Types ─────────── */

export interface PaymentPlan {
  id: string
  invoiceId: string
  patientId: string
  patientName: string
  totalAmount: number
  downPayment: number
  installmentCount: number
  installmentAmount: number
  startDate: string
  status: 'Actif' | 'Terminé' | 'En retard' | 'Annulé'
  installments: { id: string; dueDate: string; amount: number; paidDate: string | null; status: 'En attente' | 'Payé' | 'En retard' }[]
}

/* ─────────── Reminder Settings ─────────── */

export interface ReminderSettings {
  appointmentReminders: boolean
  appointmentChannel: 'SMS' | 'WhatsApp' | 'Les deux'
  appointmentTiming: '24h' | '2h' | 'Les deux'
  labResultNotifications: boolean
  labResultChannel: 'SMS' | 'WhatsApp' | 'Les deux'
  vaccinationReminders: boolean
  vaccinationChannel: 'SMS' | 'WhatsApp' | 'Les deux'
  paymentReminders: boolean
  paymentChannel: 'SMS' | 'WhatsApp' | 'Les deux'
  prescriptionReminders: boolean
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

/* ─────────── Phase 3: AI Health Intelligence Types ─────────── */

export interface DiagnosticSession {
  id: string
  symptoms: string[]
  patientContext: PatientContext
  possibleDiagnoses: PossibleDiagnosis[]
  recommendedExams: string[]
  orientation: OrientationLevel
  redFlags: string[]
  questions: string[]
  isOffline: boolean
  createdAt: string
}

export interface PatientContext {
  age: number
  gender: 'M' | 'F'
  weight?: number
  height?: number
  conditions: string[]
  medications: string[]
  allergies: string[]
  isPregnant: boolean
  recentTravel: string
  vaccinationStatus: string
}

export interface PossibleDiagnosis {
  name: string
  confidence: number
  urgency: 'Faible' | 'Modéré' | 'Élevé' | 'Critique'
  description: string
}

export type OrientationLevel = 'Centre de santé' | 'Hôpital de district' | 'Hôpital national' | 'Urgences'

export interface DrugInteractionAlert {
  id: string
  drug1: string
  drug2: string
  severity: 'MINEUR' | 'MODÉRÉ' | 'MAJEUR' | 'CRITIQUE'
  description: string
  recommendation: string
}

export interface DosageAdjustment {
  medication: string
  standardDosage: string
  adjustedDosage: string
  reason: string
}

export interface InteractionCheckResult {
  interactions: DrugInteractionAlert[]
  contraindications: string[]
  dosageAdjustments: DosageAdjustment[]
  isOffline: boolean
}

export type SurveillanceAlertLevel = 'VEILLE' | 'ALERTE' | 'ÉPIDÉMIE'

export interface EpidemiologicalAlert {
  id: string
  disease: string
  location: string
  healthZone: string
  alertLevel: SurveillanceAlertLevel
  firstCaseDate: string
  caseCount: number
  deathCount: number
  affectedAreas: string[]
  description: string
  recommendedActions: string[]
  status: 'Actif' | 'En investigation' | 'Résolu'
  createdAt: string
  updatedAt: string
}

export interface SurveillanceDataPoint {
  date: string
  disease: string
  location: string
  caseCount: number
  deathCount: number
  alertLevel: SurveillanceAlertLevel
}

export interface OutbreakPrediction {
  disease: string
  riskScore: number
  probability: number
  predictedPeakDate: string
  confidence: number
  preventiveActions: string[]
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

/* ─────────── Phase 2 Demo Data ─────────── */

const demoMobileMoneyTransactions: MobileMoneyTransaction[] = [
  { id: 'MM-001', reference: 'OM-20260510-001', provider: 'Orange Money', phoneNumber: '+224 622 11 22 33', amount: 60000, currency: 'GNF', reason: 'Facture', invoiceId: 'FAC-002', patientName: 'Mamadou Condé', patientId: 'P-2024-002', status: 'Réussi', createdAt: '2026-05-10T09:30:00', updatedAt: '2026-05-10T09:32:00', completedAt: '2026-05-10T09:32:00', providerTransactionId: 'OM-TXN-78901', paymentLink: null },
  { id: 'MM-002', reference: 'MTN-20260509-001', provider: 'MTN MoMo', phoneNumber: '+224 524 77 88 99', amount: 45000, currency: 'GNF', reason: 'Consultation', invoiceId: 'FAC-003', patientName: 'Fatoumata Camara', patientId: 'P-2024-003', status: 'En attente', createdAt: '2026-05-09T14:00:00', updatedAt: '2026-05-09T14:00:00', completedAt: null, providerTransactionId: null, paymentLink: 'https://pay.mtn.gf/MTN-20260509-001' },
  { id: 'MM-003', reference: 'OM-20260508-001', provider: 'Orange Money', phoneNumber: '+224 621 55 66 77', amount: 450000, currency: 'GNF', reason: 'Hospitalisation', invoiceId: 'FAC-004', patientName: 'Ousmane Camara', patientId: 'P-2024-010', status: 'En cours', createdAt: '2026-05-08T11:00:00', updatedAt: '2026-05-08T11:01:00', completedAt: null, providerTransactionId: 'OM-TXN-78902', paymentLink: null },
  { id: 'MM-004', reference: 'MTN-20260507-001', provider: 'MTN MoMo', phoneNumber: '+224 527 77 88 99', amount: 25000, currency: 'GNF', reason: 'Consultation', invoiceId: null, patientName: 'Abdoulaye Sylla', patientId: 'P-2024-006', status: 'Réussi', createdAt: '2026-05-07T08:15:00', updatedAt: '2026-05-07T08:17:00', completedAt: '2026-05-07T08:17:00', providerTransactionId: 'MTN-TXN-45601', paymentLink: null },
  { id: 'MM-005', reference: 'OM-20260506-001', provider: 'Orange Money', phoneNumber: '+224 620 33 44 55', amount: 15000, currency: 'GNF', reason: 'Pharmacie', invoiceId: null, patientName: 'Aïssatou Baldé', patientId: 'P-2024-009', status: 'Échoué', createdAt: '2026-05-06T16:30:00', updatedAt: '2026-05-06T16:35:00', completedAt: null, providerTransactionId: 'OM-TXN-78903', paymentLink: null },
]

const demoInsuranceProviders: InsuranceProvider[] = [
  { id: 'INS-001', name: 'SONAR Assurance', code: 'SONAR', coveragePercentage: 80, contactPhone: '+224 630 00 00 00', email: 'info@sonar-gn.com', address: 'Conakry, Kaloum', isActive: true, logoColor: '#E67E22' },
  { id: 'INS-002', name: 'CGM Guinée', code: 'CGM', coveragePercentage: 70, contactPhone: '+224 631 00 00 00', email: 'contact@cgm-guinee.com', address: 'Conakry, Dixinn', isActive: true, logoColor: '#2ECC71' },
  { id: 'INS-003', name: 'Saham Assurance', code: 'SAHAM', coveragePercentage: 75, contactPhone: '+224 632 00 00 00', email: 'info@saham-gn.com', address: 'Conakry, Matam', isActive: true, logoColor: '#9B59B6' },
  { id: 'INS-004', name: 'NSIA Assurance', code: 'NSIA', coveragePercentage: 85, contactPhone: '+224 633 00 00 00', email: 'guinee@nsia.co', address: 'Conakry, Matoto', isActive: false, logoColor: '#3498DB' },
]

const demoInsuranceClaims: InsuranceClaim[] = [
  { id: 'CLM-001', providerId: 'INS-001', providerName: 'SONAR Assurance', patientId: 'P-2024-010', patientName: 'Ousmane Camara', invoiceId: 'FAC-004', amount: 450000, coveredAmount: 360000, patientAmount: 90000, policyNumber: 'SON-2024-001234', status: 'En cours', submittedAt: '2026-05-08T12:00:00', processedAt: null, notes: 'AVC ischémique — hospitalisation d\'urgence' },
  { id: 'CLM-002', providerId: 'INS-002', providerName: 'CGM Guinée', patientId: 'P-2024-006', patientName: 'Abdoulaye Sylla', invoiceId: 'FAC-001', amount: 40000, coveredAmount: 28000, patientAmount: 12000, policyNumber: 'CGM-2023-005678', status: 'Approuvée', submittedAt: '2026-05-09T10:00:00', processedAt: '2026-05-09T16:00:00', notes: 'Consultation de suivi rénal' },
  { id: 'CLM-003', providerId: 'INS-003', providerName: 'Saham Assurance', patientId: 'P-2024-002', patientName: 'Mamadou Condé', invoiceId: 'FAC-002', amount: 60000, coveredAmount: 45000, patientAmount: 15000, policyNumber: 'SAH-2024-009012', status: 'Remboursée', submittedAt: '2026-05-10T10:00:00', processedAt: '2026-05-10T14:00:00', notes: 'Contrôle hypertension + ECG' },
]

const demoMessageLogs: MessageLog[] = [
  { id: 'MSG-001', channel: 'SMS', recipient: '+224 622 11 22 33', recipientName: 'Aminata Diallo', message: 'Rappel : Vous avez un rendez-vous le 10/05/2026 à 08:00 avec Dr. Diallo à Hôpital Donka. HealthFlow Africa', templateId: 'appointment_reminder', status: 'Délivré', sentAt: '2026-05-09T08:00:00', deliveredAt: '2026-05-09T08:01:00', errorMessage: null },
  { id: 'MSG-002', channel: 'WhatsApp', recipient: '+224 623 44 55 66', recipientName: 'Mamadou Condé', message: 'Vos résultats d\'analyse sont disponibles. Connectez-vous à votre espace patient pour les consulter. HealthFlow Africa', templateId: 'lab_result', status: 'Délivré', sentAt: '2026-05-10T09:20:00', deliveredAt: '2026-05-10T09:21:00', errorMessage: null },
  { id: 'MSG-003', channel: 'SMS', recipient: '+224 626 55 66 77', recipientName: 'Mariama Sow', message: 'Rappel vaccination : Enfant de M. Sow doit recevoir le vaccin DTC-HepB-Hib 3 le 15/12/2025. HealthFlow Africa', templateId: 'vaccination_reminder', status: 'Envoyé', sentAt: '2026-05-05T10:00:00', deliveredAt: null, errorMessage: null },
  { id: 'MSG-004', channel: 'WhatsApp', recipient: '+224 622 11 22 33', recipientName: 'Aminata Diallo', message: 'Paiement de 60,000 GNF reçu pour la facture #FAC-002. Merci ! HealthFlow Africa', templateId: 'payment_confirmation', status: 'Délivré', sentAt: '2026-05-10T09:32:00', deliveredAt: '2026-05-10T09:33:00', errorMessage: null },
  { id: 'MSG-005', channel: 'SMS', recipient: '+224 620 33 44 55', recipientName: 'Aïssatou Baldé', message: 'ALERTE : Rupture de stock Salbutamol inhalé prévue sous 7 jours. Contactez immédiatement votre centre de santé. HealthFlow Africa', templateId: 'emergency_alert', status: 'Échoué', sentAt: '2026-05-06T15:00:00', deliveredAt: null, errorMessage: 'Numéro injoignable' },
]

const demoPaymentPlans: PaymentPlan[] = [
  {
    id: 'PP-001', invoiceId: 'FAC-004', patientId: 'P-2024-010', patientName: 'Ousmane Camara', totalAmount: 450000, downPayment: 90000, installmentCount: 6, installmentAmount: 60000, startDate: '2026-06-01', status: 'Actif',
    installments: [
      { id: 'PP-001-1', dueDate: '2026-06-01', amount: 90000, paidDate: '2026-06-01', status: 'Payé' },
      { id: 'PP-001-2', dueDate: '2026-07-01', amount: 60000, paidDate: null, status: 'En attente' },
      { id: 'PP-001-3', dueDate: '2026-08-01', amount: 60000, paidDate: null, status: 'En attente' },
      { id: 'PP-001-4', dueDate: '2026-09-01', amount: 60000, paidDate: null, status: 'En attente' },
      { id: 'PP-001-5', dueDate: '2026-10-01', amount: 60000, paidDate: null, status: 'En attente' },
      { id: 'PP-001-6', dueDate: '2026-11-01', amount: 60000, paidDate: null, status: 'En attente' },
      { id: 'PP-001-7', dueDate: '2026-12-01', amount: 60000, paidDate: null, status: 'En attente' },
    ],
  },
]

/* ─────────── Phase 3 Demo Data ─────────── */

const demoEpidemiologicalAlerts: EpidemiologicalAlert[] = [
  {
    id: 'EPI-001', disease: 'Paludisme', location: 'Conakry', healthZone: 'Kaloum',
    alertLevel: 'ALERTE', firstCaseDate: '2026-04-15', caseCount: 47, deathCount: 3,
    affectedAreas: ['Kaloum', 'Dixinn', 'Matam'], description: 'Augmentation significative des cas de paludisme avec début de saison des pluies',
    recommendedActions: ['Renforcer la distribution de moustiquaires', 'Augmenter les stocks de TDR et ACT', 'Campagne de sensibilisation'],
    status: 'Actif', createdAt: '2026-04-20', updatedAt: '2026-05-08'
  },
  {
    id: 'EPI-002', disease: 'Choléra', location: 'Kindia', healthZone: 'Kindia Centre',
    alertLevel: 'ÉPIDÉMIE', firstCaseDate: '2026-03-28', caseCount: 124, deathCount: 8,
    affectedAreas: ['Kindia Centre', 'Kindia Périphérie', 'Télimélé'], description: 'Épidémie de choléra déclarée dans la région de Kindia, liée aux inondations récentes',
    recommendedActions: ['Activation du centre de traitement choléra', 'Distribution de kits de purification d\'eau', 'Vaccination orale', 'Signalement OMS'],
    status: 'Actif', createdAt: '2026-04-02', updatedAt: '2026-05-09'
  },
  {
    id: 'EPI-003', disease: 'Méningite', location: 'N\'Zérékoré', healthZone: 'N\'Zérékoré Centre',
    alertLevel: 'VEILLE', firstCaseDate: '2026-04-05', caseCount: 12, deathCount: 1,
    affectedAreas: ['N\'Zérékoré Centre'], description: 'Cluster de cas de méningite en zone forestière, période sèche',
    recommendedActions: ['Surveillance renforcée', 'Préparer stocks de vaccins', 'Éducation communautaire'],
    status: 'En investigation', createdAt: '2026-04-10', updatedAt: '2026-05-05'
  },
  {
    id: 'EPI-004', disease: 'Rougeole', location: 'Conakry', healthZone: 'Matoto',
    alertLevel: 'ALERTE', firstCaseDate: '2026-04-22', caseCount: 28, deathCount: 0,
    affectedAreas: ['Matoto', 'Ratoma'], description: 'Cas groupés de rougeole chez les enfants non vaccinés de Matoto',
    recommendedActions: ['Campagne de vaccination de riposte', 'Recherche active de cas', 'Isolation des cas'],
    status: 'Actif', createdAt: '2026-04-28', updatedAt: '2026-05-08'
  },
  {
    id: 'EPI-005', disease: 'Fièvre de Lassa', location: 'Faranah', healthZone: 'Faranah Centre',
    alertLevel: 'VEILLE', firstCaseDate: '2026-05-01', caseCount: 3, deathCount: 1,
    affectedAreas: ['Faranah Centre'], description: 'Cas suspects de fièvre de Lassa dans la région de Faranah',
    recommendedActions: ['Confirmation laboratoire', 'Traçage des contacts', 'Dépistage dans les villages voisins'],
    status: 'En investigation', createdAt: '2026-05-03', updatedAt: '2026-05-09'
  },
]

const demoSurveillanceData: SurveillanceDataPoint[] = [
  { date: '2026-04-01', disease: 'Paludisme', location: 'Conakry', caseCount: 32, deathCount: 2, alertLevel: 'VEILLE' },
  { date: '2026-04-08', disease: 'Paludisme', location: 'Conakry', caseCount: 38, deathCount: 3, alertLevel: 'VEILLE' },
  { date: '2026-04-15', disease: 'Paludisme', location: 'Conakry', caseCount: 47, deathCount: 3, alertLevel: 'ALERTE' },
  { date: '2026-04-22', disease: 'Paludisme', location: 'Conakry', caseCount: 55, deathCount: 4, alertLevel: 'ALERTE' },
  { date: '2026-04-29', disease: 'Paludisme', location: 'Conakry', caseCount: 63, deathCount: 5, alertLevel: 'ALERTE' },
  { date: '2026-05-06', disease: 'Paludisme', location: 'Conakry', caseCount: 71, deathCount: 6, alertLevel: 'ALERTE' },
  { date: '2026-04-01', disease: 'Choléra', location: 'Kindia', caseCount: 15, deathCount: 1, alertLevel: 'ALERTE' },
  { date: '2026-04-08', disease: 'Choléra', location: 'Kindia', caseCount: 34, deathCount: 3, alertLevel: 'ÉPIDÉMIE' },
  { date: '2026-04-15', disease: 'Choléra', location: 'Kindia', caseCount: 67, deathCount: 5, alertLevel: 'ÉPIDÉMIE' },
  { date: '2026-04-22', disease: 'Choléra', location: 'Kindia', caseCount: 89, deathCount: 6, alertLevel: 'ÉPIDÉMIE' },
  { date: '2026-04-29', disease: 'Choléra', location: 'Kindia', caseCount: 108, deathCount: 7, alertLevel: 'ÉPIDÉMIE' },
  { date: '2026-05-06', disease: 'Choléra', location: 'Kindia', caseCount: 124, deathCount: 8, alertLevel: 'ÉPIDÉMIE' },
  { date: '2026-04-01', disease: 'Méningite', location: 'N\'Zérékoré', caseCount: 2, deathCount: 0, alertLevel: 'VEILLE' },
  { date: '2026-04-15', disease: 'Méningite', location: 'N\'Zérékoré', caseCount: 5, deathCount: 0, alertLevel: 'VEILLE' },
  { date: '2026-05-01', disease: 'Méningite', location: 'N\'Zérékoré', caseCount: 12, deathCount: 1, alertLevel: 'VEILLE' },
  { date: '2026-04-22', disease: 'Rougeole', location: 'Conakry', caseCount: 8, deathCount: 0, alertLevel: 'VEILLE' },
  { date: '2026-04-29', disease: 'Rougeole', location: 'Conakry', caseCount: 18, deathCount: 0, alertLevel: 'ALERTE' },
  { date: '2026-05-06', disease: 'Rougeole', location: 'Conakry', caseCount: 28, deathCount: 0, alertLevel: 'ALERTE' },
]

const demoOutbreakPredictions: OutbreakPrediction[] = [
  { disease: 'Paludisme', riskScore: 85, probability: 0.78, predictedPeakDate: '2026-06-15', confidence: 0.72, preventiveActions: ['Distribution moustiquaires imprégnées', 'Pulvérisation intra-domiciliaire', 'Prophylaxie saisonnière enfants'] },
  { disease: 'Choléra', riskScore: 92, probability: 0.88, predictedPeakDate: '2026-05-30', confidence: 0.82, preventiveActions: ['Chloration points d\'eau', 'Latrines d\'urgence', 'Vaccination orale de masse'] },
  { disease: 'Méningite', riskScore: 45, probability: 0.35, predictedPeakDate: '2026-06-01', confidence: 0.55, preventiveActions: ['Vaccination méningococcique', 'Surveillance renforcée'] },
  { disease: 'Fièvre de Lassa', riskScore: 55, probability: 0.42, predictedPeakDate: '2026-07-01', confidence: 0.48, preventiveActions: ['Lutte anti-rongeurs', 'Hygiène alimentaire', 'Protection du personnel de santé'] },
  { disease: 'Rougeole', riskScore: 70, probability: 0.65, predictedPeakDate: '2026-05-25', confidence: 0.68, preventiveActions: ['Campagne vaccination rattrapage', 'Recherche active cas', 'Isolation'] },
  { disease: 'COVID-19/Influenza', riskScore: 30, probability: 0.25, predictedPeakDate: '2026-08-01', confidence: 0.40, preventiveActions: ['Surveillance grippale', 'Vaccination COVID rappel'] },
]

const defaultReminderSettings: ReminderSettings = {
  appointmentReminders: true,
  appointmentChannel: 'SMS',
  appointmentTiming: '24h',
  labResultNotifications: true,
  labResultChannel: 'WhatsApp',
  vaccinationReminders: true,
  vaccinationChannel: 'SMS',
  paymentReminders: true,
  paymentChannel: 'SMS',
  prescriptionReminders: false,
}

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

  // Phase 2
  mobileMoneyTransactions: MobileMoneyTransaction[]
  insuranceProviders: InsuranceProvider[]
  insuranceClaims: InsuranceClaim[]
  messageLogs: MessageLog[]
  paymentPlans: PaymentPlan[]
  reminderSettings: ReminderSettings

  // Phase 3 - AI
  epidemiologicalAlerts: EpidemiologicalAlert[]
  surveillanceData: SurveillanceDataPoint[]
  outbreakPredictions: OutbreakPrediction[]

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

  // Phase 2 actions — Mobile Money
  addMobileMoneyTransaction: (txn: MobileMoneyTransaction) => void
  updateMobileMoneyTransaction: (id: string, data: Partial<MobileMoneyTransaction>) => void

  // Phase 2 actions — Insurance
  addInsuranceProvider: (provider: InsuranceProvider) => void
  updateInsuranceProvider: (id: string, data: Partial<InsuranceProvider>) => void
  addInsuranceClaim: (claim: InsuranceClaim) => void
  updateInsuranceClaim: (id: string, data: Partial<InsuranceClaim>) => void

  // Phase 2 actions — Messaging
  addMessageLog: (msg: MessageLog) => void
  updateMessageLog: (id: string, data: Partial<MessageLog>) => void

  // Phase 2 actions — Payment Plans
  addPaymentPlan: (plan: PaymentPlan) => void
  updatePaymentPlan: (id: string, data: Partial<PaymentPlan>) => void
  payInstallment: (planId: string, installmentId: string) => void

  // Phase 2 actions — Reminder Settings
  updateReminderSettings: (data: Partial<ReminderSettings>) => void

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
  mobileMoneyTransactions: demoMobileMoneyTransactions,
  insuranceProviders: demoInsuranceProviders,
  insuranceClaims: demoInsuranceClaims,
  messageLogs: demoMessageLogs,
  paymentPlans: demoPaymentPlans,
  reminderSettings: defaultReminderSettings,

  // Phase 3 - AI
  epidemiologicalAlerts: demoEpidemiologicalAlerts,
  surveillanceData: demoSurveillanceData,
  outbreakPredictions: demoOutbreakPredictions,
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

      // Phase 2 — Mobile Money actions
      addMobileMoneyTransaction: (txn) => set((s) => ({ mobileMoneyTransactions: [...s.mobileMoneyTransactions, txn] })),
      updateMobileMoneyTransaction: (id, data) => set((s) => ({
        mobileMoneyTransactions: s.mobileMoneyTransactions.map((t) => t.id === id ? { ...t, ...data } : t),
      })),

      // Phase 2 — Insurance actions
      addInsuranceProvider: (provider) => set((s) => ({ insuranceProviders: [...s.insuranceProviders, provider] })),
      updateInsuranceProvider: (id, data) => set((s) => ({
        insuranceProviders: s.insuranceProviders.map((p) => p.id === id ? { ...p, ...data } : p),
      })),
      addInsuranceClaim: (claim) => set((s) => ({ insuranceClaims: [...s.insuranceClaims, claim] })),
      updateInsuranceClaim: (id, data) => set((s) => ({
        insuranceClaims: s.insuranceClaims.map((c) => c.id === id ? { ...c, ...data } : c),
      })),

      // Phase 2 — Messaging actions
      addMessageLog: (msg) => set((s) => ({ messageLogs: [msg, ...s.messageLogs] })),
      updateMessageLog: (id, data) => set((s) => ({
        messageLogs: s.messageLogs.map((m) => m.id === id ? { ...m, ...data } : m),
      })),

      // Phase 2 — Payment Plan actions
      addPaymentPlan: (plan) => set((s) => ({ paymentPlans: [...s.paymentPlans, plan] })),
      updatePaymentPlan: (id, data) => set((s) => ({
        paymentPlans: s.paymentPlans.map((p) => p.id === id ? { ...p, ...data } : p),
      })),
      payInstallment: (planId, installmentId) => set((s) => ({
        paymentPlans: s.paymentPlans.map((p) => p.id === planId ? {
          ...p,
          installments: p.installments.map((i) => i.id === installmentId ? { ...i, status: 'Payé' as const, paidDate: new Date().toISOString().split('T')[0] } : i),
        } : p),
      })),

      // Phase 2 — Reminder Settings
      updateReminderSettings: (data) => set((s) => ({ reminderSettings: { ...s.reminderSettings, ...data } })),

      // Reset
      resetToDemo: () => set(initialState),
    }),
    {
      name: 'healthflow-data-store',
      // SECURITY FIX v2: partialize to avoid persisting PHI (Protected Health Information)
      // to localStorage. PHI should only be loaded from the database via API routes.
      // This store is DEPRECATED for production — migrate to React Query + API calls.
      // Only UI state (currentView, selectedPatientId, etc.) should be persisted.
      partialize: (state) => ({
        // Only persist data that differs from initial demo state
        patients: state.patients.filter(p => !p.id.startsWith('P-2024-')),
        appointments: state.appointments.filter(a => !a.id.startsWith('RDV-')),
        invoices: state.invoices.filter(i => !i.id.startsWith('FAC-')),
        mobileMoneyTransactions: state.mobileMoneyTransactions.filter(t => !t.id.startsWith('MM-')),
        insuranceClaims: state.insuranceClaims.filter(c => !c.id.startsWith('CLM-')),
        reminderSettings: state.reminderSettings,
      }),
    }
  )
)
