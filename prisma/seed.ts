// ============================================================================
// HealthFlow Guinea - Database Seed Script
// Comprehensive seed data for development and staging environments
// ============================================================================

import { PrismaClient } from '@prisma/client';
import { hashSync } from 'bcryptjs';

const prisma = new PrismaClient();

// ============================================================================
// LOGGING UTILITIES
// ============================================================================

function logSection(title: string) {
  console.log('\n' + '='.repeat(70));
  console.log(`  ${title}`);
  console.log('='.repeat(70));
}

function logProgress(message: string) {
  console.log(`  ✓ ${message}`);
}

function logWarning(message: string) {
  console.log(`  ⚠ ${message}`);
}

function logError(message: string, error?: unknown) {
  console.error(`  ✗ ${message}`);
  if (error instanceof Error) {
    console.error(`    Error: ${error.message}`);
  }
}

// ============================================================================
// SEED DATA DEFINITIONS
// ============================================================================

// ---- 1. ESTABLISHMENTS ----
const establishmentsData = [
  {
    name: 'CHU Donka',
    type: 'HOSPITAL',
    code: 'CHK-DONKA',
    address: 'Avenue de la République, Commune de Dixinn',
    city: 'Conakry',
    region: 'Conakry',
    phone: '+224 622 10 00 00',
    email: 'contact@chu-donka-gn.org',
  },
  {
    name: "CHU Ignace Deen",
    type: 'HOSPITAL',
    code: 'CHK-IDEEN',
    address: 'Boulevard du Commerce, Commune de Kaloum',
    city: 'Conakry',
    region: 'Conakry',
    phone: '+224 622 11 00 00',
    email: 'contact@chu-ignace-deen-gn.org',
  },
  {
    name: 'HGR Kankan',
    type: 'HOSPITAL',
    code: 'HGR-KNK',
    address: 'Route de Siguiri, Kankan',
    city: 'Kankan',
    region: 'Kankan',
    phone: '+224 622 20 00 00',
    email: 'contact@hgr-kankan-gn.org',
  },
  {
    name: "HGR N'Zérékoré",
    type: 'HOSPITAL',
    code: 'HGR-NZR',
    address: 'Route de Beyla, N\'Zérékoré',
    city: "N'Zérékoré",
    region: "N'Zérékoré",
    phone: '+224 622 30 00 00',
    email: 'contact@hgr-nzerekore-gn.org',
  },
  {
    name: 'HGR Labé',
    type: 'HOSPITAL',
    code: 'HGR-LAB',
    address: 'Centre Ville, Labé',
    city: 'Labé',
    region: 'Labé',
    phone: '+224 622 40 00 00',
    email: 'contact@hgr-labe-gn.org',
  },
  {
    name: 'HGR Kindia',
    type: 'HOSPITAL',
    code: 'HGR-KIN',
    address: 'Route de Conakry, Kindia',
    city: 'Kindia',
    region: 'Kindia',
    phone: '+224 622 50 00 00',
    email: 'contact@hgr-kindia-gn.org',
  },
  {
    name: 'HGR Boké',
    type: 'HOSPITAL',
    code: 'HGR-BOK',
    address: 'Centre Ville, Boké',
    city: 'Boké',
    region: 'Boké',
    phone: '+224 622 60 00 00',
    email: 'contact@hgr-boke-gn.org',
  },
  {
    name: 'HGR Mamou',
    type: 'HOSPITAL',
    code: 'HGR-MAM',
    address: 'Route de Conakry, Mamou',
    city: 'Mamou',
    region: 'Mamou',
    phone: '+224 622 70 00 00',
    email: 'contact@hgr-mamou-gn.org',
  },
  {
    name: 'HGR Faranah',
    type: 'HOSPITAL',
    code: 'HGR-FAR',
    address: 'Centre Ville, Faranah',
    city: 'Faranah',
    region: 'Faranah',
    phone: '+224 622 80 00 00',
    email: 'contact@hgr-faranah-gn.org',
  },
  {
    name: 'Clinique Pasteur',
    type: 'CLINIC',
    code: 'CLP-CKY',
    address: 'Almamya, Commune de Dixinn',
    city: 'Conakry',
    region: 'Conakry',
    phone: '+224 622 90 00 00',
    email: 'contact@clinique-pasteur-gn.org',
  },
];

// ---- 2. ROLES ----
const rolesData = [
  { name: 'ADMIN', description: 'Administrateur système avec accès complet', isSystem: true },
  { name: 'DOCTOR', description: 'Médecin - consultations, prescriptions, diagnostics', isSystem: true },
  { name: 'NURSE', description: 'Infirmier(e) - soins, triage, suivi patients', isSystem: true },
  { name: 'PHARMACIST', description: 'Pharmacien - gestion pharmacie et stocks médicaments', isSystem: true },
  { name: 'LAB_TECHNICIAN', description: 'Technicien de laboratoire - analyses et prélèvements', isSystem: true },
  { name: 'RECEPTIONIST', description: 'Réceptionniste - accueil, rendez-vous, admissions', isSystem: true },
  { name: 'BIOLOGIST', description: 'Biologiste - validation des résultats de laboratoire', isSystem: true },
  { name: 'ACCOUNTANT', description: 'Comptable - facturation, paiements, assurances', isSystem: true },
];

// ---- 3. PERMISSIONS ----
const permissionsData = [
  // Patient module
  { name: 'patient:read', module: 'patient', description: 'Consulter les dossiers patients' },
  { name: 'patient:write', module: 'patient', description: 'Créer et modifier les dossiers patients' },
  // Appointment module
  { name: 'appointment:read', module: 'appointment', description: 'Consulter les rendez-vous' },
  { name: 'appointment:write', module: 'appointment', description: 'Créer et modifier les rendez-vous' },
  // Consultation module
  { name: 'consultation:read', module: 'consultation', description: 'Consulter les consultations' },
  { name: 'consultation:write', module: 'consultation', description: 'Créer et modifier les consultations' },
  // Lab module
  { name: 'lab:read', module: 'lab', description: 'Consulter les analyses de laboratoire' },
  { name: 'lab:write', module: 'lab', description: 'Créer et modifier les demandes et résultats de laboratoire' },
  { name: 'lab:validate', module: 'lab', description: 'Valider les résultats de laboratoire (biologiste)' },
  // Pharmacy module
  { name: 'pharmacy:read', module: 'pharmacy', description: 'Consulter la pharmacie et les stocks' },
  { name: 'pharmacy:write', module: 'pharmacy', description: 'Gérer la pharmacie, les stocks et les dispensations' },
  // Hospitalization module
  { name: 'hospitalization:read', module: 'hospitalization', description: 'Consulter les hospitalisations' },
  { name: 'hospitalization:write', module: 'hospitalization', description: 'Gérer les admissions et hospitalisations' },
  // Emergency module
  { name: 'emergency:read', module: 'emergency', description: 'Consulter les urgences' },
  { name: 'emergency:write', module: 'emergency', description: 'Gérer les urgences et le triage' },
  // Maternity module
  { name: 'maternity:read', module: 'maternity', description: 'Consulter les dossiers maternité' },
  { name: 'maternity:write', module: 'maternity', description: 'Gérer les grossesses et accouchements' },
  // Vaccination module
  { name: 'vaccination:read', module: 'vaccination', description: 'Consulter les vaccinations' },
  { name: 'vaccination:write', module: 'vaccination', description: 'Gérer les vaccinations' },
  // Billing module
  { name: 'billing:read', module: 'billing', description: 'Consulter la facturation' },
  { name: 'billing:write', module: 'billing', description: 'Créer et modifier les factures' },
  // Payment module
  { name: 'payment:read', module: 'payment', description: 'Consulter les paiements' },
  { name: 'payment:write', module: 'payment', description: 'Enregistrer et modifier les paiements' },
  // Dashboard module
  { name: 'dashboard:read', module: 'dashboard', description: 'Accéder aux tableaux de bord' },
  // Audit module
  { name: 'audit:read', module: 'audit', description: 'Consulter les journaux d\'audit' },
  // User management
  { name: 'user:manage', module: 'user', description: 'Gérer les utilisateurs et leurs accès' },
  // Role management
  { name: 'role:manage', module: 'role', description: 'Gérer les rôles et permissions' },
  // Establishment management
  { name: 'establishment:manage', module: 'establishment', description: 'Gérer les établissements' },
  // Report generation
  { name: 'report:generate', module: 'report', description: 'Générer des rapports statistiques et de santé publique' },
  // System configuration
  { name: 'system:config', module: 'system', description: 'Configurer les paramètres système' },
];

// ---- 4. ROLE-PERMISSION ASSIGNMENTS ----
const rolePermissionsMap: Record<string, string[]> = {
  ADMIN: [
    'patient:read', 'patient:write',
    'appointment:read', 'appointment:write',
    'consultation:read', 'consultation:write',
    'lab:read', 'lab:write', 'lab:validate',
    'pharmacy:read', 'pharmacy:write',
    'hospitalization:read', 'hospitalization:write',
    'emergency:read', 'emergency:write',
    'maternity:read', 'maternity:write',
    'vaccination:read', 'vaccination:write',
    'billing:read', 'billing:write',
    'payment:read', 'payment:write',
    'dashboard:read',
    'audit:read',
    'user:manage',
    'role:manage',
    'establishment:manage',
    'report:generate',
    'system:config',
  ],
  DOCTOR: [
    'patient:read', 'patient:write',
    'appointment:read', 'appointment:write',
    'consultation:read', 'consultation:write',
    'lab:read', 'lab:write',
    'pharmacy:read',
    'hospitalization:read', 'hospitalization:write',
    'emergency:read', 'emergency:write',
    'maternity:read', 'maternity:write',
    'vaccination:read',
    'dashboard:read',
    'report:generate',
  ],
  NURSE: [
    'patient:read', 'patient:write',
    'appointment:read',
    'consultation:read',
    'lab:read',
    'pharmacy:read',
    'hospitalization:read', 'hospitalization:write',
    'emergency:read', 'emergency:write',
    'maternity:read', 'maternity:write',
    'vaccination:read', 'vaccination:write',
    'dashboard:read',
  ],
  PHARMACIST: [
    'patient:read',
    'pharmacy:read', 'pharmacy:write',
    'dashboard:read',
    'report:generate',
  ],
  LAB_TECHNICIAN: [
    'patient:read',
    'lab:read', 'lab:write',
    'dashboard:read',
  ],
  RECEPTIONIST: [
    'patient:read', 'patient:write',
    'appointment:read', 'appointment:write',
    'hospitalization:read',
    'billing:read',
    'dashboard:read',
  ],
  BIOLOGIST: [
    'patient:read',
    'lab:read', 'lab:write', 'lab:validate',
    'dashboard:read',
    'report:generate',
  ],
  ACCOUNTANT: [
    'patient:read',
    'billing:read', 'billing:write',
    'payment:read', 'payment:write',
    'dashboard:read',
    'report:generate',
  ],
};

// ---- 5. USERS ----
const usersData = [
  {
    email: 'admin@healthflow-gn.com',
    password: 'Admin123!',
    firstName: 'Amadou',
    lastName: 'Diallo',
    phone: '+224 620 00 00 01',
    professionalId: 'ADM-001',
    specialization: 'Administration Système',
    roleName: 'ADMIN',
  },
  {
    email: 'dr.diallo@healthflow-gn.com',
    password: 'Doctor123!',
    firstName: 'Mamadou',
    lastName: 'Diallo',
    phone: '+224 620 00 00 02',
    professionalId: 'MED-001',
    specialization: 'Médecine Interne',
    roleName: 'DOCTOR',
  },
  {
    email: 'inf.bah@healthflow-gn.com',
    password: 'Nurse123!',
    firstName: 'Fatoumata',
    lastName: 'Bah',
    phone: '+224 620 00 00 03',
    professionalId: 'INF-001',
    specialization: 'Soins Infirmiers',
    roleName: 'NURSE',
  },
  {
    email: 'pharma.toure@healthflow-gn.com',
    password: 'Pharma123!',
    firstName: 'Ibrahima',
    lastName: 'Touré',
    phone: '+224 620 00 00 04',
    professionalId: 'PHA-001',
    specialization: 'Pharmacie Hospitalière',
    roleName: 'PHARMACIST',
  },
  {
    email: 'lab.sow@healthflow-gn.com',
    password: 'Lab123!',
    firstName: 'Aïssatou',
    lastName: 'Sow',
    phone: '+224 620 00 00 05',
    professionalId: 'LAB-001',
    specialization: 'Biologie Médicale',
    roleName: 'LAB_TECHNICIAN',
  },
];

// ---- 6. DEPARTMENTS FOR CHU DONKA ----
const departmentsData = [
  { name: 'Médecine Interne', code: 'MED-INT', type: 'MEDICAL', floor: '1' },
  { name: 'Chirurgie', code: 'CHIR', type: 'SURGICAL', floor: '2' },
  { name: 'Pédiatrie', code: 'PED', type: 'PEDIATRICS', floor: '1' },
  { name: 'Maternité', code: 'MAT', type: 'MATERNITY', floor: '3' },
  { name: 'Urgences', code: 'URG', type: 'EMERGENCY', floor: 'RDC' },
  { name: 'Laboratoire', code: 'LAB', type: 'LAB', floor: 'RDC' },
  { name: 'Pharmacie', code: 'PHARM', type: 'PHARMACY', floor: 'RDC' },
  { name: 'Radiologie', code: 'RADIO', type: 'MEDICAL', floor: 'RDC' },
];

// ---- 7. ROOM AND BED CONFIG ----
const roomsPerDepartment: Record<string, { number: string; name: string; type: string; bedCount: number; bedType: string }[]> = {
  'MED-INT': [
    { number: 'A101', name: 'Chambre 101 - Médecine', type: 'GENERAL', bedCount: 3, bedType: 'STANDARD' },
    { number: 'A102', name: 'Chambre 102 - Médecine', type: 'GENERAL', bedCount: 3, bedType: 'STANDARD' },
    { number: 'A103', name: 'Chambre 103 - Médecine', type: 'GENERAL', bedCount: 3, bedType: 'STANDARD' },
    { number: 'A104', name: 'Suite 104 - Médecine', type: 'PRIVATE', bedCount: 1, bedType: 'ELECTRIC' },
    { number: 'A105', name: 'Chambre 105 - Médecine', type: 'GENERAL', bedCount: 3, bedType: 'STANDARD' },
  ],
  'CHIR': [
    { number: 'B201', name: 'Chambre 201 - Chirurgie', type: 'GENERAL', bedCount: 3, bedType: 'STANDARD' },
    { number: 'B202', name: 'Chambre 202 - Chirurgie', type: 'GENERAL', bedCount: 3, bedType: 'STANDARD' },
    { number: 'B203', name: 'Bloc Opératoire 1', type: 'OPERATING', bedCount: 2, bedType: 'ELECTRIC' },
    { number: 'B204', name: 'Suite 204 - Chirurgie', type: 'PRIVATE', bedCount: 1, bedType: 'ELECTRIC' },
    { number: 'B205', name: 'Réveil Post-opératoire', type: 'ICU', bedCount: 3, bedType: 'ELECTRIC' },
  ],
  'PED': [
    { number: 'C101', name: 'Chambre 101 - Pédiatrie', type: 'GENERAL', bedCount: 3, bedType: 'STANDARD' },
    { number: 'C102', name: 'Chambre 102 - Pédiatrie', type: 'GENERAL', bedCount: 3, bedType: 'STANDARD' },
    { number: 'C103', name: 'Chambre 103 - Pédiatrie', type: 'GENERAL', bedCount: 3, bedType: 'STANDARD' },
    { number: 'C104', name: 'Néonatologie', type: 'ICU', bedCount: 4, bedType: 'STANDARD' },
    { number: 'C105', name: 'Suite Parents-Enfant', type: 'PRIVATE', bedCount: 1, bedType: 'STANDARD' },
  ],
  'MAT': [
    { number: 'D301', name: 'Salle Pré-travail', type: 'GENERAL', bedCount: 3, bedType: 'STANDARD' },
    { number: 'D302', name: 'Salle d\'accouchement 1', type: 'OPERATING', bedCount: 1, bedType: 'ELECTRIC' },
    { number: 'D303', name: 'Salle d\'accouchement 2', type: 'OPERATING', bedCount: 1, bedType: 'ELECTRIC' },
    { number: 'D304', name: 'Suite Post-partum', type: 'PRIVATE', bedCount: 3, bedType: 'STANDARD' },
    { number: 'D305', name: 'Chambre Post-partum', type: 'GENERAL', bedCount: 3, bedType: 'STANDARD' },
  ],
  'URG': [
    { number: 'E001', name: 'Box Rouge - Urgences vitales', type: 'ICU', bedCount: 2, bedType: 'ELECTRIC' },
    { number: 'E002', name: 'Box Orange - Urgences graves', type: 'GENERAL', bedCount: 3, bedType: 'STANDARD' },
    { number: 'E003', name: 'Box Jaune - Urgences moindres', type: 'GENERAL', bedCount: 3, bedType: 'STANDARD' },
    { number: 'E004', name: 'Salle de consultation urgence', type: 'CONSULTATION', bedCount: 2, bedType: 'STRETCHER' },
    { number: 'E005', name: 'Salle d\'observation', type: 'GENERAL', bedCount: 4, bedType: 'STANDARD' },
  ],
  'LAB': [
    { number: 'F001', name: 'Laboratoire - Prélèvements', type: 'LAB', bedCount: 2, bedType: 'STANDARD' },
    { number: 'F002', name: 'Laboratoire - Hématologie', type: 'LAB', bedCount: 0, bedType: 'STANDARD' },
    { number: 'F003', name: 'Laboratoire - Biochimie', type: 'LAB', bedCount: 0, bedType: 'STANDARD' },
    { number: 'F004', name: 'Laboratoire - Microbiologie', type: 'LAB', bedCount: 0, bedType: 'STANDARD' },
    { number: 'F005', name: 'Laboratoire - Immunologie', type: 'LAB', bedCount: 0, bedType: 'STANDARD' },
  ],
  'PHARM': [
    { number: 'G001', name: 'Pharmacie - Dispensation', type: 'CONSULTATION', bedCount: 0, bedType: 'STANDARD' },
    { number: 'G002', name: 'Pharmacie - Stock principal', type: 'GENERAL', bedCount: 0, bedType: 'STANDARD' },
    { number: 'G003', name: 'Pharmacie - Stock réfrigéré', type: 'GENERAL', bedCount: 0, bedType: 'STANDARD' },
    { number: 'G004', name: 'Pharmacie - Préparation', type: 'LAB', bedCount: 0, bedType: 'STANDARD' },
    { number: 'G005', name: 'Pharmacie - Réserve', type: 'GENERAL', bedCount: 0, bedType: 'STANDARD' },
  ],
  'RADIO': [
    { number: 'H001', name: 'Radiologie - Radiographie', type: 'CONSULTATION', bedCount: 1, bedType: 'STANDARD' },
    { number: 'H002', name: 'Radiologie - Échographie', type: 'CONSULTATION', bedCount: 1, bedType: 'STANDARD' },
    { number: 'H003', name: 'Radiologie - Scanner', type: 'CONSULTATION', bedCount: 1, bedType: 'STANDARD' },
    { number: 'H004', name: 'Radiologie - Attente', type: 'GENERAL', bedCount: 0, bedType: 'STANDARD' },
    { number: 'H005', name: 'Radiologie - Lecture', type: 'CONSULTATION', bedCount: 0, bedType: 'STANDARD' },
  ],
};

// ---- 8. LAB TEST CATALOG ----
const labTestsData = [
  { name: 'NFS - Numération Formule Sanguine', code: 'NFS', category: 'HEMATOLOGY', specimenType: 'BLOOD', normalRangeMin: null, normalRangeMax: null, unit: null, turnaroundHours: 4, price: 15000, description: 'Hémogramme complet : GB, GR, Hb, Ht, plaquettes' },
  { name: 'Glycémie', code: 'GLYC', category: 'BIOCHEMISTRY', specimenType: 'BLOOD', normalRangeMin: 0.7, normalRangeMax: 1.1, unit: 'g/L', turnaroundHours: 2, price: 10000, description: 'Taux de glucose sanguin à jeun' },
  { name: 'Créatinine', code: 'CREAT', category: 'BIOCHEMISTRY', specimenType: 'BLOOD', normalRangeMin: 6, normalRangeMax: 12, unit: 'mg/L', turnaroundHours: 2, price: 10000, description: 'Fonction rénale - créatinémie' },
  { name: 'Transaminases (ASAT/ALAT)', code: 'TRANS', category: 'BIOCHEMISTRY', specimenType: 'BLOOD', normalRangeMin: 5, normalRangeMax: 40, unit: 'UI/L', turnaroundHours: 3, price: 15000, description: 'Tests hépatiques ASAT et ALAT' },
  { name: 'Bilirubine totale', code: 'BILIT', category: 'BIOCHEMISTRY', specimenType: 'BLOOD', normalRangeMin: 3, normalRangeMax: 17, unit: 'µmol/L', turnaroundHours: 3, price: 12000, description: 'Bilirubine totale et conjuguée' },
  { name: 'Hémoglobine', code: 'HGB', category: 'HEMATOLOGY', specimenType: 'BLOOD', normalRangeMin: 12, normalRangeMax: 16, unit: 'g/dL', turnaroundHours: 1, price: 8000, description: 'Dosage de l\'hémoglobine sanguine' },
  { name: 'VS - Vitesse de Sédimentation', code: 'VS', category: 'HEMATOLOGY', specimenType: 'BLOOD', normalRangeMin: 0, normalRangeMax: 20, unit: 'mm/h', turnaroundHours: 2, price: 8000, description: 'Vitesse de sédimentation - inflammatoire' },
  { name: 'Groupe Sanguin (ABO + Rhésus)', code: 'GS', category: 'IMMUNOLOGY', specimenType: 'BLOOD', normalRangeMin: null, normalRangeMax: null, unit: null, turnaroundHours: 1, price: 15000, description: 'Détermination du groupe sanguin ABO et Rhésus' },
  { name: 'RAI - Recherche Agglutinines Irrégulières', code: 'RAI', category: 'IMMUNOLOGY', specimenType: 'BLOOD', normalRangeMin: null, normalRangeMax: null, unit: null, turnaroundHours: 2, price: 18000, description: 'Compatibilité transfusionnelle' },
  { name: 'Urée sanguine', code: 'UREE', category: 'BIOCHEMISTRY', specimenType: 'BLOOD', normalRangeMin: 0.15, normalRangeMax: 0.45, unit: 'g/L', turnaroundHours: 2, price: 10000, description: 'Fonction rénale - urémie' },
  { name: 'Potassium', code: 'K', category: 'BIOCHEMISTRY', specimenType: 'BLOOD', normalRangeMin: 3.5, normalRangeMax: 5.0, unit: 'mmol/L', turnaroundHours: 2, price: 12000, description: 'Kaliémie - ionogramme' },
  { name: 'Sodium', code: 'NA', category: 'BIOCHEMISTRY', specimenType: 'BLOOD', normalRangeMin: 135, normalRangeMax: 145, unit: 'mmol/L', turnaroundHours: 2, price: 12000, description: 'Natrémie - ionogramme' },
  { name: 'TSH', code: 'TSH', category: 'HORMONAL', specimenType: 'BLOOD', normalRangeMin: 0.4, normalRangeMax: 4.0, unit: 'mUI/L', turnaroundHours: 6, price: 25000, description: 'Thyrostimuline - fonction thyroïdienne' },
  { name: 'Sérologie VIH', code: 'VIH', category: 'IMMUNOLOGY', specimenType: 'BLOOD', normalRangeMin: null, normalRangeMax: null, unit: null, turnaroundHours: 4, price: 20000, description: 'Dépistage VIH 1 et 2' },
  { name: 'Paludisme (RDT - Test Rapide)', code: 'PALU-RDT', category: 'MICROBIOLOGY', specimenType: 'BLOOD', normalRangeMin: null, normalRangeMax: null, unit: null, turnaroundHours: 1, price: 5000, description: 'Test de diagnostic rapide du paludisme' },
  { name: 'ECBU - Examen Cytobactériologique Urine', code: 'ECBU', category: 'MICROBIOLOGY', specimenType: 'URINE', normalRangeMin: null, normalRangeMax: null, unit: null, turnaroundHours: 24, price: 15000, description: 'Examen cytobactériologique des urines' },
  { name: 'CRP - Protéine C Réactive', code: 'CRP', category: 'BIOCHEMISTRY', specimenType: 'BLOOD', normalRangeMin: 0, normalRangeMax: 6, unit: 'mg/L', turnaroundHours: 2, price: 12000, description: 'Marqueur inflammatoire' },
  { name: 'TP/INR - Taux de Prothrombine', code: 'TP', category: 'HEMATOLOGY', specimenType: 'BLOOD', normalRangeMin: 70, normalRangeMax: 100, unit: '%', turnaroundHours: 3, price: 15000, description: 'Coagulation - taux de prothrombine' },
];

// ---- 9. MEDICATIONS ----
const medicationsData = [
  { name: 'Paracétamol', genericName: 'Paracétamol', code: 'MED-PARA', category: 'ANALGESIC', form: 'TABLET', strength: '500mg', manufacturer: 'Guinpharma', requiresPrescription: false, controlledSubstance: false, minimumStockLevel: 500, unitPrice: 500, sellingPrice: 750, storageConditions: 'Température ambiante (<30°C)', sideEffects: 'Nausées, rash cutané rare', contraindications: 'Insuffisance hépatique sévère' },
  { name: 'Amoxicilline', genericName: 'Amoxicilline', code: 'MED-AMOX', category: 'ANTIBIOTIC', form: 'CAPSULE', strength: '500mg', manufacturer: 'Guinpharma', requiresPrescription: true, controlledSubstance: false, minimumStockLevel: 300, unitPrice: 1500, sellingPrice: 2250, storageConditions: 'Température ambiante (<25°C)', sideEffects: 'Diarrhée, rash, nausées', contraindications: 'Allergie pénicilline' },
  { name: 'Métronidazole', genericName: 'Métronidazole', code: 'MED-METRO', category: 'ANTIBIOTIC', form: 'TABLET', strength: '250mg', manufacturer: 'Guinpharma', requiresPrescription: true, controlledSubstance: false, minimumStockLevel: 200, unitPrice: 1200, sellingPrice: 1800, storageConditions: 'Température ambiante, lieu sec', sideEffects: 'Nausées, goût métallique', contraindications: 'Premier trimestre grossesse' },
  { name: 'Artémether/Luméfantrine', genericName: 'Artémether + Luméfantrine', code: 'MED-AL', category: 'ANTIMALARIAL', form: 'TABLET', strength: '20mg/120mg', manufacturer: 'Coartem', requiresPrescription: true, controlledSubstance: false, minimumStockLevel: 400, unitPrice: 3000, sellingPrice: 4500, storageConditions: 'Température ambiante (<30°C)', sideEffects: 'Céphalées, vertiges, nausées', contraindications: 'Allergie artemisinine' },
  { name: 'Ciprofloxacine', genericName: 'Ciprofloxacine', code: 'MED-CIPRO', category: 'ANTIBIOTIC', form: 'TABLET', strength: '500mg', manufacturer: 'Guinpharma', requiresPrescription: true, controlledSubstance: false, minimumStockLevel: 200, unitPrice: 2000, sellingPrice: 3000, storageConditions: 'Température ambiante, lumière indirecte', sideEffects: 'Nausées, diarrhée, tendinite', contraindications: 'Enfant <18 ans, grossesse' },
  { name: 'Oméprazole', genericName: 'Oméprazole', code: 'MED-OME', category: 'ANTIULCER', form: 'CAPSULE', strength: '20mg', manufacturer: 'Guinpharma', requiresPrescription: true, controlledSubstance: false, minimumStockLevel: 250, unitPrice: 1800, sellingPrice: 2700, storageConditions: 'Température ambiante, lieu sec', sideEffects: 'Céphalées, douleur abdominale', contraindications: 'Allergie inhibiteurs pompe à protons' },
  { name: 'Diclofénac', genericName: 'Diclofénac sodium', code: 'MED-DICLO', category: 'ANTIINFLAMMATORY', form: 'TABLET', strength: '50mg', manufacturer: 'Guinpharma', requiresPrescription: true, controlledSubstance: false, minimumStockLevel: 200, unitPrice: 1000, sellingPrice: 1500, storageConditions: 'Température ambiante', sideEffects: 'Troubles gastriques, vertiges', contraindications: 'Ulcère gastroduodénal évolutif' },
  { name: 'Salbutamol', genericName: 'Salbutamol', code: 'MED-SALB', category: 'BRONCHODILATOR', form: 'INHALATION', strength: '100µg/dose', manufacturer: 'GSK', requiresPrescription: true, controlledSubstance: false, minimumStockLevel: 100, unitPrice: 5000, sellingPrice: 7500, storageConditions: 'Température ambiante (<25°C)', sideEffects: 'Tremblements, tachycardie', contraindications: 'Hypersensibilité au salbutamol' },
  { name: 'Céftriaxone', genericName: 'Céftriaxone', code: 'MED-CEFTR', category: 'ANTIBIOTIC', form: 'INJECTION', strength: '1g', manufacturer: 'Roche', requiresPrescription: true, controlledSubstance: false, minimumStockLevel: 100, unitPrice: 8000, sellingPrice: 12000, storageConditions: 'Température ambiante, reconstituer avant usage', sideEffects: 'Diarrhée, rash, réaction allergique', contraindications: 'Allergie céphalosporines' },
  { name: 'Gentamicine', genericName: 'Gentamicine', code: 'MED-GENTA', category: 'ANTIBIOTIC', form: 'INJECTION', strength: '80mg/2mL', manufacturer: 'Guinpharma', requiresPrescription: true, controlledSubstance: false, minimumStockLevel: 100, unitPrice: 3000, sellingPrice: 4500, storageConditions: 'Température ambiante (<25°C)', sideEffects: 'Néphrotoxicité, ototoxicité', contraindications: 'Insuffisance rénale sévère' },
  { name: 'Amlodipine', genericName: 'Amlodipine bésilate', code: 'MED-AMLO', category: 'ANTIHYPERTENSIVE', form: 'TABLET', strength: '5mg', manufacturer: 'Guinpharma', requiresPrescription: true, controlledSubstance: false, minimumStockLevel: 200, unitPrice: 1500, sellingPrice: 2250, storageConditions: 'Température ambiante, lieu sec', sideEffects: 'Œdème, céphalées, bouffées de chaleur', contraindications: 'Choc cardiogénique' },
  { name: 'Metformine', genericName: 'Metformine chlorhydrate', code: 'MED-METF', category: 'ANTIDIABETIC', form: 'TABLET', strength: '500mg', manufacturer: 'Guinpharma', requiresPrescription: true, controlledSubstance: false, minimumStockLevel: 250, unitPrice: 1000, sellingPrice: 1500, storageConditions: 'Température ambiante, lieu sec', sideEffects: 'Troubles digestifs, acidose lactique rare', contraindications: 'Insuffisance rénale sévère' },
  { name: 'Férodine (Fer + Acide Folique)', genericName: 'Fer + Acide Folique', code: 'MED-FER', category: 'HEMATINIC', form: 'TABLET', strength: '200mg/0.4mg', manufacturer: 'Guinpharma', requiresPrescription: false, controlledSubstance: false, minimumStockLevel: 500, unitPrice: 500, sellingPrice: 750, storageConditions: 'Température ambiante, lieu sec', sideEffects: 'Constipation, selles noires', contraindications: 'Hémochromatose' },
  { name: 'Sulfadoxine/Pyriméthamine', genericName: 'Sulfadoxine + Pyriméthamine', code: 'MED-SP', category: 'ANTIMALARIAL', form: 'TABLET', strength: '500mg/25mg', manufacturer: 'Guinpharma', requiresPrescription: true, controlledSubstance: false, minimumStockLevel: 300, unitPrice: 1500, sellingPrice: 2250, storageConditions: 'Température ambiante', sideEffects: 'Nausées, rash cutané', contraindications: 'Allergie sulfamides' },
  { name: 'Famotidine', genericName: 'Famotidine', code: 'MED-FAMO', category: 'ANTIULCER', form: 'TABLET', strength: '20mg', manufacturer: 'Guinpharma', requiresPrescription: true, controlledSubstance: false, minimumStockLevel: 200, unitPrice: 1200, sellingPrice: 1800, storageConditions: 'Température ambiante, lieu sec', sideEffects: 'Céphalées, vertiges', contraindications: 'Hypersensibilité à la famotidine' },
  { name: 'Doxycycline', genericName: 'Doxycycline', code: 'MED-DOXY', category: 'ANTIBIOTIC', form: 'CAPSULE', strength: '100mg', manufacturer: 'Guinpharma', requiresPrescription: true, controlledSubstance: false, minimumStockLevel: 200, unitPrice: 1500, sellingPrice: 2250, storageConditions: 'Température ambiante, lieu sec', sideEffects: 'Troubles digestifs, photosensibilité', contraindications: 'Enfant <8 ans, grossesse' },
  { name: 'Albendazole', genericName: 'Albendazole', code: 'MED-ALB', category: 'ANTHELMINTIC', form: 'TABLET', strength: '400mg', manufacturer: 'Guinpharma', requiresPrescription: false, controlledSubstance: false, minimumStockLevel: 500, unitPrice: 800, sellingPrice: 1200, storageConditions: 'Température ambiante', sideEffects: 'Troubles digestifs transitoires', contraindications: 'Grossesse' },
  { name: 'Ibuprofène', genericName: 'Ibuprofène', code: 'MED-IBU', category: 'ANTIINFLAMMATORY', form: 'TABLET', strength: '400mg', manufacturer: 'Guinpharma', requiresPrescription: false, controlledSubstance: false, minimumStockLevel: 300, unitPrice: 800, sellingPrice: 1200, storageConditions: 'Température ambiante, lieu sec', sideEffects: 'Troubles gastriques, vertiges', contraindications: 'Ulcère gastroduodénal' },
  { name: 'Oxytocine', genericName: 'Oxytocine', code: 'MED-OXY', category: 'UTEROACTIVE', form: 'INJECTION', strength: '5UI/mL', manufacturer: 'Guinpharma', requiresPrescription: true, controlledSubstance: false, minimumStockLevel: 50, unitPrice: 5000, sellingPrice: 7500, storageConditions: 'Réfrigérateur (2-8°C)', sideEffects: 'Hypercontraction utérine', contraindications: 'Rupture utérine' },
  { name: 'Misoprostol', genericName: 'Misoprostol', code: 'MED-MISO', category: 'UTEROACTIVE', form: 'TABLET', strength: '200µg', manufacturer: 'Pfizer', requiresPrescription: true, controlledSubstance: false, minimumStockLevel: 100, unitPrice: 3000, sellingPrice: 4500, storageConditions: 'Température ambiante, lieu sec', sideEffects: 'Diarrhée, douleurs abdominales', contraindications: 'Grossesse non souhaitée en interruption' },
  { name: 'Sérothérapie antivenimeuse', genericName: 'Antivenin', code: 'MED-ANTV', category: 'ANTIVENOM', form: 'INJECTION', strength: '10mL', manufacturer: 'Institut Pasteur', requiresPrescription: true, controlledSubstance: false, minimumStockLevel: 20, unitPrice: 50000, sellingPrice: 75000, storageConditions: 'Réfrigérateur (2-8°C)', sideEffects: 'Choc anaphylactique possible', contraindications: 'Allergie sérum équin' },
  { name: 'Vitamine A', genericName: 'Rétinol', code: 'MED-VITA', category: 'VITAMIN', form: 'CAPSULE', strength: '200000 UI', manufacturer: 'UNICEF', requiresPrescription: false, controlledSubstance: false, minimumStockLevel: 500, unitPrice: 300, sellingPrice: 500, storageConditions: 'Température ambiante, à l\'abri de la lumière', sideEffects: 'Hypervitaminose A (rare)', contraindications: 'Hypervitaminose A' },
];

// ---- 10. VACCINATION SCHEDULES (PEV Guinea) ----
const vaccinationSchedulesData = [
  { name: 'BCG', vaccineName: 'Bacille de Calmette et Guérin', code: 'BCG', recommendedAgeMinDays: 0, recommendedAgeMaxDays: 30, numberOfDoses: 1, route: 'IM', targetDisease: 'Tuberculose', isMandatory: true, description: 'Vaccination BCG à la naissance', sideEffects: 'Réaction locale, abcès rare' },
  { name: 'VHB0', vaccineName: 'Hépatite B (dose naissance)', code: 'VHB0', recommendedAgeMinDays: 0, recommendedAgeMaxDays: 1, numberOfDoses: 1, route: 'IM', targetDisease: 'Hépatite B', isMandatory: true, description: 'Vaccination hépatite B à la naissance (dose 0)', sideEffects: 'Douleur au point d\'injection' },
  { name: 'Polio0', vaccineName: 'Polio oral (dose naissance)', code: 'POLIO0', recommendedAgeMinDays: 0, recommendedAgeMaxDays: 14, numberOfDoses: 1, route: 'ORAL', targetDisease: 'Poliomyélite', isMandatory: true, description: 'Vaccination polio oral à la naissance (dose 0)', sideEffects: 'Fièvre légère' },
  { name: 'DTC-HepB-Hib1', vaccineName: 'DTC-Hépatite B-Hib (dose 1)', code: 'DTC-HEPB-HIB1', recommendedAgeMinDays: 42, recommendedAgeMaxDays: 90, numberOfDoses: 1, route: 'IM', targetDisease: 'Diphtérie, Tétanos, Coqueluche, Hépatite B, Haemophilus', isMandatory: true, description: 'Pentavalent dose 1 à 6 semaines', sideEffects: 'Fièvre, douleur au point d\'injection' },
  { name: 'DTC-HepB-Hib2', vaccineName: 'DTC-Hépatite B-Hib (dose 2)', code: 'DTC-HEPB-HIB2', recommendedAgeMinDays: 70, recommendedAgeMaxDays: 120, numberOfDoses: 1, intervalDays: 28, route: 'IM', targetDisease: 'Diphtérie, Tétanos, Coqueluche, Hépatite B, Haemophilus', isMandatory: true, description: 'Pentavalent dose 2 à 10 semaines', sideEffects: 'Fièvre, douleur au point d\'injection' },
  { name: 'DTC-HepB-Hib3', vaccineName: 'DTC-Hépatite B-Hib (dose 3)', code: 'DTC-HEPB-HIB3', recommendedAgeMinDays: 98, recommendedAgeMaxDays: 150, numberOfDoses: 1, intervalDays: 28, route: 'IM', targetDisease: 'Diphtérie, Tétanos, Coqueluche, Hépatite B, Haemophilus', isMandatory: true, description: 'Pentavalent dose 3 à 14 semaines', sideEffects: 'Fièvre, douleur au point d\'injection' },
  { name: 'Polio1', vaccineName: 'Polio oral (dose 1)', code: 'POLIO1', recommendedAgeMinDays: 42, recommendedAgeMaxDays: 90, numberOfDoses: 1, route: 'ORAL', targetDisease: 'Poliomyélite', isMandatory: true, description: 'Polio oral dose 1 à 6 semaines', sideEffects: 'Fièvre légère' },
  { name: 'Polio2', vaccineName: 'Polio oral (dose 2)', code: 'POLIO2', recommendedAgeMinDays: 70, recommendedAgeMaxDays: 120, numberOfDoses: 1, intervalDays: 28, route: 'ORAL', targetDisease: 'Poliomyélite', isMandatory: true, description: 'Polio oral dose 2 à 10 semaines', sideEffects: 'Fièvre légère' },
  { name: 'Polio3', vaccineName: 'Polio oral (dose 3)', code: 'POLIO3', recommendedAgeMinDays: 98, recommendedAgeMaxDays: 150, numberOfDoses: 1, intervalDays: 28, route: 'ORAL', targetDisease: 'Poliomyélite', isMandatory: true, description: 'Polio oral dose 3 à 14 semaines', sideEffects: 'Fièvre légère' },
  { name: 'VAR', vaccineName: 'Vaccin Anti-Rougeoleux', code: 'VAR', recommendedAgeMinDays: 270, recommendedAgeMaxDays: 365, numberOfDoses: 1, route: 'SC', targetDisease: 'Rougeole', isMandatory: true, description: 'Vaccination rougeole à 9 mois', sideEffects: 'Fièvre, rash léger 7-10 jours après' },
  { name: 'VAA', vaccineName: 'Vaccin Anti-Amaril (Fièvre Jaune)', code: 'VAA', recommendedAgeMinDays: 270, recommendedAgeMaxDays: 365, numberOfDoses: 1, route: 'SC', targetDisease: 'Fièvre Jaune', isMandatory: true, description: 'Vaccination fièvre jaune à 9 mois', sideEffects: 'Céphalées, myalgie, fièvre légère' },
];

// ---- 11. INSURANCE COMPANIES ----
const insuranceCompaniesData = [
  {
    name: 'NSIA Assurance Guinée',
    code: 'NSIA-GN',
    address: 'Avenue de la République, Conakry',
    phone: '+224 630 00 00 01',
    email: 'sante@nsia-guinee.com',
    coveragePercentage: 80,
    contactPerson: 'Mamadou Diop',
  },
  {
    name: 'Sunu Santé Guinée',
    code: 'SUNU-GN',
    address: 'Boulevard du Commerce, Conakry',
    phone: '+224 630 00 00 02',
    email: 'sante@sunu-guinee.com',
    coveragePercentage: 75,
    contactPerson: 'Aïssatou Camara',
  },
  {
    name: 'SONIGUI - Société Nationale d\'Assurance de Guinée',
    code: 'SONIGUI',
    address: 'Almamya, Commune de Dixinn, Conakry',
    phone: '+224 630 00 00 03',
    email: 'contact@sonigui-gn.com',
    coveragePercentage: 60,
    contactPerson: 'Ibrahima Condé',
  },
];

// ---- 12. SYSTEM CONFIG ----
const systemConfigData = [
  { key: 'app.name', value: 'HealthFlow Guinea', category: 'GENERAL', description: 'Nom de l\'application', isPublic: true },
  { key: 'app.version', value: '1.0.0', category: 'GENERAL', description: 'Version de l\'application', isPublic: true },
  { key: 'app.defaultLanguage', value: 'fr', category: 'GENERAL', description: 'Langue par défaut (fr, en, msk, sus, ff)', isPublic: true },
  { key: 'app.timezone', value: 'Africa/Conakry', category: 'GENERAL', description: 'Fuseau horaire par défaut', isPublic: true },
  { key: 'app.country', value: 'Guinea', category: 'GENERAL', description: 'Pays par défaut', isPublic: true },
  { key: 'app.currency', value: 'GNF', category: 'GENERAL', description: 'Devise (Franc Guinéen)', isPublic: true },
  { key: 'app.phonePrefix', value: '+224', category: 'GENERAL', description: 'Préfixe téléphonique Guinée', isPublic: true },
  { key: 'billing.taxRate', value: '0', category: 'BILLING', description: 'Taux de taxe applicable (0% en santé)', isPublic: false },
  { key: 'billing.defaultPaymentMethod', value: 'CASH', category: 'BILLING', description: 'Méthode de paiement par défaut', isPublic: false },
  { key: 'billing.mobileMoneyProviders', value: '["ORANGE","MTN","CELLCOM"]', category: 'BILLING', description: 'Fournisseurs Mobile Money disponibles', isPublic: true },
  { key: 'notification.smsEnabled', value: 'true', category: 'NOTIFICATION', description: 'Activation des notifications SMS', isPublic: false },
  { key: 'notification.emailEnabled', value: 'true', category: 'NOTIFICATION', description: 'Activation des notifications email', isPublic: false },
  { key: 'notification.appointmentReminderHours', value: '24', category: 'NOTIFICATION', description: 'Heures avant rendez-vous pour rappel', isPublic: false },
  { key: 'notification.vaccinationReminderDays', value: '7', category: 'NOTIFICATION', description: 'Jours avant vaccination pour rappel', isPublic: false },
  { key: 'lab.defaultTurnaroundHours', value: '24', category: 'LAB', description: 'Délai par défaut pour résultats laboratoire (heures)', isPublic: false },
  { key: 'lab.autoValidateNormal', value: 'false', category: 'LAB', description: 'Validation automatique des résultats normaux', isPublic: false },
  { key: 'pharmacy.lowStockThresholdPercent', value: '20', category: 'PHARMACY', description: 'Seuil alerte stock bas (%)', isPublic: false },
  { key: 'pharmacy.expiryWarningDays', value: '90', category: 'PHARMACY', description: 'Jours avant expiration pour alerte', isPublic: false },
  { key: 'pharmacy.expiryCriticalDays', value: '30', category: 'PHARMACY', description: 'Jours avant expiration pour alerte critique', isPublic: false },
  { key: 'security.maxLoginAttempts', value: '5', category: 'SECURITY', description: 'Tentatives de connexion maximum avant verrouillage', isPublic: false },
  { key: 'security.lockoutDurationMinutes', value: '30', category: 'SECURITY', description: 'Durée de verrouillage (minutes)', isPublic: false },
  { key: 'security.passwordMinLength', value: '8', category: 'SECURITY', description: 'Longueur minimale du mot de passe', isPublic: false },
  { key: 'security.sessionTimeoutMinutes', value: '60', category: 'SECURITY', description: 'Durée de session (minutes)', isPublic: false },
  { key: 'hospitalization.defaultBedAssignment', value: 'true', category: 'HOSPITALIZATION', description: 'Attribution automatique de lit', isPublic: false },
  { key: 'emergency.triageSystem', value: 'FRENCH_5_LEVEL', category: 'EMERGENCY', description: 'Système de triage (ROUGE/ORANGE/JAUNE/VERT/BLEU)', isPublic: true },
];

// ---- 13. PATIENTS ----
const patientsData = [
  {
    qrCode: 'HF-2025-P00001',
    firstName: 'Mamadou',
    lastName: 'Condé',
    dateOfBirth: new Date('1985-03-15'),
    gender: 'MALE',
    nationalId: 'GN-1985-0315-001',
    phone: '+224 621 11 11 01',
    email: 'mamadou.conde@email.com',
    address: 'Hamdallaye, Commune de Ratoma',
    city: 'Conakry',
    region: 'Conakry',
    bloodType: 'O+',
    rhFactor: 'POSITIVE',
    maritalStatus: 'MARRIED',
    occupation: 'Commerçant',
    emergencyContactName: 'Fatou Condé',
    emergencyContactPhone: '+224 621 11 11 02',
    emergencyContactRelation: 'ÉPOUSE',
  },
  {
    qrCode: 'HF-2025-P00002',
    firstName: 'Aïssatou',
    lastName: 'Camara',
    dateOfBirth: new Date('1992-07-22'),
    gender: 'FEMALE',
    nationalId: 'GN-1992-0722-002',
    phone: '+224 621 22 22 01',
    email: 'aissatou.camara@email.com',
    address: 'Cosa, Commune de Matoto',
    city: 'Conakry',
    region: 'Conakry',
    bloodType: 'A-',
    rhFactor: 'NEGATIVE',
    maritalStatus: 'MARRIED',
    occupation: 'Enseignante',
    emergencyContactName: 'Ibrahima Camara',
    emergencyContactPhone: '+224 621 22 22 02',
    emergencyContactRelation: 'MARI',
  },
  {
    qrCode: 'HF-2025-P00003',
    firstName: 'Ibrahima',
    lastName: 'Touré',
    dateOfBirth: new Date('1978-11-05'),
    gender: 'MALE',
    nationalId: 'GN-1978-1105-003',
    phone: '+224 621 33 33 01',
    email: 'ibrahima.toure@email.com',
    address: 'Kipé, Commune de Ratoma',
    city: 'Conakry',
    region: 'Conakry',
    bloodType: 'B+',
    rhFactor: 'POSITIVE',
    maritalStatus: 'DIVORCED',
    occupation: 'Fonctionnaire',
    emergencyContactName: 'Kadiatou Touré',
    emergencyContactPhone: '+224 621 33 33 02',
    emergencyContactRelation: 'SŒUR',
  },
  {
    qrCode: 'HF-2025-P00004',
    firstName: 'Fatoumata',
    lastName: 'Diallo',
    dateOfBirth: new Date('2000-01-18'),
    gender: 'FEMALE',
    nationalId: 'GN-2000-0118-004',
    phone: '+224 621 44 44 01',
    email: 'fatoumata.diallo@email.com',
    address: 'Boulbinet, Commune de Kaloum',
    city: 'Conakry',
    region: 'Conakry',
    bloodType: 'AB+',
    rhFactor: 'POSITIVE',
    maritalStatus: 'SINGLE',
    occupation: 'Étudiante',
    emergencyContactName: 'Alpha Diallo',
    emergencyContactPhone: '+224 621 44 44 02',
    emergencyContactRelation: 'PÈRE',
  },
  {
    qrCode: 'HF-2025-P00005',
    firstName: 'Moussa',
    lastName: 'Soumah',
    dateOfBirth: new Date('1965-09-30'),
    gender: 'MALE',
    nationalId: 'GN-1965-0930-005',
    phone: '+224 621 55 55 01',
    email: 'moussa.soumah@email.com',
    address: 'Centre Ville, Kindia',
    city: 'Kindia',
    region: 'Kindia',
    bloodType: 'O-',
    rhFactor: 'NEGATIVE',
    maritalStatus: 'MARRIED',
    occupation: 'Agriculteur',
    emergencyContactName: 'Mariama Soumah',
    emergencyContactPhone: '+224 621 55 55 02',
    emergencyContactRelation: 'ÉPOUSE',
  },
];

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

async function seedEstablishments() {
  logSection('1. ESTABLISHMENTS');
  let count = 0;
  for (const data of establishmentsData) {
    const establishment = await prisma.establishment.upsert({
      where: { code: data.code },
      update: {
        name: data.name,
        type: data.type,
        address: data.address,
        city: data.city,
        region: data.region,
        phone: data.phone,
        email: data.email,
        isActive: true,
      },
      create: {
        name: data.name,
        type: data.type,
        code: data.code,
        address: data.address,
        city: data.city,
        region: data.region,
        country: 'Guinea',
        phone: data.phone,
        email: data.email,
        isActive: true,
      },
    });
    count++;
    logProgress(`${establishment.name} (${establishment.code})`);
  }
  logProgress(`Total: ${count} establishments seeded`);
  return count;
}

async function seedRoles() {
  logSection('2. ROLES');
  let count = 0;
  for (const data of rolesData) {
    const role = await prisma.role.upsert({
      where: { name: data.name },
      update: {
        description: data.description,
        isSystem: data.isSystem,
      },
      create: {
        name: data.name,
        description: data.description,
        isSystem: data.isSystem,
      },
    });
    count++;
    logProgress(`${role.name} - ${role.description}`);
  }
  logProgress(`Total: ${count} roles seeded`);
  return count;
}

async function seedPermissions() {
  logSection('3. PERMISSIONS');
  let count = 0;
  for (const data of permissionsData) {
    const permission = await prisma.permission.upsert({
      where: { name: data.name },
      update: {
        module: data.module,
        description: data.description,
      },
      create: {
        name: data.name,
        module: data.module,
        description: data.description,
      },
    });
    count++;
    logProgress(`${permission.name} [${permission.module}]`);
  }
  logProgress(`Total: ${count} permissions seeded`);
  return count;
}

async function seedRolePermissions() {
  logSection('4. ROLE-PERMISSION ASSIGNMENTS');
  let count = 0;

  const allRoles = await prisma.role.findMany();
  const allPermissions = await prisma.permission.findMany();

  const roleMap = new Map(allRoles.map(r => [r.name, r.id]));
  const permMap = new Map(allPermissions.map(p => [p.name, p.id]));

  for (const [roleName, permissionNames] of Object.entries(rolePermissionsMap)) {
    const roleId = roleMap.get(roleName);
    if (!roleId) {
      logWarning(`Role ${roleName} not found, skipping permissions`);
      continue;
    }

    for (const permName of permissionNames) {
      const permissionId = permMap.get(permName);
      if (!permissionId) {
        logWarning(`Permission ${permName} not found, skipping`);
        continue;
      }

      // Check if the RolePermission already exists
      const existing = await prisma.rolePermission.findFirst({
        where: { roleId, permissionId },
      });

      if (!existing) {
        await prisma.rolePermission.create({
          data: { roleId, permissionId },
        });
        count++;
      }
    }
    logProgress(`${roleName}: ${permissionNames.length} permissions assigned`);
  }
  logProgress(`Total: ${count} role-permission assignments created`);
  return count;
}

async function seedUsers() {
  logSection('5. USERS');
  let count = 0;

  const allRoles = await prisma.role.findMany();
  const roleMap = new Map(allRoles.map(r => [r.name, r.id]));

  // Get CHU Donka as the default establishment
  const donka = await prisma.establishment.findUnique({ where: { code: 'CHK-DONKA' } });
  if (!donka) {
    throw new Error('CHU Donka establishment not found');
  }

  const createdUsers: { id: string; email: string; roleName: string }[] = [];

  for (const data of usersData) {
    const roleId = roleMap.get(data.roleName);
    if (!roleId) {
      logWarning(`Role ${data.roleName} not found for user ${data.email}`);
      continue;
    }

    const passwordHash = hashSync(data.password, 12);

    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        professionalId: data.professionalId,
        specialization: data.specialization,
        isActive: true,
      },
      create: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        professionalId: data.professionalId,
        specialization: data.specialization,
        isActive: true,
        lastPasswordChangeAt: new Date(),
      },
    });

    // Assign user to CHU Donka establishment
    await prisma.userEstablishment.upsert({
      where: {
        userId_establishmentId: {
          userId: user.id,
          establishmentId: donka.id,
        },
      },
      update: { isDefault: true },
      create: {
        userId: user.id,
        establishmentId: donka.id,
        isDefault: true,
      },
    });

    // Assign role to user (scoped to CHU Donka)
    const existingUserRole = await prisma.userRole.findFirst({
      where: {
        userId: user.id,
        roleId,
        establishmentId: donka.id,
      },
    });

    if (!existingUserRole) {
      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId,
          establishmentId: donka.id,
        },
      });
    }

    createdUsers.push({ id: user.id, email: user.email, roleName: data.roleName });
    count++;
    logProgress(`${data.firstName} ${data.lastName} (${data.email}) - Role: ${data.roleName}`);
  }

  logProgress(`Total: ${count} users seeded`);
  return createdUsers;
}

async function seedDepartments() {
  logSection('6. DEPARTMENTS (CHU Donka)');
  let count = 0;

  const donka = await prisma.establishment.findUnique({ where: { code: 'CHK-DONKA' } });
  if (!donka) {
    throw new Error('CHU Donka establishment not found');
  }

  const createdDepartments: { id: string; code: string }[] = [];

  for (const data of departmentsData) {
    const department = await prisma.department.upsert({
      where: {
        code_establishmentId: {
          code: data.code,
          establishmentId: donka.id,
        },
      },
      update: {
        name: data.name,
        type: data.type,
        floor: data.floor,
        isActive: true,
      },
      create: {
        name: data.name,
        code: data.code,
        type: data.type,
        establishmentId: donka.id,
        floor: data.floor,
        isActive: true,
      },
    });
    createdDepartments.push({ id: department.id, code: data.code });
    count++;
    logProgress(`${department.name} (${department.code}) - Étage ${data.floor}`);
  }

  logProgress(`Total: ${count} departments seeded`);
  return createdDepartments;
}

async function seedRoomsAndBeds(departments: { id: string; code: string }[]) {
  logSection('7. ROOMS & BEDS (CHU Donka)');
  let roomCount = 0;
  let bedCount = 0;

  const donka = await prisma.establishment.findUnique({ where: { code: 'CHK-DONKA' } });
  if (!donka) {
    throw new Error('CHU Donka establishment not found');
  }

  const deptMap = new Map(departments.map(d => [d.code, d.id]));

  for (const [deptCode, rooms] of Object.entries(roomsPerDepartment)) {
    const departmentId = deptMap.get(deptCode);
    if (!departmentId) {
      logWarning(`Department ${deptCode} not found, skipping rooms`);
      continue;
    }

    for (const roomData of rooms) {
      const room = await prisma.room.upsert({
        where: {
          number_establishmentId: {
            number: roomData.number,
            establishmentId: donka.id,
          },
        },
        update: {
          name: roomData.name,
          type: roomData.type,
          departmentId,
          floor: roomData.number.charAt(0) === 'E' || roomData.number.charAt(0) === 'F' || roomData.number.charAt(0) === 'G' || roomData.number.charAt(0) === 'H' ? 'RDC' : roomData.number.charAt(1),
          isActive: true,
        },
        create: {
          number: roomData.number,
          name: roomData.name,
          type: roomData.type,
          establishmentId: donka.id,
          departmentId,
          floor: roomData.number.charAt(0) === 'E' || roomData.number.charAt(0) === 'F' || roomData.number.charAt(0) === 'G' || roomData.number.charAt(0) === 'H' ? 'RDC' : roomData.number.charAt(1),
          isActive: true,
        },
      });
      roomCount++;

      // Create beds for this room
      for (let i = 1; i <= roomData.bedCount; i++) {
        const bedNumber = `${roomData.number}-${i}`;
        await prisma.bed.upsert({
          where: {
            number_establishmentId: {
              number: bedNumber,
              establishmentId: donka.id,
            },
          },
          update: {
            type: roomData.bedType,
            roomId: room.id,
            status: 'AVAILABLE',
          },
          create: {
            number: bedNumber,
            type: roomData.bedType,
            establishmentId: donka.id,
            roomId: room.id,
            status: 'AVAILABLE',
          },
        });
        bedCount++;
      }
      logProgress(`Room ${roomData.number}: ${roomData.name} (${roomData.bedCount} beds)`);
    }
  }

  logProgress(`Total: ${roomCount} rooms and ${bedCount} beds seeded`);
  return { roomCount, bedCount };
}

async function seedLabTestCatalog() {
  logSection('8. LAB TEST CATALOG');
  let count = 0;

  for (const data of labTestsData) {
    const test = await prisma.labTestCatalog.upsert({
      where: { code: data.code },
      update: {
        name: data.name,
        category: data.category,
        specimenType: data.specimenType,
        normalRangeMin: data.normalRangeMin,
        normalRangeMax: data.normalRangeMax,
        unit: data.unit,
        turnaroundHours: data.turnaroundHours,
        price: data.price,
        description: data.description,
        isActive: true,
      },
      create: {
        name: data.name,
        code: data.code,
        category: data.category,
        specimenType: data.specimenType,
        normalRangeMin: data.normalRangeMin,
        normalRangeMax: data.normalRangeMax,
        unit: data.unit,
        turnaroundHours: data.turnaroundHours,
        price: data.price,
        description: data.description,
        isActive: true,
      },
    });
    count++;
    logProgress(`${test.code}: ${test.name} (${test.price ? test.price + ' GNF' : 'N/A'})`);
  }
  logProgress(`Total: ${count} lab tests seeded`);
  return count;
}

async function seedMedications() {
  logSection('9. MEDICATIONS');
  let count = 0;

  for (const data of medicationsData) {
    const medication = await prisma.medication.upsert({
      where: { code: data.code },
      update: {
        name: data.name,
        genericName: data.genericName,
        category: data.category,
        form: data.form,
        strength: data.strength,
        manufacturer: data.manufacturer,
        requiresPrescription: data.requiresPrescription,
        controlledSubstance: data.controlledSubstance,
        minimumStockLevel: data.minimumStockLevel,
        unitPrice: data.unitPrice,
        sellingPrice: data.sellingPrice,
        storageConditions: data.storageConditions,
        sideEffects: data.sideEffects,
        contraindications: data.contraindications,
        isActive: true,
      },
      create: {
        name: data.name,
        genericName: data.genericName,
        code: data.code,
        category: data.category,
        form: data.form,
        strength: data.strength,
        manufacturer: data.manufacturer,
        requiresPrescription: data.requiresPrescription,
        controlledSubstance: data.controlledSubstance,
        minimumStockLevel: data.minimumStockLevel,
        unitPrice: data.unitPrice,
        sellingPrice: data.sellingPrice,
        storageConditions: data.storageConditions,
        sideEffects: data.sideEffects,
        contraindications: data.contraindications,
        isActive: true,
      },
    });
    count++;
    logProgress(`${medication.code}: ${medication.name} ${medication.strength}`);
  }

  // Create medication stocks for CHU Donka
  logProgress('\n  Creating medication stocks for CHU Donka...');
  const donka = await prisma.establishment.findUnique({ where: { code: 'CHK-DONKA' } });
  if (donka) {
    const medications = await prisma.medication.findMany();
    let stockCount = 0;
    for (const med of medications) {
      const stockQuantity = Math.floor(Math.random() * 200) + 50;
      await prisma.medicationStock.upsert({
        where: {
          medicationId_establishmentId_batchNumber: {
            medicationId: med.id,
            establishmentId: donka.id,
            batchNumber: `LOT-2025-${String(stockCount + 1).padStart(4, '0')}`,
          },
        },
        update: {
          currentQuantity: stockQuantity,
          reservedQuantity: 0,
          availableQuantity: stockQuantity,
          unit: 'BOX',
        },
        create: {
          medicationId: med.id,
          establishmentId: donka.id,
          batchNumber: `LOT-2025-${String(stockCount + 1).padStart(4, '0')}`,
          currentQuantity: stockQuantity,
          reservedQuantity: 0,
          availableQuantity: stockQuantity,
          unit: 'BOX',
        },
      });
      stockCount++;
    }
    logProgress(`  ${stockCount} medication stocks created for CHU Donka`);
  }

  logProgress(`Total: ${count} medications seeded`);
  return count;
}

async function seedVaccinationSchedules() {
  logSection('10. VACCINATION SCHEDULES (PEV Guinea)');
  let count = 0;

  for (const data of vaccinationSchedulesData) {
    const schedule = await prisma.vaccinationSchedule.upsert({
      where: { code: data.code },
      update: {
        name: data.name,
        vaccineName: data.vaccineName,
        recommendedAgeMinDays: data.recommendedAgeMinDays,
        recommendedAgeMaxDays: data.recommendedAgeMaxDays,
        numberOfDoses: data.numberOfDoses,
        intervalDays: data.intervalDays,
        route: data.route,
        targetDisease: data.targetDisease,
        isMandatory: data.isMandatory,
        description: data.description,
        sideEffects: data.sideEffects,
        isActive: true,
      },
      create: {
        name: data.name,
        vaccineName: data.vaccineName,
        code: data.code,
        recommendedAgeMinDays: data.recommendedAgeMinDays,
        recommendedAgeMaxDays: data.recommendedAgeMaxDays,
        numberOfDoses: data.numberOfDoses,
        intervalDays: data.intervalDays,
        route: data.route,
        targetDisease: data.targetDisease,
        isMandatory: data.isMandatory,
        country: 'Guinea',
        description: data.description,
        sideEffects: data.sideEffects,
        isActive: true,
      },
    });
    count++;
    logProgress(`${schedule.code}: ${schedule.name} - ${schedule.targetDisease}`);
  }
  logProgress(`Total: ${count} vaccination schedules seeded`);
  return count;
}

async function seedInsuranceCompanies() {
  logSection('11. INSURANCE COMPANIES');
  let count = 0;

  const donka = await prisma.establishment.findUnique({ where: { code: 'CHK-DONKA' } });

  for (const data of insuranceCompaniesData) {
    const company = await prisma.insuranceCompany.upsert({
      where: { code: data.code },
      update: {
        name: data.name,
        address: data.address,
        phone: data.phone,
        email: data.email,
        establishmentId: donka?.id,
        coveragePercentage: data.coveragePercentage,
        contactPerson: data.contactPerson,
        isActive: true,
      },
      create: {
        name: data.name,
        code: data.code,
        address: data.address,
        phone: data.phone,
        email: data.email,
        establishmentId: donka?.id,
        coveragePercentage: data.coveragePercentage,
        contactPerson: data.contactPerson,
        isActive: true,
      },
    });
    count++;
    logProgress(`${company.code}: ${company.name} (${company.coveragePercentage}% coverage)`);
  }
  logProgress(`Total: ${count} insurance companies seeded`);
  return count;
}

async function seedSystemConfig() {
  logSection('12. SYSTEM CONFIGURATION');
  let count = 0;

  for (const data of systemConfigData) {
    const config = await prisma.systemConfig.upsert({
      where: { key: data.key },
      update: {
        value: data.value,
        category: data.category,
        description: data.description,
        isPublic: data.isPublic,
      },
      create: {
        key: data.key,
        value: data.value,
        category: data.category,
        description: data.description,
        isPublic: data.isPublic,
      },
    });
    count++;
    logProgress(`${config.key} = ${config.value} [${config.category}]`);
  }
  logProgress(`Total: ${count} system configurations seeded`);
  return count;
}

async function seedPatients() {
  logSection('13. PATIENTS (Demo)');
  let count = 0;

  const donka = await prisma.establishment.findUnique({ where: { code: 'CHK-DONKA' } });
  if (!donka) {
    throw new Error('CHU Donka establishment not found');
  }

  const createdPatients: { id: string; qrCode: string }[] = [];

  for (const data of patientsData) {
    // Use qrCode as unique identifier for upsert
    const patient = await prisma.patient.upsert({
      where: { qrCode: data.qrCode },
      update: {
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        nationalId: data.nationalId,
        phone: data.phone,
        email: data.email,
        address: data.address,
        city: data.city,
        region: data.region,
        bloodType: data.bloodType,
        rhFactor: data.rhFactor,
        maritalStatus: data.maritalStatus,
        occupation: data.occupation,
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        emergencyContactRelation: data.emergencyContactRelation,
        isActive: true,
      },
      create: {
        qrCode: data.qrCode,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        nationalId: data.nationalId,
        phone: data.phone,
        email: data.email,
        address: data.address,
        city: data.city,
        region: data.region,
        country: 'Guinea',
        bloodType: data.bloodType,
        rhFactor: data.rhFactor,
        maritalStatus: data.maritalStatus,
        occupation: data.occupation,
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        emergencyContactRelation: data.emergencyContactRelation,
        primaryLanguage: 'French',
        establishmentId: donka.id,
        isActive: true,
      },
    });
    createdPatients.push({ id: patient.id, qrCode: patient.qrCode });
    count++;
    logProgress(`${patient.qrCode}: ${patient.firstName} ${patient.lastName} (${patient.bloodType})`);
  }

  // Add some allergies and antecedents for the first 2 patients
  if (createdPatients.length >= 2) {
    logProgress('\n  Adding demo allergies and antecedents...');

    // Allergies for patient 1
    await prisma.patientAllergy.upsert({
      where: { id: 'seed-allergy-1' },
      update: {},
      create: {
        id: 'seed-allergy-1',
        patientId: createdPatients[0].id,
        allergen: 'Pénicilline',
        type: 'DRUG',
        severity: 'SEVERE',
        reaction: 'Urticaire et œdème de Quincke',
        diagnosedAt: new Date('2020-06-15'),
        diagnosedBy: 'Dr. Diallo',
        isVerified: true,
      },
    });
    logProgress('  Allergy: Pénicilline (SEVERE) for Mamadou Condé');

    // Antecedents for patient 2
    await prisma.patientAntecedent.upsert({
      where: { id: 'seed-antecedent-1' },
      update: {},
      create: {
        id: 'seed-antecedent-1',
        patientId: createdPatients[1].id,
        type: 'OBSTETRICAL',
        category: 'MATERNITY',
        description: 'Gestation 2, Parité 1 - Accouchement eutocique en 2019',
        diagnosedDate: new Date('2019-03-10'),
        isChronic: false,
        isHereditary: false,
      },
    });
    logProgress('  Antecedent: Obstétrical for Aïssatou Camara');

    // Chronic antecedent for patient 3
    await prisma.patientAntecedent.upsert({
      where: { id: 'seed-antecedent-2' },
      update: {},
      create: {
        id: 'seed-antecedent-2',
        patientId: createdPatients[2].id,
        type: 'MEDICAL',
        category: 'CARDIOVASCULAR',
        description: 'Hypertension artérielle diagnostiquée',
        diagnosedDate: new Date('2018-01-20'),
        isChronic: true,
        isHereditary: true,
        treatingDoctor: 'Dr. Diallo',
      },
    });
    logProgress('  Antecedent: HTA chronique for Ibrahima Touré');

    // Allergy for patient 4
    await prisma.patientAllergy.upsert({
      where: { id: 'seed-allergy-2' },
      update: {},
      create: {
        id: 'seed-allergy-2',
        patientId: createdPatients[3].id,
        allergen: 'Sulfamides',
        type: 'DRUG',
        severity: 'MODERATE',
        reaction: 'Rash cutané généralisé',
        diagnosedAt: new Date('2022-08-01'),
        isVerified: true,
      },
    });
    logProgress('  Allergy: Sulfamides (MODERATE) for Fatoumata Diallo');
  }

  // Create patient accounts for some patients
  logProgress('\n  Creating demo patient accounts...');
  for (let i = 0; i < Math.min(createdPatients.length, 3); i++) {
    const patient = patientsData[i];
    const patientRecord = createdPatients[i];
    const phoneForLogin = patient.phone.replace(/\s/g, '');

    await prisma.patientAccount.upsert({
      where: { phone: phoneForLogin },
      update: {
        email: patient.email,
        patientId: patientRecord.id,
        isActive: true,
        isVerified: true,
      },
      create: {
        phone: phoneForLogin,
        email: patient.email,
        passwordHash: hashSync('Patient123!', 12),
        patientId: patientRecord.id,
        isActive: true,
        isVerified: true,
        preferredLanguage: 'fr',
        notificationPrefs: JSON.stringify({ sms: true, whatsapp: false, email: true, appointmentReminder: true, labResults: true, vaccination: true }),
      },
    });
    logProgress(`  Patient account: ${phoneForLogin} for ${patient.firstName} ${patient.lastName}`);
  }

  logProgress(`Total: ${count} patients seeded`);
  return count;
}

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

async function main() {
  const startTime = Date.now();

  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║          HealthFlow Guinea - Database Seed Script                  ║');
  console.log('║          Version 1.0.0                                             ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝');
  console.log(`\n  Started at: ${new Date().toISOString()}`);
  console.log(`  Database: ${process.env.DATABASE_URL ? 'Connected' : 'NOT CONFIGURED'}`);

  try {
    // Verify database connection
    await prisma.$connect();
    logProgress('Database connection established');

    // Execute seeds in order (respecting foreign key dependencies)
    await seedEstablishments();
    await seedRoles();
    await seedPermissions();
    await seedRolePermissions();
    const users = await seedUsers();
    const departments = await seedDepartments();
    await seedRoomsAndBeds(departments);
    await seedLabTestCatalog();
    await seedMedications();
    await seedVaccinationSchedules();
    await seedInsuranceCompanies();
    await seedSystemConfig();
    await seedPatients();

    // Summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n' + '─'.repeat(70));
    console.log('  SEED SUMMARY');
    console.log('─'.repeat(70));
    console.log(`  ✓ Establishments:         ${establishmentsData.length}`);
    console.log(`  ✓ Roles:                  ${rolesData.length}`);
    console.log(`  ✓ Permissions:            ${permissionsData.length}`);
    console.log(`  ✓ Role-Permission pairs:  ${Object.values(rolePermissionsMap).reduce((a, b) => a + b.length, 0)}`);
    console.log(`  ✓ Users:                  ${usersData.length}`);
    console.log(`  ✓ Departments:            ${departmentsData.length}`);
    console.log(`  ✓ Rooms:                  ~40 (5 per department × 8 departments)`);
    console.log(`  ✓ Beds:                   ~100+ (varies per room)`);
    console.log(`  ✓ Lab Tests:              ${labTestsData.length}`);
    console.log(`  ✓ Medications:            ${medicationsData.length}`);
    console.log(`  ✓ Vaccination Schedules:  ${vaccinationSchedulesData.length}`);
    console.log(`  ✓ Insurance Companies:    ${insuranceCompaniesData.length}`);
    console.log(`  ✓ System Configs:         ${systemConfigData.length}`);
    console.log(`  ✓ Demo Patients:          ${patientsData.length}`);
    console.log('─'.repeat(70));
    console.log(`  Completed in ${duration}s`);
    console.log('─'.repeat(70) + '\n');
  } catch (error) {
    logError('Seed script failed', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute
main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    logError('Unhandled error in seed script', error);
    process.exit(1);
  });
