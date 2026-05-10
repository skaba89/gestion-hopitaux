/**
 * Mobile Money Service Layer — HealthFlow Africa
 * Supports Orange Money and MTN MoMo for Guinea
 * Demo/Sandbox mode: simulates API calls with realistic delays
 */

import type { MobileMoneyProvider, TransactionStatus } from '@/lib/data-store'

/* ─────────── Types ─────────── */

export interface PaymentRequest {
  phoneNumber: string
  amount: number
  currency: 'GNF' | 'USD'
  reason: string
  invoiceId: string | null
  patientName: string
  patientId: string
  provider?: MobileMoneyProvider
}

export interface PaymentResponse {
  success: boolean
  transactionId: string
  reference: string
  provider: MobileMoneyProvider
  status: TransactionStatus
  paymentLink: string | null
  message: string
}

export interface TransactionStatusResponse {
  transactionId: string
  reference: string
  status: TransactionStatus
  providerTransactionId: string | null
  completedAt: string | null
  message: string
}

/* ─────────── Phone Number Validation ─────────── */

export function detectProvider(phone: string): MobileMoneyProvider | null {
  const cleaned = phone.replace(/\s/g, '')
  // Orange Guinea: +224 6XX
  if (cleaned.startsWith('+2246') || cleaned.startsWith('2246')) return 'Orange Money'
  // MTN Guinea: +224 5XX  
  if (cleaned.startsWith('+2245') || cleaned.startsWith('2245')) return 'MTN MoMo'
  return null
}

export function isValidGuineaPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s/g, '')
  return /^(\+224|224)[56]\d{7}$/.test(cleaned)
}

export function formatPhoneGuinea(phone: string): string {
  const cleaned = phone.replace(/\s/g, '').replace(/^\+224/, '224').replace(/^224/, '')
  if (cleaned.length !== 9) return phone
  return `+224 ${cleaned.slice(0, 1)}${cleaned.slice(1, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7, 9)}`
}

/* ─────────── Reference Generation ─────────── */

export function generateReference(provider: MobileMoneyProvider): string {
  const prefix = provider === 'Orange Money' ? 'OM' : 'MTN'
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')
  return `${prefix}-${date}-${seq}`
}

export function generateTransactionId(): string {
  return `MM-${Date.now()}-${String(Math.floor(Math.random() * 99)).padStart(2, '0')}`
}

/* ─────────── Orange Money API (Demo) ─────────── */

class OrangeMoneyAPI {
  private sandbox = true

  async initiatePayment(params: PaymentRequest): Promise<PaymentResponse> {
    // Simulate API call
    await this.delay(1500 + Math.random() * 1000)

    const reference = generateReference('Orange Money')
    const txnId = generateTransactionId()
    
    // 90% success rate in sandbox
    const success = Math.random() > 0.1

    return {
      success,
      transactionId: txnId,
      reference,
      provider: 'Orange Money',
      status: success ? 'En cours' : 'Échoué',
      paymentLink: success ? `https://pay.orange.gf/${reference}` : null,
      message: success 
        ? 'Paiement Orange Money initié. Le client recevra une notification USSD.'
        : 'Échec de l\'initiation du paiement. Veuillez réessayer.',
    }
  }

  async checkTransactionStatus(transactionId: string): Promise<TransactionStatusResponse> {
    await this.delay(500 + Math.random() * 500)

    // In sandbox, randomly progress the status
    const rand = Math.random()
    let status: TransactionStatus
    if (rand < 0.5) status = 'Réussi'
    else if (rand < 0.7) status = 'En cours'
    else if (rand < 0.85) status = 'En attente'
    else status = 'Échoué'

    return {
      transactionId,
      reference: `OM-${Date.now()}`,
      status,
      providerTransactionId: `OM-TXN-${Math.floor(Math.random() * 99999)}`,
      completedAt: status === 'Réussi' ? new Date().toISOString() : null,
      message: status === 'Réussi' ? 'Transaction complétée avec succès' : `Statut: ${status}`,
    }
  }

  async generatePaymentLink(params: PaymentRequest): Promise<{ link: string; expiresAt: string }> {
    await this.delay(800)
    const reference = generateReference('Orange Money')
    return {
      link: `https://pay.orange.gf/${reference}?amount=${params.amount}&currency=${params.currency}`,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    // In sandbox, always return true
    return this.sandbox || signature === 'valid_signature'
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

/* ─────────── MTN MoMo API (Demo) ─────────── */

class MTNMomoAPI {
  private sandbox = true

  async initiatePayment(params: PaymentRequest): Promise<PaymentResponse> {
    await this.delay(1200 + Math.random() * 800)

    const reference = generateReference('MTN MoMo')
    const txnId = generateTransactionId()

    // 88% success rate
    const success = Math.random() > 0.12

    return {
      success,
      transactionId: txnId,
      reference,
      provider: 'MTN MoMo',
      status: success ? 'En cours' : 'Échoué',
      paymentLink: success ? `https://pay.mtn.gf/${reference}` : null,
      message: success
        ? 'Paiement MTN MoMo initié. Le client recevra une notification USSD.'
        : 'Échec de l\'initiation du paiement. Veuillez réessayer.',
    }
  }

  async checkTransactionStatus(transactionId: string): Promise<TransactionStatusResponse> {
    await this.delay(400 + Math.random() * 400)

    const rand = Math.random()
    let status: TransactionStatus
    if (rand < 0.55) status = 'Réussi'
    else if (rand < 0.7) status = 'En cours'
    else if (rand < 0.85) status = 'En attente'
    else status = 'Échoué'

    return {
      transactionId,
      reference: `MTN-${Date.now()}`,
      status,
      providerTransactionId: `MTN-TXN-${Math.floor(Math.random() * 99999)}`,
      completedAt: status === 'Réussi' ? new Date().toISOString() : null,
      message: status === 'Réussi' ? 'Transaction MoMo complétée' : `Statut: ${status}`,
    }
  }

  async generatePaymentLink(params: PaymentRequest): Promise<{ link: string; expiresAt: string }> {
    await this.delay(600)
    const reference = generateReference('MTN MoMo')
    return {
      link: `https://pay.mtn.gf/${reference}?amount=${params.amount}&currency=${params.currency}`,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    return this.sandbox || signature === 'valid_signature'
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

/* ─────────── Unified Mobile Money Service ─────────── */

class MobileMoneyService {
  private orange = new OrangeMoneyAPI()
  private mtn = new MTNMomoAPI()

  async initiatePayment(params: PaymentRequest): Promise<PaymentResponse> {
    // Auto-detect provider from phone number if not specified
    const provider = params.provider || detectProvider(params.phoneNumber)
    if (!provider) {
      return {
        success: false,
        transactionId: '',
        reference: '',
        provider: 'Orange Money',
        status: 'Échoué',
        paymentLink: null,
        message: 'Impossible de détecter le fournisseur. Numéro Orange (6XX) ou MTN (5XX) requis.',
      }
    }

    // Validate phone
    if (!isValidGuineaPhone(params.phoneNumber)) {
      return {
        success: false,
        transactionId: '',
        reference: '',
        provider,
        status: 'Échoué',
        paymentLink: null,
        message: 'Numéro de téléphone invalide. Format attendu: +224 XXX XX XX XX',
      }
    }

    const api = provider === 'Orange Money' ? this.orange : this.mtn
    return api.initiatePayment({ ...params, provider })
  }

  async checkTransactionStatus(transactionId: string, provider: MobileMoneyProvider): Promise<TransactionStatusResponse> {
    const api = provider === 'Orange Money' ? this.orange : this.mtn
    return api.checkTransactionStatus(transactionId)
  }

  async generatePaymentLink(params: PaymentRequest): Promise<{ link: string; expiresAt: string }> {
    const provider = params.provider || detectProvider(params.phoneNumber) || 'Orange Money'
    const api = provider === 'Orange Money' ? this.orange : this.mtn
    return api.generatePaymentLink({ ...params, provider })
  }

  verifyCallback(provider: MobileMoneyProvider, payload: string, signature: string): boolean {
    const api = provider === 'Orange Money' ? this.orange : this.mtn
    return api.verifyWebhookSignature(payload, signature)
  }
}

export const mobileMoneyService = new MobileMoneyService()
export { OrangeMoneyAPI, MTNMomoAPI }
