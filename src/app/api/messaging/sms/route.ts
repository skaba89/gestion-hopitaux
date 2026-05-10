import { NextRequest, NextResponse } from 'next/server'
import { messagingService } from '@/lib/messaging'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, message, recipientName, recipients, templateId } = body

    // Bulk SMS
    if (recipients && Array.isArray(recipients)) {
      const results = await messagingService.sendBulkSMS({
        recipients: recipients.map((r: { phone: string; name?: string }) => ({ phone: r.phone, name: r.name })),
        message,
      })
      return NextResponse.json({
        success: true,
        results,
        total: results.length,
        sent: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
      })
    }

    // Single SMS
    if (!to || !message) {
      return NextResponse.json(
        { success: false, message: 'Champs requis: to, message' },
        { status: 400 }
      )
    }

    const result = await messagingService.sendSMS({
      to,
      message,
      recipientName,
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Erreur serveur', error: String(error) },
      { status: 500 }
    )
  }
}
