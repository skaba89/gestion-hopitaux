// HealthFlow Africa - FHIR Subscriptions & Webhook System
// Real-time notifications for FHIR resource changes

/* ─────────── Subscription Types ─────────── */

export type SubscriptionChannel = 'rest-hook' | 'websocket' | 'email' | 'sms' | 'message'
export type SubscriptionStatus = 'active' | 'requested' | 'off' | 'error' | 'entered-in-error'
export type EventType = 'create' | 'update' | 'delete' | 'transition'

export interface FHIRSubscription {
  id: string
  name: string
  criteria: string // FHIR search criteria, e.g., "Patient?name=Diallo"
  resourceType: string
  channel: SubscriptionChannel
  endpoint: string
  status: SubscriptionStatus
  reason: string
  eventType: EventType[]
  headers: string[]
  payload: 'application/fhir+json' | 'application/json' | 'text/plain'
  maxRetries: number
  timeoutSeconds: number
  createdAt: string
  createdBy: string
  lastTriggeredAt: string | null
  triggerCount: number
  failureCount: number
  lastError: string | null
  tags: string[]
}

export interface SubscriptionEvent {
  id: string
  subscriptionId: string
  subscriptionName: string
  eventType: EventType
  resourceType: string
  resourceId: string
  patientId: string | null
  patientName: string | null
  timestamp: string
  status: 'delivered' | 'failed' | 'retrying' | 'pending'
  deliveryAttempts: number
  lastAttemptAt: string | null
  responseCode: number | null
  responseTimeMs: number | null
  error: string | null
  payloadSnapshot: string
}

export interface WebhookConfig {
  id: string
  name: string
  url: string
  secret: string
  events: EventType[]
  isActive: boolean
  createdAt: string
  lastPingAt: string | null
  pingStatus: 'success' | 'failure' | 'never'
}

export interface SubscriptionMetrics {
  totalSubscriptions: number
  activeSubscriptions: number
  totalEvents: number
  successfulDeliveries: number
  failedDeliveries: number
  averageDeliveryTime: string
  eventsByType: Record<EventType, number>
  eventsByResource: Record<string, number>
  topTriggeredSubscriptions: { name: string; count: number }[]
}

/* ─────────── Subscription Service ─────────── */

class FHIRSubscriptionService {
  private subscriptions: FHIRSubscription[] = []
  private events: SubscriptionEvent[] = []
  private webhooks: WebhookConfig[] = []

  constructor() {
    this.initializeDemoData()
  }

  private initializeDemoData() {
    this.subscriptions = [
      {
        id: 'SUB-001',
        name: 'Alerte Nouveau Patient Donka',
        criteria: 'Patient?organization=hf-org-donka',
        resourceType: 'Patient',
        channel: 'rest-hook',
        endpoint: 'https://ignace-deen.healthflow-gn.com/webhooks/patient-created',
        status: 'active',
        reason: 'Notification automatique lors de l\'enregistrement d\'un nouveau patient à Donka vers Ignace Deen',
        eventType: ['create'],
        headers: ['Authorization: Bearer ***', 'X-HealthFlow-Event: patient-created'],
        payload: 'application/fhir+json',
        maxRetries: 3,
        timeoutSeconds: 30,
        createdAt: '2026-01-15',
        createdBy: 'Admin System',
        lastTriggeredAt: '2026-05-10T22:30:00Z',
        triggerCount: 245,
        failureCount: 3,
        lastError: null,
        tags: ['hie', 'patient', 'donka'],
      },
      {
        id: 'SUB-002',
        name: 'Notification Urgences',
        criteria: 'Encounter?class=EMER&status=in-progress',
        resourceType: 'Encounter',
        channel: 'sms',
        endpoint: '+224622000000',
        status: 'active',
        reason: 'SMS au médecin de garde lors d\'une admission aux urgences',
        eventType: ['create'],
        headers: [],
        payload: 'text/plain',
        maxRetries: 2,
        timeoutSeconds: 10,
        createdAt: '2026-02-01',
        createdBy: 'Dr. Keita',
        lastTriggeredAt: '2026-05-10T22:30:00Z',
        triggerCount: 89,
        failureCount: 1,
        lastError: null,
        tags: ['urgence', 'sms'],
      },
      {
        id: 'SUB-003',
        name: 'Alerte mTrac Maladies Notifiables',
        criteria: 'Observation?category=epidemiological',
        resourceType: 'Observation',
        channel: 'rest-hook',
        endpoint: 'https://mtrac.healthflow-gn.com/api/alerts',
        status: 'active',
        reason: 'Envoi automatique des observations épidémiologiques vers mTrac pour les maladies à déclaration obligatoire',
        eventType: ['create'],
        headers: ['Authorization: Bearer ***', 'X-mTrac-Source: healthflow'],
        payload: 'application/fhir+json',
        maxRetries: 5,
        timeoutSeconds: 15,
        createdAt: '2026-01-01',
        createdBy: 'DNS Guinea',
        lastTriggeredAt: '2026-05-09T12:00:00Z',
        triggerCount: 567,
        failureCount: 2,
        lastError: null,
        tags: ['mtrac', 'epidemiologie', 'national'],
      },
      {
        id: 'SUB-004',
        name: 'DHIS2 Sync — Rapport Mensuel',
        criteria: 'MeasureReport?period=monthly',
        resourceType: 'MeasureReport',
        channel: 'rest-hook',
        endpoint: 'https://dhis2.healthflow-gn.com/api/dataValueSets',
        status: 'active',
        reason: 'Synchronisation automatique des rapports mensuels vers DHIS2 Guinea',
        eventType: ['create', 'update'],
        headers: ['Authorization: Basic ***'],
        payload: 'application/json',
        maxRetries: 5,
        timeoutSeconds: 60,
        createdAt: '2025-12-01',
        createdBy: 'SNIS Admin',
        lastTriggeredAt: '2026-05-01T00:00:00Z',
        triggerCount: 12,
        failureCount: 0,
        lastError: null,
        tags: ['dhis2', 'rapport', 'national'],
      },
      {
        id: 'SUB-005',
        name: 'Mise à jour Dossier Patient HIE',
        criteria: 'Patient?_lastUpdated=gt2026-05-01',
        resourceType: 'Patient',
        channel: 'rest-hook',
        endpoint: 'https://hie.healthflow-gn.com/webhooks/patient-update',
        status: 'active',
        reason: 'Propagation des mises à jour patient via HIE vers les établissements connectés',
        eventType: ['update'],
        headers: ['Authorization: Bearer ***', 'X-HIE-Event: patient-updated'],
        payload: 'application/fhir+json',
        maxRetries: 3,
        timeoutSeconds: 30,
        createdAt: '2026-03-01',
        createdBy: 'HIE Admin',
        lastTriggeredAt: '2026-05-10T08:00:00Z',
        triggerCount: 156,
        failureCount: 5,
        lastError: 'Timeout HIE gateway — file d\'attente',
        tags: ['hie', 'patient', 'update'],
      },
    ]

    this.events = [
      {
        id: 'EVT-001',
        subscriptionId: 'SUB-001',
        subscriptionName: 'Alerte Nouveau Patient Donka',
        eventType: 'create',
        resourceType: 'Patient',
        resourceId: 'hf-patient-P-2024-010',
        patientId: 'P-2024-010',
        patientName: 'Ousmane Camara',
        timestamp: '2026-05-10T22:30:00Z',
        status: 'delivered',
        deliveryAttempts: 1,
        lastAttemptAt: '2026-05-10T22:30:01Z',
        responseCode: 200,
        responseTimeMs: 145,
        error: null,
        payloadSnapshot: '{"resourceType":"Patient","id":"hf-patient-P-2024-010",...}',
      },
      {
        id: 'EVT-002',
        subscriptionId: 'SUB-002',
        subscriptionName: 'Notification Urgences',
        eventType: 'create',
        resourceType: 'Encounter',
        resourceId: 'hf-encounter-adt-ADT-005',
        patientId: 'P-2024-010',
        patientName: 'Ousmane Camara',
        timestamp: '2026-05-10T22:30:00Z',
        status: 'delivered',
        deliveryAttempts: 1,
        lastAttemptAt: '2026-05-10T22:30:05Z',
        responseCode: 200,
        responseTimeMs: 3200,
        error: null,
        payloadSnapshot: 'SMS: AVC ischémique — Patient Ousmane Camara admis aux urgences',
      },
      {
        id: 'EVT-003',
        subscriptionId: 'SUB-003',
        subscriptionName: 'Alerte mTrac Maladies Notifiables',
        eventType: 'create',
        resourceType: 'Observation',
        resourceId: 'hf-obs-cholera-001',
        patientId: null,
        patientName: null,
        timestamp: '2026-05-09T12:00:00Z',
        status: 'delivered',
        deliveryAttempts: 1,
        lastAttemptAt: '2026-05-09T12:00:02Z',
        responseCode: 201,
        responseTimeMs: 2100,
        error: null,
        payloadSnapshot: '{"resourceType":"Observation","code":{"text":"Choléra alert"},...}',
      },
      {
        id: 'EVT-004',
        subscriptionId: 'SUB-005',
        subscriptionName: 'Mise à jour Dossier Patient HIE',
        eventType: 'update',
        resourceType: 'Patient',
        resourceId: 'hf-patient-P-2024-001',
        patientId: 'P-2024-001',
        patientName: 'Aminata Diallo',
        timestamp: '2026-05-10T08:00:00Z',
        status: 'failed',
        deliveryAttempts: 3,
        lastAttemptAt: '2026-05-10T08:00:30Z',
        responseCode: 504,
        responseTimeMs: 30000,
        error: 'Gateway timeout — retry scheduled',
        payloadSnapshot: '{"resourceType":"Patient","id":"hf-patient-P-2024-001",...}',
      },
    ]

    this.webhooks = [
      {
        id: 'WH-001',
        name: 'Ignace Deen Integration',
        url: 'https://ignace-deen.healthflow-gn.com/webhooks/healthflow',
        secret: 'whsec_***',
        events: ['create', 'update'],
        isActive: true,
        createdAt: '2026-01-15',
        lastPingAt: new Date().toISOString(),
        pingStatus: 'success',
      },
      {
        id: 'WH-002',
        name: 'mTrac Webhook',
        url: 'https://mtrac.healthflow-gn.com/webhooks/healthflow',
        secret: 'whsec_***',
        events: ['create'],
        isActive: true,
        createdAt: '2026-01-01',
        lastPingAt: new Date(Date.now() - 600000).toISOString(),
        pingStatus: 'success',
      },
      {
        id: 'WH-003',
        name: 'DHIS2 Data Push',
        url: 'https://dhis2.healthflow-gn.com/webhooks/healthflow',
        secret: 'whsec_***',
        events: ['create', 'update'],
        isActive: true,
        createdAt: '2025-12-01',
        lastPingAt: new Date(Date.now() - 1800000).toISOString(),
        pingStatus: 'success',
      },
    ]
  }

  getSubscriptions(): FHIRSubscription[] {
    return this.subscriptions
  }

  getEvents(limit: number = 50): SubscriptionEvent[] {
    return this.events.slice(0, limit)
  }

  getWebhooks(): WebhookConfig[] {
    return this.webhooks
  }

  getMetrics(): SubscriptionMetrics {
    const totalSubscriptions = this.subscriptions.length
    const activeSubscriptions = this.subscriptions.filter((s) => s.status === 'active').length
    const totalEvents = this.events.length
    const successfulDeliveries = this.events.filter((e) => e.status === 'delivered').length
    const failedDeliveries = this.events.filter((e) => e.status === 'failed').length

    const eventsByType: Record<EventType, number> = { create: 0, update: 0, delete: 0, transition: 0 }
    const eventsByResource: Record<string, number> = {}

    this.events.forEach((e) => {
      eventsByType[e.eventType]++
      eventsByResource[e.resourceType] = (eventsByResource[e.resourceType] || 0) + 1
    })

    const topTriggered = this.subscriptions
      .sort((a, b) => b.triggerCount - a.triggerCount)
      .slice(0, 5)
      .map((s) => ({ name: s.name, count: s.triggerCount }))

    return {
      totalSubscriptions,
      activeSubscriptions,
      totalEvents,
      successfulDeliveries,
      failedDeliveries,
      averageDeliveryTime: '1.8 sec',
      eventsByType,
      eventsByResource,
      topTriggeredSubscriptions: topTriggered,
    }
  }
}

export const subscriptionService = new FHIRSubscriptionService()
