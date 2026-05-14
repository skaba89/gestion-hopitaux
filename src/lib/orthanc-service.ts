/**
 * HealthFlow Guinea - DICOM/Orthanc Integration Service
 * Connects to Orthanc PACS servers for medical imaging
 * Orthanc API: https://orthanc.uclouvain.be/book/users/rest-api.html
 *
 * Supports WADO-RS (Retrieve) and STOW-RS (Store) DICOMweb protocols
 */

import { addSimpleAuditEntry } from '@/lib/audit-logger'
import { db } from '@/lib/db'

export interface OrthancServer {
  id: string
  name: string
  url: string
  username: string
  password: string
  aeTitle: string
  isDefault: boolean
}

export interface DICOMStudy {
  id: string
  patientId: string
  patientName: string
  studyInstanceUID: string
  studyDate: string
  studyDescription: string
  modality: string
  accessionNumber: string | null
  institutionName: string
  seriesCount: number
  instanceCount: number
  fileSize: number
  serverId: string
  status: 'available' | 'processing' | 'archived' | 'error'
  thumbnailUrl: string | null
}

class OrthancService {
  private servers: OrthancServer[] = []
  private isConfigured: boolean

  constructor() {
    // Load servers from environment or use defaults
    this.servers = this.loadServers()
    this.isConfigured = this.servers.length > 0 && this.servers.some(s => s.url !== '')
  }

  private loadServers(): OrthancServer[] {
    const servers: OrthancServer[] = []

    // Primary Orthanc server (CHU Donka)
    if (process.env.ORTHANC_DONKA_URL) {
      servers.push({
        id: 'orthanc-donka',
        name: 'PACS CHU Donka',
        url: process.env.ORTHANC_DONKA_URL,
        username: process.env.ORTHANC_DONKA_USER || 'orthanc',
        password: process.env.ORTHANC_DONKA_PASSWORD || '',
        aeTitle: 'DONKA',
        isDefault: true,
      })
    }

    // Secondary Orthanc server (CHU Ignace Deen)
    if (process.env.ORTHANC_IGNACE_URL) {
      servers.push({
        id: 'orthanc-ignace',
        name: 'PACS CHU Ignace Deen',
        url: process.env.ORTHANC_IGNACE_URL,
        username: process.env.ORTHANC_IGNACE_USER || 'orthanc',
        password: process.env.ORTHANC_IGNACE_PASSWORD || '',
        aeTitle: 'IGNACE',
        isDefault: false,
      })
    }

    // If no servers configured, use sandbox mode
    if (servers.length === 0) {
      servers.push({
        id: 'orthanc-sandbox',
        name: 'Orthanc Sandbox',
        url: '',
        username: '',
        password: '',
        aeTitle: 'SANDBOX',
        isDefault: true,
      })
    }

    return servers
  }

  /**
   * Get authentication headers for Orthanc REST API
   */
  private getHeaders(server: OrthancServer): Record<string, string> {
    const auth = Buffer.from(`${server.username}:${server.password}`).toString('base64')
    return {
      'Authorization': `Basic ${auth}`,
      'Accept': 'application/json',
    }
  }

  /**
   * Test connection to Orthanc server
   */
  async testConnection(serverId?: string): Promise<{
    connected: boolean
    version: string | null
    serverName: string
    error?: string
  }> {
    const server = serverId
      ? this.servers.find(s => s.id === serverId)
      : this.servers.find(s => s.isDefault)

    if (!server || !server.url) {
      return {
        connected: true, // Sandbox
        version: '1.12.3 (SANDBOX)',
        serverName: server?.name || 'Orthanc Sandbox',
      }
    }

    try {
      const response = await fetch(`${server.url}/system`, {
        method: 'GET',
        headers: this.getHeaders(server),
        signal: AbortSignal.timeout(10000),
      })

      if (!response.ok) {
        return {
          connected: false,
          version: null,
          serverName: server.name,
          error: `HTTP ${response.status}`,
        }
      }

      const data = await response.json()
      return {
        connected: true,
        version: data.Version,
        serverName: server.name,
      }
    } catch (error) {
      return {
        connected: false,
        version: null,
        serverName: server.name,
        error: (error as Error).message,
      }
    }
  }

  /**
   * Search for studies (C-FIND via REST API)
   */
  async findStudies(params: {
    patientId?: string
    patientName?: string
    studyDate?: string
    modality?: string
    accessionNumber?: string
    serverId?: string
    limit?: number
  }): Promise<DICOMStudy[]> {
    const server = params.serverId
      ? this.servers.find(s => s.id === params.serverId)
      : this.servers.find(s => s.isDefault)

    if (!server || !server.url) {
      // Sandbox mode: return demo studies
      return this.getDemoStudies(params)
    }

    try {
      // Orthanc /tools/find API
      const searchBody: Record<string, any> = {
        Level: 'Study',
        Query: {},
        Limit: params.limit || 50,
      }

      if (params.patientId) searchBody.Query.PatientID = params.patientId
      if (params.patientName) searchBody.Query.PatientName = params.patientName
      if (params.studyDate) searchBody.Query.StudyDate = params.studyDate
      if (params.modality) searchBody.Query.ModalitiesInStudy = params.modality
      if (params.accessionNumber) searchBody.Query.AccessionNumber = params.accessionNumber

      const response = await fetch(`${server.url}/tools/find`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(server),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchBody),
      })

      if (!response.ok) {
        console.error('[Orthanc] Find studies failed:', response.status)
        return []
      }

      const studyIds = await response.json() as string[]

      // Get detailed info for each study
      const studies: DICOMStudy[] = []
      for (const studyId of studyIds.slice(0, params.limit || 50)) {
        try {
          const studyResponse = await fetch(`${server.url}/studies/${studyId}`, {
            method: 'GET',
            headers: this.getHeaders(server),
          })

          if (studyResponse.ok) {
            const studyData = await studyResponse.json()
            const mainDicomTags = studyData.MainDicomTags || {}
            const patientTags = studyData.PatientMainDicomTags || {}

            studies.push({
              id: studyId,
              patientId: patientTags.PatientID || '',
              patientName: patientTags.PatientName || '',
              studyInstanceUID: mainDicomTags.StudyInstanceUID || '',
              studyDate: mainDicomTags.StudyDate || '',
              studyDescription: mainDicomTags.StudyDescription || '',
              modality: mainDicomTags.ModalitiesInStudy || '',
              accessionNumber: mainDicomTags.AccessionNumber || null,
              institutionName: mainDicomTags.InstitutionName || '',
              seriesCount: studyData.Series?.length || 0,
              instanceCount: 0, // Would need to count from series
              fileSize: 0,
              serverId: server.id,
              status: 'available',
              thumbnailUrl: `${server.url}/studies/${studyId}/thumbnail`,
            })
          }
        } catch {
          // Skip failed study lookups
        }
      }

      return studies
    } catch (error) {
      console.error('[Orthanc] Find studies error:', (error as Error).message)
      return []
    }
  }

  /**
   * Get DICOMweb WADO-RS URL for a study/series/instance
   */
  getWadoRsUrl(serverId: string, studyInstanceUID: string, seriesInstanceUID?: string): string {
    const server = this.servers.find(s => s.id === serverId)
    if (!server || !server.url) return ''

    let url = `${server.url}/wado-rs/studies/${studyInstanceUID}`
    if (seriesInstanceUID) {
      url += `/series/${seriesInstanceUID}`
    }
    return url
  }

  /**
   * Get DICOM viewer URL (using OHIF or DWV)
   */
  getViewerUrl(studyInstanceUID: string, serverId?: string): string {
    const server = serverId
      ? this.servers.find(s => s.id === serverId)
      : this.servers.find(s => s.isDefault)
    const baseUrl = process.env.NEXT_PUBLIC_DICOM_VIEWER_URL || '/dicom-viewer'
    return `${baseUrl}?StudyInstanceUIDs=${studyInstanceUID}${server ? `&serverId=${server.id}` : ''}`
  }

  /**
   * Upload DICOM files (STOW-RS)
   */
  async uploadDicom(
    fileBuffer: Buffer,
    serverId?: string
  ): Promise<{
    success: boolean
    studyId?: string
    error?: string
  }> {
    const server = serverId
      ? this.servers.find(s => s.id === serverId)
      : this.servers.find(s => s.isDefault)

    if (!server || !server.url) {
      console.log('[Orthanc SANDBOX] DICOM upload simulated')
      return { success: true, studyId: `sandbox-${Date.now()}` }
    }

    try {
      const response = await fetch(`${server.url}/instances`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(server),
          'Content-Type': 'application/dicom',
        },
        body: new Uint8Array(fileBuffer),
      })

      if (response.ok) {
        const data = await response.json()
        addSimpleAuditEntry({
          action: 'DICOM_UPLOAD',
          module: 'dicom',
          entity: 'DICOMStudy',
          description: `DICOM instance uploaded: ${data.ID} to ${server.name}`,
          severity: 'INFO',
        })
        return { success: true, studyId: data.ParentStudy }
      }

      return { success: false, error: `Upload failed: HTTP ${response.status}` }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  /**
   * Get available servers
   */
  getServers(): OrthancServer[] {
    return this.servers
  }

  // ──────── Demo data for sandbox mode ────────

  private getDemoStudies(params: any): DICOMStudy[] {
    const demoStudies: DICOMStudy[] = [
      {
        id: 'demo-study-001',
        patientId: 'HF-2024-001',
        patientName: 'Aminata DIALLO',
        studyInstanceUID: '1.2.840.113619.2.55.3.2026.5.14.1',
        studyDate: '20260510',
        studyDescription: 'IRM Cérébrale avec contraste',
        modality: 'MR',
        accessionNumber: 'ACC-2026-001',
        institutionName: 'CHU Donka',
        seriesCount: 3,
        instanceCount: 120,
        fileSize: 245000000,
        serverId: 'orthanc-sandbox',
        status: 'available',
        thumbnailUrl: null,
      },
      {
        id: 'demo-study-002',
        patientId: 'HF-2024-002',
        patientName: 'Mamadou CONDE',
        studyInstanceUID: '1.2.840.113619.2.55.3.2026.5.14.2',
        studyDate: '20260509',
        studyDescription: 'Radiographie Thoracique PA',
        modality: 'CR',
        accessionNumber: 'ACC-2026-002',
        institutionName: 'CHU Donka',
        seriesCount: 1,
        instanceCount: 2,
        fileSize: 15000000,
        serverId: 'orthanc-sandbox',
        status: 'available',
        thumbnailUrl: null,
      },
      {
        id: 'demo-study-003',
        patientId: 'HF-2024-003',
        patientName: 'Fatoumata BAH',
        studyInstanceUID: '1.2.840.113619.2.55.3.2026.5.14.3',
        studyDate: '20260508',
        studyDescription: 'Échographie Obstétricale',
        modality: 'US',
        accessionNumber: 'ACC-2026-003',
        institutionName: 'CHU Ignace Deen',
        seriesCount: 1,
        instanceCount: 15,
        fileSize: 50000000,
        serverId: 'orthanc-sandbox',
        status: 'available',
        thumbnailUrl: null,
      },
    ]

    // Filter by params
    return demoStudies.filter(study => {
      if (params.patientId && !study.patientId.includes(params.patientId)) return false
      if (params.patientName && !study.patientName.toLowerCase().includes(params.patientName.toLowerCase())) return false
      if (params.modality && study.modality !== params.modality) return false
      return true
    })
  }
}

export const orthancService = new OrthancService()
