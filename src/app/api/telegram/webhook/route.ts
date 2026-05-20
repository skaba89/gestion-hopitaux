// ============================================================================
// HealthFlow Guinea - Telegram Webhook Handler
// Receives incoming messages from Telegram Bot API
// Auto-registers users and links them to patient/staff records
// POST /api/telegram/webhook
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { telegramBot } from '@/lib/telegram-provider'
import { telegramRegistry } from '@/lib/telegram-patient-registry'
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
    const message = body.message
    const callbackQuery = body.callback_query

    // Handle incoming text message
    if (message?.text) {
      const chatId = String(message.chat.id)
      const text = message.text.trim()
      const fromUser = message.from as {
        id: number
        first_name?: string
        last_name?: string
        username?: string
        language_code?: string
      } | undefined

      console.log(`[Telegram Webhook] Message from chat ${chatId}: "${text}"`)

      // Auto-register the user
      await telegramRegistry.register(chatId, {
        firstName: fromUser?.first_name,
        lastName: fromUser?.last_name,
        language: fromUser?.language_code || 'fr',
      })

      // Handle commands
      if (text.startsWith('/')) {
        await handleCommand(chatId, text, fromUser)
      } else {
        // Handle phone number registration
        const phoneRegex = /^(\+224|224|0)\d{8,9}$/
        const cleanedText = text.replace(/[\s\-()]/g, '')

        if (phoneRegex.test(cleanedText)) {
          await handlePhoneRegistration(chatId, cleanedText)
        } else {
          await telegramBot.send(
            chatId,
            `<b>🏥 HealthFlow Guinée</b>\n\n` +
            `Message reçu. Voici ce que vous pouvez faire :\n\n` +
            `📱 <b>Envoyez votre numéro</b> (ex: +224628000000) pour lier votre compte patient\n` +
            `📋 /help — Toutes les commandes\n` +
            `🔑 /register — Enregistrer votre dossier patient`,
            { disableNotification: true }
          )
        }
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

      // Handle registration callback
      if (data?.startsWith('link_')) {
        await handleLinkCallback(chatId, data)
      } else {
        await telegramBot.send(
          chatId,
          `<b>HealthFlow Guinée</b>\n\nAction reçue : ${data}`,
          { disableNotification: true }
        )
      }
    }

    // Always return 200 OK quickly to Telegram
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[Telegram Webhook] Error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

// Handle phone number registration
async function handlePhoneRegistration(chatId: string, phone: string) {
  // Store the phone number
  await telegramRegistry.register(chatId, { phone })

  // Format phone for display
  const maskedPhone = phone.slice(0, -4).replace(/./g, '*') + phone.slice(-4)

  await telegramBot.send(
    chatId,
    `<b>📱 Numéro enregistré !</b>\n\n` +
    `Téléphone : <code>${maskedPhone}</code>\n\n` +
    `✅ Vous recevrez maintenant vos notifications HealthFlow ici :\n` +
    `• 🔐 Codes de vérification (OTP)\n` +
    `• 📋 Rappels de rendez-vous\n` +
    `• 🔬 Résultats d'analyses\n` +
    `• 💉 Rappels de vaccination\n` +
    `• 💰 Confirmations de paiement\n\n` +
    `<i>HealthFlow Guinée</i>`
  )
}

// Handle link callback (when patient confirms linking)
async function handleLinkCallback(chatId: string, data: string) {
  if (data.startsWith('link_patient_')) {
    const patientId = data.replace('link_patient_', '')
    const success = await telegramRegistry.linkToPatient(chatId, patientId)

    await telegramBot.send(
      chatId,
      success
        ? `<b>✅ Compte lié !</b>\n\nVotre dossier patient est maintenant connecté à Telegram. Vous recevrez toutes vos notifications ici.`
        : `<b>❌ Erreur</b>\n\nImpossible de lier votre dossier. Veuillez contacter l'accueil.`
    )
  }
}

// Handle bot commands
async function handleCommand(
  chatId: string,
  command: string,
  fromUser?: { id: number; first_name?: string; last_name?: string; username?: string; language_code?: string }
) {
  const firstName = fromUser?.first_name || 'Utilisateur'
  const parts = command.split(' ')
  const cmd = parts[0]

  switch (cmd) {
    case '/start':
      await telegramBot.send(
        chatId,
        `<b>🏥 Bienvenue sur HealthFlow Guinée !</b>\n\n` +
        `Bonjour <b>${firstName}</b> ! Je suis le bot de notification du système de gestion hospitalière.\n\n` +
        `<b>Comment ça marche ?</b>\n` +
        `1️⃣ Envoyez votre <b>numéro de téléphone</b> (ex: +224628000000)\n` +
        `2️⃣ Votre dossier patient est automatiquement lié\n` +
        `3️⃣ Vous recevez vos notifications ici (GRATUIT)\n\n` +
        `<b>Commandes :</b>\n` +
        `/start — Ce message de bienvenue\n` +
        `/register — Enregistrer votre numéro\n` +
        `/status — Voir votre profil\n` +
        `/help — Toutes les commandes\n` +
        `/test — Message de test\n` +
        `/chatid — Votre Chat ID\n\n` +
        `<i>HealthFlow Guinée — 🇬🇳 Système de Gestion Hospitalière</i>`
      )
      break

    case '/register':
      const reg = telegramRegistry.getByChatId(chatId)
      if (reg?.phone) {
        await telegramBot.send(
          chatId,
          `<b>✅ Déjà enregistré !</b>\n\n` +
          `📱 Téléphone : <code>${reg.phone.slice(0, -4).replace(/./g, '*')}${reg.phone.slice(-4)}</code>\n` +
          `📅 Enregistré le : ${reg.registeredAt.toLocaleDateString('fr-FR')}\n\n` +
          `Envoyez un nouveau numéro pour mettre à jour, ou /status pour voir votre profil.`
        )
      } else {
        await telegramBot.send(
          chatId,
          `<b>📱 Enregistrement</b>\n\n` +
          `Pour recevoir vos notifications HealthFlow sur Telegram, envoyez votre numéro de téléphone :\n\n` +
          `<b>Format :</b> <code>+224XXXXXXXX</code>\n\n` +
          `Exemple : <code>+224628000000</code>\n\n` +
          `<i>Votre numéro est utilisé uniquement pour lier votre dossier patient. Il n'est jamais partagé.</i>`
        )
      }
      break

    case '/help':
      await telegramBot.send(
        chatId,
        `<b>📋 Aide HealthFlow Guinée</b>\n\n` +
        `<b>🏛️ À propos :</b>\n` +
        `HealthFlow est le système de gestion hospitalière de Guinée. Ce bot vous envoie vos notifications médicales GRATUITEMENT.\n\n` +
        `<b>📱 Commandes Patient :</b>\n` +
        `/register — Enregistrer votre numéro\n` +
        `/status — Voir votre profil\n` +
        `/chatid — Votre Chat ID\n` +
        `/test — Message de test\n\n` +
        `<b>🏥 Types de notifications :</b>\n` +
        `🔐 Codes OTP (connexion)\n` +
        `📋 Rappels de rendez-vous\n` +
        `🔬 Résultats d'analyses\n` +
        `💉 Rappels de vaccination\n` +
        `💰 Confirmations de paiement\n` +
        `🚨 Alertes d'urgence\n\n` +
        `<b>📱 Comment recevoir les notifications ?</b>\n` +
        `1. Envoyez votre numéro au bot\n` +
        `2. Le système lie votre dossier automatiquement\n` +
        `3. Vous recevez tout ici, GRATUITEMENT !\n\n` +
        `<i>HealthFlow Guinée — 🇬🇳</i>`
      )
      break

    case '/status': {
      const registration = telegramRegistry.getByChatId(chatId)
      const stats = telegramRegistry.getStats()
      const botInfo = await telegramBot.getBotInfo()

      let statusMsg = `<b>📊 Votre Profil HealthFlow</b>\n\n`
      statusMsg += `🆔 Chat ID : <code>${chatId}</code>\n`

      if (registration) {
        statusMsg += `👤 Nom : ${registration.firstName || '-'} ${registration.lastName || '-'}\n`
        if (registration.phone) {
          const maskedPhone = registration.phone.slice(0, -4).replace(/./g, '*') + registration.phone.slice(-4)
          statusMsg += `📱 Tél : <code>${maskedPhone}</code>\n`
        }
        statusMsg += `🔗 Patient lié : ${registration.patientId ? '✅ Oui' : '❌ Non'}\n`
        statusMsg += `📅 Enregistré le : ${registration.registeredAt.toLocaleDateString('fr-FR')}\n`
        statusMsg += `🕐 Dernière activité : ${registration.lastInteractionAt.toLocaleDateString('fr-FR')}\n`
      } else {
        statusMsg += `❌ Pas encore enregistré\n`
        statusMsg += `Envoyez /register pour commencer\n`
      }

      statusMsg += `\n<b>📈 Statistiques Bot</b>\n`
      statusMsg += `🤖 Bot : ${botInfo.ok ? `@${botInfo.username}` : '❌'}\n`
      statusMsg += `👥 Utilisateurs enregistrés : ${stats.totalRegistered}\n`
      statusMsg += `💰 Coût : <b>100% GRATUIT</b>\n`
      statusMsg += `💾 Mode : ${process.env.DEMO_MODE === 'true' ? 'Démo' : 'Production'}\n`

      await telegramBot.send(chatId, statusMsg)
      break
    }

    case '/chatid':
      await telegramBot.send(
        chatId,
        `<b>🔑 Votre Chat ID</b>\n\n` +
        `Chat ID : <code>${chatId}</code>\n\n` +
        `Ce numéro identifie votre conversation Telegram avec le bot HealthFlow.\n\n` +
        `<i>HealthFlow Guinée</i>`
      )
      break

    case '/test':
      await telegramBot.send(
        chatId,
        `<b>🧪 Message de Test</b>\n\n` +
        `✅ Telegram fonctionne correctement !\n` +
        `📱 Canal : Telegram Bot API\n` +
        `💰 Coût : <b>GRATUIT</b>\n` +
        `🕐 Heure : ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Conakry' })}\n\n` +
        `<i>HealthFlow Guinée — Test de notification</i>`
      )
      break

    default:
      await telegramBot.send(
        chatId,
        `❓ Commande inconnue : <code>${cmd}</code>\n\nUtilisez /help pour voir les commandes disponibles.`
      )
  }
}

// GET endpoint to set up webhook and view registry
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

  // Get bot info + registry stats
  const botInfo = await telegramBot.getBotInfo()
  const stats = telegramRegistry.getStats()

  return NextResponse.json({
    configured: true,
    bot: botInfo.ok ? `@${botInfo.username}` : 'unknown',
    webhook: webhookInfo,
    registry: stats,
    chatIdHint: 'Send /chatid to the bot to get your chat ID',
    patientRegistration: 'Send phone number (+224XXXXXXXX) to link patient record',
  })
}
