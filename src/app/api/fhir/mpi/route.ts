import { NextRequest, NextResponse } from 'next/server'
import { mpiService } from '@/lib/master-patient-index'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const action = url.searchParams.get('action') || 'records'

  switch (action) {
    case 'records': {
      const records = mpiService.getGoldenRecords()
      return NextResponse.json({ records, total: records.length })
    }
    case 'search': {
      const query = url.searchParams.get('q') || ''
      const results = mpiService.searchGoldenRecords(query)
      return NextResponse.json({ results, total: results.length })
    }
    case 'pending': {
      const pending = mpiService.getPendingReviews()
      return NextResponse.json({ pending, total: pending.length })
    }
    case 'metrics': {
      const metrics = mpiService.getMetrics()
      return NextResponse.json(metrics)
    }
    default:
      return NextResponse.json({ records: mpiService.getGoldenRecords() })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, goldenRecordId, patientId, reviewer } = body
    if (action === 'review') {
      const result = mpiService.reviewMatch(goldenRecordId, patientId, body.decision, reviewer)
      if (result) return NextResponse.json(result)
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
