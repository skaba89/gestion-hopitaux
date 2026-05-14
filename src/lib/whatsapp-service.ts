/**
 * HealthFlow Guinea - WhatsApp Business API Integration
 * Uses Twilio WhatsApp Business API for patient notifications
 * Docs: https://www.twilio.com/docs/whatsapp
 *
 * Also supports direct Meta WhatsApp Business API:
 * https://developers.facebook.com/docs/whatsapp/cloud-api
 */

import { addSimpleAuditEntry } from '@/lib/audit-logger'

export interface WhatsAppMessage {
  to: string
  templateName: string
  templateParams: Record<string, string>
  language?: string
}

export interface WhatsAppTemplate {
  name: string
  language: string
  category: 'AUTHENTICATION' | 'MARKETING' | 'UTILITY'
  body: string
  parameters: string[]
}

/**
 * Pre-approved WhatsApp message templates for HealthFlow Guinea
 * These must be registered in Meta Business Manager / Twilio
 */
export const WHATSAPP_TEMPLATES: Record<string, WhatsAppTemplate> = {
  appointment_reminder: {
    name: 'appointment_reminder',
    language: 'fr',
    category: 'UTILITY',
    body: 'HealthFlow: Bonjour {{1}}, rappel de votre rendez-vous le {{2}} à {{3}} avec Dr. {{4}} à {{5}}. Répondez OUI pour confirmer ou NON pour annuler.',
    parameters: ['patientName', 'date', 'time', 'doctorName', 'hospital'],
  },
  lab_results: {
    name: 'lab_results',
    language: 'fr',
    category: 'UTILITY',
    body: 'HealthFlow: {{1}}, vos résultats d\'analyses du {{2}} sont disponibles. Connectez-vous à votre portail patient pour les consulter: {{3}}',
    parameters: ['patientName', 'date', 'portalUrl'],
  },
  vaccination_reminder: {
    name: 'vaccination_reminder',
    language: 'fr',
    category: 'UTILITY',
    body: 'HealthFlow: Bonjour {{1}}, rappel de vaccination pour {{2}} prévue le {{3}} à {{4}}. Veuillez apporter le carnet de vaccination.',
    parameters: ['parentName', 'childName', 'date', 'hospital'],
  },
  payment_confirmation: {
    name: 'payment_confirmation',
    language: 'fr',
    category: 'UTILITY',
    body: 'HealthFlow: Paiement de {{1}} GNF reçu pour la facture #{{2}}. Référence: {{3}}. Merci!',
    parameters: ['amount', 'invoiceNumber', 'reference'],
  },
  emergency_alert: {
    name: 'emergency_alert',
    language: 'fr',
    category: 'UTILITY',
    body: 'HealthFlow ALERTE: {{1}}. {{2}}. Suivez les instructions du personnel médical. Numéro d\'urgence: 115',
    parameters: ['alertType', 'instructions'],
  },
  prescription_ready: {
    name: 'prescription_ready',
    language: 'fr',
    category: 'UTILITY',
    body: 'HealthFlow: {{1}}, votre ordonnance du {{2}} est prête à la pharmacie de {{3}}. Présentez votre carte patient.',
    parameters: ['patientName', 'date', 'hospital'],
  },
  otp_verification: {
    name: 'otp_verification',
    language: 'fr',
    category: 'AUTHENTICATION',
    body: '{{1}} est votre code de vérification HealthFlow. Ne le partagez avec personne. Valide {{2}} minutes.',
    parameters: ['otpCode', 'validityMinutes'],
  },
}

class WhatsAppService {
  private provider: 'twilio' | 'meta' | 'demo'
  private twilioAccountSid: string
  private twilioAuthToken: string
  private twilioPhoneNumber: string
  private metaAccessToken: string
  private metaPhoneNumberId: string
  private isConfigured: boolean

  constructor() {
    this.provider = (process.env.WHATSAPP_PROVIDER as 'twilio' | 'meta' | 'demo') || 'demo'
    this.twilioAccountSid = process.env.TWILIO_ACCOUNT_SID || ''
    this.twilioAuthToken = process.env.TWILIO_AUTH_TOKEN || ''
    this.twilioPhoneNumber = process.env.TWILIO_WHATSAPP_NUMBER || ''
    this.metaAccessToken = process.env.META_WHATSAPP_TOKEN || ''
    this.metaPhoneNumberId = process.env.META_WHATSAPP_PHONE_ID || ''
    this.isConfigured = this.provider === 'demo' ||
      (this.provider === 'twilio' && !!this.twilioAccountSid && !!this.twilioAuthToken) ||
      (this.provider === 'meta' && !!this.metaAccessToken && !!this.metaPhoneNumberId)
  }

  /**
   * Send a WhatsApp message using a template
   */
  async sendTemplateMessage(message: WhatsAppMessage): Promise<{
    success: boolean
    messageId?: string
    error?: string
  }> {
    if (!this.isConfigured) {
      console.log(`[WhatsApp DEMO] Template "${message.templateName}" to ${message.to.slice(-4).padStart(message.to.length, '*')}`)
      return { success: true, messageId: `demo-wa-${Date.now()}` }
    }

    switch (this.provider) {
      case 'twilio':
        return this.sendViaTwilio(message)
      case 'meta':
        return this.sendViaMeta(message)
      default:
        return { success: false, error: 'Unknown WhatsApp provider' }
    }
  }

  /**
   * Send appointment reminder
   */
  async sendAppointmentReminder(
    phone: string,
    patientName: string,
    date: string,
    time: string,
    doctorName: string,
    hospital: string
  ): Promise<{ success: boolean; messageId?: string }> {
    const result = await this.sendTemplateMessage({
      to: phone,
      templateName: 'appointment_reminder',
      templateParams: { patientName, date, time, doctorName, hospital },
    })

    if (result.success) {
      addSimpleAuditEntry({
        action: 'WHATSAPP_APPOINTMENT_REMINDER',
        module: 'messaging',
        entity: 'WhatsApp',
        description: `Appointment reminder sent to ${phone.slice(-4).padStart(phone.length, '*')}`,
        severity: 'INFO',
      })
    }

    return result
  }

  /**
   * Send lab results notification
   */
  async sendLabResultsNotification(
    phone: string,
    patientName: string,
    date: string,
    portalUrl: string
  ): Promise<{ success: boolean; messageId?: string }> {
    return this.sendTemplateMessage({
      to: phone,
      templateName: 'lab_results',
      templateParams: { patientName, date, portalUrl },
    })
  }

  /**
   * Send OTP via WhatsApp
   */
  async sendOTP(
    phone: string,
    otpCode: string,
    validityMinutes: number = 5
  ): Promise<{ success: boolean; messageId?: string }> {
    return this.sendTemplateMessage({
      to: phone,
      templateName: 'otp_verification',
      templateParams: { otpCode, validityMinutes: String(validityMinutes) },
    })
  }

  /**
   * Send payment confirmation
   */
  async sendPaymentConfirmation(
    phone: string,
    amount: string,
    invoiceNumber: string,
    reference: string
  ): Promise<{ success: boolean; messageId?: string }> {
    return this.sendTemplateMessage({
      to: phone,
      templateName: 'payment_confirmation',
      templateParams: { amount, invoiceNumber, reference },
    })
  }

  /**
   * Send vaccination reminder
   */
  async sendVaccinationReminder(
    phone: string,
    parentName: string,
    childName: string,
    date: string,
    hospital: string
  ): Promise<{ success: boolean; messageId?: string }> {
    return this.sendTemplateMessage({
      to: phone,
      templateName: 'vaccination_reminder',
      templateParams: { parentName, childName, date, hospital },
    })
  }

  // ──────── Private: Twilio WhatsApp API ────────

  private async sendViaTwilio(message: WhatsAppMessage): Promise<{
    success: boolean
    messageId?: string
    error?: string
  }> {
    try {
      const template = WHATSAPP_TEMPLATES[message.templateName]
      if (!template) {
        return { success: false, error: `Template "${message.templateName}" not found` }
      }

      // Build content variables for Twilio
      const contentVariables: Record<number, string> = {}
      template.parameters.forEach((param, index) => {
        contentVariables[index + 1] = message.templateParams[param] || ''
      })

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${this.twilioAccountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + Buffer.from(`${this.twilioAccountSid}:${this.twilioAuthToken}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: `whatsapp:${message.to}`,
            From: `whatsapp:${this.twilioPhoneNumber}`,
            ContentSid: template.name,
            ContentVariables: JSON.stringify(contentVariables),
          }),
        }
      )

      if (response.ok) {
        const data = await response.json()
        return { success: true, messageId: data.sid }
      }

      const errorData = await response.json()
      return { success: false, error: errorData.message || `HTTP ${response.status}` }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  // ──────── Private: Meta WhatsApp Cloud API ────────

  private async sendViaMeta(message: WhatsAppMessage): Promise<{
    success: boolean
    messageId?: string
    error?: string
  }> {
    try {
      const template = WHATSAPP_TEMPLATES[message.templateName]
      if (!template) {
        return { success: false, error: `Template "${message.templateName}" not found` }
      }

      // Build template components for Meta API
      const components = [{
        type: 'body',
        parameters: template.parameters.map(param => ({
          type: 'text',
          text: message.templateParams[param] || '',
        })),
      }]

      const response = await fetch(
        `https://graph.facebook.com/v18.0/${this.metaPhoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.metaAccessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: message.to.replace('+', ''),
            type: 'template',
            template: {
              name: template.name,
              language: { code: message.language || template.language },
              components,
            },
          }),
        }
      )

      if (response.ok) {
        const data = await response.json()
        return { success: true, messageId: data.messages?.[0]?.id }
      }

      const errorData = await response.json()
      return {
        success: false,
        error: errorData.error?.message || `HTTP ${response.status}`,
      }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }
}

export const whatsappService = new WhatsAppService()
