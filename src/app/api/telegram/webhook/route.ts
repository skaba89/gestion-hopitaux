// ============================================================================
// HealthFlow Guinea - Telegram Webhook Handler
// Receives incoming messages from Telegram Bot API
// POST /api/telegram/webhook
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { telegramBot } from '@/lib/telegram-provider'
import { addSimpleAuditEntry } from '@/lib/audit-logger'

// Verify webhook secret to prevent unauthorized calls
function verifyWebhookSecret(request: NextRequest): boolean {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET
  if (!secret) return true // No secret configured = allow all (dev mode)

  const urlSecret = request.nextUrl.searchParams.get('secret')
  return urlSecret === secret
}

export async function POST(request: NextRequest) {
  // Verify webhook secret
  if (!verifyWebhookSecret(request)) {
    return NextResponse.json({ error: 'Invalid webhook secret' }, { status: 401 })
  }

  try {
    const body = await request.json()

    // Telegram sends updates in this format
    // https://core.telegram.org/bots/api#update
    const updateId = body.update_id
    const message = body.message
    const callbackQuery = body.callback_query

    // Handle incoming text message
    if (message?.text) {
      const chatId = String(message.chat.id)
      const text = message.text.trim()
      const fromUser = message.from

      console.log(`[Telegram Webhook] Message from chat ${chatId}: "${text}"`)

      // Handle commands
      if (text.startsWith('/')) {
        await handleCommand(chatId, text, fromUser)
      } else {
        // Echo back for testing
        await telegramBot.send(
          chatId,
          `<b>HealthFlow Guinée</b>\n\nMessage reçu. Utilisez /help pour voir les commandes disponibles.`,
          { disableNotification: true }
        )
      }

      // Audit log
      addSimpleAuditEntry({
        action: 'TELEGRAM_MESSAGE_RECEIVED',
        module: 'messaging',
        entity: 'Telegram',
        description: `Message from chat ${chatId}: ${text.substring(0, 50)}`,
        severity: 'INFO',
      })
    }

    // Handle callback query (inline button clicks)
    if (callbackQuery) {
      const chatId = String(callbackQuery.message?.chat?.id || '')
      const data = callbackQuery.data

      console.log(`[Telegram Webhook] Callback from chat ${chatId}: "${data}"`)

      await telegramBot.send(
        chatId,
        `<b>HealthFlow Guinée</b>\n\nAction reçue : ${data}`,
        { disableNotification: true }
      )
    }

    // Always return 200 OK quickly to Telegram
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[Telegram Webhook] Error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

// Handle bot commands
async function handleCommand(chatId: string, command: string, fromUser?: Record<string, unknown>) {
  const username = (fromUser as { username?: string })?.username || 'Utilisateur'

  switch (command.split(' ')[0]) {
    case '/start':
      await telegramBot.send(
        chatId,
        `<b>🏥 Bienvenue sur HealthFlow Guinée !</b>\n\n` +
        `Bonjour ${username} ! Je suis le bot de notification du système HealthFlow.\n\n` +
        `<b>Commandes disponibles :</b>\n` +
        `/start — Afficher ce message\n` +
        `/help — Aide et commandes\n` +
        `/status — État du système\n` +
        `/chatid — Obtenir votre Chat ID\n` +
        `/test — Envoyer un message de test\n\n` +
        `<i>HealthFlow Guinée — Système de Gestion Hospitalière</i>`
      )
      break

    case '/help':
      await telegramBot.send(
        chatId,
        `<b>📋 Aide HealthFlow</b>\n\n` +
        `<b>Commandes :</b>\n` +
        `/start — Message de bienvenue\n` +
        `/help — Cette aide\n` +
        `/status — État du système\n` +
        `/chatid — Votre Chat ID (pour config .env)\n` +
        `/test — Message de test\n\n` +
        `<b>Canaux de notification :</b>\n` +
        `✅ Telegram (gratuit, illimité)\n` +
        `✅ WhatsApp (gratuit pour les patients)\n` +
        `✅ SMS (Orange, Twilio, Vonage)\n\n` +
        `<i>HealthFlow Guinée</i>`
      )
      break

    case '/status':
      const botInfo = await telegramBot.getBotInfo()
      await telegramBot.send(
        chatId,
        `<b>📊 État du Système</b>\n\n` +
        `🤖 Bot : ${botInfo.ok ? `✅ @${botInfo.username}` : '❌ Non configuré'}\n` +
        `📡 Chat ID : <code>${chatId}</code>\n` +
        `🕐 Heure : ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Conakry' })}\n` +
        `💾 Mode : ${process.env.DEMO_MODE === 'true' ? 'Démo' : 'Production'}\n\n` +
        `<i>HealthFlow Guinée — Monitoring</i>`
      )
      break

    case '/chatid':
      await telegramBot.send(
        chatId,
        `<b>🔑 Votre Chat ID</b>\n\n` +
        `Chat ID : <code>${chatId}</code>\n\n` +
        `Ajoutez cette valeur à votre fichier .env :\n` +
        `<code>TELEGRAM_DEFAULT_CHAT_ID=${chatId}</code>\n\n` +
        `<i>HealthFlow Guinée</i>`
      )
      break

    case '/test':
      await telegramBot.send(
        chatId,
        `<b>🧪 Message de Test</b>\n\n` +
        `✅ Telegram fonctionne correctement !\n` +
        `📱 Canal : Telegram Bot API\n` +
        `💰 Coût : Gratuit\n` +
        `🕐 Heure : ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Conakry' })}\n\n` +
        `<i>HealthFlow Guinée — Test de notification</i>`
      )
      break

    default:
      await telegramBot.send(
        chatId,
        `Commande inconnue : ${command}\nUtilisez /help pour voir les commandes disponibles.`
      )
  }
}

// GET endpoint to set up webhook
export async function GET(request: NextRequest) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN

  if (!botToken) {
    return NextResponse.json({
      configured: false,
      message: 'TELEGRAM_BOT_TOKEN not set in .env',
      setup: 'Chat with @BotFather on Telegram → /newbot → copy token to .env',
    })
  }

  // Get current webhook info
  const webhookInfo = await telegramBot.getWebhookInfo()

  // Optionally set webhook
  const setWebhook = request.nextUrl.searchParams.get('set') === 'true'
  const webhookUrl = request.nextUrl.searchParams.get('url')

  if (setWebhook && webhookUrl) {
    const result = await telegramBot.setWebhook(webhookUrl)
    return NextResponse.json({
      configured: true,
      webhookSet: result.success,
      webhookUrl,
      error: result.error,
    })
  }

  // Get bot info
  const botInfo = await telegramBot.getBotInfo()

  return NextResponse.json({
    configured: true,
    bot: botInfo.ok ? `@${botInfo.username}` : 'unknown',
    webhook: webhookInfo,
    chatIdHint: 'Send /chatid to the bot to get your chat ID',
  })
}
