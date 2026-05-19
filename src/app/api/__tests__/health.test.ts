import { GET } from '@/app/api/health/route'
import { db } from '@/lib/db'
import { NextRequest } from 'next/server'

// ============================================================================
// HealthFlow Guinea - Health Check API Route Tests
// Updated: Pass NextRequest with x-internal header for detailed response
// ============================================================================

describe('GET /api/health', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return healthy status when all services are up', async () => {
    ;(db.$queryRaw as jest.Mock).mockResolvedValue([{ '?column?': 1 }])

    const request = new NextRequest('http://localhost:3000/api/health')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.status).toBe('healthy')
    expect(data.checks.postgresql.status).toBe('healthy')
    expect(data.checks.redis.status).toBe('healthy')
  })

  it('should return 503 when PostgreSQL is unhealthy', async () => {
    ;(db.$queryRaw as jest.Mock).mockRejectedValue(new Error('Connection refused'))

    const request = new NextRequest('http://localhost:3000/api/health')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(503)
    expect(data.status).toBe('unhealthy')
    expect(data.checks.postgresql.status).toBe('unhealthy')
  })

  it('should include service metadata', async () => {
    ;(db.$queryRaw as jest.Mock).mockResolvedValue([{ '?column?': 1 }])

    const request = new NextRequest('http://localhost:3000/api/health')
    const response = await GET(request)
    const data = await response.json()

    expect(data.service).toBe('HealthFlow Guinea')
    expect(data.version).toBe('1.0.0')
    expect(data.timestamp).toBeDefined()
  })

  it('should include memory usage information with x-internal header', async () => {
    ;(db.$queryRaw as jest.Mock).mockResolvedValue([{ '?column?': 1 }])

    const request = new NextRequest('http://localhost:3000/api/health', {
      headers: { 'x-internal': 'true' },
    })
    const response = await GET(request)
    const data = await response.json()

    expect(data.memory).toBeDefined()
    expect(data.memory).toHaveProperty('used')
    expect(data.memory).toHaveProperty('total')
    expect(data.memory).toHaveProperty('rss')
  })

  it('should include uptime information with x-internal header', async () => {
    ;(db.$queryRaw as jest.Mock).mockResolvedValue([{ '?column?': 1 }])

    const request = new NextRequest('http://localhost:3000/api/health', {
      headers: { 'x-internal': 'true' },
    })
    const response = await GET(request)
    const data = await response.json()

    expect(data.uptime).toBeDefined()
    expect(data.uptime).toMatch(/\d+h \d+m \d+s/)
  })

  it('should include environment information with x-internal header', async () => {
    ;(db.$queryRaw as jest.Mock).mockResolvedValue([{ '?column?': 1 }])

    const request = new NextRequest('http://localhost:3000/api/health', {
      headers: { 'x-internal': 'true' },
    })
    const response = await GET(request)
    const data = await response.json()

    expect(data.environment).toBeDefined()
    expect(typeof data.environment).toBe('string')
  })
})
