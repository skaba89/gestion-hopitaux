// ============================================================================
// HealthFlow Guinea - Telegram Patient Registry
// Links Telegram chat_id to patient records automatically
// When a patient starts the bot, their chat_id is stored for notifications
// ============================================================================

import { telegramBot } from '@/lib/telegram-provider'
import { addSimpleAuditEntry } from '@/lib/audit-logger'

/**
 * In-memory registry for development/demo mode
 * In production, this uses PostgreSQL via Prisma
 */
interface TelegramRegistration {
  chatId: string
  phone?: string
  patientId?: string
  userId?: string
  firstName?: string
  lastName?: string
  language?: string
  registeredAt: Date
  lastInteractionAt: Date
}

class TelegramPatientRegistry {
  // In-memory store for demo mode (replaced by Prisma in production)
  private registrations: Map<string, TelegramRegistration> = new Map()

  /**
   * Register or update a Telegram user
   * Called automatically when someone starts the bot
   */
  async register(chatId: string, data: {
    phone?: string
    patientId?: string
    userId?: string
    firstName?: string
    lastName?: string
    language?: string
  }): Promise<{ success: boolean; isNew: boolean }> {
    const existing = this.registrations.get(chatId)
    const isNew = !existing

    this.registrations.set(chatId, {
      chatId,
      phone: data.phone || existing?.phone,
      patientId: data.patientId || existing?.patientId,
      userId: data.userId || existing?.userId,
      firstName: data.firstName || existing?.firstName,
      lastName: data.lastName || existing?.lastName,
      language: data.language || existing?.language || 'fr',
      registeredAt: existing?.registeredAt || new Date(),
      lastInteractionAt: new Date(),
    })

    // In production: update Prisma
    if (data.patientId) {
      await this.linkToPatient(chatId, data.patientId)
    }
    if (data.userId) {
      await this.linkToUser(chatId, data.userId)
    }

    addSimpleAuditEntry({
      action: isNew ? 'TELEGRAM_USER_REGISTERED' : 'TELEGRAM_USER_UPDATED',
      module: 'messaging',
      entity: 'Telegram',
      description: `Chat ${chatId} ${isNew ? 'registered' : 'updated'}${data.phone ? `, phone: ${data.phone.slice(-4).padStart(data.phone.length, '*')}` : ''}`,
      severity: 'INFO',
    })

    return { success: true, isNew }
  }

  /**
   * Link a Telegram chat_id to a patient record in the database
   */
  async linkToPatient(chatId: string, patientId: string): Promise<boolean> {
    try {
      // In production with PostgreSQL:
      // await prisma.patient.update({
      //   where: { id: patientId },
      //   data: {
      //     telegramChatId: chatId,
      //     preferredNotificationChannel: 'telegram',
      //   },
      // })

      const reg = this.registrations.get(chatId)
      if (reg) {
        reg.patientId = patientId
        reg.lastInteractionAt = new Date()
      }

      console.log(`[Telegram Registry] Linked chat ${chatId} to patient ${patientId}`)
      return true
    } catch (error) {
      console.error('[Telegram Registry] Failed to link patient:', error)
      return false
    }
  }

  /**
   * Link a Telegram chat_id to a user (staff) record in the database
   */
  async linkToUser(chatId: string, userId: string): Promise<boolean> {
    try {
      // In production with PostgreSQL:
      // await prisma.user.update({
      //   where: { id: userId },
      //   data: {
      //     telegramChatId: chatId,
      //     preferredNotificationChannel: 'telegram',
      //   },
      // })

      const reg = this.registrations.get(chatId)
      if (reg) {
        reg.userId = userId
        reg.lastInteractionAt = new Date()
      }

      console.log(`[Telegram Registry] Linked chat ${chatId} to user ${userId}`)
      return true
    } catch (error) {
      console.error('[Telegram Registry] Failed to link user:', error)
      return false
    }
  }

  /**
   * Find a registration by chat_id
   */
  getByChatId(chatId: string): TelegramRegistration | undefined {
    return this.registrations.get(chatId)
  }

  /**
   * Find a registration by phone number
   */
  getByPhone(phone: string): TelegramRegistration | undefined {
    const normalized = phone.replace(/[\s\-()]/g, '')
    for (const reg of this.registrations.values()) {
      if (reg.phone && reg.phone.replace(/[\s\-()]/g, '') === normalized) {
        return reg
      }
    }
    return undefined
  }

  /**
   * Get all registered Telegram users
   */
  getAllRegistrations(): TelegramRegistration[] {
    return Array.from(this.registrations.values())
  }

  /**
   * Get chat_id for a patient
   */
  getChatIdForPatient(patientId: string): string | undefined {
    for (const reg of this.registrations.values()) {
      if (reg.patientId === patientId) return reg.chatId
    }
    return undefined
  }

  /**
   * Get chat_id for a user (staff)
   */
  getChatIdForUser(userId: string): string | undefined {
    for (const reg of this.registrations.values()) {
      if (reg.userId === userId) return reg.chatId
    }
    return undefined
  }

  /**
   * Send a notification to a patient via their preferred channel
   * Falls back to SMS if Telegram not linked
   */
  async notifyPatient(patientId: string, message: string, options?: {
    richMessage?: string  // HTML-formatted message for Telegram
    smsMessage?: string   // Plain text for SMS
  }): Promise<{
    delivered: boolean
    channel: 'telegram' | 'sms' | 'none'
    chatId?: string
  }> {
    const reg = this.registrations.get(this.getChatIdForPatient(patientId) || '')

    if (reg?.chatId && telegramBot.isConfigured) {
      const result = await telegramBot.send(
        reg.chatId,
        options?.richMessage || message,
      )
      if (result.success) {
        return { delivered: true, channel: 'telegram', chatId: reg.chatId }
      }
    }

    // Fallback to SMS if patient has phone
    if (reg?.phone) {
      const { smsService } = await import('@/lib/sms-provider')
      const result = await smsService.send(reg.phone, options?.smsMessage || message)
      if (result.success) {
        return { delivered: true, channel: 'sms' }
      }
    }

    return { delivered: false, channel: 'none' }
  }

  /**
   * Send a broadcast message to all registered Telegram users
   * Respects Telegram rate limits (30 msg/sec to different users)
   */
  async broadcast(
    message: string,
    options?: {
      filter?: (reg: TelegramRegistration) => boolean
      delay?: number  // Delay between messages in ms (default: 50ms for rate limit)
    }
  ): Promise<{
    total: number
    sent: number
    failed: number
    results: Array<{ chatId: string; success: boolean; error?: string }>
  }> {
    let targets = this.getAllRegistrations()

    if (options?.filter) {
      targets = targets.filter(options.filter)
    }

    const delay = options?.delay ?? 50 // 50ms = 20 msg/sec (safe)
    const results: Array<{ chatId: string; success: boolean; error?: string }> = []
    let sent = 0
    let failed = 0

    for (const reg of targets) {
      const result = await telegramBot.send(reg.chatId, message)
      results.push({
        chatId: reg.chatId,
        success: result.success,
        error: result.error,
      })

      if (result.success) {
        sent++
      } else {
        failed++
      }

      // Rate limit: wait between messages
      if (delay > 0 && targets.indexOf(reg) < targets.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    addSimpleAuditEntry({
      action: 'TELEGRAM_BROADCAST',
      module: 'messaging',
      entity: 'Telegram',
      description: `Broadcast sent to ${sent}/${targets.length} users, ${failed} failed`,
      severity: 'INFO',
    })

    return { total: targets.length, sent, failed, results }
  }

  /**
   * Get registration statistics
   */
  getStats(): {
    totalRegistered: number
    linkedToPatient: number
    linkedToUser: number
    withPhone: number
  } {
    const all = this.getAllRegistrations()
    return {
      totalRegistered: all.length,
      linkedToPatient: all.filter(r => r.patientId).length,
      linkedToUser: all.filter(r => r.userId).length,
      withPhone: all.filter(r => r.phone).length,
    }
  }
}

// Singleton
export const telegramRegistry = new TelegramPatientRegistry()
