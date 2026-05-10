/**
 * Unified Messaging Service — HealthFlow Africa
 * SMS (Twilio-compatible) and WhatsApp Business API
 * Demo/Sandbox mode with rate limiting
 */

import type { MessageChannel, MessageStatus } from '@/lib/data-store'

/* ─────────── Types ─────────── */

export interface SMSRequest {
  to: string
  message: string
  recipientName?: string
}

export interface BulkSMSRequest {
  recipients: { phone: string; name?: string }[]
  message: string
}

export interface WhatsAppRequest {
  to: string
  templateId: string
  params: Record<string, string>
  recipientName?: string
}

export interface MessageResponse {
  success: boolean
  messageId: string
  channel: MessageChannel
  status: MessageStatus
  message: string
  errorMessage?: string
}

/* ─────────── Rate Limiter ─────────── */

class RateLimiter {
  private smsCount = 0
  private whatsappCount = 0
  private windowStart = Date.now()
  private readonly SMS_LIMIT = 100
  private readonly WHATSAPP_LIMIT = 50
  private readonly WINDOW_MS = 60 * 60 * 1000 // 1 hour

  canSendSMS(): boolean {
    this.resetIfNeeded()
    return this.smsCount < this.SMS_LIMIT
  }

  canSendWhatsApp(): boolean {
    this.resetIfNeeded()
    return this.whatsappCount < this.WHATSAPP_LIMIT
  }

  recordSMS(): void {
    this.resetIfNeeded()
    this.smsCount++
  }

  recordWhatsApp(): void {
    this.resetIfNeeded()
    this.whatsappCount++
  }

  getSMSRemaining(): number {
    this.resetIfNeeded()
    return Math.max(0, this.SMS_LIMIT - this.smsCount)
  }

  getWhatsAppRemaining(): number {
    this.resetIfNeeded()
    return Math.max(0, this.WHATSAPP_LIMIT - this.whatsappCount)
  }

  private resetIfNeeded(): void {
    if (Date.now() - this.windowStart > this.WINDOW_MS) {
      this.smsCount = 0
      this.whatsappCount = 0
      this.windowStart = Date.now()
    }
  }
}

export const rateLimiter = new RateLimiter()

/* ─────────── SMS Service (Demo) ─────────── */

class SMSService {
  async sendSMS(request: SMSRequest): Promise<MessageResponse> {
    if (!rateLimiter.canSendSMS()) {
      return {
        success: false,
        messageId: '',
        channel: 'SMS',
        status: 'Échoué',
        message: 'Limite de SMS atteinte (100/heure). Réessayez plus tard.',
        errorMessage: 'Rate limit exceeded',
      }
    }

    // Simulate API call
    await this.delay(800 + Math.random() * 700)

    const success = Math.random() > 0.08 // 92% success rate
    rateLimiter.recordSMS()

    return {
      success,
      messageId: `SMS-${Date.now()}-${Math.floor(Math.random() * 99)}`,
      channel: 'SMS',
      status: success ? 'Envoyé' : 'Échoué',
      message: success
        ? `SMS envoyé à ${request.to}`
        : 'Échec de l\'envoi SMS. Veuillez réessayer.',
      errorMessage: success ? undefined : 'Numéro injoignable',
    }
  }

  async sendBulkSMS(request: BulkSMSRequest): Promise<MessageResponse[]> {
    const results: MessageResponse[] = []
    for (const recipient of request.recipients) {
      const result = await this.sendSMS({
        to: recipient.phone,
        message: request.message,
        recipientName: recipient.name,
      })
      results.push(result)
    }
    return results
  }

  async sendOTP(to: string, code: string): Promise<MessageResponse> {
    return this.sendSMS({
      to,
      message: `Votre code de vérification HealthFlow est : ${code}. Ce code expire dans 5 minutes.`,
    })
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

/* ─────────── WhatsApp Business API (Demo) ─────────── */

class WhatsAppBusinessAPI {
  async sendTemplateMessage(request: WhatsAppRequest): Promise<MessageResponse> {
    if (!rateLimiter.canSendWhatsApp()) {
      return {
        success: false,
        messageId: '',
        channel: 'WhatsApp',
        status: 'Échoué',
        message: 'Limite WhatsApp atteinte (50/heure). Réessayez plus tard.',
        errorMessage: 'Rate limit exceeded',
      }
    }

    await this.delay(600 + Math.random() * 600)

    const success = Math.random() > 0.05 // 95% success rate
    rateLimiter.recordWhatsApp()

    // Build message from template
    const message = this.fillTemplate(request.templateId, request.params)

    return {
      success,
      messageId: `WA-${Date.now()}-${Math.floor(Math.random() * 99)}`,
      channel: 'WhatsApp',
      status: success ? 'Délivré' : 'Échoué',
      message: success
        ? `WhatsApp envoyé à ${request.to}`
        : 'Échec de l\'envoi WhatsApp.',
      errorMessage: success ? undefined : 'Contact non inscrit sur WhatsApp',
    }
  }

  async sendAppointmentReminder(to: string, params: {
    date: string; time: string; doctor: string; facility: string
  }): Promise<MessageResponse> {
    return this.sendTemplateMessage({
      to,
      templateId: 'appointment_reminder',
      params,
    })
  }

  async sendLabResultNotification(to: string, params: {
    patientName: string
  }): Promise<MessageResponse> {
    return this.sendTemplateMessage({
      to,
      templateId: 'lab_result',
      params,
    })
  }

  private fillTemplate(templateId: string, params: Record<string, string>): string {
    const templates: Record<string, string> = {
      appointment_reminder: `Rappel : Vous avez un rendez-vous le {date} à {time} avec Dr. {doctor} à {facility}. HealthFlow Africa`,
      lab_result: `Vos résultats d'analyse sont disponibles. Connectez-vous à votre espace patient pour les consulter. HealthFlow Africa`,
      vaccination_reminder: `Rappel vaccination : {child_name} doit recevoir le vaccin {vaccine} le {date}. HealthFlow Africa`,
      payment_confirmation: `Paiement de {amount} GNF reçu pour la facture #{invoice}. Merci ! HealthFlow Africa`,
      emergency_alert: `ALERTE : {message}. Contactez immédiatement votre centre de santé. HealthFlow Africa`,
      prescription_reminder: `Rappel : N'oubliez pas de prendre votre médicament {medication} à {time}. HealthFlow Africa`,
    }

    let template = templates[templateId] || templateId
    for (const [key, value] of Object.entries(params)) {
      template = template.replace(`{${key}}`, value)
    }
    return template
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

/* ─────────── Message Queue ─────────── */

interface QueuedMessage {
  id: string
  channel: MessageChannel
  request: SMSRequest | WhatsAppRequest
  attempts: number
  maxAttempts: number
  nextAttempt: Date
}

class MessageQueue {
  private queue: QueuedMessage[] = []

  enqueue(channel: MessageChannel, request: SMSRequest | WhatsAppRequest): string {
    const id = `Q-${Date.now()}-${Math.floor(Math.random() * 99)}`
    this.queue.push({
      id,
      channel,
      request,
      attempts: 0,
      maxAttempts: 3,
      nextAttempt: new Date(),
    })
    return id
  }

  dequeue(): QueuedMessage | undefined {
    const now = new Date()
    const idx = this.queue.findIndex(m => m.nextAttempt <= now && m.attempts < m.maxAttempts)
    if (idx === -1) return undefined
    return this.queue.splice(idx, 1)[0]
  }

  requeue(message: QueuedMessage): void {
    message.attempts++
    message.nextAttempt = new Date(Date.now() + Math.pow(2, message.attempts) * 5000)
    if (message.attempts < message.maxAttempts) {
      this.queue.push(message)
    }
  }

  get pending(): number {
    return this.queue.length
  }
}

/* ─────────── Unified Messaging Service ─────────── */

class MessagingService {
  private sms = new SMSService()
  private whatsapp = new WhatsAppBusinessAPI()
  private queue = new MessageQueue()

  async sendSMS(request: SMSRequest): Promise<MessageResponse> {
    return this.sms.sendSMS(request)
  }

  async sendBulkSMS(request: BulkSMSRequest): Promise<MessageResponse[]> {
    return this.sms.sendBulkSMS(request)
  }

  async sendOTP(to: string, code: string): Promise<MessageResponse> {
    return this.sms.sendOTP(to, code)
  }

  async sendWhatsApp(request: WhatsAppRequest): Promise<MessageResponse> {
    return this.whatsapp.sendTemplateMessage(request)
  }

  async sendAppointmentReminder(to: string, params: {
    date: string; time: string; doctor: string; facility: string
  }, channel: MessageChannel = 'WhatsApp'): Promise<MessageResponse> {
    if (channel === 'WhatsApp') {
      return this.whatsapp.sendAppointmentReminder(to, params)
    }
    return this.sms.sendSMS({
      to,
      message: `Rappel : Vous avez un rendez-vous le ${params.date} à ${params.time} avec Dr. ${params.doctor} à ${params.facility}. HealthFlow Africa`,
    })
  }

  async sendLabResultNotification(to: string, patientName: string, channel: MessageChannel = 'WhatsApp'): Promise<MessageResponse> {
    if (channel === 'WhatsApp') {
      return this.whatsapp.sendLabResultNotification(to, { patientName })
    }
    return this.sms.sendSMS({
      to,
      message: `Vos résultats d'analyse sont disponibles. Connectez-vous à votre espace patient pour les consulter. HealthFlow Africa`,
    })
  }

  async sendPaymentConfirmation(to: string, amount: number, invoiceId: string, channel: MessageChannel = 'SMS'): Promise<MessageResponse> {
    const message = `Paiement de ${amount.toLocaleString()} GNF reçu pour la facture #${invoiceId}. Merci ! HealthFlow Africa`
    if (channel === 'WhatsApp') {
      return this.whatsapp.sendTemplateMessage({
        to,
        templateId: 'payment_confirmation',
        params: { amount: amount.toLocaleString(), invoice: invoiceId },
      })
    }
    return this.sms.sendSMS({ to, message })
  }

  queueMessage(channel: MessageChannel, request: SMSRequest | WhatsAppRequest): string {
    return this.queue.enqueue(channel, request)
  }

  getQueueSize(): number {
    return this.queue.pending
  }

  getRateLimits(): { smsRemaining: number; whatsappRemaining: number } {
    return {
      smsRemaining: rateLimiter.getSMSRemaining(),
      whatsappRemaining: rateLimiter.getWhatsAppRemaining(),
    }
  }
}

export const messagingService = new MessagingService()
export { SMSService, WhatsAppBusinessAPI, MessageQueue }
