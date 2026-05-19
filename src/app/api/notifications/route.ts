// ============================================================================
// HealthFlow Guinea - Notification API
// POST /api/notifications — Send notification via any channel
// GET  /api/notifications — Check channel status
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { notificationService, type NotificationChannel } from '@/lib/notification-service'
import { telegramBot } from '@/lib/telegram-provider'
import { smsService } from '@/lib/sms-provider'
import { whatsappService } from '@/lib/whatsapp-service'
import { z } from 'zod'

// Validation schema
const notificationSchema = z.object({
  recipient: z.string().min(1, 'Recipient is required'),
  message: z.string().min(1, 'Message is required').max(4096, 'Message too long (Telegram limit)'),
  channels: z.array(z.enum(['sms', 'whatsapp', 'telegram', 'auto'])).optional().default(['auto']),
  preferFree: z.boolean().optional().default(true),
  telegramChatId: z.string().optional(),
  type: z.enum(['general', 'otp', 'appointment', 'lab_results', 'payment', 'emergency', 'vaccination']).optional().default('general'),
  // Type-specific fields
  otpCode: z.string().optional(),
  patientName: z.string().optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  doctorName: z.string().optional(),
  hospital: z.string().optional(),
  amount: z.string().optional(),
  invoiceNumber: z.string().optional(),
  reference: z.string().optional(),
  childName: z.string().optional(),
  parentName: z.string().optional(),
  alertType: z.string().optional(),
  instructions: z.string().optional(),
  expiresInMinutes: z.number().optional().default(5),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = notificationSchema.parse(body)

    let result

    switch (validated.type) {
      case 'otp':
        if (!validated.otpCode) {
          return NextResponse.json({ error: 'otpCode required for OTP type' }, { status: 400 })
        }
        result = await notificationService.sendOTP(
          validated.recipient,
          validated.otpCode,
          validated.expiresInMinutes,
          {
            channels: validated.channels as NotificationChannel[],
            preferFree: validated.preferFree,
            telegramChatId: validated.telegramChatId,
          }
        )
        break

      case 'appointment':
        if (!validated.patientName || !validated.date || !validated.doctorName) {
          return NextResponse.json(
            { error: 'patientName, date, and doctorName required for appointment type' },
            { status: 400 }
          )
        }
        result = await notificationService.sendAppointmentReminder(
          validated.recipient,
          validated.patientName,
          validated.date,
          validated.time || '',
          validated.doctorName,
          validated.hospital || '',
          {
            channels: validated.channels as NotificationChannel[],
            preferFree: validated.preferFree,
            telegramChatId: validated.telegramChatId,
          }
        )
        break

      default:
        result = await notificationService.send(
          validated.recipient,
          validated.message,
          {
            channels: validated.channels as NotificationChannel[],
            preferFree: validated.preferFree,
            telegramChatId: validated.telegramChatId,
          }
        )
    }

    return NextResponse.json({
      success: result.success,
      channels: result.channels,
      totalCost: result.totalCost,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    console.error('[Notification API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET: Check channel status
export async function GET() {
  const telegramInfo = await telegramBot.getBotInfo()

  return NextResponse.json({
    channels: {
      telegram: {
        configured: telegramBot.isConfigured,
        bot: telegramInfo.ok ? `@${telegramInfo.username}` : null,
        cost: '100% FREE — Unlimited messages',
        error: telegramInfo.error,
        setup: telegramBot.isConfigured
          ? 'Ready to use'
          : 'Set TELEGRAM_BOT_TOKEN in .env (get token from @BotFather)',
      },
      whatsapp: {
        configured: whatsappService['isConfigured'] || false,
        provider: process.env.WHATSAPP_PROVIDER || 'demo',
        cost: 'Free for patient-initiated conversations',
        setup: process.env.WHATSAPP_PROVIDER
          ? 'Configured'
          : 'Set WHATSAPP_PROVIDER=twilio or meta in .env',
      },
      sms: {
        configured: process.env.SMS_PROVIDER !== 'demo' && !!process.env.SMS_PROVIDER,
        provider: process.env.SMS_PROVIDER || 'demo',
        cost: process.env.SMS_PROVIDER === 'orange'
          ? '~40 GNF/SMS'
          : process.env.SMS_PROVIDER === 'twilio'
            ? '~$0.05/SMS'
            : 'Demo (free, console only)',
        setup: 'Set SMS_PROVIDER=orange|twilio|vonage|telegram in .env',
      },
    },
    recommendation: {
      free: 'Use TELEGRAM (100% free, unlimited) + WhatsApp (free patient-initiated)',
      pilot: 'Add Orange SMS for non-smartphone patients (~40 GNF/SMS)',
    },
  })
}
