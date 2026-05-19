// ============================================================================
// HealthFlow Guinea - Unified SMS Provider
// Supports: Orange SMS API, Twilio, Vonage, Telegram (FREE), WhatsApp (Twilio), Demo mode
// ============================================================================

export interface SMSResult {
  success: boolean
  messageId?: string
  provider: string
  cost?: number
  error?: string
}

export interface SMSProvider {
  name: string
  send(phone: string, message: string): Promise<SMSResult>
}

/**
 * Normalize Guinea phone number to international format +224XXXXXXXX
 */
export function normalizeGuineaPhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, '')
  if (cleaned.startsWith('+224')) return cleaned
  if (cleaned.startsWith('224')) return `+${cleaned}`
  if (cleaned.startsWith('0')) return `+224${cleaned.substring(1)}`
  return `+224${cleaned}`
}

// ============================================================================
// Orange SMS API — Primary provider for Guinea
// https://developer.orange.com/apis/sms-guinee/api-reference
// ============================================================================

class OrangeSMSProvider implements SMSProvider {
  name = 'orange'
  private token: string
  private senderAddress: string

  constructor() {
    this.token = process.env.ORANGE_SMS_TOKEN || ''
    this.senderAddress = process.env.ORANGE_SMS_SENDER || 'tel:+224000'
    if (!this.token) {
      console.warn('[SMS] ORANGE_SMS_TOKEN not configured')
    }
  }

  async send(phone: string, message: string): Promise<SMSResult> {
    if (!this.token) {
      return { success: false, provider: this.name, error: 'ORANGE_SMS_TOKEN not configured' }
    }

    const normalizedPhone = normalizeGuineaPhone(phone)
    const recipientAddress = `tel:${normalizedPhone}`

    try {
      const response = await fetch(
        'https://api.orange.com/smsmessaging/v1/outbound/' +
        encodeURIComponent(this.senderAddress) + '/requests',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            outboundSMSMessageRequest: {
              address: recipientAddress,
              senderAddress: this.senderAddress,
              outboundSMSTextMessage: { message },
            },
          }),
        }
      )

      if (response.ok) {
        const data = await response.json()
        return {
          success: true,
          provider: this.name,
          messageId: data.outboundSMSMessageRequest?.resourceURL?.split('/').pop(),
          cost: 0.04, // ~40 GNF per SMS in Guinea
        }
      }

      const errorText = await response.text()
      console.error('[SMS] Orange API error:', response.status, errorText)
      return { success: false, provider: this.name, error: `HTTP ${response.status}` }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error'
      console.error('[SMS] Orange SMS failed:', msg)
      return { success: false, provider: this.name, error: msg }
    }
  }
}

// ============================================================================
// Twilio SMS — International fallback
// ============================================================================

class TwilioSMSProvider implements SMSProvider {
  name = 'twilio'
  private accountSid: string
  private authToken: string
  private fromNumber: string

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || ''
    this.authToken = process.env.TWILIO_AUTH_TOKEN || ''
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || ''
    if (!this.accountSid || !this.authToken) {
      console.warn('[SMS] Twilio credentials not configured')
    }
  }

  async send(phone: string, message: string): Promise<SMSResult> {
    if (!this.accountSid || !this.authToken || !this.fromNumber) {
      return { success: false, provider: this.name, error: 'Twilio credentials not configured' }
    }

    try {
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: normalizeGuineaPhone(phone),
            From: this.fromNumber,
            Body: message,
          }),
        }
      )

      if (response.ok) {
        const data = await response.json()
        return {
          success: true,
          provider: this.name,
          messageId: data.sid,
          cost: 0.05, // ~$0.05 per SMS to Guinea
        }
      }

      const errorText = await response.text()
      console.error('[SMS] Twilio API error:', response.status, errorText)
      return { success: false, provider: this.name, error: `HTTP ${response.status}` }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error'
      console.error('[SMS] Twilio SMS failed:', msg)
      return { success: false, provider: this.name, error: msg }
    }
  }
}

// ============================================================================
// Vonage (Nexmo) SMS — Alternative international provider
// ============================================================================

class VonageSMSProvider implements SMSProvider {
  name = 'vonage'
  private apiKey: string
  private apiSecret: string
  private fromName: string

  constructor() {
    this.apiKey = process.env.VONAGE_API_KEY || ''
    this.apiSecret = process.env.VONAGE_API_SECRET || ''
    this.fromName = process.env.VONAGE_FROM_NAME || 'HealthFlow'
    if (!this.apiKey || !this.apiSecret) {
      console.warn('[SMS] Vonage credentials not configured')
    }
  }

  async send(phone: string, message: string): Promise<SMSResult> {
    if (!this.apiKey || !this.apiSecret) {
      return { success: false, provider: this.name, error: 'Vonage credentials not configured' }
    }

    try {
      const response = await fetch('https://rest.nexmo.com/sms/json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          api_key: this.apiKey,
          api_secret: this.apiSecret,
          to: normalizeGuineaPhone(phone),
          from: this.fromName,
          text: message,
          type: 'text',
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const msg = data.messages?.[0]
        if (msg?.status === '0') {
          return {
            success: true,
            provider: this.name,
            messageId: msg.messageId,
            cost: parseFloat(msg['message-price'] || '0.04'),
          }
        }
        return { success: false, provider: this.name, error: msg?.['error-text'] || 'Unknown Vonage error' }
      }

      return { success: false, provider: this.name, error: `HTTP ${response.status}` }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error'
      console.error('[SMS] Vonage SMS failed:', msg)
      return { success: false, provider: this.name, error: msg }
    }
  }
}

// ============================================================================
// Telegram Bot Provider — 100% FREE, unlimited messages
// Setup: Chat with @BotFather → /newbot → get token
// The "phone" parameter is used as chat_id or mapped via TELEGRAM_DEFAULT_CHAT_ID
// ============================================================================

class TelegramSMSProvider implements SMSProvider {
  name = 'telegram'
  private botToken: string
  private defaultChatId: string
  private baseUrl: string

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || ''
    this.defaultChatId = process.env.TELEGRAM_DEFAULT_CHAT_ID || ''
    this.baseUrl = `https://api.telegram.org/bot${this.botToken}`

    if (!this.botToken) {
      console.warn('[SMS] TELEGRAM_BOT_TOKEN not configured (free at @BotFather)')
    }
  }

  async send(phone: string, message: string): Promise<SMSResult> {
    if (!this.botToken) {
      return { success: false, provider: this.name, error: 'TELEGRAM_BOT_TOKEN not configured' }
    }

    // Use phone as chat_id if it looks like a chat ID (numeric or starts with -),
    // otherwise use the default chat ID
    const chatId = /^-?\d+$/.test(phone) ? phone : this.defaultChatId

    if (!chatId) {
      return {
        success: false,
        provider: this.name,
        error: 'No chat ID available. Set TELEGRAM_DEFAULT_CHAT_ID or pass numeric chat_id as phone parameter.',
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.ok) {
          return {
            success: true,
            provider: this.name,
            messageId: String(data.result?.message_id || ''),
            cost: 0, // 100% free!
          }
        }
        return { success: false, provider: this.name, error: data.description || 'Telegram API error' }
      }

      const errorData = await response.json().catch(() => ({}))
      return { success: false, provider: this.name, error: errorData.description || `HTTP ${response.status}` }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error'
      console.error('[SMS] Telegram send failed:', msg)
      return { success: false, provider: this.name, error: msg }
    }
  }
}

// ============================================================================
// Demo Provider — Logs to console only, for development/testing
// ============================================================================

class DemoSMSProvider implements SMSProvider {
  name = 'demo'

  async send(phone: string, message: string): Promise<SMSResult> {
    const normalizedPhone = normalizeGuineaPhone(phone)
    const maskedPhone = normalizedPhone.slice(0, -4).replace(/./g, '*') + normalizedPhone.slice(-4)

    console.log('╔══════════════════════════════════════════════╗')
    console.log('║           HealthFlow SMS (DEMO)              ║')
    console.log('╠══════════════════════════════════════════════╣')
    console.log(`║  To: ${maskedPhone.padEnd(36)}║`)
    console.log(`║  Message: ${message.substring(0, 32).padEnd(32)}║`)
    if (message.length > 32) {
      console.log(`║           ${message.substring(32, 64).padEnd(32)}║`)
    }
    console.log('╚══════════════════════════════════════════════╝')

    return { success: true, provider: this.name, messageId: `demo-${Date.now()}`, cost: 0 }
  }
}

// ============================================================================
// SMS Service — Singleton with provider selection and failover
// ============================================================================

class SMSService {
  private primaryProvider: SMSProvider
  private fallbackProviders: SMSProvider[] = []
  private initialized = false

  constructor() {
    this.primaryProvider = new DemoSMSProvider()
  }

  /**
   * Initialize SMS providers based on environment configuration.
   * Supports failover: primary → fallback1 → fallback2 → demo
   */
  initialize() {
    if (this.initialized) return

    const provider = process.env.SMS_PROVIDER || 'demo'
    const providers: SMSProvider[] = []

    switch (provider) {
      case 'orange':
        providers.push(new OrangeSMSProvider())
        break
      case 'twilio':
        providers.push(new TwilioSMSProvider())
        break
      case 'vonage':
        providers.push(new VonageSMSProvider())
        break
      case 'telegram':
        providers.push(new TelegramSMSProvider())
        break
      case 'demo':
        providers.push(new DemoSMSProvider())
        break
      default:
        console.warn(`[SMS] Unknown provider: ${provider}. Using demo mode.`)
        providers.push(new DemoSMSProvider())
    }

    // Add fallback providers if configured
    const fallback = process.env.SMS_FALLBACK_PROVIDER
    if (fallback) {
      switch (fallback) {
        case 'orange': providers.push(new OrangeSMSProvider()); break
        case 'twilio': providers.push(new TwilioSMSProvider()); break
        case 'vonage': providers.push(new VonageSMSProvider()); break
        case 'telegram': providers.push(new TelegramSMSProvider()); break
      }
    }

    // Always add demo as last resort fallback
    if (providers[0]?.name !== 'demo') {
      providers.push(new DemoSMSProvider())
    }

    this.primaryProvider = providers[0]
    this.fallbackProviders = providers.slice(1)
    this.initialized = true

    console.log(`[SMS] Primary: ${this.primaryProvider.name}, Fallbacks: ${this.fallbackProviders.map(p => p.name).join(', ') || 'none'}`)
  }

  /**
   * Send SMS with automatic failover
   */
  async send(phone: string, message: string): Promise<SMSResult> {
    this.initialize()

    // Try primary
    const result = await this.primaryProvider.send(phone, message)
    if (result.success) return result

    // Try fallbacks
    for (const fallback of this.fallbackProviders) {
      console.warn(`[SMS] ${this.primaryProvider.name} failed, trying ${fallback.name}`)
      const fallbackResult = await fallback.send(phone, message)
      if (fallbackResult.success) return fallbackResult
    }

    // All providers failed
    console.error('[SMS] All SMS providers failed')
    return { success: false, provider: 'all', error: 'All SMS providers failed' }
  }

  /**
   * Send OTP code via SMS
   */
  async sendOTP(phone: string, otpCode: string, expiresInMinutes = 5): Promise<SMSResult> {
    const message = `HealthFlow: Votre code de verification est ${otpCode}. Valide ${expiresInMinutes} min. Ne le partagez jamais.`
    return this.send(phone, message)
  }

  /**
   * Send appointment reminder
   */
  async sendAppointmentReminder(phone: string, date: string, doctorName: string, hospital: string): Promise<SMSResult> {
    const message = `HealthFlow: Rappel RV le ${date} avec Dr. ${doctorName} a ${hospital}. Repondez OUI pour confirmer.`
    return this.send(phone, message)
  }

  /**
   * Send lab results notification
   */
  async sendLabResultsNotification(phone: string, patientName: string): Promise<SMSResult> {
    const message = `HealthFlow: ${patientName}, vos resultats d'analyses sont disponibles. Connectez-vous a votre portail patient.`
    return this.send(phone, message)
  }
}

// Singleton export
export const smsService = new SMSService()

// Convenience function
export async function sendSMS(phone: string, message: string): Promise<SMSResult> {
  return smsService.send(phone, message)
}

export async function sendOTP(phone: string, otpCode: string, expiresInMinutes?: number): Promise<SMSResult> {
  return smsService.sendOTP(phone, otpCode, expiresInMinutes)
}
