import { NextResponse } from 'next/server'
import {
  INTEGRATION_STATUSES,
  demoSNISReports,
  demoMTracAlerts,
  demoSANTEPCards,
  demoNationalRegistry,
  demoSyncOperations,
  generateDHIS2Report,
  toDHIS2Period,
  DHIS2_DATA_ELEMENTS,
  type DHIS2DataValueSet,
} from '@/lib/national-integrations'

export async function GET() {
  return NextResponse.json({
    integrations: INTEGRATION_STATUSES,
    snisReports: demoSNISReports,
    mtracAlerts: demoMTracAlerts,
    santeCards: demoSANTEPCards,
    nationalRegistry: demoNationalRegistry,
    syncOperations: demoSyncOperations,
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'generate-dhis2-report': {
        const report = generateDHIS2Report(
          body.period || toDHIS2Period(new Date(), 'monthly'),
          body.orgUnit || 'OU-Conakry',
          body.data || {}
        )
        return NextResponse.json({ success: true, report })
      }
      case 'sync': {
        const integration = INTEGRATION_STATUSES.find((i) => i.id === body.integrationId)
        if (!integration) {
          return NextResponse.json({ error: 'Integration not found' }, { status: 404 })
        }
        return NextResponse.json({
          success: true,
          message: `Synchronisation lancée pour ${integration.name}`,
          nextSync: new Date(Date.now() + 300000).toISOString(),
        })
      }
      case 'submit-snis': {
        return NextResponse.json({
          success: true,
          message: 'Rapport SNIS soumis avec succès',
          submittedAt: new Date().toISOString(),
        })
      }
      case 'update-santep': {
        return NextResponse.json({
          success: true,
          message: `Carte SANTEP ${body.cardNumber} mise à jour`,
          updatedAt: new Date().toISOString(),
        })
      }
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
