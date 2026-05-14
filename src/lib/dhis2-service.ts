/**
 * HealthFlow Guinea - DHIS2 Integration Service (Production-Ready)
 * Connects to DHIS2 instance for Guinea national health reporting
 * API docs: https://docs.dhis2.org/en/develop/using-the-apis/dhis2-core-apis.html
 *
 * Modes: Sandbox (demo) when credentials not configured, Production when configured
 */

import { db } from '@/lib/db'
import { addSimpleAuditEntry } from '@/lib/audit-logger'
import {
  DHIS2Config,
  DHIS2DataValueSet,
  DHIS2DataValue,
  DHIS2Report,
  DHIS2_DATA_ELEMENTS,
  toDHIS2Period,
  generateDHIS2Report,
} from './national-integrations'

/* ─────────── DHIS2 Service ─────────── */

class DHIS2Service {
  private baseUrl: string
  private username: string
  private password: string
  private organisationUnit: string
  private dataSetId: string
  private isSandbox: boolean
  private accessToken: string | null = null

  constructor() {
    this.baseUrl = process.env.DHIS2_BASE_URL || 'https://dhis2.health.gov.gn'
    this.username = process.env.DHIS2_USERNAME || ''
    this.password = process.env.DHIS2_PASSWORD || ''
    this.organisationUnit = process.env.DHIS2_ORG_UNIT || ''
    this.dataSetId = process.env.DHIS2_DATA_SET_ID || 'DS-HF-REPORT'
    this.isSandbox = !this.username || !this.password
  }

  /**
   * Get DHIS2 API headers with Basic Auth
   */
  private getHeaders(): Record<string, string> {
    const auth = Buffer.from(`${this.username}:${this.password}`).toString('base64')
    return {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  }

  /**
   * Test connection to DHIS2 instance
   */
  async testConnection(): Promise<{
    connected: boolean
    version: string | null
    instanceName: string | null
    error?: string
  }> {
    if (this.isSandbox) {
      return {
        connected: true,
        version: '2.40.2 (SANDBOX)',
        instanceName: 'DHIS2 Guinea — Mode Démo',
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/system/info`, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(10000),
      })

      if (!response.ok) {
        return {
          connected: false,
          version: null,
          instanceName: null,
          error: `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      const data = await response.json()
      return {
        connected: true,
        version: data.version,
        instanceName: data.instanceName || 'DHIS2 Guinea',
      }
    } catch (error) {
      return {
        connected: false,
        version: null,
        instanceName: null,
        error: (error as Error).message,
      }
    }
  }

  /**
   * Get organisation units (health facilities) from DHIS2
   */
  async getOrganisationUnits(parentId?: string): Promise<any[]> {
    if (this.isSandbox) {
      return [
        { id: 'OU-CONAKRY', name: 'Conakry', level: 2 },
        { id: 'OU-DONKA', name: 'CHU Donka', level: 3, parent: 'OU-CONAKRY' },
        { id: 'OU-IGNACE', name: 'CHU Ignace Deen', level: 3, parent: 'OU-CONAKRY' },
        { id: 'OU-KINDIA', name: 'Kindia', level: 2 },
        { id: 'OU-KANKAN', name: 'Kankan', level: 2 },
      ]
    }

    try {
      const params = new URLSearchParams({
        fields: 'id,name,level,parentId,path',
        paging: 'false',
      })
      if (parentId) {
        params.set('filter', `parentId:eq:${parentId}`)
      }

      const response = await fetch(
        `${this.baseUrl}/api/organisationUnits?${params}`,
        { method: 'GET', headers: this.getHeaders() }
      )

      const data = await response.json()
      return data.organisationUnits || []
    } catch (error) {
      console.error('[DHIS2] Get organisation units failed:', (error as Error).message)
      return []
    }
  }

  /**
   * Generate and submit a DHIS2 report from HealthFlow data
   * Pulls real statistics from PostgreSQL, formats as DHIS2 DataValueSet, and pushes
   */
  async submitReport(
    period: string,
    orgUnit?: string,
    establishmentId?: string
  ): Promise<{
    success: boolean
    report: DHIS2Report
    dhis2Response?: any
    error?: string
  }> {
    const targetOrgUnit = orgUnit || this.organisationUnit

    // Generate report from real database data
    const reportData = await this.collectReportData(period, establishmentId)

    const dataValueSet: DHIS2DataValueSet = generateDHIS2Report(
      period,
      targetOrgUnit,
      reportData
    )

    const report: DHIS2Report = {
      id: `RPT-${Date.now()}`,
      period,
      orgUnitName: reportData.orgUnitName || 'CHU Donka',
      orgUnitCode: targetOrgUnit,
      status: 'draft',
      submittedAt: null,
      acceptedAt: null,
      dataValues: dataValueSet.dataValues,
      generatedAt: new Date().toISOString(),
    }

    // Sandbox: return without submitting
    if (this.isSandbox) {
      console.log(`[DHIS2 SANDBOX] Report generated for period ${period}: ${dataValueSet.dataValues.length} data values`)
      report.status = 'submitted'
      report.submittedAt = new Date().toISOString()
      return { success: true, report }
    }

    // Production: Submit to DHIS2
    try {
      const response = await fetch(`${this.baseUrl}/api/dataValueSets`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          ...dataValueSet,
          dataSet: this.dataSetId,
        }),
      })

      const dhis2Response = await response.json()

      if (response.ok && dhis2Response.status === 'SUCCESS') {
        report.status = 'submitted'
        report.submittedAt = new Date().toISOString()

        addSimpleAuditEntry({
          action: 'DHIS2_REPORT_SUBMITTED',
          module: 'integrations',
          entity: 'DHIS2Report',
          description: `DHIS2 report submitted: period=${period}, orgUnit=${targetOrgUnit}, ${dataValueSet.dataValues.length} values`,
          severity: 'INFO',
        })

        return { success: true, report, dhis2Response }
      }

      report.status = 'rejected'
      addSimpleAuditEntry({
        action: 'DHIS2_REPORT_REJECTED',
        module: 'integrations',
        entity: 'DHIS2Report',
        description: `DHIS2 report rejected: ${JSON.stringify(dhis2Response.message || dhis2Response.response)}`,
        severity: 'WARNING',
      })

      return {
        success: false,
        report,
        dhis2Response,
        error: dhis2Response.message || 'DHIS2 rejected the report',
      }
    } catch (error) {
      console.error('[DHIS2] Report submission failed:', (error as Error).message)
      return {
        success: false,
        report,
        error: (error as Error).message,
      }
    }
  }

  /**
   * Get analytics data from DHIS2
   */
  async getAnalytics(params: {
    dataElements: string[]
    periods: string[]
    orgUnits: string[]
  }): Promise<any> {
    if (this.isSandbox) {
      // Return demo analytics
      return {
        headers: [
          { name: 'dx' }, { name: 'ou' }, { name: 'pe' }, { name: 'value' },
        ],
        rows: params.dataElements.flatMap(de =>
          params.periods.map(pe => [de, params.orgUnits[0] || 'OU-DONKA', pe, String(Math.floor(Math.random() * 500))])
        ),
      }
    }

    try {
      const dx = params.dataElements.join(';')
      const pe = params.periods.join(';')
      const ou = params.orgUnits.join(';')

      const response = await fetch(
        `${this.baseUrl}/api/analytics?dimension=dx:${dx}&dimension=pe:${pe}&dimension=ou:${ou}`,
        { method: 'GET', headers: this.getHeaders() }
      )

      return await response.json()
    } catch (error) {
      console.error('[DHIS2] Analytics query failed:', (error as Error).message)
      return { headers: [], rows: [] }
    }
  }

  /**
   * Pull mTrac alerts from DHIS2 (tracker program)
   */
  async getMTracAlerts(): Promise<any[]> {
    if (this.isSandbox) {
      return [
        {
          id: 'MTRAC-SANDBOX-001',
          disease: 'Choléra',
          location: 'Conakry, Matam',
          caseCount: 5,
          deathCount: 0,
          alertLevel: 'warning',
          reportedAt: new Date().toISOString(),
          status: 'investigating',
        },
      ]
    }

    try {
      const programId = process.env.DHIS2_MTRAC_PROGRAM_ID || ''
      if (!programId) return []

      const response = await fetch(
        `${this.baseUrl}/api/tracker/trackedEntities?program=${programId}&fields=*,enrollments[*]&paging=false`,
        { method: 'GET', headers: this.getHeaders() }
      )

      const data = await response.json()
      return (data.trackedEntities || []).map((entity: any) => {
        const enrollment = entity.enrollments?.[0]
        return {
          id: entity.trackedEntity,
          disease: enrollment?.attributes?.find((a: any) => a.attribute === 'MTRAC_DISEASE')?.value,
          location: enrollment?.orgUnitName,
          caseCount: parseInt(enrollment?.attributes?.find((a: any) => a.attribute === 'MTRAC_CASES')?.value || '0'),
          deathCount: parseInt(enrollment?.attributes?.find((a: any) => a.attribute === 'MTRAC_DEATHS')?.value || '0'),
          reportedAt: enrollment?.enrolledAt,
          status: enrollment?.status,
        }
      })
    } catch (error) {
      console.error('[DHIS2] mTrac alerts pull failed:', (error as Error).message)
      return []
    }
  }

  /**
   * Collect report data from the HealthFlow PostgreSQL database
   * Maps internal data to DHIS2 data elements
   */
  private async collectReportData(
    period: string,
    establishmentId?: string
  ): Promise<{
    consultations: number
    newPatients: number
    followUps: number
    malariaCases: number
    malariaSevere: number
    diarrheaCases: number
    respiratoryInfections: number
    hypertensionCases: number
    diabetesCases: number
    antenatalVisits: number
    deliveries: number
    emergencyCases: number
    labTests: number
    revenue: number
    mobileMoneyPayments: number
    orgUnitName?: string
  }> {
    try {
      // Parse period (format: YYYYMM for monthly)
      const year = parseInt(period.substring(0, 4))
      const month = parseInt(period.substring(4, 6))
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0, 23, 59, 59)

      const whereClause: any = {
        consultationDate: { gte: startDate, lte: endDate },
      }
      if (establishmentId) {
        whereClause.establishmentId = establishmentId
      }

      // Get establishment name
      let orgUnitName = 'All Establishments'
      if (establishmentId) {
        const est = await db.establishment.findUnique({ where: { id: establishmentId } })
        orgUnitName = est?.name || orgUnitName
      }

      // Consultation counts
      const consultationCount = await db.consultation.count({ where: whereClause })

      // New patients (registered in this period)
      const newPatientWhere: any = {
        createdAt: { gte: startDate, lte: endDate },
      }
      if (establishmentId) newPatientWhere.establishmentId = establishmentId
      const newPatientCount = await db.patient.count({ where: newPatientWhere })

      // Emergency cases
      const emergencyWhere: any = {
        arrivalDate: { gte: startDate, lte: endDate },
      }
      if (establishmentId) emergencyWhere.establishmentId = establishmentId
      const emergencyCount = await db.emergencyCase.count({ where: emergencyWhere })

      // Lab tests
      const labWhere: any = {
        requestedAt: { gte: startDate, lte: endDate },
      }
      const labTestCount = await db.labRequest.count({ where: labWhere })

      // Deliveries
      const deliveryWhere: any = {
        createdAt: { gte: startDate, lte: endDate },
      }
      const deliveryCount = await db.delivery.count({ where: deliveryWhere })

      // Pregnancy visits
      const visitWhere: any = {
        visitDate: { gte: startDate, lte: endDate },
      }
      const visitCount = await db.pregnancyVisit.count({ where: visitWhere })

      // Revenue from payments
      const revenueResult = await db.payment.aggregate({
        where: {
          status: 'COMPLETED',
          processedAt: { gte: startDate, lte: endDate },
          ...(establishmentId ? { invoice: { establishmentId } } : {}),
        },
        _sum: { amount: true },
      })

      // Mobile money payments
      const mmPaymentCount = await db.payment.count({
        where: {
          paymentMethod: 'MOBILE_MONEY',
          status: 'COMPLETED',
          processedAt: { gte: startDate, lte: endDate },
        },
      })

      // Diagnosis-based statistics (from consultations)
      const malariaConsultations = await db.consultation.count({
        where: {
          ...whereClause,
          diagnosis: { contains: 'paludisme', mode: 'insensitive' },
        },
      })

      const malariaSevereConsultations = await db.consultation.count({
        where: {
          ...whereClause,
          diagnosis: { contains: 'paludisme sévère', mode: 'insensitive' },
        },
      })

      const diarrheaConsultations = await db.consultation.count({
        where: {
          ...whereClause,
          diagnosis: { contains: 'diarrhée', mode: 'insensitive' },
        },
      })

      const respiratoryConsultations = await db.consultation.count({
        where: {
          ...whereClause,
          OR: [
            { diagnosis: { contains: 'IRA', mode: 'insensitive' } },
            { diagnosis: { contains: 'respiratoire', mode: 'insensitive' } },
            { diagnosis: { contains: 'pneumonie', mode: 'insensitive' } },
          ],
        },
      })

      const hypertensionConsultations = await db.consultation.count({
        where: {
          ...whereClause,
          diagnosis: { contains: 'hypertension', mode: 'insensitive' },
        },
      })

      const diabetesConsultations = await db.consultation.count({
        where: {
          ...whereClause,
          diagnosis: { contains: 'diabète', mode: 'insensitive' },
        },
      })

      return {
        consultations: consultationCount,
        newPatients: newPatientCount,
        followUps: consultationCount - newPatientCount,
        malariaCases: malariaConsultations,
        malariaSevere: malariaSevereConsultations,
        diarrheaCases: diarrheaConsultations,
        respiratoryInfections: respiratoryConsultations,
        hypertensionCases: hypertensionConsultations,
        diabetesCases: diabetesConsultations,
        antenatalVisits: visitCount,
        deliveries: deliveryCount,
        emergencyCases: emergencyCount,
        labTests: labTestCount,
        revenue: revenueResult._sum.amount ?? 0,
        mobileMoneyPayments: mmPaymentCount,
        orgUnitName,
      }
    } catch (error) {
      console.error('[DHIS2] Data collection failed:', (error as Error).message)
      return {
        consultations: 0, newPatients: 0, followUps: 0,
        malariaCases: 0, malariaSevere: 0, diarrheaCases: 0,
        respiratoryInfections: 0, hypertensionCases: 0, diabetesCases: 0,
        antenatalVisits: 0, deliveries: 0, emergencyCases: 0,
        labTests: 0, revenue: 0, mobileMoneyPayments: 0,
      }
    }
  }

  /**
   * Get sync status (records synced to/from DHIS2)
   */
  async getSyncStatus(): Promise<{
    lastSync: string | null
    recordsSynced: number
    recordsPending: number
    status: 'connected' | 'error' | 'disconnected'
  }> {
    const connTest = await this.testConnection()
    if (!connTest.connected) {
      return {
        lastSync: null,
        recordsSynced: 0,
        recordsPending: 0,
        status: 'disconnected',
      }
    }

    // Count recent sync operations from audit log
    try {
      const recentSyncs = await db.auditLog.count({
        where: {
          module: 'integrations',
          action: { contains: 'DHIS2' },
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      })

      const lastSyncEntry = await db.auditLog.findFirst({
        where: {
          module: 'integrations',
          action: 'DHIS2_REPORT_SUBMITTED',
        },
        orderBy: { createdAt: 'desc' },
      })

      return {
        lastSync: lastSyncEntry?.createdAt?.toISOString() || null,
        recordsSynced: recentSyncs,
        recordsPending: 0,
        status: 'connected',
      }
    } catch {
      return {
        lastSync: null,
        recordsSynced: 0,
        recordsPending: 0,
        status: this.isSandbox ? 'connected' : 'disconnected',
      }
    }
  }
}

export const dhis2Service = new DHIS2Service()
