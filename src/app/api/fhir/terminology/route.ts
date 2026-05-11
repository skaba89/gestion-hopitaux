import { NextRequest, NextResponse } from 'next/server'
import { terminologyService, CODE_SYSTEMS, GUINEA_VALUE_SETS } from '@/lib/terminology-service'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const action = url.searchParams.get('action') || 'systems'

  switch (action) {
    case 'systems':
      return NextResponse.json({ systems: CODE_SYSTEMS })
    case 'valuesets':
      return NextResponse.json({ valueSets: GUINEA_VALUE_SETS })
    case 'search': {
      const system = url.searchParams.get('system') || ''
      const query = url.searchParams.get('q') || ''
      const limit = parseInt(url.searchParams.get('limit') || '20')
      const results = terminologyService.search(system, query, limit)
      return NextResponse.json({ results, total: results.length })
    }
    case 'lookup': {
      const system = url.searchParams.get('system') || ''
      const code = url.searchParams.get('code') || ''
      const concept = terminologyService.lookup(system, code)
      if (concept) return NextResponse.json(concept)
      return NextResponse.json({ error: 'Code not found' }, { status: 404 })
    }
    case 'validate': {
      const system = url.searchParams.get('system') || ''
      const code = url.searchParams.get('code') || ''
      const result = terminologyService.validateCode(system, code)
      return NextResponse.json(result)
    }
    default:
      return NextResponse.json({ systems: CODE_SYSTEMS, valueSets: GUINEA_VALUE_SETS })
  }
}
