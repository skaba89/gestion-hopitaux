// ============================================================================
// HealthFlow Guinea - Unified Notification Service
// Sends notifications via the best available channel:
// 1. Telegram (100% FREE) — for staff & patients with Telegram
// 2. WhatsApp — for patients (free patient-initiated conversations)
// 3. SMS (Orange/Twilio/Vonage) — for all patients with a phone
// 4. Demo — development fallback
// ============================================================================

import { smsService, type SMSResult } from '@/lib/sms-provider'
import { whatsappService } from '@/lib/whatsapp-service'
import { telegramBot, type TelegramResult } from '@/lib/telegram-provider'
import { addSimpleAuditEntry } from '@/lib/audit-logger'

export type NotificationChannel = 'sms' | 'whatsapp' | 'telegram' | 'auto'

export interface NotificationOptions {
  channels?: NotificationChannel[]
  preferFree?: boolean        // Prefer free channels (Telegram/WhatsApp) over paid SMS
  telegramChatId?: string     // Specific Telegram chat ID
  silentAlert?: boolean       // No sound notification
}

export interface NotificationResult {
  success: boolean
  channels: {
    channel: NotificationChannel
    success: boolean
    messageId?: string
    cost?: number
    error?: string
  }[]
  totalCost: number
}

/**
 * Unified Notification Service
 *
 * Automatically selects the best channel based on:
 * - Cost (free channels first when preferFree=true)
 * - Availability (which providers are configured)
 * - Patient preference
 */
class NotificationService {
  /**
   * Send a notification via the best available channel(s)
   */
  async send(
    recipient: string,  // Phone number or Telegram chat_id
    message: string,
    options?: NotificationOptions
  ): Promise<NotificationResult> {
    const channels = options?.channels || ['auto']
    const results: NotificationResult['channels'] = []
    let totalCost = 0
    let anySuccess = false

    // Determine which channels to try
    const targetChannels = this.resolveChannels(channels, options)

    for (const channel of targetChannels) {
      const result = await this.sendViaChannel(channel, recipient, message, options)
      results.push(result)

      if (result.success) {
        anySuccess = true
        totalCost += result.cost || 0

        // If this is a free channel and it succeeded, no need to try paid channels
        if (options?.preferFree && result.cost === 0) {
          break
        }
      }
    }

    // Audit log
    addSimpleAuditEntry({
      action: anySuccess ? 'NOTIFICATION_SENT' : 'NOTIFICATION_FAILED',
      module: 'notification',
      entity: 'Unified',
      description: `Notification to ${recipient.slice(-4).padStart(recipient.length, '*')} via ${results.filter(r => r.success).map(r => r.channel).join(',') || 'none'}`,
      severity: anySuccess ? 'INFO' : 'WARNING',
    })

    return {
      success: anySuccess,
      channels: results,
      totalCost,
    }
  }

  /**
   * Send OTP via the best free channel available
   */
  async sendOTP(
    recipient: string,
    otpCode: string,
    expiresInMinutes = 5,
    options?: NotificationOptions
  ): Promise<NotificationResult> {
    const otpMessage = `HealthFlow: Votre code de verification est ${otpCode}. Valide ${expiresInMinutes} min. Ne le partagez jamais.`

    // Try Telegram first (free), then WhatsApp, then SMS
    return this.send(recipient, otpMessage, {
      ...options,
      channels: ['telegram', 'whatsapp', 'sms'],
      preferFree: true,
    })
  }

  /**
   * Send appointment reminder
   */
  async sendAppointmentReminder(
    recipient: string,
    patientName: string,
    date: string,
    time: string,
    doctorName: string,
    hospital: string,
    options?: NotificationOptions
  ): Promise<NotificationResult> {
    const channels = options?.channels || ['telegram', 'whatsapp', 'sms']

    const results: NotificationResult['channels'] = []
    let totalCost = 0
    let anySuccess = false

    // Try Telegram with rich formatting
    if (channels.includes('telegram') || channels.includes('auto')) {
      const chatId = options?.telegramChatId || recipient
      if (telegramBot.isConfigured && /^-?\d+$/.test(chatId)) {
        const result = await telegramBot.sendAppointmentReminder(
          chatId, patientName, date, time, doctorName, hospital
        )
        results.push({
          channel: 'telegram',
          success: result.success,
          messageId: result.messageId,
          cost: result.cost,
          error: result.error,
        })
        if (result.success) {
          anySuccess = true
          totalCost += result.cost || 0
        }
      }
    }

    // Try WhatsApp
    if (channels.includes('whatsapp') || channels.includes('auto')) {
      const result = await whatsappService.sendAppointmentReminder(
        recipient, patientName, date, time, doctorName, hospital
      )
      results.push({
        channel: 'whatsapp',
        success: result.success,
        messageId: result.messageId,
        cost: 0, // WhatsApp service conversations are free
      })
      if (result.success) {
        anySuccess = true
      }
    }

    // Try SMS as fallback
    if (channels.includes('sms') || channels.includes('auto')) {
      if (!anySuccess || !options?.preferFree) {
        const result = await smsService.sendAppointmentReminder(recipient, date, doctorName, hospital)
        results.push({
          channel: 'sms',
          success: result.success,
          messageId: result.messageId,
          cost: result.cost,
          error: result.error,
        })
        if (result.success) {
          anySuccess = true
          totalCost += result.cost || 0
        }
      }
    }

    return { success: anySuccess, channels: results, totalCost }
  }

  /**
   * Send system alert (monitoring) — always free via Telegram
   */
  async sendSystemAlert(
    level: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL',
    title: string,
    details: string
  ): Promise<TelegramResult[]> {
    if (telegramBot.isConfigured) {
      return telegramBot.sendSystemAlert(level, title, details)
    }

    // Fallback: log to console
    console.log(`[${level}] ${title}: ${details}`)
    return [{ success: false, provider: 'console', error: 'Telegram not configured, logged to console' }]
  }

  // ──────── Private helpers ────────

  private resolveChannels(channels: NotificationChannel[], options?: NotificationOptions): NotificationChannel[] {
    if (channels.includes('auto')) {
      if (options?.preferFree) {
        return ['telegram', 'whatsapp', 'sms']
      }
      // Check what's configured
      const available: NotificationChannel[] = []
      if (telegramBot.isConfigured) available.push('telegram')
      // WhatsApp always available (demo mode works)
      available.push('whatsapp')
      // SMS always available (demo mode works)
      available.push('sms')
      return available
    }
    return channels
  }

  private async sendViaChannel(
    channel: NotificationChannel,
    recipient: string,
    message: string,
    options?: NotificationOptions
  ): Promise<NotificationResult['channels'][0]> {
    switch (channel) {
      case 'telegram': {
        const chatId = options?.telegramChatId || recipient
        if (!telegramBot.isConfigured) {
          return { channel, success: false, error: 'Telegram not configured' }
        }
        const result = await telegramBot.send(chatId, message, {
          disableNotification: options?.silentAlert,
        })
        return {
          channel,
          success: result.success,
          messageId: result.messageId,
          cost: result.cost,
          error: result.error,
        }
      }

      case 'whatsapp': {
        const result = await whatsappService.sendTemplateMessage({
          to: recipient,
          templateName: 'appointment_reminder', // generic template
          templateParams: { message },
        })
        return {
          channel,
          success: result.success,
          messageId: result.messageId,
          cost: 0,
          error: result.error,
        }
      }

      case 'sms': {
        const result = await smsService.send(recipient, message)
        return {
          channel,
          success: result.success,
          messageId: result.messageId,
          cost: result.cost,
          error: result.error,
        }
      }

      default:
        return { channel, success: false, error: `Unknown channel: ${channel}` }
    }
  }
}

// Singleton export
export const notificationService = new NotificationService()

// Convenience function
export async function sendNotification(
  recipient: string,
  message: string,
  options?: NotificationOptions
): Promise<NotificationResult> {
  return notificationService.send(recipient, message, options)
}
