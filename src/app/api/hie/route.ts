import { NextResponse } from 'next/server'
import { hieService } from '@/lib/hie'

export async function GET() {
  const metrics = hieService.getHIEMetrics()
  const exchanges = hieService.getExchanges()
  const connections = hieService.getConnections()
  const referrals = hieService.getReferrals()
  const consents = hieService.getConsents()

  return NextResponse.json({
    metrics,
    exchanges,
    connections,
    referrals,
    consents,
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'send-exchange': {
        const { patientId, targetOrgId, resourceType, resourceId, consentId, metadata } = body
        const exchange = await hieService.sendExchange(patientId, targetOrgId, resourceType, resourceId, consentId, metadata)
        return NextResponse.json({ success: true, exchange })
      }
      case 'grant-consent': {
        const consent = hieService.grantConsent(body.consent)
        return NextResponse.json({ success: true, consent })
      }
      case 'revoke-consent': {
        const consent = hieService.revokeConsent(body.consentId)
        return NextResponse.json({ success: !!consent, consent })
      }
      case 'accept-referral': {
        const referral = hieService.acceptReferral(body.referralId, body.acceptingDoctor)
        return NextResponse.json({ success: !!referral, referral })
      }
      case 'ping-connection': {
        const result = await hieService.pingConnection(body.orgId)
        return NextResponse.json(result)
      }
      case 'search-patients': {
        const patients = hieService.searchPatientRegistry(body.query)
        return NextResponse.json({ patients })
      }
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
