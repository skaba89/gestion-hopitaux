// HealthFlow Africa - DICOM Imaging Integration
// Medical imaging gateway with DICOM WADO-RS/STOW-RS support for Guinea

import { GUINEA_ESTABLISHMENTS } from './fhir'

/* ─────────── DICOM Types ─────────── */

export type DICOMModality = 'CT' | 'MR' | 'XR' | 'US' | 'MG' | 'NM' | 'PT' | 'RF' | 'CR' | 'DX' | 'ES' | 'ECG'
export type StudyStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'reported'
export type ReportStatus = 'draft' | 'preliminary' | 'final' | 'amended' | 'cancelled'

export interface DICOMStudy {
  id: string
  studyInstanceUID: string
  patientId: string
  patientName: string
  accessionNumber: string
  studyDate: string
  studyTime: string
  studyDescription: string
  modality: DICOMModality
  referringDoctor: string
  performingFacility: string
  performingFacilityCode: string
  numberOfSeries: number
  numberOfInstances: number
  status: StudyStatus
  reportStatus: ReportStatus
  radiologist: string | null
  reportText: string | null
  reportDate: string | null
  estimatedSizeMB: number
  wadoRsUrl: string
  thumbnailUrl: string | null
  priority: 'routine' | 'urgent' | 'stat'
  clinicalContext: string
  relatedEncounterId: string | null
  tags: string[]
  createdAt: string
}

export interface DICOMSeries {
  id: string
  studyId: string
  seriesInstanceUID: string
  seriesNumber: number
  seriesDescription: string
  modality: DICOMModality
  bodyPartExamined: string | null
  numberOfInstances: number
  estimatedSizeMB: number
}

export interface DICOMGateway {
  id: string
  facilityName: string
  facilityCode: string
  endpoint: string
  wadoRsUrl: string
  stowRsUrl: string
  status: 'online' | 'offline' | 'degraded'
  supportedModalities: DICOMModality[]
  totalStudies: number
  storageUsedGB: number
  storageCapacityGB: number
  lastPing: string
  latencyMs: number
  dicomAETitle: string
}

export interface DICOMImagingMetrics {
  totalStudies: number
  studiesToday: number
  pendingReports: number
  averageReportTime: string
  studiesByModality: Record<DICOMModality, number>
  studiesByFacility: Record<string, number>
  storageUtilization: number
  urgentPending: number
}

/* ─────────── DICOM Modality Labels ─────────── */

export const MODALITY_LABELS: Record<DICOMModality, string> = {
  CT: 'Scanner (CT)',
  MR: 'IRM (MR)',
  XR: 'Radiographie (XR)',
  US: 'Échographie (US)',
  MG: 'Mammographie (MG)',
  NM: 'Médecine Nucléaire (NM)',
  PT: 'PET Scan (PT)',
  RF: 'Radiofluoroscopie (RF)',
  CR: 'Radiographie Computed (CR)',
  DX: 'Radiographie Digitale (DX)',
  ES: 'Endoscopie (ES)',
  ECG: 'ECG (ECG)',
}

export const MODALITY_COLORS: Record<DICOMModality, string> = {
  CT: 'bg-blue-100 text-blue-700',
  MR: 'bg-purple-100 text-purple-700',
  XR: 'bg-gray-100 text-gray-700',
  US: 'bg-cyan-100 text-cyan-700',
  MG: 'bg-pink-100 text-pink-700',
  NM: 'bg-orange-100 text-orange-700',
  PT: 'bg-red-100 text-red-700',
  RF: 'bg-yellow-100 text-yellow-700',
  CR: 'bg-slate-100 text-slate-700',
  DX: 'bg-emerald-100 text-emerald-700',
  ES: 'bg-lime-100 text-lime-700',
  ECG: 'bg-green-100 text-green-700',
}

/* ─────────── DICOM Service ─────────── */

class DICOMService {
  private studies: DICOMStudy[] = []
  private gateways: DICOMGateway[] = []

  constructor() {
    this.initializeDemoData()
  }

  private initializeDemoData() {
    this.gateways = [
      {
        id: 'PACS-DONKA',
        facilityName: 'Hôpital National Donka',
        facilityCode: 'donka',
        endpoint: 'https://pacs.donka.healthflow-gn.com/dicom',
        wadoRsUrl: 'https://pacs.donka.healthflow-gn.com/wado-rs',
        stowRsUrl: 'https://pacs.donka.healthflow-gn.com/stow-rs',
        status: 'online',
        supportedModalities: ['CT', 'XR', 'US', 'CR', 'DX', 'ECG'],
        totalStudies: 12450,
        storageUsedGB: 2450,
        storageCapacityGB: 5000,
        lastPing: new Date().toISOString(),
        latencyMs: 35,
        dicomAETitle: 'DONKA_PACS',
      },
      {
        id: 'PACS-IGNACE',
        facilityName: 'Hôpital National Ignace Deen',
        facilityCode: 'ignace-deen',
        endpoint: 'https://pacs.ignace-deen.healthflow-gn.com/dicom',
        wadoRsUrl: 'https://pacs.ignace-deen.healthflow-gn.com/wado-rs',
        stowRsUrl: 'https://pacs.ignace-deen.healthflow-gn.com/stow-rs',
        status: 'online',
        supportedModalities: ['CT', 'MR', 'XR', 'US', 'MG'],
        totalStudies: 8920,
        storageUsedGB: 3100,
        storageCapacityGB: 5000,
        lastPing: new Date().toISOString(),
        latencyMs: 42,
        dicomAETitle: 'IGNACE_PACS',
      },
      {
        id: 'PACS-KANKAN',
        facilityName: 'Hôpital régional de Kankan',
        facilityCode: 'kankan-regional',
        endpoint: 'https://pacs.kankan.healthflow-gn.com/dicom',
        wadoRsUrl: 'https://pacs.kankan.healthflow-gn.com/wado-rs',
        stowRsUrl: 'https://pacs.kankan.healthflow-gn.com/stow-rs',
        status: 'degraded',
        supportedModalities: ['XR', 'US', 'CR'],
        totalStudies: 3450,
        storageUsedGB: 780,
        storageCapacityGB: 2000,
        lastPing: new Date(Date.now() - 300000).toISOString(),
        latencyMs: 180,
        dicomAETitle: 'KANKAN_PACS',
      },
    ]

    this.studies = [
      {
        id: 'STUDY-001',
        studyInstanceUID: '2.25.257854321456987123456789012345678901',
        patientId: 'P-2024-010',
        patientName: 'Ousmane Camara',
        accessionNumber: 'ACC-2026-0456',
        studyDate: '2026-05-10',
        studyTime: '23:15:00',
        studyDescription: 'IRM Cérébrale — Suspicion AVC ischémique',
        modality: 'MR',
        referringDoctor: 'Dr. Keita',
        performingFacility: 'Hôpital National Ignace Deen',
        performingFacilityCode: 'ignace-deen',
        numberOfSeries: 5,
        numberOfInstances: 245,
        status: 'reported',
        reportStatus: 'preliminary',
        radiologist: 'Dr. Soumah',
        reportText: 'IRM cérébrale en séquence T1, T2, FLAIR et diffusion. Hypersignal en diffusion au niveau du territoire sylvien gauche, compatible avec un infarctus cérébral récent. Pas de transformation hémorragique. Angio-IRM montre une occlusion de l\'artère cérébrale moyenne gauche.',
        reportDate: '2026-05-11',
        estimatedSizeMB: 850,
        wadoRsUrl: 'https://pacs.ignace-deen.healthflow-gn.com/wado-rs/studies/2.25.257854321456987123456789012345678901',
        thumbnailUrl: null,
        priority: 'stat',
        clinicalContext: 'AVC ischémique — admission urgences',
        relatedEncounterId: 'hf-encounter-adt-ADT-005',
        tags: ['urgence', 'neurologie', 'AVC'],
        createdAt: '2026-05-10T23:15:00Z',
      },
      {
        id: 'STUDY-002',
        studyInstanceUID: '2.25.123456789012345678901234567890123456',
        patientId: 'P-2024-001',
        patientName: 'Aminata Diallo',
        accessionNumber: 'ACC-2026-0448',
        studyDate: '2026-05-10',
        studyTime: '15:00:00',
        studyDescription: 'ECG 12 dérivations — Évaluation cardiologique',
        modality: 'ECG',
        referringDoctor: 'Dr. Diallo',
        performingFacility: 'Hôpital National Donka',
        performingFacilityCode: 'donka',
        numberOfSeries: 1,
        numberOfInstances: 3,
        status: 'reported',
        reportStatus: 'final',
        radiologist: 'Dr. Touré',
        reportText: 'ECG 12 dérivations. Rythme sinusal à 110/min. Sus-décalage ST en V2-V4. Ondes T inversées en D1, aVL. Compatible avec une ischémie myocardique aiguë. Recommandation: Troponine, Echocardiographie.',
        reportDate: '2026-05-10',
        estimatedSizeMB: 5,
        wadoRsUrl: 'https://pacs.donka.healthflow-gn.com/wado-rs/studies/2.25.123456789012345678901234567890123456',
        thumbnailUrl: null,
        priority: 'urgent',
        clinicalContext: 'Paludisme sévère avec suspicion myocardite',
        relatedEncounterId: 'hf-encounter-adt-ADT-002',
        tags: ['cardiologie', 'urgences'],
        createdAt: '2026-05-10T15:00:00Z',
      },
      {
        id: 'STUDY-003',
        studyInstanceUID: '2.25.987654321098765432109876543210987654',
        patientId: 'P-2024-008',
        patientName: 'Youssouf Touré',
        accessionNumber: 'ACC-2026-0430',
        studyDate: '2026-05-08',
        studyTime: '10:30:00',
        studyDescription: 'Échographie abdominale — Évaluation hépatique',
        modality: 'US',
        referringDoctor: 'Dr. Diallo',
        performingFacility: 'Hôpital National Donka',
        performingFacilityCode: 'donka',
        numberOfSeries: 2,
        numberOfInstances: 48,
        status: 'reported',
        reportStatus: 'final',
        radiologist: 'Dr. Camara',
        reportText: 'Échographie abdominale. Foie augmenté de volume, échogénicité hétérogène compatible avec une cirrhose débutante. Présence d\'une ascite modérée. Rate augmentée de taille (16cm). Voies biliaires intra-hépatiques non dilatées. Recommandation: FibroScan, bilan hépatique complet.',
        reportDate: '2026-05-08',
        estimatedSizeMB: 120,
        wadoRsUrl: 'https://pacs.donka.healthflow-gn.com/wado-rs/studies/2.25.987654321098765432109876543210987654',
        thumbnailUrl: null,
        priority: 'routine',
        clinicalContext: 'Hépatite B chronique avec cirrhose',
        relatedEncounterId: null,
        tags: ['hépatologie', 'échographie'],
        createdAt: '2026-05-08T10:30:00Z',
      },
      {
        id: 'STUDY-004',
        studyInstanceUID: '2.25.111122223333444455556666777788889999',
        patientId: 'P-KIN-2026-034',
        patientName: 'Sekou Soumah',
        accessionNumber: 'ACC-2026-0460',
        studyDate: '2026-05-11',
        studyTime: '07:30:00',
        studyDescription: 'Radiographie thoracique — Traumatisme thoracique',
        modality: 'XR',
        referringDoctor: 'Dr. Bangoura',
        performingFacility: 'Hôpital National Donka',
        performingFacilityCode: 'donka',
        numberOfSeries: 1,
        numberOfInstances: 2,
        status: 'in-progress',
        reportStatus: null,
        radiologist: null,
        reportText: null,
        reportDate: null,
        estimatedSizeMB: 25,
        wadoRsUrl: 'https://pacs.donka.healthflow-gn.com/wado-rs/studies/2.25.111122223333444455556666777788889999',
        thumbnailUrl: null,
        priority: 'urgent',
        clinicalContext: 'Traumatisme thoracique suite accident de la route',
        relatedEncounterId: 'hf-encounter-adt-ADT-006',
        tags: ['traumatologie', 'urgence', 'thorax'],
        createdAt: '2026-05-11T07:30:00Z',
      },
    ]
  }

  getStudies(filters?: { patientId?: string; modality?: DICOMModality; status?: StudyStatus }): DICOMStudy[] {
    let results = this.studies
    if (filters?.patientId) results = results.filter((s) => s.patientId === filters.patientId)
    if (filters?.modality) results = results.filter((s) => s.modality === filters.modality)
    if (filters?.status) results = results.filter((s) => s.status === filters.status)
    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  getStudy(id: string): DICOMStudy | undefined {
    return this.studies.find((s) => s.id === id)
  }

  getGateways(): DICOMGateway[] {
    return this.gateways
  }

  getMetrics(): DICOMImagingMetrics {
    const studiesByModality: Record<DICOMModality, number> = { CT: 0, MR: 0, XR: 0, US: 0, MG: 0, NM: 0, PT: 0, RF: 0, CR: 0, DX: 0, ES: 0, ECG: 0 }
    const studiesByFacility: Record<string, number> = {}

    this.studies.forEach((s) => {
      studiesByModality[s.modality]++
      studiesByFacility[s.performingFacility] = (studiesByFacility[s.performingFacility] || 0) + 1
    })

    return {
      totalStudies: this.studies.length,
      studiesToday: this.studies.filter((s) => s.studyDate === new Date().toISOString().split('T')[0]).length,
      pendingReports: this.studies.filter((s) => s.status === 'completed' && !s.reportText).length,
      averageReportTime: '45 min',
      studiesByModality,
      studiesByFacility,
      storageUtilization: 52,
      urgentPending: this.studies.filter((s) => s.priority === 'urgent' || s.priority === 'stat').length,
    }
  }
}

export const dicomService = new DICOMService()
