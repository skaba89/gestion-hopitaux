// ============================================================================
// HealthFlow Guinea - Telegram Bot Provider
// 100% FREE — Unlimited messages, no credit card required
// Setup: Chat with @BotFather on Telegram → /newbot → get token
// Docs: https://core.telegram.org/bots/api
// ============================================================================

import { addSimpleAuditEntry } from '@/lib/audit-logger'

export interface TelegramResult {
  success: boolean
  messageId?: string
  provider: string
  cost?: number
  error?: string
}

export interface TelegramMessageOptions {
  parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2'
  disableNotification?: boolean  // Silent message (no sound)
  protectContent?: boolean       // Prevent forwarding/saving
  replyMarkup?: Record<string, unknown>
}

/**
 * Telegram Bot API Provider
 *
 * Cost: 100% FREE — No limits on messages
 * Rate Limits:
 *   - 30 messages/second to different users
 *   - 1 message/second to the same user
 *   - 20 messages/minute in groups
 *   - No daily/monthly cap
 *
 * Works in Guinea: YES — Telegram works on Android/iOS
 */
class TelegramBotProvider {
  name = 'telegram'
  private botToken: string
  private defaultChatId: string  // Default chat for notifications
  private baseUrl: string
  private adminChatIds: string[] // Admin group chats for alerts

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || ''
    this.defaultChatId = process.env.TELEGRAM_DEFAULT_CHAT_ID || ''
    this.adminChatIds = (process.env.TELEGRAM_ADMIN_CHAT_IDS || '').split(',').filter(Boolean)
    this.baseUrl = `https://api.telegram.org/bot${this.botToken}`

    if (!this.botToken) {
      console.warn('[Telegram] TELEGRAM_BOT_TOKEN not configured. Set it in .env')
    } else {
      console.log(`[Telegram] Bot configured. Default chat: ${this.defaultChatId || 'not set'}`)
    }
  }

  get isConfigured(): boolean {
    return !!this.botToken
  }

  /**
   * Send a text message via Telegram Bot
   */
  async send(
    chatId: string,
    message: string,
    options?: TelegramMessageOptions
  ): Promise<TelegramResult> {
    if (!this.botToken) {
      return { success: false, provider: this.name, error: 'TELEGRAM_BOT_TOKEN not configured' }
    }

    try {
      const response = await fetch(`${this.baseUrl}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: options?.parseMode || 'HTML',
          disable_notification: options?.disableNotification || false,
          protect_content: options?.protectContent || false,
          reply_markup: options?.replyMarkup,
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
        return {
          success: false,
          provider: this.name,
          error: data.description || 'Telegram API error',
        }
      }

      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        provider: this.name,
        error: errorData.description || `HTTP ${response.status}`,
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error'
      console.error('[Telegram] Send failed:', msg)
      return { success: false, provider: this.name, error: msg }
    }
  }

  /**
   * Send message to the default notification chat
   */
  async sendToDefault(message: string, options?: TelegramMessageOptions): Promise<TelegramResult> {
    if (!this.defaultChatId) {
      return { success: false, provider: this.name, error: 'TELEGRAM_DEFAULT_CHAT_ID not configured' }
    }
    return this.send(this.defaultChatId, message, options)
  }

  /**
   * Send alert to all admin chat IDs
   */
  async sendAdminAlert(message: string, options?: TelegramMessageOptions): Promise<TelegramResult[]> {
    if (this.adminChatIds.length === 0) {
      console.warn('[Telegram] No admin chat IDs configured')
      return [{ success: false, provider: this.name, error: 'No TELEGRAM_ADMIN_CHAT_IDS configured' }]
    }

    const results = await Promise.all(
      this.adminChatIds.map(chatId => this.send(chatId, message, options))
    )

    return results
  }

  /**
   * Send OTP code via Telegram
   * For patients who have Telegram installed
   */
  async sendOTP(chatId: string, otpCode: string, expiresInMinutes = 5): Promise<TelegramResult> {
    const message = (
      `<b>🏥 HealthFlow Guinée</b>\n\n` +
      `Votre code de vérification : <code>${otpCode}</code>\n\n` +
      `⏱ Valide <b>${expiresInMinutes} minutes</b>\n` +
      `❌ Ne le partagez avec personne\n\n` +
      `<i>Si vous n'avez pas demandé ce code, ignorez ce message.</i>`
    )

    const result = await this.send(chatId, message, {
      protectContent: true, // Prevent forwarding of OTP
    })

    if (result.success) {
      addSimpleAuditEntry({
        action: 'TELEGRAM_OTP_SENT',
        module: 'auth',
        entity: 'Telegram',
        description: `OTP sent via Telegram to chat ${chatId.slice(-4).padStart(chatId.length, '*')}`,
        severity: 'INFO',
      })
    }

    return result
  }

  /**
   * Send appointment reminder via Telegram
   */
  async sendAppointmentReminder(
    chatId: string,
    patientName: string,
    date: string,
    time: string,
    doctorName: string,
    hospital: string
  ): Promise<TelegramResult> {
    const message = (
      `<b>📋 Rappel de Rendez-vous</b>\n\n` +
      `👤 Patient : ${patientName}\n` +
      `📅 Date : ${date}\n` +
      `🕐 Heure : ${time}\n` +
      `👨‍⚕️ Médecin : Dr. ${doctorName}\n` +
      `🏥 Lieu : ${hospital}\n\n` +
      `<i>HealthFlow Guinée — Système de Gestion Hospitalière</i>`
    )

    const result = await this.send(chatId, message)

    if (result.success) {
      addSimpleAuditEntry({
        action: 'TELEGRAM_APPOINTMENT_REMINDER',
        module: 'messaging',
        entity: 'Telegram',
        description: `Appointment reminder sent to chat ${chatId.slice(-4).padStart(chatId.length, '*')}`,
        severity: 'INFO',
      })
    }

    return result
  }

  /**
   * Send lab results notification via Telegram
   */
  async sendLabResultsNotification(
    chatId: string,
    patientName: string,
    date: string,
    portalUrl: string
  ): Promise<TelegramResult> {
    const message = (
      `<b>🔬 Résultats d'Analyses Disponibles</b>\n\n` +
      `👤 ${patientName}\n` +
      `📅 Analyses du : ${date}\n\n` +
      `Vos résultats sont disponibles sur votre portail patient :\n` +
      `<a href="${portalUrl}">Consulter les résultats</a>\n\n` +
      `<i>HealthFlow Guinée</i>`
    )

    return this.send(chatId, message)
  }

  /**
   * Send payment confirmation via Telegram
   */
  async sendPaymentConfirmation(
    chatId: string,
    amount: string,
    invoiceNumber: string,
    reference: string
  ): Promise<TelegramResult> {
    const message = (
      `<b>💰 Confirmation de Paiement</b>\n\n` +
      `💵 Montant : ${amount} GNF\n` +
      `📄 Facture : #${invoiceNumber}\n` +
      `🔖 Référence : ${reference}\n\n` +
      `<i>Merci ! — HealthFlow Guinée</i>`
    )

    return this.send(chatId, message)
  }

  /**
   * Send emergency alert via Telegram
   */
  async sendEmergencyAlert(
    chatId: string,
    alertType: string,
    instructions: string
  ): Promise<TelegramResult> {
    const message = (
      `<b>🚨 ALERTE URGENCE</b>\n\n` +
      `⚠️ Type : ${alertType}\n` +
      `📢 Instructions : ${instructions}\n\n` +
      `📞 Numéro d'urgence : 115\n` +
      `<i>Suivez les instructions du personnel médical.</i>`
    )

    return this.send(chatId, message, {
      protectContent: false,
    })
  }

  /**
   * Send vaccination reminder via Telegram
   */
  async sendVaccinationReminder(
    chatId: string,
    parentName: string,
    childName: string,
    date: string,
    hospital: string
  ): Promise<TelegramResult> {
    const message = (
      `<b>💉 Rappel de Vaccination</b>\n\n` +
      `👤 Parent : ${parentName}\n` +
      `👶 Enfant : ${childName}\n` +
      `📅 Date : ${date}\n` +
      `🏥 Lieu : ${hospital}\n\n` +
      `<i>Veuillez apporter le carnet de vaccination.</i>\n` +
      `<i>HealthFlow Guinée</i>`
    )

    return this.send(chatId, message)
  }

  /**
   * Send system monitoring alert to admin chat
   * (for server errors, low disk space, etc.)
   */
  async sendSystemAlert(
    level: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL',
    title: string,
    details: string
  ): Promise<TelegramResult[]> {
    const emoji = { INFO: 'ℹ️', WARN: '⚠️', ERROR: '🔴', CRITICAL: '🚨' }
    const message = (
      `<b>${emoji[level]} ${level} — ${title}</b>\n\n` +
      `${details}\n\n` +
      `<i>HealthFlow Guinée — Monitoring</i>\n` +
      `<code>${new Date().toISOString()}</code>`
    )

    return this.sendAdminAlert(message)
  }

  /**
   * Get bot info — useful for verifying token is valid
   */
  async getBotInfo(): Promise<{ ok: boolean; username?: string; error?: string }> {
    if (!this.botToken) {
      return { ok: false, error: 'TELEGRAM_BOT_TOKEN not configured' }
    }

    try {
      const response = await fetch(`${this.baseUrl}/getMe`)
      const data = await response.json()

      if (data.ok) {
        return {
          ok: true,
          username: data.result?.username,
        }
      }
      return { ok: false, error: data.description }
    } catch (error) {
      return { ok: false, error: (error as Error).message }
    }
  }

  /**
   * Set webhook for receiving messages from Telegram
   * Call once during deployment, then handle incoming at /api/telegram/webhook
   */
  async setWebhook(webhookUrl: string): Promise<TelegramResult> {
    if (!this.botToken) {
      return { success: false, provider: this.name, error: 'TELEGRAM_BOT_TOKEN not configured' }
    }

    try {
      const response = await fetch(`${this.baseUrl}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ['message', 'callback_query'],
          drop_pending_updates: true,
        }),
      })

      const data = await response.json()
      if (data.ok) {
        return { success: true, provider: this.name, cost: 0 }
      }
      return { success: false, provider: this.name, error: data.description }
    } catch (error) {
      return { success: false, provider: this.name, error: (error as Error).message }
    }
  }

  /**
   * Get webhook info
   */
  async getWebhookInfo(): Promise<{ url?: string; pendingCount?: number; error?: string }> {
    if (!this.botToken) {
      return { error: 'TELEGRAM_BOT_TOKEN not configured' }
    }

    try {
      const response = await fetch(`${this.baseUrl}/getWebhookInfo`)
      const data = await response.json()

      if (data.ok) {
        return {
          url: data.result?.url,
          pendingCount: data.result?.pending_update_count || 0,
        }
      }
      return { error: data.description }
    } catch (error) {
      return { error: (error as Error).message }
    }
  }
}

// Singleton export
export const telegramBot = new TelegramBotProvider()

// Convenience functions
export async function sendTelegram(chatId: string, message: string, options?: TelegramMessageOptions): Promise<TelegramResult> {
  return telegramBot.send(chatId, message, options)
}

export async function sendTelegramAlert(level: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL', title: string, details: string): Promise<TelegramResult[]> {
  return telegramBot.sendSystemAlert(level, title, details)
}
