import { NextRequest, NextResponse } from 'next/server'
import { mobileMoneyService } from '@/lib/mobile-money'
import { db } from '@/lib/db'
import { addSimpleAuditEntry } from '@/lib/audit-logger'

/**
 * POST /api/payments/mobile-money/callback
 * Webhook callback for Orange Money and MTN MoMo payment notifications
 *
 * Security: Verifies HMAC-SHA256 signature from provider
 * Idempotent: Safe to receive the same callback multiple times
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-signature') || request.headers.get('signature') || ''
    const provider = request.headers.get('x-provider') as 'Orange Money' | 'MTN MoMo' || 'Orange Money'

    // Verify webhook signature (prevents spoofing)
    const isValid = mobileMoneyService.verifyCallback(provider, body, signature)
    if (!isValid) {
      console.warn(`[Mobile Money Callback] Invalid signature from ${provider}`)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const data = JSON.parse(body)
    const {
      transactionId,
      reference,
      status,
      providerTransactionId,
      amount,
      currency,
    } = data

    console.log(`[Mobile Money Callback] ${provider}: ${transactionId} → ${status}`)

    // Map provider status to our internal status
    const statusMap: Record<string, string> = {
      'PENDING': 'PENDING',
      'PROCESSING': 'PENDING',
      'COMPLETED': 'COMPLETED',
      'SUCCESS': 'COMPLETED',
      'FAILED': 'FAILED',
      'CANCELLED': 'CANCELLED',
      'EXPIRED': 'CANCELLED',
      'REFUNDED': 'REFUNDED',
      'SUCCESSFUL': 'COMPLETED',
      'TIMEOUT': 'CANCELLED',
      'REVERSED': 'REFUNDED',
    }

    const internalStatus = statusMap[status] || 'PENDING'

    // Update payment in database
    try {
      // Find payment by referenceNumber or mobileMoneyTransactionId
      const payment = await db.payment.findFirst({
        where: {
          OR: [
            { referenceNumber: reference },
            { mobileMoneyTransactionId: transactionId },
          ],
        },
      })

      if (payment) {
        const updateData: Record<string, any> = {
          status: internalStatus,
          mobileMoneyTransactionId: providerTransactionId || payment.mobileMoneyTransactionId,
        }

        if (internalStatus === 'COMPLETED') {
          updateData.processedAt = new Date()
        }

        await db.payment.update({
          where: { id: payment.id },
          data: updateData,
        })

        // If payment completed, also update the linked invoice
        if (internalStatus === 'COMPLETED' && payment.invoiceId) {
          try {
            const invoice = await db.invoice.findUnique({
              where: { id: payment.invoiceId },
            })
            if (invoice) {
              // Calculate total paid
              const completedPayments = await db.payment.findMany({
                where: {
                  invoiceId: invoice.id,
                  status: 'COMPLETED',
                },
              })

              const paidAmount = completedPayments.reduce((sum, p) => sum + p.amount, 0)
              const newStatus = paidAmount >= invoice.totalAmount ? 'PAID' : 'PARTIALLY_PAID'

              await db.invoice.update({
                where: { id: invoice.id },
                data: {
                  status: newStatus,
                  issuedAt: invoice.issuedAt || new Date(),
                },
              })
            }
          } catch (invoiceError) {
            console.warn('[Mobile Money Callback] Failed to update invoice:', (invoiceError as Error).message)
          }
        }

        addSimpleAuditEntry({
          action: internalStatus === 'COMPLETED' ? 'PAYMENT_COMPLETED' : 'PAYMENT_STATUS_UPDATE',
          module: 'payments',
          entity: 'Payment',
          entityId: payment.id,
          description: `Mobile Money ${provider} callback: ${transactionId} → ${internalStatus}`,
          severity: internalStatus === 'COMPLETED' ? 'INFO' : 'WARNING',
        })
      } else {
        console.warn(`[Mobile Money Callback] Payment not found for transactionId: ${transactionId}`)
      }
    } catch (dbError) {
      console.error('[Mobile Money Callback] Database update failed:', (dbError as Error).message)
    }

    // Always return 200 to acknowledge receipt (provider will retry on error)
    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('[Mobile Money Callback] Error:', (error as Error).message)
    // Return 200 anyway to prevent retries for malformed payloads
    return NextResponse.json({ received: true, error: 'Processing error' })
  }
}
