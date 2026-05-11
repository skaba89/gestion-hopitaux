// HealthFlow Guinea — Surgical Block Management Module
// Bloc Opératoire — CHU Donka & Guinea Health Facilities
// Covers: Operating Rooms, Specialties, Planning, Teams, Instrument Trays, Dashboard Stats

// ═══════════════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════════════

// ─── Operating Room ───

export type RoomType = 'polyvalente' | 'spécialisée' | 'obstétricale'
export type RoomStatus = 'available' | 'occupied' | 'cleaning' | 'maintenance'

export interface OperatingRoom {
  id: string
  name: string
  type: RoomType
  floor: number
  building: string
  equipment: RoomEquipment[]
  status: RoomStatus
  currentSurgeryId: string | null
  lastCleaningAt: string | null
  maintenanceNote: string | null
  capacity: number // max team size
  hasLaminarFlow: boolean
  oxygenOutlet: boolean
  nitrousOxideOutlet: boolean
  suctionAvailable: boolean
}

export interface RoomEquipment {
  id: string
  name: string
  quantity: number
  functional: boolean
  lastCheckedAt: string | null
}

// ─── Surgical Specialties ───

export type SurgicalSpecialtyId =
  | 'chirurgie_generale'
  | 'orthopedie'
  | 'neurochirurgie'
  | 'urologie'
  | 'cardiaque'
  | 'pediatrique'
  | 'obstetricale'
  | 'orl'
  | 'ophtalmologique'

export interface SurgicalSpecialty {
  id: SurgicalSpecialtyId
  name: string
  nameFr: string
  color: string
  icon: string
  typicalProcedures: TypicalProcedure[]
  averageDurationMin: number
  requiredRoomType: RoomType[]
}

export interface TypicalProcedure {
  code: string
  name: string
  nameFr: string
  durationMin: number
  urgencyAllowed: boolean
}

// ─── Surgical Planning ───

export type UrgencyLevel = 'électif' | 'semi-urgent' | 'urgent' | 'emergent'
export type SurgeryStatus =
  | 'planned'
  | 'pre-op'
  | 'in-progress'
  | 'closing'
  | 'completed'
  | 'cancelled'
  | 'postponed'
export type PostOpStatus =
  | 'en_salle_reveil'
  | 'transfere_reanimation'
  | 'transfere_hospitalisation'
  | 'decede'
  | 'complication'

export interface PreOpChecklist {
  jeûne: boolean
  consentement: boolean
  bilan_pré_op: boolean
  groupe_sanguin: boolean
  radiographie: boolean
  identification_patient: boolean
  site_chirurgical_marque: boolean
  allergies_verifiees: boolean
  prophylaxie_antibiotique: boolean
  preparation_cutanee: boolean
  documents_imagerie: boolean
  voie_abordable: boolean
}

export interface ScheduledSurgery {
  id: string
  date: string
  plannedStartTime: string // HH:mm
  actualStartTime: string | null
  actualEndTime: string | null
  estimatedDurationMin: number
  actualDurationMin: number | null
  urgencyLevel: UrgencyLevel
  status: SurgeryStatus
  specialty: SurgicalSpecialtyId
  procedureCode: string
  procedureName: string
  patientId: string
  patientName: string
  patientAge: number
  patientSex: 'M' | 'F'
  roomId: string
  roomName: string
  surgeonId: string
  surgeonName: string
  anesthesistId: string
  anesthesistName: string
  instrumentisteId: string
  instrumentisteName: string
  aideOperatoireId: string
  aideOperatoireName: string
  brancardierId: string
  brancardierName: string
  anesthesiaType: AnesthesiaType
  preOpChecklist: PreOpChecklist
  postOpStatus: PostOpStatus | null
  postOpNotes: string | null
  complications: string[]
  bloodLossMl: number | null
  specimensSent: boolean
  notes: string
  createdAt: string
  updatedAt: string
}

export type AnesthesiaType =
  | 'générale'
  | 'rachianesthésie'
  | 'péridurale'
  | 'locale'
  | 'locale_sédation'
  | 'régionale'

// ─── Surgical Teams ───

export type StaffRole =
  | 'chirurgien'
  | 'anesthésiste'
  | 'instrumentiste'
  | 'aide_opératoire'
  | 'brancardier'

export interface SurgicalStaff {
  id: string
  firstName: string
  lastName: string
  fullName: string
  role: StaffRole
  specialty: SurgicalSpecialtyId | null
  qualifications: string[]
  phone: string
  available: boolean
  onCall: boolean
  maxSurgeriesPerDay: number
  surgeriesToday: number
  hireDate: string
}

// ─── Instrument Trays ───

export type SterilizationStatus = 'stérile' | 'en_stérilisation' | 'contaminé' | 'périmé'

export interface InstrumentTray {
  id: string
  name: string
  nameFr: string
  specialty: SurgicalSpecialtyId
  instruments: Instrument[]
  sterilizationStatus: SterilizationStatus
  lastSterilizedAt: string | null
  sterilizationExpiryAt: string | null
  cycleCount: number
  maxCycles: number
  currentRoomId: string | null
  condition: 'bon' | 'usé' | 'à_remplacer'
}

export interface Instrument {
  id: string
  name: string
  nameFr: string
  quantity: number
  material: 'acier_inox' | 'titane' | 'usage_unique'
}

// ─── Dashboard Statistics ───

export interface SurgeryDashboardStats {
  today: SurgeryDayStats
  thisWeek: SurgeryPeriodStats
  thisMonth: SurgeryPeriodStats
  roomUtilization: RoomUtilization[]
  emergencyVsElective: EmergencyElectiveRatio
  averageDurationBySpecialty: Record<SurgicalSpecialtyId, number>
  topProcedures: ProcedureRanking[]
  staffWorkload: StaffWorkloadEntry[]
  complicationRate: number
  cancellationRate: number
  onTimeStartRate: number
}

export interface SurgeryDayStats {
  total: number
  completed: number
  inProgress: number
  planned: number
  emergencies: number
  cancelled: number
  averageDurationMin: number
  bloodUnitsUsed: number
}

export interface SurgeryPeriodStats {
  total: number
  completed: number
  cancelled: number
  emergencies: number
  elective: number
  averageDurationMin: number
  complicationCount: number
}

export interface RoomUtilization {
  roomId: string
  roomName: string
  totalSlotsPerDay: number
  usedSlots: number
  utilizationPercent: number
  downtimeMinutes: number
}

export interface EmergencyElectiveRatio {
  elective: number
  semiUrgent: number
  urgent: number
  emergent: number
  total: number
}

export interface ProcedureRanking {
  procedureCode: string
  procedureName: string
  count: number
  averageDurationMin: number
}

export interface StaffWorkloadEntry {
  staffId: string
  staffName: string
  role: StaffRole
  surgeriesThisWeek: number
  hoursInOR: number
  onCallHours: number
}

// ═══════════════════════════════════════════════════════════════
//  CONSTANTS & LABELS
// ═══════════════════════════════════════════════════════════════

export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  polyvalente: 'Polyvalente',
  spécialisée: 'Spécialisée',
  obstétricale: 'Obstétricale',
}

export const ROOM_STATUS_LABELS: Record<RoomStatus, string> = {
  available: 'Disponible',
  occupied: 'Occupée',
  cleaning: 'En nettoyage',
  maintenance: 'En maintenance',
}

export const ROOM_STATUS_COLORS: Record<RoomStatus, string> = {
  available: 'bg-emerald-100 text-emerald-700',
  occupied: 'bg-red-100 text-red-700',
  cleaning: 'bg-amber-100 text-amber-700',
  maintenance: 'bg-gray-100 text-gray-700',
}

export const URGENCY_LABELS: Record<UrgencyLevel, string> = {
  électif: 'Électif',
  'semi-urgent': 'Semi-urgent',
  urgent: 'Urgent',
  emergent: 'Émergent',
}

export const URGENCY_COLORS: Record<UrgencyLevel, string> = {
  électif: 'bg-sky-100 text-sky-700',
  'semi-urgent': 'bg-amber-100 text-amber-700',
  urgent: 'bg-orange-100 text-orange-700',
  emergent: 'bg-red-100 text-red-700',
}

export const SURGERY_STATUS_LABELS: Record<SurgeryStatus, string> = {
  planned: 'Planifiée',
  'pre-op': 'Pré-opératoire',
  'in-progress': 'En cours',
  closing: 'Fermeture',
  completed: 'Terminée',
  cancelled: 'Annulée',
  postponed: 'Reportée',
}

export const SURGERY_STATUS_COLORS: Record<SurgeryStatus, string> = {
  planned: 'bg-sky-100 text-sky-700',
  'pre-op': 'bg-violet-100 text-violet-700',
  'in-progress': 'bg-red-100 text-red-700',
  closing: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-gray-100 text-gray-700',
  postponed: 'bg-orange-100 text-orange-700',
}

export const POST_OP_STATUS_LABELS: Record<PostOpStatus, string> = {
  en_salle_reveil: 'En salle de réveil',
  transfere_reanimation: 'Transféré en réanimation',
  transfere_hospitalisation: 'Transféré en hospitalisation',
  decede: 'Décédé',
  complication: 'Complication',
}

export const ANESTHESIA_LABELS: Record<AnesthesiaType, string> = {
  générale: 'Anesthésie Générale',
  rachianesthésie: 'Rachianesthésie',
  péridurale: 'Péridurale',
  locale: 'Anesthésie Locale',
  locale_sédation: 'Locale + Sédation',
  régionale: 'Régionale',
}

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  chirurgien: 'Chirurgien',
  anesthésiste: 'Anesthésiste',
  instrumentiste: 'Instrumentiste',
  aide_opératoire: 'Aide-opératoire',
  brancardier: 'Brancardier',
}

export const STERILIZATION_LABELS: Record<SterilizationStatus, string> = {
  stérile: 'Stérile',
  en_stérilisation: 'En stérilisation',
  contaminé: 'Contaminé',
  périmé: 'Périmé',
}

export const STERILIZATION_COLORS: Record<SterilizationStatus, string> = {
  stérile: 'bg-emerald-100 text-emerald-700',
  en_stérilisation: 'bg-amber-100 text-amber-700',
  contaminé: 'bg-red-100 text-red-700',
  périmé: 'bg-gray-100 text-gray-700',
}

export const PRE_OP_CHECKLIST_LABELS: Record<keyof PreOpChecklist, string> = {
  jeûne: 'Jeûne respecté (6h solides / 2h liquides)',
  consentement: 'Consentement éclairé signé',
  bilan_pré_op: 'Bilan pré-opératoire réalisé',
  groupe_sanguin: 'Groupe sanguin / RAI disponibles',
  radiographie: 'Radiographies / Imagerie disponibles',
  identification_patient: 'Identification patient vérifiée (bracelet)',
  site_chirurgical_marque: 'Site chirurgical marqué',
  allergies_verifiees: 'Allergies vérifiées et documentées',
  prophylaxie_antibiotique: 'Prophylaxie antibiotique administrée',
  preparation_cutanee: 'Préparation cutanée réalisée',
  documents_imagerie: 'Documents d\'imagerie en salle',
  voie_abordable: 'Voie d\'abord veineuse fonctionnelle',
}

// ═══════════════════════════════════════════════════════════════
//  DEMO DATA — Operating Rooms (CHU Donka)
// ═══════════════════════════════════════════════════════════════

export const demoOperatingRooms: OperatingRoom[] = [
  {
    id: 'OR-DONKA-01',
    name: 'Salle Opératoire 1 — Polyvalente A',
    type: 'polyvalente',
    floor: 2,
    building: 'Bloc Principal',
    equipment: [
      { id: 'EQ-0101', name: 'Table d\'opération', quantity: 1, functional: true, lastCheckedAt: '2026-03-04T08:00:00Z' },
      { id: 'EQ-0102', name: 'Lampe scialytique', quantity: 2, functional: true, lastCheckedAt: '2026-03-04T08:00:00Z' },
      { id: 'EQ-0103', name: 'Monitoring multiparamètre', quantity: 1, functional: true, lastCheckedAt: '2026-03-04T08:00:00Z' },
      { id: 'EQ-0104', name: 'Respirateur d\'anesthésie', quantity: 1, functional: true, lastCheckedAt: '2026-03-04T08:00:00Z' },
      { id: 'EQ-0105', name: 'Défibrillateur', quantity: 1, functional: true, lastCheckedAt: '2026-03-04T08:00:00Z' },
      { id: 'EQ-0106', name: 'Aspiration chirurgicale', quantity: 2, functional: true, lastCheckedAt: '2026-03-04T08:00:00Z' },
      { id: 'EQ-0107', name: 'Électrocautère', quantity: 1, functional: true, lastCheckedAt: '2026-03-04T08:00:00Z' },
      { id: 'EQ-0108', name: 'Colonne vidéo', quantity: 1, functional: false, lastCheckedAt: '2026-03-01T10:00:00Z' },
    ],
    status: 'occupied',
    currentSurgeryId: 'SURG-2026-012',
    lastCleaningAt: '2026-03-04T06:30:00Z',
    maintenanceNote: null,
    capacity: 8,
    hasLaminarFlow: false,
    oxygenOutlet: true,
    nitrousOxideOutlet: true,
    suctionAvailable: true,
  },
  {
    id: 'OR-DONKA-02',
    name: 'Salle Opératoire 2 — Polyvalente B',
    type: 'polyvalente',
    floor: 2,
    building: 'Bloc Principal',
    equipment: [
      { id: 'EQ-0201', name: 'Table d\'opération', quantity: 1, functional: true, lastCheckedAt: '2026-03-04T08:00:00Z' },
      { id: 'EQ-0202', name: 'Lampe scialytique', quantity: 2, functional: true, lastCheckedAt: '2026-03-04T08:00:00Z' },
      { id: 'EQ-0203', name: 'Monitoring multiparamètre', quantity: 1, functional: true, lastCheckedAt: '2026-03-04T08:00:00Z' },
      { id: 'EQ-0204', name: 'Respirateur d\'anesthésie', quantity: 1, functional: true, lastCheckedAt: '2026-03-04T08:00:00Z' },
      { id: 'EQ-0205', name: 'Défibrillateur', quantity: 1, functional: true, lastCheckedAt: '2026-03-04T08:00:00Z' },
      { id: 'EQ-0206', name: 'Aspiration chirurgicale', quantity: 1, functional: true, lastCheckedAt: '2026-03-04T08:00:00Z' },
      { id: 'EQ-0207', name: 'Électrocautère', quantity: 1, functional: true, lastCheckedAt: '2026-03-04T08:00:00Z' },
    ],
    status: 'available',
    currentSurgeryId: null,
    lastCleaningAt: '2026-03-04T07:00:00Z',
    maintenanceNote: null,
    capacity: 8,
    hasLaminarFlow: false,
    oxygenOutlet: true,
    nitrousOxideOutlet: true,
    suctionAvailable: true,
  },
  {
    id: 'OR-DONKA-03',
    name: 'Salle Opératoire 3 — Spécialisée Orthopédie',
    type: 'spécialisée',
    floor: 2,
    building: 'Bloc Principal',
    equipment: [
      { id: 'EQ-0301', name: 'Table d\'opération orthopédique', quantity: 1, functional: true, lastCheckedAt: '2026-03-04T08:00:00Z' },
      { id: 'EQ-0302', name: 'Lampe scialytique', quantity: 2, functional: true, lastCheckedAt: '2026-03-04T08:00:00Z' },
      { id: 'EQ-0303', name: 'Monitoring multiparamètre', quantity: 1, functional: true, lastCheckedAt: '2026-03-04T08:00:00Z' },
      { id: 'EQ-0304', name: 'Respirateur d\'anesthésie', quantity: 1, functional: true, lastCheckedAt: '2026-03-04T08:00:00Z' },
      { id: 'EQ-0305', name: 'Arthroscopie', quantity: 1, functional: true, lastCheckedAt: '2026-03-04T08:00:00Z' },
      { id: 'EQ-0306', name: 'Image amplificateur (amplificateur de brillance)', quantity: 1, functional: true, lastCheckedAt: '2026-03-04T08:00:00Z' },
      { id: 'EQ-0307', name: 'Fracture table', quantity: 1, functional: true, lastCheckedAt: '2026-03-04T08:00:00Z' },
      { id: 'EQ-0308', name: 'Défibrillateur', quantity: 1, functional: true, lastCheckedAt: '2026-03-04T08:00:00Z' },
      { id: 'EQ-0309', name: 'Électrocautère', quantity: 1, functional: true, lastCheckedAt: '2026-03-04T08:00:00Z' },
    ],
    status: 'cleaning',
    currentSurgeryId: null,
    lastCleaningAt: null,
    maintenanceNote: null,
    capacity: 10,
    hasLaminarFlow: true,
    oxygenOutlet: true,
    nitrousOxideOutlet: true,
    suctionAvailable: true,
  },
  {
    id: 'OR-DONKA-04',
    name: 'Salle Opératoire 4 — Neurochirurgie',
    type: 'spécialisée',
    floor: 3,
    building: 'Bloc Spécialisé',
    equipment: [
      { id: 'EQ-0401', name: 'Table d\'opération neuro', quantity: 1, functional: true, lastCheckedAt: '2026-03-04T08:00:00Z' },
      { id: 'EQ-0402', name: 'Lampe scialytique', quantity: 2, functional: true, lastCheckedAt: '2026-03-04T08:00:00Z' },
      { id: 'EQ-0403', name: 'Monitoring neurologique', quantity: 1, functional: true, lastCheckedAt: '2026-03-04T08:00:00Z' },
      { id: 'EQ-0404', name: 'Microscope opératoire', quantity: 1, functional: true, lastCheckedAt: '2026-03-04T08:00:00Z' },
      { id: 'EQ-0405', name: 'Système de navigation neuronavigation', quantity: 1, functional: true, lastCheckedAt: '2026-03-04T08:00:00Z' },
      { id: 'EQ-0406', name: 'Respirateur d\'anesthésie', quantity: 1, functional: true, lastCheckedAt: '2026-03-04T08:00:00Z' },
      { id: 'EQ-0407', name: 'Défibrillateur', quantity: 1, functional: true, lastCheckedAt: '2026-03-04T08:00:00Z' },
      { id: 'EQ-0408', name: 'Aspiration chirurgicale', quantity: 2, functional: true, lastCheckedAt: '2026-03-04T08:00:00Z' },
      { id: 'EQ-0409', name: 'Bipolaire neurochirurgical', quantity: 1, functional: true, lastCheckedAt: '2026-03-04T08:00:00Z' },
    ],
    status: 'occupied',
    currentSurgeryId: 'SURG-2026-015',
    lastCleaningAt: '2026-03-04T05:00:00Z',
    maintenanceNote: null,
    capacity: 10,
    hasLaminarFlow: true,
    oxygenOutlet: true,
    nitrousOxideOutlet: true,
    suctionAvailable: true,
  },
  {
    id: 'OR-DONKA-05',
    name: 'Salle Opératoire 5 — Obstétricale',
    type: 'obstétricale',
    floor: 1,
    building: 'Maternité',
    equipment: [
      { id: 'EQ-0501', name: 'Table d\'opération obstétricale', quantity: 1, functional: true, lastCheckedAt: '2026-03-04T08:00:00Z' },
      { id: 'EQ-0502', name: 'Lampe scialytique', quantity: 1, functional: true, lastCheckedAt: '2026-03-04T08:00:00Z' },
      { id: 'EQ-0503', name: 'Monitoring fœtal', quantity: 1, functional: true, lastCheckedAt: '2026-03-04T08:00:00Z' },
      { id: 'EQ-0504', name: 'Monitoring multiparamètre', quantity: 1, functional: true, lastCheckedAt: '2026-03-04T08:00:00Z' },
      { id: 'EQ-0505', name: 'Respirateur d\'anesthésie', quantity: 1, functional: true, lastCheckedAt: '2026-03-04T08:00:00Z' },
      { id: 'EQ-0506', name: 'Table de réanimation néonatale', quantity: 1, functional: true, lastCheckedAt: '2026-03-04T08:00:00Z' },
      { id: 'EQ-0507', name: 'Aspiration chirurgicale', quantity: 1, functional: true, lastCheckedAt: '2026-03-04T08:00:00Z' },
      { id: 'EQ-0508', name: 'Défibrillateur', quantity: 1, functional: true, lastCheckedAt: '2026-03-04T08:00:00Z' },
    ],
    status: 'available',
    currentSurgeryId: null,
    lastCleaningAt: '2026-03-04T06:45:00Z',
    maintenanceNote: null,
    capacity: 8,
    hasLaminarFlow: false,
    oxygenOutlet: true,
    nitrousOxideOutlet: true,
    suctionAvailable: true,
  },
  {
    id: 'OR-DONKA-06',
    name: 'Salle Opératoire 6 — Urgences',
    type: 'polyvalente',
    floor: 0,
    building: 'Urgences',
    equipment: [
      { id: 'EQ-0601', name: 'Table d\'opération', quantity: 1, functional: true, lastCheckedAt: '2026-03-04T08:00:00Z' },
      { id: 'EQ-0602', name: 'Lampe scialytique', quantity: 2, functional: true, lastCheckedAt: '2026-03-04T08:00:00Z' },
      { id: 'EQ-0603', name: 'Monitoring multiparamètre', quantity: 1, functional: true, lastCheckedAt: '2026-03-04T08:00:00Z' },
      { id: 'EQ-0604', name: 'Respirateur d\'anesthésie', quantity: 1, functional: true, lastCheckedAt: '2026-03-04T08:00:00Z' },
      { id: 'EQ-0605', name: 'Défibrillateur', quantity: 1, functional: true, lastCheckedAt: '2026-03-04T08:00:00Z' },
      { id: 'EQ-0606', name: 'Aspiration chirurgicale', quantity: 2, functional: true, lastCheckedAt: '2026-03-04T08:00:00Z' },
      { id: 'EQ-0607', name: 'Électrocautère', quantity: 1, functional: true, lastCheckedAt: '2026-03-04T08:00:00Z' },
      { id: 'EQ-0608', name: 'Kit thoracotomie d\'urgence', quantity: 1, functional: true, lastCheckedAt: '2026-03-04T08:00:00Z' },
      { id: 'EQ-0609', name: 'Kit laparotomie d\'urgence', quantity: 1, functional: true, lastCheckedAt: '2026-03-04T08:00:00Z' },
    ],
    status: 'maintenance',
    currentSurgeryId: null,
    lastCleaningAt: '2026-03-03T22:00:00Z',
    maintenanceNote: 'Fuite sur prise murale O₂ — technicien BOUNDY prévu le 05/03 à 08h00',
    capacity: 8,
    hasLaminarFlow: false,
    oxygenOutlet: false,
    nitrousOxideOutlet: true,
    suctionAvailable: true,
  },
]

// ═══════════════════════════════════════════════════════════════
//  DEMO DATA — Surgical Specialties & Procedures
// ═══════════════════════════════════════════════════════════════

export const demoSurgicalSpecialties: SurgicalSpecialty[] = [
  {
    id: 'chirurgie_generale',
    name: 'General Surgery',
    nameFr: 'Chirurgie Générale',
    color: 'bg-rose-100 text-rose-700',
    icon: '⚕️',
    averageDurationMin: 90,
    requiredRoomType: ['polyvalente', 'spécialisée'],
    typicalProcedures: [
      { code: 'CG-001', name: 'Appendectomy', nameFr: 'Appendicectomie', durationMin: 60, urgencyAllowed: true },
      { code: 'CG-002', name: 'Cholecystectomy', nameFr: 'Cholécystectomie', durationMin: 90, urgencyAllowed: false },
      { code: 'CG-003', name: 'Hernia Repair', nameFr: 'Cure de hernie', durationMin: 60, urgencyAllowed: false },
      { code: 'CG-004', name: 'Bowel Resection', nameFr: 'Résection intestinale', durationMin: 120, urgencyAllowed: true },
      { code: 'CG-005', name: 'Laparotomy', nameFr: 'Laparotomie exploratrice', durationMin: 90, urgencyAllowed: true },
      { code: 'CG-006', name: 'Thyroidectomy', nameFr: 'Thyroidectomie', durationMin: 120, urgencyAllowed: false },
      { code: 'CG-007', name: 'Mastectomy', nameFr: 'Mastectomie', durationMin: 120, urgencyAllowed: false },
      { code: 'CG-008', name: 'Splenectomy', nameFr: 'Splénectomie', durationMin: 90, urgencyAllowed: true },
    ],
  },
  {
    id: 'orthopedie',
    name: 'Orthopedics',
    nameFr: 'Orthopédie',
    color: 'bg-blue-100 text-blue-700',
    icon: '🦴',
    averageDurationMin: 120,
    requiredRoomType: ['spécialisée'],
    typicalProcedures: [
      { code: 'ORT-001', name: 'Hip Fracture Fixation', nameFr: 'Ostéosynthèse fracture hanche', durationMin: 120, urgencyAllowed: true },
      { code: 'ORT-002', name: 'Knee Arthroscopy', nameFr: 'Arthroscopie du genou', durationMin: 60, urgencyAllowed: false },
      { code: 'ORT-003', name: 'ORIF Ankle', nameFr: 'Ostéosynthèse cheville', durationMin: 90, urgencyAllowed: true },
      { code: 'ORT-004', name: 'Total Hip Replacement', nameFr: 'Prothèse totale de hanche', durationMin: 150, urgencyAllowed: false },
      { code: 'ORT-005', name: 'Femoral Nail', nameFr: 'Enclouage fémoral', durationMin: 90, urgencyAllowed: true },
      { code: 'ORT-006', name: 'Tibial Plateau Fixation', nameFr: 'Ostéosynthèse plateau tibial', durationMin: 120, urgencyAllowed: true },
      { code: 'ORT-007', name: 'Shoulder Reduction', nameFr: 'Réduction épaule', durationMin: 30, urgencyAllowed: true },
    ],
  },
  {
    id: 'neurochirurgie',
    name: 'Neurosurgery',
    nameFr: 'Neurochirurgie',
    color: 'bg-purple-100 text-purple-700',
    icon: '🧠',
    averageDurationMin: 180,
    requiredRoomType: ['spécialisée'],
    typicalProcedures: [
      { code: 'NEU-001', name: 'Craniotomy for Tumor', nameFr: 'Craniotomie pour tumeur', durationMin: 240, urgencyAllowed: false },
      { code: 'NEU-002', name: 'Decompressive Craniectomy', nameFr: 'Craniectomie décompressive', durationMin: 120, urgencyAllowed: true },
      { code: 'NEU-003', name: 'EVD Placement', nameFr: 'Dérivation ventriculaire externe', durationMin: 60, urgencyAllowed: true },
      { code: 'NEU-004', name: 'Laminectomy', nameFr: 'Laminectomie', durationMin: 120, urgencyAllowed: false },
      { code: 'NEU-005', name: 'Chronic Subdural Hematoma Evacuation', nameFr: 'Évacuation hématome sous-dural chronique', durationMin: 60, urgencyAllowed: true },
    ],
  },
  {
    id: 'urologie',
    name: 'Urology',
    nameFr: 'Urologie',
    color: 'bg-amber-100 text-amber-700',
    icon: '🔬',
    averageDurationMin: 75,
    requiredRoomType: ['polyvalente', 'spécialisée'],
    typicalProcedures: [
      { code: 'URO-001', name: 'Prostatectomy', nameFr: 'Prostatectomie', durationMin: 180, urgencyAllowed: false },
      { code: 'URO-002', name: 'Nephrectomy', nameFr: 'Néphrectomie', durationMin: 150, urgencyAllowed: true },
      { code: 'URO-003', name: 'Cystoscopy', nameFr: 'Cystoscopie', durationMin: 30, urgencyAllowed: false },
      { code: 'URO-004', name: 'Ureteral Stent', nameFr: 'Pose sonde JJ', durationMin: 45, urgencyAllowed: true },
      { code: 'URO-005', name: 'Circumcision', nameFr: 'Circoncision', durationMin: 30, urgencyAllowed: false },
    ],
  },
  {
    id: 'cardiaque',
    name: 'Cardiac Surgery',
    nameFr: 'Chirurgie Cardiaque',
    color: 'bg-red-100 text-red-700',
    icon: '❤️',
    averageDurationMin: 240,
    requiredRoomType: ['spécialisée'],
    typicalProcedures: [
      { code: 'CAR-001', name: 'CABG', nameFr: 'Pontage aorto-coronarien', durationMin: 300, urgencyAllowed: true },
      { code: 'CAR-002', name: 'Valve Replacement', nameFr: 'Remplacement valvulaire', durationMin: 240, urgencyAllowed: false },
      { code: 'CAR-003', name: 'Pericardial Window', nameFr: 'Fenêtre péricardique', durationMin: 60, urgencyAllowed: true },
      { code: 'CAR-004', name: 'Thoracic Aorta Repair', nameFr: 'Réparation aorte thoracique', durationMin: 360, urgencyAllowed: true },
    ],
  },
  {
    id: 'pediatrique',
    name: 'Pediatric Surgery',
    nameFr: 'Chirurgie Pédiatrique',
    color: 'bg-green-100 text-green-700',
    icon: '👶',
    averageDurationMin: 60,
    requiredRoomType: ['polyvalente', 'spécialisée'],
    typicalProcedures: [
      { code: 'PED-001', name: 'Hydrocele Repair', nameFr: 'Cure d\'hydrocèle', durationMin: 30, urgencyAllowed: false },
      { code: 'PED-002', name: 'Pyloromyotomy', nameFr: 'Pyloromyotomie', durationMin: 45, urgencyAllowed: true },
      { code: 'PED-003', name: 'Inguinal Hernia Repair', nameFr: 'Cure de hernie inguinale', durationMin: 45, urgencyAllowed: false },
      { code: 'PED-004', name: 'Intussusception Reduction', nameFr: 'Réduction invagination', durationMin: 60, urgencyAllowed: true },
      { code: 'PED-005', name: 'Imperforate Anus Repair', nameFr: 'Cure d\'imperforation anale', durationMin: 120, urgencyAllowed: true },
    ],
  },
  {
    id: 'obstetricale',
    name: 'Obstetric Surgery',
    nameFr: 'Chirurgie Obstétricale',
    color: 'bg-pink-100 text-pink-700',
    icon: '🤰',
    averageDurationMin: 45,
    requiredRoomType: ['obstétricale'],
    typicalProcedures: [
      { code: 'OBS-001', name: 'Cesarean Section', nameFr: 'Césarienne', durationMin: 45, urgencyAllowed: true },
      { code: 'OBS-002', name: 'Ectopic Pregnancy Surgery', nameFr: 'Chirurgie grossesse extra-utérine', durationMin: 60, urgencyAllowed: true },
      { code: 'OBS-003', name: 'Cervical Cerclage', nameFr: 'Cerclage du col', durationMin: 30, urgencyAllowed: false },
      { code: 'OBS-004', name: 'Manual Placenta Removal', nameFr: 'Délivrance artificielle', durationMin: 30, urgencyAllowed: true },
      { code: 'OBS-005', name: 'Hysterectomy for Hemorrhage', nameFr: 'Hystérectomie d\'hémorragie', durationMin: 90, urgencyAllowed: true },
    ],
  },
  {
    id: 'orl',
    name: 'ENT Surgery',
    nameFr: 'ORL',
    color: 'bg-teal-100 text-teal-700',
    icon: '👂',
    averageDurationMin: 60,
    requiredRoomType: ['polyvalente', 'spécialisée'],
    typicalProcedures: [
      { code: 'ORL-001', name: 'Tonsillectomy', nameFr: 'Amygdalectomie', durationMin: 30, urgencyAllowed: false },
      { code: 'ORL-002', name: 'Adenoidectomy', nameFr: 'Adénoïdectomie', durationMin: 20, urgencyAllowed: false },
      { code: 'ORL-003', name: 'Tracheotomy', nameFr: 'Trachéotomie', durationMin: 30, urgencyAllowed: true },
      { code: 'ORL-004', name: 'Parotidectomy', nameFr: 'Parotidectomie', durationMin: 120, urgencyAllowed: false },
      { code: 'ORL-005', name: 'Septoplasty', nameFr: 'Septoplastie', durationMin: 45, urgencyAllowed: false },
    ],
  },
  {
    id: 'ophtalmologique',
    name: 'Ophthalmologic Surgery',
    nameFr: 'Chirurgie Ophtalmologique',
    color: 'bg-indigo-100 text-indigo-700',
    icon: '👁️',
    averageDurationMin: 45,
    requiredRoomType: ['spécialisée'],
    typicalProcedures: [
      { code: 'OPH-001', name: 'Cataract Surgery', nameFr: 'Chirurgie de la cataracte', durationMin: 30, urgencyAllowed: false },
      { code: 'OPH-002', name: 'Glaucoma Surgery', nameFr: 'Chirurgie du glaucome', durationMin: 60, urgencyAllowed: false },
      { code: 'OPH-003', name: 'Enucleation', nameFr: 'Énucléation', durationMin: 90, urgencyAllowed: false },
      { code: 'OPH-004', name: 'Retinal Detachment Repair', nameFr: 'Réparation décollement rétine', durationMin: 90, urgencyAllowed: true },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════
//  DEMO DATA — Surgical Staff (Guinean Names)
// ═══════════════════════════════════════════════════════════════

export const demoSurgicalStaff: SurgicalStaff[] = [
  {
    id: 'STAFF-CHIR-01',
    firstName: 'Mamadou',
    lastName: 'Diallo',
    fullName: 'Dr. Mamadou Diallo',
    role: 'chirurgien',
    specialty: 'chirurgie_generale',
    qualifications: ['DES Chirurgie Générale', 'Chef de Service'],
    phone: '+224 621 12 34 56',
    available: true,
    onCall: false,
    maxSurgeriesPerDay: 3,
    surgeriesToday: 1,
    hireDate: '2010-09-01',
  },
  {
    id: 'STAFF-CHIR-02',
    firstName: 'Aminata',
    lastName: 'Camara',
    fullName: 'Dr. Aminata Camara',
    role: 'chirurgien',
    specialty: 'obstetricale',
    qualifications: ['DES Gynécologie-Obstétrique', 'Spécialiste Césarienne'],
    phone: '+224 622 23 45 67',
    available: true,
    onCall: true,
    maxSurgeriesPerDay: 4,
    surgeriesToday: 2,
    hireDate: '2015-03-15',
  },
  {
    id: 'STAFF-CHIR-03',
    firstName: 'Ibrahima',
    lastName: 'Touré',
    fullName: 'Dr. Ibrahima Touré',
    role: 'chirurgien',
    specialty: 'orthopedie',
    qualifications: ['DES Orthopédie-Traumatologie', 'Fellow AO Trauma'],
    phone: '+224 623 34 56 78',
    available: true,
    onCall: false,
    maxSurgeriesPerDay: 3,
    surgeriesToday: 0,
    hireDate: '2012-01-10',
  },
  {
    id: 'STAFF-CHIR-04',
    firstName: 'Fatoumata',
    lastName: 'Bangoura',
    fullName: 'Dr. Fatoumata Bangoura',
    role: 'chirurgien',
    specialty: 'neurochirurgie',
    qualifications: ['DES Neurochirurgie', 'University de Dakar'],
    phone: '+224 624 45 56 67',
    available: false,
    onCall: true,
    maxSurgeriesPerDay: 2,
    surgeriesToday: 1,
    hireDate: '2018-06-20',
  },
  {
    id: 'STAFF-ANES-01',
    firstName: 'Ousmane',
    lastName: 'Soumah',
    fullName: 'Dr. Ousmane Soumah',
    role: 'anesthésiste',
    specialty: null,
    qualifications: ['DES Anesthésie-Réanimation', 'Diplôme ALR'],
    phone: '+224 625 56 67 78',
    available: true,
    onCall: false,
    maxSurgeriesPerDay: 4,
    surgeriesToday: 2,
    hireDate: '2013-11-01',
  },
  {
    id: 'STAFF-ANES-02',
    firstName: 'Mariama',
    lastName: 'Sow',
    fullName: 'Dr. Mariama Sow',
    role: 'anesthésiste',
    specialty: null,
    qualifications: ['DES Anesthésie-Réanimation', 'Spécialiste Pédiatrique'],
    phone: '+224 626 67 78 89',
    available: true,
    onCall: true,
    maxSurgeriesPerDay: 4,
    surgeriesToday: 1,
    hireDate: '2016-02-15',
  },
  {
    id: 'STAFF-ANES-03',
    firstName: 'Sekou',
    lastName: 'Condé',
    fullName: 'Dr. Sekou Condé',
    role: 'anesthésiste',
    specialty: null,
    qualifications: ['DES Anesthésie-Réanimation'],
    phone: '+224 627 78 89 90',
    available: true,
    onCall: false,
    maxSurgeriesPerDay: 4,
    surgeriesToday: 0,
    hireDate: '2019-09-01',
  },
  {
    id: 'STAFF-INSTR-01',
    firstName: 'Kadiatou',
    lastName: 'Doubé',
    fullName: 'Kadiatou Doubé',
    role: 'instrumentiste',
    specialty: 'chirurgie_generale',
    qualifications: ['BTS Instrumentation', '5 ans d\'expérience'],
    phone: '+224 628 89 90 01',
    available: true,
    onCall: false,
    maxSurgeriesPerDay: 5,
    surgeriesToday: 2,
    hireDate: '2017-04-10',
  },
  {
    id: 'STAFF-INSTR-02',
    firstName: 'Bintou',
    lastName: 'Keita',
    fullName: 'Bintou Keita',
    role: 'instrumentiste',
    specialty: 'orthopedie',
    qualifications: ['BTS Instrumentation', 'Spécialité Orthopédie'],
    phone: '+224 629 90 01 12',
    available: true,
    onCall: true,
    maxSurgeriesPerDay: 5,
    surgeriesToday: 1,
    hireDate: '2018-08-20',
  },
  {
    id: 'STAFF-AIDE-01',
    firstName: 'Abdoulaye',
    lastName: 'Sylla',
    fullName: 'Abdoulaye Sylla',
    role: 'aide_opératoire',
    specialty: null,
    qualifications: ['Formation Aide-opératoire CHU Donka'],
    phone: '+224 620 01 12 23',
    available: true,
    onCall: false,
    maxSurgeriesPerDay: 6,
    surgeriesToday: 3,
    hireDate: '2015-01-05',
  },
  {
    id: 'STAFF-AIDE-02',
    firstName: 'Mamadou',
    lastName: 'Bah',
    fullName: 'Mamadou Bah',
    role: 'aide_opératoire',
    specialty: null,
    qualifications: ['Formation Aide-opératoire CHU Donka'],
    phone: '+224 621 12 23 34',
    available: true,
    onCall: true,
    maxSurgeriesPerDay: 6,
    surgeriesToday: 1,
    hireDate: '2019-03-12',
  },
  {
    id: 'STAFF-BRANC-01',
    firstName: 'Lansana',
    lastName: 'Fofana',
    fullName: 'Lansana Fofana',
    role: 'brancardier',
    specialty: null,
    qualifications: ['Formation Brancardage CHU Donka', 'PSE1'],
    phone: '+224 622 23 34 45',
    available: true,
    onCall: false,
    maxSurgeriesPerDay: 10,
    surgeriesToday: 5,
    hireDate: '2014-06-01',
  },
  {
    id: 'STAFF-BRANC-02',
    firstName: 'Thierno',
    lastName: 'Diallo',
    fullName: 'Thierno Diallo',
    role: 'brancardier',
    specialty: null,
    qualifications: ['Formation Brancardage CHU Donka'],
    phone: '+224 623 34 45 56',
    available: true,
    onCall: true,
    maxSurgeriesPerDay: 10,
    surgeriesToday: 3,
    hireDate: '2020-01-15',
  },
]

// ═══════════════════════════════════════════════════════════════
//  DEMO DATA — Instrument Trays
// ═══════════════════════════════════════════════════════════════

export const demoInstrumentTrays: InstrumentTray[] = [
  {
    id: 'TRAY-CG-01',
    name: 'General Surgery Basic Tray',
    nameFr: 'Plateau Chirurgie Générale Standard',
    specialty: 'chirurgie_generale',
    instruments: [
      { id: 'INST-001', name: 'Scalpel handle #3', nameFr: 'Manche de scalpel n°3', quantity: 2, material: 'acier_inox' },
      { id: 'INST-002', name: 'Dissecting forceps', nameFr: 'Pince à disséquer', quantity: 4, material: 'acier_inox' },
      { id: 'INST-003', name: 'Kelly forceps', nameFr: 'Pince de Kelly', quantity: 6, material: 'acier_inox' },
      { id: 'INST-004', name: 'Needle holder', nameFr: 'Porte-aiguille', quantity: 2, material: 'acier_inox' },
      { id: 'INST-005', name: ' scissors Mayo', nameFr: 'Ciseaux de Mayo', quantity: 2, material: 'acier_inox' },
      { id: 'INST-006', name: 'Metzenbaum scissors', nameFr: 'Ciseaux de Metzenbaum', quantity: 2, material: 'acier_inox' },
      { id: 'INST-007', name: 'Farabeuf retractors', nameFr: 'Écarteurs de Farabeuf', quantity: 2, material: 'acier_inox' },
      { id: 'INST-008', name: 'Towel clips', nameFr: 'Pinces de champ', quantity: 8, material: 'acier_inox' },
    ],
    sterilizationStatus: 'stérile',
    lastSterilizedAt: '2026-03-04T06:00:00Z',
    sterilizationExpiryAt: '2026-03-18T06:00:00Z',
    cycleCount: 142,
    maxCycles: 200,
    currentRoomId: 'OR-DONKA-01',
    condition: 'bon',
  },
  {
    id: 'TRAY-CG-02',
    name: 'General Surgery Laparotomy Tray',
    nameFr: 'Plateau Laparotomie',
    specialty: 'chirurgie_generale',
    instruments: [
      { id: 'INST-010', name: 'Scalpel handle #4', nameFr: 'Manche de scalpel n°4', quantity: 1, material: 'acier_inox' },
      { id: 'INST-011', name: 'DeBakey forceps', nameFr: 'Pince de DeBakey', quantity: 2, material: 'acier_inox' },
      { id: 'INST-012', name: 'Balfour retractor', nameFr: 'Écarteur de Balfour', quantity: 1, material: 'acier_inox' },
      { id: 'INST-013', name: 'Richardson retractors', nameFr: 'Écarteurs de Richardson', quantity: 3, material: 'acier_inox' },
      { id: 'INST-014', name: 'Sponge forceps', nameFr: 'Pince à compresses', quantity: 4, material: 'acier_inox' },
      { id: 'INST-015', name: 'Needle holder large', nameFr: 'Porte-aiguille grand', quantity: 2, material: 'acier_inox' },
      { id: 'INST-016', name: 'Suction tip', nameFr: 'Embout d\'aspiration', quantity: 2, material: 'usage_unique' },
    ],
    sterilizationStatus: 'en_stérilisation',
    lastSterilizedAt: '2026-03-04T07:30:00Z',
    sterilizationExpiryAt: null,
    cycleCount: 98,
    maxCycles: 200,
    currentRoomId: null,
    condition: 'bon',
  },
  {
    id: 'TRAY-ORT-01',
    name: 'Orthopedic Basic Tray',
    nameFr: 'Plateau Orthopédie Standard',
    specialty: 'orthopedie',
    instruments: [
      { id: 'INST-020', name: 'Bone curette', nameFr: 'Curette osseuse', quantity: 2, material: 'acier_inox' },
      { id: 'INST-021', name: 'Bone rongeur', nameFr: 'Pince-gouge', quantity: 2, material: 'acier_inox' },
      { id: 'INST-022', name: 'Periosteal elevator', nameFr: 'Élévateur du périoste', quantity: 3, material: 'acier_inox' },
      { id: 'INST-023', name: 'Hohmann retractors', nameFr: 'Écarteurs de Hohmann', quantity: 4, material: 'acier_inox' },
      { id: 'INST-024', name: 'Mallet', nameFr: 'Maillet', quantity: 1, material: 'acier_inox' },
      { id: 'INST-025', name: 'Osteotome set', nameFr: 'Jeux d\'ostéotomes', quantity: 4, material: 'acier_inox' },
      { id: 'INST-026', name: 'K-wire driver', nameFr: 'Moteur broches K', quantity: 1, material: 'acier_inox' },
    ],
    sterilizationStatus: 'stérile',
    lastSterilizedAt: '2026-03-03T18:00:00Z',
    sterilizationExpiryAt: '2026-03-17T18:00:00Z',
    cycleCount: 76,
    maxCycles: 200,
    currentRoomId: 'OR-DONKA-03',
    condition: 'bon',
  },
  {
    id: 'TRAY-NEU-01',
    name: 'Neurosurgery Craniotomy Tray',
    nameFr: 'Plateau Craniotomie Neurochirurgie',
    specialty: 'neurochirurgie',
    instruments: [
      { id: 'INST-030', name: 'Craniotome', nameFr: 'Craniotome', quantity: 1, material: 'acier_inox' },
      { id: 'INST-031', name: 'Brain spatulas', nameFr: 'Spatules cérébrales', quantity: 6, material: 'acier_inox' },
      { id: 'INST-032', name: 'Bipolar forceps', nameFr: 'Pince bipolaire', quantity: 2, material: 'titane' },
      { id: 'INST-033', name: 'Cushing forceps', nameFr: 'Pince de Cushing', quantity: 4, material: 'acier_inox' },
      { id: 'INST-034', name: 'Bone wax', nameFr: 'Cire osseuse', quantity: 3, material: 'usage_unique' },
      { id: 'INST-035', name: 'Dural scissors', nameFr: 'Ciseaux dura-mère', quantity: 1, material: 'acier_inox' },
      { id: 'INST-036', name: 'Self-retaining retractor', nameFr: 'Écarteur auto-statique', quantity: 2, material: 'acier_inox' },
    ],
    sterilizationStatus: 'stérile',
    lastSterilizedAt: '2026-03-04T05:00:00Z',
    sterilizationExpiryAt: '2026-03-18T05:00:00Z',
    cycleCount: 55,
    maxCycles: 150,
    currentRoomId: 'OR-DONKA-04',
    condition: 'bon',
  },
  {
    id: 'TRAY-OBS-01',
    name: 'Obstetric Cesarean Tray',
    nameFr: 'Plateau Césarienne',
    specialty: 'obstetricale',
    instruments: [
      { id: 'INST-040', name: 'Scalpel handle #3', nameFr: 'Manche de scalpel n°3', quantity: 1, material: 'acier_inox' },
      { id: 'INST-041', name: 'Bandage scissors', nameFr: 'Ciseaux de bandage', quantity: 1, material: 'acier_inox' },
      { id: 'INST-042', name: 'Heaney forceps', nameFr: 'Pinces de Heaney', quantity: 4, material: 'acier_inox' },
      { id: 'INST-043', name: 'Ochsner forceps', nameFr: 'Pinces d\'Ochsner', quantity: 4, material: 'acier_inox' },
      { id: 'INST-044', name: 'Richardson retractors small', nameFr: 'Écarteurs de Richardson petits', quantity: 2, material: 'acier_inox' },
      { id: 'INST-045', name: 'Uterine tenaculum', nameFr: 'Ténaculum utérin', quantity: 1, material: 'acier_inox' },
      { id: 'INST-046', name: 'Cord clamp', nameFr: 'Clip de cordon', quantity: 3, material: 'usage_unique' },
    ],
    sterilizationStatus: 'stérile',
    lastSterilizedAt: '2026-03-04T06:00:00Z',
    sterilizationExpiryAt: '2026-03-18T06:00:00Z',
    cycleCount: 201,
    maxCycles: 200,
    currentRoomId: 'OR-DONKA-05',
    condition: 'usé',
  },
  {
    id: 'TRAY-ORL-01',
    name: 'ENT Surgery Tray',
    nameFr: 'Plateau ORL',
    specialty: 'orl',
    instruments: [
      { id: 'INST-050', name: 'Tonsil forceps', nameFr: 'Pince d\'amygdalectomie', quantity: 2, material: 'acier_inox' },
      { id: 'INST-051', name: 'Adenoid curette', nameFr: 'Curette d\'adénoïde', quantity: 2, material: 'acier_inox' },
      { id: 'INST-052', name: 'Mouth gag', nameFr: 'Bec de Canard', quantity: 1, material: 'acier_inox' },
      { id: 'INST-053', name: 'Suction cannula', nameFr: 'Canule d\'aspiration', quantity: 3, material: 'usage_unique' },
      { id: 'INST-054', name: 'Tracheal dilator', nameFr: 'Dilatateur trachéal', quantity: 1, material: 'acier_inox' },
    ],
    sterilizationStatus: 'contaminé',
    lastSterilizedAt: '2026-03-03T20:00:00Z',
    sterilizationExpiryAt: null,
    cycleCount: 130,
    maxCycles: 200,
    currentRoomId: null,
    condition: 'bon',
  },
]

// ═══════════════════════════════════════════════════════════════
//  DEMO DATA — Scheduled Surgeries
// ═══════════════════════════════════════════════════════════════

const emptyChecklist: PreOpChecklist = {
  jeûne: false,
  consentement: false,
  bilan_pré_op: false,
  groupe_sanguin: false,
  radiographie: false,
  identification_patient: false,
  site_chirurgical_marque: false,
  allergies_verifiees: false,
  prophylaxie_antibiotique: false,
  preparation_cutanee: false,
  documents_imagerie: false,
  voie_abordable: false,
}

const completeChecklist: PreOpChecklist = {
  jeûne: true,
  consentement: true,
  bilan_pré_op: true,
  groupe_sanguin: true,
  radiographie: true,
  identification_patient: true,
  site_chirurgical_marque: true,
  allergies_verifiees: true,
  prophylaxie_antibiotique: true,
  preparation_cutanee: true,
  documents_imagerie: true,
  voie_abordable: true,
}

export const demoScheduledSurgeries: ScheduledSurgery[] = [
  {
    id: 'SURG-2026-010',
    date: '2026-03-04',
    plannedStartTime: '08:00',
    actualStartTime: '08:12',
    actualEndTime: '09:05',
    estimatedDurationMin: 60,
    actualDurationMin: 53,
    urgencyLevel: 'électif',
    status: 'completed',
    specialty: 'chirurgie_generale',
    procedureCode: 'CG-001',
    procedureName: 'Appendicectomie',
    patientId: 'P-2024-042',
    patientName: 'Mamadou Saliou Bah',
    patientAge: 28,
    patientSex: 'M',
    roomId: 'OR-DONKA-01',
    roomName: 'Salle Opératoire 1 — Polyvalente A',
    surgeonId: 'STAFF-CHIR-01',
    surgeonName: 'Dr. Mamadou Diallo',
    anesthesistId: 'STAFF-ANES-01',
    anesthesistName: 'Dr. Ousmane Soumah',
    instrumentisteId: 'STAFF-INSTR-01',
    instrumentisteName: 'Kadiatou Doubé',
    aideOperatoireId: 'STAFF-AIDE-01',
    aideOperatoireName: 'Abdoulaye Sylla',
    brancardierId: 'STAFF-BRANC-01',
    brancardierName: 'Lansana Fofana',
    anesthesiaType: 'générale',
    preOpChecklist: completeChecklist,
    postOpStatus: 'transfere_hospitalisation',
    postOpNotes: 'Appendicectomie simple sans complication. Patient réveillé, douloureux contrôlé.',
    complications: [],
    bloodLossMl: 50,
    specimensSent: true,
    notes: 'Appendice rétro-caecal, dissection difficile',
    createdAt: '2026-03-03T14:00:00Z',
    updatedAt: '2026-03-04T09:10:00Z',
  },
  {
    id: 'SURG-2026-011',
    date: '2026-03-04',
    plannedStartTime: '09:30',
    actualStartTime: '09:45',
    actualEndTime: '10:38',
    estimatedDurationMin: 45,
    actualDurationMin: 53,
    urgencyLevel: 'urgent',
    status: 'completed',
    specialty: 'obstetricale',
    procedureCode: 'OBS-001',
    procedureName: 'Césarienne',
    patientId: 'P-2024-078',
    patientName: 'Fatoumata Binta Diallo',
    patientAge: 32,
    patientSex: 'F',
    roomId: 'OR-DONKA-05',
    roomName: 'Salle Opératoire 5 — Obstétricale',
    surgeonId: 'STAFF-CHIR-02',
    surgeonName: 'Dr. Aminata Camara',
    anesthesistId: 'STAFF-ANES-02',
    anesthesistName: 'Dr. Mariama Sow',
    instrumentisteId: 'STAFF-INSTR-01',
    instrumentisteName: 'Kadiatou Doubé',
    aideOperatoireId: 'STAFF-AIDE-02',
    aideOperatoireName: 'Mamadou Bah',
    brancardierId: 'STAFF-BRANC-02',
    brancardierName: 'Thierno Diallo',
    anesthesiaType: 'rachianesthésie',
    preOpChecklist: completeChecklist,
    postOpStatus: 'en_salle_reveil',
    postOpNotes: 'Néonat vivant, APGAR 8/10. Mère stable.',
    complications: [],
    bloodLossMl: 400,
    specimensSent: false,
    notes: 'Césarienne pour stagnation de la dilatation à 5cm + RPM + liquide méconial',
    createdAt: '2026-03-04T06:00:00Z',
    updatedAt: '2026-03-04T10:40:00Z',
  },
  {
    id: 'SURG-2026-012',
    date: '2026-03-04',
    plannedStartTime: '10:30',
    actualStartTime: '10:45',
    actualEndTime: null,
    estimatedDurationMin: 90,
    actualDurationMin: null,
    urgencyLevel: 'électif',
    status: 'in-progress',
    specialty: 'chirurgie_generale',
    procedureCode: 'CG-002',
    procedureName: 'Cholécystectomie',
    patientId: 'P-2024-055',
    patientName: 'Kaba Keita',
    patientAge: 45,
    patientSex: 'M',
    roomId: 'OR-DONKA-01',
    roomName: 'Salle Opératoire 1 — Polyvalente A',
    surgeonId: 'STAFF-CHIR-01',
    surgeonName: 'Dr. Mamadou Diallo',
    anesthesistId: 'STAFF-ANES-01',
    anesthesistName: 'Dr. Ousmane Soumah',
    instrumentisteId: 'STAFF-INSTR-01',
    instrumentisteName: 'Kadiatou Doubé',
    aideOperatoireId: 'STAFF-AIDE-01',
    aideOperatoireName: 'Abdoulaye Sylla',
    brancardierId: 'STAFF-BRANC-01',
    brancardierName: 'Lansana Fofana',
    anesthesiaType: 'générale',
    preOpChecklist: completeChecklist,
    postOpStatus: null,
    postOpNotes: null,
    complications: [],
    bloodLossMl: null,
    specimensSent: false,
    notes: 'Lithiase vésiculaire symptomatique — cholécystectomie programmée',
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-04T10:45:00Z',
  },
  {
    id: 'SURG-2026-013',
    date: '2026-03-04',
    plannedStartTime: '12:00',
    actualStartTime: null,
    actualEndTime: null,
    estimatedDurationMin: 120,
    actualDurationMin: null,
    urgencyLevel: 'électif',
    status: 'pre-op',
    specialty: 'orthopedie',
    procedureCode: 'ORT-001',
    procedureName: 'Ostéosynthèse fracture hanche',
    patientId: 'P-2024-091',
    patientName: 'Hadja Aïssata Touré',
    patientAge: 72,
    patientSex: 'F',
    roomId: 'OR-DONKA-03',
    roomName: 'Salle Opératoire 3 — Spécialisée Orthopédie',
    surgeonId: 'STAFF-CHIR-03',
    surgeonName: 'Dr. Ibrahima Touré',
    anesthesistId: 'STAFF-ANES-03',
    anesthesistName: 'Dr. Sekou Condé',
    instrumentisteId: 'STAFF-INSTR-02',
    instrumentisteName: 'Bintou Keita',
    aideOperatoireId: 'STAFF-AIDE-02',
    aideOperatoireName: 'Mamadou Bah',
    brancardierId: 'STAFF-BRANC-01',
    brancardierName: 'Lansana Fofana',
    anesthesiaType: 'rachianesthésie',
    preOpChecklist: {
      ...emptyChecklist,
      jeûne: true,
      consentement: true,
      bilan_pré_op: true,
      groupe_sanguin: true,
      radiographie: true,
      identification_patient: true,
      allergies_verifiees: true,
      voie_abordable: true,
    },
    postOpStatus: null,
    postOpNotes: null,
    complications: [],
    bloodLossMl: null,
    specimensSent: false,
    notes: 'Fracture du col fémoral gauche — chute mécanique. Ostéoporose connue.',
    createdAt: '2026-03-02T16:00:00Z',
    updatedAt: '2026-03-04T08:00:00Z',
  },
  {
    id: 'SURG-2026-014',
    date: '2026-03-04',
    plannedStartTime: '13:30',
    actualStartTime: null,
    actualEndTime: null,
    estimatedDurationMin: 60,
    actualDurationMin: null,
    urgencyLevel: 'électif',
    status: 'planned',
    specialty: 'urologie',
    procedureCode: 'URO-005',
    procedureName: 'Circoncision',
    patientId: 'P-2024-103',
    patientName: 'Aboubacar Sidiki Condé',
    patientAge: 8,
    patientSex: 'M',
    roomId: 'OR-DONKA-02',
    roomName: 'Salle Opératoire 2 — Polyvalente B',
    surgeonId: 'STAFF-CHIR-01',
    surgeonName: 'Dr. Mamadou Diallo',
    anesthesistId: 'STAFF-ANES-02',
    anesthesistName: 'Dr. Mariama Sow',
    instrumentisteId: 'STAFF-INSTR-01',
    instrumentisteName: 'Kadiatou Doubé',
    aideOperatoireId: 'STAFF-AIDE-01',
    aideOperatoireName: 'Abdoulaye Sylla',
    brancardierId: 'STAFF-BRANC-02',
    brancardierName: 'Thierno Diallo',
    anesthesiaType: 'générale',
    preOpChecklist: {
      ...emptyChecklist,
      jeûne: true,
      consentement: true,
      identification_patient: true,
    },
    postOpStatus: null,
    postOpNotes: null,
    complications: [],
    bloodLossMl: null,
    specimensSent: false,
    notes: 'Circoncision rituelle — programme de chirurgie ambulatoire',
    createdAt: '2026-02-28T09:00:00Z',
    updatedAt: '2026-03-04T07:00:00Z',
  },
  {
    id: 'SURG-2026-015',
    date: '2026-03-04',
    plannedStartTime: '08:30',
    actualStartTime: '08:50',
    actualEndTime: null,
    estimatedDurationMin: 240,
    actualDurationMin: null,
    urgencyLevel: 'semi-urgent',
    status: 'in-progress',
    specialty: 'neurochirurgie',
    procedureCode: 'NEU-001',
    procedureName: 'Craniotomie pour tumeur',
    patientId: 'P-2024-117',
    patientName: 'Sory Ibrahim Soumah',
    patientAge: 54,
    patientSex: 'M',
    roomId: 'OR-DONKA-04',
    roomName: 'Salle Opératoire 4 — Neurochirurgie',
    surgeonId: 'STAFF-CHIR-04',
    surgeonName: 'Dr. Fatoumata Bangoura',
    anesthesistId: 'STAFF-ANES-01',
    anesthesistName: 'Dr. Ousmane Soumah',
    instrumentisteId: 'STAFF-INSTR-01',
    instrumentisteName: 'Kadiatou Doubé',
    aideOperatoireId: 'STAFF-AIDE-02',
    aideOperatoireName: 'Mamadou Bah',
    brancardierId: 'STAFF-BRANC-01',
    brancardierName: 'Lansana Fofana',
    anesthesiaType: 'générale',
    preOpChecklist: completeChecklist,
    postOpStatus: null,
    postOpNotes: null,
    complications: [],
    bloodLossMl: null,
    specimensSent: false,
    notes: 'Méningiome front gauche — IRM du 28/02. Navigation neuronavigation disponible.',
    createdAt: '2026-02-28T11:00:00Z',
    updatedAt: '2026-03-04T08:50:00Z',
  },
  {
    id: 'SURG-2026-016',
    date: '2026-03-04',
    plannedStartTime: '14:30',
    actualStartTime: null,
    actualEndTime: null,
    estimatedDurationMin: 30,
    actualDurationMin: null,
    urgencyLevel: 'électif',
    status: 'planned',
    specialty: 'orl',
    procedureCode: 'ORL-001',
    procedureName: 'Amygdalectomie',
    patientId: 'P-2024-125',
    patientName: 'Aissatou Bangoura',
    patientAge: 12,
    patientSex: 'F',
    roomId: 'OR-DONKA-02',
    roomName: 'Salle Opératoire 2 — Polyvalente B',
    surgeonId: 'STAFF-CHIR-01',
    surgeonName: 'Dr. Mamadou Diallo',
    anesthesistId: 'STAFF-ANES-02',
    anesthesistName: 'Dr. Mariama Sow',
    instrumentisteId: 'STAFF-INSTR-01',
    instrumentisteName: 'Kadiatou Doubé',
    aideOperatoireId: 'STAFF-AIDE-01',
    aideOperatoireName: 'Abdoulaye Sylla',
    brancardierId: 'STAFF-BRANC-02',
    brancardierName: 'Thierno Diallo',
    anesthesiaType: 'générale',
    preOpChecklist: emptyChecklist,
    postOpStatus: null,
    postOpNotes: null,
    complications: [],
    bloodLossMl: null,
    specimensSent: false,
    notes: 'Amygdalites à répétition — 6 épisodes/an',
    createdAt: '2026-03-01T15:00:00Z',
    updatedAt: '2026-03-01T15:00:00Z',
  },
  {
    id: 'SURG-2026-017',
    date: '2026-03-04',
    plannedStartTime: '—',
    actualStartTime: '06:20',
    actualEndTime: '07:15',
    estimatedDurationMin: 60,
    actualDurationMin: 55,
    urgencyLevel: 'emergent',
    status: 'completed',
    specialty: 'chirurgie_generale',
    procedureCode: 'CG-005',
    procedureName: 'Laparotomie exploratrice',
    patientId: 'P-2024-132',
    patientName: 'Moussa Kaba',
    patientAge: 35,
    patientSex: 'M',
    roomId: 'OR-DONKA-06',
    roomName: 'Salle Opératoire 6 — Urgences',
    surgeonId: 'STAFF-CHIR-01',
    surgeonName: 'Dr. Mamadou Diallo',
    anesthesistId: 'STAFF-ANES-03',
    anesthesistName: 'Dr. Sekou Condé',
    instrumentisteId: 'STAFF-INSTR-01',
    instrumentisteName: 'Kadiatou Doubé',
    aideOperatoireId: 'STAFF-AIDE-01',
    aideOperatoireName: 'Abdoulaye Sylla',
    brancardierId: 'STAFF-BRANC-01',
    brancardierName: 'Lansana Fofana',
    anesthesiaType: 'générale',
    preOpChecklist: {
      ...emptyChecklist,
      identification_patient: true,
      allergies_verifiees: true,
      voie_abordable: true,
    },
    postOpStatus: 'transfere_reanimation',
    postOpNotes: 'Perforation du grêle sur typhoïde — péritonite stercorale. Lavage abondant. Drainage. Prognostic réservé.',
    complications: ['Choc septique', 'Péritonite stercorale'],
    bloodLossMl: 200,
    specimensSent: true,
    notes: 'Admission urgences à 05h40 — abdomen aigu. Typhoïde avec perforation iléale.',
    createdAt: '2026-03-04T05:40:00Z',
    updatedAt: '2026-03-04T07:20:00Z',
  },
  {
    id: 'SURG-2026-018',
    date: '2026-03-05',
    plannedStartTime: '08:00',
    actualStartTime: null,
    actualEndTime: null,
    estimatedDurationMin: 60,
    actualDurationMin: null,
    urgencyLevel: 'électif',
    status: 'planned',
    specialty: 'chirurgie_generale',
    procedureCode: 'CG-003',
    procedureName: 'Cure de hernie',
    patientId: 'P-2024-045',
    patientName: 'Ibrahima Sory Sylla',
    patientAge: 52,
    patientSex: 'M',
    roomId: 'OR-DONKA-01',
    roomName: 'Salle Opératoire 1 — Polyvalente A',
    surgeonId: 'STAFF-CHIR-01',
    surgeonName: 'Dr. Mamadou Diallo',
    anesthesistId: 'STAFF-ANES-03',
    anesthesistName: 'Dr. Sekou Condé',
    instrumentisteId: 'STAFF-INSTR-01',
    instrumentisteName: 'Kadiatou Doubé',
    aideOperatoireId: 'STAFF-AIDE-01',
    aideOperatoireName: 'Abdoulaye Sylla',
    brancardierId: 'STAFF-BRANC-01',
    brancardierName: 'Lansana Fofana',
    anesthesiaType: 'rachianesthésie',
    preOpChecklist: emptyChecklist,
    postOpStatus: null,
    postOpNotes: null,
    complications: [],
    bloodLossMl: null,
    specimensSent: false,
    notes: 'Hernie inguinale droite — technique Shouldice',
    createdAt: '2026-03-02T10:00:00Z',
    updatedAt: '2026-03-02T10:00:00Z',
  },
  {
    id: 'SURG-2026-019',
    date: '2026-03-05',
    plannedStartTime: '10:00',
    actualStartTime: null,
    actualEndTime: null,
    estimatedDurationMin: 90,
    actualDurationMin: null,
    urgencyLevel: 'urgent',
    status: 'planned',
    specialty: 'orthopedie',
    procedureCode: 'ORT-005',
    procedureName: 'Enclouage fémoral',
    patientId: 'P-2024-138',
    patientName: 'Alhassane Fofana',
    patientAge: 24,
    patientSex: 'M',
    roomId: 'OR-DONKA-03',
    roomName: 'Salle Opératoire 3 — Spécialisée Orthopédie',
    surgeonId: 'STAFF-CHIR-03',
    surgeonName: 'Dr. Ibrahima Touré',
    anesthesistId: 'STAFF-ANES-01',
    anesthesistName: 'Dr. Ousmane Soumah',
    instrumentisteId: 'STAFF-INSTR-02',
    instrumentisteName: 'Bintou Keita',
    aideOperatoireId: 'STAFF-AIDE-02',
    aideOperatoireName: 'Mamadou Bah',
    brancardierId: 'STAFF-BRANC-02',
    brancardierName: 'Thierno Diallo',
    anesthesiaType: 'rachianesthésie',
    preOpChecklist: emptyChecklist,
    postOpStatus: null,
    postOpNotes: null,
    complications: [],
    bloodLossMl: null,
    specimensSent: false,
    notes: 'Fracture diaphysaire fémur droit — accident moto. Enclouage centromédullaire prévu.',
    createdAt: '2026-03-04T07:00:00Z',
    updatedAt: '2026-03-04T07:00:00Z',
  },
]

// ═══════════════════════════════════════════════════════════════
//  DEMO DATA — Dashboard Statistics
// ═══════════════════════════════════════════════════════════════

export const demoDashboardStats: SurgeryDashboardStats = {
  today: {
    total: 7,
    completed: 3,
    inProgress: 2,
    planned: 2,
    emergencies: 1,
    cancelled: 0,
    averageDurationMin: 62,
    bloodUnitsUsed: 2,
  },
  thisWeek: {
    total: 34,
    completed: 31,
    cancelled: 2,
    emergencies: 6,
    elective: 26,
    averageDurationMin: 78,
    complicationCount: 3,
  },
  thisMonth: {
    total: 128,
    completed: 119,
    cancelled: 5,
    emergencies: 22,
    elective: 101,
    averageDurationMin: 82,
    complicationCount: 11,
  },
  roomUtilization: [
    { roomId: 'OR-DONKA-01', roomName: 'SO1 — Polyvalente A', totalSlotsPerDay: 4, usedSlots: 3, utilizationPercent: 75, downtimeMinutes: 45 },
    { roomId: 'OR-DONKA-02', roomName: 'SO2 — Polyvalente B', totalSlotsPerDay: 4, usedSlots: 2, utilizationPercent: 50, downtimeMinutes: 120 },
    { roomId: 'OR-DONKA-03', roomName: 'SO3 — Orthopédie', totalSlotsPerDay: 3, usedSlots: 2, utilizationPercent: 67, downtimeMinutes: 90 },
    { roomId: 'OR-DONKA-04', roomName: 'SO4 — Neurochirurgie', totalSlotsPerDay: 2, usedSlots: 1, utilizationPercent: 50, downtimeMinutes: 180 },
    { roomId: 'OR-DONKA-05', roomName: 'SO5 — Obstétricale', totalSlotsPerDay: 6, usedSlots: 5, utilizationPercent: 83, downtimeMinutes: 30 },
    { roomId: 'OR-DONKA-06', roomName: 'SO6 — Urgences', totalSlotsPerDay: 8, usedSlots: 1, utilizationPercent: 13, downtimeMinutes: 0 },
  ],
  emergencyVsElective: {
    elective: 101,
    semiUrgent: 15,
    urgent: 12,
    emergent: 10,
    total: 138,
  },
  averageDurationBySpecialty: {
    chirurgie_generale: 85,
    orthopedie: 115,
    neurochirurgie: 175,
    urologie: 70,
    cardiaque: 240,
    pediatrique: 55,
    obstetricale: 42,
    orl: 35,
    ophtalmologique: 40,
  },
  topProcedures: [
    { procedureCode: 'OBS-001', procedureName: 'Césarienne', count: 28, averageDurationMin: 48 },
    { procedureCode: 'CG-001', procedureName: 'Appendicectomie', count: 18, averageDurationMin: 55 },
    { procedureCode: 'CG-003', procedureName: 'Cure de hernie', count: 14, averageDurationMin: 50 },
    { procedureCode: 'ORT-001', procedureName: 'Ostéosynthèse fracture hanche', count: 11, averageDurationMin: 110 },
    { procedureCode: 'CG-002', procedureName: 'Cholécystectomie', count: 9, averageDurationMin: 95 },
    { procedureCode: 'ORT-005', procedureName: 'Enclouage fémoral', count: 8, averageDurationMin: 85 },
    { procedureCode: 'CG-005', procedureName: 'Laparotomie exploratrice', count: 7, averageDurationMin: 80 },
    { procedureCode: 'NEU-005', procedureName: 'Évacuation hématome sous-dural', count: 5, averageDurationMin: 55 },
  ],
  staffWorkload: [
    { staffId: 'STAFF-CHIR-01', staffName: 'Dr. Mamadou Diallo', role: 'chirurgien', surgeriesThisWeek: 12, hoursInOR: 18, onCallHours: 24 },
    { staffId: 'STAFF-CHIR-02', staffName: 'Dr. Aminata Camara', role: 'chirurgien', surgeriesThisWeek: 9, hoursInOR: 12, onCallHours: 48 },
    { staffId: 'STAFF-CHIR-03', staffName: 'Dr. Ibrahima Touré', role: 'chirurgien', surgeriesThisWeek: 6, hoursInOR: 14, onCallHours: 24 },
    { staffId: 'STAFF-CHIR-04', staffName: 'Dr. Fatoumata Bangoura', role: 'chirurgien', surgeriesThisWeek: 4, hoursInOR: 16, onCallHours: 48 },
    { staffId: 'STAFF-ANES-01', staffName: 'Dr. Ousmane Soumah', role: 'anesthésiste', surgeriesThisWeek: 15, hoursInOR: 22, onCallHours: 24 },
    { staffId: 'STAFF-ANES-02', staffName: 'Dr. Mariama Sow', role: 'anesthésiste', surgeriesThisWeek: 11, hoursInOR: 16, onCallHours: 48 },
    { staffId: 'STAFF-ANES-03', staffName: 'Dr. Sekou Condé', role: 'anesthésiste', surgeriesThisWeek: 8, hoursInOR: 12, onCallHours: 24 },
    { staffId: 'STAFF-INSTR-01', staffName: 'Kadiatou Doubé', role: 'instrumentiste', surgeriesThisWeek: 18, hoursInOR: 28, onCallHours: 0 },
    { staffId: 'STAFF-INSTR-02', staffName: 'Bintou Keita', role: 'instrumentiste', surgeriesThisWeek: 10, hoursInOR: 18, onCallHours: 24 },
    { staffId: 'STAFF-AIDE-01', staffName: 'Abdoulaye Sylla', role: 'aide_opératoire', surgeriesThisWeek: 20, hoursInOR: 30, onCallHours: 0 },
    { staffId: 'STAFF-AIDE-02', staffName: 'Mamadou Bah', role: 'aide_opératoire', surgeriesThisWeek: 14, hoursInOR: 22, onCallHours: 48 },
    { staffId: 'STAFF-BRANC-01', staffName: 'Lansana Fofana', role: 'brancardier', surgeriesThisWeek: 25, hoursInOR: 12, onCallHours: 0 },
    { staffId: 'STAFF-BRANC-02', staffName: 'Thierno Diallo', role: 'brancardier', surgeriesThisWeek: 18, hoursInOR: 8, onCallHours: 48 },
  ],
  complicationRate: 8.6,
  cancellationRate: 3.9,
  onTimeStartRate: 72,
}

// ═══════════════════════════════════════════════════════════════
//  UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Get all rooms filtered by status
 */
export function getRoomsByStatus(rooms: OperatingRoom[], status: RoomStatus): OperatingRoom[] {
  return rooms.filter((r) => r.status === status)
}

/**
 * Get all rooms filtered by type
 */
export function getRoomsByType(rooms: OperatingRoom[], type: RoomType): OperatingRoom[] {
  return rooms.filter((r) => r.type === type)
}

/**
 * Get available rooms for a given specialty
 */
export function getAvailableRoomsForSpecialty(
  rooms: OperatingRoom[],
  specialty: SurgicalSpecialty
): OperatingRoom[] {
  return rooms.filter(
    (r) => r.status === 'available' && specialty.requiredRoomType.includes(r.type)
  )
}

/**
 * Get surgeries for a specific date
 */
export function getSurgeriesByDate(surgeries: ScheduledSurgery[], date: string): ScheduledSurgery[] {
  return surgeries
    .filter((s) => s.date === date)
    .sort((a, b) => a.plannedStartTime.localeCompare(b.plannedStartTime))
}

/**
 * Get surgeries by urgency level
 */
export function getSurgeriesByUrgency(surgeries: ScheduledSurgery[], level: UrgencyLevel): ScheduledSurgery[] {
  return surgeries.filter((s) => s.urgencyLevel === level)
}

/**
 * Get surgeries for a specific surgeon
 */
export function getSurgeonSchedule(
  surgeries: ScheduledSurgery[],
  surgeonId: string,
  date?: string
): ScheduledSurgery[] {
  let result = surgeries.filter((s) => s.surgeonId === surgeonId)
  if (date) result = result.filter((s) => s.date === date)
  return result.sort((a, b) => a.plannedStartTime.localeCompare(b.plannedStartTime))
}

/**
 * Check if a pre-op checklist is fully completed
 */
export function isChecklistComplete(checklist: PreOpChecklist): boolean {
  return Object.values(checklist).every((v) => v === true)
}

/**
 * Count completed items in a pre-op checklist
 */
export function checklistCompletionCount(checklist: PreOpChecklist): { completed: number; total: number } {
  const entries = Object.values(checklist)
  return {
    completed: entries.filter(Boolean).length,
    total: entries.length,
  }
}

/**
 * Calculate checklist completion percentage
 */
export function checklistCompletionPercent(checklist: PreOpChecklist): number {
  const { completed, total } = checklistCompletionCount(checklist)
  return Math.round((completed / total) * 100)
}

/**
 * Get staff by role
 */
export function getStaffByRole(staff: SurgicalStaff[], role: StaffRole): SurgicalStaff[] {
  return staff.filter((s) => s.role === role)
}

/**
 * Get available staff for a role
 */
export function getAvailableStaff(staff: SurgicalStaff[], role?: StaffRole): SurgicalStaff[] {
  let result = staff.filter((s) => s.available && s.surgeriesToday < s.maxSurgeriesPerDay)
  if (role) result = result.filter((s) => s.role === role)
  return result
}

/**
 * Get instrument trays that need attention (contaminated, expired, worn)
 */
export function getTraysNeedingAttention(trays: InstrumentTray[]): InstrumentTray[] {
  return trays.filter(
    (t) =>
      t.sterilizationStatus === 'contaminé' ||
      t.sterilizationStatus === 'périmé' ||
      t.condition === 'à_remplacer' ||
      (t.sterilizationExpiryAt !== null &&
        new Date(t.sterilizationExpiryAt) < new Date())
  )
}

/**
 * Get trays by specialty
 */
export function getTraysBySpecialty(trays: InstrumentTray[], specialty: SurgicalSpecialtyId): InstrumentTray[] {
  return trays.filter((t) => t.specialty === specialty)
}

/**
 * Check if a tray's sterilization is expired
 */
export function isTraySterilizationExpired(tray: InstrumentTray): boolean {
  if (!tray.sterilizationExpiryAt) return false
  return new Date(tray.sterilizationExpiryAt) < new Date()
}

/**
 * Calculate overall room utilization rate
 */
export function calculateOverallUtilization(utilizations: RoomUtilization[]): number {
  if (utilizations.length === 0) return 0
  const total = utilizations.reduce((sum, u) => sum + u.utilizationPercent, 0)
  return Math.round(total / utilizations.length)
}

/**
 * Format duration in hours and minutes
 */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h${m}min`
}

/**
 * Get the specialty object by ID
 */
export function getSpecialtyById(id: SurgicalSpecialtyId): SurgicalSpecialty | undefined {
  return demoSurgicalSpecialties.find((s) => s.id === id)
}

/**
 * Get the room object by ID
 */
export function getRoomById(id: string): OperatingRoom | undefined {
  return demoOperatingRooms.find((r) => r.id === id)
}

/**
 * Get the staff member by ID
 */
export function getStaffById(id: string): SurgicalStaff | undefined {
  return demoSurgicalStaff.find((s) => s.id === id)
}

/**
 * Generate a new surgery ID
 */
export function generateSurgeryId(): string {
  return `SURG-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
}

/**
 * Generate a new empty pre-op checklist
 */
export function createEmptyChecklist(): PreOpChecklist {
  return { ...emptyChecklist }
}

/**
 * Calculate estimated end time from start time and duration
 */
export function calculateEndTime(startTime: string, durationMin: number): string {
  const [hours, minutes] = startTime.split(':').map(Number)
  const totalMinutes = hours * 60 + minutes + durationMin
  const endHours = Math.floor(totalMinutes / 60) % 24
  const endMinutes = totalMinutes % 60
  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`
}

/**
 * Check if a room has all critical utilities functional
 */
export function isRoomFullyOperational(room: OperatingRoom): boolean {
  return (
    room.status === 'available' &&
    room.oxygenOutlet &&
    room.suctionAvailable &&
    room.equipment.filter((e) => !e.functional).length === 0
  )
}

/**
 * Get equipment that is non-functional in a room
 */
export function getNonFunctionalEquipment(room: OperatingRoom): RoomEquipment[] {
  return room.equipment.filter((e) => !e.functional)
}

/**
 * Get surgeries currently in progress
 */
export function getActiveSurgeries(surgeries: ScheduledSurgery[]): ScheduledSurgery[] {
  return surgeries.filter((s) => s.status === 'in-progress')
}
