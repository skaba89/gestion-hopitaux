/**
 * HealthFlow Guinea - Mobile Money Service Layer (Production-Ready)
 * Supports: Orange Money API, MTN MoMo API
 * Modes: Sandbox (demo) + Production (real API calls)
 *
 * Orange Money API: https://developer.orange.com/apis/ome-wallet/guinee
 * MTN MoMo API: https://momodeveloper.mtn.com/
 */

import { createHmac, randomBytes } from 'crypto'
import { db } from '@/lib/db'
import { addSimpleAuditEntry } from '@/lib/audit-logger'

/* ─────────── Types ─────────── */

export type MobileMoneyProvider = 'Orange Money' | 'MTN MoMo'
export type TransactionStatus = 'En attente' | 'En cours' | 'Réussi' | 'Échoué' | 'Remboursé' | 'Expiré'

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

export interface MobileMoneyConfig {
  orange: {
    clientId: string
    clientSecret: string
    merchantCode: string
    apiUrl: string
    pin: string
  }
  mtn: {
    subscriptionKey: string
    apiKey: string
    userId: string
    apiUrl: string
    callbackHost: string
  }
}

/* ─────────── Phone Number Validation ─────────── */

export function detectProvider(phone: string): MobileMoneyProvider | null {
  const cleaned = phone.replace(/\s/g, '')
  if (cleaned.startsWith('+2246') || cleaned.startsWith('2246') || cleaned.startsWith('6')) return 'Orange Money'
  if (cleaned.startsWith('+2245') || cleaned.startsWith('2245') || cleaned.startsWith('5')) return 'MTN MoMo'
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
  const seq = randomBytes(2).toString('hex').toUpperCase().slice(0, 3)
  return `${prefix}-${date}-${seq}`
}

export function generateTransactionId(): string {
  return `MM-${Date.now()}-${randomBytes(2).toString('hex').toUpperCase()}`
}

/* ─────────── Orange Money API — Real Implementation ─────────── */
// https://developer.orange.com/apis/ome-wallet/guinee

class OrangeMoneyAPI {
  private clientId: string
  private clientSecret: string
  private merchantCode: string
  private apiUrl: string
  private pin: string
  private accessToken: string | null = null
  private tokenExpiresAt: number = 0
  private isSandbox: boolean

  constructor() {
    this.clientId = process.env.ORANGE_MONEY_CLIENT_ID || ''
    this.clientSecret = process.env.ORANGE_MONEY_CLIENT_SECRET || ''
    this.merchantCode = process.env.ORANGE_MONEY_MERCHANT_CODE || ''
    this.apiUrl = process.env.ORANGE_MONEY_API_URL || 'https://api.orange.com/omewallet/gn/v1'
    this.pin = process.env.ORANGE_MONEY_PIN || ''
    this.isSandbox = !this.clientId || !this.clientSecret
  }

  /**
   * Get OAuth2 access token from Orange API
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken
    }

    if (this.isSandbox) {
      return 'sandbox-token'
    }

    try {
      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')
      const response = await fetch('https://api.orange.com/oauth/v3/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: new URLSearchParams({ grant_type: 'client_credentials' }),
      })

      if (!response.ok) {
        throw new Error(`Orange OAuth failed: ${response.status}`)
      }

      const data = await response.json()
      this.accessToken = data.access_token
      this.tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000 // 60s buffer

      return this.accessToken!
    } catch (error) {
      console.error('[Orange Money] Token acquisition failed:', (error as Error).message)
      throw error
    }
  }

  /**
   * Initiate a payment (Cash-in / Pay Invoice)
   * Orange Money Guinea: Merchant-initiated payment with USSD push
   */
  async initiatePayment(params: PaymentRequest): Promise<PaymentResponse> {
    const reference = generateReference('Orange Money')
    const txnId = generateTransactionId()

    // Sandbox mode
    if (this.isSandbox) {
      console.log(`[Orange Money SANDBOX] Payment initiated: ${params.amount} GNF to ${params.phoneNumber.slice(-4).padStart(params.phoneNumber.length, '*')}`)
      const success = Math.random() > 0.1
      return {
        success,
        transactionId: txnId,
        reference,
        provider: 'Orange Money',
        status: success ? 'En cours' : 'Échoué',
        paymentLink: success ? `https://pay.orange.gf/${reference}` : null,
        message: success
          ? 'Paiement Orange Money initié (SANDBOX). Le client recevra une notification USSD.'
          : 'Échec de l\'initiation du paiement (SANDBOX).',
      }
    }

    // Production: Real Orange Money API call
    try {
      const token = await this.getAccessToken()
      const amount = Math.round(params.amount) // Orange Money requires integer GNF amounts

      const response = await fetch(`${this.apiUrl}/merchant/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          customer: {
            phoneNumber: params.phoneNumber.replace('+224', '224'),
          },
          transaction: {
            amount,
            currency: params.currency,
            description: params.reason,
            reference,
            merchantTransactionId: txnId,
          },
          merchant: {
            code: this.merchantCode,
            name: 'HealthFlow Guinea',
          },
          pin: this.pin,
          notificationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/mobile-money/callback`,
        }),
      })

      const data = await response.json()

      if (response.ok && data.status !== 'FAILED') {
        // Persist transaction to database
        await this.recordTransaction(txnId, reference, params, data)

        return {
          success: true,
          transactionId: txnId,
          reference,
          provider: 'Orange Money',
          status: 'En cours',
          paymentLink: data.paymentUrl || null,
          message: 'Paiement Orange Money initié. Le client recevra une notification USSD.',
        }
      }

      return {
        success: false,
        transactionId: txnId,
        reference,
        provider: 'Orange Money',
        status: 'Échoué',
        paymentLink: null,
        message: data.message || data.error_description || 'Échec du paiement Orange Money.',
      }
    } catch (error) {
      console.error('[Orange Money] Payment initiation failed:', (error as Error).message)
      return {
        success: false,
        transactionId: txnId,
        reference,
        provider: 'Orange Money',
        status: 'Échoué',
        paymentLink: null,
        message: `Erreur Orange Money: ${(error as Error).message}`,
      }
    }
  }

  /**
   * Check transaction status
   */
  async checkTransactionStatus(transactionId: string): Promise<TransactionStatusResponse> {
    if (this.isSandbox) {
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
        providerTransactionId: `OM-TXN-${randomBytes(3).toString('hex').toUpperCase()}`,
        completedAt: status === 'Réussi' ? new Date().toISOString() : null,
        message: status === 'Réussi' ? 'Transaction complétée avec succès' : `Statut: ${status}`,
      }
    }

    try {
      const token = await this.getAccessToken()
      const response = await fetch(`${this.apiUrl}/merchant/payments/${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      })

      const data = await response.json()
      const status = this.mapOrangeStatus(data.status)

      // Update database
      if (status === 'Réussi' || status === 'Échoué') {
        await this.updateTransactionStatus(transactionId, status, data.transactionId)
      }

      return {
        transactionId,
        reference: data.reference || '',
        status,
        providerTransactionId: data.transactionId || null,
        completedAt: status === 'Réussi' ? new Date().toISOString() : null,
        message: this.getStatusMessage(status),
      }
    } catch (error) {
      console.error('[Orange Money] Status check failed:', (error as Error).message)
      return {
        transactionId,
        reference: '',
        status: 'En attente',
        providerTransactionId: null,
        completedAt: null,
        message: `Impossible de vérifier le statut: ${(error as Error).message}`,
      }
    }
  }

  /**
   * Generate a payment link (for patient self-service)
   */
  async generatePaymentLink(params: PaymentRequest): Promise<{ link: string; expiresAt: string }> {
    const reference = generateReference('Orange Money')

    if (this.isSandbox) {
      return {
        link: `https://pay.orange.gf/${reference}?amount=${params.amount}&currency=${params.currency}`,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      }
    }

    try {
      const token = await this.getAccessToken()
      const response = await fetch(`${this.apiUrl}/merchant/payment-links`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(params.amount),
          currency: params.currency,
          description: params.reason,
          reference,
          merchantCode: this.merchantCode,
          validityDuration: 30, // minutes
          notificationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/mobile-money/callback`,
        }),
      })

      const data = await response.json()
      return {
        link: data.paymentLink || data.url,
        expiresAt: data.expiresAt || new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      }
    } catch (error) {
      console.error('[Orange Money] Payment link generation failed:', (error as Error).message)
      throw error
    }
  }

  /**
   * Verify webhook signature using HMAC-SHA256
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (this.isSandbox) return true

    try {
      const expected = createHmac('sha256', this.clientSecret)
        .update(payload)
        .digest('hex')
      return signature === expected
    } catch {
      return false
    }
  }

  // Helper: Map Orange Money status to our status
  private mapOrangeStatus(status: string): TransactionStatus {
    const map: Record<string, TransactionStatus> = {
      'PENDING': 'En attente',
      'PROCESSING': 'En cours',
      'COMPLETED': 'Réussi',
      'SUCCESS': 'Réussi',
      'FAILED': 'Échoué',
      'CANCELLED': 'Échoué',
      'EXPIRED': 'Expiré',
      'REFUNDED': 'Remboursé',
    }
    return map[status] || 'En attente'
  }

  private getStatusMessage(status: TransactionStatus): string {
    const messages: Record<TransactionStatus, string> = {
      'En attente': 'Transaction en attente de confirmation',
      'En cours': 'Transaction en cours de traitement',
      'Réussi': 'Transaction complétée avec succès',
      'Échoué': 'Transaction échouée',
      'Remboursé': 'Transaction remboursée',
      'Expiré': 'Transaction expirée',
    }
    return messages[status]
  }

  // Persist transaction to database
  private async recordTransaction(txnId: string, reference: string, params: PaymentRequest, apiData: any) {
    try {
      await db.payment.create({
        data: {
          paymentNumber: `PAY-${Date.now()}-${randomBytes(2).toString('hex').toUpperCase()}`,
          invoiceId: params.invoiceId || `UNLINKED-${Date.now()}`,
          establishmentId: process.env.DEFAULT_ESTABLISHMENT_ID || 'default',
          amount: params.amount,
          currency: params.currency,
          paymentMethod: 'MOBILE_MONEY',
          status: 'PENDING',
          referenceNumber: reference,
          mobileMoneyTransactionId: apiData.transactionId || apiData.id || txnId,
          patientId: params.patientId,
        },
      })
    } catch (error) {
      console.warn('[Orange Money] Failed to record transaction:', (error as Error).message)
    }
  }

  // Update transaction status in database
  private async updateTransactionStatus(txnId: string, status: TransactionStatus, providerTxnId?: string) {
    try {
      const payment = await db.payment.findFirst({
        where: { mobileMoneyTransactionId: txnId },
      })
      if (payment) {
        await db.payment.update({
          where: { id: payment.id },
          data: {
            status: status === 'Réussi' ? 'COMPLETED' : status === 'Échoué' ? 'FAILED' : 'PENDING',
            processedAt: status === 'Réussi' ? new Date() : undefined,
          },
        })
      }
    } catch (error) {
      console.warn('[Orange Money] Failed to update transaction:', (error as Error).message)
    }
  }
}

/* ─────────── MTN MoMo API — Real Implementation ─────────── */
// https://momodeveloper.mtn.com/

class MTNMomoAPI {
  private subscriptionKey: string
  private apiKey: string
  private userId: string
  private apiUrl: string
  private callbackHost: string
  private accessToken: string | null = null
  private tokenExpiresAt: number = 0
  private isSandbox: boolean

  constructor() {
    this.subscriptionKey = process.env.MTN_MOMO_SUBSCRIPTION_KEY || ''
    this.apiKey = process.env.MTN_MOMO_API_KEY || ''
    this.userId = process.env.MTN_MOMO_USER_ID || ''
    this.apiUrl = process.env.MTN_MOMO_API_URL || 'https://sandbox.momodeveloper.mtn.com'
    this.callbackHost = process.env.MTN_MOMO_CALLBACK_HOST || 'localhost:3000'
    this.isSandbox = !this.subscriptionKey || !this.apiKey
  }

  /**
   * Get MTN MoMo OAuth2 access token
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken
    }

    if (this.isSandbox) {
      return 'sandbox-token'
    }

    try {
      const auth = Buffer.from(`${this.userId}:${this.apiKey}`).toString('base64')
      const response = await fetch(`${this.apiUrl}/collection/token/`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Ocp-Apim-Subscription-Key': this.subscriptionKey,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`MTN MoMo OAuth failed: ${response.status}`)
      }

      const data = await response.json()
      this.accessToken = data.access_token
      this.tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000

      return this.accessToken!
    } catch (error) {
      console.error('[MTN MoMo] Token acquisition failed:', (error as Error).message)
      throw error
    }
  }

  /**
   * Request to pay (MTN MoMo Collection API)
   * The customer receives a USSD prompt to confirm payment
   */
  async initiatePayment(params: PaymentRequest): Promise<PaymentResponse> {
    const reference = generateReference('MTN MoMo')
    const txnId = generateTransactionId()

    // Sandbox mode
    if (this.isSandbox) {
      console.log(`[MTN MoMo SANDBOX] Payment initiated: ${params.amount} GNF to ${params.phoneNumber.slice(-4).padStart(params.phoneNumber.length, '*')}`)
      const success = Math.random() > 0.12
      return {
        success,
        transactionId: txnId,
        reference,
        provider: 'MTN MoMo',
        status: success ? 'En cours' : 'Échoué',
        paymentLink: success ? `https://pay.mtn.gf/${reference}` : null,
        message: success
          ? 'Paiement MTN MoMo initié (SANDBOX). Le client recevra une notification USSD.'
          : 'Échec de l\'initiation du paiement (SANDBOX).',
      }
    }

    // Production: Real MTN MoMo API call
    try {
      const token = await this.getAccessToken()
      const amount = Math.round(params.amount)

      const response = await fetch(`${this.apiUrl}/collection/v1_0/requesttopay`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Reference-Id': txnId,
          'X-Target-Environment': process.env.MTN_MOMO_ENVIRONMENT || 'sandbox',
          'Ocp-Apim-Subscription-Key': this.subscriptionKey,
          'Content-Type': 'application/json',
          'X-Callback-Url': `https://${this.callbackHost}/api/payments/mobile-money/callback`,
        },
        body: JSON.stringify({
          amount: String(amount),
          currency: params.currency === 'GNF' ? 'GNF' : params.currency,
          externalId: reference,
          payer: {
            partyIdType: 'MSISDN',
            partyId: params.phoneNumber.replace('+', ''),
          },
          payerMessage: params.reason,
          payeeNote: `HealthFlow - ${params.patientName}`,
        }),
      })

      // MTN MoMo returns 202 Accepted for successful requests
      if (response.status === 202) {
        await this.recordTransaction(txnId, reference, params)

        return {
          success: true,
          transactionId: txnId,
          reference,
          provider: 'MTN MoMo',
          status: 'En cours',
          paymentLink: null,
          message: 'Paiement MTN MoMo initié. Le client recevra une notification USSD pour confirmer.',
        }
      }

      const data = await response.json()
      return {
        success: false,
        transactionId: txnId,
        reference,
        provider: 'MTN MoMo',
        status: 'Échoué',
        paymentLink: null,
        message: data.message || data.info?.[0]?.description || 'Échec du paiement MTN MoMo.',
      }
    } catch (error) {
      console.error('[MTN MoMo] Payment initiation failed:', (error as Error).message)
      return {
        success: false,
        transactionId: txnId,
        reference,
        provider: 'MTN MoMo',
        status: 'Échoué',
        paymentLink: null,
        message: `Erreur MTN MoMo: ${(error as Error).message}`,
      }
    }
  }

  /**
   * Check transaction status (MTN MoMo Collection API)
   */
  async checkTransactionStatus(transactionId: string): Promise<TransactionStatusResponse> {
    if (this.isSandbox) {
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
        providerTransactionId: `MTN-TXN-${randomBytes(3).toString('hex').toUpperCase()}`,
        completedAt: status === 'Réussi' ? new Date().toISOString() : null,
        message: status === 'Réussi' ? 'Transaction MoMo complétée' : `Statut: ${status}`,
      }
    }

    try {
      const token = await this.getAccessToken()
      const response = await fetch(`${this.apiUrl}/collection/v1_0/requesttopay/${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Target-Environment': process.env.MTN_MOMO_ENVIRONMENT || 'sandbox',
          'Ocp-Apim-Subscription-Key': this.subscriptionKey,
        },
      })

      const data = await response.json()
      const status = this.mapMTNStatus(data.status)

      if (status === 'Réussi' || status === 'Échoué') {
        await this.updateTransactionStatus(transactionId, status, data.financialTransactionId)
      }

      return {
        transactionId,
        reference: data.externalId || '',
        status,
        providerTransactionId: data.financialTransactionId || null,
        completedAt: status === 'Réussi' ? new Date().toISOString() : null,
        message: this.getStatusMessage(status),
      }
    } catch (error) {
      console.error('[MTN MoMo] Status check failed:', (error as Error).message)
      return {
        transactionId,
        reference: '',
        status: 'En attente',
        providerTransactionId: null,
        completedAt: null,
        message: `Impossible de vérifier le statut: ${(error as Error).message}`,
      }
    }
  }

  /**
   * Get account balance
   */
  async getAccountBalance(): Promise<{ available: number; currency: string }> {
    if (this.isSandbox) {
      return { available: 5000000, currency: 'GNF' }
    }

    try {
      const token = await this.getAccessToken()
      const response = await fetch(`${this.apiUrl}/collection/v1_0/account/balance`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Target-Environment': process.env.MTN_MOMO_ENVIRONMENT || 'sandbox',
          'Ocp-Apim-Subscription-Key': this.subscriptionKey,
        },
      })

      const data = await response.json()
      return {
        available: parseFloat(data.availableBalance),
        currency: data.currency,
      }
    } catch (error) {
      console.error('[MTN MoMo] Balance check failed:', (error as Error).message)
      return { available: 0, currency: 'GNF' }
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (this.isSandbox) return true

    try {
      const expected = createHmac('sha256', this.apiKey)
        .update(payload)
        .digest('hex')
      return signature === expected
    } catch {
      return false
    }
  }

  // Helper: Map MTN MoMo status to our status
  private mapMTNStatus(status: string): TransactionStatus {
    const map: Record<string, TransactionStatus> = {
      'PENDING': 'En attente',
      'PROCESSING': 'En cours',
      'SUCCESSFUL': 'Réussi',
      'FAILED': 'Échoué',
      'CANCELLED': 'Échoué',
      'TIMEOUT': 'Expiré',
      'REVERSED': 'Remboursé',
    }
    return map[status] || 'En attente'
  }

  private getStatusMessage(status: TransactionStatus): string {
    const messages: Record<TransactionStatus, string> = {
      'En attente': 'Transaction en attente de confirmation client',
      'En cours': 'Transaction en cours de traitement',
      'Réussi': 'Transaction MoMo complétée avec succès',
      'Échoué': 'Transaction MoMo échouée',
      'Remboursé': 'Transaction remboursée',
      'Expiré': 'Transaction expirée (délai dépassé)',
    }
    return messages[status]
  }

  // Persist transaction to database
  private async recordTransaction(txnId: string, reference: string, params: PaymentRequest) {
    try {
      await db.payment.create({
        data: {
          paymentNumber: `PAY-${Date.now()}-${randomBytes(2).toString('hex').toUpperCase()}`,
          invoiceId: params.invoiceId || `UNLINKED-${Date.now()}`,
          establishmentId: process.env.DEFAULT_ESTABLISHMENT_ID || 'default',
          amount: params.amount,
          currency: params.currency,
          paymentMethod: 'MOBILE_MONEY',
          status: 'PENDING',
          referenceNumber: reference,
          mobileMoneyTransactionId: txnId,
          patientId: params.patientId,
        },
      })
    } catch (error) {
      console.warn('[MTN MoMo] Failed to record transaction:', (error as Error).message)
    }
  }

  // Update transaction status in database
  private async updateTransactionStatus(txnId: string, status: TransactionStatus, providerTxnId?: string) {
    try {
      const payment = await db.payment.findFirst({
        where: { mobileMoneyTransactionId: txnId },
      })
      if (payment) {
        await db.payment.update({
          where: { id: payment.id },
          data: {
            status: status === 'Réussi' ? 'COMPLETED' : status === 'Échoué' ? 'FAILED' : 'PENDING',
            processedAt: status === 'Réussi' ? new Date() : undefined,
          },
        })
      }
    } catch (error) {
      console.warn('[MTN MoMo] Failed to update transaction:', (error as Error).message)
    }
  }

  /**
   * Generate a payment link (for patient self-service)
   */
  async generatePaymentLink(params: PaymentRequest): Promise<{ link: string; expiresAt: string }> {
    const reference = generateReference('MTN MoMo')

    if (this.isSandbox) {
      return {
        link: `https://pay.mtn.gf/${reference}?amount=${params.amount}&currency=${params.currency}`,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      }
    }

    try {
      const token = await this.getAccessToken()
      const response = await fetch(`${this.apiUrl}/collection/v1_0/payment-links`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Target-Environment': process.env.MTN_MOMO_ENVIRONMENT || 'sandbox',
          'Ocp-Apim-Subscription-Key': this.subscriptionKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: String(Math.round(params.amount)),
          currency: params.currency,
          externalId: reference,
          payer: {
            partyIdType: 'MSISDN',
            partyId: params.phoneNumber.replace('+', ''),
          },
          payerMessage: params.reason,
          payeeNote: `HealthFlow - ${params.patientName}`,
          validityDuration: 30,
        }),
      })

      const data = await response.json()
      return {
        link: data.paymentLink || data.url,
        expiresAt: data.expiresAt || new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      }
    } catch (error) {
      console.error('[MTN MoMo] Payment link generation failed:', (error as Error).message)
      throw error
    }
  }
}

/* ─────────── Unified Mobile Money Service ─────────── */

class MobileMoneyService {
  private orange = new OrangeMoneyAPI()
  private mtn = new MTNMomoAPI()

  async initiatePayment(params: PaymentRequest): Promise<PaymentResponse> {
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
    const result = await api.initiatePayment({ ...params, provider })

    // Audit log
    addSimpleAuditEntry({
      action: result.success ? 'PAYMENT_INITIATED' : 'PAYMENT_FAILED',
      module: 'payments',
      entity: 'Payment',
      description: `Mobile Money ${provider}: ${params.amount} GNF → ${params.phoneNumber.slice(-4).padStart(params.phoneNumber.length, '*')}`,
      severity: result.success ? 'INFO' : 'WARNING',
    })

    return result
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
