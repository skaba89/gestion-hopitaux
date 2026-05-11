import { NextRequest, NextResponse } from 'next/server'
import { adtService } from '@/lib/adt-messages'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const type = url.searchParams.get('type') || undefined
  const status = url.searchParams.get('status') || undefined
  const facility = url.searchParams.get('facility') || undefined

  const messages = adtService.getMessages({ type: type as any, status: status as any, facility })
  const metrics = adtService.getMetrics()

  return NextResponse.json({ messages, metrics, total: messages.length })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const msg = adtService.createMessage(body)
    return NextResponse.json(msg, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
